
export type ProductFilterSort =
  | "relevance"
  | "popular"
  | "newest"
  | "discount_desc"
  | "price_asc"
  | "price_desc";

export interface ProductSearchRequest {
  q?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  isDiscounted?: boolean;
  sort?: ProductFilterSort;
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

export interface ProductCategoryRequest {
  categoryIds: number[];
  limitPerCategory?: number;
}

export interface CategoryProductSection {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  products: ProductListItem[];
}

export interface ProductDetailImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductDetailAttribute {
  id: string;
  name: string;
  code: string;
  type: "TEXT" | "COLOR" | "SELECT";
  valueId: string;
  value: string;
  colorHex: string | null;
}

export interface ProductDetailVariant {
  id: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  weightGrams: number | null;
  availableQuantity: number;
  attributes: ProductDetailAttribute[];
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isFeatured: boolean;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;

  images: ProductDetailImage[];
  variants: ProductDetailVariant[];

  statistics: {
    soldQuantity: string;
    buyerCount: string;
    reviewCount: string;
    ratingAverage: string;
    favoriteCount: string;
  };

  createdAt: string;
  updatedAt: string;
}