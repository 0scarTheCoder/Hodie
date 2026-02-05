# Claude AI Setup Guide

## Why Use Claude AI for Health Data Analysis?

Claude AI (by Anthropic) offers several advantages over Kimi K2:

✅ **Superior Reasoning**: Claude 3.5 Sonnet has best-in-class analysis capabilities
✅ **200K Context**: Massive context window for analyzing large health datasets
✅ **Medical Knowledge**: Extensive training on medical and scientific literature
✅ **Structured Output**: Better at following JSON formatting instructions
✅ **Cost Effective**: $3 per million tokens (~$0.01 per health file analysis)
✅ **Australian English**: Native support for Australian spelling and terminology

## Setup Steps

### Step 1: Get Your Claude API Key

1. Go to https://console.anthropic.com
2. Sign in with your Claude account
3. Click "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy the API key (starts with `sk-ant-...`)

**Pricing**:
- $5 free credit for new accounts
- Claude 3.5 Sonnet: $3 per million input tokens
- Claude 3.5 Haiku: $0.25 per million tokens (faster, cheaper)

### Step 2: Add API Key to .env

Open `/Users/oscar/Claude/Hodie/hodie-labs/.env` and update:

```env
# Claude AI API Key
REACT_APP_CLAUDE_API_KEY=sk-ant-your_actual_key_here
```

### Step 3: Rebuild and Deploy

```bash
cd /Users/oscar/Claude/Hodie/hodie-labs
npm run build
firebase deploy --only hosting
```

### Step 4: Test Claude AI

1. Go to https://hodie-labs-webapp.web.app
2. Open browser console (F12)
3. Type: `localStorage.setItem('aiProvider', 'claude')`
4. Refresh the page
5. Upload a health file (like blood.csv)
6. Watch the console for Claude AI processing

## Switching Between AI Providers

### Use Kimi K2 (Default):
```javascript
localStorage.setItem('aiProvider', 'kimi')
```

### Use Claude AI:
```javascript
localStorage.setItem('aiProvider', 'claude')
```

### Check Current Provider:
```javascript
localStorage.getItem('aiProvider')
```

## Benchmark Comparison

Upload the same file (blood.csv) with both providers and compare:

| Metric | Kimi K2 | Claude AI |
|--------|---------|-----------|
| **Response Time** | 5-15 seconds | 3-10 seconds |
| **Context Window** | 256K tokens | 200K tokens |
| **Analysis Quality** | Good | Excellent |
| **JSON Formatting** | Sometimes breaks | Reliable |
| **Medical Knowledge** | Moderate | Extensive |
| **Cost per Query** | ~$0.005 | ~$0.01 |
| **Australian English** | Limited | Native |

## Expected Performance

**Blood.csv Test (748 rows)**:
- **Input tokens**: ~2,000
- **Output tokens**: ~1,000
- **Cost**: ~$0.01 per analysis
- **Time**: 5-10 seconds
- **Quality**: High-confidence database mappings, detailed health insights

## Testing Checklist

- [ ] Get Claude API key from console.anthropic.com
- [ ] Add key to `.env` file
- [ ] Rebuild frontend: `npm run build`
- [ ] Deploy to Firebase: `firebase deploy --only hosting`
- [ ] Switch to Claude: `localStorage.setItem('aiProvider', 'claude')`
- [ ] Upload blood.csv file
- [ ] Check MongoDB for data
- [ ] Compare results with Kimi K2

## Troubleshooting

### Error: "Claude API not initialized"
- Check that `REACT_APP_CLAUDE_API_KEY` is set in `.env`
- Rebuild the app after adding the key
- Hard refresh browser (Cmd+Shift+R)

### Error: "Invalid API key"
- Verify the key starts with `sk-ant-`
- Make sure you copied the full key
- Check key is active in console.anthropic.com

### Error: "Rate limit exceeded"
- Claude free tier: 50 requests per minute
- Wait 60 seconds and try again
- Consider upgrading to paid tier for higher limits

### CSP Error
- Already fixed in firebase.json (api.anthropic.com allowed)
- If still blocked, check console for exact domain needed

## Recommendations

**For Development/Testing**:
- Use Claude 3.5 Haiku (faster, cheaper): `claude-3-5-haiku-20241022`
- Lower cost allows more experimentation

**For Production**:
- Use Claude 3.5 Sonnet (best quality): `claude-3-5-sonnet-20241022`
- Superior analysis worth the extra cost

**For Cost Optimization**:
- Cache common queries
- Use Haiku for simple queries, Sonnet for complex analysis
- Batch multiple files when possible

## Next Steps

After testing Claude AI, you can:

1. **Add UI Toggle**: Create a button in chat interface to switch AI providers
2. **A/B Testing**: Automatically compare both AIs for each upload
3. **Hybrid Approach**: Use Claude for file analysis, Kimi for chat
4. **Cost Tracking**: Log API costs for each provider

**Ready to test? Follow the steps above and compare the results!**
