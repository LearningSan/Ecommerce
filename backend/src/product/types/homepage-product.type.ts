import { ProductListItem } from "./product-list-item.type";

export interface HomepageCategoryProducts {
  categoryId: number;
  categoryName: string;
  products: ProductListItem[];
}

export interface HomepageProductResponse {
  flashSale: ProductListItem[];
  bestSelling: ProductListItem[];
  categories: HomepageCategoryProducts[];
  newArrivals: ProductListItem[];
}
