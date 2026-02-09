// BloodDataVisualizations.tsx - Interactive charting using Recharts
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
  ResponsiveContainer,
  Cell
} from 'recharts';

interface BloodRecord {
  recency: number;
  frequency: number;
  monetary: number;
  time: number;
  class: number;
}

interface BloodDataVisualizationsProps {
  data: BloodRecord[];
}

const BloodDataVisualizations: React.FC<BloodDataVisualizationsProps> = ({ data }) => {
  // Prepare histogram data by creating bins
  const createHistogramData = (values: number[], field: string) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 20;
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
      count: 0,
      binStart: min + i * binSize
    }));

    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex].count++;
    });

    return bins;
  };

  // Extract field values
  const recencyData = createHistogramData(data.map(d => d.recency), 'Recency');
  const frequencyData = createHistogramData(data.map(d => d.frequency), 'Frequency');
  const monetaryData = createHistogramData(data.map(d => d.monetary), 'Monetary');
  const timeData = createHistogramData(data.map(d => d.time), 'Time');

  // Class distribution
  const classDistribution = [0, 1].map(classValue => ({
    class: `Class ${classValue}`,
    count: data.filter(d => d.class === classValue).length
  }));

  // Scatter plot data
  const scatterData = data.map(d => ({
    frequency: d.frequency,
    monetary: d.monetary,
    class: d.class,
    recency: d.recency
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="space-y-8 bg-gray-900 p-6 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Blood Donation Data Visualizations
        </h3>
        <p className="text-gray-400 text-sm">
          {data.length} records analyzed
        </p>
      </div>

      {/* Histograms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recency Histogram */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 text-center">Recency Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={recencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="range"
                stroke="#999"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Frequency Histogram */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 text-center">Frequency Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="range"
                stroke="#999"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monetary Histogram */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 text-center">Monetary Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monetaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="range"
                stroke="#999"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Histogram */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 text-center">Time Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="range"
                stroke="#999"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#ff7c7c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Distribution Bar Chart */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-white font-semibold mb-3 text-center">Class Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={classDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="class" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count">
              {classDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frequency vs Monetary */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 text-center">
            Frequency vs Monetary (colored by Class)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="frequency" name="Frequency" stroke="#999" />
              <YAxis dataKey="monetary" name="Monetary" stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Scatter
                name="Class 0"
                data={scatterData.filter(d => d.class === 0)}
                fill="#8884d8"
              />
              <Scatter
                name="Class 1"
                data={scatterData.filter(d => d.class === 1)}
                fill="#82ca9d"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Recency vs Frequency */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 text-center">
            Recency vs Frequency (colored by Class)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="recency" name="Recency" stroke="#999" />
              <YAxis dataKey="frequency" name="Frequency" stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Scatter
                name="Class 0"
                data={scatterData.filter(d => d.class === 0)}
                fill="#ffc658"
              />
              <Scatter
                name="Class 1"
                data={scatterData.filter(d => d.class === 1)}
                fill="#ff7c7c"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BloodDataVisualizations;
