import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';

import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartService } from '../services/cart.service';
import { CartOwner } from '../repositories/cart.repository';
import { OptionalUserJwtGuard } from '../../auth/guards/optional-user-jwt.guard';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
interface CartRequest extends Request {
  user?: {
    sub: string | number;
    sessionId: string | number;
  };
}

@Controller('cart')
@UseGuards(OptionalUserJwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private createGuestSession(response: Response): string {
    const sessionId = randomBytes(32).toString('hex');

    response.cookie('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sessionId;
  }

  private getOwner(request: CartRequest): CartOwner {
    return {
      userId: request.user ? String(request.user.sub) : null,
      sessionId: request.user ? null : (request.cookies?.cart_session ?? null),
    };
  }

  private async mergeGuestCartIfNeeded(
    request: CartRequest,
    response: Response,
  ): Promise<void> {
    // Chưa đăng nhập: tiếp tục sử dụng giỏ khách.
    if (!request.user) {
      return;
    }

    const sessionId = request.cookies?.cart_session;

    if (!sessionId) {
      return;
    }

    // Chuyển sản phẩm từ giỏ khách sang giỏ tài khoản.
    await this.cartService.mergeGuestCart(String(request.user.sub), sessionId);

    // Chỉ xóa cookie sau khi gộp thành công.
    response.clearCookie('cart_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  @Get()
  async getCart(
    @Req() request: CartRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.mergeGuestCartIfNeeded(request, response);

    return this.cartService.getCart(this.getOwner(request));
  }

  @Post('items')
  async addItem(
    @Req() request: CartRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() dto: AddCartItemDto,
  ) {
    await this.mergeGuestCartIfNeeded(request, response);

    const owner = this.getOwner(request);

    if (!owner.userId && !owner.sessionId) {
      owner.sessionId = this.createGuestSession(response);
    }

    if (!owner.userId && !owner.sessionId) {
      throw new BadRequestException('Không xác định được giỏ hàng.');
    }

    return this.cartService.addItem(owner, dto);
  }
  @Patch('items/:itemId')
  updateItem(
    @Req() request: CartRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      this.getOwner(request),
      itemId,
      dto.quantity,
    );
  }

  @Delete('items/:itemId')
  removeItem(@Req() request: CartRequest, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(this.getOwner(request), itemId);
  }
}
