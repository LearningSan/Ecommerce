import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { ProductEntity } from '../entities/product.entity';
import { ProductListItem } from '../types/product-list-item.type';

@Injectable()
export class HomepageProductRepository extends Repository<ProductEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ProductEntity, dataSource.createEntityManager());
  }

  private createProductQuery() {
    return this.createQueryBuilder('p')
      .innerJoin('categories', 'c', 'c.id = p.category_id')
      .leftJoin('product_statistics', 'ps', 'ps.product_id = p.id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',

        'c.id AS categoryId',
        'c.name AS categoryName',

        `
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
            AND pi.is_primary = TRUE
          ORDER BY pi.id ASC
          LIMIT 1
        ) AS imageUrl
        `,

        `
        (
          SELECT MIN(pv.price)
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.status = 'ACTIVE'
            AND pv.deleted_at IS NULL
        ) AS price
        `,

        'COALESCE(ps.sold_quantity, 0) AS soldQuantity',
        'COALESCE(ps.review_count, 0) AS reviewCount',
        'COALESCE(ps.rating_average, 0) AS ratingAverage',
        'COALESCE(ps.favorite_count, 0) AS favoriteCount',

        `
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM promotion_products pp
            INNER JOIN promotions pr
              ON pr.id = pp.promotion_id
            WHERE pp.product_id = p.id
              AND pr.status = 'ACTIVE'
              AND pr.deleted_at IS NULL
              AND NOW() >= pr.start_at
              AND NOW() < pr.end_at
              AND pr.promotion_type IN (
                'PERCENTAGE',
                'FIXED_AMOUNT'
              )
          )
          OR EXISTS (
            SELECT 1
            FROM promotion_categories pc
            INNER JOIN promotions pr
              ON pr.id = pc.promotion_id
            WHERE pc.category_id = p.category_id
              AND pr.status = 'ACTIVE'
              AND pr.deleted_at IS NULL
              AND NOW() >= pr.start_at
              AND NOW() < pr.end_at
              AND pr.promotion_type IN (
                'PERCENTAGE',
                'FIXED_AMOUNT'
              )
          )
          THEN 1
          ELSE 0
        END AS isDiscounted
        `,
      ])
      .where('p.status = :productStatus', {
        productStatus: 'ACTIVE',
      })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('c.status = :categoryStatus', {
        categoryStatus: 'ACTIVE',
      })
      .andWhere('c.deleted_at IS NULL').andWhere(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          INNER JOIN inventories i
            ON i.variant_id = pv.id
          WHERE pv.product_id = p.id
            AND pv.status = 'ACTIVE'
            AND pv.deleted_at IS NULL
            AND i.available_quantity > 0
        )
      `).andWhere(`
        EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.status = 'ACTIVE'
            AND pv.deleted_at IS NULL
        )
      `);
  }

  private applyExcludedProducts(
    query: ReturnType<typeof this.createProductQuery>,
    excludedProductIds: number[],
  ) {
    if (!excludedProductIds.length) {
      return query;
    }

    return query.andWhere('p.id NOT IN (:...excludedProductIds)', {
      excludedProductIds,
    });
  }

  async getFlashSaleProducts(
    limit: number,
    excludedProductIds: number[] = [],
  ): Promise<ProductListItem[]> {
    const query = this.createProductQuery();

    this.applyExcludedProducts(query, excludedProductIds);

    query
      .andWhere(
        `
        EXISTS (
          SELECT 1
          FROM promotion_products pp
          INNER JOIN promotions pr
            ON pr.id = pp.promotion_id
          WHERE pp.product_id = p.id
            AND pr.status = 'ACTIVE'
            AND pr.deleted_at IS NULL
            AND NOW() >= pr.start_at
            AND NOW() < pr.end_at
            AND pr.promotion_type IN (
              'PERCENTAGE',
              'FIXED_AMOUNT'
            )
        )
      `,
      )
      .orderBy('ps.sold_quantity', 'DESC')
      .addOrderBy('ps.rating_average', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .limit(limit);

    const rows = await query.getRawMany();

    return this.mapProductRows(rows);
  }

  async getBestSellingProducts(
    limit: number,
    excludedProductIds: number[] = [],
  ): Promise<ProductListItem[]> {
    const query = this.createProductQuery();

    this.applyExcludedProducts(query, excludedProductIds);

    query
      .orderBy('COALESCE(ps.sold_quantity, 0)', 'DESC')
      .addOrderBy('COALESCE(ps.rating_average, 0)', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .limit(limit);

    const rows = await query.getRawMany();

    return this.mapProductRows(rows);
  }

  async getNewArrivalProducts(
    limit: number,
    excludedProductIds: number[] = [],
  ): Promise<ProductListItem[]> {
    const query = this.createProductQuery();

    this.applyExcludedProducts(query, excludedProductIds);

    query
      .orderBy('p.created_at', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .limit(limit);

    const rows = await query.getRawMany();

    return this.mapProductRows(rows);
  }

  async getCategoryProducts(
    categoryIds: number[],
    limitPerCategory: number,
    excludedProductIds: number[] = [],
  ): Promise<
    {
      categoryId: number;
      categoryName: string;
      products: ProductListItem[];
    }[]
  > {
    if (!categoryIds.length) {
      return [];
    }

    const query = this.createProductQuery();

    this.applyExcludedProducts(query, excludedProductIds);

    query
      .andWhere('p.category_id IN (:...categoryIds)', { categoryIds })
      .addSelect(
        `
        ROW_NUMBER() OVER (
          PARTITION BY p.category_id
          ORDER BY
            COALESCE(ps.sold_quantity, 0) DESC,
            COALESCE(ps.rating_average, 0) DESC,
            p.created_at DESC,
            p.id DESC
        )
      `,
        'rowNumber',
      );

    const rankedSql = query.getQuery();

    const rows = await this.manager
      .createQueryBuilder()
      .select('*')
      .from(`(${rankedSql})`, 'ranked')
      .where('ranked.rowNumber <= :limitPerCategory', { limitPerCategory })
      .setParameters(query.getParameters())
      .orderBy('ranked.categoryId', 'ASC')
      .addOrderBy('ranked.rowNumber', 'ASC')
      .getRawMany();

    const categoryMap = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        products: ProductListItem[];
      }
    >();

    for (const row of rows) {
      const categoryId = Number(row.categoryId);

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: row.categoryName,
          products: [],
        });
      }

      categoryMap.get(categoryId)!.products.push(this.mapProductRow(row));
    }

    return Array.from(categoryMap.values());
  }

  private mapProductRows(rows: any[]): ProductListItem[] {
    return rows.map((row) => this.mapProductRow(row));
  }

  private mapProductRow(row: any): ProductListItem {
    return {
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      imageUrl: row.imageUrl ?? null,
      price: row.price === null ? 0 : Number(row.price),
      soldQuantity: Number(row.soldQuantity ?? 0),
      reviewCount: Number(row.reviewCount ?? 0),
      ratingAverage: Number(row.ratingAverage ?? 0),
      favoriteCount: Number(row.favoriteCount ?? 0),
      isDiscounted: Boolean(Number(row.isDiscounted ?? 0)),
    };
  }
}
