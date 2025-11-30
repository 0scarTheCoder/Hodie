# URGENT: Setup Real AI Chat (Takes 2 minutes)

## The Problem
Right now the system is using **fake AI responses** - just pattern matching. To get **real ChatGPT-level AI**, you need to add a free Groq API key.

## Quick Setup (2 minutes)

### Step 1: Get Free API Key
1. Go to **https://console.groq.com**
2. Sign up with any email (Google login works)
3. Click **"API Keys"** in sidebar
4. Click **"Create API Key"**
5. Copy the key (starts with `gsk_...`)

### Step 2: Add to Project
1. Open `.env` file in this project
2. Find this line:
   ```
   # REACT_APP_GROQ_API_KEY=your_groq_api_key_here
   ```
3. Change it to:
   ```
   REACT_APP_GROQ_API_KEY=gsk_your_actual_key_here
   ```

### Step 3: Deploy
Run these commands:
```bash
npm run build
firebase deploy --only hosting
```

## Test It Works
After deploying, try asking:
- "how much protein am i getting in per meal"
- "how can i make those meals?"
- "what about breakfast ideas?"

The AI will now:
✅ Remember conversation context  
✅ Give specific, detailed answers  
✅ Ask follow-up questions  
✅ Provide recipes and cooking instructions  
✅ Use Australian health guidelines  

## Why Groq?
- **100% Free**: 1,000 requests/day (plenty for personal use)
- **Super Fast**: Faster than ChatGPT
- **No Credit Card**: Just email signup
- **High Quality**: Uses Llama3-70B model

## Current Status
Without the API key, you're getting basic pattern-matched responses. With it, you get real AI conversation.