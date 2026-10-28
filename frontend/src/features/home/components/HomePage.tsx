import { HeroSection } from "../../banner/components/HeroSection";
import { FlashSaleSection } from "./FlashSaleSection";
import { BestSellingSection } from "./BestSellingSection";
import { NewArrivalsSection } from "./NewArrivalsSection";
import { PromotionSection } from "../../promotion/components/PromotionSection";
import { CategoryProductSections } from "./CategoryProductSections";
import { TrustBadges } from "@/components/common/TrustBadges";
import { SectionErrorBoundary } from "./common/SectionErrorBoundary";

// Các import section hiện tại giữ nguyên.

export function HomePage() {
  return (
    <div className="bg-gray-50/40 min-h-screen">
      <SectionErrorBoundary>
        <HeroSection />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <TrustBadges />
      </SectionErrorBoundary>

      <div className="my-8">
        <SectionErrorBoundary>
          <FlashSaleSection />
        </SectionErrorBoundary>
      </div>

      <div className="bg-white py-6 shadow-sm my-8">
        <SectionErrorBoundary>
          <BestSellingSection />
        </SectionErrorBoundary>
      </div>

      <div className="my-8">
        <SectionErrorBoundary>
          <PromotionSection />
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary>
        <CategoryProductSections />
      </SectionErrorBoundary>

      <div className="bg-white py-6 shadow-sm my-8">
        <SectionErrorBoundary>
          <NewArrivalsSection />
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
