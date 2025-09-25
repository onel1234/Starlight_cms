import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection has been established successfully.');
    
    // Test basic query
    const result = await sequelize.query('SELECT 1 + 1 AS result');
    logger.info('✅ Database query test successful:', result);
    
    await sequelize.close();
    logger.info('✅ Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

testDatabaseConnection();