/**
 * VisualizationDisplay Component
 * Displays generated visualizations inline in chat
 */

import React from 'react';
import { BarChart, TrendingUp } from 'lucide-react';

interface VisualizationDisplayProps {
  images: Array<{
    filename: string;
    url: string;
    base64: string;
    timestamp: string;
  }>;
  title?: string;
}

const VisualizationDisplay: React.FC<VisualizationDisplayProps> = ({ images, title }) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="my-4 space-y-4">
      {title && (
        <div className="flex items-center space-x-2 text-blue-400 mb-3">
          <BarChart className="w-5 h-5" />
          <span className="font-semibold">{title}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <img
              src={image.base64}
              alt={`Visualization ${index + 1}`}
              className="w-full h-auto rounded"
            />
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Generated: {new Date(image.timestamp).toLocaleTimeString()}
              </span>
              <a
                href={image.base64}
                download={image.filename}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 mt-2 italic">
        💡 Tip: You can download these charts or ask for different visualizations
      </div>
    </div>
  );
};

export default VisualizationDisplay;
