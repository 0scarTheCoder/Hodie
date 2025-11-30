# Firebase Email Template Customization Guide

## 🎨 Customizing Password Reset Emails

### Access Firebase Console
1. Visit: https://console.firebase.google.com/project/hodie-labs-webapp
2. Navigate to: **Authentication** → **Templates** 
3. Select: **Password reset** template

### Current Default Email
- **From**: `noreply@hodie-labs-webapp.firebaseapp.com`
- **Subject**: "Reset your password for hodie-labs-webapp"
- **Template**: Firebase default template

### Customization Options

#### 1. **Email Template HTML**
```html
<p>Hello,</p>
<p>Follow this link to reset your HodieLabs password for your %EMAIL% account.</p>
<p><a href="%LINK%">Reset Password</a></p>
<p>If you didn't ask to reset your password, you can ignore this email.</p>
<p>Thanks,<br>Your HodieLabs Team</p>
```

#### 2. **Custom Subject Line**
```
Reset your HodieLabs password
```

#### 3. **Custom Sender Name**
```
HodieLabs Support <noreply@hodie-labs-webapp.firebaseapp.com>
```

#### 4. **Reply-to Address** (Optional)
```
support@hodielabs.com
```

### Advanced Customization

#### Custom Domain (Enterprise)
For a professional `@hodielabs.com` email address:
1. Set up custom domain in Firebase Console
2. Configure DNS records
3. Verify domain ownership

#### HTML Email Template
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; text-align: center; }
        .logo { color: white; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; background: white; }
        .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🩺 HodieLabs</div>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your HodieLabs account (%EMAIL%).</p>
            <p>Click the button below to create a new password:</p>
            <p><a href="%LINK%" class="button">Reset Password</a></p>
            <p><strong>This link will expire in 1 hour for security.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2024 HodieLabs - Your Health Intelligence Platform</p>
            <p>Questions? Contact us at support@hodielabs.com</p>
        </div>
    </div>
</body>
</html>
```

### Variables Available
- `%EMAIL%` - User's email address
- `%LINK%` - Password reset link
- `%APP_NAME%` - App name (hodie-labs-webapp)

## 📧 Testing Email Templates

### Preview Function
Firebase Console allows you to:
1. Preview email templates
2. Send test emails to yourself
3. Check how emails look on different email clients

### Best Practices
- Keep subject lines under 50 characters
- Use clear call-to-action buttons
- Include security reminders (link expiration)
- Maintain brand consistency
- Test on multiple email clients

---

**Quick Setup**: Use the HTML template above in Firebase Console → Authentication → Templates → Password reset