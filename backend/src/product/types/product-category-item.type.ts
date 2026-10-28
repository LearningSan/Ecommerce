export interface ProductCategoryItem {
  id: number;
  name: string;
  slug: string;

  categoryId: number;
  categoryName: string;

  imageUrl: string | null;
  price: number;

  soldQuantity: number;
  reviewCount: number;
  ratingAverage: number;
  favoriteCount: number;

  isDiscounted: number;
  rowNumber: number;
}
