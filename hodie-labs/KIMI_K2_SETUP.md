# Kimi K2 AI Integration Setup

## Overview
Kimi K2 is a cutting-edge AI model that replaces static health data with intelligent, personalized insights for DNA analysis, health recommendations, and enhanced chat functionality.

## Why Kimi K2?
- **Advanced Analytics**: 256k token context window for comprehensive health data analysis
- **Cost Effective**: $0.15/$2.50 per million tokens (vs GPT-4's $2/$8)
- **High Performance**: Beats GPT-4 on many benchmarks
- **Medical Expertise**: Excellent for complex biomarker interpretation and health recommendations
- **Australian Focus**: Can be trained on Australian health guidelines and terminology

## Setup Instructions

### 1. Get Your Kimi K2 API Key

#### Option A: Official Moonshot Platform (Recommended)
1. Visit [platform.moonshot.ai](https://platform.moonshot.ai)
2. Sign up or log in to your account
3. Navigate to the API Keys section in the console
4. Click "Create New Key" and choose your desired permissions
5. Generate and copy your API key (shown only once!)
6. Use model: `kimi-k2-thinking` for advanced health analysis

#### Option B: AI/ML API (Third-party provider)
1. Visit [api.aimlapi.com](https://api.aimlapi.com)
2. Sign up for a free account (1000 requests/day)
3. Navigate to your dashboard and generate an API key
4. Use model: `moonshotai/kimi-k2` or `moonshotai/kimi-k2:free`

#### Option C: OpenRouter
1. Visit [openrouter.ai](https://openrouter.ai)
2. Create an account and get your API key
3. Use model: `moonshotai/kimi-k2` or `moonshotai/kimi-k2:free`

### 2. Configure Your Environment

Create or update your `.env` file in the project root:

```bash
# Kimi K2 AI Configuration
REACT_APP_KIMI_K2_API_KEY=your_kimi_k2_api_key_here

# Optional: If using alternative providers
# REACT_APP_KIMI_K2_PROVIDER=aimlapi  # or 'openrouter' or 'together'
```

### 3. Test the Integration

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

3. **Test Features:**
   - Navigate to the DNA screen for AI-generated genetic insights
   - Check Recommendations screen for personalized health advice
   - Try the enhanced chat interface for intelligent health conversations

## Features Enabled with Kimi K2

### 🧬 Enhanced DNA Analysis
- **Dynamic Genetic Insights**: Real-time analysis of genetic variants
- **Personalized Recommendations**: Tailored advice based on genetic profile
- **Australian Health Guidelines**: Recommendations follow local health standards

### 📊 Intelligent Health Recommendations  
- **Contextual Advice**: Based on current health metrics and history
- **Priority Scoring**: AI determines which recommendations have the highest impact
- **Realistic Timeframes**: Evidence-based timelines for health improvements

### 💬 Advanced Health Chat
- **Contextual Conversations**: Remembers previous interactions and health data
- **Biomarker Interpretation**: Explains complex health metrics in simple terms
- **Australian Terminology**: Uses GP, chemist, Medicare, and local health resources

### 🔬 Biomarker Analysis
- **Lab Result Interpretation**: Analyzes blood work and health metrics
- **Trend Analysis**: Identifies patterns in health data over time
- **Risk Assessment**: Evaluates health risks based on multiple factors

## API Limits and Costs

### AI/ML API (Free Tier)
- **Requests**: 1000 per day
- **Rate Limit**: Generous limits for health apps
- **Cost**: Free tier available, paid plans for scaling

### OpenRouter
- **Free Tier**: Available with daily limits
- **Paid Plans**: Starting from $0.15 per million tokens

### Together AI
- **Credits**: $5 free credits to start
- **Competitive Pricing**: Cost-effective for production use

## Fallback System

The app includes intelligent fallbacks:
- If no API key is configured, uses enhanced local responses
- Graceful error handling maintains functionality
- User sees clear status indicators for AI capabilities

## Security Best Practices

✅ **API Key Security**
- Never expose API keys in frontend code
- Use environment variables for configuration
- Consider backend proxy for production deployments

✅ **Data Privacy**
- Health data is processed securely
- No sensitive data logged or stored unnecessarily
- Comply with Australian Privacy Act requirements

## Troubleshooting

### API Key Issues
```bash
# Check if your API key is loaded
console.log(process.env.REACT_APP_KIMI_K2_API_KEY ? 'API key loaded' : 'API key missing');
```

### Rate Limiting
- Monitor usage in your provider dashboard
- Implement request queuing for high-traffic scenarios
- Consider caching responses for common queries

### Performance Optimization
- Use shorter context windows for faster responses
- Implement request batching where possible
- Cache AI-generated insights for repeat users

## Advanced Configuration

### Custom Health Prompts
You can modify the health analysis prompts in `/src/services/kimiK2Service.ts`:

```typescript
// Customize DNA analysis prompts
private buildDNAAnalysisPrompt(category: string, healthContext?: HealthContext): string {
  // Add your custom prompt modifications here
}

// Customize health recommendation prompts
private buildRecommendationsPrompt(healthContext?: HealthContext): string {
  // Add your custom prompt modifications here  
}
```

### Provider Switching
To switch between API providers, update the service configuration:

```typescript
// In kimiK2Service.ts
private baseUrl: string = 'https://api.openrouter.ai/api/v1';  // For OpenRouter
private model: string = 'moonshotai/kimi-k2';
```

## Support and Resources

- **Kimi K2 Documentation**: [Official Docs](https://moonshotai.github.io/Kimi-K2/)
- **AI/ML API Support**: [Documentation](https://docs.aimlapi.com)
- **Health AI Best Practices**: Australian Digital Health guidelines
- **Issue Reporting**: Use GitHub issues for integration problems

---

**Next Steps**: After setup, test all health features to ensure AI integration is working correctly. Monitor usage and optimize prompts based on user feedback.