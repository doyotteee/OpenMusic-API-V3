require('dotenv').config();
const { runMigrations } = require('./src/utils/migrate');

async function main() {
  console.log('🚀 Running manual database migration...');
  console.log('📋 This will create all required tables for OpenMusic API V2');
  
  try {
    await runMigrations();
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Database is ready for OpenMusic API V2');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Please check your database connection and try again');
    process.exit(1);
  }
}

main();
