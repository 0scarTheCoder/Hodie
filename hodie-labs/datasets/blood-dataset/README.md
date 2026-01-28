# Blood Dataset from Kaggle

## Overview
This folder contains the script to download a comprehensive blood dataset from Kaggle for use in the HodieLabs health analytics platform.

## Dataset Information
- **Source**: Kaggle
- **Dataset**: mahmudulhaqueshawon/blood-dataset
- **Purpose**: Blood test data for health analytics and AI training

## Usage

### Prerequisites
```bash
pip install kagglehub
```

### Kaggle API Setup
1. Create a Kaggle account at https://www.kaggle.com
2. Go to Account Settings → API → Create New API Token
3. Download `kaggle.json` and place it in `~/.kaggle/kaggle.json`
4. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

### Download Dataset
```bash
python download_blood_dataset.py
```

The script will download the dataset and print the local path where files are stored.

## Integration with HodieLabs

This dataset can be used to:
- Train AI models for blood test interpretation
- Provide reference ranges for biomarkers
- Generate health recommendations based on blood test results
- Validate uploaded blood test data
- Enhance the Kimi K2 AI chatbot's understanding of blood metrics

## Dataset Structure
The dataset typically includes:
- Blood test results (CBC, metabolic panel, lipid panel, etc.)
- Patient demographics (age, gender, etc.)
- Reference ranges for various biomarkers
- Test timestamps and metadata

## Next Steps
1. Download the dataset using the script
2. Explore the data structure and contents
3. Process and clean the data for HodieLabs integration
4. Upload processed data to MongoDB for AI training
5. Update the AI chatbot with enhanced blood test knowledge
