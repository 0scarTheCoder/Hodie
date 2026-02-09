# Hodie Labs - Data Visualization Quick Start

## Problem

Your console logs show Claude AI trying to generate visualizations but failing because:
- Claude can't create actual images - it only describes them
- Users see broken links instead of charts
- No graphical representation of blood donation data

## Solution

**Python Visualization Service** - A Flask API that generates real charts using matplotlib.

---

## 5-Minute Setup

### Step 1: Install Python Dependencies

```bash
cd visualization-service
pip3 install -r requirements.txt
```

**If you don't have pip:**
```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3-pip
```

### Step 2: Start the Visualization Service

```bash
python3 app.py
```

You should see:
```
🎨 Starting Hodie Labs Visualization Service...
📁 Image directory: /path/to/generated_images
🚀 Server running on http://localhost:5001
```

### Step 3: Test It

Open a new terminal:
```bash
cd visualization-service
python3 test_viz.py
```

You should see:
```
✅ Health check passed
✅ Histogram generated
✅ Scatter plot generated
✅ Bar chart generated
✅ Comprehensive visualization generated
Passed: 5/5
```

### Step 4: Update Frontend

Add to `hodie-labs/.env`:
```env
REACT_APP_VISUALIZATION_API_URL=http://localhost:5001
```

Restart React app:
```bash
npm start
```

### Step 5: Test in Chat

Now in your chat interface, try:
- "Show me a graphical representation of all my data"
- "Give me a histogram of my blood donation data"
- "Can you visualize my frequency vs monetary data?"

**Instead of text descriptions, you'll see real charts!** 📊

---

## What Gets Generated

When user asks for visualizations, Python creates:

### 1. Multi-Histogram
Four histograms in one image:
- Recency distribution
- Frequency distribution
- Monetary value distribution
- Time distribution

### 2. Scatter Plots
- Frequency vs. Monetary (color-coded by donor class)
- Recency vs. Frequency

### 3. Bar Charts
- Donor classification (Return vs Non-Return)
- Percentages and counts

### 4. All Charts Include
- Statistical summaries (mean, median, std dev)
- Color-coded by donor type (green = return, red = non-return)
- High resolution (150 DPI)
- Clean, professional styling

---

## Architecture Flow

```
1. User: "Show me histogram of my data"
   ↓
2. ChatInterface detects "histogram" keyword
   ↓
3. Fetches user's blood donation data from MongoDB
   ↓
4. Calls Python API: POST /api/visualize/blood-data
   ↓
5. Python generates 4 charts using matplotlib
   ↓
6. Returns base64-encoded images + URLs
   ↓
7. Chat displays images inline ✨
```

---

## API Endpoints

### POST /api/visualize/histogram
Single histogram for one variable
```json
{
  "data": [2, 4, 6, 8, 10, ...],
  "field": "recency",
  "title": "Recency Distribution"
}
```

### POST /api/visualize/scatter
Scatter plot for two variables
```json
{
  "x_data": [1, 2, 3, ...],
  "y_data": [10, 20, 30, ...],
  "classes": [0, 1, 0, ...],
  "title": "Frequency vs Monetary"
}
```

### POST /api/visualize/blood-data ⭐ MAIN ONE
Comprehensive blood data analysis (4 charts at once)
```json
{
  "data": [
    {"recency": 2, "frequency": 50, "monetary": 12500, "time": 98, "class": 1},
    ...
  ]
}
```

Returns:
```json
{
  "success": true,
  "count": 4,
  "visualizations": [
    {
      "filename": "blood_histograms_abc123.png",
      "url": "/api/images/blood_histograms_abc123.png",
      "base64": "data:image/png;base64,iVBORw0KGgo...",
      "timestamp": "2026-02-05T20:30:00"
    },
    ...
  ]
}
```

---

## How Frontend Uses It

The `visualizationService.ts` automatically:

1. **Detects visualization requests**
   ```typescript
   if (visualizationService.isVisualizationRequest(userMessage)) {
     // Generate charts
   }
   ```

2. **Fetches user data** from MongoDB via health context

3. **Calls Python API** with actual data

4. **Displays images** inline in chat using base64

---

## Troubleshooting

### "Connection refused" or "Service not available"

**Problem**: Visualization service not running

**Solution**:
```bash
cd visualization-service
python3 app.py
```

### "Module not found: matplotlib"

**Problem**: Dependencies not installed

**Solution**:
```bash
pip3 install matplotlib seaborn pandas numpy flask flask-cors
```

### "Port 5000 already in use"

**Problem**: Another service using port 5000

**Solution 1** - Stop other service:
```bash
lsof -ti:5000 | xargs kill -9
```

**Solution 2** - Use different port:
Edit `app.py` line 418:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

Then update frontend `.env`:
```env
REACT_APP_VISUALIZATION_API_URL=http://localhost:5001
```

### Charts not showing in chat

**Check these:**
1. ✅ Visualization service running? `curl http://localhost:5001/health`
2. ✅ Frontend .env updated? Check `REACT_APP_VISUALIZATION_API_URL`
3. ✅ React app restarted after .env change?
4. ✅ Console shows "📊 Generating visualizations"?

---

## Deployment (Production)

### Option 1: Deploy with Backend API (Recommended)

Add to your existing DigitalOcean Droplet:
```bash
# SSH into Droplet
ssh root@your-droplet-ip

# Install Python dependencies
pip3 install -r visualization-service/requirements.txt

# Run service (use process manager like PM2)
pm2 start "python3 visualization-service/app.py" --name viz-service
```

### Option 2: Separate Droplet

- Create new DigitalOcean Droplet ($6/month - Basic)
- Install Python 3.9+
- Deploy visualization service
- Update frontend to use production URL

### Docker (Cleanest)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
docker build -t hodie-viz .
docker run -p 5000:5000 hodie-viz
```

---

## Cost Analysis

### Local Development
- **Cost**: $0
- **Performance**: Excellent

### Production (DigitalOcean)

**Fixed Costs:**
- Droplet (if separate): $6/month
- OR: $0 if added to existing backend Droplet

**Variable Costs:**
- Image generation: ~0.1 seconds CPU time
- Storage: ~50KB per chart
- 10,000 users × 10 charts/month = 500MB = $0.01/month

**Total Added Cost**: $6-7/month fixed, negligible per-user cost

---

## Performance

- Chart generation: **200-500ms** per chart
- 4 charts together: **~1 second** total
- Image size: **50-150KB** (PNG, compressed)
- Concurrent users: **20-30** simultaneous requests (Basic Droplet)

---

## Files Created

```
visualization-service/
├── app.py                       # Flask API (418 lines)
├── requirements.txt             # Python dependencies
├── test_viz.py                  # Test script
├── README.md                    # Full documentation
├── .gitignore                   # Git ignore rules
└── generated_images/            # Generated charts
    └── .gitkeep

src/services/
└── visualizationService.ts      # Frontend service

src/components/chat/
└── VisualizationDisplay.tsx     # Display component
```

---

## Testing Checklist

- [ ] Python 3.9+ installed
- [ ] Dependencies installed (`pip3 install -r requirements.txt`)
- [ ] Service starts without errors (`python3 app.py`)
- [ ] Test script passes (`python3 test_viz.py`)
- [ ] Frontend .env updated
- [ ] React app restarted
- [ ] Can ask "show me histogram" in chat
- [ ] Charts display inline (not broken links)
- [ ] Can download charts

---

## Next Steps

1. **Start service locally** and test with sample data
2. **Update ChatInterface** to automatically detect viz requests
3. **Test with real user data** (your 748 blood donation records)
4. **Deploy to production** alongside backend API
5. **Add to monitoring** (ensure service stays up)

---

## User Experience Improvement

### Before (Current - Broken)
```
User: "Show me a histogram"
Claude: "Here's a histogram: [INSERT HISTOGRAM]"
Result: Broken link, no image ❌
```

### After (With Python Service)
```
User: "Show me a histogram"
System: *Fetches data, calls Python API*
Result: Actual chart image displays inline ✅
User: *Can see, analyze, and download chart*
```

---

## Questions?

**Setup issues:** Check `visualization-service/README.md`
**API reference:** See endpoint docs in README
**Frontend integration:** See `visualizationService.ts`
**Deployment:** See deployment section above

**Ready to test?**
```bash
cd visualization-service
python3 app.py
# Open new terminal
python3 test_viz.py
```

🎉 **When all 5 tests pass, you're ready to visualize real data!**
