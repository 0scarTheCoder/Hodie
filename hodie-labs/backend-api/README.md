# Hodie Labs Backend API

Secure AI proxy server with tiered subscription access control.

## Purpose

This backend API solves critical security and scalability issues:

1. **Security**: Hides API keys from frontend (prevents theft/abuse)
2. **Cost Control**: Routes users to appropriate AI models based on subscription tier
3. **Rate Limiting**: Enforces message limits per tier (10/100/500/1000 per month)
4. **Usage Tracking**: Monitors AI usage for billing and analytics
5. **Scalability**: Handles 100,000+ users with consistent margins

## Architecture

```
Frontend (React) → Backend API → AI Providers
                                 ├─ Groq (Free Tier)
                                 ├─ Claude Haiku (Basic/Pro)
                                 └─ Claude Sonnet (Premium)
```

## Subscription Tiers

| Tier | Price | AI Model | Messages/Month | Cost to You |
|------|-------|----------|----------------|-------------|
| **Free** | $0 | Groq Llama 3 | 10 | $0.08 |
| **Basic** | $9.99 | Claude Haiku | 100 | $1.87 |
| **Pro** | $24.99 | Claude Haiku/Sonnet | 500 | $5.90 |
| **Premium** | $49.99 | Claude 3.5 Sonnet | 1000 | $45.76 |

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend-api
npm install
```

### 2. Configure Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# AI API Keys
CLAUDE_API_KEY=sk-ant-api03-...
GROQ_API_KEY=gsk_...  # Get from https://console.groq.com
KIMI_K2_API_KEY=sk-k70lkhZA...
```

### 3. Get Groq API Key (FREE)

1. Go to https://console.groq.com
2. Sign up for free account
3. Create API key
4. Copy to `.env` as `GROQ_API_KEY`

**Benefits:**
- 14,400 free requests per day
- 300+ tokens/second (very fast)
- Zero cost for free tier users

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3001`

### 5. Test the API

```bash
# Health check
curl http://localhost:3001/health

# Test chat (free tier)
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "message": "What are some tips for better sleep?"
  }'
```

## API Endpoints

### POST /api/chat

Send a chat message to AI.

**Request:**
```json
{
  "userId": "user-id-here",
  "message": "Your health question",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "healthContext": {
    "recentHealthData": { "steps": 8500 },
    "labResults": []
  }
}
```

**Response:**
```json
{
  "response": "AI-generated health advice...",
  "metadata": {
    "tier": "free",
    "model": "groq-llama-3-8b",
    "tokensUsed": 823,
    "messagesRemaining": 9,
    "messagesUsed": 1,
    "limit": 10
  }
}
```

**Tier-based Routing:**
- Free tier → Groq Llama 3 (free, fast)
- Basic/Pro → Claude Haiku (good quality)
- Premium → Claude 3.5 Sonnet (best quality)

### POST /api/analyze-file

Analyze uploaded health file (paid tiers only).

**Request:**
```json
{
  "userId": "user-id-here",
  "fileData": { "data": [...] },
  "fileName": "blood_test.csv",
  "fileCategory": "lab_results"
}
```

**Response:**
```json
{
  "analysis": {
    "interpretation": "This is blood donation data...",
    "databaseMappings": [...],
    "recommendations": [...]
  },
  "metadata": {
    "tier": "pro",
    "model": "claude-3-haiku",
    "fileName": "blood_test.csv"
  }
}
```

### GET /api/usage/:userId

Get user's current usage statistics.

**Response:**
```json
{
  "userId": "user-123",
  "tier": "pro",
  "messagesUsed": 47,
  "limit": 500,
  "remaining": 453,
  "month": "2026-02-01T00:00:00.000Z",
  "tokensUsed": 56432
}
```

### GET /api/admin/usage-stats

Get usage statistics across all users (admin only).

**Response:**
```json
{
  "month": "2026-02-01T00:00:00.000Z",
  "stats": [
    {
      "_id": "free",
      "totalUsers": 7000,
      "totalMessages": 45000,
      "totalTokens": 36000000,
      "avgMessagesPerUser": 6.4
    },
    {
      "_id": "pro",
      "totalUsers": 800,
      "totalMessages": 120000,
      "totalTokens": 144000000,
      "avgMessagesPerUser": 150
    }
  ]
}
```

## Rate Limiting

Rate limits are enforced per tier (per minute):

- Free: 5 requests/minute
- Basic: 20 requests/minute
- Pro: 100 requests/minute
- Premium: 200 requests/minute

If exceeded, returns `429 Too Many Requests`.

## Message Limits

Monthly message limits are enforced per tier:

- Free: 10 messages/month
- Basic: 100 messages/month
- Pro: 500 messages/month
- Premium: 1000 messages/month

If exceeded, returns `429` with upgrade message.

## Usage Tracking

All AI usage is tracked in MongoDB for billing:

```javascript
{
  userId: "user-123",
  tier: "pro",
  month: ISODate("2026-02-01T00:00:00Z"),
  messagesUsed: 47,
  tokensUsed: 56432,
  filesAnalyzed: 3,
  lastUsed: ISODate("2026-02-05T14:23:00Z"),
  history: [
    {
      timestamp: ISODate("2026-02-05T14:23:00Z"),
      type: "message",
      model: "claude-3-haiku",
      tokens: 1234
    }
  ]
}
```

## Frontend Integration

Update your React app to call the backend instead of Claude directly:

**Before (INSECURE - exposed API key):**
```typescript
// ❌ BAD: API key exposed in browser
const client = new Anthropic({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});
```

**After (SECURE - using backend proxy):**
```typescript
// ✅ GOOD: API key hidden on backend
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
const aiResponse = data.response;
const metadata = data.metadata; // tier, model, usage stats
```

## Deployment

### Deploy to Render.com (Recommended)

1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
4. Connect GitHub repo: `backend-api` folder
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all from `.env`
6. Deploy

Your API will be available at: `https://your-app.onrender.com`

### Deploy to Heroku

```bash
heroku create hodie-labs-api
heroku config:set CLAUDE_API_KEY=sk-ant-...
heroku config:set GROQ_API_KEY=gsk_...
heroku config:set MONGODB_URI=mongodb+srv://...
git push heroku main
```

### Deploy to AWS Lambda (Serverless)

Use AWS Lambda + API Gateway for serverless deployment. See `docs/aws-deployment.md`.

## Security Best Practices

1. **Never expose API keys in frontend**
   - All AI API keys stay on backend
   - Use environment variables
   - Add to `.gitignore`

2. **Use HTTPS in production**
   - Enable SSL/TLS
   - Use secure headers

3. **Implement authentication**
   - Verify user JWT tokens
   - Check subscription status
   - Rate limit per user

4. **Monitor for abuse**
   - Track usage patterns
   - Alert on suspicious activity
   - Implement IP rate limiting

## Cost Monitoring

Track your costs with the admin endpoint:

```bash
curl http://localhost:3001/api/admin/usage-stats
```

**Expected Monthly Costs (10,000 users):**

- 7,000 free users × $0.08 = $560
- 2,000 basic users × $1.87 = $3,740
- 800 pro users × $5.90 = $4,720
- 200 premium users × $45.76 = $9,152

**Total Costs:** $18,172/month
**Total Revenue:** $49,970/month
**Profit:** $31,798/month (64% margin)

## Troubleshooting

### Error: "CLAUDE_API_KEY not configured"

Add your Claude API key to `.env`:
```env
CLAUDE_API_KEY=sk-ant-api03-...
```

### Error: "MongoDB connection failed"

Check MongoDB URI in `.env`:
```env
MONGODB_URI=mongodb+srv://...
```

Test connection:
```bash
mongosh "mongodb+srv://..."
```

### Error: "Rate limit exceeded"

User has hit their tier's rate limit. They need to:
1. Wait 1 minute
2. Upgrade to higher tier

### Free tier returning fallback responses

Groq API key not configured. Either:
1. Add `GROQ_API_KEY` to `.env` (recommended)
2. Accept fallback responses (simple rule-based)

## Next Steps

1. **Get Groq API key** (free) from https://console.groq.com
2. **Test locally** with `npm run dev`
3. **Deploy to Render.com** or Heroku
4. **Update frontend** to call backend API instead of Claude directly
5. **Monitor usage** with `/api/admin/usage-stats`
6. **Add authentication** (JWT tokens from main website)

## Support

Questions? Contact: info@hodielabs.com

## License

Proprietary - Hodie Labs Pty Ltd
