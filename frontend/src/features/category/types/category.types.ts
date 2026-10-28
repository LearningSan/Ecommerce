export interface CategoryListItem {
  id: number;
  name: string;
  slug:string;
  imageUrl: string;
}

export interface CategoryListRequest {
  page?: number;
  limit?: number;
}

export interface CategoryListResponse {
  data: CategoryListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}