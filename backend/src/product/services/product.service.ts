import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ProductRepository } from '../repositories/product.repository';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getFlashSaleProducts(limit = 15) {
    this.validateLimit(limit);

    return this.productRepository.getFlashSaleProducts(limit);
  }

  async getBestSellingProducts(limit = 15) {
    this.validateLimit(limit);

    return this.productRepository.getBestSellingProducts(limit);
  }

  async getNewProducts(limit = 15) {
    this.validateLimit(limit);

    return this.productRepository.getNewProducts(limit);
  }

  async getProductsByCategoryId(categoryId: number, limit = 15) {
    this.validateCategoryId(categoryId);
    this.validateLimit(limit);

    return this.productRepository.getProductsByCategoryId(categoryId, limit);
  }

  async getProductsByCategories(limitPerCategory = 15) {
    this.validateLimit(limitPerCategory);

    return this.productRepository.getProductsByCategories(limitPerCategory);
  }


  private validateCategoryId(categoryId: number): void {
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      throw new BadRequestException('Category ID must be a positive integer');
    }
  }
  private validateLimit(limit: number): void {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('Limit phải nằm trong khoảng từ 1 đến 100');
    }
  }
  async filterProducts(dto: ProductFilterDto) {
    const { page = 1, limit = 12} = dto;
    this.validateLimit(limit);

    return this.productRepository.filterProducts({ ...dto, page, limit });
  }
  async getProductDetail(slug: string): Promise<ProductDetailDto> {
    // 1. Validate đầu vào
    if (typeof slug !== 'string') {
      throw new BadRequestException('Slug sản phẩm không hợp lệ');
    }

    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      throw new BadRequestException('Slug sản phẩm không được để trống');
    }

    if (normalizedSlug.length > 255) {
      throw new BadRequestException('Slug sản phẩm không được vượt quá 255 ký tự');
    }

    // 2. Truy vấn dữ liệu
    const product =
      await this.productRepository.findDetailBySlug(normalizedSlug);

    // 3. Validate kết quả nghiệp vụ
    if (!product) {
      throw new NotFoundException(
        'Không tìm thấy sản phẩm hoặc sản phẩm không còn khả dụng',
      );
    }

    // 4. Trả dữ liệu đã được Repository ánh xạ
    return product;
  }
}
