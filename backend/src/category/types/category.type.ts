export class CategoryListItem {
  id: number;
  name: string;
  slug:string;
  imageUrl:string;
}

export class PaginatedCategories {
  data: CategoryListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}