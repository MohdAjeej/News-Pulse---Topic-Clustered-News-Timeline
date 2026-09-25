/**
 * Add sample data for testing
 */
require('dotenv').config();
const { Pool } = require('pg');

async function addSampleData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  
  try {
    console.log('Adding sample data...\n');
    
    // Create sample clusters
    const cluster1 = await pool.query(
      'INSERT INTO clusters (label) VALUES ($1) RETURNING id',
      ['technology, AI, innovation, software']
    );
    const cluster1Id = cluster1.rows[0].id;
    
    const cluster2 = await pool.query(
      'INSERT INTO clusters (label) VALUES ($1) RETURNING id',
      ['climate, environment, energy, carbon']
    );
    const cluster2Id = cluster2.rows[0].id;
    
    const cluster3 = await pool.query(
      'INSERT INTO clusters (label) VALUES ($1) RETURNING id',
      ['politics, election, government, policy']
    );
    const cluster3Id = cluster3.rows[0].id;
    
    console.log('✓ Created 3 clusters');
    
    // Add sample articles to cluster 1
    await pool.query(`
      INSERT INTO articles (url, source, headline, summary, published_at, cluster_id)
      VALUES 
        ($1, $2, $3, $4, NOW() - INTERVAL '2 hours', $5),
        ($6, $7, $8, $9, NOW() - INTERVAL '1 hour', $10),
        ($11, $12, $13, $14, NOW() - INTERVAL '30 minutes', $15)
    `, [
      'https://example.com/tech1', 'BBC News', 
      'New AI breakthrough in language processing',
      'Researchers announce significant advances in artificial intelligence technology...',
      cluster1Id,
      'https://example.com/tech2', 'NPR',
      'Tech companies invest heavily in AI innovation',
      'Major software firms announce new initiatives in artificial intelligence development...',
      cluster1Id,
      'https://example.com/tech3', 'The New York Times',
      'AI technology reshapes software development',
      'The latest innovations in artificial intelligence are transforming how software is built...',
      cluster1Id
    ]);
    
    // Add sample articles to cluster 2
    await pool.query(`
      INSERT INTO articles (url, source, headline, summary, published_at, cluster_id)
      VALUES 
        ($1, $2, $3, $4, NOW() - INTERVAL '4 hours', $5),
        ($6, $7, $8, $9, NOW() - INTERVAL '3 hours', $10)
    `, [
      'https://example.com/climate1', 'BBC News',
      'Nations commit to carbon reduction targets',
      'International climate summit concludes with new environmental agreements on energy policy...',
      cluster2Id,
      'https://example.com/climate2', 'NPR',
      'Renewable energy investment reaches record levels',
      'New report shows carbon emissions declining as countries invest in clean energy...',
      cluster2Id
    ]);
    
    // Add sample articles to cluster 3
    await pool.query(`
      INSERT INTO articles (url, source, headline, summary, published_at, cluster_id)
      VALUES 
        ($1, $2, $3, $4, NOW() - INTERVAL '5 hours', $5),
        ($6, $7, $8, $9, NOW() - INTERVAL '4.5 hours', $10),
        ($11, $12, $13, $14, NOW() - INTERVAL '4 hours', $15),
        ($16, $17, $18, $19, NOW() - INTERVAL '3.5 hours', $20)
    `, [
      'https://example.com/politics1', 'The New York Times',
      'New election policy proposed in Congress',
      'Lawmakers debate government reforms ahead of upcoming election season...',
      cluster3Id,
      'https://example.com/politics2', 'BBC News',
      'Government announces policy changes',
      'Major election reforms could reshape political landscape, officials say...',
      cluster3Id,
      'https://example.com/politics3', 'NPR',
      'Political leaders meet to discuss election strategy',
      'Government officials and policy experts gather to debate upcoming changes...',
      cluster3Id,
      'https://example.com/politics4', 'The New York Times',
      'Election reform bill gains support in Congress',
      'Bipartisan policy initiative advances through government committees...',
      cluster3Id
    ]);
    
    console.log('✓ Added 9 sample articles');
    
    // Verify the data
    const clusterCount = await pool.query('SELECT COUNT(*) FROM clusters');
    const articleCount = await pool.query('SELECT COUNT(*) FROM articles');
    
    console.log(`\n✓ Database now has:`);
    console.log(`  - ${clusterCount.rows[0].count} clusters`);
    console.log(`  - ${articleCount.rows[0].count} articles`);
    
    await pool.end();
    
    console.log('\n✓ Sample data added successfully!');
    console.log('\nRefresh your browser at http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

addSampleData();
