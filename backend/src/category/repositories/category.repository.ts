import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity, CategoryStatus } from '../entities/category.entity';
import { PaginatedCategories } from '../types/category.type';



@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async findAll(page = 1, limit = 20): Promise<PaginatedCategories> {
    const skip = (page - 1) * limit;

    const query = this.repository
      .createQueryBuilder('category')
      .select(['category.id', 'category.name', 'category.slug','category.imageUrl'])
      .where('category.status = :status', {
        status: CategoryStatus.ACTIVE,
      })
      .orderBy('category.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
