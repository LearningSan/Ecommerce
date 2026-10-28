import { Injectable } from '@nestjs/common';

import { RedisService } from '../../redis/services/redis.service';

import type { RateLimitResult, RateLimitRule } from './types/rate-limit.types';

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async check(rules: RateLimitRule[]): Promise<RateLimitResult> {
    const redis = this.redisService.getClient();

    const keys = rules.map((rule) => rule.key);

    const args: string[] = [];

    for (const rule of rules) {
      args.push(
        String(rule.capacity),
        String(rule.refillPerSecond),
        String(rule.cost ?? 1),
      );
    }

    const idleTtlSeconds = 600;

    args.push(String(idleTtlSeconds));

    const script = `
      local now = redis.call('TIME')
      local nowMs = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)

      local allowed = 1
      local retryAfter = 0

      local states = {}

      local argIndex = 1

      for i = 1, #KEYS do
        local capacity = tonumber(ARGV[argIndex])
        local refillPerSecond = tonumber(ARGV[argIndex + 1])
        local cost = tonumber(ARGV[argIndex + 2])

        argIndex = argIndex + 3

        local data = redis.call('HMGET', KEYS[i], 'tokens', 'last_refill')

        local tokens = tonumber(data[1])
        local lastRefill = tonumber(data[2])

        if tokens == nil or lastRefill == nil then
          tokens = capacity
          lastRefill = nowMs
        else
          local elapsedMs = math.max(nowMs - lastRefill, 0)
          local refill = elapsedMs / 1000 * refillPerSecond

          tokens = math.min(capacity, tokens + refill)
        end

        states[i] = {
          capacity,
          refillPerSecond,
          cost,
          tokens
        }

        if tokens < cost then
          allowed = 0

          local missing = cost - tokens
          local seconds = missing / refillPerSecond
          local retry = math.ceil(seconds)

          if retry > retryAfter then
            retryAfter = retry
          end
        end
      end


      if allowed == 1 then
        for i = 1, #KEYS do
          local capacity = states[i][1]
          local refillPerSecond = states[i][2]
          local cost = states[i][3]
          local tokens = states[i][4]

          tokens = tokens - cost

          redis.call(
            'HSET',
            KEYS[i],
            'tokens',
            tokens,
            'last_refill',
            nowMs
          )

          local ttl = math.ceil(capacity / refillPerSecond) + ARGV[#ARGV]

          redis.call(
            'EXPIRE',
            KEYS[i],
            ttl
          )
        end
      end

      return {
        allowed,
        retryAfter
      }
    `;

    const result = (await redis.eval(
      script,
      keys.length,
      ...keys,
      ...args,
    )) as [number, number];

    const allowed = result[0] === 1;

    const retryAfter = Math.max(Number(result[1]), 0);

    const limits = await Promise.all(
      rules.map(async (rule) => {
        const data = await redis.hgetall(rule.key);

        const tokens = Number(data.tokens ?? rule.capacity);

        return {
          key: rule.key,
          capacity: rule.capacity,
          tokens,
          remaining: Math.max(Math.floor(tokens), 0),
        };
      }),
    );

    return {
      allowed,
      retryAfter,
      limits,
    };
  }
}
