# Groq AI Setup Instructions

## Why Groq?
Groq provides **free, high-speed AI chat** with 1,000 requests per day - perfect for advanced conversational responses that understand context and maintain natural dialogue.

## Setup Steps

### 1. Get Your Free Groq API Key
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up with your email
3. Accept the Services Agreement and Privacy Policy
4. Go to the "API Keys" section (`/keys`)
5. Create a new API key

### 2. Configure the App
1. Copy your API key
2. Open `.env` file in the project root
3. Uncomment and update this line:
   ```
   REACT_APP_GROQ_API_KEY=your_actual_api_key_here
   ```

### 3. Test the Chat
1. Run `npm run build` to rebuild with the new API key
2. Deploy with `firebase deploy --only hosting`
3. Test conversations - they should now be much more natural and contextual

## Features with Groq AI

✅ **Natural Conversations** - Understands context from previous messages  
✅ **Cooking & Recipe Help** - Can provide specific meal preparation guidance  
✅ **Follow-up Questions** - Remembers what you discussed  
✅ **Australian Health Focus** - Uses proper Australian terminology and guidelines  
✅ **Fast Responses** - Groq's LPU technology provides near-instant replies  

## Fallback System
If no API key is configured, the app automatically falls back to enhanced local responses, so it will still work (just less advanced).

## API Limits
- **Free Tier**: 1,000 requests per day
- **Rate Limit**: 6,000 tokens per minute
- **Model**: Llama3-70B-8192 (high performance)

This is more than enough for typical health chat usage!