# CI/CD Setup Guide for MyLocalRIA

This guide provides step-by-step instructions for setting up the CI/CD pipeline for your Vite + Firebase project.

## Prerequisites

1. **GitHub Repository** with the project code
2. **Firebase Project** (already configured: `riainsights-adv-data`)
3. **Firebase CLI** installed locally
4. **GitHub Actions** access (included with GitHub)

## Step 1: Firebase Setup

### 1.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 1.2 Login to Firebase
```bash
firebase login
```

### 1.3 Generate Firebase Token for CI/CD
```bash
firebase login:ci
```
Save the generated token - you'll need it for GitHub Secrets.

### 1.4 Deploy Security Rules and Indexes
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Step 2: GitHub Repository Setup

### 2.1 Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Firebase Configuration Secrets
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=riainsights-adv-data
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

#### Firebase Deployment Token
```
FIREBASE_TOKEN=your_firebase_token_from_step_1.3
```

### 2.2 Environment Setup

Create environments in GitHub:
- Go to Settings → Environments
- Create `production` environment
- Add protection rules (require reviews, restrict to main branch)
- Create `development` environment for testing

## Step 3: Workflow Configuration

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) is already configured with:

- ✅ **Dependency installation** with caching
- ✅ **Linting** with ESLint
- ✅ **Security scanning** with npm audit
- ✅ **Testing** (placeholder for when tests are added)
- ✅ **Building** with environment variables
- ✅ **Security scanning** with Trivy
- ✅ **Firebase deployment** with rules and indexes
- ✅ **Notification** of deployment status

## Step 4: Testing Setup (Optional)

To add actual tests, install testing dependencies:

### 4.1 Unit Testing with Vitest
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Update `package.json`:
```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui"
  }
}
```

### 4.2 E2E Testing with Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

Update `package.json`:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Step 5: Deploy Workflow

### 5.1 Trigger Deployment

The workflow triggers on:
- **Push to `main`** → Full deployment to production
- **Push to `develop`** → Build and test only
- **Pull requests** → Build and test only

### 5.2 Manual Deployment

To manually trigger deployment:
```bash
# Deploy to Firebase manually
npm run build
firebase deploy --only hosting
```

## Step 6: Monitoring and Alerts

### 6.1 Firebase Console Monitoring
- Monitor Firestore usage at https://console.firebase.google.com
- Set up billing alerts in Google Cloud Console
- Monitor performance in Firebase Performance tab

### 6.2 GitHub Actions Monitoring
- Monitor workflow runs in Actions tab
- Set up notifications for failed deployments
- Review security scan results

## Step 7: Security Best Practices

### 7.1 Environment Variables
- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate Firebase tokens regularly
- ✅ Use different Firebase projects for dev/prod

### 7.2 Access Control
- ✅ Limit who can approve production deployments
- ✅ Use branch protection rules
- ✅ Require reviews for main branch
- ✅ Enable status checks

## Step 8: Troubleshooting

### Common Issues

#### 8.1 Firebase Token Issues
```bash
# If deployment fails with auth error
firebase login:ci
# Update FIREBASE_TOKEN secret with new token
```

#### 8.2 Build Failures
```bash
# Check environment variables are set correctly
# Review build logs in GitHub Actions
# Test build locally:
npm run build
```

#### 8.3 Firestore Rules Deployment
```bash
# Test rules locally
firebase emulators:start --only firestore
# Deploy rules manually
firebase deploy --only firestore:rules
```

### 8.4 Index Creation Issues
```bash
# Monitor index creation in Firebase Console
# Indexes can take several minutes to build
# Check firestore.indexes.json format
```

## Step 9: Performance Optimization

### 9.1 Build Optimization
- Bundle size monitoring
- Code splitting configuration
- Asset optimization

### 9.2 Deployment Speed
- Use build caching
- Parallel job execution
- Artifact management

## Step 10: Maintenance

### 10.1 Regular Tasks
- [ ] Update Firebase SDK monthly
- [ ] Review and rotate tokens quarterly
- [ ] Monitor costs weekly
- [ ] Update dependencies monthly
- [ ] Review security rules quarterly

### 10.2 Monitoring Checklist
- [ ] Firestore costs within budget
- [ ] Build times under 5 minutes
- [ ] Deployment success rate >95%
- [ ] No security vulnerabilities
- [ ] All environments working

## Workflow Status

After setup, your workflow will:

1. **On Pull Request**: Build and test changes
2. **On Push to Develop**: Build, test, and validate
3. **On Push to Main**: Full deployment pipeline
   - Install dependencies
   - Run linting and tests
   - Build application
   - Run security scans
   - Deploy to Firebase
   - Update Firestore rules/indexes
   - Send notifications

## Next Steps

1. Complete the Firebase/Firestore security audit recommendations
2. Implement proper testing (unit, integration, E2E)
3. Set up monitoring and alerting
4. Configure advanced security scanning
5. Implement proper error handling and logging

This CI/CD setup provides a solid foundation for reliable, secure deployments of your MyLocalRIA application.