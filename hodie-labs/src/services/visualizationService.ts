/**
 * Visualization Service
 * Calls Python visualization API to generate charts
 */

const VIZ_API_URL = process.env.REACT_APP_VISUALIZATION_API_URL || 'http://localhost:5000';

export interface VisualizationResult {
  filename: string;
  url: string;
  base64: string;
  timestamp: string;
}

export interface MultiVisualizationResult {
  success: boolean;
  count: number;
  visualizations: VisualizationResult[];
}

class VisualizationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = VIZ_API_URL;
    console.log(`📊 Visualization Service initialized: ${this.baseUrl}`);
  }

  /**
   * Check if visualization service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Visualization service not available:', error);
      return false;
    }
  }

  /**
   * Generate histogram for a single variable
   */
  async generateHistogram(
    data: number[],
    field: string,
    title: string,
    xlabel?: string,
    bins?: number
  ): Promise<VisualizationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/visualize/histogram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          field,
          title,
          xlabel: xlabel || field,
          bins: bins || 20
        })
      });

      if (!response.ok) {
        throw new Error(`Visualization API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Histogram generated:', result.filename);
      return result;
    } catch (error) {
      console.error('❌ Error generating histogram:', error);
      throw error;
    }
  }

  /**
   * Generate scatter plot
   */
  async generateScatter(
    xData: number[],
    yData: number[],
    classes: number[] | null,
    title: string,
    xlabel: string,
    ylabel: string
  ): Promise<VisualizationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/visualize/scatter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          x_data: xData,
          y_data: yData,
          classes: classes,
          title,
          xlabel,
          ylabel
        })
      });

      if (!response.ok) {
        throw new Error(`Visualization API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Scatter plot generated:', result.filename);
      return result;
    } catch (error) {
      console.error('❌ Error generating scatter plot:', error);
      throw error;
    }
  }

  /**
   * Generate bar chart
   */
  async generateBarChart(
    categories: string[],
    values: number[],
    title: string,
    xlabel?: string,
    ylabel?: string
  ): Promise<VisualizationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/visualize/bar-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories,
          values,
          title,
          xlabel: xlabel || 'Category',
          ylabel: ylabel || 'Value'
        })
      });

      if (!response.ok) {
        throw new Error(`Visualization API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Bar chart generated:', result.filename);
      return result;
    } catch (error) {
      console.error('❌ Error generating bar chart:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive blood data visualizations
   * This is a special method for blood donation data
   */
  async visualizeBloodData(data: any[]): Promise<MultiVisualizationResult> {
    try {
      console.log(`📊 Generating comprehensive blood data visualizations (${data.length} records)...`);

      const response = await fetch(`${this.baseUrl}/api/visualize/blood-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data
        })
      });

      if (!response.ok) {
        throw new Error(`Visualization API error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Generated ${result.count} visualizations`);
      return result;
    } catch (error) {
      console.error('❌ Error generating blood data visualizations:', error);
      throw error;
    }
  }

  /**
   * Generate multiple histograms in one figure
   */
  async generateMultiHistogram(
    datasets: Array<{ data: number[], label: string, color?: string }>,
    title: string
  ): Promise<VisualizationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/visualize/multi-histogram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          datasets,
          title
        })
      });

      if (!response.ok) {
        throw new Error(`Visualization API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Multi-histogram generated:', result.filename);
      return result;
    } catch (error) {
      console.error('❌ Error generating multi-histogram:', error);
      throw error;
    }
  }

  /**
   * Get full URL for an image
   */
  getImageUrl(filename: string): string {
    return `${this.baseUrl}/api/images/${filename}`;
  }

  /**
   * Detect if user query is asking for visualization
   */
  isVisualizationRequest(query: string): boolean {
    const visualizationKeywords = [
      'histogram',
      'graph',
      'chart',
      'plot',
      'scatter',
      'visuali',
      'show me',
      'display',
      'graphical',
      'distribution',
      'bar chart',
      'line chart'
    ];

    const lowerQuery = query.toLowerCase();
    return visualizationKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Parse user query to determine what type of visualization they want
   */
  parseVisualizationRequest(query: string): {
    type: 'histogram' | 'scatter' | 'bar' | 'comprehensive' | 'unknown';
    fields: string[];
  } {
    const lowerQuery = query.toLowerCase();

    // Check for specific chart types
    if (lowerQuery.includes('scatter')) {
      // Extract field names
      const fields: string[] = [];
      if (lowerQuery.includes('frequency') && lowerQuery.includes('monetary')) {
        fields.push('frequency', 'monetary');
      }
      return { type: 'scatter', fields };
    }

    if (lowerQuery.includes('bar chart') || lowerQuery.includes('distribution')) {
      if (lowerQuery.includes('class')) {
        return { type: 'bar', fields: ['class'] };
      }
    }

    if (lowerQuery.includes('histogram')) {
      const fields: string[] = [];
      const dataFields = ['recency', 'frequency', 'monetary', 'time'];

      dataFields.forEach(field => {
        if (lowerQuery.includes(field)) {
          fields.push(field);
        }
      });

      return { type: 'histogram', fields };
    }

    // If user asks for "all data" or "comprehensive" analysis
    if (lowerQuery.includes('all') || lowerQuery.includes('comprehensive') ||
        lowerQuery.includes('everything') || lowerQuery.includes('graphical representation')) {
      return { type: 'comprehensive', fields: [] };
    }

    return { type: 'unknown', fields: [] };
  }
}

// Export singleton instance
export const visualizationService = new VisualizationService();
