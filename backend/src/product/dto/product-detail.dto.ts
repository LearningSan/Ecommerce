
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
  type: 'TEXT' | 'COLOR' | 'SELECT';
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

export interface ProductDetailDto {
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

  createdAt: Date;
  updatedAt: Date;
}