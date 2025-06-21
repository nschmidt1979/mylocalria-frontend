/// <reference path="../support/index.d.ts" />

describe('Advisor Search Journey', () => {
  let advisorData
  let searchFilters

  before(() => {
    cy.fixture('advisors').then((data) => {
      advisorData = data.sampleAdvisor
      searchFilters = data.searchFilters
    })
  })

  beforeEach(() => {
    cy.visit('/')
  })

  describe('Landing Page', () => {
    it('should display the landing page correctly', () => {
      cy.get('[data-cy="hero-section"]').should('be.visible')
      cy.get('[data-cy="search-cta"]').should('be.visible')
      
      // Check that key elements are present
      cy.contains('Find Your Perfect Financial Advisor').should('be.visible')
      cy.get('[data-cy="get-started-button"]').should('be.visible')
    })

    it('should navigate to directory from landing page', () => {
      cy.get('[data-cy="get-started-button"]').click()
      cy.url().should('include', '/directory')
      cy.get('[data-cy="search-section"]').should('be.visible')
    })
  })

  describe('Advisor Directory Search', () => {
    beforeEach(() => {
      cy.visit('/directory')
      cy.waitForPageLoad()
    })

    it('should display search interface correctly', () => {
      cy.get('[data-cy="search-input"]').should('be.visible')
      cy.get('[data-cy="search-button"]').should('be.visible')
      cy.get('[data-cy="search-filters"]').should('be.visible')
      
      // Check filter options
      cy.get('[data-cy="location-filter"]').should('be.visible')
      cy.get('[data-cy="specialization-filter"]').should('be.visible')
      cy.get('[data-cy="rating-filter"]').should('be.visible')
    })

    it('should perform basic text search', () => {
      const searchTerm = 'financial planning'
      
      cy.get('[data-cy="search-input"]').type(searchTerm)
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="search-results"]').should('be.visible')
      cy.get('[data-cy="advisor-card"]').should('have.length.at.least', 1)
      
      // Verify search term is reflected in results
      cy.get('[data-cy="search-results-count"]').should('contain.text', 'results')
      cy.get('[data-cy="current-search-term"]').should('contain.text', searchTerm)
    })

    it('should filter by location', () => {
      cy.get('[data-cy="location-filter"]').type(searchFilters.location)
      cy.get('[data-cy="location-filter-option"]').first().click()
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="advisor-card"]').each(($card) => {
        cy.wrap($card).find('[data-cy="advisor-location"]')
          .should('contain.text', 'New York')
      })
    })

    it('should filter by specialization', () => {
      cy.get('[data-cy="specialization-filter"]').select(searchFilters.specialization)
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="advisor-card"]').each(($card) => {
        cy.wrap($card).find('[data-cy="advisor-specialization"]')
          .should('contain.text', searchFilters.specialization)
      })
    })

    it('should filter by minimum rating', () => {
      cy.get('[data-cy="rating-filter"]').select(searchFilters.minimumRating)
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="advisor-card"]').each(($card) => {
        cy.wrap($card).find('[data-cy="advisor-rating"]').invoke('text').then((rating) => {
          expect(parseFloat(rating)).to.be.at.least(parseFloat(searchFilters.minimumRating))
        })
      })
    })

    it('should combine multiple filters', () => {
      cy.get('[data-cy="location-filter"]').type(searchFilters.location)
      cy.get('[data-cy="location-filter-option"]').first().click()
      cy.get('[data-cy="specialization-filter"]').select(searchFilters.specialization)
      cy.get('[data-cy="rating-filter"]').select(searchFilters.minimumRating)
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="search-results"]').should('be.visible')
      
      // Verify combined filters are applied
      cy.get('[data-cy="active-filters"]').should('contain.text', 'New York')
      cy.get('[data-cy="active-filters"]').should('contain.text', searchFilters.specialization)
      cy.get('[data-cy="active-filters"]').should('contain.text', searchFilters.minimumRating)
    })

    it('should clear filters', () => {
      // Apply filters first
      cy.get('[data-cy="specialization-filter"]').select(searchFilters.specialization)
      cy.get('[data-cy="search-button"]').click()
      cy.waitForSearchResults()
      
      // Clear filters
      cy.get('[data-cy="clear-filters-button"]').click()
      
      // Verify filters are cleared
      cy.get('[data-cy="specialization-filter"]').should('have.value', '')
      cy.get('[data-cy="active-filters"]').should('not.exist')
    })

    it('should handle no results scenario', () => {
      cy.get('[data-cy="search-input"]').type('nonexistentadvisorxyz123')
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="no-results-message"]').should('be.visible')
      cy.get('[data-cy="search-suggestions"]').should('be.visible')
    })
  })

  describe('Advisor Profile View', () => {
    beforeEach(() => {
      cy.searchAdvisors('financial planning')
    })

    it('should view advisor profile from search results', () => {
      cy.get('[data-cy="advisor-card"]').first().click()
      
      cy.get('[data-cy="advisor-profile"]').should('be.visible')
      cy.get('[data-cy="advisor-name"]').should('be.visible')
      cy.get('[data-cy="advisor-business-name"]').should('be.visible')
      cy.get('[data-cy="advisor-rating"]').should('be.visible')
      cy.get('[data-cy="advisor-reviews-count"]').should('be.visible')
    })

    it('should display advisor contact information', () => {
      cy.get('[data-cy="advisor-card"]').first().click()
      
      cy.get('[data-cy="contact-information"]').should('be.visible')
      cy.get('[data-cy="advisor-phone"]').should('be.visible')
      cy.get('[data-cy="advisor-email"]').should('be.visible')
      cy.get('[data-cy="advisor-address"]').should('be.visible')
    })

    it('should display advisor services and specializations', () => {
      cy.get('[data-cy="advisor-card"]').first().click()
      
      cy.get('[data-cy="services-section"]').should('be.visible')
      cy.get('[data-cy="specializations-section"]').should('be.visible')
      cy.get('[data-cy="advisor-bio"]').should('be.visible')
    })

    it('should show reviews section', () => {
      cy.get('[data-cy="advisor-card"]').first().click()
      
      cy.get('[data-cy="reviews-section"]').should('be.visible')
      cy.get('[data-cy="reviews-summary"]').should('be.visible')
      
      // Check if reviews are displayed
      cy.get('[data-cy="review-card"]').should('have.length.at.least', 1)
    })

    it('should allow returning to search results', () => {
      cy.get('[data-cy="advisor-card"]').first().click()
      cy.get('[data-cy="back-to-results"]').click()
      
      cy.url().should('include', '/directory')
      cy.get('[data-cy="search-results"]').should('be.visible')
    })
  })

  describe('Search Experience - Mobile', () => {
    beforeEach(() => {
      cy.testMobileView()
      cy.visit('/directory')
    })

    it('should work correctly on mobile devices', () => {
      cy.get('[data-cy="mobile-search-input"]').should('be.visible')
      cy.get('[data-cy="mobile-filter-toggle"]').should('be.visible')
      
      // Test mobile search
      cy.get('[data-cy="mobile-search-input"]').type('retirement')
      cy.get('[data-cy="mobile-search-button"]').click()
      
      cy.waitForSearchResults()
      cy.get('[data-cy="advisor-card"]').should('be.visible')
    })

    it('should toggle filters on mobile', () => {
      cy.get('[data-cy="mobile-filter-toggle"]').click()
      cy.get('[data-cy="mobile-filters-panel"]').should('be.visible')
      
      cy.get('[data-cy="mobile-filter-toggle"]').click()
      cy.get('[data-cy="mobile-filters-panel"]').should('not.be.visible')
    })
  })

  describe('Search Performance', () => {
    it('should load search results within acceptable time', () => {
      cy.visit('/directory')
      
      const startTime = Date.now()
      cy.get('[data-cy="search-input"]').type('investment')
      cy.get('[data-cy="search-button"]').click()
      
      cy.waitForSearchResults().then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(5000) // 5 seconds max
      })
    })
  })
})