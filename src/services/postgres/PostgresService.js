const { Pool } = require('pg');

class PostgresService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
  }

  async query(text, params) {
    const result = await this._pool.query(text, params);
    return result;
  }
}

module.exports = PostgresService;
