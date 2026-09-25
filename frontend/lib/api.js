/**
 * API client for News Pulse backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch all clusters
 */
export async function getClusters() {
  const response = await fetch(`${API_URL}/clusters`);
  if (!response.ok) {
    throw new Error('Failed to fetch clusters');
  }
  return response.json();
}

/**
 * Fetch a single cluster by ID
 */
export async function getCluster(id) {
  const response = await fetch(`${API_URL}/clusters/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cluster');
  }
  return response.json();
}

/**
 * Fetch timeline data
 */
export async function getTimeline(sources = null) {
  let url = `${API_URL}/timeline`;
  if (sources && sources.length > 0) {
    url += `?sources=${sources.join(',')}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch timeline');
  }
  return response.json();
}

/**
 * Trigger a new scraper job
 */
export async function triggerIngest() {
  const response = await fetch(`${API_URL}/ingest/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to trigger ingest');
  }
  return response.json();
}

/**
 * Get job status
 */
export async function getJobStatus(jobId) {
  const response = await fetch(`${API_URL}/ingest/status/${jobId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job status');
  }
  return response.json();
}

/**
 * Fetch available sources
 */
export async function getSources() {
  const response = await fetch(`${API_URL}/sources`);
  if (!response.ok) {
    throw new Error('Failed to fetch sources');
  }
  return response.json();
}
