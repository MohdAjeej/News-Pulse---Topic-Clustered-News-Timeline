/**
 * Test database connection
 */
require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful!');
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nTables found:');
    if (result.rows.length === 0) {
      console.log('  No tables found - you need to run the scraper first!');
    } else {
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPossible issues:');
      console.error('1. PostgreSQL is not running');
      console.error('2. Wrong host or port in DATABASE_URL');
      console.error('3. Database "news_pulse" does not exist');
    } else if (error.code === '28P01') {
      console.error('\nAuthentication failed - check your password');
    } else if (error.code === '3D000') {
      console.error('\nDatabase does not exist - create it with: createdb news_pulse');
    }
    
    process.exit(1);
  }
}

testConnection();
