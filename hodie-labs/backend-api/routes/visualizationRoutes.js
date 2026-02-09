/**
 * Visualization Routes
 * Generate health data visualizations using Chart.js
 */

const express = require('express');
const router = express.Router();
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Initialize Chart.js canvas renderer
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Hodie Labs Visualization Service (JavaScript)',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate histogram
 * POST /api/visualize/histogram
 */
router.post('/histogram', async (req, res) => {
  try {
    const { data, field, title, xlabel, bins = 20 } = req.body;

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Calculate histogram bins
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    const binCounts = new Array(bins).fill(0);
    const binLabels = [];

    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      binLabels.push(`${binStart.toFixed(1)}`);

      // Count values in this bin
      data.forEach(value => {
        if (value >= binStart && (i === bins - 1 ? value <= binEnd : value < binEnd)) {
          binCounts[i]++;
        }
      });
    }

    // Calculate statistics
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const sortedData = [...data].sort((a, b) => a - b);
    const median = sortedData[Math.floor(sortedData.length / 2)];
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Chart configuration
    const configuration = {
      type: 'bar',
      data: {
        labels: binLabels,
        datasets: [{
          label: xlabel || field,
          data: binCounts,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title || 'Distribution',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: false
          },
          annotation: {
            annotations: {
              statsBox: {
                type: 'label',
                xValue: bins - 2,
                yValue: Math.max(...binCounts) * 0.9,
                content: [`Mean: ${mean.toFixed(2)}`, `Median: ${median.toFixed(2)}`, `Std Dev: ${stdDev.toFixed(2)}`],
                font: { size: 12 },
                backgroundColor: 'rgba(255, 235, 205, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Frequency'
            }
          },
          x: {
            title: {
              display: true,
              text: xlabel || field
            }
          }
        }
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const base64Image = imageBuffer.toString('base64');

    res.json({
      filename: `histogram_${Date.now()}.png`,
      url: `/api/visualize/image/${Date.now()}`,
      base64: `data:image/png;base64,${base64Image}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating histogram:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate scatter plot
 * POST /api/visualize/scatter
 */
router.post('/scatter', async (req, res) => {
  try {
    const { x_data, y_data, classes, title, xlabel, ylabel } = req.body;

    if (!x_data || !y_data || x_data.length !== y_data.length) {
      return res.status(400).json({ error: 'x_data and y_data must have same length' });
    }

    // Prepare data points
    const dataPoints = x_data.map((x, i) => ({
      x: x,
      y: y_data[i],
      class: classes ? classes[i] : 0
    }));

    // Split by class if provided
    const datasets = [];
    if (classes) {
      const class0 = dataPoints.filter(p => p.class === 0);
      const class1 = dataPoints.filter(p => p.class === 1);

      if (class0.length > 0) {
        datasets.push({
          label: 'Non-Return Donor',
          data: class0,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          pointRadius: 5
        });
      }

      if (class1.length > 0) {
        datasets.push({
          label: 'Return Donor',
          data: class1,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          pointRadius: 5
        });
      }
    } else {
      datasets.push({
        label: 'Data Points',
        data: dataPoints,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        pointRadius: 5
      });
    }

    const configuration = {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title || 'Scatter Plot',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: classes !== null && classes !== undefined
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xlabel || 'X'
            }
          },
          y: {
            title: {
              display: true,
              text: ylabel || 'Y'
            }
          }
        }
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const base64Image = imageBuffer.toString('base64');

    res.json({
      filename: `scatter_${Date.now()}.png`,
      url: `/api/visualize/image/${Date.now()}`,
      base64: `data:image/png;base64,${base64Image}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating scatter plot:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate bar chart
 * POST /api/visualize/bar-chart
 */
router.post('/bar-chart', async (req, res) => {
  try {
    const { categories, values, title, xlabel, ylabel } = req.body;

    if (!categories || !values || categories.length !== values.length) {
      return res.status(400).json({ error: 'categories and values must have same length' });
    }

    const colors = [
      'rgba(16, 185, 129, 0.7)',
      'rgba(239, 68, 68, 0.7)',
      'rgba(59, 130, 246, 0.7)',
      'rgba(245, 158, 11, 0.7)'
    ];

    const configuration = {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: ylabel || 'Value',
          data: values,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map(c => c.replace('0.7', '1')),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title || 'Bar Chart',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: false
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => value
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: ylabel || 'Value'
            }
          },
          x: {
            title: {
              display: true,
              text: xlabel || 'Category'
            }
          }
        }
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const base64Image = imageBuffer.toString('base64');

    res.json({
      filename: `bar_chart_${Date.now()}.png`,
      url: `/api/visualize/image/${Date.now()}`,
      base64: `data:image/png;base64,${base64Image}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating bar chart:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate comprehensive blood data visualizations
 * POST /api/visualize/blood-data
 */
router.post('/blood-data', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const visualizations = [];

    // Extract fields
    const recency = data.map(d => d.recency).filter(v => v !== undefined);
    const frequency = data.map(d => d.frequency).filter(v => v !== undefined);
    const monetary = data.map(d => d.monetary).filter(v => v !== undefined);
    const time = data.map(d => d.time).filter(v => v !== undefined);
    const classes = data.map(d => d.class).filter(v => v !== undefined);

    // 1. Generate histograms for each field (we'll create 4 separate charts)
    const fields = [
      { data: recency, name: 'Recency', color: 'rgba(59, 130, 246, 0.7)', label: 'Days Since Last Donation' },
      { data: frequency, name: 'Frequency', color: 'rgba(16, 185, 129, 0.7)', label: 'Number of Donations' },
      { data: monetary, name: 'Monetary', color: 'rgba(245, 158, 11, 0.7)', label: 'Total Blood Volume (c.c.)' },
      { data: time, name: 'Time', color: 'rgba(168, 85, 247, 0.7)', label: 'Months Since First Donation' }
    ];

    for (const field of fields) {
      if (field.data.length > 0) {
        const mean = field.data.reduce((a, b) => a + b, 0) / field.data.length;

        const bins = 20;
        const min = Math.min(...field.data);
        const max = Math.max(...field.data);
        const binWidth = (max - min) / bins;
        const binCounts = new Array(bins).fill(0);
        const binLabels = [];

        for (let i = 0; i < bins; i++) {
          const binStart = min + i * binWidth;
          binLabels.push(`${binStart.toFixed(0)}`);
          field.data.forEach(value => {
            const binEnd = binStart + binWidth;
            if (value >= binStart && (i === bins - 1 ? value <= binEnd : value < binEnd)) {
              binCounts[i]++;
            }
          });
        }

        const config = {
          type: 'bar',
          data: {
            labels: binLabels,
            datasets: [{
              label: field.label,
              data: binCounts,
              backgroundColor: field.color,
              borderColor: field.color.replace('0.7', '1'),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `${field.name} Distribution`,
                font: { size: 16, weight: 'bold' }
              },
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Frequency' }
              },
              x: {
                title: { display: true, text: field.label }
              }
            }
          }
        };

        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
        const base64Image = imageBuffer.toString('base64');

        visualizations.push({
          filename: `${field.name.toLowerCase()}_hist_${Date.now()}.png`,
          url: `/api/visualize/image/${Date.now()}`,
          base64: `data:image/png;base64,${base64Image}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Scatter plot: Frequency vs Monetary
    if (frequency.length > 0 && monetary.length > 0) {
      const scatterData = frequency.map((f, i) => ({
        x: f,
        y: monetary[i],
        class: classes[i] || 0
      }));

      const class0 = scatterData.filter(p => p.class === 0);
      const class1 = scatterData.filter(p => p.class === 1);

      const datasets = [];
      if (class0.length > 0) {
        datasets.push({
          label: 'Non-Return Donor',
          data: class0,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          pointRadius: 4
        });
      }
      if (class1.length > 0) {
        datasets.push({
          label: 'Return Donor',
          data: class1,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          pointRadius: 4
        });
      }

      const config = {
        type: 'scatter',
        data: { datasets },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Frequency vs. Monetary Value',
              font: { size: 16, weight: 'bold' }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Frequency (donations)' } },
            y: { title: { display: true, text: 'Monetary Value (c.c. blood)' } }
          }
        }
      };

      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
      const base64Image = imageBuffer.toString('base64');

      visualizations.push({
        filename: `frequency_vs_monetary_${Date.now()}.png`,
        url: `/api/visualize/image/${Date.now()}`,
        base64: `data:image/png;base64,${base64Image}`,
        timestamp: new Date().toISOString()
      });
    }

    // 3. Class distribution bar chart
    if (classes.length > 0) {
      const class0Count = classes.filter(c => c === 0).length;
      const class1Count = classes.filter(c => c === 1).length;
      const total = class0Count + class1Count;

      const config = {
        type: 'bar',
        data: {
          labels: ['Non-Return Donor', 'Return Donor'],
          datasets: [{
            data: [class0Count, class1Count],
            backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(16, 185, 129, 0.7)'],
            borderColor: ['rgba(239, 68, 68, 1)', 'rgba(16, 185, 129, 1)'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Donor Classification Distribution',
              font: { size: 16, weight: 'bold' }
            },
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Count' }
            }
          }
        }
      };

      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
      const base64Image = imageBuffer.toString('base64');

      visualizations.push({
        filename: `class_distribution_${Date.now()}.png`,
        url: `/api/visualize/image/${Date.now()}`,
        base64: `data:image/png;base64,${base64Image}`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      count: visualizations.length,
      visualizations
    });

  } catch (error) {
    console.error('Error generating blood data visualizations:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
