# Testing Documentation

This document provides comprehensive information about the testing setup for the MyLocalRIA React application.

## Testing Framework

We use **Jest** as our test runner and **React Testing Library** for component testing, following best practices for testing React applications with a focus on user behavior rather than implementation details.

## Test Structure

Tests are organized in `__tests__` directories alongside the components they test:

```
src/
├── components/
│   ├── advisors/
│   │   ├── __tests__/
│   │   │   └── AdvisorCard.test.jsx
│   │   └── AdvisorCard.jsx
│   ├── auth/
│   │   ├── __tests__/
│   │   │   ├── AdminRoute.test.jsx
│   │   │   ├── PrivateRoute.test.jsx
│   │   │   └── ProtectedRoute.test.jsx
│   │   └── ...
│   └── ...
```

## Available Test Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch mode, with coverage)
npm run test:ci
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom for DOM testing
- **Setup**: Configures React Testing Library and mocks
- **Transform**: Babel for JSX and ES6+ syntax
- **Coverage**: Configured to collect from all components

### Setup File (`src/setupTests.js`)
- Configures Jest DOM matchers
- Mocks Firebase services
- Mocks React Router hooks
- Mocks authentication context
- Mocks geolocation services
- Provides browser API polyfills

## Component Test Coverage

### Authentication Components
- **PrivateRoute**: Tests authentication-based routing
- **AdminRoute**: Tests admin-only access control
- **ProtectedRoute**: Tests role-based access control

### Common Components
- **LoadingSpinner**: Tests rendering and prop handling
- **StarRating**: Tests rating display and interactions
- **SocialIcons**: Tests icon rendering and styling
- **RouteTransition**: Tests loading states and route changes

### Form Components
- **SearchFilters**: Tests form interactions and state management
- **WriteReviewModal**: Tests form validation and submission
- **Directory SearchFilters**: Tests geolocation and filtering

### Layout Components
- **Header**: Tests navigation, authentication states, and mobile menu
- **NotificationCenter**: Tests notification display and interactions

### Business Logic Components
- **AdvisorCard**: Tests data display and navigation

## Testing Patterns

### 1. Form Validation Tests
```javascript
test('shows validation error when submitting without rating', async () => {
  const user = userEvent.setup();
  render(<WriteReviewModal {...mockProps} />);

  const textarea = screen.getByLabelText('Your Review');
  await user.type(textarea, 'Great review content');

  const submitButton = screen.getByRole('button', { name: 'Submit Review' });
  await user.click(submitButton);

  expect(screen.getByText('Please provide both a rating and review content.')).toBeInTheDocument();
});
```

### 2. Conditional Rendering Tests
```javascript
test('renders children when user is authenticated', () => {
  useAuth.mockReturnValue({
    user: { uid: '123' },
    loading: false
  });

  renderProtectedRoute();

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
  expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
});
```

### 3. User Interaction Tests
```javascript
test('handles logout functionality', async () => {
  const mockLogout = jest.fn().mockResolvedValue();
  const user = userEvent.setup();
  
  render(<Header />);

  const settingsButton = screen.getByTestId('cog-icon').closest('button');
  await user.click(settingsButton);

  const logoutButton = screen.getByText('Logout');
  await user.click(logoutButton);

  await waitFor(() => {
    expect(mockLogout).toHaveBeenCalled();
  });
});
```

### 4. Async Operations Tests
```javascript
test('successfully submits review with valid data', async () => {
  const { addDoc } = require('../../../firebase');
  const mockDocRef = { id: 'review-123' };
  addDoc.mockResolvedValue(mockDocRef);
  
  // ... test implementation
  
  await waitFor(() => {
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        advisorId: 'advisor-123',
        content: 'Excellent advisor service'
      })
    );
  });
});
```

## Mocking Strategy

### Firebase Services
- All Firebase operations are mocked
- Consistent mock data for Firestore operations
- Error handling scenarios covered

### External APIs
- Geolocation API mocked with test coordinates
- Reverse geocoding API mocked with test responses
- Network requests mocked with fetch

### React Router
- Navigation hooks mocked
- URL parameters mocked
- Route protection logic tested

### Authentication Context
- Different user states (authenticated, admin, advisor)
- Loading states
- Error states

## Test Data Patterns

### Mock Users
```javascript
const mockUser = {
  uid: 'user-123',
  email: 'user@example.com',
  displayName: 'Test User',
  isAdvisor: false,
  isAdmin: false,
};
```

### Mock Advisor Data
```javascript
const mockAdvisor = {
  id: '1',
  primary_business_name: 'Test Financial Advisory',
  crd_number: '123456',
  // ... complete advisor data structure
};
```

## Running Tests

### Development Workflow
1. Run `npm run test:watch` during development
2. Write tests alongside feature development
3. Ensure all new components have corresponding tests
4. Maintain test coverage above 80%

### CI/CD Integration
```bash
# In CI pipeline
npm run test:ci
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory:
- **HTML Report**: `coverage/lcov-report/index.html`
- **Text Summary**: Displayed in terminal
- **LCOV Format**: For CI integration

## Best Practices

### 1. Test Behavior, Not Implementation
- Focus on what users can see and do
- Avoid testing internal component state
- Use accessible queries (getByRole, getByLabelText)

### 2. Comprehensive Error Testing
- Test error states and edge cases
- Mock API failures
- Test network error scenarios

### 3. Accessibility Testing
- Use semantic queries
- Test keyboard navigation
- Verify ARIA attributes

### 4. Performance Considerations
- Use `userEvent` for realistic user interactions
- Mock expensive operations
- Clean up after tests

## Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` for async state changes
2. **User events**: Use `userEvent.setup()` for modern event handling
3. **Component isolation**: Ensure proper mocking of dependencies
4. **State cleanup**: Clear mocks between tests

### Debug Commands
```bash
# Run a specific test file
npm test -- SearchFilters.test.jsx

# Run tests matching a pattern
npm test -- --testNamePattern="handles form submission"

# Debug with verbose output
npm test -- --verbose
```

## Contributing

When adding new components:
1. Create corresponding test file in `__tests__/` directory
2. Test all major functionality and edge cases
3. Include accessibility tests
4. Maintain or improve coverage percentage
5. Follow existing test patterns and naming conventions

## Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

Current test coverage focuses on:
- ✅ Component rendering
- ✅ User interactions
- ✅ Form validation
- ✅ Authentication states
- ✅ Error handling
- ✅ Async operations
- ✅ Conditional rendering
- ✅ Navigation logic