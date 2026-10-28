import { api } from "@/lib/axios";
import type {
  AddCartItemRequest,
  CartMutationResponse,
  CartResponse,
  UpdateCartItemRequest,
} from "../types/cart.types";

const CART_ENDPOINT = "/cart";

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get<CartResponse>(CART_ENDPOINT);
    return response.data;
  },

  async addItem(data: AddCartItemRequest): Promise<CartMutationResponse> {
    const response = await api.post<CartMutationResponse>(
      `${CART_ENDPOINT}/items`,
      data,
    );
    return response.data;
  },

  async updateItem(
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<CartMutationResponse> {
    const response = await api.patch<CartMutationResponse>(
      `${CART_ENDPOINT}/items/${itemId}`,
      data,
    );
    return response.data;
  },

  async removeItem(itemId: string): Promise<CartMutationResponse> {
    const response = await api.delete<CartMutationResponse>(
      `${CART_ENDPOINT}/items/${itemId}`,
    );
    return response.data;
  },
  async clearCart(): Promise<void> {
    await api.delete(`${CART_ENDPOINT}/items`);
  },
};
