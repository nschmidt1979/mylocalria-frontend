# CI/CD Pipeline Setup Guide

This document outlines the complete CI/CD pipeline setup for the MyLocalRIA React application using GitHub Actions, Vite, and Firebase Hosting.

## 📋 Overview

The CI/CD pipeline includes:
- **Automated Testing**: Unit tests (Vitest) and E2E tests (Playwright)
- **Code Quality**: ESLint linting
- **Build Process**: Vite build optimization
- **Deployment**: Automated deployment to Firebase Hosting
- **Environment Management**: Separate staging and production environments

## 🔧 Pipeline Structure

### Jobs Overview

1. **Test Job**: Runs linting, unit tests, and E2E tests
2. **Build Job**: Creates production build with environment variables
3. **Deploy Job** (Production): Deploys to Firebase Hosting on `main` branch
4. **Deploy Staging Job**: Deploys to staging on `develop` branch

### Workflow Triggers

- **Push to `main`**: Full pipeline + production deployment
- **Push to `develop`**: Full pipeline + staging deployment  
- **Pull Request to `main`**: Testing and building only (no deployment)

## 🔐 Required GitHub Secrets

Configure these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

### Firebase Secrets
```
FIREBASE_TOKEN                    # Firebase CLI token for deployment
FIREBASE_PROJECT_ID              # Production Firebase project ID
FIREBASE_STAGING_PROJECT_ID      # Staging Firebase project ID (optional)
```

### Firebase Configuration Secrets
```
VITE_FIREBASE_API_KEY            # Firebase API key
VITE_FIREBASE_AUTH_DOMAIN        # Firebase auth domain
VITE_FIREBASE_PROJECT_ID         # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET     # Firebase storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID # Firebase messaging sender ID
VITE_FIREBASE_APP_ID             # Firebase app ID
```

### Third-party Service Secrets
```
VITE_MAPBOX_ACCESS_TOKEN         # Mapbox access token for maps
```

## 🚀 Initial Setup Instructions

### 1. Firebase Setup

#### Get Firebase Token
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate CI token
firebase login:ci
```

#### Configure Firebase Projects
```bash
# Initialize Firebase in your project
firebase init hosting

# Set up staging project (optional)
firebase use --add staging-project-id
firebase use --add production-project-id
```

### 2. GitHub Repository Setup

#### Add Secrets
1. Go to `Settings > Secrets and variables > Actions`
2. Click "New repository secret"
3. Add each secret from the list above

#### Environment Configuration
1. Go to `Settings > Environments`
2. Create environments:
   - `production` (for main branch)
   - `staging` (for develop branch)
3. Add environment-specific secrets if needed

### 3. Update Firebase Configuration

Ensure your `firebase.json` is properly configured:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🧪 Testing Setup

### Unit Tests (Vitest)
- Configuration: `vitest.config.js`
- Setup: `src/test/setup.js`
- Run locally: `npm run test:unit`

### E2E Tests (Playwright)
- Configuration: `playwright.config.js`
- Tests location: `tests/e2e/`
- Run locally: `npm run test:e2e`

### Local Testing Commands
```bash
# Install dependencies
npm install

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint

# Build application
npm run build

# Preview build
npm run preview
```

## 🌐 Environment Variables

### Required Environment Variables

Create a `.env.local` file for local development:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Environment-Specific Configuration

- **Production**: Uses secrets from GitHub Actions
- **Staging**: Uses separate Firebase project
- **Development**: Uses `.env.local` file

## 📊 Pipeline Monitoring

### Deployment Status
- Check GitHub Actions tab for workflow status
- Automatic commit comments with deployment URLs
- Firebase Console for hosting status

### Test Reports
- Unit test reports in Actions artifacts
- Playwright HTML reports for E2E tests
- Coverage reports (if enabled)

### Failure Handling
- Tests must pass before deployment
- Build artifacts retained for 7 days
- Automatic retries on CI (2x for E2E tests)

## 🔄 Branch Strategy

### Main Branch (`main`)
- Protected branch
- Requires PR reviews
- Auto-deploys to production
- All tests must pass

### Develop Branch (`develop`)
- Integration branch
- Auto-deploys to staging
- Feature branch target

### Feature Branches
- Create PRs to `develop`
- Run tests but no deployment
- Merge to `develop` after review

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check environment variables are set
echo $VITE_FIREBASE_API_KEY

# Verify build locally
npm run build
```

#### Test Failures
```bash
# Run tests locally to debug
npm run test:unit
npm run test:e2e:ui  # Opens Playwright UI
```

#### Deployment Issues
```bash
# Check Firebase token
firebase projects:list

# Verify project access
firebase use project-id
firebase hosting:sites:list
```

### Debug Commands
```bash
# Check workflow files syntax
yamllint .github/workflows/ci-cd.yml

# Test Firebase deployment locally
firebase serve

# Check Playwright browsers
npx playwright install --dry-run
```

## 📈 Performance Optimization

### Build Optimization
- Vite production optimizations enabled
- Automatic code splitting
- Asset optimization

### Test Optimization
- Parallel test execution
- Browser caching for E2E tests
- Selective test runs on CI

### Deployment Optimization
- Build artifact caching
- Incremental deployments
- CDN distribution via Firebase

## 📝 Maintenance

### Regular Tasks
- Update dependencies monthly
- Review test coverage
- Monitor deployment metrics
- Update browser targets

### Security Updates
- Rotate Firebase tokens annually
- Update GitHub Actions versions
- Review secret access regularly

## 🆘 Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Test the build process locally
4. Check Firebase project permissions

---

**Last Updated**: January 2025
**Version**: 1.0.0