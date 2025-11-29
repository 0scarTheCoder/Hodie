# Auth0 Setup Guide for HodieLabs

## 🚀 **Quick Implementation Steps**

I've created a complete Auth0 integration that will give you:
- ✅ **Custom email templates** with HodieLabs branding
- ✅ **Professional email delivery** from your domain  
- ✅ **Custom domain** (login.hodielabs.com)
- ✅ **Enterprise-grade security**
- ✅ **Better user management**

## 1️⃣ **Create Auth0 Account**

1. **Visit**: https://auth0.com/signup
2. **Sign up** with your email
3. **Choose region**: Australia (for compliance)
4. **Create tenant**: `hodielabs` or similar

## 2️⃣ **Configure Auth0 Application**

### Create Application
1. Go to **Applications** → **Create Application**
2. **Name**: "HodieLabs Health Dashboard"
3. **Type**: Single Page Application
4. **Technology**: React

### Application Settings
```
Allowed Callback URLs:
http://localhost:3000
https://hodie-labs-webapp.web.app
https://app.hodielabs.com

Allowed Logout URLs:
http://localhost:3000
https://hodie-labs-webapp.web.app
https://app.hodielabs.com

Allowed Web Origins:
http://localhost:3000
https://hodie-labs-webapp.web.app
https://app.hodielabs.com
```

## 3️⃣ **Update Environment Variables**

Add to your `.env` file:

```bash
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=hodielabs.au.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_client_id_from_auth0
REACT_APP_AUTH0_AUDIENCE=https://api.hodielabs.com
```

You'll get the `REACT_APP_AUTH0_CLIENT_ID` from your Auth0 application dashboard.

## 4️⃣ **Test the Integration**

### Switch to Auth0 App
I've created `src/App.auth0.tsx` which is ready to use. To test:

1. **Backup current app**:
   ```bash
   cp src/App.tsx src/App.firebase.tsx
   ```

2. **Switch to Auth0**:
   ```bash
   cp src/App.auth0.tsx src/App.tsx
   ```

3. **Test locally**:
   ```bash
   npm start
   ```

## 5️⃣ **Customize Email Templates**

### In Auth0 Dashboard:
1. Go to **Branding** → **Email Templates**
2. Select **Change Password**
3. Replace with custom template:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; }
    .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 20px; text-align: center; }
    .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 40px 30px; background: white; }
    .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🩺 HodieLabs</div>
      <div style="color: rgba(255,255,255,0.9); font-size: 14px;">Your Health Intelligence Platform</div>
    </div>
    <div class="content">
      <h2 style="color: #1f2937;">Reset Your Password</h2>
      <p>Hi there,</p>
      <p>We received a request to reset your HodieLabs password. Click below to create a new password:</p>
      <div style="text-align: center;">
        <a href="{{ url }}" class="button">Reset My Password</a>
      </div>
      <p style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <strong>🔒 Security Notice:</strong> This link expires in 24 hours.
      </p>
    </div>
  </div>
</body>
</html>
```

## 6️⃣ **Custom Domain (Optional)**

### Set up login.hodielabs.com:
1. **Auth0 Dashboard**: Custom Domains → Add Domain
2. **DNS Record**: Add CNAME `login` → `hodielabs.au.auth0.com`
3. **Update .env**:
   ```bash
   REACT_APP_AUTH0_CUSTOM_DOMAIN=login.hodielabs.com
   ```

## 7️⃣ **Deploy & Test**

1. **Build with Auth0**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

3. **Test Features**:
   - Sign up new user
   - Test forgot password
   - Check email delivery
   - Verify user experience

## 🎯 **Benefits You'll Get**

### Professional Email Experience
- **From**: `HodieLabs Security <noreply@login.hodielabs.com>`
- **Subject**: Custom branded subject lines
- **Template**: Fully customized HTML with your branding
- **Delivery**: Enterprise-grade delivery rates

### Advanced Features
- **Multi-Factor Authentication**: Available out of the box
- **Social Logins**: Google, Apple, Facebook integration
- **User Management**: Advanced dashboard with analytics
- **Security**: Enterprise-grade with anomaly detection
- **Compliance**: GDPR, HIPAA ready

### Better User Experience
- **Faster Login**: Auth0's optimized flow
- **Better Error Handling**: Clear, helpful error messages
- **Mobile Optimized**: Perfect mobile experience
- **Accessibility**: Built-in accessibility features

## 🔄 **Migration Strategy**

### Gradual Migration:
1. **Test Auth0** with new users first
2. **Migrate existing users** using Auth0's import tools
3. **Switch domains** once everything is tested
4. **Retire Firebase Auth** when ready

### User Data Migration:
Auth0 provides tools to import existing Firebase users while preserving their data and requiring them to reset passwords for security.

---

## 💰 **Cost Comparison**

| Feature | Firebase (Current) | Auth0 |
|---------|-------------------|-------|
| **Monthly Cost** | Free | Free (7,500 users) |
| **Email Customization** | ❌ Limited | ✅ Full control |
| **Custom Domain** | ❌ Not available | ✅ Included |
| **Email From Address** | firebase.com | ✅ Your domain |
| **Enterprise Features** | ❌ Limited | ✅ Full suite |

**Total Setup Time**: 2-3 hours  
**Result**: Professional authentication system with your branding

---

Ready to implement? The Auth0 version is ready to deploy and will give you complete control over the forgot password email experience! 🚀