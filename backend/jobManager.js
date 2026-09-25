/**
 * Job manager for tracking Python scraper execution
 */
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');

// In-memory job storage (for simplicity - could use DB for persistence)
const jobs = new Map();

/**
 * Job status enum
 */
const JobStatus = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Create and start a new scraper job
 */
function startScraperJob() {
  const jobId = uuidv4();
  
  const job = {
    id: jobId,
    status: JobStatus.RUNNING,
    startTime: new Date(),
    endTime: null,
    output: [],
    error: null
  };
  
  jobs.set(jobId, job);
  
  // Start Python scraper as subprocess
  const scraperPath = process.env.PYTHON_SCRAPER_PATH || path.join(__dirname, '../scraper/scraper.py');
  const scraperDir = path.dirname(scraperPath);
  
  console.log(`Starting scraper job ${jobId}...`);
  console.log(`Scraper path: ${scraperPath}`);
  
  const pythonProcess = spawn('python', [scraperPath], {
    cwd: scraperDir,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    }
  });
  
  // Capture stdout
  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    job.output.push(output);
    console.log(`[Job ${jobId}] ${output}`);
  });
  
  // Capture stderr
  pythonProcess.stderr.on('data', (data) => {
    const output = data.toString();
    job.output.push(`ERROR: ${output}`);
    console.error(`[Job ${jobId}] ERROR: ${output}`);
  });
  
  // Handle process completion
  pythonProcess.on('close', (code) => {
    job.endTime = new Date();
    
    if (code === 0) {
      job.status = JobStatus.COMPLETED;
      console.log(`✓ Job ${jobId} completed successfully`);
    } else {
      job.status = JobStatus.FAILED;
      job.error = `Process exited with code ${code}`;
      console.error(`✗ Job ${jobId} failed with code ${code}`);
    }
  });
  
  // Handle process errors
  pythonProcess.on('error', (error) => {
    job.status = JobStatus.FAILED;
    job.error = error.message;
    job.endTime = new Date();
    console.error(`✗ Job ${jobId} error: ${error.message}`);
  });
  
  return jobId;
}

/**
 * Get job status by ID
 */
function getJobStatus(jobId) {
  const job = jobs.get(jobId);
  
  if (!job) {
    return null;
  }
  
  return {
    id: job.id,
    status: job.status,
    startTime: job.startTime,
    endTime: job.endTime,
    error: job.error,
    // Include last 20 lines of output for debugging
    output: job.output.slice(-20)
  };
}

/**
 * Clean up old completed jobs (optional - run periodically)
 */
function cleanupOldJobs(maxAgeMs = 3600000) { // 1 hour default
  const now = Date.now();
  
  for (const [jobId, job] of jobs.entries()) {
    if (job.endTime && (now - job.endTime.getTime() > maxAgeMs)) {
      jobs.delete(jobId);
    }
  }
}

/**
 * Generate UUID v4
 */
function uuidv4() {
  return crypto.randomUUID();
}

module.exports = {
  JobStatus,
  startScraperJob,
  getJobStatus,
  cleanupOldJobs
};
