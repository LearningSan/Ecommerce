import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CartItemEntity } from '../entities/cart-item.entity';
import { CartEntity } from '../entities/cart.entity';
import { CartItemRepository } from './cart-item.repository';

export interface CartOwner {
  userId: string | null;
  sessionId: string | null;
}

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    private readonly dataSource: DataSource,
    private readonly cartItemRepository: CartItemRepository,
  ) {}

  async findByOwner(owner: CartOwner): Promise<CartEntity | null> {
    if (owner.userId) {
      return this.cartRepository.findOne({
        where: { userId: owner.userId },
      });
    }

    if (owner.sessionId) {
      return this.cartRepository.findOne({
        where: { sessionId: owner.sessionId },
      });
    }

    return null;
  }

  async findOrCreate(
    manager: EntityManager,
    owner: CartOwner,
  ): Promise<CartEntity> {
    const repository = manager.getRepository(CartEntity);

    const where = owner.userId
      ? { userId: owner.userId }
      : { sessionId: owner.sessionId! };

    const existingCart = await repository.findOne({
      where,
      lock: { mode: 'pessimistic_write' },
    });

    if (existingCart) {
      return existingCart;
    }

    const cart = repository.create({
      userId: owner.userId,
      sessionId: owner.userId ? null : owner.sessionId,
    });

    return repository.save(cart);
  }

  async addItem(
    owner: CartOwner,
    variantId: string,
    quantity: number,
    maxQuantity: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const variant = await manager
        .createQueryBuilder()
        .select('pv.id', 'id')
        .from('product_variants', 'pv')
        .innerJoin('products', 'p', 'p.id = pv.product_id')
        .where('pv.id = :variantId', { variantId })
        .andWhere('pv.status = :variantStatus', {
          variantStatus: 'ACTIVE',
        })
        .andWhere('pv.deleted_at IS NULL')
        .andWhere('p.status = :productStatus', {
          productStatus: 'ACTIVE',
        })
        .andWhere('p.deleted_at IS NULL')
        .getRawOne<{ id: string }>();

      if (!variant) {
        return { notFound: true as const };
      }

      const cart = await this.findOrCreate(manager, owner);

      const item = await this.cartItemRepository.findByVariant(
        manager,
        cart.id,
        variantId,
      );

      const nextQuantity = (item?.quantity ?? 0) + quantity;

      if (nextQuantity > maxQuantity) {
        return {
          quantityExceeded: true as const,
          maxQuantity,
        };
      }

      if (item) {
        await this.cartItemRepository.updateQuantity(
          manager,
          item.id,
          nextQuantity,
        );
      } else {
        await this.cartItemRepository.create(
          manager,
          cart.id,
          variantId,
          quantity,
        );
      }

      return {
        cartId: cart.id,
        variantId,
        quantity: nextQuantity,
      };
    });
  }
  async mergeGuestCart(
    userId: string,
    sessionId: string,
    maxQuantity: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(CartEntity);
      const itemRepo = manager.getRepository(CartItemEntity);

      // Khóa giỏ khách để tránh hai request gộp cùng lúc.
      const guestCart = await cartRepo.findOne({
        where: { sessionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!guestCart) {
        return;
      }

      // Lấy hoặc tạo giỏ của tài khoản đăng nhập.
      const userCart = await this.findOrCreate(manager, {
        userId,
        sessionId: null,
      });

      const guestItems = await itemRepo.find({
        where: { cartId: guestCart.id },
        lock: { mode: 'pessimistic_write' },
      });

      for (const guestItem of guestItems) {
        const userItem = await this.cartItemRepository.findByVariant(
          manager,
          userCart.id,
          guestItem.variantId,
        );

        if (userItem) {
          // Cùng phân loại: cộng số lượng, không tạo dòng trùng.
          const nextQuantity = Math.min(
            userItem.quantity + guestItem.quantity,
            maxQuantity,
          );

          await this.cartItemRepository.updateQuantity(
            manager,
            userItem.id,
            nextQuantity,
          );
        } else {
          // Khác phân loại: chuyển thành dòng mới.
          await this.cartItemRepository.create(
            manager,
            userCart.id,
            guestItem.variantId,
            Math.min(guestItem.quantity, maxQuantity),
          );
        }
      }

      // Chỉ xóa giỏ khách sau khi đã gộp thành công.
      await itemRepo.delete({ cartId: guestCart.id });
      await cartRepo.delete({ id: guestCart.id });
    });
  }
}
