import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { ProductRepository } from './repositories/product.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductStatisticsEntity } from './entities/product-statistics.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { PromotionModule } from '../promotion/promotion.module';
import { CategoryModule } from '../category/category.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { ProductSearchService } from './services/product-search.service';
import { ProductIndexService } from './elasticsearch/product/product-index.service';
import { BrandEntity } from './entities/brand.entity';
import { HomepageProductRepository } from './repositories/homepage-product.repository';
import { HomepageProductService } from './services/homepage-product.service';
import { ProductVariantAttributeEntity } from './entities/product-variant-attribute.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { AttributeEntity } from './entities/attribute.entity';
import { AttributeValueEntity } from './entities/attribute-value.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { WarehouseEntity } from './entities/warehouse.entity';

@Module({
  imports: [
    PromotionModule,
    CategoryModule,
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductStatisticsEntity,
      ProductImageEntity,
      ProductVariantAttributeEntity,
      ProductVariantEntity,
      AttributeEntity,
      AttributeValueEntity,
      InventoryEntity,
      WarehouseEntity,
      BrandEntity
    ]),
    ElasticsearchModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ProductSearchService,
    ProductIndexService,
    HomepageProductRepository,
    HomepageProductService,
  ],
  exports: [ProductRepository, ProductService],
})
export class ProductModule {}
