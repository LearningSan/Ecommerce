"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartService } from "../services/cart.service";

import type {
  AddCartItemRequest,
  UpdateCartItemRequest,
} from "../types/cart.types";
export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
};

export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartService.getCart,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddCartItemRequest) => cartService.addItem(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateCartItemRequest;
    }) => cartService.updateItem(itemId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      });
    },
  });
}
