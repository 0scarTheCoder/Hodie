// GenericDataVisualizations.tsx - Visualize any tabular health data using Recharts
import React from 'react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface GenericDataVisualizationsProps {
  data: Record<string, any>[];
  title?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

const GenericDataVisualizations: React.FC<GenericDataVisualizationsProps> = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  // Identify numeric columns
  const allKeys = Object.keys(data[0] || {});
  const numericColumns = allKeys.filter(key => {
    const sample = data.slice(0, 20);
    return sample.every(row => {
      const val = parseFloat(row[key]);
      return !isNaN(val) && isFinite(val);
    });
  }).slice(0, 6); // Max 6 columns for readability

  if (numericColumns.length === 0) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg text-center">
        <p className="text-gray-400">No numeric columns found for visualisation.</p>
      </div>
    );
  }

  // Create histogram data for a column
  const createHistogramData = (values: number[], columnName: string) => {
    const validValues = values.filter(v => !isNaN(v) && isFinite(v));
    if (validValues.length === 0) return [];

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    if (min === max) return [{ range: `${min.toFixed(2)}`, count: validValues.length }];

    const binCount = Math.min(20, Math.ceil(Math.sqrt(validValues.length)));
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}`,
      count: 0
    }));

    validValues.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex].count++;
    });

    return bins;
  };

  // Prepare scatter data (first two numeric columns)
  const scatterColumns = numericColumns.slice(0, 2);
  const scatterData = scatterColumns.length >= 2
    ? data.slice(0, 1000).map(row => ({
        x: parseFloat(row[scatterColumns[0]]) || 0,
        y: parseFloat(row[scatterColumns[1]]) || 0
      }))
    : [];

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-1">
          {title || 'Data Visualisations'}
        </h3>
        <p className="text-gray-400 text-sm">
          {data.length} records | {numericColumns.length} numeric columns
        </p>
      </div>

      {/* Histograms for each numeric column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numericColumns.map((col, idx) => {
          const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
          const histData = createHistogramData(values, col);

          return (
            <div key={col} className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 text-center text-sm">
                {col} Distribution
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={histData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="range"
                    stroke="#999"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis stroke="#999" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill={COLORS[idx % COLORS.length]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Scatter plot if we have at least 2 numeric columns */}
      {scatterData.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2 text-center text-sm">
            {scatterColumns[0]} vs {scatterColumns[1]}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="x" name={scatterColumns[0]} stroke="#999" tick={{ fontSize: 10 }} />
              <YAxis dataKey="y" name={scatterColumns[1]} stroke="#999" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Scatter name={`${scatterColumns[0]} vs ${scatterColumns[1]}`} data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary stats */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-white font-semibold mb-3 text-center text-sm">Summary Statistics</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Column</th>
                <th className="text-right p-2">Min</th>
                <th className="text-right p-2">Max</th>
                <th className="text-right p-2">Mean</th>
                <th className="text-right p-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {numericColumns.map(col => {
                const values = data.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
                const min = Math.min(...values);
                const max = Math.max(...values);
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                return (
                  <tr key={col} className="border-b border-gray-700/50">
                    <td className="p-2 font-mono">{col}</td>
                    <td className="text-right p-2">{min.toFixed(3)}</td>
                    <td className="text-right p-2">{max.toFixed(3)}</td>
                    <td className="text-right p-2">{mean.toFixed(3)}</td>
                    <td className="text-right p-2">{values.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GenericDataVisualizations;
