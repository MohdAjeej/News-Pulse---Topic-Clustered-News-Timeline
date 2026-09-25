/**
 * Cluster detail view component
 */
import { format, parseISO } from 'date-fns';

export default function ClusterDetail({ cluster, onClose }) {
  if (!cluster) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {cluster.label}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cluster.articles.length} article{cluster.articles.length !== 1 ? 's' : ''} in this cluster
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {cluster.articles.map((article) => (
              <div
                key={article.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    {article.source}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {article.published_at
                      ? format(parseISO(article.published_at), 'MMM d, yyyy HH:mm')
                      : 'No date'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {article.headline}
                </h3>

                {article.summary && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {article.summary}
                  </p>
                )}

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Read full article →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
