require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function runMigration() {
  try {
    console.log('🚀 Running database migration...');
      const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'complete_migration.sql'),
      'utf8',
    );
    
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    
    // Test if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
