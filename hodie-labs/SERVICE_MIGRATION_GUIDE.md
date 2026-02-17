# Hodie Labs - Third-Party Service Migration Guide

This document outlines every third-party service used by the Hodie Labs platform, how to transfer ownership, and what credentials need to be rotated.

---

## Overview

The platform relies on the following categories of services:

1. **Hosting & Deployment** - Firebase Hosting (frontend), Render (backend)
2. **Database** - MongoDB Atlas
3. **Authentication** - Firebase Auth
4. **AI Providers** - Anthropic (Claude), Groq, Moonshot (Kimi K2)
5. **Public APIs** - PubMed, NIH, CDC, FDA, etc. (free, no credentials needed)

---

## 1. Firebase (Authentication + Hosting + Storage)

**What it does:** Hosts the frontend web app, handles user login/signup, stores uploaded files.

**Console URL:** https://console.firebase.google.com
**Project ID:** `hodie-labs-webapp`

### Transfer Steps

1. Go to Firebase Console > Project Settings > Users and permissions
2. Add the new owner's Google account as **Owner**
3. The new owner should accept the invitation
4. Once confirmed, the original developer account can be removed

### Credentials to Note (Frontend .env)

```
REACT_APP_FIREBASE_API_KEY=AIzaSyCsPXLkvHSaHYVzgvrsPfJuM-dzXPNLSMM
REACT_APP_FIREBASE_AUTH_DOMAIN=hodie-labs-webapp.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hodie-labs-webapp
REACT_APP_FIREBASE_STORAGE_BUCKET=hodie-labs-webapp.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=510123181267
REACT_APP_FIREBASE_APP_ID=1:510123181267:web:5617aa7e7630234f4f8026
```

These are **public** Firebase config values (safe to have in frontend code). They don't need rotation, but the project ownership must be transferred.

### Backend Firebase Admin SDK (Backend .env)

The backend uses a **Firebase Admin Service Account** for secure token verification. After transfer:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate a **new** private key
3. Update `backend-api/.env`:
   ```
   FIREBASE_PROJECT_ID=hodie-labs-webapp
   FIREBASE_CLIENT_EMAIL=<new-service-account-email>
   FIREBASE_PRIVATE_KEY="<new-private-key>"
   ```
4. Redeploy the backend on Render

### Firebase Hosting Deployment

The frontend is deployed via the Firebase CLI:
```bash
cd hodie-labs
npm run build
npx firebase deploy --only hosting
```

The new owner needs `firebase-tools` installed and must run `firebase login` with their account.

---

## 2. Render (Backend API Hosting)

**What it does:** Hosts the Node.js/Express backend API server.

**Console URL:** https://dashboard.render.com
**Service URL:** `https://hodie-backend-api.onrender.com`

### Transfer Steps

**Option A: Transfer Render Account**
1. Log into Render dashboard
2. Go to Account Settings > Team
3. Add the new owner as a team member with Admin access
4. Transfer billing to their payment method

**Option B: Create New Render Service**
1. New owner creates a Render account
2. Connect to the GitHub repository (or deploy from source)
3. Create a new Web Service with these settings:
   - **Runtime:** Node
   - **Build Command:** `cd backend-api && npm install`
   - **Start Command:** `cd backend-api && node server.js`
4. Copy all environment variables from the existing service (see Section 6)
5. Update the frontend `.env` with the new Render URL:
   ```
   REACT_APP_API_BASE_URL=https://<new-service-name>.onrender.com/api
   ```
6. Redeploy the frontend

### Environment Variables on Render

All backend `.env` variables must be set in Render's dashboard under the service's Environment tab. See Section 6 for the complete list.

---

## 3. MongoDB Atlas (Database)

**What it does:** Stores all user data, health records, lab results, genetic data, recommendations, and AI usage logs.

**Console URL:** https://cloud.mongodb.com
**Cluster:** `Cluster0` on `cluster0.uhkdcnu.mongodb.net`
**Database name:** `hodie_app`

### Collections

| Collection | Contents |
|-----------|----------|
| `clients` | User profiles, subscription info |
| `labresults` | Uploaded blood test results |
| `geneticdatas` | DNA/genetic analysis data |
| `wearabledatas` | Wearable device data |
| `healthmetrics` | General health metrics |
| `medicalreports` | Medical report uploads |
| `miscellaneous` | Other health data |
| `user_profiles` | Legacy onboarding profiles |
| `ai_usage` | AI chat usage tracking |
| `recommendations` | AI-generated recommendations |

### Transfer Steps

1. Log into MongoDB Atlas
2. Go to Project Settings > Access Manager
3. Add new owner's email as **Project Owner**
4. They accept the invitation
5. **Critical:** Create a new database user for the new owner:
   - Go to Database Access > Add New Database User
   - Create credentials
   - Update the connection string in backend `.env`:
     ```
     MONGODB_URI=mongodb+srv://<new-user>:<new-password>@cluster0.uhkdcnu.mongodb.net/hodie_app?retryWrites=true&w=majority
     ```
6. Remove the old database user (`hodieuser`)
7. Update the Render environment variable

### Security Note

The current connection string contains plaintext credentials. After transfer, the old credentials (`hodieuser:hodiepass123`) should be **deleted** from MongoDB Atlas Database Access.

---

## 4. Anthropic (Claude AI)

**What it does:** Powers the AI health chatbot for Basic/Pro/Premium tiers and file analysis.

**Console URL:** https://console.anthropic.com
**Models used:** `claude-3-haiku-20240307`, `claude-3-5-sonnet-20241022`

### Transfer Steps

1. New owner creates an Anthropic account at https://console.anthropic.com
2. Add a payment method and generate a new API key
3. Update both `.env` files:
   ```
   # Frontend
   REACT_APP_CLAUDE_API_KEY=<new-key>

   # Backend
   CLAUDE_API_KEY=<new-key>
   ```
4. Redeploy both frontend and backend
5. The old API key should be **revoked** in the Anthropic dashboard

### Cost Estimate

- Claude Haiku: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- Claude Sonnet: ~$3.00 per 1M input tokens, ~$15.00 per 1M output tokens
- Typical monthly cost depends on user volume; low-volume usage is typically under $20/month

---

## 5. Groq (Free Tier AI)

**What it does:** Powers the free-tier AI chatbot using Llama 3.

**Console URL:** https://console.groq.com
**Model used:** `llama3-8b-8192`

### Transfer Steps

1. New owner creates a Groq account at https://console.groq.com
2. Generate a new API key (Groq offers a generous free tier)
3. Update backend `.env`:
   ```
   GROQ_API_KEY=<new-key>
   ```
4. Redeploy backend
5. Revoke the old key

### Cost

Groq currently has a free tier with rate limits. For production use, a paid plan may be needed.

---

## 6. Complete Environment Variables Reference

### Frontend (`hodie-labs/.env`)

```env
# Firebase (public config - no rotation needed, but project must be transferred)
REACT_APP_FIREBASE_API_KEY=AIzaSyCsPXLkvHSaHYVzgvrsPfJuM-dzXPNLSMM
REACT_APP_FIREBASE_AUTH_DOMAIN=hodie-labs-webapp.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hodie-labs-webapp
REACT_APP_FIREBASE_STORAGE_BUCKET=hodie-labs-webapp.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=510123181267
REACT_APP_FIREBASE_APP_ID=1:510123181267:web:5617aa7e7630234f4f8026

# Backend API URL (update if moving to new Render service)
REACT_APP_API_BASE_URL=https://hodie-backend-api.onrender.com/api

# AI API Keys (MUST be rotated after transfer)
REACT_APP_CLAUDE_API_KEY=<rotate-this>

# MongoDB (used by some frontend services - MUST be rotated)
REACT_APP_MONGODB_URI=<rotate-this>
```

### Backend (`hodie-labs/backend-api/.env`)

```env
# Server
PORT=3001
NODE_ENV=production

# MongoDB (MUST be rotated after transfer)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.uhkdcnu.mongodb.net/hodie_app?retryWrites=true&w=majority

# AI API Keys (MUST be rotated after transfer)
CLAUDE_API_KEY=<rotate-this>
GROQ_API_KEY=<rotate-this>

# Firebase Admin SDK (regenerate service account after project transfer)
FIREBASE_PROJECT_ID=hodie-labs-webapp
FIREBASE_CLIENT_EMAIL=<from-service-account>
FIREBASE_PRIVATE_KEY="<from-service-account>"

# Auth0 (deprecated - can be removed)
AUTH0_DOMAIN=dev-4z61m46y2c7ilvqu.us.auth0.com
AUTH0_AUDIENCE=https://api.hodielabs.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://hodie-labs-webapp.web.app,https://hodie-labs-webapp.firebaseapp.com

# Rate Limiting
FREE_TIER_RATE_LIMIT=5
BASIC_TIER_RATE_LIMIT=20
PRO_TIER_RATE_LIMIT=100
PREMIUM_TIER_RATE_LIMIT=200
RATE_LIMIT_WINDOW_MS=60000
```

---

## 7. Services That Do NOT Require Transfer

The following external APIs are **free and keyless** - no account transfer needed:

| Service | Purpose |
|---------|---------|
| PubMed (NCBI) | Medical research references |
| NIH API | Health research data |
| CDC API | Health alerts and guidelines |
| FDA API | Drug safety information |
| ClinicalTrials.gov | Clinical trial registry |
| Hugging Face (inference) | Free AI model inference |
| WHO/TGA/RACGP | Health guidelines (static references) |

---

## 8. Migration Checklist

Use this checklist when performing the transfer:

### Before Transfer
- [ ] Document all current environment variables
- [ ] Ensure the new owner has accounts on: Firebase, MongoDB Atlas, Anthropic, Groq, Render
- [ ] Back up the MongoDB database (use `mongodump`)

### Account Transfers
- [ ] Firebase: Add new owner, transfer project ownership
- [ ] MongoDB Atlas: Add new owner, create new DB user, revoke old credentials
- [ ] Render: Transfer service or create new one
- [ ] Anthropic: New owner generates their own API key
- [ ] Groq: New owner generates their own API key

### Credential Rotation
- [ ] Generate new Firebase Admin SDK service account key
- [ ] Create new MongoDB database user, delete old one
- [ ] Generate new Claude API key, revoke old one
- [ ] Generate new Groq API key, revoke old one
- [ ] Update all environment variables on Render
- [ ] Update frontend `.env` and redeploy to Firebase Hosting

### Post-Transfer Verification
- [ ] Frontend loads at `hodie-labs-webapp.web.app`
- [ ] Login/signup works via Firebase Auth
- [ ] Backend API responds at the Render URL `/health`
- [ ] AI chatbot responds to messages
- [ ] File uploads work
- [ ] Lab results display correctly
- [ ] Recommendations generate from AI

### Cleanup
- [ ] Remove developer's access from Firebase
- [ ] Remove developer's access from MongoDB Atlas
- [ ] Remove developer's access from Render
- [ ] Verify all old API keys are revoked
- [ ] Remove Auth0 environment variables (deprecated)

---

## 9. Auth0 (Deprecated)

Auth0 was the original auth provider but has been replaced by Firebase Auth. The backend still has Auth0 configuration as a fallback. After confirming Firebase Auth works for all users:

1. Remove `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` from backend `.env`
2. Remove Auth0 verification code from `backend-api/middleware/authMiddleware.js`
3. The Auth0 account can be closed

**Auth0 Dashboard:** https://manage.auth0.com
**Domain:** `dev-4z61m46y2c7ilvqu.us.auth0.com`

---

## 10. Cost Summary (Monthly Estimates)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Firebase Hosting | Free (10 GB/month) | Pay as you go |
| Firebase Auth | Free (50K MAU) | Pay as you go |
| Render | Free (spins down on idle) | $7/month (always on) |
| MongoDB Atlas | Free (512 MB) | $9/month (M2 Shared) |
| Anthropic (Claude) | N/A | ~$5-50/month based on usage |
| Groq | Free tier available | ~$0-10/month |
| **Total** | **$0** | **~$21-76/month** |

Costs scale with user volume. The current free-tier setup works for development and early users.
