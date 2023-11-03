import { Injectable } from '@nestjs/common';
import { PostgresFactory } from '../postgres.factory';

@Injectable()
export class MaterialiseViewService {
  constructor(private readonly postgresFactory: PostgresFactory) {}

  async materialise(name: string, query: string) {
    const exists = await this.exists(name);
    if (!exists) {
      await this.create(name, query);
    }

    await this.refresh(name);
  }

  private async exists(name: string) {
    const client = await this.postgresFactory.get();
    const query = await client.query(
      `SELECT COUNT(*) FROM pg_matviews WHERE matviewname = '${name}'`,
    );

    return query.rows[0].count === '1';
  }

  private async create(name: string, query: string) {
    const client = await this.postgresFactory.get();
    const sql = `CREATE MATERIALIZED VIEW "${name}" AS ${query} WITH NO DATA`;
    console.log(sql);
    return client.query(sql);
  }

  private async refresh(name: string) {
    const client = await this.postgresFactory.get();
    return client.query(`REFRESH MATERIALIZED VIEW "${name}"`);
  }

  async deleteIfExists(name: string) {
    const client = await this.postgresFactory.get();
    return client.query(`DROP MATERIALIZED VIEW IF EXISTS "${name}"`);
  }
}
