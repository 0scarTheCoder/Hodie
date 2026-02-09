# 🔑 HodieLabs API Key Setup Guide

To use HodieLabs' AI-powered health recommendations, you need to set up an AI API key. Here are your options:

## Option 1: GROQ API (Recommended - Free & Fast)

### Why Choose GROQ?
- **Free tier available** with generous limits
- **Ultra-fast responses** (2-10x faster than OpenAI)
- **High-quality models** including Llama 3 and Mixtral
- **Easy setup** process

### Setup Steps:
1. **Visit GROQ Console**
   - Go to: https://console.groq.com
   - Create account or login

2. **Create API Key**
   - Click "API Keys" in sidebar
   - Click "Create API Key"
   - Name it "HodieLabs" 
   - Copy the key (starts with `gsk_`)

3. **Add to HodieLabs**
   - Go to Settings in HodieLabs
   - Find "AI Configuration" section
   - Select "GROQ" as provider
   - Paste your API key
   - Click "Test Connection"
   - Save settings

## Option 2: OpenAI API (Premium)

### Setup Steps:
1. **Visit OpenAI Platform**
   - Go to: https://platform.openai.com
   - Create account or login

2. **Add Billing (Required)**
   - Go to Settings → Billing
   - Add payment method
   - Add credits (minimum $5-10 recommended)

3. **Create API Key**
   - Go to API Keys section
   - Click "Create new secret key"
   - Name it "HodieLabs"
   - Copy the key (starts with `sk-`)

4. **Configure in HodieLabs**
   - Go to Settings in HodieLabs
   - Select "OpenAI" as provider
   - Paste your API key
   - Choose model (GPT-4o recommended)
   - Test and save

## Option 3: Anthropic Claude API

### Setup Steps:
1. **Visit Anthropic Console**
   - Go to: https://console.anthropic.com
   - Create account

2. **Create API Key**
   - Go to API Keys
   - Generate new key
   - Copy key (starts with `sk-ant-`)

3. **Configure in HodieLabs**
   - Select "Anthropic" as provider
   - Add your API key
   - Test connection

## Current Configuration

HodieLabs is currently configured with a default GROQ API key for demonstration purposes. For production use and personalized experiences, we recommend setting up your own API key using the steps above.

### Benefits of Your Own API Key:
- **Higher rate limits** for unlimited usage
- **Priority access** during high traffic
- **Custom model selection** 
- **Usage analytics** and cost control
- **Enhanced privacy** - your data stays with your account

## Troubleshooting

### Common Issues:

1. **"API Key Invalid" Error**
   - Double-check key format (gsk_ for GROQ, sk- for OpenAI)
   - Ensure no extra spaces when pasting
   - Verify key hasn't been revoked

2. **"Rate Limited" Error**
   - Wait a few minutes and try again
   - Consider upgrading to paid tier
   - Switch to different provider temporarily

3. **"Network Error"**
   - Check internet connection
   - Try refreshing the page
   - Clear browser cache

### Support:
- For GROQ issues: https://console.groq.com/docs
- For OpenAI issues: https://platform.openai.com/docs
- For HodieLabs support: Contact through app settings

## Security Notes

- **Never share your API keys** publicly or in screenshots
- **Regenerate keys** if accidentally exposed
- **Monitor usage** regularly through provider console
- **Use separate keys** for different applications

---

*Last updated: December 2024*
*HodieLabs Team*