/**
 * Timeline visualization component using Recharts
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#f97316'
];

export default function Timeline({ data, onClusterClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No timeline data available</p>
      </div>
    );
  }

  // Transform data for charting
  // Calculate duration in hours for each cluster
  const chartData = data.map((cluster, index) => {
    const start = new Date(cluster.start);
    const end = new Date(cluster.end);
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    return {
      id: cluster.id,
      label: cluster.label,
      count: parseInt(cluster.count),
      duration: Math.max(durationHours, 0.5), // Minimum 0.5 hour for visibility
      start: start,
      end: end,
      startFormatted: format(start, 'MMM d, HH:mm'),
      endFormatted: format(end, 'MMM d, HH:mm'),
      color: COLORS[index % COLORS.length]
    };
  }).sort((a, b) => b.start - a.start); // Sort by newest first

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-sm mb-2">{data.label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {data.count} article{data.count !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {data.startFormatted}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            to {data.endFormatted}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Click to view articles
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          onClick={(data) => {
            if (data && data.activePayload) {
              const cluster = data.activePayload[0].payload;
              onClusterClick(cluster.id);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            label={{ value: 'Article Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar
            dataKey="count"
            cursor="pointer"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Click on any bar to view articles in that topic cluster
      </div>
    </div>
  );
}
