import { axe, toHaveNoViolations } from 'jest-axe';

// Runtime axe-core setup for development mode
export const initializeAxeReact = async () => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      // Dynamically import axe-core for development only
      const axeCore = await import('@axe-core/react');
      
      // Initialize axe with React
      axeCore.default(
        window.React,
        window.ReactDOM,
        1000, // Delay in milliseconds
        {
          // Axe configuration options
          rules: {
            // Color contrast rules for WCAG 2.1 AA
            'color-contrast': { enabled: true },
            'color-contrast-enhanced': { enabled: false }, // AAA level
            
            // ARIA rules
            'aria-allowed-attr': { enabled: true },
            'aria-required-attr': { enabled: true },
            'aria-required-children': { enabled: true },
            'aria-required-parent': { enabled: true },
            'aria-roles': { enabled: true },
            'aria-valid-attr': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            
            // Form rules
            'label': { enabled: true },
            'form-field-multiple-labels': { enabled: true },
            
            // Keyboard navigation rules
            'focus-order-semantics': { enabled: true },
            'tabindex': { enabled: true },
            
            // Semantic HTML rules
            'heading-order': { enabled: true },
            'landmark-one-main': { enabled: true },
            'landmark-unique': { enabled: true },
            'page-has-heading-one': { enabled: true },
            
            // Image and media rules
            'image-alt': { enabled: true },
            'image-redundant-alt': { enabled: true },
            
            // Interactive elements
            'button-name': { enabled: true },
            'link-name': { enabled: true },
          },
          tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
        }
      );
      
      console.log('🛡️ Axe-core initialized for accessibility testing');
    } catch (error) {
      console.warn('Failed to initialize axe-core:', error);
    }
  }
};

// Manual accessibility check function for development
export const runAccessibilityCheck = async (element = document) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      const results = await axe.run(element, {
        rules: {
          'color-contrast': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'label': { enabled: true },
          'button-name': { enabled: true },
          'link-name': { enabled: true },
          'image-alt': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true },
          'tabindex': { enabled: true },
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      });

      if (results.violations.length > 0) {
        console.group('🚨 Accessibility Violations Found');
        results.violations.forEach((violation) => {
          console.group(`❌ ${violation.id}: ${violation.description}`);
          console.log('Impact:', violation.impact);
          console.log('Help:', violation.helpUrl);
          console.log('Nodes:', violation.nodes);
          console.groupEnd();
        });
        console.groupEnd();
      } else {
        console.log('✅ No accessibility violations found!');
      }

      // Log incomplete tests (things that need manual checking)
      if (results.incomplete.length > 0) {
        console.group('⚠️ Manual Check Required');
        results.incomplete.forEach((item) => {
          console.log(`🔍 ${item.id}: ${item.description}`);
          console.log('Help:', item.helpUrl);
        });
        console.groupEnd();
      }

      return results;
    } catch (error) {
      console.error('Error running accessibility check:', error);
    }
  }
};

// Jest matcher extension for testing
export const setupJestAxe = () => {
  if (typeof expect !== 'undefined') {
    expect.extend(toHaveNoViolations);
  }
};

// Utility function to check specific component accessibility
export const checkComponentAccessibility = async (selector) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    const element = document.querySelector(selector);
    if (element) {
      return await runAccessibilityCheck(element);
    } else {
      console.warn(`Element with selector "${selector}" not found`);
    }
  }
};

// Export a function that can be called from browser console for quick checks
if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.checkA11y = runAccessibilityCheck;
  window.checkComponentA11y = checkComponentAccessibility;
}