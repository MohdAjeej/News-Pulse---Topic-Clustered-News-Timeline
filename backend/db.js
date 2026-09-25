/**
 * Database connection and query functions
 */
const { Pool } = require('pg');

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

/**
 * Get all clusters with summary info
 */
async function getClusters() {
  const query = `
    SELECT 
      c.id,
      c.label,
      COUNT(a.id) as article_count,
      MIN(a.published_at) as earliest_article,
      MAX(a.published_at) as latest_article,
      c.created_at
    FROM clusters c
    LEFT JOIN articles a ON c.id = a.cluster_id
    GROUP BY c.id, c.label, c.created_at
    ORDER BY MAX(a.published_at) DESC NULLS LAST
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Get a single cluster with all its articles
 */
async function getClusterById(clusterId) {
  // Validate cluster ID
  if (!clusterId || isNaN(parseInt(clusterId))) {
    return null;
  }
  
  const clusterQuery = `
    SELECT id, label, created_at
    FROM clusters
    WHERE id = $1
  `;
  
  const articlesQuery = `
    SELECT 
      id, url, source, headline, summary, body, published_at, created_at
    FROM articles
    WHERE cluster_id = $1
    ORDER BY published_at ASC
  `;
  
  const clusterResult = await pool.query(clusterQuery, [clusterId]);
  
  if (clusterResult.rows.length === 0) {
    return null;
  }
  
  const articlesResult = await pool.query(articlesQuery, [clusterId]);
  
  return {
    ...clusterResult.rows[0],
    articles: articlesResult.rows
  };
}

/**
 * Get timeline data formatted for charting
 * Returns clusters with start/end times and article count
 */
async function getTimelineData() {
  const query = `
    SELECT 
      c.id,
      c.label,
      MIN(a.published_at) as start,
      MAX(a.published_at) as end,
      COUNT(a.id) as count,
      array_agg(DISTINCT a.source) as sources
    FROM clusters c
    LEFT JOIN articles a ON c.id = a.cluster_id
    WHERE a.published_at IS NOT NULL
    GROUP BY c.id, c.label
    ORDER BY MAX(a.published_at) DESC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Get all articles with optional source filter
 */
async function getArticles(sourceFilter = null) {
  let query = `
    SELECT 
      id, url, source, headline, summary, published_at, cluster_id
    FROM articles
    ORDER BY published_at DESC NULLS LAST
  `;
  
  const params = [];
  
  if (sourceFilter && sourceFilter.length > 0) {
    query = `
      SELECT 
        id, url, source, headline, summary, published_at, cluster_id
      FROM articles
      WHERE source = ANY($1)
      ORDER BY published_at DESC NULLS LAST
    `;
    params.push(sourceFilter);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = {
  pool,
  getClusters,
  getClusterById,
  getTimelineData,
  getArticles
};
