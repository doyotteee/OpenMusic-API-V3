const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class Database {
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
    const client = await this._pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🔄 Running database migrations...');
    
    try {
      // Create schema_migrations table if it doesn't exist
      await this.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get applied migrations
      const appliedMigrations = await this.query('SELECT version FROM schema_migrations');
      const appliedVersions = appliedMigrations.rows.map(row => row.version);

      // Read migration files
      const migrationsDir = path.join(__dirname, '../../migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql') && file.match(/^\d+_/))
        .sort();

      let migrationsApplied = 0;

      for (const file of migrationFiles) {
        const version = file.replace('.sql', '');
        
        if (!appliedVersions.includes(version)) {
          console.log(`📄 Applying migration: ${file}`);
          
          const migrationContent = fs.readFileSync(
            path.join(migrationsDir, file), 
            'utf8',
          );
          
          // Execute migration
          await this.query(migrationContent);
          
          // Record migration (if not already done in the migration file)
          await this.query(
            'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING',
            [version],
          );
          
          migrationsApplied++;
          console.log(`✅ Migration applied: ${file}`);
        }
      }

      if (migrationsApplied === 0) {
        console.log('✅ Database is up to date, no migrations needed');
      } else {
        console.log(`✅ Applied ${migrationsApplied} migration(s) successfully`);
      }

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.query('SELECT NOW()');
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async close() {
    await this._pool.end();
  }
}

module.exports = Database;
