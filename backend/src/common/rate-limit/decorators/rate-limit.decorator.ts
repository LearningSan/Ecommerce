import { SetMetadata } from '@nestjs/common';

import type { RateLimitPolicyName } from '../types/rate-limit.types';

export const RATE_LIMIT_POLICY_KEY =
  process.env.RATE_LIMIT_POLICY_KEY || 'rate_limit_policy';

export const RateLimit = (policy: RateLimitPolicyName) =>
  SetMetadata(RATE_LIMIT_POLICY_KEY, policy);
