/**
 * Setup SQLite database with sample data
 */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'news_pulse.db');
const db = new Database(dbPath);

console.log('Setting up SQLite database...\n');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clusters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    published_at DATETIME,
    cluster_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id)
  );

  CREATE INDEX IF NOT EXISTS idx_articles_cluster_id ON articles(cluster_id);
  CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
`);

console.log('✓ Tables created');

// Add sample data
const cluster1 = db.prepare('INSERT INTO clusters (label) VALUES (?)').run('technology, AI, innovation, software');
const cluster2 = db.prepare('INSERT INTO clusters (label) VALUES (?)').run('climate, environment, energy, carbon');
const cluster3 = db.prepare('INSERT INTO clusters (label) VALUES (?)').run('politics, election, government, policy');

console.log('✓ Created 3 clusters');

// Add articles
const insertArticle = db.prepare(`
  INSERT INTO articles (url, source, headline, summary, published_at, cluster_id)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const now = new Date();

// Cluster 1 articles
insertArticle.run(
  'https://example.com/tech1',
  'BBC News',
  'New AI breakthrough in language processing',
  'Researchers announce significant advances in artificial intelligence technology...',
  new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  cluster1.lastInsertRowid
);

insertArticle.run(
  'https://example.com/tech2',
  'NPR',
  'Tech companies invest heavily in AI innovation',
  'Major software firms announce new initiatives in artificial intelligence development...',
  new Date(now - 1 * 60 * 60 * 1000).toISOString(),
  cluster1.lastInsertRowid
);

insertArticle.run(
  'https://example.com/tech3',
  'The New York Times',
  'AI technology reshapes software development',
  'The latest innovations in artificial intelligence are transforming how software is built...',
  new Date(now - 0.5 * 60 * 60 * 1000).toISOString(),
  cluster1.lastInsertRowid
);

// Cluster 2 articles
insertArticle.run(
  'https://example.com/climate1',
  'BBC News',
  'Nations commit to carbon reduction targets',
  'International climate summit concludes with new environmental agreements on energy policy...',
  new Date(now - 4 * 60 * 60 * 1000).toISOString(),
  cluster2.lastInsertRowid
);

insertArticle.run(
  'https://example.com/climate2',
  'NPR',
  'Renewable energy investment reaches record levels',
  'New report shows carbon emissions declining as countries invest in clean energy...',
  new Date(now - 3 * 60 * 60 * 1000).toISOString(),
  cluster2.lastInsertRowid
);

// Cluster 3 articles
insertArticle.run(
  'https://example.com/politics1',
  'The New York Times',
  'New election policy proposed in Congress',
  'Lawmakers debate government reforms ahead of upcoming election season...',
  new Date(now - 5 * 60 * 60 * 1000).toISOString(),
  cluster3.lastInsertRowid
);

insertArticle.run(
  'https://example.com/politics2',
  'BBC News',
  'Government announces policy changes',
  'Major election reforms could reshape political landscape, officials say...',
  new Date(now - 4.5 * 60 * 60 * 1000).toISOString(),
  cluster3.lastInsertRowid
);

insertArticle.run(
  'https://example.com/politics3',
  'NPR',
  'Political leaders meet to discuss election strategy',
  'Government officials and policy experts gather to debate upcoming changes...',
  new Date(now - 4 * 60 * 60 * 1000).toISOString(),
  cluster3.lastInsertRowid
);

insertArticle.run(
  'https://example.com/politics4',
  'The New York Times',
  'Election reform bill gains support in Congress',
  'Bipartisan policy initiative advances through government committees...',
  new Date(now - 3.5 * 60 * 60 * 1000).toISOString(),
  cluster3.lastInsertRowid
);

console.log('✓ Added 9 sample articles');

// Verify
const clusterCount = db.prepare('SELECT COUNT(*) as count FROM clusters').get();
const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get();

console.log(`\n✓ Database created successfully!`);
console.log(`  - ${clusterCount.count} clusters`);
console.log(`  - ${articleCount.count} articles`);
console.log(`  - Database file: ${dbPath}`);

console.log('\n✓ Setup complete!');
console.log('\nNext steps:');
console.log('1. Update backend/.env to use SQLite');
console.log('2. Restart backend: npm start');
console.log('3. Refresh browser at http://localhost:3000');

db.close();
