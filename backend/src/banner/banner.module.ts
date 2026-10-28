import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerRepository } from './banner.repository';
import { BannerController } from './banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerEntity } from './banner.entity';

@Module({
  imports:[TypeOrmModule.forFeature([BannerEntity])],
  providers: [BannerService, BannerRepository],
  controllers: [BannerController]
})
export class BannerModule {}
