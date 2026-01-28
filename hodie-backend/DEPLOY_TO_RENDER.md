# Deploy HodieLabs Backend to Render.com

## What I Fixed

✅ Updated MongoDB credentials to match Cluster0
✅ Added missing API endpoints:
- `/api/lab-results` (POST & GET)
- `/api/genetic-data` (POST & GET)
- `/api/wearable-data` (POST & GET)
- `/api/medical-reports` (POST & GET)

✅ Added schemas for all health data types
✅ Set NODE_ENV to production

## MongoDB Connection String (Updated)

```
mongodb+srv://loveoh19_db_user:19TV5683sport@cluster0.uhkdcnu.mongodb.net/hodie_app?retryWrites=true&w=majority
```

This now matches your Cluster0 in MongoDB Atlas!

## How to Deploy to Render.com

### Option 1: Via Render Dashboard (Recommended)

1. **Go to Render.com**
   - Visit https://dashboard.render.com
   - Log in to your account

2. **Find Your Backend Service**
   - Look for service: `hodie-backend-api`
   - If it doesn't exist, create a new Web Service

3. **Update Environment Variables**
   - Go to "Environment" tab
   - Update or add:
     ```
     MONGODB_URI=mongodb+srv://loveoh19_db_user:19TV5683sport@cluster0.uhkdcnu.mongodb.net/hodie_app?retryWrites=true&w=majority
     NODE_ENV=production
     PORT=10000
     ```

4. **Trigger Manual Deploy**
   - Go to "Manual Deploy" section
   - Click "Deploy latest commit"
   - Wait 2-5 minutes for deployment

5. **Verify It's Working**
   - Visit: https://hodie-backend-api.onrender.com/api/health
   - Should see: `{"status":"OK","message":"Hodie API is running","timestamp":"..."}`

### Option 2: Via Git Push (If Connected to GitHub)

1. **Commit Changes**
   ```bash
   cd /Users/oscar/Claude/Hodie/hodie-backend
   git add .
   git commit -m "Update MongoDB connection and add missing API endpoints"
   git push origin main
   ```

2. **Render Auto-Deploys**
   - If connected to GitHub, Render will auto-deploy
   - Check deployment progress in Render dashboard

### Option 3: Create New Service (If First Time)

1. **In Render Dashboard**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `hodie-backend` folder

2. **Configure Service**
   - **Name**: hodie-backend-api
   - **Region**: Oregon (US West) or nearest
   - **Branch**: main
   - **Root Directory**: hodie-backend
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

3. **Add Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://loveoh19_db_user:19TV5683sport@cluster0.uhkdcnu.mongodb.net/hodie_app?retryWrites=true&w=majority
   NODE_ENV=production
   ```

4. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

## Testing After Deployment

### 1. Test Health Check
```bash
curl https://hodie-backend-api.onrender.com/api/health
```

Expected response:
```json
{"status":"OK","message":"Hodie API is running","timestamp":"2026-01-28T..."}
```

### 2. Test File Upload Flow

Upload a file through HodieLabs webapp and check browser console for:
```
✅ AI interpretation complete
💾 Saving to database: lab-results
✅ Database save successful
```

### 3. Verify Data in MongoDB

Go to MongoDB Atlas → Browse Collections → hodie_app database

You should see these collections created automatically:
- `healthmetrics`
- `labresults`
- `geneticdatas`
- `wearabledatas`
- `medicalreports`

## Common Issues

### Issue: "Cannot read properties of undefined"
**Solution**: Backend needs to restart with new environment variables. Trigger manual deploy.

### Issue: "Connection refused" or "Not Found"
**Solution**:
1. Check service is running in Render dashboard
2. Verify URL is correct: https://hodie-backend-api.onrender.com
3. Check logs for errors

### Issue: "Network error" from webapp
**Solution**:
1. Verify backend is deployed and running
2. Check CORS settings in server.js (already configured)
3. Ensure API_BASE_URL in frontend .env is correct

## Verification Checklist

After deployment, verify:

- [ ] Backend health endpoint responds: `/api/health`
- [ ] MongoDB connection successful (check Render logs)
- [ ] Cluster0 shows "Active" status in MongoDB Atlas
- [ ] IP addresses whitelisted in MongoDB Network Access
- [ ] File uploads work from HodieLabs webapp
- [ ] Data appears in MongoDB collections

## Current Service URL

**Production API**: https://hodie-backend-api.onrender.com

All API endpoints are available at:
- `POST /api/health-metrics`
- `POST /api/lab-results`
- `POST /api/genetic-data`
- `POST /api/wearable-data`
- `POST /api/medical-reports`

Each endpoint also has a corresponding GET route: `GET /api/{endpoint}/:userId`
