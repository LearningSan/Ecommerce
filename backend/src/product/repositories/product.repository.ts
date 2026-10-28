import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../category/entities/category.entity';
import { ProductStatisticsEntity } from '../entities/product-statistics.entity';
import { ProductSearchDocument } from '../elasticsearch/product/product-index.service';
import { BrandEntity } from '../entities/brand.entity';
import {
  CategoryProductSection,
  ProductListItem,
} from '../types/product-list-item.type';
import { ProductFilterDto, ProductFilterSort } from '../dto/product-filter.dto';
import {
  ProductDetailAttribute,
  ProductDetailDto,
  ProductDetailImage,
  ProductDetailVariant,
} from '../dto/product-detail.dto';
import { ProductImageEntity } from '../entities/product-image.entity';
import { ProductVariantEntity } from '../entities/product-variant.entity';
import { ProductVariantAttributeEntity } from '../entities/product-variant-attribute.entity';
import { AttributeValueEntity } from '../entities/attribute-value.entity';
import { AttributeEntity } from '../entities/attribute.entity';
import { WarehouseEntity } from '../entities/warehouse.entity';
import { InventoryEntity } from '../entities/inventory.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,

    @InjectRepository(ProductVariantEntity)
    private readonly productVariantRepository: Repository<ProductVariantEntity>,

    @InjectRepository(ProductVariantAttributeEntity)
    private readonly productVariantAttributeRepository: Repository<ProductVariantAttributeEntity>,
  ) {}

  async getFlashSaleProducts(limit = 15): Promise<CategoryProductSection[]> {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .innerJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',

        'c.id AS categoryId',
        'c.name AS categoryName',
        'c.slug AS categorySlug',

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

        '1 AS isDiscounted',
      ])

      .where('p.status = :status', {
        status: 'ACTIVE',
      })

      .andWhere('p.deleted_at IS NULL')

      .andWhere(
        `
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
      `,
      )
      .andWhere(
        `
      (
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

        OR

        EXISTS (
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
      )
      `,
      )

      .orderBy('COALESCE(ps.sold_quantity, 0)', 'DESC')
      .addOrderBy('COALESCE(ps.rating_average, 0)', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<
      ProductListItem & {
        categoryId: number;
        categoryName: string;
        categorySlug: string;
      }
    >();

    const categoryMap = new Map<number, CategoryProductSection>();

    for (const row of rows) {
      if (!categoryMap.has(row.categoryId)) {
        categoryMap.set(row.categoryId, {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          categorySlug: row.categorySlug,
          products: [],
        });
      }

      categoryMap.get(row.categoryId)!.products.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        imageUrl: row.imageUrl,
        price: Number(row.price),
        soldQuantity: Number(row.soldQuantity),
        reviewCount: Number(row.reviewCount),
        ratingAverage: Number(row.ratingAverage),
        favoriteCount: Number(row.favoriteCount),
        isDiscounted: Boolean(Number(row.isDiscounted)),
      });
    }

    return Array.from(categoryMap.values());
  }

  async getBestSellingProducts(limit = 15): Promise<CategoryProductSection[]> {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .innerJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',

        'c.id AS categoryId',
        'c.name AS categoryName',
        'c.slug AS categorySlug',

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

      .where('p.status = :status', {
        status: 'ACTIVE',
      })

      .andWhere('p.deleted_at IS NULL')

      .andWhere(
        `
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
      `,
      )

      .orderBy('COALESCE(ps.sold_quantity, 0)', 'DESC')
      .addOrderBy('COALESCE(ps.rating_average, 0)', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<
      ProductListItem & {
        categoryId: number;
        categoryName: string;
        categorySlug: string;
      }
    >();

    const categoryMap = new Map<number, CategoryProductSection>();

    for (const row of rows) {
      if (!categoryMap.has(row.categoryId)) {
        categoryMap.set(row.categoryId, {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          categorySlug: row.categorySlug,
          products: [],
        });
      }

      categoryMap.get(row.categoryId)!.products.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        imageUrl: row.imageUrl,
        price: Number(row.price),
        soldQuantity: Number(row.soldQuantity),
        reviewCount: Number(row.reviewCount),
        ratingAverage: Number(row.ratingAverage),
        favoriteCount: Number(row.favoriteCount),
        isDiscounted: Boolean(Number(row.isDiscounted)),
      });
    }

    return Array.from(categoryMap.values());
  }

  async getNewProducts(limit = 15): Promise<CategoryProductSection[]> {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .innerJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',

        'c.id AS categoryId',
        'c.name AS categoryName',
        'c.slug AS categorySlug',

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

      .where('p.status = :status', {
        status: 'ACTIVE',
      })
      .andWhere('p.deleted_at IS NULL')

      .andWhere(
        `
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
      `,
      )

      .orderBy('p.created_at', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<
      ProductListItem & {
        categoryId: number;
        categoryName: string;
        categorySlug: string;
      }
    >();

    const categoryMap = new Map<number, CategoryProductSection>();

    for (const row of rows) {
      if (!categoryMap.has(row.categoryId)) {
        categoryMap.set(row.categoryId, {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          categorySlug: row.categorySlug,
          products: [],
        });
      }

      categoryMap.get(row.categoryId)!.products.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        imageUrl: row.imageUrl,
        price: Number(row.price),
        soldQuantity: Number(row.soldQuantity),
        reviewCount: Number(row.reviewCount),
        ratingAverage: Number(row.ratingAverage),
        favoriteCount: Number(row.favoriteCount),
        isDiscounted: Boolean(Number(row.isDiscounted)),
      });
    }

    return Array.from(categoryMap.values());
  }

  async getProductsByCategoryId(
    categoryId: number,
    limit = 15,
  ): Promise<ProductListItem[]> {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',

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
            AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
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
            AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
        )
        THEN 1
        ELSE 0
      END AS isDiscounted
      `,
      ])

      .where('p.category_id = :categoryId', {
        categoryId,
      })
      .andWhere('p.status = :status', {
        status: 'ACTIVE',
      })
      .andWhere('p.deleted_at IS NULL')

      .andWhere(
        `
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
    `,
      )

      .orderBy(
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
            AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
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
            AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
        )
        THEN 0
        ELSE 1
      END
      `,
        'ASC',
      )
      .addOrderBy('COALESCE(ps.sold_quantity, 0)', 'DESC')
      .addOrderBy('COALESCE(ps.rating_average, 0)', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
      .addOrderBy('p.id', 'DESC')
      .limit(limit);

    return qb.getRawMany<ProductListItem>();
  }

  async getProductsByCategories(
    limitPerCategory = 15,
  ): Promise<CategoryProductSection[]> {
    const rankedQuery = this.productRepository
      .createQueryBuilder('p')
      .innerJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',

        'c.id AS categoryId',
        'c.name AS categoryName',
        'c.slug AS categorySlug',

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

        `
      ROW_NUMBER() OVER (
        PARTITION BY p.category_id

        ORDER BY
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
            THEN 0
            ELSE 1
          END ASC,

          COALESCE(ps.sold_quantity, 0) DESC,
          COALESCE(ps.rating_average, 0) DESC,
          p.created_at DESC,
          p.id DESC
      ) AS rowNumber
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
    `);

    const rankedSql = rankedQuery.getQuery();

    const rows = await this.productRepository.manager
      .createQueryBuilder()
      .select('*')
      .from(`(${rankedSql})`, 'ranked')
      .where('ranked.rowNumber <= :limitPerCategory', {
        limitPerCategory,
      })
      .setParameters(rankedQuery.getParameters())
      .orderBy('ranked.categoryId', 'ASC')
      .addOrderBy('ranked.rowNumber', 'ASC')
      .getRawMany<
        ProductListItem & {
          categoryId: number;
          categoryName: string;
          categorySlug: string;
          rowNumber: number;
        }
      >();

    const categoryMap = new Map<number, CategoryProductSection>();

    for (const row of rows) {
      const categoryId = Number(row.categoryId);

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: row.categoryName,
          categorySlug: row.categorySlug,
          products: [],
        });
      }

      categoryMap.get(categoryId)!.products.push({
        id: Number(row.id),
        name: row.name,
        slug: row.slug,
        imageUrl: row.imageUrl,
        price: Number(row.price),
        soldQuantity: Number(row.soldQuantity),
        reviewCount: Number(row.reviewCount),
        ratingAverage: Number(row.ratingAverage),
        favoriteCount: Number(row.favoriteCount),
        isDiscounted: Boolean(Number(row.isDiscounted)),
      });
    }

    return Array.from(categoryMap.values());
  }

  async getProductsForSearchIndex(): Promise<ProductSearchDocument[]> {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .innerJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .leftJoin(BrandEntity, 'b', 'b.id = p.brand_id')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',
        'p.description AS description',

        'p.category_id AS categoryId',
        'c.name AS categoryName',

        'p.brand_id AS brandId',
        'b.name AS brandName',

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
          AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
      ) AS isDiscounted
      `,

        'p.status AS status',
        'p.created_at AS createdAt',
      ])
      .where('p.status = :status', {
        status: 'ACTIVE',
      })
      .andWhere('p.deleted_at IS NULL');

    return qb.getRawMany<ProductSearchDocument>();
  }
  async filterProducts(dto: ProductFilterDto): Promise<{
    items: ProductListItem[];
  }> {
    const priceSql = `(
    SELECT MIN(pv.price)
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND pv.status = 'ACTIVE'
      AND pv.deleted_at IS NULL
  )`;

    const discountSql = `(
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
        AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
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
        AND pr.promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')
    )
  )`;

    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('p.slug', 'slug')
      .addSelect(
        `(
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
          AND pi.is_primary = TRUE
        ORDER BY pi.id ASC
        LIMIT 1
      )`,
        'imageUrl',
      )
      .addSelect(priceSql, 'price')
      .addSelect('COALESCE(ps.sold_quantity, 0)', 'soldQuantity')
      .addSelect('COALESCE(ps.review_count, 0)', 'reviewCount')
      .addSelect('COALESCE(ps.rating_average, 0)', 'ratingAverage')
      .addSelect('COALESCE(ps.favorite_count, 0)', 'favoriteCount')
      .addSelect(`CASE WHEN ${discountSql} THEN 1 ELSE 0 END`, 'isDiscounted')
      .where('p.status = :status', { status: 'ACTIVE' })
      .andWhere('p.deleted_at IS NULL')
      .andWhere(`${priceSql} IS NOT NULL`).andWhere(`
      EXISTS (
        SELECT 1
        FROM product_variants pv
        INNER JOIN inventories i ON i.variant_id = pv.id
        WHERE pv.product_id = p.id
          AND pv.status = 'ACTIVE'
          AND pv.deleted_at IS NULL
          AND i.available_quantity > 0
      )
    `);

    // Tìm kiếm theo tên sản phẩm.
    if (dto.q) {
      qb.andWhere('p.name LIKE :keyword', {
        keyword: `%${dto.q}%`,
      });
    }

    // Lọc theo danh mục.
    if (dto.categoryId !== undefined) {
      qb.andWhere('p.category_id = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    // Đếm tổng số sản phẩm sau khi lọc, trước phân trang.
    const total = await qb.clone().getCount();

    // Sắp xếp.
    switch (dto.sort ?? ProductFilterSort.POPULAR) {
      case ProductFilterSort.FEATURED:
        qb.orderBy('p.is_featured', 'DESC')
          .addOrderBy('COALESCE(ps.sold_quantity, 0)', 'DESC')
          .addOrderBy('COALESCE(ps.rating_average, 0)', 'DESC')
          .addOrderBy('p.created_at', 'DESC');
        break;

      case ProductFilterSort.RELEVANCE:
        if (dto.q?.trim()) {
          qb.orderBy(
            `CASE
          WHEN p.name LIKE :prefixKeyword THEN 0
          ELSE 1
        END`,
            'ASC',
          ).setParameter('prefixKeyword', `${dto.q.trim()}%`);
        } else {
          qb.orderBy('COALESCE(ps.sold_quantity, 0)', 'DESC');
        }
        break;

      case ProductFilterSort.NEWEST:
        qb.orderBy('p.created_at', 'DESC');
        break;

      case ProductFilterSort.DISCOUNT_DESC:
        qb.orderBy('isDiscounted', 'DESC').addOrderBy(
          'COALESCE(ps.sold_quantity, 0)',
          'DESC',
        );
        break;

      case ProductFilterSort.PRICE_ASC:
        qb.orderBy(priceSql, 'ASC');
        break;

      case ProductFilterSort.PRICE_DESC:
        qb.orderBy(priceSql, 'DESC');
        break;

      case ProductFilterSort.POPULAR:
      default:
        qb.orderBy('COALESCE(ps.sold_quantity, 0)', 'DESC')
          .addOrderBy('COALESCE(ps.rating_average, 0)', 'DESC')
          .addOrderBy('p.created_at', 'DESC');
        break;
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;

    const rows = await qb
      .addOrderBy('p.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<ProductListItem>();

    const items: ProductListItem[] = rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      imageUrl: row.imageUrl ?? null,
      price: Number(row.price),
      soldQuantity: Number(row.soldQuantity),
      reviewCount: Number(row.reviewCount),
      ratingAverage: Number(row.ratingAverage),
      favoriteCount: Number(row.favoriteCount),
      isDiscounted: Boolean(Number(row.isDiscounted)),
    }));

    return {
      items,
    };
  }

  async findDetailBySlug(slug: string): Promise<ProductDetailDto | null> {
    const row = await this.productRepository
      .createQueryBuilder('p')
      .innerJoin(
        CategoryEntity,
        'c',
        `c.id = p.category_id
         AND c.status = :categoryStatus`,
        { categoryStatus: 'ACTIVE' },
      )
      .leftJoin(
        BrandEntity,
        'b',
        `b.id = p.brand_id
         AND b.status = :brandStatus
         AND b.deleted_at IS NULL`,
        { brandStatus: 'ACTIVE' },
      )
      .leftJoin(ProductStatisticsEntity, 'ps', 'ps.product_id = p.id')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.slug AS slug',
        'p.description AS description',
        'p.is_featured AS isFeatured',
        'p.created_at AS createdAt',
        'p.updated_at AS updatedAt',

        'c.id AS categoryId',
        'c.name AS categoryName',
        'c.slug AS categorySlug',

        'b.id AS brandId',
        'b.name AS brandName',
        'b.slug AS brandSlug',
        'b.logo_url AS brandLogoUrl',

        'COALESCE(ps.sold_quantity, 0) AS soldQuantity',
        'COALESCE(ps.buyer_count, 0) AS buyerCount',
        'COALESCE(ps.review_count, 0) AS reviewCount',
        'COALESCE(ps.rating_average, 0) AS ratingAverage',
        'COALESCE(ps.favorite_count, 0) AS favoriteCount',
      ])
      .where('p.slug = :slug', { slug })
      .andWhere('p.status = :productStatus', {
        productStatus: 'ACTIVE',
      })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne<Record<string, any>>();

    if (!row) {
      return null;
    }

    const productId = row.id;

    // 2. Lấy danh sách ảnh.
    const imageRows = await this.productImageRepository
      .createQueryBuilder('pi')
      .select([
        'pi.id AS id',
        'pi.image_url AS imageUrl',
        'pi.alt_text AS altText',
        'pi.sort_order AS sortOrder',
        'pi.is_primary AS isPrimary',
      ])
      .where('pi.product_id = :productId', { productId })
      .orderBy('pi.is_primary', 'DESC')
      .addOrderBy('pi.sort_order', 'ASC')
      .addOrderBy('pi.id', 'ASC')
      .getRawMany<Record<string, any>>();

    const images: ProductDetailImage[] = imageRows.map((image) => ({
      id: String(image.id),
      imageUrl: image.imageUrl,
      altText: image.altText,
      sortOrder: Number(image.sortOrder),
      isPrimary: Number(image.isPrimary) === 1,
    }));

    // 3. Lấy các biến thể và tồn kho tại kho đang hoạt động.
    const variantRows = await this.productVariantRepository
      .createQueryBuilder('pv')
      .leftJoin(InventoryEntity, 'i', 'i.variant_id = pv.id')
      .leftJoin(
        WarehouseEntity,
        'w',
        `w.id = i.warehouse_id
         AND w.status = :warehouseStatus
         AND w.deleted_at IS NULL`,
        { warehouseStatus: 'ACTIVE' },
      )
      .select([
        'pv.id AS id',
        'pv.sku AS sku',
        'pv.price AS price',
        'pv.compare_at_price AS compareAtPrice',
        'pv.weight_grams AS weightGrams',
      ])
      .addSelect(
        `COALESCE(
          SUM(
            CASE
              WHEN w.id IS NOT NULL
              THEN i.available_quantity
              ELSE 0
            END
          ),
          0
        )`,
        'availableQuantity',
      )
      .where('pv.product_id = :productId', { productId })
      .andWhere('pv.status = :variantStatus', {
        variantStatus: 'ACTIVE',
      })
      .andWhere('pv.deleted_at IS NULL')
      .groupBy('pv.id')
      .addGroupBy('pv.sku')
      .addGroupBy('pv.price')
      .addGroupBy('pv.compare_at_price')
      .addGroupBy('pv.weight_grams')
      .orderBy('pv.id', 'ASC')
      .getRawMany<Record<string, any>>();

    // 4. Lấy thuộc tính của tất cả biến thể trong một truy vấn.
    const attributeRows =
      variantRows.length > 0
        ? await this.productVariantAttributeRepository
            .createQueryBuilder('pva')
            .innerJoin(
              AttributeValueEntity,
              'av',
              'av.id = pva.attribute_value_id',
            )
            .innerJoin(AttributeEntity, 'a', 'a.id = av.attribute_id')
            .innerJoin(ProductVariantEntity, 'pv', 'pv.id = pva.variant_id')
            .select([
              'pva.variant_id AS variantId',
              'a.id AS attributeId',
              'a.name AS attributeName',
              'a.code AS attributeCode',
              'a.type AS attributeType',
              'av.id AS valueId',
              'av.value AS value',
              'av.color_hex AS colorHex',
            ])
            .where('pv.product_id = :productId', {
              productId,
            })
            .andWhere('pv.status = :variantStatus', {
              variantStatus: 'ACTIVE',
            })
            .andWhere('pv.deleted_at IS NULL')
            .orderBy('pv.id', 'ASC')
            .addOrderBy('a.id', 'ASC')
            .addOrderBy('av.sort_order', 'ASC')
            .addOrderBy('av.id', 'ASC')
            .getRawMany<Record<string, any>>()
        : [];

    // 5. Gom thuộc tính theo variant ID.
    const attributesByVariant = new Map<string, ProductDetailAttribute[]>();

    for (const item of attributeRows) {
      const variantId = String(item.variantId);

      const attributes = attributesByVariant.get(variantId) ?? [];

      attributes.push({
        id: String(item.attributeId),
        name: item.attributeName,
        code: item.attributeCode,
        type: item.attributeType,
        valueId: String(item.valueId),
        value: item.value,
        colorHex: item.colorHex,
      });

      attributesByVariant.set(variantId, attributes);
    }

    // 6. Ánh xạ danh sách biến thể.
    const variants: ProductDetailVariant[] = variantRows.map((variant) => ({
      id: String(variant.id),
      sku: variant.sku,
      price: String(variant.price),

      compareAtPrice:
        variant.compareAtPrice == null ? null : String(variant.compareAtPrice),

      weightGrams:
        variant.weightGrams == null ? null : Number(variant.weightGrams),

      availableQuantity: Number(variant.availableQuantity),

      attributes: attributesByVariant.get(String(variant.id)) ?? [],
    }));

    // 7. Trả dữ liệu theo ProductDetailDto.
    return {
      id: String(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
      isFeatured: Number(row.isFeatured) === 1,

      category: {
        id: String(row.categoryId),
        name: row.categoryName,
        slug: row.categorySlug,
      },

      brand:
        row.brandId == null
          ? null
          : {
              id: String(row.brandId),
              name: row.brandName,
              slug: row.brandSlug,
              logoUrl: row.brandLogoUrl,
            },

      images,
      variants,

      statistics: {
        soldQuantity: String(row.soldQuantity),
        buyerCount: String(row.buyerCount),
        reviewCount: String(row.reviewCount),
        ratingAverage: String(row.ratingAverage),
        favoriteCount: String(row.favoriteCount),
      },

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
