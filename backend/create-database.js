/**
 * Create the news_pulse database
 */
require('dotenv').config();
const { Pool } = require('pg');

async function createDatabase() {
  // Connect to the default 'postgres' database first
  const defaultDbUrl = process.env.DATABASE_URL.replace('/news_pulse', '/postgres');
  
  console.log('Connecting to PostgreSQL...');
  
  const pool = new Pool({
    connectionString: defaultDbUrl,
    ssl: false
  });
  
  try {
    // Check if database exists
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'news_pulse'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✓ Database "news_pulse" already exists!');
    } else {
      // Create database
      console.log('Creating database "news_pulse"...');
      await pool.query('CREATE DATABASE news_pulse');
      console.log('✓ Database "news_pulse" created successfully!');
    }
    
    await pool.end();
    
    // Now connect to the new database and create tables
    console.log('\nCreating tables...');
    const newPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS clusters (
        id SERIAL PRIMARY KEY,
        label VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        url VARCHAR(1000) UNIQUE NOT NULL,
        source VARCHAR(200) NOT NULL,
        headline VARCHAR(1000) NOT NULL,
        summary TEXT,
        body TEXT,
        published_at TIMESTAMP,
        cluster_id INTEGER REFERENCES clusters(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_articles_cluster_id ON articles(cluster_id);
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
      CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
    `);
    
    console.log('✓ Tables created successfully!');
    
    await newPool.end();
    
    console.log('\n✓ Database setup complete!');
    console.log('\nNext step: Run the scraper to fetch news articles');
    console.log('  cd scraper');
    console.log('  .\\venv\\Scripts\\Activate.ps1');
    console.log('  python scraper.py');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
