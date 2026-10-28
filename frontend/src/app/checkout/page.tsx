"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MapPin, Package, Wallet } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/features/cart/hooks/use-cart";
import type { CartItem as ApiCartItem } from "@/features/cart/types/cart.types";
import { useAuthStore } from "@/stores/auth.store";
import { formatPrice } from "@/lib/utils/price";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên hợp lệ."),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ."),
  email: z.string().trim().email("Email không hợp lệ.").or(z.literal("")),
  province: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành phố."),
  ward: z.string().trim().min(1, "Vui lòng nhập phường/xã."),
  address: z.string().trim().min(5, "Vui lòng nhập địa chỉ chi tiết."),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự."),
  paymentMethod: z.enum(["COD", "ONLINE"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const ADDRESS_API = "https://tinhthanhpho.com/api/v1";

interface AddressOption {
  code: string | number;
  name: string;
}

async function fetchProvinces(): Promise<AddressOption[]> {
  const response = await fetch(`${ADDRESS_API}/new-provinces`);

  if (!response.ok) {
    throw new Error("Không thể tải danh sách tỉnh/thành phố.");
  }

  const result = await response.json();
  return result.data;
}

async function fetchWards(provinceCode: string): Promise<AddressOption[]> {
  const response = await fetch(
    `${ADDRESS_API}/new-provinces/${provinceCode}/wards?limit=500`,
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách phường/xã.");
  }

  const result = await response.json();
  return result.data;
}
export default function CheckoutPage() {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);

  const isAuthenticated = authStatus === "authenticated";

  const {
    data: cart,
    isLoading: isCartLoading,
    isError: isCartError,
    refetch,
  } = useCart();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      province: "",
      ward: "",
      address: "",
      note: "",
      paymentMethod: "COD",
    },
  });
  const paymentMethod = watch("paymentMethod");

  const selectedProvinceName = watch("province");

  const {
    data: provinces = [],
    isLoading: isProvincesLoading,
    isError: isProvincesError,
  } = useQuery({
    queryKey: ["address", "provinces"],
    queryFn: fetchProvinces,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const selectedProvince = provinces.find(
    (province) => province.name === selectedProvinceName,
  );

  const {
    data: wards = [],
    isLoading: isWardsLoading,
    isError: isWardsError,
  } = useQuery({
    queryKey: ["address", "wards", selectedProvince?.code],
    queryFn: () => fetchWards(String(selectedProvince!.code)),
    enabled: Boolean(selectedProvince),
    staleTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      reset({
        fullName: user.name ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        province: "",
        ward: "",
        address: "",
        note: "",
        paymentMethod: "COD",
      });
    }
  }, [isAuthenticated, user, reset]);

  if (authStatus === "loading") {
    return (
      <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-100" />
          <div className="h-32 rounded-xl bg-gray-100" />
        </div>
      </main>
    );
  }

  if (isAuthenticated && isCartLoading) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-10">
        <p className="text-gray-500">Đang tải giỏ hàng...</p>
      </main>
    );
  }

  if (isCartLoading) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-10">
        <p className="text-gray-500">Đang tải giỏ hàng...</p>
      </main>
    );
  }

  if (isCartError || !cart) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-gray-600">Không thể tải giỏ hàng để thanh toán.</p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
        >
          Thử lại
        </button>

        <div>
          <Link
            href="/cart"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Quay lại giỏ hàng
          </Link>
        </div>
      </main>
    );
  }

  const items = (cart?.items ?? []).map((item: ApiCartItem) => ({
    id: item.id,
    name: item.productName,
    slug: item.productSlug,
    imageUrl: item.imageUrl,
    price: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.subtotal,
    variant: item.variant ?? [],
    available:
      item.isAvailable &&
      (item.availableQuantity === null ||
        item.quantity <= item.availableQuantity),
  }));

  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  const hasUnavailableItems = items.some((item) => !item.available);

  const onSubmit = async (_values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống.");
      return;
    }

    if (hasUnavailableItems) {
      toast.error("Vui lòng kiểm tra lại sản phẩm và số lượng.");
      return;
    }

    // Frontend hiện chưa có API tạo đơn hàng.
    // Không giả lập đặt hàng thành công hoặc xóa giỏ hàng.
    toast.info(
      "Thông tin hợp lệ. Cần tích hợp API tạo đơn hàng để hoàn tất đặt hàng.",
    );
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <Package className="mb-4 h-14 w-14 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">
          Giỏ hàng đang trống
        </h1>
        <p className="mt-2 text-gray-500">
          Hãy thêm sản phẩm trước khi tiến hành thanh toán.
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

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Link
        href="/cart"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại giỏ hàng
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Thanh toán
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Kiểm tra thông tin giao hàng và đơn hàng của bạn.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-bold text-gray-900">Thông tin nhận hàng</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {isAuthenticated
                    ? "Kiểm tra thông tin trước khi đặt hàng."
                    : "Bạn có thể đặt hàng mà không cần đăng nhập."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700"
                >
                  Họ và tên *
                </label>
                <input
                  id="fullName"
                  autoComplete="name"
                  {...register("fullName")}
                  className={inputClass}
                  placeholder="Nguyễn Văn A"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Số điện thoại *
                </label>
                <input
                  id="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  {...register("phone")}
                  className={inputClass}
                  placeholder="09xxxxxxxx"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={inputClass}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="province"
                  className="text-sm font-medium text-gray-700"
                >
                  Tỉnh / Thành phố *
                </label>

                <select
                  id="province"
                  autoComplete="address-level1"
                  {...register("province", {
                    onChange: () => {
                      setValue("ward", "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    },
                  })}
                  className={inputClass}
                  disabled={isProvincesLoading}
                >
                  <option value="">
                    {isProvincesLoading
                      ? "Đang tải tỉnh/thành..."
                      : "Chọn tỉnh/thành phố"}
                  </option>

                  {provinces.map((province) => (
                    <option key={province.code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>

                {isProvincesError && (
                  <p className="mt-1 text-xs text-red-600">
                    Không tải được danh sách tỉnh/thành. Vui lòng thử lại.
                  </p>
                )}

                {errors.province && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.province.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ward"
                  className="text-sm font-medium text-gray-700"
                >
                  Phường / Xã *
                </label>

                <select
                  id="ward"
                  autoComplete="address-level2"
                  {...register("ward", {
                    onChange: (event) => {
                      setValue("ward", event.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    },
                  })}
                  className={inputClass}
                  disabled={!selectedProvince || isWardsLoading}
                >
                  <option value="">
                    {!selectedProvince
                      ? "Chọn tỉnh/thành trước"
                      : isWardsLoading
                        ? "Đang tải phường/xã..."
                        : "Chọn phường/xã"}
                  </option>

                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </select>

                {isWardsError && (
                  <p className="mt-1 text-xs text-red-600">
                    Không tải được danh sách phường/xã. Vui lòng thử lại.
                  </p>
                )}

                {errors.ward && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.ward.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-700"
                >
                  Địa chỉ chi tiết *
                </label>
                <input
                  id="address"
                  autoComplete="street-address"
                  {...register("address")}
                  className={inputClass}
                  placeholder="Số nhà, tên đường, khu phố..."
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="note"
                  className="text-sm font-medium text-gray-700"
                >
                  Ghi chú đơn hàng
                </label>
                <textarea
                  id="note"
                  rows={3}
                  {...register("note")}
                  className={inputClass}
                  placeholder="Ví dụ: Gọi trước khi giao hàng..."
                />
                {errors.note && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.note.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-gray-900">
                Phương thức thanh toán
              </h2>
            </div>

            <div className="space-y-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                  paymentMethod === "COD"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  value="COD"
                  {...register("paymentMethod")}
                  className="mt-1 accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Thanh toán trực tiếp khi nhận được sản phẩm.
                  </span>
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                  paymentMethod === "ONLINE"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  value="ONLINE"
                  {...register("paymentMethod")}
                  className="mt-1 accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Thanh toán online
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Thanh toán trực tuyến qua cổng thanh toán điện tử.
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Đơn hàng của bạn</h2>

          <p className="mt-1 text-sm text-gray-500">
            {items.length} sản phẩm · {totalQuantity} sản phẩm theo số lượng
          </p>

          <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      Chưa có ảnh
                    </div>
                  )}
                  <span className="absolute -right-0 -top-0 rounded-bl-md bg-gray-800 px-1.5 py-0.5 text-xs text-white">
                    x{item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={item.slug ? `/product/${item.slug}` : "/product"}
                    className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-blue-600"
                  >
                    {item.name}
                  </Link>

                  {item.variant.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.variant
                        .map(
                          (attribute) =>
                            `${attribute.name}: ${attribute.value}`,
                        )
                        .join(" · ")}
                    </p>
                  )}

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatPrice(item.subtotal)}
                  </p>

                  {!item.available && (
                    <p className="mt-1 text-xs text-red-600">
                      Sản phẩm không khả dụng hoặc không đủ tồn kho.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between gap-3 text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between gap-3 text-gray-600">
              <span>Phí vận chuyển</span>
              <span className="text-right">Sẽ được xác định sau</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <span className="font-semibold text-gray-900">Tổng tiền hàng</span>
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(subtotal)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || hasUnavailableItems}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            Tổng tiền chưa bao gồm phí vận chuyển. Đơn hàng chỉ được tạo khi hệ
            thống tích hợp API đặt hàng.
          </p>
        </aside>
      </form>
    </main>
  );
}
