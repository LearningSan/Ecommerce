export function formatPrice(price: string | number): string {
  return Number(price).toLocaleString("vi-VN") + "₫";
}

export function getDiscountPercent(
  price: string | number,
  compareAtPrice: string | number | null,
): number {
  if (
    compareAtPrice === null ||
    compareAtPrice === "" ||
    !Number.isFinite(Number(price)) ||
    !Number.isFinite(Number(compareAtPrice)) ||
    Number(compareAtPrice) <= Number(price) ||
    Number(compareAtPrice) <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((Number(compareAtPrice) - Number(price)) /
      Number(compareAtPrice)) *
      100,
  );
}