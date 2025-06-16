const Database = require('./database');

async function runMigrations() {
  const database = new Database();
  
  try {
    // Test connection first with retry mechanism
    let connected = false;
    let retries = 3;
    
    while (!connected && retries > 0) {
      connected = await database.testConnection();
      if (!connected) {
        console.log(`⏳ Database connection failed, retrying... (${retries} attempts left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
    
    if (!connected) {
      throw new Error('Cannot connect to database after multiple attempts');
    }
    
    // Run migrations
    await database.runMigrations();
    
    console.log('🎉 Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    // Don't throw error to prevent server crash in production
    // Log error but continue server startup
    console.log('⚠️ Server will continue without migration...');
  } finally {
    await database.close();
  }
}

module.exports = { runMigrations };
