/**
 * Source filter component
 */
export default function SourceFilter({ sources, selectedSources, onChange }) {
  const handleToggle = (source) => {
    if (selectedSources.includes(source)) {
      onChange(selectedSources.filter(s => s !== source));
    } else {
      onChange([...selectedSources, source]);
    }
  };

  const handleSelectAll = () => {
    onChange(sources);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Filter by Source</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            All
          </button>
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
          >
            None
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sources.map((source) => (
          <label
            key={source}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedSources.includes(source)}
              onChange={() => handleToggle(source)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
          </label>
        ))}
      </div>

      {selectedSources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {selectedSources.length} of {sources.length} sources selected
          </p>
        </div>
      )}
    </div>
  );
}
