require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function runManualMigration() {
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });

  try {
    console.log('🔄 Running manual migration...');
    
    // Read SQL file
    const sql = fs.readFileSync('./manual_migration.sql', 'utf8');
    
    // Execute SQL
    const result = await pool.query(sql);
    
    console.log('✅ Manual migration completed successfully!');
    console.log('📝 Result:', result);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

runManualMigration();
