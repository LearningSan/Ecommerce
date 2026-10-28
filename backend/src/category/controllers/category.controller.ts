import { Controller, Get, Query } from '@nestjs/common';

import { CategoryService } from '../services/category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.categoryService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }
}
