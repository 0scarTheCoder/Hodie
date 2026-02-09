#!/usr/bin/env python3
"""
Quick test script for Hodie Labs Visualization Service
Tests all endpoints with sample blood donation data
"""

import requests
import json

API_URL = "http://localhost:5001"

# Sample blood donation data
SAMPLE_DATA = [
    {"recency": 2, "frequency": 50, "monetary": 12500, "time": 98, "class": 1},
    {"recency": 0, "frequency": 13, "monetary": 3250, "time": 28, "class": 1},
    {"recency": 1, "frequency": 16, "monetary": 4000, "time": 35, "class": 1},
    {"recency": 2, "frequency": 20, "monetary": 5000, "time": 45, "class": 1},
    {"recency": 1, "frequency": 24, "monetary": 6000, "time": 77, "class": 0},
    {"recency": 4, "frequency": 4, "monetary": 1000, "time": 4, "class": 0},
    {"recency": 2, "frequency": 7, "monetary": 1750, "time": 14, "class": 1},
    {"recency": 1, "frequency": 12, "monetary": 3000, "time": 35, "class": 0},
    {"recency": 2, "frequency": 9, "monetary": 2250, "time": 22, "class": 1},
    {"recency": 5, "frequency": 46, "monetary": 11500, "time": 98, "class": 1},
]

def test_health_check():
    """Test health check endpoint"""
    print("\n1. Testing health check...")
    response = requests.get(f"{API_URL}/health")
    if response.ok:
        print("✅ Health check passed")
        print(f"   Status: {response.json()['status']}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False

def test_histogram():
    """Test histogram generation"""
    print("\n2. Testing histogram generation...")
    recency_data = [d['recency'] for d in SAMPLE_DATA]

    response = requests.post(
        f"{API_URL}/api/visualize/histogram",
        json={
            "data": recency_data,
            "field": "recency",
            "title": "Recency Distribution",
            "xlabel": "Days Since Last Donation",
            "bins": 10
        }
    )

    if response.ok:
        result = response.json()
        print("✅ Histogram generated")
        print(f"   Filename: {result['filename']}")
        print(f"   URL: {API_URL}{result['url']}")
        print(f"   Image size: {len(result['base64'])} bytes")
        return True
    else:
        print(f"❌ Histogram failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_scatter():
    """Test scatter plot generation"""
    print("\n3. Testing scatter plot...")
    frequency_data = [d['frequency'] for d in SAMPLE_DATA]
    monetary_data = [d['monetary'] for d in SAMPLE_DATA]
    classes = [d['class'] for d in SAMPLE_DATA]

    response = requests.post(
        f"{API_URL}/api/visualize/scatter",
        json={
            "x_data": frequency_data,
            "y_data": monetary_data,
            "classes": classes,
            "title": "Frequency vs. Monetary Value",
            "xlabel": "Frequency (donations)",
            "ylabel": "Monetary Value (c.c. blood)"
        }
    )

    if response.ok:
        result = response.json()
        print("✅ Scatter plot generated")
        print(f"   Filename: {result['filename']}")
        print(f"   URL: {API_URL}{result['url']}")
        return True
    else:
        print(f"❌ Scatter plot failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_bar_chart():
    """Test bar chart generation"""
    print("\n4. Testing bar chart...")
    return_donors = sum(1 for d in SAMPLE_DATA if d['class'] == 1)
    non_return_donors = sum(1 for d in SAMPLE_DATA if d['class'] == 0)

    response = requests.post(
        f"{API_URL}/api/visualize/bar-chart",
        json={
            "categories": ["Return Donor", "Non-Return Donor"],
            "values": [return_donors, non_return_donors],
            "title": "Donor Classification",
            "xlabel": "Donor Type",
            "ylabel": "Count"
        }
    )

    if response.ok:
        result = response.json()
        print("✅ Bar chart generated")
        print(f"   Filename: {result['filename']}")
        print(f"   URL: {API_URL}{result['url']}")
        return True
    else:
        print(f"❌ Bar chart failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_comprehensive_blood_viz():
    """Test comprehensive blood data visualization"""
    print("\n5. Testing comprehensive blood data visualization...")

    response = requests.post(
        f"{API_URL}/api/visualize/blood-data",
        json={
            "data": SAMPLE_DATA
        }
    )

    if response.ok:
        result = response.json()
        print(f"✅ Comprehensive visualization generated")
        print(f"   Generated {result['count']} charts:")
        for i, viz in enumerate(result['visualizations'], 1):
            print(f"   {i}. {viz['filename']}")
            print(f"      URL: {API_URL}{viz['url']}")
        return True
    else:
        print(f"❌ Comprehensive visualization failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def main():
    print("="*60)
    print("Hodie Labs Visualization Service - Test Suite")
    print("="*60)

    # Run all tests
    tests = [
        test_health_check,
        test_histogram,
        test_scatter,
        test_bar_chart,
        test_comprehensive_blood_viz
    ]

    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)

    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")

    if passed == total:
        print("✅ All tests passed!")
        print("\nNext steps:")
        print("1. Open browser: http://localhost:5000/api/images/")
        print("2. Update frontend .env with REACT_APP_VISUALIZATION_API_URL=http://localhost:5000")
        print("3. Test in chat: 'Show me a graphical representation of my data'")
    else:
        print(f"❌ {total - passed} test(s) failed")
        print("\nTroubleshooting:")
        print("1. Is the service running? python app.py")
        print("2. Check for port conflicts (default: 5000)")
        print("3. Verify dependencies: pip install -r requirements.txt")

if __name__ == "__main__":
    main()
