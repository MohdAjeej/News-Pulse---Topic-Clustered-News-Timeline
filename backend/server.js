/**
 * News Pulse Backend API Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const jobManager = require('./jobManager');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * GET /clusters
 * List of topic clusters with label, article count, time range
 */
app.get('/clusters', async (req, res) => {
  try {
    const clusters = await db.getClusters();
    res.json(clusters);
  } catch (error) {
    console.error('Error fetching clusters:', error);
    res.status(500).json({ 
      error: 'Failed to fetch clusters',
      message: error.message 
    });
  }
});

/**
 * GET /clusters/:id
 * Full cluster detail with all articles, sorted chronologically
 */
app.get('/clusters/:id', async (req, res) => {
  try {
    const clusterId = req.params.id;
    
    // Validate cluster ID
    if (!clusterId || isNaN(parseInt(clusterId))) {
      return res.status(400).json({ 
        error: 'Invalid cluster ID',
        message: 'Cluster ID must be a valid number'
      });
    }
    
    const cluster = await db.getClusterById(clusterId);
    
    if (!cluster) {
      return res.status(404).json({ 
        error: 'Cluster not found',
        message: `No cluster found with ID ${clusterId}`
      });
    }
    
    res.json(cluster);
  } catch (error) {
    console.error('Error fetching cluster:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cluster',
      message: error.message 
    });
  }
});

/**
 * GET /timeline
 * Clusters formatted for plotting: label, start/end time, article count
 */
app.get('/timeline', async (req, res) => {
  try {
    const sourceFilter = req.query.sources ? req.query.sources.split(',') : null;
    
    let timelineData = await db.getTimelineData();
    
    // Filter by sources if requested
    if (sourceFilter && sourceFilter.length > 0) {
      timelineData = timelineData.filter(cluster => {
        return cluster.sources.some(source => sourceFilter.includes(source));
      });
    }
    
    res.json(timelineData);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ 
      error: 'Failed to fetch timeline data',
      message: error.message 
    });
  }
});

/**
 * POST /ingest/trigger
 * Triggers Python pipeline (scrape + group) as subprocess
 * Returns a job ID immediately without blocking
 */
app.post('/ingest/trigger', async (req, res) => {
  try {
    const jobId = jobManager.startScraperJob();
    
    res.json({ 
      jobId,
      status: 'started',
      message: 'Scraper job started successfully'
    });
  } catch (error) {
    console.error('Error starting scraper job:', error);
    res.status(500).json({ 
      error: 'Failed to start scraper job',
      message: error.message 
    });
  }
});

/**
 * GET /ingest/status/:jobId
 * Lets the frontend poll job status
 */
app.get('/ingest/status/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    if (!jobId) {
      return res.status(400).json({ 
        error: 'Invalid job ID',
        message: 'Job ID is required'
      });
    }
    
    const jobStatus = jobManager.getJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ 
        error: 'Job not found',
        message: `No job found with ID ${jobId}`
      });
    }
    
    res.json(jobStatus);
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch job status',
      message: error.message 
    });
  }
});

/**
 * GET /sources
 * Get list of all news sources
 */
app.get('/sources', async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT DISTINCT source 
      FROM articles 
      ORDER BY source
    `);
    
    res.json(result.rows.map(row => row.source));
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sources',
      message: error.message 
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('NEWS PULSE - Backend API Server');
  console.log('='.repeat(60));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  db.pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
