import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { HomepageProductDto } from '../dto/homepage-product.dto';
import { HomepageProductRepository } from '../repositories/homepage-product.repository';
import { HomepageProductResponse } from '../types/homepage-product.type';

@Injectable()
export class HomepageProductService {
  constructor(
    private readonly homepageProductRepository: HomepageProductRepository,
  ) {}

  async getHomepageProducts(
    dto: HomepageProductDto,
  ): Promise<HomepageProductResponse> {
    const flashSaleLimit =
      dto.flashSaleLimit ?? 5;

    const bestSellingLimit =
      dto.bestSellingLimit ?? 5;

    const categoryLimitPerCategory =
      dto.categoryLimitPerCategory ?? 5;

    const newArrivalLimit =
      dto.newArrivalLimit ?? 5;

    this.validateLimit(flashSaleLimit);
    this.validateLimit(bestSellingLimit);
    this.validateLimit(categoryLimitPerCategory);
    this.validateLimit(newArrivalLimit);

    /**
     * --------------------------------------------------
     * 1. FLASH SALE
     * --------------------------------------------------
     */

    const flashSale =
      await this.homepageProductRepository
        .getFlashSaleProducts(
          flashSaleLimit,
        );

    const usedProductIds =
      new Set<number>(
        flashSale.map(
          (product) => product.id,
        ),
      );

    /**
     * --------------------------------------------------
     * 2. BEST SELLING
     * --------------------------------------------------
     */

    const bestSelling =
      await this.homepageProductRepository
        .getBestSellingProducts(
          bestSellingLimit,
          this.getExcludedIds(usedProductIds),
        );

    this.addProductIds(
      usedProductIds,
      bestSelling,
    );

    /**
     * --------------------------------------------------
     * 3. CATEGORY PRODUCTS
     * --------------------------------------------------
     *
     * Homepage currently uses these category IDs.
     *
     * Sau này nên lấy từ admin/homepage configuration
     * thay vì hard-code.
     */

    const categoryIds = [
      1,
      2,
      3,
      4,
      5,
    ];

    const categories =
      await this.homepageProductRepository
        .getCategoryProducts(
          categoryIds,
          categoryLimitPerCategory,
          this.getExcludedIds(usedProductIds),
        );

    for (const category of categories) {
      this.addProductIds(
        usedProductIds,
        category.products,
      );
    }

    /**
     * --------------------------------------------------
     * 4. NEW ARRIVALS
     * --------------------------------------------------
     */

    const newArrivals =
      await this.homepageProductRepository
        .getNewArrivalProducts(
          newArrivalLimit,
          this.getExcludedIds(usedProductIds),
        );

    return {
      flashSale,
      bestSelling,
      categories,
      newArrivals,
    };
  }

  private addProductIds(
    usedIds: Set<number>,
    products: {
      id: number;
    }[],
  ): void {
    for (const product of products) {
      usedIds.add(product.id);
    }
  }

  private getExcludedIds(
    usedIds: Set<number>,
  ): number[] {
    return Array.from(usedIds);
  }

  private validateLimit(limit: number): void {
    if (
      !Number.isInteger(limit) ||
      limit <= 0 ||
      limit > 20
    ) {
      throw new BadRequestException(
        'Limit must be between 1 and 20',
      );
    }
  }
}