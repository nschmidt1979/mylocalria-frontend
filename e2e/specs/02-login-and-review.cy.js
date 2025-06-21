/// <reference path="../support/index.d.ts" />

describe('Login and Write Review Journey', () => {
  let testUser
  let advisorData
  let reviewData

  before(() => {
    cy.fixture('users').then((data) => {
      testUser = data.testUser
    })
    cy.fixture('advisors').then((data) => {
      advisorData = data.sampleAdvisor
    })
    cy.fixture('reviews').then((data) => {
      reviewData = data.positiveReview
    })
  })

  describe('User Authentication Flow', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should navigate to login page', () => {
      cy.get('[data-cy="login-link"]').click()
      cy.url().should('include', '/login')
      cy.get('[data-cy="login-form"]').should('be.visible')
    })

    it('should display login form correctly', () => {
      cy.visit('/login')
      
      cy.get('[data-cy="email-input"]').should('be.visible')
      cy.get('[data-cy="password-input"]').should('be.visible')
      cy.get('[data-cy="login-button"]').should('be.visible')
      cy.get('[data-cy="forgot-password-link"]').should('be.visible')
      cy.get('[data-cy="register-link"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/login')
      
      cy.get('[data-cy="login-button"]').click()
      
      cy.get('[data-cy="email-error"]').should('be.visible')
      cy.get('[data-cy="password-error"]').should('be.visible')
    })

    it('should show error for invalid email format', () => {
      cy.visit('/login')
      
      cy.get('[data-cy="email-input"]').type('invalid-email')
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="login-button"]').click()
      
      cy.get('[data-cy="email-error"]').should('contain.text', 'valid email')
    })

    it('should show error for incorrect credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-cy="email-input"]').type('wrong@example.com')
      cy.get('[data-cy="password-input"]').type('wrongpassword')
      cy.get('[data-cy="login-button"]').click()
      
      cy.get('[data-cy="auth-error"]').should('be.visible')
      cy.get('[data-cy="auth-error"]').should('contain.text', 'Invalid credentials')
    })

    it('should successfully log in with valid credentials', () => {
      cy.login(testUser.email, testUser.password)
      
      cy.shouldBeLoggedIn()
      cy.url().should('not.include', '/login')
      
      // Should redirect to dashboard or home
      cy.url().should('match', /\/(dashboard|$)/)
    })

    it('should persist login state after page refresh', () => {
      cy.login(testUser.email, testUser.password)
      cy.reload()
      
      cy.shouldBeLoggedIn()
    })

    it('should logout successfully', () => {
      cy.login(testUser.email, testUser.password)
      cy.logout()
      
      cy.shouldBeLoggedOut()
    })
  })

  describe('Social Login', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should display social login options', () => {
      cy.get('[data-cy="google-login-button"]').should('be.visible')
      cy.get('[data-cy="microsoft-login-button"]').should('be.visible')
    })

    // Note: Social login testing typically requires additional setup and mocking
    // These tests would need to be implemented based on your Firebase Auth configuration
  })

  describe('Write Review Flow', () => {
    beforeEach(() => {
      // Log in before each review test
      cy.login(testUser.email, testUser.password)
    })

    it('should navigate to write review from advisor profile', () => {
      cy.visitAdvisorProfile(advisorData.crdNumber)
      
      cy.get('[data-cy="write-review-button"]').should('be.visible')
      cy.get('[data-cy="write-review-button"]').click()
      
      cy.url().should('include', `/write-review/${advisorData.crdNumber}`)
      cy.get('[data-cy="review-form"]').should('be.visible')
    })

    it('should display review form correctly', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.get('[data-cy="advisor-info"]').should('be.visible')
      cy.get('[data-cy="star-rating"]').should('be.visible')
      cy.get('[data-cy="review-title-input"]').should('be.visible')
      cy.get('[data-cy="review-content-textarea"]').should('be.visible')
      cy.get('[data-cy="submit-review-button"]').should('be.visible')
      cy.get('[data-cy="cancel-button"]').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.get('[data-cy="submit-review-button"]').click()
      
      cy.get('[data-cy="rating-error"]').should('be.visible')
      cy.get('[data-cy="title-error"]').should('be.visible')
      cy.get('[data-cy="content-error"]').should('be.visible')
    })

    it('should submit a complete review successfully', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      // Fill out the review form
      cy.writeReview(reviewData)
      
      cy.get('[data-cy="submit-review-button"]').click()
      
      // Should show success message
      cy.get('[data-cy="review-success-message"]').should('be.visible')
      cy.get('[data-cy="review-success-message"]').should('contain.text', 'Thank you for your review')
      
      // Should redirect back to advisor profile
      cy.url().should('include', `/advisor/${advisorData.crdNumber}`)
    })

    it('should allow selecting different star ratings', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      // Test different rating selections
      for (let rating = 1; rating <= 5; rating++) {
        cy.get(`[data-cy="star-rating-${rating}"]`).click()
        cy.get('[data-cy="selected-rating"]').should('contain.text', rating.toString())
      }
    })

    it('should enforce character limits', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      const longTitle = 'A'.repeat(101) // Assuming 100 char limit
      const longContent = 'B'.repeat(1001) // Assuming 1000 char limit
      
      cy.get('[data-cy="review-title-input"]').type(longTitle)
      cy.get('[data-cy="review-content-textarea"]').type(longContent)
      
      cy.get('[data-cy="title-char-count"]').should('contain.text', '100')
      cy.get('[data-cy="content-char-count"]').should('contain.text', '1000')
      
      cy.get('[data-cy="submit-review-button"]').click()
      
      cy.get('[data-cy="title-error"]').should('contain.text', 'too long')
      cy.get('[data-cy="content-error"]').should('contain.text', 'too long')
    })

    it('should save draft automatically', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.get('[data-cy="star-rating-4"]').click()
      cy.get('[data-cy="review-title-input"]').type('Draft review title')
      cy.get('[data-cy="review-content-textarea"]').type('This is a draft review content')
      
      // Wait for auto-save
      cy.wait(2000)
      cy.get('[data-cy="draft-saved-indicator"]').should('be.visible')
      
      // Refresh page and check if draft is restored
      cy.reload()
      
      cy.get('[data-cy="review-title-input"]').should('have.value', 'Draft review title')
      cy.get('[data-cy="review-content-textarea"]').should('have.value', 'This is a draft review content')
      cy.get('[data-cy="selected-rating"]').should('contain.text', '4')
    })

    it('should allow canceling review', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.get('[data-cy="star-rating-3"]').click()
      cy.get('[data-cy="review-title-input"]').type('Test review')
      
      cy.get('[data-cy="cancel-button"]').click()
      
      // Should show confirmation dialog
      cy.get('[data-cy="cancel-confirmation-modal"]').should('be.visible')
      cy.get('[data-cy="confirm-cancel-button"]').click()
      
      // Should return to advisor profile
      cy.url().should('include', `/advisor/${advisorData.crdNumber}`)
    })

    it('should prevent duplicate reviews', () => {
      // First, submit a review
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      cy.writeReview(reviewData)
      cy.get('[data-cy="submit-review-button"]').click()
      
      // Wait for success
      cy.get('[data-cy="review-success-message"]').should('be.visible')
      
      // Try to write another review for the same advisor
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.get('[data-cy="duplicate-review-message"]').should('be.visible')
      cy.get('[data-cy="duplicate-review-message"]').should('contain.text', 'already reviewed')
      cy.get('[data-cy="review-form"]').should('not.exist')
    })
  })

  describe('Review Management', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password)
    })

    it('should view submitted reviews in user profile', () => {
      cy.visit('/profile')
      
      cy.get('[data-cy="my-reviews-section"]').should('be.visible')
      cy.get('[data-cy="my-reviews-list"]').should('be.visible')
    })

    it('should allow editing submitted reviews', () => {
      cy.visit('/profile')
      
      cy.get('[data-cy="review-card"]').first().within(() => {
        cy.get('[data-cy="edit-review-button"]').click()
      })
      
      cy.get('[data-cy="review-edit-form"]').should('be.visible')
      
      // Make changes
      cy.get('[data-cy="review-title-input"]').clear().type('Updated review title')
      cy.get('[data-cy="save-changes-button"]').click()
      
      cy.get('[data-cy="review-updated-message"]').should('be.visible')
    })

    it('should allow deleting submitted reviews', () => {
      cy.visit('/profile')
      
      cy.get('[data-cy="review-card"]').first().within(() => {
        cy.get('[data-cy="delete-review-button"]').click()
      })
      
      cy.get('[data-cy="delete-confirmation-modal"]').should('be.visible')
      cy.get('[data-cy="confirm-delete-button"]').click()
      
      cy.get('[data-cy="review-deleted-message"]').should('be.visible')
    })
  })

  describe('Review Flow - Mobile', () => {
    beforeEach(() => {
      cy.testMobileView()
      cy.login(testUser.email, testUser.password)
    })

    it('should work correctly on mobile devices', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.get('[data-cy="mobile-review-form"]').should('be.visible')
      cy.get('[data-cy="mobile-star-rating"]').should('be.visible')
      
      // Test mobile review submission
      cy.get('[data-cy="mobile-star-rating-5"]').click()
      cy.get('[data-cy="review-title-input"]').type('Mobile review')
      cy.get('[data-cy="review-content-textarea"]').type('This review was written on mobile')
      
      cy.get('[data-cy="submit-review-button"]').click()
      cy.get('[data-cy="review-success-message"]').should('be.visible')
    })
  })

  describe('Authentication Edge Cases', () => {
    it('should redirect to login when accessing protected review page', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      cy.url().should('include', '/login')
      cy.get('[data-cy="auth-required-message"]').should('be.visible')
    })

    it('should redirect to intended page after login', () => {
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      // Should be redirected to login
      cy.url().should('include', '/login')
      
      // Login
      cy.login(testUser.email, testUser.password)
      
      // Should be redirected back to the review page
      cy.url().should('include', `/write-review/${advisorData.crdNumber}`)
      cy.get('[data-cy="review-form"]').should('be.visible')
    })

    it('should handle session expiration gracefully', () => {
      cy.login(testUser.email, testUser.password)
      
      // Simulate session expiration
      cy.clearLocalStorage()
      cy.clearCookies()
      
      cy.visit(`/write-review/${advisorData.crdNumber}`)
      
      // Should be redirected to login
      cy.url().should('include', '/login')
      cy.get('[data-cy="session-expired-message"]').should('be.visible')
    })
  })
})