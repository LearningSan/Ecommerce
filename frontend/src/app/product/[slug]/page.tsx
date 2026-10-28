"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ShoppingCart,
  Zap,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import { useProductDetail } from "@/features/product/hooks/useProductDetail";
import { ProductDetailAttribute } from "@/features/product/types/product.types";
import { formatPrice, getDiscountPercent } from "@/lib/utils/price";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { data: product, isPending, isError, refetch } = useProductDetail(slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const addCartItem = useAddCartItem();
  const cartToast = {
    success: (message: string) =>
      toast.success(message, {
        position: "top-right",
        className: "product-detail-cartToast",
      }),

    error: (message: string) =>
      toast.error(message, {
        position: "top-right",
        className: "product-detail-cartToast",
      }),
  };

  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const isAddingToCart = addCartItem.isPending && !isBuyingNow;

  const isCartActionPending = addCartItem.isPending || isBuyingNow;
  const images = useMemo(
    () =>
      [...(product?.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [product?.images],
  );

  // Nhóm các thuộc tính biến thể (Màu sắc, Size, v.v.)
  const attributeGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        name: string;
        code: string;
        type: ProductDetailAttribute["type"];
        values: ProductDetailAttribute[];
      }
    >();

    for (const variant of product?.variants ?? []) {
      for (const attribute of variant.attributes) {
        if (!groups.has(attribute.code)) {
          groups.set(attribute.code, {
            name: attribute.name,
            code: attribute.code,
            type: attribute.type,
            values: [],
          });
        }

        const group = groups.get(attribute.code)!;
        if (!group.values.some((item) => item.valueId === attribute.valueId)) {
          group.values.push(attribute);
        }
      }
    }

    return Array.from(groups.values());
  }, [product?.variants]);

  // Mặc định chọn biến thể đầu tiên
  useEffect(() => {
    const firstVariant = product?.variants[0];
    if (!firstVariant) return;

    setSelectedAttributes(
      Object.fromEntries(
        firstVariant.attributes.map((attribute) => [
          attribute.code,
          attribute.valueId,
        ]),
      ),
    );
    setActiveImageIndex(0);
    setQuantity(1);
  }, [product?.id, product?.variants]);

  const selectedVariant = useMemo(() => {
    const variants = product?.variants ?? [];
    if (variants.length === 0) return undefined;

    return variants.find((variant) =>
      variant.attributes.every(
        (attribute) => selectedAttributes[attribute.code] === attribute.valueId,
      ),
    );
  }, [product?.variants, selectedAttributes]);

  // Kiểm tra giá trị thuộc tính có thể kết hợp với các thuộc tính đang chọn không

  const isAttributeValueAvailable = (
    code: string,
    valueId: string,
  ): boolean => {
    const variants = product?.variants ?? [];

    // Giữ các lựa chọn hiện tại, thay giá trị của nhóm đang kiểm tra.
    const candidateAttributes = {
      ...selectedAttributes,
      [code]: valueId,
    };

    return variants.some((variant) => {
      // Không cho chọn variant không có hàng.
      if (variant.availableQuantity <= 0) {
        return false;
      }

      // Variant phải có giá trị đang xét.
      const hasValue = variant.attributes.some(
        (attribute) => attribute.code === code && attribute.valueId === valueId,
      );

      if (!hasValue) return false;

      // Các nhóm khác phải tương thích với lựa chọn hiện tại.
      return variant.attributes.every((attribute) => {
        if (attribute.code === code) return true;

        const selectedValue = candidateAttributes[attribute.code];

        // Chưa chọn nhóm đó thì không giới hạn.
        if (!selectedValue) return true;

        return selectedValue === attribute.valueId;
      });
    });
  };

  const handleSelectAttribute = (code: string, valueId: string) => {
    const variants = product?.variants ?? [];

    const candidateAttributes = {
      ...selectedAttributes,
      [code]: valueId,
    };

    // Ưu tiên variant khớp hoàn toàn với lựa chọn hiện tại.
    const exactVariant = variants.find(
      (variant) =>
        variant.availableQuantity > 0 &&
        variant.attributes.every(
          (attribute) =>
            candidateAttributes[attribute.code] === attribute.valueId,
        ),
    );

    if (exactVariant) {
      setSelectedAttributes(candidateAttributes);
      setQuantity(1);
      return;
    }

    // Nếu tổ hợp không tồn tại, tìm variant còn hàng có giá trị vừa chọn.
    const compatibleVariant = variants.find(
      (variant) =>
        variant.availableQuantity > 0 &&
        variant.attributes.some(
          (attribute) =>
            attribute.code === code && attribute.valueId === valueId,
        ) &&
        variant.attributes.every((attribute) => {
          if (attribute.code === code) return true;

          const selectedValue = selectedAttributes[attribute.code];

          // Cho phép thay đổi thuộc tính khác để tạo tổ hợp hợp lệ.
          return !selectedValue || selectedValue === attribute.valueId;
        }),
    );

    // Nếu không giữ được các lựa chọn cũ, lấy variant còn hàng
    // đầu tiên có giá trị vừa chọn.
    const fallbackVariant =
      compatibleVariant ??
      variants.find(
        (variant) =>
          variant.availableQuantity > 0 &&
          variant.attributes.some(
            (attribute) =>
              attribute.code === code && attribute.valueId === valueId,
          ),
      );

    if (!fallbackVariant) {
      cartToast.error("Phiên bản này hiện đã hết hàng.");
      return;
    }

    setSelectedAttributes(
      Object.fromEntries(
        fallbackVariant.attributes.map((attribute) => [
          attribute.code,
          attribute.valueId,
        ]),
      ),
    );

    setQuantity(1);
  };

  const availableQuantity = selectedVariant?.availableQuantity ?? 0;
  const discountPercent = selectedVariant
    ? getDiscountPercent(selectedVariant.price, selectedVariant.compareAtPrice)
    : 0;

  const handleAddToCart = async () => {

    if (!selectedVariant) {
      console.error("Chưa chọn được variant hợp lệ.");
      return;
    }
    if (!selectedVariant) {
      cartToast.error("Vui lòng chọn đầy đủ phiên bản sản phẩm.");
      return;
    }

    if (availableQuantity <= 0) {
      cartToast.error("Phiên bản này hiện đã hết hàng.");
      return;
    }

    if (quantity > availableQuantity) {
      cartToast.error("Số lượng vượt quá tồn kho hiện tại.");
      return;
    }

    try {
      await addCartItem.mutateAsync({
        variantId: String(selectedVariant.id),
        quantity,
      });

      cartToast.success("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Add cart item failed:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          response: error.response?.data,
        });

        const message =
          error.response?.data?.message ??
          error.response?.data?.error ??
          error.message;

        cartToast.error(
          Array.isArray(message)
            ? message.join(", ")
            : String(message || "Không thể thêm vào giỏ hàng."),
        );
      } else {
        console.error("Add cart item failed:", error);
        cartToast.error("Đã xảy ra lỗi không xác định.");
      }
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      cartToast.error("Vui lòng chọn đầy đủ phiên bản sản phẩm.");
      return;
    }

    if (availableQuantity <= 0) {
      cartToast.error("Phiên bản này hiện đã hết hàng.");
      return;
    }

    if (quantity > availableQuantity) {
      cartToast.error("Số lượng vượt quá tồn kho hiện tại.");
      return;
    }

    try {
      setIsBuyingNow(true);

      await addCartItem.mutateAsync({
        variantId: String(selectedVariant.id),
        quantity,
      });

      router.push("/checkout");
    } catch {
      cartToast.error("Không thể tiếp tục mua hàng. Vui lòng thử lại.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Trạng thái Loading tinh tế hơn, không gây giật cục
  if (isPending) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded-3xl bg-gray-100" />
          <div className="space-y-4 pt-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-6 w-1/4 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Không tìm thấy sản phẩm
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Sản phẩm có thể đã bị xóa hoặc đường dẫn không tồn tại.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
        >
          Thử tải lại
        </button>
      </main>
    );
  }

  const currentImage = images[activeImageIndex];

  return (
    <main className="min-h-screen bg-gray-50/60 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumb gọn gàng */}
        <nav className="mb-4 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <a href="/" className="transition hover:text-red-600">
            Trang chủ
          </a>
          <span>/</span>
          <a
            href={`/categories/${product.category.slug}`}
            className="transition hover:text-red-600"
          >
            {product.category.name}
          </a>
          <span>/</span>
          <span className="truncate font-medium text-gray-900">
            {product.name}
          </span>
        </nav>

        {/* Khối chính: Bố cục cân đối, bắt mắt ngay từ cái nhìn đầu tiên */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-xs sm:shadow-sm">
          <div className="grid lg:grid-cols-12">
            {/* Cột Trái: Hình ảnh & Gallery (Chiếm 6 phần) */}
            <div className="p-5 sm:p-8 lg:col-span-6 lg:border-r lg:border-gray-100">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 z-10 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-md">
                    GIẢM {discountPercent}%
                  </span>
                )}
                {currentImage ? (
                  <Image
                    src={currentImage.imageUrl}
                    alt={currentImage.altText ?? product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <span className="text-gray-400">Chưa có hình ảnh</span>
                )}
              </div>

              {/* Danh sách ảnh thu nhỏ (Thumbnails) */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                        activeImageIndex === index
                          ? "border-red-600 ring-2 ring-red-600/20 scale-105"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Cam kết dịch vụ tăng uy tín */}
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-5 w-5 text-red-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">
                    Giao hàng nhanh
                  </span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-gray-200">
                  <ShieldCheck className="h-5 w-5 text-red-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">
                    Chính hãng 100%
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RotateCcw className="h-5 w-5 text-red-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">
                    Đổi trả 7 ngày
                  </span>
                </div>
              </div>
            </div>

            {/* Cột Phải: Thông tin, Biến thể & Nút mua (Chiếm 6 phần) */}
            <div className="flex flex-col justify-between p-5 sm:p-8 lg:col-span-6 bg-white">
              <div>
                {/* Tên sản phẩm */}
                <h1 className="text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">
                  {product.name}
                </h1>

                {/* Đánh giá & Đã bán */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>
                      {Number(product.statistics.ratingAverage).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span>
                    Đã bán{" "}
                    <strong className="text-gray-900">
                      {Number(product.statistics.soldQuantity).toLocaleString(
                        "vi-VN",
                      )}
                    </strong>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    Thương hiệu:{" "}
                    <strong className="text-gray-900">
                      {product.brand?.name ?? "Đang cập nhật"}
                    </strong>
                  </span>
                </div>

                {/* Khung Giá Nổi Bật */}
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50/40 p-4 border border-red-100/60 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-red-600">
                    {selectedVariant
                      ? formatPrice(selectedVariant.price)
                      : "Chọn phiên bản"}
                  </span>
                  {selectedVariant?.compareAtPrice &&
                    Number(selectedVariant.compareAtPrice) >
                      Number(selectedVariant.price) && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(selectedVariant.compareAtPrice)}
                      </span>
                    )}
                </div>

                {/* Các nhóm thuộc tính (Màu sắc, Size...) */}
                {attributeGroups.map((group) => (
                  <div key={group.code} className="mt-5">
                    <div className="mb-2.5 flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-900">
                        {group.name}:
                      </span>
                      <span className="text-red-600 font-medium">
                        {
                          group.values.find(
                            (v) => v.valueId === selectedAttributes[group.code],
                          )?.value
                        }
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.values
                        .filter((value) => {
                          // Luôn hiển thị giá trị của thuộc tính đang được chọn,
                          // hoặc giá trị có thể kết hợp với các thuộc tính khác.
                          return isAttributeValueAvailable(
                            group.code,
                            value.valueId,
                          );
                        })
                        .map((value) => {
                          const isSelected =
                            selectedAttributes[group.code] === value.valueId;

                          return (
                            <button
                              key={value.valueId}
                              type="button"
                              onClick={() =>
                                handleSelectAttribute(group.code, value.valueId)
                              }
                              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-red-600 bg-red-50 text-red-600 ring-2 ring-red-600/10 font-bold"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                              }`}
                            >
                              {group.type === "COLOR" && value.colorHex && (
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-gray-300"
                                  style={{ backgroundColor: value.colorHex }}
                                />
                              )}

                              {value.value}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}

                {/* Tình trạng kho hàng */}
                {selectedVariant && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                    <span className="text-gray-500">Tình trạng:</span>
                    <span
                      className={
                        availableQuantity > 0
                          ? "text-emerald-600 flex items-center gap-1"
                          : "text-rose-600"
                      }
                    >
                      {availableQuantity > 0 ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Còn{" "}
                          {availableQuantity} sản phẩm trong kho
                        </>
                      ) : (
                        "Tạm hết hàng"
                      )}
                    </span>
                  </div>
                )}

                {/* Chọn số lượng */}
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Số lượng:
                  </span>
                  <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((c) => Math.max(1, c - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 text-base font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="h-10 w-12 flex items-center justify-center text-sm font-bold text-gray-900 border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((c) => Math.min(availableQuantity, c + 1))
                      }
                      disabled={
                        !selectedVariant ||
                        availableQuantity <= 0 ||
                        quantity >= availableQuantity
                      }
                      className="h-10 w-10 text-base font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút thao tác (Thêm giỏ hàng & Mua ngay) */}
              <div className="mt-6 space-y-3 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={
                      isCartActionPending ||
                      !selectedVariant ||
                      availableQuantity <= 0
                    }
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-red-600 bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-5 w-5" />
                    )}
                    <span>Thêm vào giỏ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={
                      isCartActionPending ||
                      !selectedVariant ||
                      availableQuantity <= 0
                    }
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  >
                    {isBuyingNow ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5 fill-white" />
                    )}
                    <span>Mua ngay</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phần mô tả chi tiết sản phẩm ở dưới */}
        <section className="mt-6 rounded-3xl bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="border-b border-gray-100 pb-4 text-lg font-bold text-gray-900">
            Mô tả chi tiết sản phẩm
          </h2>
          <div className="mt-6">
            {product.description ? (
              <div className="prose max-w-none whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {product.description}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Đang cập nhật nội dung mô tả...
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
