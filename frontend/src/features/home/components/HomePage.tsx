import { HeroSection } from "../../banner/components/HeroSection";
import { FlashSaleSection } from "./FlashSaleSection";
import { BestSellingSection } from "./BestSellingSection";
import { NewArrivalsSection } from "./NewArrivalsSection";
import { PromotionSection } from "../../promotion/components/PromotionSection";
import { CategoryProductSections } from "./CategoryProductSections";
import { TrustBadges } from "@/components/common/TrustBadges";

export function HomePage() {
  return (
    <div className="bg-gray-50/40 min-h-screen">
      {/* Banner chính */}
      <HeroSection />

      {/* Cam kết thương hiệu */}
      <TrustBadges />

      {/* Flash Sale (Nền màu đỏ/hồng sẫm tạo sự giục giã) */}
      <div className="my-8">
        <FlashSaleSection />
      </div>

      {/* Bán chạy nhất */}
      <div className="bg-white py-6 shadow-sm my-8">
        <BestSellingSection />
      </div>

      {/* Khuyến mãi Hot Banner */}
      <div className="my-8">
        <PromotionSection />
      </div>

      {/* Sản phẩm theo danh mục */}
      <CategoryProductSections />

      {/* Hàng mới về */}
      <div className="bg-white py-6 shadow-sm my-8">
        <NewArrivalsSection />
      </div>
    </div>
  );
}
