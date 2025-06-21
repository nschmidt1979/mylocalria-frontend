/// <reference path="../support/index.d.ts" />

describe('Registration and Advisor Profile Journey', () => {
  let newUserData
  let advisorRegistrationData

  before(() => {
    cy.fixture('users').then((data) => {
      newUserData = data.newUser
    })
    cy.fixture('advisors').then((data) => {
      advisorRegistrationData = data.newAdvisorRegistration
    })
  })

  describe('User Registration Flow', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should display registration form correctly', () => {
      cy.get('[data-cy="registration-form"]').should('be.visible')
      cy.get('[data-cy="first-name-input"]').should('be.visible')
      cy.get('[data-cy="last-name-input"]').should('be.visible')
      cy.get('[data-cy="email-input"]').should('be.visible')
      cy.get('[data-cy="password-input"]').should('be.visible')
      cy.get('[data-cy="confirm-password-input"]').should('be.visible')
      cy.get('[data-cy="register-button"]').should('be.visible')
      cy.get('[data-cy="login-link"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.get('[data-cy="register-button"]').click()
      
      cy.get('[data-cy="first-name-error"]').should('be.visible')
      cy.get('[data-cy="last-name-error"]').should('be.visible')
      cy.get('[data-cy="email-error"]').should('be.visible')
      cy.get('[data-cy="password-error"]').should('be.visible')
    })

    it('should validate email format', () => {
      cy.get('[data-cy="email-input"]').type('invalid-email')
      cy.get('[data-cy="register-button"]').click()
      
      cy.get('[data-cy="email-error"]').should('contain.text', 'valid email')
    })

    it('should validate password strength', () => {
      cy.get('[data-cy="password-input"]').type('weak')
      cy.get('[data-cy="register-button"]').click()
      
      cy.get('[data-cy="password-error"]').should('contain.text', 'at least 8 characters')
    })

    it('should validate password confirmation', () => {
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="confirm-password-input"]').type('different123')
      cy.get('[data-cy="register-button"]').click()
      
      cy.get('[data-cy="confirm-password-error"]').should('contain.text', 'Passwords do not match')
    })

    it('should show password strength indicator', () => {
      cy.get('[data-cy="password-input"]').type('weak')
      cy.get('[data-cy="password-strength"]').should('contain.text', 'Weak')
      
      cy.get('[data-cy="password-input"]').clear().type('StrongPass123!')
      cy.get('[data-cy="password-strength"]').should('contain.text', 'Strong')
    })

    it('should successfully register a new user', () => {
      const userData = {
        ...newUserData,
        email: `test-${Date.now()}@example.com` // Ensure unique email
      }
      
      cy.register(userData).then((user) => {
        // Should be logged in after registration
        cy.shouldBeLoggedIn()
        
        // Should redirect to dashboard or onboarding
        cy.url().should('match', /\/(dashboard|onboarding|$)/)
        
        // Verify user name appears in UI
        cy.get('[data-cy="user-name"]').should('contain.text', user.firstName)
      })
    })

    it('should handle existing email error', () => {
      // First registration
      const userData = {
        ...newUserData,
        email: `existing-${Date.now()}@example.com`
      }
      
      cy.register(userData)
      cy.logout()
      
      // Try to register again with same email
      cy.visit('/register')
      cy.get('[data-cy="first-name-input"]').type(userData.firstName)
      cy.get('[data-cy="last-name-input"]').type(userData.lastName)
      cy.get('[data-cy="email-input"]').type(userData.email)
      cy.get('[data-cy="password-input"]').type(userData.password)
      cy.get('[data-cy="confirm-password-input"]').type(userData.password)
      cy.get('[data-cy="register-button"]').click()
      
      cy.get('[data-cy="registration-error"]').should('be.visible')
      cy.get('[data-cy="registration-error"]').should('contain.text', 'already exists')
    })

    it('should navigate to login page from registration', () => {
      cy.get('[data-cy="login-link"]').click()
      cy.url().should('include', '/login')
    })
  })

  describe('Social Registration', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should display social registration options', () => {
      cy.get('[data-cy="google-register-button"]').should('be.visible')
      cy.get('[data-cy="microsoft-register-button"]').should('be.visible')
    })

    // Note: Social registration testing typically requires additional setup and mocking
  })

  describe('Advisor Registration Flow', () => {
    beforeEach(() => {
      // Register and login as a new user first
      const userData = {
        ...newUserData,
        email: `advisor-${Date.now()}@example.com`
      }
      
      cy.register(userData)
    })

    it('should navigate to advisor registration', () => {
      // From dashboard or profile
      cy.visit('/dashboard')
      cy.get('[data-cy="become-advisor-button"]').click()
      
      cy.url().should('include', '/advisor-registration')
      cy.get('[data-cy="advisor-registration-form"]').should('be.visible')
    })

    it('should display advisor registration form correctly', () => {
      cy.visit('/advisor-registration')
      
      // Personal Information Section
      cy.get('[data-cy="personal-info-section"]').should('be.visible')
      cy.get('[data-cy="firstName-input"]').should('be.visible')
      cy.get('[data-cy="lastName-input"]').should('be.visible')
      cy.get('[data-cy="crdNumber-input"]').should('be.visible')
      
      // Business Information Section
      cy.get('[data-cy="business-info-section"]').should('be.visible')
      cy.get('[data-cy="businessName-input"]').should('be.visible')
      cy.get('[data-cy="phone-input"]').should('be.visible')
      cy.get('[data-cy="address-input"]').should('be.visible')
      cy.get('[data-cy="city-input"]').should('be.visible')
      cy.get('[data-cy="state-input"]').should('be.visible')
      cy.get('[data-cy="zipCode-input"]').should('be.visible')
      
      // Professional Information Section
      cy.get('[data-cy="professional-info-section"]').should('be.visible')
      cy.get('[data-cy="specialization-input"]').should('be.visible')
      cy.get('[data-cy="yearsOfExperience-input"]').should('be.visible')
      cy.get('[data-cy="bio-input"]').should('be.visible')
      
      // Submit button
      cy.get('[data-cy="submit-registration-button"]').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.visit('/advisor-registration')
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="crdNumber-error"]').should('be.visible')
      cy.get('[data-cy="businessName-error"]').should('be.visible')
      cy.get('[data-cy="firstName-error"]').should('be.visible')
      cy.get('[data-cy="lastName-error"]').should('be.visible')
      cy.get('[data-cy="phone-error"]').should('be.visible')
    })

    it('should validate CRD number format', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="crdNumber-input"]').type('invalid')
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="crdNumber-error"]').should('contain.text', 'valid CRD number')
    })

    it('should validate phone number format', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="phone-input"]').type('123')
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="phone-error"]').should('contain.text', 'valid phone number')
    })

    it('should validate email format', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="email-input"]').type('invalid-email')
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="email-error"]').should('contain.text', 'valid email')
    })

    it('should validate ZIP code format', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="zipCode-input"]').type('123')
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="zipCode-error"]').should('contain.text', 'valid ZIP code')
    })

    it('should validate bio character limit', () => {
      cy.visit('/advisor-registration')
      
      const longBio = 'A'.repeat(1001) // Assuming 1000 char limit
      cy.get('[data-cy="bio-input"]').type(longBio)
      
      cy.get('[data-cy="bio-char-count"]').should('contain.text', '1000')
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="bio-error"]').should('contain.text', 'too long')
    })

    it('should successfully submit advisor registration', () => {
      cy.visit('/advisor-registration')
      
      cy.fillAdvisorRegistrationForm(advisorRegistrationData).then((data) => {
        cy.get('[data-cy="submit-registration-button"]').click()
        
        // Should show success message
        cy.get('[data-cy="registration-success-message"]').should('be.visible')
        cy.get('[data-cy="registration-success-message"]').should('contain.text', 'Thank you for registering')
        
        // Should redirect to dashboard or pending approval page
        cy.url().should('match', /\/(dashboard|pending-approval)/)
      })
    })

    it('should save form data as draft', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="firstName-input"]').type('John')
      cy.get('[data-cy="lastName-input"]').type('Advisor')
      cy.get('[data-cy="crdNumber-input"]').type('123456')
      
      // Wait for auto-save
      cy.wait(2000)
      cy.get('[data-cy="draft-saved-indicator"]').should('be.visible')
      
      // Refresh page and verify draft is restored
      cy.reload()
      
      cy.get('[data-cy="firstName-input"]').should('have.value', 'John')
      cy.get('[data-cy="lastName-input"]').should('have.value', 'Advisor')
      cy.get('[data-cy="crdNumber-input"]').should('have.value', '123456')
    })

    it('should handle duplicate CRD number', () => {
      cy.visit('/advisor-registration')
      
      cy.fillAdvisorRegistrationForm({
        ...advisorRegistrationData,
        crdNumber: '123456' // Use existing CRD number
      })
      
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="crd-error"]').should('be.visible')
      cy.get('[data-cy="crd-error"]').should('contain.text', 'already registered')
    })

    it('should show progress indicators for multi-step form', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="form-progress"]').should('be.visible')
      cy.get('[data-cy="step-1"]').should('have.class', 'active')
      
      // Fill first step and proceed
      cy.get('[data-cy="firstName-input"]').type(advisorRegistrationData.firstName)
      cy.get('[data-cy="lastName-input"]').type(advisorRegistrationData.lastName)
      cy.get('[data-cy="crdNumber-input"]').type(advisorRegistrationData.crdNumber)
      cy.get('[data-cy="next-step-button"]').click()
      
      cy.get('[data-cy="step-2"]').should('have.class', 'active')
    })

    it('should allow going back to previous steps', () => {
      cy.visit('/advisor-registration')
      
      // Navigate to step 2
      cy.get('[data-cy="firstName-input"]').type(advisorRegistrationData.firstName)
      cy.get('[data-cy="lastName-input"]').type(advisorRegistrationData.lastName)
      cy.get('[data-cy="crdNumber-input"]').type(advisorRegistrationData.crdNumber)
      cy.get('[data-cy="next-step-button"]').click()
      
      // Go back to step 1
      cy.get('[data-cy="previous-step-button"]').click()
      
      cy.get('[data-cy="step-1"]').should('have.class', 'active')
      cy.get('[data-cy="firstName-input"]').should('have.value', advisorRegistrationData.firstName)
    })
  })

  describe('Profile Upload and Documents', () => {
    beforeEach(() => {
      const userData = {
        ...newUserData,
        email: `advisor-docs-${Date.now()}@example.com`
      }
      cy.register(userData)
      cy.visit('/advisor-registration')
    })

    it('should allow uploading profile photo', () => {
      cy.get('[data-cy="profile-photo-upload"]').should('be.visible')
      
      // Mock file upload
      cy.fixture('profile-photo.jpg', 'base64').then(fileContent => {
        cy.get('[data-cy="profile-photo-input"]').attachFile({
          fileContent,
          fileName: 'profile-photo.jpg',
          mimeType: 'image/jpeg',
          encoding: 'base64'
        })
      })
      
      cy.get('[data-cy="photo-preview"]').should('be.visible')
      cy.get('[data-cy="upload-success-message"]').should('be.visible')
    })

    it('should validate profile photo file type', () => {
      cy.fixture('document.pdf', 'base64').then(fileContent => {
        cy.get('[data-cy="profile-photo-input"]').attachFile({
          fileContent,
          fileName: 'document.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64'
        })
      })
      
      cy.get('[data-cy="file-type-error"]').should('be.visible')
      cy.get('[data-cy="file-type-error"]').should('contain.text', 'image files only')
    })

    it('should validate file size limits', () => {
      // Mock large file
      const largeFileContent = 'A'.repeat(10 * 1024 * 1024) // 10MB
      
      cy.get('[data-cy="profile-photo-input"]').attachFile({
        fileContent: largeFileContent,
        fileName: 'large-photo.jpg',
        mimeType: 'image/jpeg'
      })
      
      cy.get('[data-cy="file-size-error"]').should('be.visible')
      cy.get('[data-cy="file-size-error"]').should('contain.text', 'too large')
    })

    it('should allow uploading credentials documents', () => {
      cy.get('[data-cy="credentials-upload"]').should('be.visible')
      
      cy.fixture('credentials.pdf', 'base64').then(fileContent => {
        cy.get('[data-cy="credentials-input"]').attachFile({
          fileContent,
          fileName: 'credentials.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64'
        })
      })
      
      cy.get('[data-cy="document-list"]').should('contain.text', 'credentials.pdf')
      cy.get('[data-cy="upload-success-message"]').should('be.visible')
    })

    it('should allow removing uploaded documents', () => {
      // Upload a document first
      cy.fixture('credentials.pdf', 'base64').then(fileContent => {
        cy.get('[data-cy="credentials-input"]').attachFile({
          fileContent,
          fileName: 'credentials.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64'
        })
      })
      
      cy.get('[data-cy="document-list"]').should('contain.text', 'credentials.pdf')
      
      // Remove the document
      cy.get('[data-cy="remove-document-button"]').first().click()
      cy.get('[data-cy="confirm-remove-button"]').click()
      
      cy.get('[data-cy="document-list"]').should('not.contain.text', 'credentials.pdf')
    })
  })

  describe('Advisor Profile Completion - Mobile', () => {
    beforeEach(() => {
      cy.testMobileView()
      const userData = {
        ...newUserData,
        email: `mobile-advisor-${Date.now()}@example.com`
      }
      cy.register(userData)
    })

    it('should work correctly on mobile devices', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="mobile-registration-form"]').should('be.visible')
      
      // Test mobile form completion
      cy.get('[data-cy="firstName-input"]').type(advisorRegistrationData.firstName)
      cy.get('[data-cy="lastName-input"]').type(advisorRegistrationData.lastName)
      cy.get('[data-cy="crdNumber-input"]').type(advisorRegistrationData.crdNumber)
      
      // Mobile-specific navigation
      cy.get('[data-cy="mobile-next-button"]').click()
      cy.get('[data-cy="mobile-form-step-2"]').should('be.visible')
    })

    it('should collapse form sections on mobile', () => {
      cy.visit('/advisor-registration')
      
      cy.get('[data-cy="personal-info-toggle"]').click()
      cy.get('[data-cy="personal-info-section"]').should('not.be.visible')
      
      cy.get('[data-cy="personal-info-toggle"]').click()
      cy.get('[data-cy="personal-info-section"]').should('be.visible')
    })
  })

  describe('Registration Error Handling', () => {
    beforeEach(() => {
      const userData = {
        ...newUserData,
        email: `error-test-${Date.now()}@example.com`
      }
      cy.register(userData)
    })

    it('should handle network errors gracefully', () => {
      cy.visit('/advisor-registration')
      
      // Simulate network error
      cy.intercept('POST', '/api/advisors/register', { forceNetworkError: true })
      
      cy.fillAdvisorRegistrationForm(advisorRegistrationData)
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="network-error-message"]').should('be.visible')
      cy.get('[data-cy="retry-button"]').should('be.visible')
    })

    it('should handle server errors', () => {
      cy.visit('/advisor-registration')
      
      // Simulate server error
      cy.intercept('POST', '/api/advisors/register', { statusCode: 500 })
      
      cy.fillAdvisorRegistrationForm(advisorRegistrationData)
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.get('[data-cy="server-error-message"]').should('be.visible')
    })

    it('should retry failed submissions', () => {
      cy.visit('/advisor-registration')
      
      // First attempt fails
      cy.intercept('POST', '/api/advisors/register', { statusCode: 500 }).as('failedSubmission')
      
      cy.fillAdvisorRegistrationForm(advisorRegistrationData)
      cy.get('[data-cy="submit-registration-button"]').click()
      
      cy.wait('@failedSubmission')
      cy.get('[data-cy="server-error-message"]').should('be.visible')
      
      // Second attempt succeeds
      cy.intercept('POST', '/api/advisors/register', { statusCode: 200, body: { success: true } }).as('successfulSubmission')
      
      cy.get('[data-cy="retry-button"]').click()
      
      cy.wait('@successfulSubmission')
      cy.get('[data-cy="registration-success-message"]').should('be.visible')
    })
  })

  describe('Registration Performance', () => {
    it('should complete registration within acceptable time', () => {
      const userData = {
        ...newUserData,
        email: `perf-test-${Date.now()}@example.com`
      }
      
      const startTime = Date.now()
      
      cy.register(userData).then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(10000) // 10 seconds max for full registration
      })
    })
  })
})