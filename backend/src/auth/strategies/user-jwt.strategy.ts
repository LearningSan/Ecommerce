import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserJwtConfig } from '../config/user-jwt.config';

interface UserJwtPayload {
  sub: number;
  sessionId: number;
}

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(private readonly userJwtConfig: UserJwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userJwtConfig.secret,
    });
  }

  async validate(payload: UserJwtPayload) {
    return payload;
  }
}