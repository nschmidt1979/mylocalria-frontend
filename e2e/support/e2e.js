// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// Place your global beforeEach and global afterEach here.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Add any global configuration here
beforeEach(() => {
  // Clear local storage and session storage before each test
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // You might want to clear IndexedDB for Firebase persistence
  cy.window().then((win) => {
    win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
  })
})

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Firebase Auth might throw some expected errors during testing
  if (err.message.includes('Firebase') || err.message.includes('auth')) {
    return false
  }
  // Don't fail on unhandled promise rejections
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})