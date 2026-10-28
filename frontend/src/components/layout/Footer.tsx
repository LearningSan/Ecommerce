import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-slate-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Đăng ký nhận ưu đãi độc quyền
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Nhận voucher giảm 100k cho đơn hàng đầu tiên của bạn.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-full sm:w-72"
            />
            <button
              type="button"
              className="h-10 rounded-lg bg-indigo-600 px-5 text-xs font-bold text-white transition hover:bg-indigo-500 shrink-0"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8 text-sm">
        <div>
          <span className="text-xl font-extrabold text-white">Ecommerce</span>
          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            Trải nghiệm mua sắm trực tuyến hiện đại, sản phẩm chính hãng 100%
            cùng chính sách hỗ trợ khách hàng vượt trội.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Mua sắm</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
            <li>
              <Link
                href="/product"
                className="hover:text-indigo-400 transition"
              >
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="hover:text-indigo-400 transition"
              >
                Danh mục nổi bật
              </Link>
            </li>
            <li>
              <Link
                href="/promotions"
                className="hover:text-indigo-400 transition"
              >
                Mã giảm giá
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Hỗ trợ</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
            <li>
              <Link
                href="/contact"
                className="hover:text-indigo-400 transition"
              >
                Trung tâm trợ giúp
              </Link>
            </li>
            <li>
              <Link
                href="/shipping"
                className="hover:text-indigo-400 transition"
              >
                Chính sách vận chuyển
              </Link>
            </li>
            <li>
              <Link
                href="/returns"
                className="hover:text-indigo-400 transition"
              >
                Hướng dẫn đổi trả
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Chính sách</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
            <li>
              <Link href="/terms" className="hover:text-indigo-400 transition">
                Điều khoản dịch vụ
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-indigo-400 transition"
              >
                Chính sách bảo mật
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 bg-slate-950 py-5 text-center text-xs text-gray-500">
        © 2026 Ecommerce Inc. All rights reserved.
      </div>
    </footer>
  );
}
