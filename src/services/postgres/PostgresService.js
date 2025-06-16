const { Pool } = require('pg');

class PostgresService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'openmusic',
      password: process.env.PGPASSWORD || '',
      port: process.env.PGPORT || 5432,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 20,
    });
  }

  async query(text, params) {
    try {
      const result = await this._pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }
}

module.exports = PostgresService;
