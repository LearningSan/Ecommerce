import { Injectable } from '@nestjs/common';

import { ProductRepository } from '../repositories/product.repository';
import { ProductFilterSort, ProductSearchDto } from '../dto/product-search.dto';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import {
  PRODUCT_INDEX,
  ProductIndexService,
  ProductSearchDocument,
} from '../elasticsearch/product/product-index.service';
import { ProductListItem } from '../types/product-list-item.type';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly productIndexService: ProductIndexService,
  ) {}

  async reindexProducts() {
    const products = await this.productRepository.getProductsForSearchIndex();

    await this.productIndexService.createIndex();

    const client = this.elasticsearchService.getClient();

    if (!products.length) {
      return {
        indexed: 0,
      };
    }

    const operations = products.flatMap((product) => [
      {
        index: {
          _index: PRODUCT_INDEX,
          _id: product.id.toString(),
        },
      },
      {
        ...product,
        id: Number(product.id),
        categoryId: Number(product.categoryId),
        brandId: product.brandId ? Number(product.brandId) : null,
        price: Number(product.price),
        soldQuantity: Number(product.soldQuantity),
        reviewCount: Number(product.reviewCount),
        ratingAverage: Number(product.ratingAverage),
        favoriteCount: Number(product.favoriteCount),
        isDiscounted: Boolean(product.isDiscounted),
      },
    ]);

    const response = await client.bulk({
      operations,
      refresh: true,
    });

    if (response.errors) {
      const failedItems = response.items.filter((item) => item.index?.error);

      throw new Error(
        `Elasticsearch bulk indexing failed: ${failedItems.length} products`,
      );
    }

    return {
      indexed: products.length,
    };
  }

  async searchProducts(dto: ProductSearchDto): Promise<{
    items: ProductListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const client = this.elasticsearchService.getClient();

    const q = dto.q?.trim();
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;
    const from = (page - 1) * limit;

    const filter: Record<string, unknown>[] = [
      {
        term: {
          status: 'ACTIVE',
        },
      },
    ];

    // Lọc danh mục
    if (dto.categoryId !== undefined) {
      filter.push({
        term: {
          categoryId: dto.categoryId,
        },
      });
    }

    // Lọc thương hiệu
    if (dto.brandId !== undefined) {
      filter.push({
        term: {
          brandId: dto.brandId,
        },
      });
    }

    // Lọc khoảng giá
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      const priceRange: Record<string, number> = {};

      if (dto.minPrice !== undefined) {
        priceRange.gte = dto.minPrice;
      }

      if (dto.maxPrice !== undefined) {
        priceRange.lte = dto.maxPrice;
      }

      filter.push({
        range: {
          price: priceRange,
        },
      });
    }

    // Lọc sản phẩm giảm giá
    if (dto.isDiscounted !== undefined) {
      filter.push({
        term: {
          isDiscounted: dto.isDiscounted,
        },
      });
    }

    const must = q
      ? [
          {
            multi_match: {
              query: q,
              fields: [
                'name^5',
                'name._2gram^3',
                'name._3gram^2',
                'brandName^3',
                'categoryName^2',
                'description',
              ],
              type: 'bool_prefix',
              operator: 'and',
            },
          },
        ]
      : [
          {
            match_all: {},
          },
        ];

    const body: Record<string, unknown> = {
      from,
      size: limit,
      track_total_hits: true,
      query: {
        bool: {
          must,
          filter,
        },
      },
    };

    switch (dto.sort) {
      case ProductFilterSort.POPULAR:
        body.sort = [
          { soldQuantity: { order: 'desc', missing: '_last' } },
          { ratingAverage: { order: 'desc', missing: '_last' } },
          { createdAt: { order: 'desc', missing: '_last' } },
        ];
        break;

      case ProductFilterSort.NEWEST:
        body.sort = [{ createdAt: { order: 'desc', missing: '_last' } }];
        break;

      case ProductFilterSort.PRICE_ASC:
        body.sort = [{ price: { order: 'asc', missing: '_last' } }];
        break;

      case ProductFilterSort.PRICE_DESC:
        body.sort = [{ price: { order: 'desc', missing: '_last' } }];
        break;

      case ProductFilterSort.DISCOUNT_DESC:
        // Hiện index chỉ có isDiscounted dạng boolean.
        // Vì vậy có thể đưa sản phẩm đang giảm giá lên trước,
        // nhưng chưa thể xếp theo phần trăm giảm giá thực tế.
        body.sort = [
          { isDiscounted: { order: 'desc' } },
          { soldQuantity: { order: 'desc', missing: '_last' } },
        ];
        break;

      case ProductFilterSort.RELEVANCE:
      default:
        if (!q) {
          body.sort = [
            { soldQuantity: { order: 'desc', missing: '_last' } },
            { ratingAverage: { order: 'desc', missing: '_last' } },
            { createdAt: { order: 'desc', missing: '_last' } },
          ];
        }
        // Có từ khóa: mặc định ưu tiên _score của Elasticsearch.
        break;
    }

    const result = await client.search<ProductSearchDocument>({
      index: PRODUCT_INDEX,
      ...body,
    });

    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : (result.hits.total?.value ?? 0);

    const items: ProductListItem[] = result.hits.hits
      .filter((hit) => hit._source !== undefined)
      .map((hit) => {
        const product = hit._source!;

        return {
          id: Number(product.id),
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl ?? null,
          price: Number(product.price),
          soldQuantity: Number(product.soldQuantity ?? 0),
          reviewCount: Number(product.reviewCount ?? 0),
          ratingAverage: Number(product.ratingAverage ?? 0),
          favoriteCount: Number(product.favoriteCount ?? 0),
          isDiscounted: Boolean(product.isDiscounted),
        };
      });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
