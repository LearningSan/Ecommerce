
export type CartVariantAttributeType = "TEXT" | "COLOR" | "SELECT";

export interface CartVariantAttribute {
  name: string;
  type: CartVariantAttributeType;
  value: string;
  colorHex: string | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  isAvailable: boolean;
  availableQuantity: number | null;
  variant: CartVariantAttribute[];
}

export interface CartResponse {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

export interface AddCartItemRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartMutationResponse {
  message: string;
  cartId?: string;
  itemId?: string;
  variantId?: string;
  quantity?: number;
}
