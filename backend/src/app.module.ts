import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { RedisModule } from './redis/redis.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { QueueModule } from './common/queue/queue.module';
import { ProductModule } from './product/product.module';
import { PromotionModule } from './promotion/promotion.module';
import { CategoryModule } from './category/category.module';
import { ElasticsearchModule } from './product/elasticsearch/elasticsearch.module';
import { BannerModule } from './banner/banner.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    PasswordResetModule,
    RedisModule,
    RateLimitModule,
    QueueModule,
    ProductModule,
    PromotionModule,
    CategoryModule,
    ElasticsearchModule,
    BannerModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
