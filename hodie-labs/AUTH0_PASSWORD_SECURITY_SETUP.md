# Auth0 Password Security Configuration

## 🔒 **Password Security Requirements**

### **Password Policy Rules**
- **Minimum Length**: 12 characters
- **Special Characters**: At least 1 (!@#$%^&*()_+-=[]{}|;':\",./<>?)
- **Capital Letters**: At least 1 uppercase letter
- **Numbers**: At least 1 digit
- **Password History**: Cannot reuse last 5 passwords
- **Dictionary Protection**: Prevent common passwords

## ⚙️ **Auth0 Configuration Steps**

### **1. Database Connection Settings**

1. **Go to Auth0 Dashboard** → **Authentication** → **Database**
2. **Select your connection** (Username-Password-Authentication)
3. **Click Settings tab**

#### **Password Policy Configuration**
```json
{
  "length": {
    "min": 12,
    "max": 128
  },
  "includeCharacters": {
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSymbols": true
  },
  "excludeDictionary": true,
  "excludeUsernameSubstring": true,
  "historyLimit": 5
}
```

#### **Password Strength Configuration**
In the **Password Policy** section:

```javascript
// Custom Password Validation
function (user, context, callback) {
  const password = user.password;
  
  // Length check
  if (password.length < 12) {
    return callback(new Error('Password must be at least 12 characters long'));
  }
  
  // Character requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password);
  
  if (!hasUppercase) {
    return callback(new Error('Password must contain at least one uppercase letter'));
  }
  
  if (!hasLowercase) {
    return callback(new Error('Password must contain at least one lowercase letter'));
  }
  
  if (!hasNumbers) {
    return callback(new Error('Password must contain at least one number'));
  }
  
  if (!hasSpecialChar) {
    return callback(new Error('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;\':",./<>?)'));
  }
  
  callback(null, user, context);
}
```

### **2. Password History Configuration**

In **Auth0 Dashboard** → **Security** → **Attack Protection**:

1. **Enable Breached Password Detection**
   - ✅ Block breached passwords
   - ✅ Admin notification for attempts

2. **Enable Suspicious IP Throttling**
   - ✅ Pre-login throttling
   - ✅ Pre-user registration throttling

3. **Enable Brute Force Protection**
   - ✅ Shield protection
   - ✅ Account lockout after 10 attempts

### **3. Custom Password Reset Page**

#### **Create Custom Reset Page**
1. **Go to** **Universal Login** → **Login** tab
2. **Toggle on** "Customize Login Page"
3. **Insert this HTML/CSS:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Reset Password - HodieLabs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cdn.tailwindcss.com/2.2.19/tailwind.min.css" rel="stylesheet">
  <style>
    .password-requirements {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .requirement {
      display: flex;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .requirement.valid {
      color: #10b981;
    }
    .requirement.invalid {
      color: #ef4444;
    }
    .requirement-icon {
      margin-right: 0.5rem;
      font-size: 0.75rem;
    }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
      <!-- HodieLabs Logo -->
      <div class="text-center mb-8">
        <img src="https://hodielabs-app.web.app/hodie_transparent_logo.png" alt="HodieLabs" class="h-12 mx-auto mb-4">
        <h1 class="text-2xl font-bold text-white">Reset Your Password</h1>
        <p class="text-white/70 mt-2">Create a new secure password for your health data</p>
      </div>

      <!-- Password Requirements -->
      <div class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <h3 class="text-sm font-semibold text-white mb-3">Password Requirements:</h3>
        <div class="password-requirements text-white/80">
          <div class="requirement" id="req-length">
            <span class="requirement-icon">●</span>
            At least 12 characters long
          </div>
          <div class="requirement" id="req-uppercase">
            <span class="requirement-icon">●</span>
            One uppercase letter (A-Z)
          </div>
          <div class="requirement" id="req-lowercase">
            <span class="requirement-icon">●</span>
            One lowercase letter (a-z)
          </div>
          <div class="requirement" id="req-number">
            <span class="requirement-icon">●</span>
            One number (0-9)
          </div>
          <div class="requirement" id="req-special">
            <span class="requirement-icon">●</span>
            One special character (!@#$%^&*()_+-=[]{}|;':",./<>?)
          </div>
        </div>
      </div>

      <!-- Auth0 Lock Container -->
      <div id="lock-container"></div>

      <!-- Security Notice -->
      <div class="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-medium text-blue-300">Security Notice</h4>
            <p class="text-xs text-blue-200 mt-1">Your new password cannot be the same as your previous 5 passwords. All password data is encrypted and secure.</p>
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="mt-6 text-center">
        <p class="text-xs text-white/60">
          Having trouble? Visit our <a href="https://hodielabs.com/contact" class="text-blue-300 hover:text-blue-200 underline" target="_blank">help center</a>
        </p>
      </div>
    </div>
  </div>

  <script src="https://cdn.auth0.com/js/lock/11.30/lock.min.js"></script>
  <script>
    // Password validation in real-time
    function validatePassword(password) {
      const requirements = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password)
      };

      // Update UI for each requirement
      Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
          element.className = requirements[req] ? 'requirement valid' : 'requirement invalid';
          element.querySelector('.requirement-icon').textContent = requirements[req] ? '✓' : '●';
        }
      });

      return Object.values(requirements).every(valid => valid);
    }

    // Initialize Auth0 Lock
    const lock = new Auth0Lock(
      '{CLIENT_ID}',
      '{DOMAIN}',
      {
        container: 'lock-container',
        theme: {
          primaryColor: '#3b82f6',
          logo: 'https://hodielabs-app.web.app/hodie_transparent_logo.png'
        },
        auth: {
          redirectUrl: '{CALLBACK_URL}',
          responseType: 'code',
          params: {
            scope: 'openid profile email'
          }
        },
        languageDictionary: {
          title: '',
          passwordInputPlaceholder: 'Enter your new secure password'
        }
      }
    );

    // Real-time password validation
    lock.on('show', function() {
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
          validatePassword(e.target.value);
        });
      }
    });

    lock.show();
  </script>
</body>
</html>
```

## 📧 **Password Reset Email Template**

### **Update Email Template**

1. **Go to Auth0 Dashboard** → **Branding** → **Email Templates**
2. **Select "Change Password Confirmation"**
3. **Use this template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your HodieLabs Password</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #4338ca 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <img src="https://hodielabs-app.web.app/hodie_transparent_logo.png" alt="HodieLabs" style="height: 40px; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
  </div>

  <!-- Content -->
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">Hello,</p>
    
    <p style="color: #6b7280; margin-bottom: 24px;">You requested to reset your password for your HodieLabs health dashboard account. Click the button below to create a new secure password.</p>

    <!-- Reset Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ url }}" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
        Reset Your Password
      </a>
    </div>

    <!-- Password Requirements -->
    <div style="background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0;">
      <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px;">Your new password must include:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
        <li style="margin-bottom: 8px;">At least 12 characters long</li>
        <li style="margin-bottom: 8px;">One uppercase letter (A-Z)</li>
        <li style="margin-bottom: 8px;">One lowercase letter (a-z)</li>
        <li style="margin-bottom: 8px;">One number (0-9)</li>
        <li style="margin-bottom: 8px;">One special character (!@#$%^&*()_+-=[]{}|;':",./<>?)</li>
        <li style="margin-bottom: 8px;">Cannot be the same as your previous 5 passwords</li>
      </ul>
    </div>

    <!-- Security Notice -->
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #1e40af; font-weight: 500;">🔒 Security Notice</p>
      <p style="margin: 8px 0 0 0; color: #374151; font-size: 14px;">This reset link will expire in 24 hours. If you didn't request this reset, you can safely ignore this email - your account remains secure.</p>
    </div>

    <p style="color: #6b7280; margin-top: 32px;">If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #3b82f6; background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px;">{{ url }}</p>
  </div>

  <!-- Footer -->
  <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
      <strong>HodieLabs Health Dashboard</strong><br>
      Secure health analytics for better living
    </p>
    
    <!-- Contact Information -->
    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
        ⚠️ <strong>This email address is not monitored.</strong><br>
        For support or technical issues, please visit our <a href="https://hodielabs.com/contact" style="color: #3b82f6; text-decoration: none;">help center</a> or contact our support team.<br><br>
        
        🆘 <strong>Need Help?</strong><br>
        • Visit: <a href="https://hodielabs.com/contact" style="color: #3b82f6;">https://hodielabs.com/contact</a><br>
        • Email: support@hodielabs.com<br>
        • Live Chat: Available on our website 24/7
      </p>
    </div>
    
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        © 2024 HodieLabs. All rights reserved.<br>
        This email was sent to {{ user.email }}
      </p>
    </div>
  </div>

</body>
</html>
```

## 🔧 **Auth0 Dashboard Configuration**

### **Step-by-Step Setup**

#### **1. Password Policy Settings**
```bash
# Go to: Authentication → Database → [Your Connection] → Settings

Password Policy: "Fair"
Password Length: Min 12, Max 128
Password Complexity: 
  ✅ Lowercase letters
  ✅ Uppercase letters  
  ✅ Numbers
  ✅ Symbols

Password History: 5 passwords
Dictionary: ✅ Enabled (prevents common passwords)
```

#### **2. Attack Protection**
```bash
# Go to: Security → Attack Protection

Breached Password Detection: ✅ Enabled
  ✅ Block on signup
  ✅ Block on login
  ✅ Admin notification

Suspicious IP Throttling: ✅ Enabled
  ✅ Pre-login: 100 attempts per minute per IP
  ✅ Pre-registration: 50 attempts per minute per IP

Brute Force Protection: ✅ Enabled
  ✅ Triggers: 10 attempts
  ✅ Max blocked accounts: 15
  ✅ User notification: ✅ Enabled
```

#### **3. Email Settings**
```bash
# Go to: Branding → Email Templates → Change Password Confirmation

Subject: "Reset Your HodieLabs Password - Secure Access Required"

From: "HodieLabs Security <noreply@hodielabs.com>"

Template: [Use the HTML template above]
```

## 🧪 **Testing the Setup**

### **Test Password Requirements**
1. **Try weak passwords** (should be rejected):
   - `password123`
   - `Password123` (no special char)
   - `Pass123!` (too short)

2. **Try strong password** (should be accepted):
   - `MySecureHealth2024!@#`

### **Test Password History**
1. **Set initial password**: `MySecureHealth2024!@#`
2. **Try to change to same**: Should be rejected
3. **Change 5 times** to different passwords
4. **Try original again**: Should now be accepted

## 🚀 **Deployment Commands**

After configuring Auth0 dashboard:

```bash
# Update your .env with correct Auth0 settings
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_app_client_id

# Rebuild and deploy
npm run build
firebase deploy --only hosting
```

## ✅ **Verification Checklist**

- [ ] Password policy requires 12+ characters
- [ ] Password requires uppercase, lowercase, number, special char
- [ ] Password history prevents reuse of last 5 passwords
- [ ] Breached password protection enabled
- [ ] Brute force protection configured
- [ ] Custom password reset email template deployed
- [ ] Contact information added to email footer
- [ ] Email monitoring disclaimer included
- [ ] Help center link functional

---

**Security Level: Enterprise** 🔒

Your password reset system now meets enterprise security standards with comprehensive protection against common attacks.