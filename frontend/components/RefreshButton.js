/**
 * Refresh data button component with job status polling
 */
import { useState, useEffect } from 'react';
import { triggerIngest, getJobStatus } from '../lib/api';

export default function RefreshButton({ onRefreshComplete }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  // Poll job status
  useEffect(() => {
    if (!jobId || !isRefreshing) return;

    const pollInterval = setInterval(async () => {
      try {
        const jobStatus = await getJobStatus(jobId);
        setStatus(jobStatus.status);

        if (jobStatus.status === 'completed') {
          setIsRefreshing(false);
          setJobId(null);
          setStatus('');
          clearInterval(pollInterval);
          
          // Notify parent to refresh data
          if (onRefreshComplete) {
            onRefreshComplete();
          }
        } else if (jobStatus.status === 'failed') {
          setIsRefreshing(false);
          setError(jobStatus.error || 'Job failed');
          setJobId(null);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        setError('Failed to check job status');
        setIsRefreshing(false);
        setJobId(null);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, isRefreshing, onRefreshComplete]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setStatus('starting');

      const response = await triggerIngest();
      setJobId(response.jobId);
      setStatus('running');
    } catch (err) {
      console.error('Error triggering refresh:', err);
      setError('Failed to start refresh');
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`
          px-6 py-3 rounded-lg font-semibold transition-all
          ${isRefreshing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
          text-white shadow-lg hover:shadow-xl
        `}
      >
        {isRefreshing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Refreshing...
          </span>
        ) : (
          '🔄 Refresh Data'
        )}
      </button>

      {status && isRefreshing && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Status: {status}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
