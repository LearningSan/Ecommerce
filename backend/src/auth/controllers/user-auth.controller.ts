import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import type { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { UserLoginDto } from '../dto/user-login.dto';
import { UserRegisterDto } from '../dto/user-register.dto';
import { ResendVerificationDto } from '../dto/resend-email.dto';
import { RateLimit } from '../../common/rate-limit/decorators/rate-limit.decorator';
import { UserJwtGuard } from '../guards/user-jwt.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    sessionId: number;
  };
}

@Controller('auth/user')
export class UserAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @RateLimit('auth')
  async login(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Get('google')
  async googleLogin(@Res() response: Response) {
    const url = await this.authService.getGoogleAuthorizationUrl();

    return response.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() response: Response) {
    try {
      const profile = await this.authService.getGoogleProfile(code);

      const result = await this.authService.loginWithGoogle(profile);

      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return response.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    } catch (error) {
      console.error('Google callback error:', error);

      throw error;
    }
  }

  @Get('facebook')
  async facebookLogin(@Res() response: Response) {
    const url = await this.authService.getFacebookAuthorizationUrl();

    return response.redirect(url);
  }

  @Get('facebook/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Res() response: Response,
  ) {
    const profile = await this.authService.getFacebookProfile(code);

    const result = await this.authService.loginWithFacebook(profile);

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }

  @Post('register')
  @RateLimit('auth')
  async register(@Body() dto: UserRegisterDto) {
    return await this.authService.register(dto);
  }
  @Post('resend-verify-email')
  @RateLimit('auth')
  resend(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto);
  }
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }
  @Get('me')
  @UseGuards(UserJwtGuard)
  async getMe(@Req() request: AuthenticatedRequest) {
    return this.authService.getMe(request.user.sub);
  }
}
