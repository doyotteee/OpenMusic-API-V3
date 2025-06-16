require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  console.log('🚀 Running manual database migration...');
  console.log('📋 This will create all required tables for OpenMusic API V2');
  
  const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'openmusic',
    password: process.env.PGPASSWORD || '',
    port: process.env.PGPORT || 5432,
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_create_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Check created tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('🎉 Database is ready for OpenMusic API V2');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Please check your database connection and try again');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
