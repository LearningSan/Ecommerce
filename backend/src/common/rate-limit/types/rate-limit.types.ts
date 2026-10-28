export interface RateLimitRule {
  key: string;

  capacity: number;

  refillPerSecond: number;

  cost?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;

  limits: Array<{
    key: string;
    capacity: number;
    tokens: number;
    remaining: number;
  }>;
}

export type RateLimitPolicyName =
  | 'global'
  | 'auth'
  | 'sensitive';

