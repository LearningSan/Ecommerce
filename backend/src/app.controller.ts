import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('db-test')
  async testDatabase() {
    await this.dataSource.query('SELECT 1');
    return {
      message: 'Kết nối MySQL thành công',
    };
  }
}
