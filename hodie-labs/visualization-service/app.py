"""
Hodie Labs Visualization Service
Python Flask API for generating health data visualizations

Features:
- Generate histograms, scatter plots, line charts
- Process blood donation data
- Return image URLs for display in chat
- Support multiple chart types
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')  # Non-GUI backend
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import os
import uuid
from datetime import datetime
import io
import base64

app = Flask(__name__)

# CORS configuration - allow requests from frontend
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,https://hodie-labs-webapp.web.app,https://hodie-labs-webapp.firebaseapp.com').split(',')
CORS(app, origins=allowed_origins)

# Create directory for generated images
IMAGE_DIR = os.path.join(os.path.dirname(__file__), 'generated_images')
os.makedirs(IMAGE_DIR, exist_ok=True)

# Set style for all plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 10

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Hodie Labs Visualization Service',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/visualize/histogram', methods=['POST'])
def generate_histogram():
    """
    Generate histogram for blood donation data

    Request body:
    {
        "data": [...],  # Array of data points
        "field": "recency",  # Field to visualize
        "title": "Recency Distribution",
        "xlabel": "Days Since Last Donation",
        "bins": 20
    }
    """
    try:
        data = request.json
        values = data.get('data', [])
        field = data.get('field', 'value')
        title = data.get('title', 'Distribution')
        xlabel = data.get('xlabel', field.capitalize())
        bins = data.get('bins', 20)

        if not values:
            return jsonify({'error': 'No data provided'}), 400

        # Create histogram
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.hist(values, bins=bins, edgecolor='black', color='#3b82f6', alpha=0.7)
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel('Frequency', fontsize=12)
        ax.grid(True, alpha=0.3)

        # Add statistics text
        mean_val = np.mean(values)
        median_val = np.median(values)
        std_val = np.std(values)

        stats_text = f'Mean: {mean_val:.2f}\nMedian: {median_val:.2f}\nStd Dev: {std_val:.2f}'
        ax.text(0.98, 0.97, stats_text, transform=ax.transAxes,
                verticalalignment='top', horizontalalignment='right',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

        plt.tight_layout()

        # Save and return image
        image_data = save_figure(fig, 'histogram')
        plt.close(fig)

        return jsonify(image_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualize/scatter', methods=['POST'])
def generate_scatter():
    """
    Generate scatter plot for blood donation data

    Request body:
    {
        "x_data": [...],
        "y_data": [...],
        "classes": [...],  # Optional: for color coding
        "title": "Frequency vs Monetary",
        "xlabel": "Frequency",
        "ylabel": "Monetary Value"
    }
    """
    try:
        data = request.json
        x_data = data.get('x_data', [])
        y_data = data.get('y_data', [])
        classes = data.get('classes', None)
        title = data.get('title', 'Scatter Plot')
        xlabel = data.get('xlabel', 'X')
        ylabel = data.get('ylabel', 'Y')

        if not x_data or not y_data:
            return jsonify({'error': 'x_data and y_data required'}), 400

        fig, ax = plt.subplots(figsize=(10, 6))

        if classes:
            # Color code by class
            df = pd.DataFrame({
                'x': x_data,
                'y': y_data,
                'class': classes
            })

            for class_val in df['class'].unique():
                class_data = df[df['class'] == class_val]
                color = '#10b981' if class_val == 1 else '#ef4444'
                label = 'Return Donor' if class_val == 1 else 'Non-Return Donor'
                ax.scatter(class_data['x'], class_data['y'],
                          alpha=0.6, s=50, c=color, label=label, edgecolors='white')

            ax.legend()
        else:
            ax.scatter(x_data, y_data, alpha=0.6, s=50, c='#3b82f6', edgecolors='white')

        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.grid(True, alpha=0.3)

        plt.tight_layout()

        image_data = save_figure(fig, 'scatter')
        plt.close(fig)

        return jsonify(image_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualize/multi-histogram', methods=['POST'])
def generate_multi_histogram():
    """
    Generate multiple histograms in one figure

    Request body:
    {
        "datasets": [
            {"data": [...], "label": "Recency", "color": "#3b82f6"},
            {"data": [...], "label": "Frequency", "color": "#10b981"}
        ],
        "title": "Blood Donation Metrics"
    }
    """
    try:
        data = request.json
        datasets = data.get('datasets', [])
        title = data.get('title', 'Multi-Variable Distribution')

        if len(datasets) < 2:
            return jsonify({'error': 'At least 2 datasets required'}), 400

        # Create subplots
        n_plots = len(datasets)
        rows = (n_plots + 1) // 2
        cols = 2 if n_plots > 1 else 1

        fig, axes = plt.subplots(rows, cols, figsize=(14, 5 * rows))
        axes = axes.flatten() if n_plots > 1 else [axes]

        for idx, dataset in enumerate(datasets):
            values = dataset.get('data', [])
            label = dataset.get('label', f'Variable {idx+1}')
            color = dataset.get('color', '#3b82f6')

            ax = axes[idx]
            ax.hist(values, bins=20, edgecolor='black', color=color, alpha=0.7)
            ax.set_title(label, fontsize=14, fontweight='bold')
            ax.set_xlabel('Value', fontsize=10)
            ax.set_ylabel('Frequency', fontsize=10)
            ax.grid(True, alpha=0.3)

            # Add statistics
            mean_val = np.mean(values)
            ax.axvline(mean_val, color='red', linestyle='--', linewidth=2, label=f'Mean: {mean_val:.2f}')
            ax.legend()

        # Hide unused subplots
        for idx in range(len(datasets), len(axes)):
            axes[idx].set_visible(False)

        fig.suptitle(title, fontsize=18, fontweight='bold', y=1.00)
        plt.tight_layout()

        image_data = save_figure(fig, 'multi_histogram')
        plt.close(fig)

        return jsonify(image_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualize/bar-chart', methods=['POST'])
def generate_bar_chart():
    """
    Generate bar chart (e.g., class distribution)

    Request body:
    {
        "categories": ["Return Donor", "Non-Return Donor"],
        "values": [578, 170],
        "title": "Donor Classification",
        "xlabel": "Donor Type",
        "ylabel": "Count"
    }
    """
    try:
        data = request.json
        categories = data.get('categories', [])
        values = data.get('values', [])
        title = data.get('title', 'Bar Chart')
        xlabel = data.get('xlabel', 'Category')
        ylabel = data.get('ylabel', 'Value')

        if not categories or not values:
            return jsonify({'error': 'categories and values required'}), 400

        fig, ax = plt.subplots(figsize=(10, 6))

        colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']
        bars = ax.bar(categories, values, color=colors[:len(categories)],
                      edgecolor='black', alpha=0.7)

        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.grid(True, alpha=0.3, axis='y')

        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{int(height)}',
                   ha='center', va='bottom', fontweight='bold')

        plt.tight_layout()

        image_data = save_figure(fig, 'bar_chart')
        plt.close(fig)

        return jsonify(image_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualize/blood-data', methods=['POST'])
def visualize_blood_data():
    """
    Generate comprehensive visualizations for blood donation data

    Request body:
    {
        "data": [
            {"recency": 2, "frequency": 50, "monetary": 12500, "time": 98, "class": 1},
            ...
        ]
    }

    Returns: Multiple visualization URLs
    """
    try:
        request_data = request.json
        records = request_data.get('data', [])

        if not records:
            return jsonify({'error': 'No data provided'}), 400

        # Convert to DataFrame
        df = pd.DataFrame(records)

        # Generate multiple visualizations
        visualizations = []

        # 1. Multi-histogram for all numeric fields
        fig1, axes = plt.subplots(2, 2, figsize=(14, 10))
        axes = axes.flatten()

        fields = ['recency', 'frequency', 'monetary', 'time']
        colors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7']

        for idx, field in enumerate(fields):
            if field in df.columns:
                ax = axes[idx]
                values = df[field].values
                ax.hist(values, bins=20, edgecolor='black', color=colors[idx], alpha=0.7)
                ax.set_title(f'{field.capitalize()} Distribution', fontsize=14, fontweight='bold')
                ax.set_xlabel(field.capitalize(), fontsize=10)
                ax.set_ylabel('Frequency', fontsize=10)
                ax.grid(True, alpha=0.3)

                # Add mean line
                mean_val = np.mean(values)
                ax.axvline(mean_val, color='red', linestyle='--', linewidth=2,
                          label=f'Mean: {mean_val:.2f}')
                ax.legend()

        fig1.suptitle('Blood Donation Data - Distribution Analysis',
                     fontsize=18, fontweight='bold')
        plt.tight_layout()

        viz1 = save_figure(fig1, 'blood_histograms')
        visualizations.append(viz1)
        plt.close(fig1)

        # 2. Scatter plot: Frequency vs Monetary
        if 'frequency' in df.columns and 'monetary' in df.columns and 'class' in df.columns:
            fig2, ax = plt.subplots(figsize=(10, 6))

            for class_val in [0, 1]:
                class_data = df[df['class'] == class_val]
                color = '#10b981' if class_val == 1 else '#ef4444'
                label = 'Return Donor' if class_val == 1 else 'Non-Return Donor'
                ax.scatter(class_data['frequency'], class_data['monetary'],
                          alpha=0.6, s=50, c=color, label=label, edgecolors='white')

            ax.set_title('Frequency vs. Monetary Value', fontsize=16, fontweight='bold')
            ax.set_xlabel('Frequency (donations)', fontsize=12)
            ax.set_ylabel('Monetary Value (c.c. blood)', fontsize=12)
            ax.legend()
            ax.grid(True, alpha=0.3)
            plt.tight_layout()

            viz2 = save_figure(fig2, 'frequency_vs_monetary')
            visualizations.append(viz2)
            plt.close(fig2)

        # 3. Class distribution bar chart
        if 'class' in df.columns:
            fig3, ax = plt.subplots(figsize=(8, 6))

            class_counts = df['class'].value_counts().sort_index()
            categories = ['Non-Return Donor', 'Return Donor']
            values = [class_counts.get(0, 0), class_counts.get(1, 0)]
            colors_bar = ['#ef4444', '#10b981']

            bars = ax.bar(categories, values, color=colors_bar, edgecolor='black', alpha=0.7)
            ax.set_title('Donor Classification Distribution', fontsize=16, fontweight='bold')
            ax.set_ylabel('Count', fontsize=12)
            ax.grid(True, alpha=0.3, axis='y')

            # Add percentages on bars
            total = sum(values)
            for bar, val in zip(bars, values):
                height = bar.get_height()
                percentage = (val / total) * 100
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{int(val)}\n({percentage:.1f}%)',
                       ha='center', va='bottom', fontweight='bold')

            plt.tight_layout()

            viz3 = save_figure(fig3, 'class_distribution')
            visualizations.append(viz3)
            plt.close(fig3)

        # 4. Recency vs Frequency scatter
        if 'recency' in df.columns and 'frequency' in df.columns:
            fig4, ax = plt.subplots(figsize=(10, 6))

            ax.scatter(df['recency'], df['frequency'],
                      alpha=0.5, s=40, c='#3b82f6', edgecolors='white')
            ax.set_title('Recency vs. Frequency Analysis', fontsize=16, fontweight='bold')
            ax.set_xlabel('Recency (days since last donation)', fontsize=12)
            ax.set_ylabel('Frequency (total donations)', fontsize=12)
            ax.grid(True, alpha=0.3)
            plt.tight_layout()

            viz4 = save_figure(fig4, 'recency_vs_frequency')
            visualizations.append(viz4)
            plt.close(fig4)

        # Return all visualization URLs
        return jsonify({
            'success': True,
            'count': len(visualizations),
            'visualizations': visualizations
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def save_figure(fig, prefix='chart'):
    """Save matplotlib figure and return image data"""
    # Generate unique filename
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}.png"
    filepath = os.path.join(IMAGE_DIR, filename)

    # Save figure
    fig.savefig(filepath, dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')

    # Also generate base64 for immediate display
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    buffer.close()

    return {
        'filename': filename,
        'url': f'/api/images/{filename}',
        'base64': f'data:image/png;base64,{image_base64}',
        'timestamp': datetime.now().isoformat()
    }

@app.route('/api/images/<filename>', methods=['GET'])
def serve_image(filename):
    """Serve generated images"""
    filepath = os.path.join(IMAGE_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/png')
    return jsonify({'error': 'Image not found'}), 404

@app.route('/api/visualize/cleanup', methods=['POST'])
def cleanup_old_images():
    """Clean up images older than 24 hours"""
    try:
        now = datetime.now()
        deleted = 0

        for filename in os.listdir(IMAGE_DIR):
            filepath = os.path.join(IMAGE_DIR, filename)
            if os.path.isfile(filepath):
                file_age = now - datetime.fromtimestamp(os.path.getmtime(filepath))
                if file_age.total_seconds() > 86400:  # 24 hours
                    os.remove(filepath)
                    deleted += 1

        return jsonify({
            'success': True,
            'deleted': deleted,
            'message': f'Cleaned up {deleted} old images'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable (for cloud deployment) or default to 5001
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'

    print('🎨 Starting Hodie Labs Visualization Service...')
    print(f'📁 Image directory: {IMAGE_DIR}')
    print(f'🚀 Server running on port {port}')
    print(f'🔧 Debug mode: {debug}')

    app.run(host='0.0.0.0', port=port, debug=debug)
