
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;

  soldQuantity: number;
  reviewCount: number;
  ratingAverage: number;
  favoriteCount: number;

  isDiscounted: boolean;
}
export interface CategoryProductSection {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  products: ProductListItem[];
}