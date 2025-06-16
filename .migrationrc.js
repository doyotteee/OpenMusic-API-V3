const path = require('path');

module.exports = {
  databaseUrl: process.env.DATABASE_URL || `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  migrationsTable: 'pgmigrations',
  dir: path.join(__dirname, 'migrations'),
  direction: 'up',
  count: Infinity,
  createSchema: true,
  createDatabase: false,
  ignorePattern: '.*\\.sql$',
  schema: 'public',
  decamelize: false,
};
