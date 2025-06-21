// ***********************************************
// Custom commands for MyLocalRIA E2E tests
// ***********************************************

// Authentication Commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy="email-input"]').type(email || Cypress.env('TEST_USER_EMAIL'))
  cy.get('[data-cy="password-input"]').type(password || Cypress.env('TEST_USER_PASSWORD'))
  cy.get('[data-cy="login-button"]').click()
  
  // Wait for successful login and redirect
  cy.url().should('not.include', '/login')
  cy.get('[data-cy="user-menu"]').should('be.visible')
})

Cypress.Commands.add('register', (userData) => {
  const defaultUserData = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User'
  }
  
  const user = { ...defaultUserData, ...userData }
  
  cy.visit('/register')
  cy.get('[data-cy="first-name-input"]').type(user.firstName)
  cy.get('[data-cy="last-name-input"]').type(user.lastName)
  cy.get('[data-cy="email-input"]').type(user.email)
  cy.get('[data-cy="password-input"]').type(user.password)
  cy.get('[data-cy="confirm-password-input"]').type(user.password)
  cy.get('[data-cy="register-button"]').click()
  
  // Wait for successful registration
  cy.url().should('not.include', '/register')
  return cy.wrap(user)
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.get('[data-cy="logout-button"]').click()
  cy.url().should('include', '/')
  cy.get('[data-cy="login-link"]').should('be.visible')
})

// Search Commands
Cypress.Commands.add('searchAdvisors', (searchTerm, filters = {}) => {
  cy.visit('/directory')
  
  if (searchTerm) {
    cy.get('[data-cy="search-input"]').type(searchTerm)
  }
  
  // Apply filters if provided
  Object.keys(filters).forEach(filterType => {
    cy.get(`[data-cy="filter-${filterType}"]`).select(filters[filterType])
  })
  
  cy.get('[data-cy="search-button"]').click()
  cy.get('[data-cy="search-results"]').should('be.visible')
})

// Navigation Commands
Cypress.Commands.add('visitAdvisorProfile', (crdNumber) => {
  cy.visit(`/advisor/${crdNumber}`)
  cy.get('[data-cy="advisor-profile"]').should('be.visible')
})

// Form Commands
Cypress.Commands.add('fillAdvisorRegistrationForm', (advisorData) => {
  const defaultData = {
    crdNumber: Math.floor(Math.random() * 1000000).toString(),
    businessName: 'Test Advisory Firm',
    firstName: 'John',
    lastName: 'Advisor',
    email: `advisor-${Date.now()}@example.com`,
    phone: '555-123-4567',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    specialization: 'Financial Planning',
    yearsOfExperience: '5',
    bio: 'Experienced financial advisor specializing in retirement planning.'
  }
  
  const data = { ...defaultData, ...advisorData }
  
  Object.keys(data).forEach(field => {
    cy.get(`[data-cy="${field}-input"]`).type(data[field])
  })
  
  return cy.wrap(data)
})

Cypress.Commands.add('writeReview', (reviewData) => {
  const defaultReview = {
    rating: 5,
    title: 'Great advisor!',
    content: 'This advisor provided excellent service and helped me with my financial planning needs.'
  }
  
  const review = { ...defaultReview, ...reviewData }
  
  // Set rating
  cy.get(`[data-cy="star-rating-${review.rating}"]`).click()
  
  // Fill review form
  cy.get('[data-cy="review-title-input"]').type(review.title)
  cy.get('[data-cy="review-content-textarea"]').type(review.content)
  
  return cy.wrap(review)
})

// Wait Commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-cy="loading-spinner"]').should('not.exist')
  cy.get('body').should('be.visible')
})

Cypress.Commands.add('waitForSearchResults', () => {
  cy.get('[data-cy="search-loading"]').should('not.exist')
  cy.get('[data-cy="search-results"]').should('be.visible')
})

// Assertion Commands
Cypress.Commands.add('shouldBeLoggedIn', () => {
  cy.get('[data-cy="user-menu"]').should('be.visible')
  cy.get('[data-cy="login-link"]').should('not.exist')
})

Cypress.Commands.add('shouldBeLoggedOut', () => {
  cy.get('[data-cy="login-link"]').should('be.visible')
  cy.get('[data-cy="user-menu"]').should('not.exist')
})

// Mobile responsive commands
Cypress.Commands.add('testMobileView', () => {
  cy.viewport('iphone-x')
})

Cypress.Commands.add('testTabletView', () => {
  cy.viewport('ipad-2')
})

Cypress.Commands.add('testDesktopView', () => {
  cy.viewport(1280, 720)
})