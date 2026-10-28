import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalUserJwtGuard extends AuthGuard('user-jwt') {
  handleRequest<TUser = { sub: number; sessionId: number }>(
    err: unknown,
    user: TUser | false | null,
    info: { message?: string } | undefined,
    context: ExecutionContext,
  ): TUser | null {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Access token không hợp lệ hoặc đã hết hạn.',
        )
      );
    }

    return user;
  }
}
