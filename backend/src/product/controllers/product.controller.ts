import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ProductService } from '../services/product.service';
import { ProductSearchService } from '../services/product-search.service';
import { HomepageProductService } from '../services/homepage-product.service';

import { ProductSearchDto } from '../dto/product-search.dto';
import { HomepageProductDto } from '../dto/homepage-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productSearchService: ProductSearchService,
    private readonly homepageProductService: HomepageProductService,
  ) {}
  @Get('search')
  async searchProducts(@Query() dto: ProductSearchDto) {
    return this.productSearchService.searchProducts(dto);
  }

  @Post('search/reindex')
  async reindexProducts() {
    return this.productSearchService.reindexProducts();
  }
  @Get('flash-sale')
  async getFlashSaleProducts(
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
  ) {
    return this.productService.getFlashSaleProducts(limit ?? 15);
  }

  @Get('best-selling')
  async getBestSellingProducts(
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
  ) {
    return this.productService.getBestSellingProducts(limit ?? 15);
  }

  @Get('new')
  async getNewProducts(
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
  ) {
    return this.productService.getNewProducts(limit ?? 15);
  }

  @Get('category/:categoryId')
  async getProductsByCategoryId(
    @Param('categoryId', ParseIntPipe)
    categoryId: number,

    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
  ) {
    return this.productService.getProductsByCategoryId(categoryId, limit ?? 15);
  }

  @Get('categories')
  async getProductsByCategories(
    @Query('limitPerCategory', new ParseIntPipe({ optional: true }))
    limitPerCategory?: number,
  ) {
    return this.productService.getProductsByCategories(limitPerCategory ?? 15);
  }
  @Get('homepage')
  async getHomepageProducts(@Query() dto: HomepageProductDto) {
    return this.homepageProductService.getHomepageProducts(dto);
  }
  @Get('filter') async filterProducts(@Query() dto: ProductFilterDto) {
    return this.productService.filterProducts(dto);
  }
  @Get(':slug')
  getProductDetail(@Param('slug') slug: string) {
    return this.productService.getProductDetail(slug);
  }
}
