import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PostgresFactory {
  private client: Client | null = null;

  async get() {
    if (this.client === null) {
      this.client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await this.client.connect();
    }

    return this.client;
  }
}
