import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartRepository, CartOwner } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cart-item.repository';

@Injectable()
export class CartService {
  private readonly maxQuantity = 5;

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
  ) {}

  async addItem(owner: CartOwner, dto: AddCartItemDto) {
    if (!owner.userId && !owner.sessionId) {
      throw new BadRequestException('Không xác định được giỏ hàng.');
    }

    const result = await this.cartRepository.addItem(
      owner,
      dto.variantId,
      dto.quantity,
      this.maxQuantity,
    );

    if ('notFound' in result) {
      throw new NotFoundException(
        'Sản phẩm hoặc phân loại sản phẩm không còn khả dụng.',
      );
    }

    if ('quantityExceeded' in result) {
      throw new BadRequestException(
        `Mỗi phân loại chỉ được có tối đa ${result.maxQuantity} sản phẩm trong giỏ.`,
      );
    }

    return {
      message: 'Đã thêm sản phẩm vào giỏ hàng.',
      cartId: result.cartId,
      variantId: result.variantId,
      quantity: result.quantity,
    };
  }

  async getCart(owner: CartOwner) {
    if (!owner.userId && !owner.sessionId) {
      return this.emptyCart();
    }

    const cart = await this.cartRepository.findByOwner(owner);

    if (!cart) {
      return this.emptyCart();
    }

    const [rows, variantAttributes] = await Promise.all([
      this.cartItemRepository.findByCartId(cart.id),
      this.cartItemRepository.findVariantAttributesByCartId(cart.id),
    ]);

    const attributesByItemId = new Map<
      string,
      {
        name: string;
        type: 'TEXT' | 'COLOR' | 'SELECT';
        value: string;
        colorHex: string | null;
      }[]
    >();

    for (const attribute of variantAttributes) {
      const itemId = String(attribute.cartItemId);
      const attributes = attributesByItemId.get(itemId) ?? [];

      attributes.push({
        name: attribute.name,
        type: attribute.type,
        value: attribute.value,
        colorHex: attribute.colorHex,
      });

      attributesByItemId.set(itemId, attributes);
    }
    const items = rows.map((row) => {
      const unitPrice = Number(row.unitPrice ?? 0);
      const quantity = Number(row.quantity);

      return {
        id: String(row.id),
        cartId: String(row.cartId),
        variantId: String(row.variantId),
        productId: row.productId === null ? '' : String(row.productId),
        productName: row.productName ?? 'Sản phẩm không còn tồn tại',
        productSlug: row.productSlug ?? '',
        sku: row.sku ?? '',
        imageUrl: row.imageUrl,
        variant: attributesByItemId.get(String(row.id)) ?? [],
        unitPrice,
        quantity,
        subtotal: unitPrice * quantity,
        isAvailable: Boolean(Number(row.isAvailable)),
        availableQuantity:
          row.availableQuantity === null ? null : Number(row.availableQuantity),
      };
    });

    return {
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      totalAmount: items.reduce((total, item) => total + item.subtotal, 0),
    };
  }

  private emptyCart() {
    return {
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
    };
  }
  async mergeGuestCart(
    userId: string,
    sessionId: string | null,
  ): Promise<void> {
    if (!userId || !sessionId) {
      return;
    }

    await this.cartRepository.mergeGuestCart(
      userId,
      sessionId,
      this.maxQuantity,
    );
  }

  async updateItem(owner: CartOwner, itemId: string, quantity: number) {
    if (!owner.userId && !owner.sessionId) {
      throw new NotFoundException('Không tìm thấy giỏ hàng.');
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > this.maxQuantity
    ) {
      throw new BadRequestException(
        `Số lượng phải từ 1 đến ${this.maxQuantity}.`,
      );
    }

    const cart = await this.cartRepository.findByOwner(owner);

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng.');
    }

    const updated = await this.cartItemRepository.updateQuantityByCartId(
      cart.id,
      itemId,
      quantity,
    );

    if (!updated) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng.');
    }

    return {
      message: 'Đã cập nhật số lượng sản phẩm.',
      itemId,
      quantity,
    };
  }

  async removeItem(owner: CartOwner, itemId: string) {
    if (!owner.userId && !owner.sessionId) {
      throw new NotFoundException('Không tìm thấy giỏ hàng.');
    }

    const cart = await this.cartRepository.findByOwner(owner);

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng.');
    }

    const removed = await this.cartItemRepository.removeByCartId(
      cart.id,
      itemId,
    );

    if (!removed) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng.');
    }

    return {
      message: 'Đã xóa sản phẩm khỏi giỏ hàng.',
      itemId,
    };
  }
}
