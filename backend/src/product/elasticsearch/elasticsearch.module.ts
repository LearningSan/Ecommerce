import { Global, Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { ProductIndexService } from './product/product-index.service';
@Global()
@Module({
  providers: [ElasticsearchService, ProductIndexService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
