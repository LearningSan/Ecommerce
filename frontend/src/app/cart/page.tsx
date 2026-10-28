"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/features/cart/hooks/use-cart";
import type { CartItem } from "@/features/cart/types/cart.types";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

export default function CartPage() {
  const router = useRouter();

  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const updateQuantity = async (item: CartItem, nextQuantity: number) => {
    if (nextQuantity < 1 || nextQuantity > 5) return;
    if (nextQuantity === item.quantity) return;

    setPendingItemId(item.id);

    try {
      await updateMutation.mutateAsync({
        itemId: item.id,
        data: { quantity: nextQuantity },
      });
    } catch {
      toast.error("Không thể cập nhật số lượng sản phẩm.");
    } finally {
      setPendingItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setPendingItemId(itemId);

    try {
      await removeMutation.mutateAsync(itemId);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    } catch {
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng.");
    } finally {
      setPendingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="h-36 rounded-xl bg-gray-100" />
          <div className="h-36 rounded-xl bg-gray-100" />
        </div>
      </main>
    );
  }

  if (isError || !cart) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-gray-600">Không thể tải giỏ hàng của bạn.</p>
        <button
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
        >
          Thử lại
        </button>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />

        <h1 className="text-2xl font-bold text-gray-900">
          Giỏ hàng đang trống
        </h1>

        <p className="mt-2 text-gray-500">
          Hãy chọn những sản phẩm bạn yêu thích nhé.
        </p>

        <Link
          href="/product"
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Tiếp tục mua sắm
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {cart.items.length} sản phẩm · {cart.totalQuantity} sản phẩm theo số
            lượng
          </p>
        </div>

        <Link
          href="/product"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          {cart.items.map((item) => {
            const isPending = pendingItemId === item.id;

            const canIncrease =
              item.quantity < 5 &&
              (item.availableQuantity === null ||
                item.quantity < item.availableQuantity);

            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex gap-4">
                  <Link
                    href={
                      item.productSlug
                        ? `/product/${item.productSlug}`
                        : "/product"
                    }
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-32 sm:w-32"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="(max-width: 640px) 96px, 128px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        Chưa có ảnh
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={
                            item.productSlug
                              ? `/product/${item.productSlug}`
                              : "/product"
                          }
                          className="line-clamp-2 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {item.productName}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        disabled={isPending}
                        aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
                        className="shrink-0 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Thông tin phân loại đã chọn */}
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Phân loại sản phẩm đã chọn
                      </p>

                      {(item.variant ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(item.variant ?? []).map((attribute, index) => (
                            <div
                              key={`${attribute.name}-${attribute.value}-${index}`}
                              className="flex min-w-28 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                            >
                              {attribute.type === "COLOR" && (
                                <span
                                  className="h-5 w-5 shrink-0 rounded-full border border-gray-300 shadow-sm"
                                  style={{
                                    backgroundColor:
                                      attribute.colorHex || "#e5e7eb",
                                  }}
                                />
                              )}

                              <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                  {attribute.name}
                                </p>
                                <p className="break-words text-sm font-semibold text-gray-900">
                                  {attribute.value}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Sản phẩm không có thuộc tính phân loại.
                        </p>
                      )}

                      {item.sku && (
                        <p className="mt-3 border-t border-gray-200 pt-2 text-xs text-gray-500">
                          Mã phân loại (SKU):{" "}
                          <span className="font-medium text-gray-700">
                            {item.sku}
                          </span>
                        </p>
                      )}
                    </div>

                    {!item.isAvailable && (
                      <p className="mt-2 text-sm text-red-600">
                        Sản phẩm không đủ tồn kho hoặc không còn khả dụng.
                      </p>
                    )}

                    {item.availableQuantity !== null &&
                      item.quantity > item.availableQuantity && (
                        <p className="mt-1 text-xs text-orange-600">
                          Tồn kho hiện tại: {item.availableQuantity}
                        </p>
                      )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Đơn giá</p>
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Thành tiền</p>
                        <p className="font-bold text-blue-600">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm text-gray-600">Số lượng</span>

                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            void updateQuantity(item, item.quantity - 1)
                          }
                          disabled={isPending || item.quantity <= 1}
                          aria-label="Giảm số lượng"
                          className="p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-10 px-2 text-center text-sm font-medium">
                          {isPending ? "…" : item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void updateQuantity(item, item.quantity + 1)
                          }
                          disabled={isPending || !canIncrease}
                          aria-label="Tăng số lượng"
                          className="p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="text-xs text-gray-400">Tối đa 5</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">
            Tổng quan đơn hàng
          </h2>

          <div className="mt-5 space-y-3 border-b border-gray-100 pb-4 text-sm">
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Số lượng sản phẩm</span>
              <span>{cart.totalQuantity}</span>
            </div>

            <div className="flex justify-between gap-4 text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>

            <div className="flex justify-between gap-4 text-gray-600">
              <span>Phí vận chuyển</span>
              <span>Tính ở bước thanh toán</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="font-semibold text-gray-900">Tổng tiền</span>
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(cart.totalAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Tiến hành thanh toán
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            Tổng tiền chưa bao gồm phí vận chuyển và ưu đãi.
          </p>
        </aside>
      </div>
    </main>
  );
}
