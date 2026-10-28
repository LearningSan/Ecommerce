import { createHash } from 'crypto';

import type { Request } from 'express';

import type {
  RateLimitPolicyName,
  RateLimitRule,
} from '../types/rate-limit.types';

export interface RateLimitPolicyContext {
  request: Request;
  ip: string;
  scope: string;
}

interface RateLimitPolicyDefinition {
  createRules: (context: RateLimitPolicyContext) => RateLimitRule[];
}

export class RateLimitPolicy {
  private static readonly policies: Record<
    RateLimitPolicyName,
    RateLimitPolicyDefinition
  > = {
    // API thông thường
    global: {
      createRules: ({ ip }) => [
        {
          key: `rate_limit:global:ip:${ip}`,
          capacity: 100,
          refillPerSecond: 100 / 60,
          cost: 1,
        },
      ],
    },

    // Nhóm authentication
    auth: {
      createRules: ({ request, ip, scope }) => {
        const subject = this.getSubject(request);
        const subjectHash = this.hash(subject);

        return [
          {
            key: `rate_limit:auth:${scope}:ip:${ip}`,
            capacity: 20,
            refillPerSecond: 20 / 60,
            cost: 1,
          },
          {
            key: `rate_limit:auth:${scope}:subject:${subjectHash}`,
            capacity: 5,
            refillPerSecond: 5 / 60,
            cost: 1,
          },
          {
            key: `rate_limit:auth:${scope}:combo:${ip}:${subjectHash}`,
            capacity: 5,
            refillPerSecond: 5 / 60,
            cost: 1,
          },
        ];
      },
    },

    // Nhóm thao tác nhạy cảm
    sensitive: {
      createRules: ({ request, ip, scope }) => {
        const subject = this.getSubject(request);
        const subjectHash = this.hash(subject);

        return [
          {
            key: `rate_limit:sensitive:${scope}:ip:${ip}`,
            capacity: 10,
            refillPerSecond: 10 / 60,
            cost: 1,
          },
          {
            key: `rate_limit:sensitive:${scope}:subject:${subjectHash}`,
            capacity: 3,
            refillPerSecond: 3 / 60,
            cost: 1,
          },
          {
            key: `rate_limit:sensitive:${scope}:combo:${ip}:${subjectHash}`,
            capacity: 3,
            refillPerSecond: 3 / 60,
            cost: 1,
          },
        ];
      },
    },
  };

  static getRules(
    policyName: RateLimitPolicyName,
    context: RateLimitPolicyContext,
  ): RateLimitRule[] {
    const policy = this.policies[policyName];

    if (!policy) {
      throw new Error(`Unknown rate limit policy: ${policyName}`);
    }

    return policy.createRules(context);
  }

  private static getSubject(request: Request): string {
    const body = request.body as {
      email?: string;
      phone?: string;
      token?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const token = body.token?.trim();

    if (email) return email;
    if (phone) return phone;
    if (token) return token;

    const queryToken =
      typeof request.query.token === 'string'
        ? request.query.token.trim()
        : undefined;

    if (queryToken) return queryToken;

    return 'unknown';
  }

  private static hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
