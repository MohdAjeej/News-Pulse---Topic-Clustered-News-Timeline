/**
 * News Pulse - Main page
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Timeline from '../components/Timeline';
import ClusterDetail from '../components/ClusterDetail';
import SourceFilter from '../components/SourceFilter';
import RefreshButton from '../components/RefreshButton';
import { getTimeline, getCluster, getSources } from '../lib/api';

export default function Home() {
  const [timelineData, setTimelineData] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [sources, setSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter timeline when sources change
  useEffect(() => {
    if (selectedSources.length === 0) {
      // If no sources selected, show all
      loadTimelineData(null);
    } else {
      loadTimelineData(selectedSources);
    }
  }, [selectedSources]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load sources first
      const sourcesData = await getSources();
      setSources(sourcesData);
      setSelectedSources(sourcesData); // Select all by default

      // Load timeline
      await loadTimelineData(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTimelineData = async (sourceFilter) => {
    try {
      const data = await getTimeline(sourceFilter);
      setTimelineData(data);
    } catch (err) {
      console.error('Error loading timeline:', err);
      setError('Failed to load timeline data.');
    }
  };

  const handleClusterClick = async (clusterId) => {
    try {
      const cluster = await getCluster(clusterId);
      setSelectedCluster(cluster);
    } catch (err) {
      console.error('Error loading cluster:', err);
      alert('Failed to load cluster details');
    }
  };

  const handleCloseCluster = () => {
    setSelectedCluster(null);
  };

  const handleRefreshComplete = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading News Pulse...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>News Pulse - Topic-Clustered News Timeline</title>
        <meta name="description" content="Interactive news timeline with topic clustering" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  📰 News Pulse
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Topic-Clustered News Timeline
                </p>
              </div>
              <RefreshButton onRefreshComplete={handleRefreshComplete} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {sources.length > 0 && (
                <SourceFilter
                  sources={sources}
                  selectedSources={selectedSources}
                  onChange={setSelectedSources}
                />
              )}

              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  About
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  News Pulse aggregates articles from multiple news sources and automatically
                  groups related stories into topic clusters for easy exploration.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  News Timeline
                </h2>
                
                {timelineData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No news clusters available yet.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Click "Refresh Data" to fetch the latest news.
                    </p>
                  </div>
                ) : (
                  <Timeline
                    data={timelineData}
                    onClusterClick={handleClusterClick}
                  />
                )}
              </div>

              {timelineData.length > 0 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> Click on any bar in the timeline to explore
                    articles within that topic cluster.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cluster Detail Modal */}
        {selectedCluster && (
          <ClusterDetail
            cluster={selectedCluster}
            onClose={handleCloseCluster}
          />
        )}
      </main>
    </>
  );
}
