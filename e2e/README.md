# MyLocalRIA E2E Test Suite

This directory contains end-to-end (E2E) tests for the MyLocalRIA React application using Cypress. The tests cover three main user journeys:

1. **Visitor searches for an advisor** (`01-advisor-search.cy.js`)
2. **User logs in and writes a review** (`02-login-and-review.cy.js`)
3. **User registers and completes advisor profile** (`03-registration-and-advisor-profile.cy.js`)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A running MyLocalRIA application (local development server)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Cypress (if not already installed):
```bash
npm install cypress --save-dev
```

### Running Tests

#### Interactive Mode (Recommended for Development)
```bash
# Open Cypress Test Runner
npm run cy:open

# Or run tests with the dev server
npm run test:e2e:open
```

#### Headless Mode (CI/CD)
```bash
# Run all tests headlessly
npm run cy:run

# Run tests with specific browser
npm run cy:run:chrome
npm run cy:run:firefox

# Run tests with dev server
npm run test:e2e
```

#### Run Specific Test Files
```bash
# Run only advisor search tests
npx cypress run --spec "e2e/specs/01-advisor-search.cy.js"

# Run only login and review tests
npx cypress run --spec "e2e/specs/02-login-and-review.cy.js"

# Run only registration tests
npx cypress run --spec "e2e/specs/03-registration-and-advisor-profile.cy.js"
```

## 📁 Directory Structure

```
e2e/
├── fixtures/           # Test data files
│   ├── users.json     # User account data
│   ├── advisors.json  # Advisor profile data
│   ├── reviews.json   # Review content data
│   ├── credentials.pdf # Mock PDF for document upload
│   └── profile-photo.jpg # Mock image for photo upload
├── specs/             # Test specification files
│   ├── 01-advisor-search.cy.js
│   ├── 02-login-and-review.cy.js
│   └── 03-registration-and-advisor-profile.cy.js
├── support/           # Support files and custom commands
│   ├── commands.js    # Custom Cypress commands
│   └── e2e.js        # Global configuration and setup
├── screenshots/       # Screenshots from failed tests
├── videos/           # Video recordings of test runs
└── README.md         # This file
```

## 🧪 Test Scenarios

### 1. Advisor Search Journey (`01-advisor-search.cy.js`)

**User Story**: As a visitor, I want to search for financial advisors to find the right one for my needs.

**Test Coverage**:
- Landing page display and navigation
- Search interface functionality
- Text-based search
- Filter by location, specialization, and rating
- Combined filter application
- Search results display and pagination
- Advisor profile viewing
- Mobile responsive design
- Performance validation

**Key Features Tested**:
- Search input and button functionality
- Filter dropdowns and selections
- Search results grid/list view
- Advisor card information display
- Navigation between search and profile pages
- Mobile-friendly interface

### 2. Login and Review Journey (`02-login-and-review.cy.js`)

**User Story**: As a registered user, I want to log in and write reviews for advisors I've worked with.

**Test Coverage**:
- User authentication flow
- Login form validation
- Social login options (Google, Microsoft)
- Review writing interface
- Review form validation
- Review submission process
- Review management (edit, delete)
- Session management
- Mobile review writing

**Key Features Tested**:
- Email/password authentication
- Form validation messages
- Star rating selection
- Review content input
- Draft saving functionality
- Review publication
- User session persistence

### 3. Registration and Advisor Profile Journey (`03-registration-and-advisor-profile.cy.js`)

**User Story**: As a new user, I want to register an account and complete my advisor profile to start receiving clients.

**Test Coverage**:
- User registration process
- Password strength validation
- Email verification flow
- Advisor profile creation
- Multi-step form navigation
- File upload functionality
- Form validation and error handling
- Document upload (credentials, photos)
- Profile completion workflow

**Key Features Tested**:
- Registration form validation
- Password confirmation
- CRD number validation
- Business information collection
- Professional credentials upload
- Profile photo upload
- Multi-step form progress
- Draft saving and restoration

## 🔧 Configuration

### Environment Variables

Set these environment variables for testing:

```bash
# In cypress.config.js or via environment
CYPRESS_TEST_USER_EMAIL=test@example.com
CYPRESS_TEST_USER_PASSWORD=testpassword123
CYPRESS_TEST_ADVISOR_EMAIL=advisor@example.com
CYPRESS_TEST_ADVISOR_PASSWORD=advisorpassword123
```

### Test Data

Test data is stored in `fixtures/` directory:

- `users.json`: Contains test user accounts
- `advisors.json`: Contains advisor profile data
- `reviews.json`: Contains sample review content
- Binary files for upload testing

### Custom Commands

The test suite includes custom Cypress commands defined in `support/commands.js`:

#### Authentication Commands
- `cy.login(email, password)` - Log in a user
- `cy.register(userData)` - Register a new user
- `cy.logout()` - Log out current user

#### Navigation Commands
- `cy.searchAdvisors(searchTerm, filters)` - Perform advisor search
- `cy.visitAdvisorProfile(crdNumber)` - Navigate to advisor profile

#### Form Commands
- `cy.fillAdvisorRegistrationForm(data)` - Fill advisor registration form
- `cy.writeReview(reviewData)` - Fill and submit review form

#### Utility Commands
- `cy.waitForPageLoad()` - Wait for page to fully load
- `cy.waitForSearchResults()` - Wait for search results to appear
- `cy.shouldBeLoggedIn()` - Assert user is logged in
- `cy.shouldBeLoggedOut()` - Assert user is logged out

## 📱 Cross-Browser Testing

The test suite supports multiple browsers:

```bash
# Chrome (default)
npm run cy:run:chrome

# Firefox
npm run cy:run:firefox

# Edge (Windows)
npx cypress run --browser edge

# Electron (headless)
npx cypress run --browser electron
```

## 📺 Test Reporting

### Screenshots and Videos

- Screenshots are automatically captured on test failures
- Videos are recorded for all test runs in headless mode
- Files are stored in `e2e/screenshots/` and `e2e/videos/`

### Custom Reporting

To add custom reporting (e.g., HTML reports, JUnit XML):

```bash
# Install mochawesome reporter
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator

# Update cypress.config.js
reporter: 'mochawesome',
reporterOptions: {
  reportDir: 'cypress/reports',
  overwrite: false,
  html: false,
  json: true
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests fail with "cy.get() failed"**
   - Ensure your application is running on `http://localhost:5173`
   - Check that the correct `data-cy` attributes are added to your components
   - Verify element selectors match your actual application

2. **Authentication tests fail**
   - Ensure Firebase Auth is properly configured
   - Check that test user accounts exist in your Firebase project
   - Verify environment variables are set correctly

3. **File upload tests fail**
   - Install `cypress-file-upload` plugin: `npm install --save-dev cypress-file-upload`
   - Ensure fixture files exist in the correct directory

4. **Tests are slow or timing out**
   - Increase timeout values in `cypress.config.js`
   - Optimize your application's loading performance
   - Use `cy.intercept()` to mock slow API calls

### Debugging Tips

1. **Use Cypress Debug Mode**:
```bash
DEBUG=cypress:* npx cypress run
```

2. **Add Debug Points**:
```javascript
cy.debug() // Pauses test execution
cy.pause() // Pauses test with step-through controls
```

3. **Log Network Requests**:
```javascript
cy.intercept('**', (req) => {
  console.log('Request:', req.method, req.url);
}).as('allRequests');
```

## 🔒 Security Considerations

- Never commit real user credentials to version control
- Use environment variables for sensitive data
- Consider using test-specific Firebase projects
- Implement proper test data cleanup procedures

## 📚 Best Practices

1. **Data Attributes**: Use `data-cy` attributes for reliable element selection
2. **Test Isolation**: Each test should be independent and clean up after itself
3. **Realistic Data**: Use realistic test data that matches production scenarios
4. **Page Objects**: Consider implementing page object pattern for complex applications
5. **Async Operations**: Properly handle async operations with `cy.wait()` and assertions

## 🤝 Contributing

When adding new tests:

1. Follow the existing naming convention
2. Add appropriate test data to fixtures
3. Use existing custom commands when possible
4. Include mobile responsive testing
5. Add proper error handling scenarios
6. Update this README with new test descriptions

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
        env:
          CYPRESS_TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          CYPRESS_TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## 📞 Support

For questions or issues with the E2E test suite:

1. Check the [Cypress Documentation](https://docs.cypress.io/)
2. Review test logs and screenshots
3. Create an issue in the project repository
4. Contact the development team

---

**Happy Testing! 🎉**