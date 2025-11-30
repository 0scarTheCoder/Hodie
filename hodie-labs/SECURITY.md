# Security Policy

## 🔒 Security Overview

HodieLabs takes security seriously. This document outlines our security practices, how to report vulnerabilities, and deployment security measures.

## 🛡 Security Features

### Authentication & Authorization
- **Auth0 Professional**: Industry-standard OAuth 2.0/OIDC
- **Multi-factor Authentication**: Optional MFA support
- **Session Management**: Secure token handling
- **Role-based Access**: User permission controls

### Data Protection
- **Encryption in Transit**: HTTPS/TLS 1.3 for all communication
- **Encryption at Rest**: Firebase Firestore automatic encryption
- **Data Minimization**: Only collect necessary health data
- **GDPR Compliance**: Data export and deletion capabilities

### Infrastructure Security
- **Firebase Hosting**: Google Cloud security standards
- **CDN Protection**: Global edge network security
- **DDoS Protection**: Automatic protection via Google Cloud
- **Security Headers**: Proper HTTP security headers

## 🚨 Reporting Vulnerabilities

### Security Contact

**Email**: security@hodielabs.com (for sensitive security issues)
**GitHub**: Create a security advisory (preferred for non-critical issues)

### Reporting Process

1. **Don't** open public GitHub issues for security vulnerabilities
2. **Email** security@hodielabs.com with details:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Your contact information

3. **Response Timeline**:
   - Acknowledgment: Within 48 hours
   - Assessment: Within 7 days
   - Fix deployment: Within 30 days (depending on severity)

### Vulnerability Severity Levels

**Critical**: Immediate risk to user data or system integrity
**High**: Significant security risk, affects many users
**Medium**: Moderate security risk, limited scope
**Low**: Minor security issue or improvement

## 🔐 Security Best Practices

### For Contributors

#### Environment Security
```bash
# Never commit sensitive data
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use strong environment variables
REACT_APP_AUTH0_CLIENT_ID=your_secure_client_id
REACT_APP_FIREBASE_API_KEY=your_secure_api_key
```

#### Code Security
```typescript
// Input validation
const validateHealthMetric = (value: string): number => {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < 0 || parsed > 300) {
    throw new Error('Invalid health metric value');
  }
  return parsed;
};

// Secure API calls
const fetchUserData = async (userId: string): Promise<UserData> => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('Unauthorized access');
  }
  
  // Proceed with authenticated request
};
```

#### Firebase Security Rules
```javascript
// Firestore security rules example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Health metrics protected by user ownership
    match /health_metrics/{document} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🚀 Deployment Security

### Production Environment

#### Firebase Hosting Security
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  }
}
```

#### Environment Variables Security
```bash
# Production deployment checklist
# ✅ All secrets in environment variables
# ✅ No hardcoded credentials in code
# ✅ Separate environments (dev/staging/prod)
# ✅ Minimal permissions for service accounts
# ✅ Regular key rotation

# Deploy with security verification
npm run build
npm run security-check  # Custom security audit
firebase deploy --only hosting
```

### CI/CD Security

#### GitHub Actions Security
```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Security Audit
        run: |
          npm audit --audit-level high
          npm run lint:security
          
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        
      - name: Dependency vulnerability scan
        uses: actions/dependency-check@v1
```

## 🔍 Security Monitoring

### Application Security

#### Client-side Security
- **Content Security Policy**: Prevents XSS attacks
- **Input Validation**: All user inputs sanitized
- **Authentication State**: Proper session management
- **Error Handling**: No sensitive data in error messages

#### API Security
```typescript
// Secure API communication
const apiRequest = async (endpoint: string, data: any) => {
  const token = await getAccessTokenSilently();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return response.json();
};
```

### Firebase Security

#### Firestore Rules Testing
```bash
# Install Firebase emulator
npm install -g firebase-tools

# Test security rules locally
firebase emulators:start --only firestore
npm run test:security-rules
```

#### Security Rule Examples
```javascript
// Health data access rules
match /health_metrics/{metricId} {
  allow create: if request.auth != null 
    && request.auth.uid == resource.data.userId
    && isValidHealthMetric(request.resource.data);
  
  allow read: if request.auth != null 
    && request.auth.uid == resource.data.userId;
  
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.userId
    && request.auth.uid == resource.data.userId;
}

function isValidHealthMetric(data) {
  return data.keys().hasAll(['userId', 'type', 'value', 'timestamp'])
    && data.value is number
    && data.value >= 0;
}
```

## 📋 Security Checklist

### Development
- [ ] No hardcoded secrets in code
- [ ] Input validation on all user data
- [ ] Proper error handling (no sensitive data exposed)
- [ ] Authentication checks on protected routes
- [ ] HTTPS in all environments

### Deployment
- [ ] Environment variables configured
- [ ] Security headers enabled
- [ ] Firebase security rules deployed
- [ ] SSL/TLS certificates valid
- [ ] Dependencies scanned for vulnerabilities

### Monitoring
- [ ] Firebase console access restricted
- [ ] Auth0 logs monitored
- [ ] Error tracking configured
- [ ] Security alerts set up
- [ ] Regular security audits scheduled

## 🆘 Incident Response

### Security Incident Process

1. **Detection**: Automated monitoring or user report
2. **Assessment**: Evaluate impact and severity
3. **Containment**: Immediate steps to limit damage
4. **Investigation**: Root cause analysis
5. **Resolution**: Apply fixes and patches
6. **Communication**: Notify affected users if needed
7. **Documentation**: Update security measures

### Contact Information

**Security Team**: security@hodielabs.com
**Emergency Contact**: Available 24/7 for critical issues
**Public Issues**: GitHub Issues (non-sensitive only)

## 📚 Security Resources

### Tools & Scanning
- **npm audit**: Dependency vulnerability scanning
- **ESLint Security Plugin**: Code security analysis
- **Firebase Emulator**: Security rules testing
- **OWASP ZAP**: Web application security testing

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Auth0 Security](https://auth0.com/docs/security)
- [React Security](https://reactjs.org/docs/cross-origin-communication.html)

### Training Resources
- [Web Security Academy](https://portswigger.net/web-security)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/rules-and-auth)
- [Auth0 Security Documentation](https://auth0.com/docs/security)

---

## Security Updates

This security policy is reviewed quarterly and updated as needed. Last updated: November 2024.

For the latest security information, visit: https://hodielabs.com/security

**Remember**: Security is everyone's responsibility. When in doubt, ask the security team!