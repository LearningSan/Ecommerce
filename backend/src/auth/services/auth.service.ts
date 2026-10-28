import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserJwtConfig } from '../config/user-jwt.config';
import { UserLoginDto } from '../dto/user-login.dto';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { randomBytes, randomUUID } from 'crypto';
import { UserRegisterDto } from '../dto/user-register.dto';
import { EmailVerificationService } from '../../email-verification/services/email-verification.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { EmailQueueService } from '../../common/queue/queues/email.queue';
import { DataSource } from 'typeorm';
import { ResendVerificationDto } from '../dto/resend-email.dto';
import { OAuthAccountRepository } from '../repositories/user-oauth-account.repository';
import { GoogleProfile } from '../dto/google-profile.dto';
import { UserEntity, UserStatus } from '../../users/entities/user.entity';
import { FacebookProfile } from '../dto/facebook-profile.dto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class AuthService {
  private readonly MAX_FAILED_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 5;
  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }
  private getRefreshTokenExpirationDate(): Date {
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    return expiresAt;
  }
  constructor(
    private readonly googleClient: OAuth2Client,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailQueueService: EmailQueueService,
    private readonly jwtService: JwtService,
    private readonly userJwtConfig: UserJwtConfig,
    private readonly dataSource: DataSource,
  ) {}
  async login(dto: UserLoginDto) {
    const user = await this.userRepository.findUserForLogin(dto.identifier);
    if (!user) {
      throw new UnauthorizedException('Email/ SDT khong chinh xac');
    }
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Tài khoản bi khoa');
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản không hoạt động');
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      const remainingMilliseconds = user.lockedUntil.getTime() - now.getTime();

      const remainingMinutes = Math.ceil(remainingMilliseconds / 60000);
      throw new UnauthorizedException(
        `Tài khoản đăng nhập quá nhiều vui lòng thử lại sau ${remainingMinutes} phút`,
      );
    }
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;

      if (failedLoginAttempts >= this.MAX_FAILED_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(
          now.getTime() + this.LOCK_DURATION_MINUTES * 60 * 1000,
        );

        await this.userRepository.lockUser(
          user.id,
          lockedUntil,
          failedLoginAttempts,
        );

        throw new UnauthorizedException(
          'Bạn đã nhập sai mật khẩu quá nhiều lần. Tài khoản bị tạm khóa 5 phút',
        );
      }

      await this.userRepository.updateFailedAttemps(
        user.id,
        failedLoginAttempts,
      );

      throw new UnauthorizedException(
        'Email/SĐT hoặc mật khẩu không chính xác',
      );
    }

    await this.userRepository.resetFailedAttemps(user.id);

    const authSession = await this.createAuthSession(user.id);

    return {
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async register(dto: UserRegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingEmail = await this.userRepository.findByEmail(email);

    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }
    let phone = '';

    if (dto.phone) {
      phone = dto.phone.trim();
      const existingPhone = await this.userRepository.findByPhone(phone);

      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.createUser(
        {
          name: dto.name,
          email,
          phone,
        },
        manager,
      );

      if (!user) {
        throw new InternalServerErrorException('Không thể tạo tài khoản');
      }

      await this.userRepository.createCredential(
        {
          userId: user.id,
          passwordHash,
        },
        manager,
      );

      const verificationToken =
        await this.emailVerificationService.createVerificationToken(
          user.id,
          manager,
        );

      return {
        user,
        verificationToken,
      };
    });

    await this.emailQueueService.addVerificationEmail({
      email: result.user.email,
      name: result.user.name,
      token: result.verificationToken,
    });

    return {
      message:
        'Đăng ký tài khoản thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
      },
    };
  }
  async resendVerificationEmail(dto: ResendVerificationDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new ConflictException('Không tìm thấy user');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email đã được xác thực');
    }

    const token = await this.emailVerificationService.resendVerificationToken(
      user.id,
    );

    await this.emailQueueService.addVerificationEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return {
      message: 'Đã gửi lại email xác thực. Vui lòng kiểm tra email.',
    };
  }
  private async createAuthSession(userId: number) {
    const tokenId = randomUUID();
    const secret = randomBytes(48).toString('hex');

    const refreshToken = `${tokenId}.${secret}`;

    const refreshTokenHash = await bcrypt.hash(secret, 12);

    const expiresAt = this.getRefreshTokenExpirationDate();

    const refreshTokenRecord = await this.refreshTokenRepository.create({
      userId,
      tokenId,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    const session = await this.userSessionRepository.create({
      userId,
      refreshTokenId: refreshTokenRecord.id,
      expiresAt,
    });

    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        sessionId: session.id,
      },
      {
        secret: this.userJwtConfig.secret,
        expiresIn: this.userJwtConfig.expiresIn,
      },
    );

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }
  async getGoogleAuthorizationUrl(): Promise<string> {
    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
    });
  }
  async getGoogleProfile(code: string): Promise<GoogleProfile> {
    const { tokens } = await this.googleClient.getToken(code);

    if (!tokens.id_token) {
      throw new UnauthorizedException('Google did not return an ID token');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Google account ID is missing');
    }

    if (!payload.email) {
      throw new UnauthorizedException('Google email is missing');
    }

    return {
      providerAccountId: payload.sub,
      email: payload.email,
      name: payload.name ?? '',
      picture: payload.picture ?? null,
      emailVerified: payload.email_verified === true,
    };
  }
  async loginWithGoogle(profile: GoogleProfile) {
    if (!profile.emailVerified) {
      throw new ForbiddenException('Google email is not verified');
    }

    const email = profile.email.trim().toLowerCase();

    const oauthAccount =
      await this.oauthAccountRepository.findByProviderAccount(
        'GOOGLE',
        profile.providerAccountId,
      );

    let user: UserEntity | null;

    if (oauthAccount) {
      if (oauthAccount.status !== 'ACTIVE') {
        throw new ForbiddenException(
          'Google login is disabled for this account',
        );
      }

      user = await this.userRepository.findByUserId(oauthAccount.userId);

      if (!user) {
        throw new UnauthorizedException('User account not found');
      }

      if (user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Tài khoản bị khóa');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Tài khoản không hoạt động');
      }

      await this.oauthAccountRepository.updateLastLogin(oauthAccount.id);
    } else {
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        if (existingUser.status === UserStatus.BANNED) {
          throw new UnauthorizedException('Tài khoản bị khóa');
        }

        if (existingUser.status !== UserStatus.ACTIVE) {
          throw new UnauthorizedException('Tài khoản không hoạt động');
        }

        user = existingUser;

        await this.oauthAccountRepository.create({
          userId: user.id,
          provider: 'GOOGLE',
          providerAccountId: profile.providerAccountId,
          providerEmail: email,
        });
      } else {
        user = await this.userRepository.createUser({
          name: profile.name || email,
          email,
          phone: null,
          avatarUrl: profile.picture,
          emailVerifiedAt: new Date(),
        });

        await this.oauthAccountRepository.create({
          userId: user.id,
          provider: 'GOOGLE',
          providerAccountId: profile.providerAccountId,
          providerEmail: email,
        });
      }
    }

    // ==========================================
    // Tạo session
    // ==========================================
    const authSession = await this.createAuthSession(user.id);

    return {
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async getFacebookAuthorizationUrl(): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      redirect_uri: this.configService.getOrThrow<string>(
        'FACEBOOK_CALLBACK_URL',
      ),
      scope: 'email,public_profile',
    });

    return `https://www.facebook.com/${process.env.FACEBOOK_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
  }
  async getFacebookProfile(code: string): Promise<FacebookProfile> {
    const appId = this.configService.getOrThrow<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.getOrThrow<string>(
      'FACEBOOK_APP_SECRET',
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'FACEBOOK_CALLBACK_URL',
    );
    const graphApiVersion = this.configService.getOrThrow<string>(
      'FACEBOOK_GRAPH_API_VERSION',
    );
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });
    const tokenResponse = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/oauth/access_token?${tokenParams.toString()}`,
    );
    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('🔥 FACEBOOK TOKEN ERROR');
      console.error('status:', tokenResponse.status);
      console.error('body:', errorBody);
      throw new UnauthorizedException('Failed to get Facebook access token');
    }
    const tokenData: {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
    } = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('Facebook access token is missing');
    }
    const profileParams = new URLSearchParams({
      fields: 'id,name,email,picture.type(large)',
      access_token: accessToken,
    });
    const profileResponse = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/me?${profileParams.toString()}`,
    );
    if (!profileResponse.ok) {
      const errorBody = await profileResponse.text();
      console.error('🔥 FACEBOOK PROFILE ERROR');
      console.error('status:', profileResponse.status);
      console.error('body:', errorBody);
      throw new UnauthorizedException('Failed to get Facebook profile');
    }
    const profile: {
      id?: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    } = await profileResponse.json();
    if (!profile.id) {
      throw new UnauthorizedException('Facebook account ID is missing');
    }
    if (!profile.email) {
      throw new UnauthorizedException('Facebook email is missing');
    }
    return {
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name ?? '',
      picture: profile.picture?.data?.url ?? null,
    };
  }

  async loginWithFacebook(profile: FacebookProfile) {
    const email = profile.email.trim().toLowerCase();

    const oauthAccount =
      await this.oauthAccountRepository.findByProviderAccount(
        'FACEBOOK',
        profile.providerAccountId,
      );

    let user: UserEntity | null;

    if (oauthAccount) {
      if (oauthAccount.status !== 'ACTIVE') {
        throw new ForbiddenException(
          'Facebook login is disabled for this account',
        );
      }

      user = await this.userRepository.findByUserId(oauthAccount.userId);

      if (!user) {
        throw new UnauthorizedException('User account not found');
      }

      if (user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Tài khoản bị khóa');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Tài khoản không hoạt động');
      }

      await this.oauthAccountRepository.updateLastLogin(oauthAccount.id);
    } else {
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        if (existingUser.status === UserStatus.BANNED) {
          throw new UnauthorizedException('Tài khoản bị khóa');
        }

        if (existingUser.status !== UserStatus.ACTIVE) {
          throw new UnauthorizedException('Tài khoản không hoạt động');
        }

        user = existingUser;

        await this.oauthAccountRepository.create({
          userId: user.id,
          provider: 'FACEBOOK',
          providerAccountId: profile.providerAccountId,
          providerEmail: email,
        });
      } else {
        user = await this.userRepository.createUser({
          name: profile.name || email,
          email,
          phone: null,
          avatarUrl: profile.picture,
          emailVerifiedAt: null,
        });

        await this.oauthAccountRepository.create({
          userId: user.id,
          provider: 'FACEBOOK',
          providerAccountId: profile.providerAccountId,
          providerEmail: email,
        });
      }
    }
    const authSession = await this.createAuthSession(user.id);

    return {
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      avatarUrl: string | null;
    };
  }> {
    const separatorIndex = refreshToken.indexOf('.');
    if (separatorIndex === -1) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokenId = refreshToken.slice(0, separatorIndex);
    const secret = refreshToken.slice(separatorIndex + 1);
    if (!tokenId || !secret) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const refreshTokenRecord =
      await this.refreshTokenRepository.findByTokenId(tokenId);
    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (refreshTokenRecord.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    if (refreshTokenRecord.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    const isValid = await bcrypt.compare(secret, refreshTokenRecord.tokenHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const session = await this.userSessionRepository.findByRefreshTokenId(
      refreshTokenRecord.id,
    );
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked');
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }
    const user = await this.userRepository.findByUserId(session.userId);
    if (!user) {
      throw new UnauthorizedException('User account not found');
    }
    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Tài khoản bị khóa');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản không hoạt động');
    }
    const newTokenId = randomUUID();
    const newSecret = randomBytes(48).toString('hex');
    const newRefreshToken = `${newTokenId}.${newSecret}`;
    const newRefreshTokenHash = await bcrypt.hash(newSecret, 12);
    const newRefreshTokenRecord = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenId: newTokenId,
      tokenHash: newRefreshTokenHash,
      expiresAt: session.expiresAt,
    });
    await this.refreshTokenRepository.revoke(
      refreshTokenRecord.id,
      newRefreshTokenRecord.id,
    );
    await this.userSessionRepository.updateRefreshTokenId(
      session.id,
      newRefreshTokenRecord.id,
    );
    const accessToken = this.jwtService.sign(
      { sub: user.id, sessionId: session.id },
      {
        secret: this.userJwtConfig.secret,
        expiresIn: this.userJwtConfig.expiresIn,
      },
    );

    await this.userSessionRepository.updateLastUsedAt(session.id);
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    };
  }
  async getMe(userId: number) {
    const user = await this.userRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }
}
