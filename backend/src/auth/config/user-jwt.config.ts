import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Injectable()
export class UserJwtConfig {
  constructor(private readonly configService: ConfigService) {}

  get secret(): string {
    return this.configService.getOrThrow<string>('USER_JWT_SECRET');
  }

  get expiresIn(): StringValue {
    return this.configService.get<StringValue>('USER_JWT_EXPIRES_IN', '15m');
  }
}
