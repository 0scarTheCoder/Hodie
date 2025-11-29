# Auth0 Email Template Setup Guide

## 🎯 Quick Links

**Direct Link to Email Templates:**
https://manage.auth0.com/dashboard/us/dev-4o0jjcvjne7gpl0s/branding/email-templates

## 📧 Step-by-Step Instructions

### 1. Access Email Templates
- Go to Auth0 Dashboard → **Branding** → **Email Templates**
- Or use direct link above

### 2. Configure Change Password Template
1. **Click** on "Change Password" template
2. **Toggle ON** "Use Custom Template" 
3. **Copy the template** from `auth0-email-template.html` in this directory
4. **Paste** it into the template editor
5. **Click "Save"**

### 3. Update Email Settings
In the same page, update these fields:

**From:**
```
HodieLabs Security
```

**Subject:**
```
Reset Your HodieLabs Password - Secure Link Inside
```

**Reply To (optional):**
```
noreply@hodielabs.com
```

### 4. Test the Email
1. Go to your live app: https://hodielabs-app.web.app
2. Click "Forgot password?"
3. Enter your email: loveoh19@gmail.com
4. Check your email for the new branded template!

## 🎨 What You'll Get

Your users will receive beautiful emails with:
- ✅ HodieLabs branding and colors
- ✅ Professional gradient header
- ✅ Clear call-to-action button
- ✅ Security information
- ✅ Professional footer
- ✅ Mobile-responsive design

## 🔧 Technical Details

**Template Variables:**
- `{{ url }}` - The password reset link (automatically filled by Auth0)
- All styling is inline for maximum email client compatibility
- Uses system fonts for fast loading
- Includes hover effects for the button

## 🚀 Result

From: HodieLabs Security <noreply@dev-4o0jjcvjne7gpl0s.us.auth0.com>
Subject: Reset Your HodieLabs Password - Secure Link Inside

Beautiful, professional email with your HodieLabs branding!