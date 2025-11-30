# Contributing to HodieLabs

Thank you for your interest in contributing to the HodieLabs Health Dashboard! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git
- Firebase CLI (`npm install -g firebase-tools`)
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/hodie-labs.git
   cd hodie-labs
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your development credentials
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## 🏗 Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   ├── chat/                 # AI chat interface  
│   ├── dashboard/            # Dashboard views
│   ├── layout/               # Navigation, headers
│   ├── screens/              # Feature screens
│   ├── workflows/            # Multi-step processes
│   └── ui/                   # Reusable components
├── services/                 # API and business logic
├── firebase/                 # Firebase configuration
└── utils/                    # Helper functions
```

## 🎯 How to Contribute

### Types of Contributions

- **🐛 Bug Fixes**: Fix issues, improve performance
- **✨ Features**: New health tracking features, UI improvements
- **📚 Documentation**: Improve setup guides, add examples
- **🎨 Design**: UI/UX enhancements, accessibility improvements
- **🔒 Security**: Security improvements, vulnerability fixes

### Contribution Workflow

1. **Check Existing Issues**
   - Look through existing issues and PRs
   - Comment on issues you'd like to work on

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Follow the coding standards below
   - Write clear, focused commits
   - Test your changes thoroughly

4. **Test Your Changes**
   ```bash
   npm test
   npm run build
   ```

5. **Submit Pull Request**
   - Use clear PR title and description
   - Reference related issues
   - Add screenshots for UI changes

## 💻 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow existing ESLint configuration
- **Prettier**: Code formatting (automatic on save)
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive, camelCase variable names

### Component Guidelines

```tsx
// Good: Functional component with TypeScript
interface HealthCardProps {
  title: string;
  value: number;
  unit?: string;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, value, unit }) => {
  return (
    <div className="bg-white/10 rounded-lg p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">
        {value}{unit && <span className="text-sm">{unit}</span>}
      </p>
    </div>
  );
};
```

### Styling Guidelines

- **Tailwind CSS**: Use Tailwind for all styling
- **Responsive**: Mobile-first design approach
- **Accessibility**: Include proper ARIA labels
- **Colors**: Use the existing design system

```jsx
// Good: Responsive, accessible styling
<button
  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 
             text-white font-medium rounded-lg transition-colors
             focus:outline-none focus:ring-2 focus:ring-blue-500"
  aria-label="Save health metrics"
>
  Save Changes
</button>
```

### Service Guidelines

- **Error Handling**: Always handle errors gracefully
- **TypeScript**: Properly type all service methods
- **Async/Await**: Use async/await over Promise chains

```typescript
// Good: Proper error handling and typing
interface HealthMetrics {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  timestamp: Date;
}

export const saveHealthMetrics = async (
  metrics: HealthMetrics
): Promise<boolean> => {
  try {
    await addDoc(collection(db, 'health_metrics'), {
      ...metrics,
      timestamp: Timestamp.fromDate(metrics.timestamp)
    });
    return true;
  } catch (error) {
    console.error('Failed to save health metrics:', error);
    return false;
  }
};
```

## 🧪 Testing

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage
npm run build               # Test production build
```

### Writing Tests

- Write tests for new components and services
- Use React Testing Library for component tests
- Mock external services (Firebase, APIs)

```tsx
// Example component test
import { render, screen } from '@testing-library/react';
import HealthCard from './HealthCard';

test('displays health metric correctly', () => {
  render(<HealthCard title="Heart Rate" value={72} unit="bpm" />);
  
  expect(screen.getByText('Heart Rate')).toBeInTheDocument();
  expect(screen.getByText('72')).toBeInTheDocument();
  expect(screen.getByText('bpm')).toBeInTheDocument();
});
```

## 🏷 Commit Message Guidelines

Use conventional commits format:

```
type(scope): description

feat(dashboard): add blood pressure visualization
fix(auth): resolve login redirect issue
docs(readme): update setup instructions
style(ui): improve button hover states
refactor(services): optimize health score calculation
test(chat): add AI response tests
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code formatting (no logic changes)
- **refactor**: Code restructuring (no feature changes)
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

## 🔒 Security Guidelines

### Sensitive Data

- **Never commit** API keys, passwords, or credentials
- Use environment variables for all secrets
- Review `.env.example` for required variables

### Firebase Security

- Follow Firebase security rules
- Validate all user inputs
- Use proper authentication checks

### Auth0 Integration

- Don't modify Auth0 configuration without review
- Test authentication flows thoroughly
- Follow OIDC/OAuth2 best practices

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No ESLint warnings/errors
- [ ] Documentation updated (if needed)
- [ ] Screenshots included (for UI changes)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Tested on mobile

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

## 🐛 Bug Reports

### Creating Issues

Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## ✨ Feature Requests

### Suggesting Features

```markdown
**Feature Description**
Clear description of the feature

**Problem Solved**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you considered

**Additional Context**
Screenshots, mockups, etc.
```

## 🎨 Design Contributions

### UI/UX Guidelines

- Follow Apple Health design principles
- Maintain accessibility standards (WCAG 2.1)
- Use consistent spacing and typography
- Test on mobile devices
- Consider dark mode compatibility

### Assets

- Use SVG for icons when possible
- Optimize images (WebP format preferred)
- Include 2x versions for retina displays

## 🌍 Internationalization

Currently supporting Australian English. Contributions for other locales welcome:

- Use Australian health terminology
- Include proper date/time formatting
- Reference local health services (Medicare, Healthdirect)

## 📞 Getting Help

### Community

- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact team via hodielabs.com/contact

### Development Help

- **Setup Issues**: Check existing issues and documentation
- **Architecture Questions**: Create a discussion
- **Security Concerns**: Email privately (security@hodielabs.com)

## 🙏 Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes for significant contributions
- README acknowledgments

Thank you for helping make HodieLabs better! 🚀

---

## Quick Reference

```bash
# Start development
npm start

# Run tests  
npm test

# Build for production
npm run build

# Deploy to Firebase
npm run build && firebase deploy

# Check code style
npm run lint
```

For questions or help, create an issue or discussion on GitHub!