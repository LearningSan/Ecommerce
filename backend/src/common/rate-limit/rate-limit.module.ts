import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Module({
  providers: [
    RateLimitService,

    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],

  exports: [RateLimitService],
})
export class RateLimitModule {}
