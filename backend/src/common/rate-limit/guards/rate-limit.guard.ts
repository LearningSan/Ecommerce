import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import type { Request } from 'express';

import { RateLimitService } from '../rate-limit.service';
import { RateLimitPolicy } from '../policies/rate-limit.policy';

import { RATE_LIMIT_POLICY_KEY } from '../decorators/rate-limit.decorator';

import type { RateLimitPolicyName } from '../types/rate-limit.types';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const policy =
      this.reflector.getAllAndOverride<RateLimitPolicyName>(
        RATE_LIMIT_POLICY_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? 'global';

    const ip = request.ip || request.socket.remoteAddress || 'unknown';

    const scope = `${context.getClass().name}:${context.getHandler().name}`;

    const rules = RateLimitPolicy.getRules(policy, {
      request,
      ip,
      scope,
    });

    const result = await this.rateLimitService.check(rules);

    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
