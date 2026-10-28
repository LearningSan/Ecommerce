import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch.service';
export const PRODUCT_INDEX = 'products';

export interface ProductSearchDocument {
  id: number;
  name: string;
  slug: string;
  description: string | null;

  categoryId: number;
  categoryName: string | null;

  brandId: number | null;
  brandName: string | null;

  imageUrl: string | null;

  price: number;

  soldQuantity: number;
  reviewCount: number;
  ratingAverage: number;
  favoriteCount: number;

  isDiscounted: boolean;

  status: string;

  createdAt: string;
}
@Injectable()
export class ProductIndexService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex() {
    const client = this.elasticsearchService.getClient();
    const exists = await client.indices.exists({
      index: PRODUCT_INDEX,
    });

    if (exists) {
      return;
    }

    await client.indices.create({
      index: PRODUCT_INDEX,
      mappings: {
        properties: {
          id: {
            type: 'long',
          },

          name: {
            type: 'search_as_you_type',
          },

          slug: {
            type: 'keyword',
          },

          description: {
            type: 'text',
          },

          categoryId: {
            type: 'long',
          },

          categoryName: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
              },
            },
          },

          brandId: {
            type: 'long',
          },

          brandName: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
              },
            },
          },

          imageUrl: {
            type: 'keyword',
            index: false,
          },

          price: {
            type: 'double',
          },

          soldQuantity: {
            type: 'long',
          },

          reviewCount: {
            type: 'long',
          },

          ratingAverage: {
            type: 'double',
          },

          favoriteCount: {
            type: 'long',
          },

          isDiscounted: {
            type: 'boolean',
          },

          status: {
            type: 'keyword',
          },

          createdAt: {
            type: 'date',
          },
        },
      },
    });
  }

  async indexProduct(document: ProductSearchDocument) {
    const client = this.elasticsearchService.getClient();

    await client.index({
      index: PRODUCT_INDEX,
      id: document.id.toString(),
      document,
    });
  }

  async deleteProduct(productId: number) {
    const client = this.elasticsearchService.getClient();
    try {
      await client.delete({
        index: PRODUCT_INDEX,
        id: productId.toString(),
      });
    } catch (error: any) {
      if (error?.statusCode !== 404) {
        throw error;
      }
    }
  }
}
