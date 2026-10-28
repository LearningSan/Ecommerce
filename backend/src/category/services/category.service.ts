import { Injectable } from '@nestjs/common';

import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(page = 1, limit = 20) {
    return this.categoryRepository.findAll(page, limit);
  }
}
