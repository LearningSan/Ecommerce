import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CartItemEntity } from '../entities/cart-item.entity';

export interface CartItemRow {
  id: string;
  cartId: string;
  variantId: string;
  productId: string | null;
  productName: string | null;
  productSlug: string | null;
  sku: string | null;
  imageUrl: string | null;
  unitPrice: string | number | null;
  quantity: number | string;
  availableQuantity: string | number | null;
  isAvailable: number | boolean;
}
export interface CartVariantAttributeRow {
  cartItemId: string;
  name: string;
  type: 'TEXT' | 'COLOR' | 'SELECT';
  value: string;
  colorHex: string | null;
}
@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
  ) {}

  async findByVariant(
    manager: EntityManager,
    cartId: string,
    variantId: string,
  ): Promise<CartItemEntity | null> {
    return manager.getRepository(CartItemEntity).findOne({
      where: { cartId, variantId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async create(
    manager: EntityManager,
    cartId: string,
    variantId: string,
    quantity: number,
  ): Promise<CartItemEntity> {
    const repository = manager.getRepository(CartItemEntity);

    const item = repository.create({
      cartId,
      variantId,
      quantity,
    });

    return repository.save(item);
  }

  async updateQuantity(
    manager: EntityManager,
    itemId: string,
    quantity: number,
  ): Promise<void> {
    await manager
      .getRepository(CartItemEntity)
      .update({ id: itemId }, { quantity });
  }

  async findByCartId(cartId: string): Promise<CartItemRow[]> {
    return this.cartItemRepository
      .createQueryBuilder('ci')
      .leftJoin('product_variants', 'pv', 'pv.id = ci.variant_id')
      .leftJoin('products', 'p', 'p.id = pv.product_id')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select('i.variant_id', 'variantId')
            .addSelect('SUM(i.available_quantity)', 'availableQuantity')
            .from('inventories', 'i')
            .groupBy('i.variant_id'),
        'inv',
        'inv.variantId = ci.variant_id',
      )
      .select([
        'ci.id AS id',
        'ci.cart_id AS cartId',
        'ci.variant_id AS variantId',
        'p.id AS productId',
        'p.name AS productName',
        'p.slug AS productSlug',
        'pv.sku AS sku',
        'pv.price AS unitPrice',
        'ci.quantity AS quantity',
        'inv.availableQuantity AS availableQuantity',
      ])
      .addSelect(
        `(
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
            AND pi.is_primary = 1
          ORDER BY pi.id ASC
          LIMIT 1
        )`,
        'imageUrl',
      )
      .addSelect(
        `CASE
          WHEN pv.id IS NOT NULL
            AND pv.status = 'ACTIVE'
            AND pv.deleted_at IS NULL
            AND p.status = 'ACTIVE'
            AND p.deleted_at IS NULL
            AND COALESCE(inv.availableQuantity, 0) >= ci.quantity
          THEN 1
          ELSE 0
        END`,
        'isAvailable',
      )
      .where('ci.cart_id = :cartId', { cartId })
      .orderBy('ci.created_at', 'DESC')
      .getRawMany<CartItemRow>();
  }
  async findVariantAttributesByCartId(
    cartId: string,
  ): Promise<CartVariantAttributeRow[]> {
    return this.cartItemRepository.manager
      .createQueryBuilder()
      .select('ci.id', 'cartItemId')
      .addSelect('a.name', 'name')
      .addSelect('a.type', 'type')
      .addSelect('av.value', 'value')
      .addSelect('av.color_hex', 'colorHex')
      .from('cart_items', 'ci')
      .innerJoin(
        'product_variant_attributes',
        'pva',
        'pva.variant_id = ci.variant_id',
      )
      .innerJoin('attribute_values', 'av', 'av.id = pva.attribute_value_id')
      .innerJoin('attributes', 'a', 'a.id = av.attribute_id')
      .where('ci.cart_id = :cartId', { cartId })
      .orderBy('ci.id', 'ASC')
      .addOrderBy('a.id', 'ASC')
      .getRawMany<CartVariantAttributeRow>();
  }
  async updateQuantityByCartId(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<boolean> {
    const result = await this.cartItemRepository.update(
      {
        id: itemId,
        cartId,
      },
      {
        quantity,
      },
    );

    return (result.affected ?? 0) > 0;
  }

  async removeByCartId(cartId: string, itemId: string): Promise<boolean> {
    const result = await this.cartItemRepository.delete({
      id: itemId,
      cartId,
    });

    return (result.affected ?? 0) > 0;
  }
}
