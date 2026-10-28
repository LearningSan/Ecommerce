"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartProduct {
  id: string | number;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string | number) => void;
  getTotalQuantity: () => number;
}
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => String(item.id) === String(product.id),
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                String(item.id) === String(product.id)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { ...product, quantity }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => String(item.id) !== String(productId),
          ),
        })),

      getTotalQuantity: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: "ecommerce-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
