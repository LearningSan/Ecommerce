import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>('ELASTICSEARCH_NODE');

    if (!node) {
      throw new Error('ELASTICSEARCH_NODE is not configured');
    }

    this.client = new Client({
      node,
    });
  }

  async onModuleInit() {
    const health = await this.client.cluster.health();

    console.log(`[Elasticsearch] connected - status: ${health.status}`);
  }

  getClient(): Client {
    return this.client;
  }
}
