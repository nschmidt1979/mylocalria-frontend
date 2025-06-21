import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'e2e/support/e2e.js',
    specPattern: 'e2e/specs/**/*.cy.js',
    fixturesFolder: 'e2e/fixtures',
    screenshotsFolder: 'e2e/screenshots',
    videosFolder: 'e2e/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Firebase Auth specific configuration
    env: {
      // Test user credentials - these should be set via environment variables in CI/CD
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'testpassword123',
      TEST_ADVISOR_EMAIL: 'advisor@example.com',
      TEST_ADVISOR_PASSWORD: 'advisorpassword123',
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});