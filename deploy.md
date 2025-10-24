# Hodie Backend Deployment Guide

## Option 1: Render.com (Recommended)

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Choose "Public Git repository"
4. Enter this repository URL: `https://github.com/0scarTheCoder/Hodie-Backend`
5. Configure:
   - Name: `hodie-backend-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

6. Add Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://hodieuser:hodiepass123@cluster0.uhkdcnu.mongodb.net/hodie_app?retryWrites=true&w=majority`
   - `NODE_ENV` = `production`

7. Click "Create Web Service"

## Option 2: Railway.app

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub and select the Hodie-Backend repo
4. Add the same environment variables as above

## Option 3: Vercel

1. Go to https://vercel.com
2. Import your GitHub project
3. Add environment variables
4. Deploy

## After Deployment

Once deployed, you'll get a URL like:
- Render: `https://hodie-backend-api.onrender.com`
- Railway: `https://hodie-backend-production.up.railway.app`

Update your frontend environment variables to use this URL.