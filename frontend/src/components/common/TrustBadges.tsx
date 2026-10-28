// src/components/common/TrustBadges.tsx
export function TrustBadges() {
  const badges = [
    { icon: "🚀", title: "Giao hàng hỏa tốc", desc: "Nhận hàng trong 24h" },
    { icon: "🛡️", title: "Cam kết chính hãng", desc: "Hoàn tiền 200% nếu giả" },
    { icon: "🔄", title: "7 ngày đổi trả", desc: "Thủ tục nhanh chóng" },
    { icon: "🎧", title: "Hỗ trợ 24/7", desc: "Tư vấn tận tâm" },
  ];

  return (
    <section className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white py-8 my-8 shadow-inner">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <span className="text-3xl">{b.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-white">{b.title}</h4>
                <p className="text-xs text-gray-300 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
