const Database = require('./database');

async function runMigrations() {
  const database = new Database();
  
  try {
    // Test connection first
    const connected = await database.testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }
    
    // Run migrations
    await database.runMigrations();
    
    console.log('🎉 Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    await database.close();
  }
}

module.exports = { runMigrations };
