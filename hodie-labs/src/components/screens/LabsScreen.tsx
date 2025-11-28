import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Stethoscope, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Upload,
  Info
} from 'lucide-react';

interface LabsScreenProps {
  user: User;
}

const LabsScreen: React.FC<LabsScreenProps> = ({ user }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  const biomarkers = [
    {
      name: 'Total Cholesterol',
      value: 4.2,
      unit: 'mmol/L',
      range: '< 5.0',
      status: 'optimal',
      trend: 'down',
      change: -8,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [5.1, 4.8, 4.5, 4.2]
    },
    {
      name: 'HDL Cholesterol', 
      value: 1.8,
      unit: 'mmol/L',
      range: '> 1.0',
      status: 'optimal',
      trend: 'up',
      change: 12,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [1.4, 1.6, 1.7, 1.8]
    },
    {
      name: 'LDL Cholesterol',
      value: 2.1,
      unit: 'mmol/L', 
      range: '< 3.0',
      status: 'optimal',
      trend: 'down',
      change: -15,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [2.8, 2.5, 2.3, 2.1]
    },
    {
      name: 'Fasting Glucose',
      value: 5.2,
      unit: 'mmol/L',
      range: '< 5.6',
      status: 'good',
      trend: 'stable',
      change: 0,
      category: 'Metabolic',
      lastTest: '2024-10-15',
      history: [5.4, 5.3, 5.2, 5.2]
    },
    {
      name: 'HbA1c',
      value: 5.1,
      unit: '%',
      range: '< 5.7',
      status: 'optimal',
      trend: 'down',
      change: -4,
      category: 'Metabolic',
      lastTest: '2024-10-15',
      history: [5.4, 5.3, 5.2, 5.1]
    },
    {
      name: 'C-Reactive Protein',
      value: 0.8,
      unit: 'mg/L',
      range: '< 1.0',
      status: 'optimal',
      trend: 'down',
      change: -20,
      category: 'Inflammation',
      lastTest: '2024-10-15',
      history: [1.2, 1.0, 0.9, 0.8]
    },
    {
      name: 'Vitamin D',
      value: 85,
      unit: 'nmol/L',
      range: '50-250',
      status: 'optimal',
      trend: 'up',
      change: 25,
      category: 'Vitamins',
      lastTest: '2024-10-15',
      history: [58, 65, 75, 85]
    },
    {
      name: 'Vitamin B12',
      value: 425,
      unit: 'pmol/L',
      range: '150-700',
      status: 'good',
      trend: 'stable',
      change: 2,
      category: 'Vitamins',
      lastTest: '2024-10-15',
      history: [415, 420, 422, 425]
    },
    {
      name: 'TSH',
      value: 2.1,
      unit: 'mIU/L',
      range: '0.5-4.0',
      status: 'good',
      trend: 'stable',
      change: 0,
      category: 'Hormones',
      lastTest: '2024-10-15',
      history: [2.2, 2.1, 2.1, 2.1]
    },
    {
      name: 'PSA',
      value: 0.6,
      unit: 'μg/L',
      range: '< 2.5',
      status: 'optimal',
      trend: 'stable',
      change: 0,
      category: 'Cancer Markers',
      lastTest: '2024-10-15',
      history: [0.5, 0.6, 0.6, 0.6]
    },
    {
      name: 'LDL Cholesterol (Direct)',
      value: 4.5,
      unit: 'mmol/L',
      range: '< 3.0',
      status: 'out of range',
      trend: 'up',
      change: 15,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [3.8, 4.1, 4.3, 4.5]
    },
    {
      name: 'HbA1c (Elevated)',
      value: 6.2,
      unit: '%',
      range: '< 5.7',
      status: 'out of range',
      trend: 'up',
      change: 8,
      category: 'Metabolic',
      lastTest: '2024-10-15',
      history: [5.8, 5.9, 6.0, 6.2]
    },
    {
      name: 'Homocysteine',
      value: 18.5,
      unit: 'μmol/L',
      range: '< 15.0',
      status: 'out of range',
      trend: 'stable',
      change: 2,
      category: 'Cardiovascular',
      lastTest: '2024-10-15',
      history: [17.8, 18.2, 18.3, 18.5]
    }
  ];

  const categories = [
    'All',
    'Cardiovascular',
    'Metabolic', 
    'Inflammation',
    'Vitamins',
    'Hormones',
    'Cancer Markers'
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBiomarkers = selectedCategory === 'All' 
    ? biomarkers 
    : biomarkers.filter(b => b.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500 bg-green-50 border-green-200';
      case 'good': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'borderline': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'out of range': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    return 'text-green-600'; // Assuming down trends in cholesterol, CRP etc are good
  };

  const renderGauge = (status: string) => {
    const getGaugeConfig = (status: string) => {
      switch (status) {
        case 'optimal':
          return { position: '83%', color: 'bg-gray-700' };
        case 'good':
          return { position: '65%', color: 'bg-gray-700' };
        case 'borderline':
          return { position: '50%', color: 'bg-gray-700' };
        case 'out of range':
          return { position: '17%', color: 'bg-gray-700' };
        default:
          return { position: '50%', color: 'bg-gray-700' };
      }
    };

    const config = getGaugeConfig(status);
    
    return (
      <div className="relative w-20 h-8 mx-auto mb-1">
        {/* Marker above bar */}
        <div 
          className={`absolute top-0 w-2 h-2 ${config.color} rounded-full transform -translate-x-1/2 border border-gray-400`}
          style={{ left: config.position }}
        ></div>
        
        {/* Horizontal bar - three equal sections */}
        <div className="absolute bottom-2 w-full h-2 rounded-full overflow-hidden flex">
          <div className="bg-red-400 w-1/3"></div>
          <div className="bg-yellow-400 w-1/3"></div>
          <div className="bg-green-400 w-1/3"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Lab Results & Biomarkers</h1>
        <p className="text-white/70">Track your biomarker trends and health improvements over time</p>
      </div>

      {/* Health Summary - Subtle Grey Background */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Health Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{biomarkers.filter(b => b.status === 'optimal').length}</div>
            <div className="text-sm text-gray-600">Optimal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{biomarkers.filter(b => b.status === 'good' || b.status === 'borderline').length}</div>
            <div className="text-sm text-gray-600">Suboptimal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{biomarkers.filter(b => b.status === 'out of range').length}</div>
            <div className="text-sm text-gray-600">Out of range</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Latest Readings</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full flex">
              <div 
                className="bg-green-500 rounded-l-full" 
                style={{ width: `${(biomarkers.filter(b => b.status === 'optimal').length / biomarkers.length) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500" 
                style={{ width: `${(biomarkers.filter(b => b.status === 'good' || b.status === 'borderline').length / biomarkers.length) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500 rounded-r-full" 
                style={{ width: `${(biomarkers.filter(b => b.status === 'out of range').length / biomarkers.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Learn More →
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.status === 'optimal').length}
              </div>
              <div className="text-sm text-white/70">Optimal</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Info className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.status === 'good').length}
              </div>
              <div className="text-sm text-white/70">Good</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.trend === 'up' || b.trend === 'down').length}
              </div>
              <div className="text-sm text-white/70">Improving</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {biomarkers.filter(b => b.status === 'out of range').length}
              </div>
              <div className="text-sm text-white/70">Out of Range</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">Oct 15</div>
              <div className="text-sm text-white/70">Last Test</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-auto">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Upload className="w-4 h-4" />
            <span>Upload Results</span>
          </button>
        </div>
      </div>

      {/* Biomarkers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBiomarkers.map((biomarker, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{biomarker.name}</h3>
                <div className="text-sm text-gray-600">{biomarker.category}</div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(biomarker.trend)}
                {biomarker.change !== 0 && (
                  <span className={`text-sm font-medium ${getTrendColor(biomarker.trend, biomarker.change)}`}>
                    {biomarker.change > 0 ? '+' : ''}{biomarker.change}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between mb-4">
              <div className="flex items-end space-x-3">
                <div className="text-3xl font-bold text-gray-900">
                  {biomarker.value}
                </div>
                <div className="text-gray-600 pb-1">
                  {biomarker.unit}
                </div>
              </div>
              
              {/* Gauge Chart */}
              <div className="text-center">
                {renderGauge(biomarker.status)}
                <div className="text-xs text-gray-500">Reading</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Reference: {biomarker.range}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(biomarker.status)}`}>
                {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
              </span>
            </div>

            {/* Mini Line Chart */}
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2">6-month trend</div>
              <div className="relative h-12 w-full">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    points={biomarker.history.map((value, idx) => {
                      const maxVal = Math.max(...biomarker.history);
                      const minVal = Math.min(...biomarker.history);
                      const range = maxVal - minVal || 1;
                      const x = (idx / (biomarker.history.length - 1)) * 100;
                      const y = 40 - ((value - minVal) / range) * 30;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {/* Data points */}
                  {biomarker.history.map((value, idx) => {
                    const maxVal = Math.max(...biomarker.history);
                    const minVal = Math.min(...biomarker.history);
                    const range = maxVal - minVal || 1;
                    const x = (idx / (biomarker.history.length - 1)) * 100;
                    const y = 40 - ((value - minVal) / range) * 30;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="2"
                        fill="#60a5fa"
                        className="hover:fill-blue-300"
                      >
                        <title>{`${value} ${biomarker.unit}`}</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2 mb-3">
              Last tested: {new Date(biomarker.lastTest).toLocaleDateString()}
            </div>
            
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Learn More →
            </button>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Biomarker Insights</h3>
        <div className="text-white/80 mb-4">
          Your biomarkers show excellent cardiovascular health and good metabolic function. 
          Continue your current lifestyle approach to maintain these improvements.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Cholesterol profile improved 12%</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Inflammation markers in optimal range</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Vitamin D levels significantly improved</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-white mb-2">Next steps:</div>
            <div className="text-sm text-white/80">• Schedule follow-up in 3 months</div>
            <div className="text-sm text-white/80">• Continue Mediterranean diet pattern</div>
            <div className="text-sm text-white/80">• Maintain current exercise routine</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabsScreen;