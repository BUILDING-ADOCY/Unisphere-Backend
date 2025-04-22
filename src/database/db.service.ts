// src/database/db.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, InternalServerErrorException, Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { registerTypes } from 'pgvector/pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DBService.name);
  private pool: Pool;

  async onModuleInit() {
    this.logger.log('Initializing Postgres pool…');
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // ensure pgvector extension
    try {
      await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
      this.logger.log('pgvector extension enabled');
    } catch (err) {
      this.logger.error('Could not enable pgvector extension', err.stack || err.message);
      throw new InternalServerErrorException('DB init failed');
    }

    // register vector types on every new client
    this.pool.on('connect', (client: PoolClient) => {
      try {
        registerTypes(client);
        this.logger.debug('pgvector types registered on client');
      } catch (e) {
        this.logger.error('pgvector.registerTypes failed', e.stack || e.message);
      }
    });
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Postgres pool');
    await this.pool.end();
  }

  /** Run a query and return the rows */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      this.logger.debug(`Executing SQL ▶ ${sql.replace(/\s+/g,' ').trim()}`);
      this.logger.debug(`Params ▶ ${JSON.stringify(params)}`);
      const res = await client.query(sql, params);
      return res.rows;
    } catch (err) {
      // log the actual Postgres error, plus SQL + params
      this.logger.error(
        `Query failed: ${err.message}\nSQL ▶ ${sql}\nPARAMS ▶ ${JSON.stringify(params)}`,
        err.stack,
      );
      throw new InternalServerErrorException('Database query failed');
    } finally {
      client.release();
    }
  }
  
}
