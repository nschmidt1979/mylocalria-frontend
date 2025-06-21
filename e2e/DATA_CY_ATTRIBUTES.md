# Data-Cy Attributes Reference

This document lists all the `data-cy` attributes that need to be implemented in the React components for the E2E tests to work properly.

## 🚨 Important Notes

- **All listed attributes MUST be implemented** for tests to pass
- Use exact attribute names as specified
- Add attributes to the appropriate HTML elements (buttons, inputs, containers, etc.)
- Example: `<button data-cy="login-button">Login</button>`

## 📝 Landing Page (`src/pages/Landing.jsx`)

```jsx
// Hero section
<section data-cy="hero-section">
  <div data-cy="search-cta">
    <button data-cy="get-started-button">Get Started</button>
  </div>
</section>
```

## 🔍 Directory/Search Page (`src/pages/Directory.jsx`)

```jsx
// Search section
<div data-cy="search-section">
  <input data-cy="search-input" placeholder="Search advisors..." />
  <button data-cy="search-button">Search</button>
  <div data-cy="search-filters">
    <input data-cy="location-filter" placeholder="Location" />
    <div data-cy="location-filter-option">New York, NY</div>
    <select data-cy="specialization-filter">
      <option value="">All Specializations</option>
    </select>
    <select data-cy="rating-filter">
      <option value="">Any Rating</option>
    </select>
  </div>
  <button data-cy="clear-filters-button">Clear Filters</button>
</div>

// Search results
<div data-cy="search-results">
  <div data-cy="search-loading">Loading...</div>
  <div data-cy="search-results-count">Found X results</div>
  <div data-cy="current-search-term">financial planning</div>
  <div data-cy="active-filters">
    <span>New York</span>
    <span>Retirement Planning</span>
  </div>
  
  // Advisor cards
  <div data-cy="advisor-card">
    <div data-cy="advisor-name">John Smith</div>
    <div data-cy="advisor-business-name">Smith Financial</div>
    <div data-cy="advisor-location">New York, NY</div>
    <div data-cy="advisor-specialization">Retirement Planning</div>
    <div data-cy="advisor-rating">4.5</div>
  </div>
</div>

// No results
<div data-cy="no-results-message">No advisors found</div>
<div data-cy="search-suggestions">Try different keywords</div>

// Mobile specific
<input data-cy="mobile-search-input" />
<button data-cy="mobile-search-button">Search</button>
<button data-cy="mobile-filter-toggle">Filters</button>
<div data-cy="mobile-filters-panel">Filter options</div>
```

## 👤 Advisor Profile Page (`src/pages/AdvisorProfile.jsx`)

```jsx
<div data-cy="advisor-profile">
  <div data-cy="advisor-name">John Smith</div>
  <div data-cy="advisor-business-name">Smith Financial Advisory</div>
  <div data-cy="advisor-rating">4.5</div>
  <div data-cy="advisor-reviews-count">25 reviews</div>
  
  // Contact information
  <div data-cy="contact-information">
    <div data-cy="advisor-phone">(555) 123-4567</div>
    <div data-cy="advisor-email">john@smithfinancial.com</div>
    <div data-cy="advisor-address">123 Main St, New York, NY</div>
  </div>
  
  // Services and bio
  <div data-cy="services-section">Services offered</div>
  <div data-cy="specializations-section">Specializations</div>
  <div data-cy="advisor-bio">Professional biography</div>
  
  // Reviews section
  <div data-cy="reviews-section">
    <div data-cy="reviews-summary">Review summary</div>
    <div data-cy="review-card">Individual review</div>
  </div>
  
  // Actions
  <button data-cy="write-review-button">Write Review</button>
  <button data-cy="back-to-results">Back to Results</button>
</div>
```

## 🔐 Login Page (`src/pages/Login.jsx`)

```jsx
<form data-cy="login-form">
  <input data-cy="email-input" type="email" />
  <div data-cy="email-error">Email error message</div>
  
  <input data-cy="password-input" type="password" />
  <div data-cy="password-error">Password error message</div>
  
  <button data-cy="login-button">Login</button>
  <div data-cy="auth-error">Authentication error</div>
  
  <a data-cy="forgot-password-link">Forgot Password?</a>
  <a data-cy="register-link">Sign Up</a>
  
  // Social login
  <button data-cy="google-login-button">Login with Google</button>
  <button data-cy="microsoft-login-button">Login with Microsoft</button>
</form>

// Auth messages
<div data-cy="auth-required-message">Please log in</div>
<div data-cy="session-expired-message">Session expired</div>
```

## 📝 Register Page (`src/pages/Register.jsx`)

```jsx
<form data-cy="registration-form">
  <input data-cy="first-name-input" />
  <div data-cy="first-name-error">First name error</div>
  
  <input data-cy="last-name-input" />
  <div data-cy="last-name-error">Last name error</div>
  
  <input data-cy="email-input" type="email" />
  <div data-cy="email-error">Email error</div>
  
  <input data-cy="password-input" type="password" />
  <div data-cy="password-error">Password error</div>
  <div data-cy="password-strength">Password strength indicator</div>
  
  <input data-cy="confirm-password-input" type="password" />
  <div data-cy="confirm-password-error">Password confirmation error</div>
  
  <button data-cy="register-button">Register</button>
  <div data-cy="registration-error">Registration error</div>
  
  <a data-cy="login-link">Already have an account?</a>
  
  // Social registration
  <button data-cy="google-register-button">Register with Google</button>
  <button data-cy="microsoft-register-button">Register with Microsoft</button>
</form>
```

## ✍️ Write Review Page (`src/pages/WriteReview.jsx`)

```jsx
<div data-cy="review-form">
  <div data-cy="advisor-info">Advisor information</div>
  
  // Star rating
  <div data-cy="star-rating">
    <button data-cy="star-rating-1">1 star</button>
    <button data-cy="star-rating-2">2 stars</button>
    <button data-cy="star-rating-3">3 stars</button>
    <button data-cy="star-rating-4">4 stars</button>
    <button data-cy="star-rating-5">5 stars</button>
  </div>
  <div data-cy="selected-rating">Current rating: 4</div>
  <div data-cy="rating-error">Rating required</div>
  
  // Review form
  <input data-cy="review-title-input" placeholder="Review title" />
  <div data-cy="title-error">Title error</div>
  <div data-cy="title-char-count">Characters remaining</div>
  
  <textarea data-cy="review-content-textarea" />
  <div data-cy="content-error">Content error</div>
  <div data-cy="content-char-count">Characters remaining</div>
  
  // Actions
  <button data-cy="submit-review-button">Submit Review</button>
  <button data-cy="cancel-button">Cancel</button>
  
  // Status messages
  <div data-cy="review-success-message">Review submitted successfully</div>
  <div data-cy="duplicate-review-message">You already reviewed this advisor</div>
  <div data-cy="draft-saved-indicator">Draft saved</div>
</div>

// Confirmation modals
<div data-cy="cancel-confirmation-modal">
  <button data-cy="confirm-cancel-button">Yes, Cancel</button>
</div>

// Mobile specific
<div data-cy="mobile-review-form">Mobile review form</div>
<div data-cy="mobile-star-rating">Mobile star rating</div>
<button data-cy="mobile-star-rating-5">5 stars mobile</button>
```

## 🏢 Advisor Registration Page (`src/pages/AdvisorRegistration.jsx`)

```jsx
<form data-cy="advisor-registration-form">
  // Progress indicator
  <div data-cy="form-progress">
    <div data-cy="step-1" className="active">Step 1</div>
    <div data-cy="step-2">Step 2</div>
  </div>
  
  // Personal Information
  <div data-cy="personal-info-section">
    <input data-cy="firstName-input" />
    <div data-cy="firstName-error">First name error</div>
    
    <input data-cy="lastName-input" />
    <div data-cy="lastName-error">Last name error</div>
    
    <input data-cy="crdNumber-input" />
    <div data-cy="crdNumber-error">CRD number error</div>
    <div data-cy="crd-error">CRD already registered</div>
  </div>
  
  // Business Information
  <div data-cy="business-info-section">
    <input data-cy="businessName-input" />
    <div data-cy="businessName-error">Business name error</div>
    
    <input data-cy="phone-input" />
    <div data-cy="phone-error">Phone error</div>
    
    <input data-cy="email-input" />
    <div data-cy="email-error">Email error</div>
    
    <input data-cy="address-input" />
    <input data-cy="city-input" />
    <input data-cy="state-input" />
    <input data-cy="zipCode-input" />
    <div data-cy="zipCode-error">ZIP code error</div>
  </div>
  
  // Professional Information
  <div data-cy="professional-info-section">
    <input data-cy="specialization-input" />
    <input data-cy="yearsOfExperience-input" />
    <textarea data-cy="bio-input" />
    <div data-cy="bio-error">Bio too long</div>
    <div data-cy="bio-char-count">1000 characters remaining</div>
  </div>
  
  // File uploads
  <div data-cy="profile-photo-upload">
    <input data-cy="profile-photo-input" type="file" />
    <div data-cy="photo-preview">Photo preview</div>
    <div data-cy="file-type-error">Invalid file type</div>
    <div data-cy="file-size-error">File too large</div>
    <div data-cy="upload-success-message">Upload successful</div>
  </div>
  
  <div data-cy="credentials-upload">
    <input data-cy="credentials-input" type="file" />
    <div data-cy="document-list">List of uploaded documents</div>
    <button data-cy="remove-document-button">Remove</button>
    <button data-cy="confirm-remove-button">Confirm Remove</button>
  </div>
  
  // Navigation
  <button data-cy="next-step-button">Next Step</button>
  <button data-cy="previous-step-button">Previous Step</button>
  <button data-cy="submit-registration-button">Submit Registration</button>
  
  // Status messages
  <div data-cy="registration-success-message">Registration successful</div>
  <div data-cy="draft-saved-indicator">Draft saved</div>
  <div data-cy="network-error-message">Network error</div>
  <div data-cy="server-error-message">Server error</div>
  <button data-cy="retry-button">Retry</button>
</form>

// Mobile specific
<div data-cy="mobile-registration-form">Mobile form</div>
<button data-cy="mobile-next-button">Next</button>
<div data-cy="mobile-form-step-2">Step 2 mobile</div>
<button data-cy="personal-info-toggle">Toggle section</button>
```

## 🏠 Dashboard Page (`src/pages/Dashboard.jsx`)

```jsx
<div data-cy="dashboard">
  <button data-cy="become-advisor-button">Become an Advisor</button>
</div>
```

## 👤 Profile Page (`src/pages/Profile.jsx`)

```jsx
<div data-cy="my-reviews-section">
  <div data-cy="my-reviews-list">
    <div data-cy="review-card">
      <button data-cy="edit-review-button">Edit</button>
      <button data-cy="delete-review-button">Delete</button>
    </div>
  </div>
</div>

// Review editing
<form data-cy="review-edit-form">
  <input data-cy="review-title-input" />
  <button data-cy="save-changes-button">Save Changes</button>
</form>

// Status messages
<div data-cy="review-updated-message">Review updated</div>
<div data-cy="review-deleted-message">Review deleted</div>

// Delete confirmation
<div data-cy="delete-confirmation-modal">
  <button data-cy="confirm-delete-button">Delete</button>
</div>
```

## 🧭 Layout Components

### Header (`src/components/layout/Header.jsx`)
```jsx
<header>
  <a data-cy="login-link">Login</a>
  <div data-cy="user-menu">User Menu</div>
  <button data-cy="logout-button">Logout</button>
  <div data-cy="user-name">John Doe</div>
</header>
```

### Loading Components
```jsx
<div data-cy="loading-spinner">Loading...</div>
```

## 🎯 Implementation Tips

1. **Add to JSX elements**: `<button data-cy="login-button">Login</button>`
2. **Use kebab-case**: `data-cy="multi-word-attribute"`
3. **Be descriptive**: Use clear, descriptive names
4. **Group logically**: Related elements should have related names
5. **Test early**: Add attributes as you build components

## ✅ Testing Your Implementation

Run this command to check if your data-cy attributes are working:

```bash
# Test specific selectors
npx cypress run --spec "e2e/specs/01-advisor-search.cy.js" --headed

# Open Cypress to debug interactively
npm run cy:open
```

## 🚨 Common Mistakes

- ❌ `data-cy="loginButton"` (camelCase)
- ❌ `data-test="login-button"` (wrong attribute name)
- ❌ Missing attributes on conditional elements
- ❌ Duplicate data-cy values

- ✅ `data-cy="login-button"` (kebab-case)
- ✅ All required attributes implemented
- ✅ Unique values for each element
- ✅ Descriptive, meaningful names