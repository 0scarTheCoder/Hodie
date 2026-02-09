import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Activity,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Table as TableIcon
} from 'lucide-react';

interface DataVisualizationScreenProps {
  user: User;
}

interface BloodDonationData {
  recency: number;
  frequency: number;
  monetary: number;
  time: number;
  class: number;
}

interface LabResult {
  _id: string;
  userId: string;
  testDate: string;
  testType: string;
  results: BloodDonationData[];
  biomarkers: any[];
  aiProcessed: boolean;
  confidence: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const DataVisualizationScreen: React.FC<DataVisualizationScreenProps> = ({ user }) => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Filter states
  const [recencyRange, setRecencyRange] = useState<[number, number]>([0, 100]);
  const [frequencyRange, setFrequencyRange] = useState<[number, number]>([0, 50]);
  const [monetaryRange, setMonetaryRange] = useState<[number, number]>([0, 15000]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from MongoDB
  useEffect(() => {
    const fetchLabResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = (user as any).sub || user.uid;
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/lab-results/${userId}`;

        console.log('📊 Fetching lab results from:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch lab results: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Fetched lab results:', data);

        setLabResults(Array.isArray(data) ? data : [data]);

        if (data.length > 0 || data._id) {
          setSelectedDataset(data._id || data[0]?._id);
        }
      } catch (err) {
        console.error('Error fetching lab results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabResults();
  }, [user]);

  // Get current selected dataset
  const currentData = labResults.find(result => result._id === selectedDataset);
  const allBloodData = currentData?.results || [];

  // Initialize filter ranges based on actual data
  useEffect(() => {
    if (allBloodData.length > 0) {
      const recencies = allBloodData.map((d: BloodDonationData) => d.recency);
      const frequencies = allBloodData.map((d: BloodDonationData) => d.frequency);
      const monetaries = allBloodData.map((d: BloodDonationData) => d.monetary);

      const minRecency = Math.min(...recencies);
      const maxRecency = Math.max(...recencies);
      const minFrequency = Math.min(...frequencies);
      const maxFrequency = Math.max(...frequencies);
      const minMonetary = Math.min(...monetaries);
      const maxMonetary = Math.max(...monetaries);

      setRecencyRange([minRecency, maxRecency]);
      setFrequencyRange([minFrequency, maxFrequency]);
      setMonetaryRange([minMonetary, maxMonetary]);
    }
  }, [allBloodData]);

  // Apply filters to data
  const bloodData = allBloodData.filter((item: BloodDonationData) => {
    return (
      item.recency >= recencyRange[0] &&
      item.recency <= recencyRange[1] &&
      item.frequency >= frequencyRange[0] &&
      item.frequency <= frequencyRange[1] &&
      item.monetary >= monetaryRange[0] &&
      item.monetary <= monetaryRange[1]
    );
  });

  // Prepare data for different chart types
  const frequencyDistribution = bloodData.reduce((acc: any[], item: BloodDonationData) => {
    const existing = acc.find(x => x.frequency === item.frequency);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ frequency: item.frequency, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.frequency - b.frequency);

  const recencyDistribution = bloodData.reduce((acc: any[], item: BloodDonationData) => {
    const bucket = Math.floor(item.recency / 5) * 5;
    const existing = acc.find(x => x.recency === bucket);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ recency: bucket, count: 1, label: `${bucket}-${bucket + 4}` });
    }
    return acc;
  }, []).sort((a, b) => a.recency - b.recency);

  const classDistribution = bloodData.reduce((acc: any[], item: BloodDonationData) => {
    const className = item.class === 1 ? 'Return Donor' : 'Non-Return Donor';
    const existing = acc.find(x => x.name === className);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: className, value: 1 });
    }
    return acc;
  }, []);

  const scatterData = bloodData.map((item: BloodDonationData) => ({
    recency: item.recency,
    frequency: item.frequency,
    monetary: item.monetary,
    class: item.class
  }));

  const monetaryTrend = bloodData
    .slice()
    .sort((a: BloodDonationData, b: BloodDonationData) => a.time - b.time)
    .slice(0, 50) // Limit to first 50 for readability
    .map((item: BloodDonationData, index: number) => ({
      index: index + 1,
      monetary: item.monetary,
      time: item.time
    }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  const stats = {
    totalDonors: bloodData.length,
    returnDonors: bloodData.filter((d: BloodDonationData) => d.class === 1).length,
    avgFrequency: bloodData.length > 0
      ? (bloodData.reduce((sum: number, d: BloodDonationData) => sum + d.frequency, 0) / bloodData.length).toFixed(1)
      : 0,
    avgRecency: bloodData.length > 0
      ? (bloodData.reduce((sum: number, d: BloodDonationData) => sum + d.recency, 0) / bloodData.length).toFixed(1)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading data visualizations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pb-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Error Loading Data</h3>
              <p className="text-white/70">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (labResults.length === 0 || bloodData.length === 0) {
    return (
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Data Visualizations</h1>
          <p className="text-white/70">Interactive charts and graphs for your uploaded health data</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">No Data Available</h3>
              <p className="text-white/70">Upload health data files to see visualizations here.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Data Visualizations</h1>
        <p className="text-white/70">Interactive charts and graphs for your uploaded health data</p>
      </div>

      {/* Dataset Selector */}
      {labResults.length > 1 && (
        <div className="mb-6">
          <label className="block text-white/80 mb-2 text-sm font-medium">Select Dataset:</label>
          <select
            value={selectedDataset || ''}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2"
          >
            {labResults.map((result) => (
              <option key={result._id} value={result._id}>
                {result.testType} - {new Date(result.testDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Interactive Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>{showFilters ? 'Hide' : 'Show'} Interactive Filters</span>
        </button>

        {showFilters && allBloodData.length > 0 && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recency Filter */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Recency (Days): {recencyRange[0]} - {recencyRange[1]}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Min: {recencyRange[0]}</label>
                    <input
                      type="range"
                      min={Math.min(...allBloodData.map((d: BloodDonationData) => d.recency))}
                      max={Math.max(...allBloodData.map((d: BloodDonationData) => d.recency))}
                      value={recencyRange[0]}
                      onChange={(e) => setRecencyRange([Number(e.target.value), recencyRange[1]])}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Max: {recencyRange[1]}</label>
                    <input
                      type="range"
                      min={Math.min(...allBloodData.map((d: BloodDonationData) => d.recency))}
                      max={Math.max(...allBloodData.map((d: BloodDonationData) => d.recency))}
                      value={recencyRange[1]}
                      onChange={(e) => setRecencyRange([recencyRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
              </div>

              {/* Frequency Filter */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Frequency: {frequencyRange[0]} - {frequencyRange[1]}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Min: {frequencyRange[0]}</label>
                    <input
                      type="range"
                      min={Math.min(...allBloodData.map((d: BloodDonationData) => d.frequency))}
                      max={Math.max(...allBloodData.map((d: BloodDonationData) => d.frequency))}
                      value={frequencyRange[0]}
                      onChange={(e) => setFrequencyRange([Number(e.target.value), frequencyRange[1]])}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Max: {frequencyRange[1]}</label>
                    <input
                      type="range"
                      min={Math.min(...allBloodData.map((d: BloodDonationData) => d.frequency))}
                      max={Math.max(...allBloodData.map((d: BloodDonationData) => d.frequency))}
                      value={frequencyRange[1]}
                      onChange={(e) => setFrequencyRange([frequencyRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
              </div>

              {/* Monetary Filter */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Monetary: {monetaryRange[0]} - {monetaryRange[1]}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Min: {monetaryRange[0]}</label>
                    <input
                      type="range"
                      min={Math.min(...allBloodData.map((d: BloodDonationData) => d.monetary))}
                      max={Math.max(...allBloodData.map((d: BloodDonationData) => d.monetary))}
                      value={monetaryRange[0]}
                      onChange={(e) => setMonetaryRange([Number(e.target.value), monetaryRange[1]])}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Max: {monetaryRange[1]}</label>
                    <input
                      type="range"
                      min={Math.min(...allBloodData.map((d: BloodDonationData) => d.monetary))}
                      max={Math.max(...allBloodData.map((d: BloodDonationData) => d.monetary))}
                      value={monetaryRange[1]}
                      onChange={(e) => setMonetaryRange([monetaryRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Stats */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-white/90">
                <span className="text-sm">
                  Showing <strong>{bloodData.length}</strong> of <strong>{allBloodData.length}</strong> records
                  {bloodData.length < allBloodData.length && (
                    <span className="text-yellow-400 ml-2">
                      ({Math.round((bloodData.length / allBloodData.length) * 100)}% filtered)
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    // Reset filters to show all data
                    const recencies = allBloodData.map((d: BloodDonationData) => d.recency);
                    const frequencies = allBloodData.map((d: BloodDonationData) => d.frequency);
                    const monetaries = allBloodData.map((d: BloodDonationData) => d.monetary);
                    setRecencyRange([Math.min(...recencies), Math.max(...recencies)]);
                    setFrequencyRange([Math.min(...frequencies), Math.max(...frequencies)]);
                    setMonetaryRange([Math.min(...monetaries), Math.max(...monetaries)]);
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalDonors}</div>
              <div className="text-sm text-white/70">Total Records</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.returnDonors}</div>
              <div className="text-sm text-white/70">Return Donors</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.avgFrequency}</div>
              <div className="text-sm text-white/70">Avg Frequency</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <BarChartIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.avgRecency}</div>
              <div className="text-sm text-white/70">Avg Recency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setShowTable(!showTable)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showTable
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>{showTable ? 'Hide' : 'Show'} Data Table</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium">
          <Download className="w-4 h-4" />
          <span>Export Charts</span>
        </button>
      </div>

      {/* Data Table */}
      {showTable && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-lg border border-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Data Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-2 font-semibold text-gray-700">#</th>
                  <th className="text-left p-2 font-semibold text-gray-700">Recency</th>
                  <th className="text-left p-2 font-semibold text-gray-700">Frequency</th>
                  <th className="text-left p-2 font-semibold text-gray-700">Monetary</th>
                  <th className="text-left p-2 font-semibold text-gray-700">Time</th>
                  <th className="text-left p-2 font-semibold text-gray-700">Class</th>
                </tr>
              </thead>
              <tbody>
                {bloodData.slice(0, 50).map((row: BloodDonationData, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-100">
                    <td className="p-2 text-gray-600">{idx + 1}</td>
                    <td className="p-2 text-gray-900">{row.recency}</td>
                    <td className="p-2 text-gray-900">{row.frequency}</td>
                    <td className="p-2 text-gray-900">{row.monetary}</td>
                    <td className="p-2 text-gray-900">{row.time}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.class === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {row.class === 1 ? 'Return' : 'Non-Return'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bloodData.length > 50 && (
            <p className="text-sm text-gray-600 mt-4">
              Showing first 50 of {bloodData.length} records
            </p>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="space-y-8">
        {/* Frequency Distribution Bar Chart */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChartIcon className="w-5 h-5 mr-2 text-blue-600" />
            Donation Frequency Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="frequency"
                label={{ value: 'Frequency', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Distribution of donation frequency across all donors
          </p>
        </div>

        {/* Recency Distribution Bar Chart */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChartIcon className="w-5 h-5 mr-2 text-purple-600" />
            Recency Distribution (Days Since Last Donation)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recencyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                label={{ value: 'Days Since Last Donation', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Distribution of recency (days since last donation) grouped in 5-day buckets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Distribution Pie Chart */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
              Donor Classification
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4">
              Proportion of return vs non-return donors
            </p>
          </div>

          {/* Recency vs Frequency Scatter Plot */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-red-600" />
              Recency vs Frequency Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="recency"
                  name="Recency"
                  label={{ value: 'Recency (days)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  type="number"
                  dataKey="frequency"
                  name="Frequency"
                  label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Donors"
                  data={scatterData.slice(0, 200)} // Limit to 200 points for performance
                  fill="#ef4444"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4">
              Relationship between donation recency and frequency (showing 200 samples)
            </p>
          </div>
        </div>

        {/* Frequency vs Monetary Scatter Plot */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Frequency vs. Monetary Value Analysis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="frequency"
                name="Frequency"
                label={{ value: 'Frequency (donations)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="monetary"
                name="Monetary"
                label={{ value: 'Monetary Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }: any) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="text-sm font-semibold">Frequency: {data.frequency}</p>
                        <p className="text-sm font-semibold">Monetary: {data.monetary}</p>
                        <p className="text-sm">
                          <span className={`font-medium ${data.class === 1 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.class === 1 ? 'Return Donor' : 'Non-Return Donor'}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Return Donors"
                data={scatterData.filter((d: any) => d.class === 1).slice(0, 200)}
                fill="#10b981"
                opacity={0.7}
              />
              <Scatter
                name="Non-Return Donors"
                data={scatterData.filter((d: any) => d.class === 0).slice(0, 200)}
                fill="#ef4444"
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Relationship between donation frequency and monetary value, color-coded by donor type
            <span className="ml-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              <span className="text-xs">Return Donors</span>
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full ml-3 mr-1"></span>
              <span className="text-xs">Non-Return Donors</span>
            </span>
          </p>
        </div>

        {/* Monetary Trend Line Chart */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-yellow-600" />
            Monetary Value Trend (First 50 Records)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monetaryTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="index"
                label={{ value: 'Record Index', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Monetary Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="monetary"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Monetary value trend across donation records (ordered by time)
          </p>
        </div>
      </div>

      {/* Dataset Info */}
      {currentData && (
        <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Dataset Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
            <div>
              <div className="text-sm font-medium text-white/60">Dataset Name:</div>
              <div>{currentData.testType}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/60">Upload Date:</div>
              <div>{new Date(currentData.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/60">Records:</div>
              <div>{bloodData.length} rows</div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/60">AI Confidence:</div>
              <div>{currentData.confidence}%</div>
            </div>
            {currentData.notes && (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-white/60">Notes:</div>
                <div>{currentData.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataVisualizationScreen;
