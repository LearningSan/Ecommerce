import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cart-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { AuthModule } from '../auth/auth.module';
import { OptionalUserJwtGuard } from '../auth/guards/optional-user-jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity]),AuthModule],
  providers: [CartService, CartRepository, CartItemRepository,OptionalUserJwtGuard],
  controllers: [CartController],
})
export class CartModule {}
