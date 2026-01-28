# Blood Dataset Information

## Download Status: ✅ COMPLETE

**Downloaded**: January 28, 2026
**Source**: Kaggle - mahmudulhaqueshawon/blood-dataset
**Location**: `/Users/oscar/Claude/Hodie/hodie-labs/datasets/blood-dataset/blood.csv`

## Dataset Summary

- **File**: blood.csv
- **Size**: 11KB
- **Records**: 748 rows (+ 1 header row)
- **Type**: Blood Donation Prediction Dataset

## Dataset Structure

| Column | Description |
|--------|-------------|
| **Recency** | Months since last blood donation |
| **Frequency** | Total number of blood donations made |
| **Monetary** | Total blood donated in c.c. (cubic centimeters) |
| **Time** | Months since first blood donation |
| **Class** | Binary target (0 or 1) - whether donor gave blood in March 2007 |

## Sample Data

```csv
Recency,Frequency,Monetary,Time,Class
2,50,12500,99,1
0,13,3250,28,1
1,17,4000,36,1
2,20,5000,45,1
1,24,6000,77,0
```

## Dataset Context

This is a **blood donation prediction dataset**, not a blood test/biomarker dataset. It contains information about blood donors and their donation patterns, used to predict future donation behavior.

### Key Insights:
- Average donation frequency patterns
- Time between donations (recency)
- Total donation volume over time
- Donor retention prediction

## Use Cases for HodieLabs

While this isn't a blood test biomarker dataset, it could be valuable for:

1. **Health Engagement Prediction**
   - Predict which users are likely to continue using health tracking
   - Model user engagement patterns similar to donation patterns

2. **Blood Donation Features**
   - If HodieLabs adds blood donation tracking
   - Encourage healthy donation habits
   - Track donation history

3. **Behavioral Analytics**
   - Pattern recognition for health behavior adherence
   - Time-series analysis of health activities
   - User retention modeling

4. **Machine Learning Training**
   - Practice dataset for classification models
   - Feature engineering examples
   - Time-series prediction training

## Alternative Blood Test Datasets

If you're looking for actual blood test biomarker data, consider these Kaggle datasets instead:
- Blood Test Analysis datasets
- Clinical lab results datasets
- CBC (Complete Blood Count) datasets
- Metabolic panel datasets

## Integration with HodieLabs

To use this dataset in the webapp:

1. **Upload via Chatbot**: Upload blood.csv through the AI chatbot
2. **API Integration**: POST to `/api/health-metrics` endpoint
3. **Database Storage**: Will be stored in MongoDB `healthMetrics` collection
4. **AI Analysis**: Kimi K2 will interpret and provide insights

## Next Steps

- [ ] Decide if this dataset is useful for current needs
- [ ] Search for blood biomarker datasets if needed
- [ ] Process and upload to MongoDB
- [ ] Train AI models on the data
- [ ] Create visualizations in dashboard
