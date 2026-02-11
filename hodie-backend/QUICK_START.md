# Hodie Labs Backend API - Quick Start Guide

## What This Solves

✅ **Security**: Your Claude API key is currently exposed in the browser. Anyone can steal it.
✅ **Cost Control**: Free tier users cost you money with every message.
✅ **Scalability**: No way to handle 10,000+ users efficiently.

## Solution: Backend API Proxy

```
Frontend → Backend API → AI Providers
                         ├─ Groq (Free - $0 cost)
                         ├─ Claude Haiku (Paid tiers)
                         └─ Claude Sonnet (Premium)
```

## 5-Minute Setup

### Step 1: Get Groq API Key (FREE)

1. Go to https://console.groq.com
2. Sign up (free)
3. Create API key
4. Copy the key (starts with `gsk_...`)

### Step 2: Configure Environment

```bash
cd backend-api
cp .env.example .env
```

Edit `.env` and add your Groq key:
```env
GROQ_API_KEY=gsk_your_key_here
```

(Claude key already configured from your main project)

### Step 3: Install & Run

```bash
npm install
npm run dev
```

Server starts on `http://localhost:3001`

### Step 4: Test It

```bash
./test-api.sh
```

You should see:
- ✅ Health check passes
- ✅ Chat endpoint works (uses Groq for free tier)
- ✅ Usage tracking works
- ✅ Rate limiting works

## Key Features

### 1. Automatic Tier Routing

```javascript
// Free tier → Groq Llama 3 (FREE, no cost to you)
// Basic/Pro → Claude Haiku (good quality)
// Premium → Claude 3.5 Sonnet (best quality)
```

### 2. Rate Limiting

- Free: 5 requests/minute
- Basic: 20 requests/minute
- Pro: 100 requests/minute
- Premium: 200 requests/minute

### 3. Message Limits

- Free: 10 messages/month
- Basic: 100 messages/month
- Pro: 500 messages/month
- Premium: 1000 messages/month

### 4. Usage Tracking

Every message is tracked in MongoDB:
- Messages used this month
- Tokens consumed
- Costs per user
- Model used

## Cost Savings

### Before (Current Setup)
```
Free tier: $0.23 per user/month (Claude costs)
10,000 free users = $2,300/month LOSS
```

### After (With Groq)
```
Free tier: $0.08 per user/month (infrastructure only)
10,000 free users = $800/month loss
SAVINGS: $1,500/month (65% reduction)
```

## Frontend Integration

Update your ChatInterface to call the backend:

```typescript
// OLD (insecure):
const response = await claudeService.generateHealthResponse(...)

// NEW (secure):
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.uid,
    message: inputValue,
    conversationHistory: conversationHistory,
    healthContext: healthContext
  })
});

const data = await response.json();
console.log('AI Response:', data.response);
console.log('Metadata:', data.metadata); // tier, model, usage stats
```

## Next Steps

1. ✅ Backend API running locally
2. 🔲 Update frontend to call backend instead of Claude directly
3. 🔲 Deploy backend to Render.com or Heroku
4. 🔲 Add user authentication (verify subscription tier)
5. 🔲 Monitor usage and costs

## Deployment

### Deploy to Render.com (Free Tier Available)

1. Push code to GitHub
2. Go to https://render.com
3. Create "Web Service"
4. Connect repo → `backend-api` folder
5. Add environment variables from `.env`
6. Deploy

Your API will be at: `https://hodie-labs-api.onrender.com`

Update frontend to use this URL instead of `http://localhost:3001`

## Monitoring

Check usage stats:
```bash
curl http://localhost:3001/api/admin/usage-stats
```

See individual user usage:
```bash
curl http://localhost:3001/api/usage/user-id-here
```

## Troubleshooting

**"MongoDB connection failed"**
→ Check `MONGODB_URI` in `.env`

**"GROQ_API_KEY not configured"**
→ Add Groq key to `.env` (get from https://console.groq.com)

**Rate limit errors**
→ Normal! Users hitting their tier limits need to upgrade

**Free tier responses seem basic**
→ Expected! Groq Llama 3 is 70% as good as Claude (but FREE)

## Questions?

Read the full `README.md` for detailed docs.

Contact: info@hodielabs.com
