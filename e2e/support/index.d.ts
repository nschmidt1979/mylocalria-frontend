/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in a user
     * @example cy.login('user@example.com', 'password123')
     */
    login(email?: string, password?: string): Chainable<Element>

    /**
     * Custom command to register a new user
     * @example cy.register({ email: 'new@example.com', password: 'password123', firstName: 'John', lastName: 'Doe' })
     */
    register(userData?: Partial<{
      email: string
      password: string
      firstName: string
      lastName: string
    }>): Chainable<any>

    /**
     * Custom command to log out current user
     * @example cy.logout()
     */
    logout(): Chainable<Element>

    /**
     * Custom command to search for advisors
     * @example cy.searchAdvisors('financial planning', { location: 'New York' })
     */
    searchAdvisors(searchTerm?: string, filters?: Record<string, string>): Chainable<Element>

    /**
     * Custom command to visit an advisor profile
     * @example cy.visitAdvisorProfile('123456')
     */
    visitAdvisorProfile(crdNumber: string): Chainable<Element>

    /**
     * Custom command to fill advisor registration form
     * @example cy.fillAdvisorRegistrationForm({ crdNumber: '123456', businessName: 'Test Firm' })
     */
    fillAdvisorRegistrationForm(advisorData?: Record<string, string>): Chainable<any>

    /**
     * Custom command to write a review
     * @example cy.writeReview({ rating: 5, title: 'Great advisor', content: 'Very helpful' })
     */
    writeReview(reviewData?: Partial<{
      rating: number
      title: string
      content: string
    }>): Chainable<any>

    /**
     * Custom command to wait for page to load
     * @example cy.waitForPageLoad()
     */
    waitForPageLoad(): Chainable<Element>

    /**
     * Custom command to wait for search results
     * @example cy.waitForSearchResults()
     */
    waitForSearchResults(): Chainable<Element>

    /**
     * Custom command to assert user is logged in
     * @example cy.shouldBeLoggedIn()
     */
    shouldBeLoggedIn(): Chainable<Element>

    /**
     * Custom command to assert user is logged out
     * @example cy.shouldBeLoggedOut()
     */
    shouldBeLoggedOut(): Chainable<Element>

    /**
     * Custom command to test mobile view
     * @example cy.testMobileView()
     */
    testMobileView(): Chainable<Element>

    /**
     * Custom command to test tablet view
     * @example cy.testTabletView()
     */
    testTabletView(): Chainable<Element>

    /**
     * Custom command to test desktop view
     * @example cy.testDesktopView()
     */
    testDesktopView(): Chainable<Element>
  }
}