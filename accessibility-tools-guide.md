# Accessibility Tools Guide - MyLocalRIA

This guide covers the accessibility testing tools installed and configured for maintaining WCAG 2.1 AA compliance in the MyLocalRIA React application.

## 📦 Installed Tools

### 1. **eslint-plugin-jsx-a11y**
Static analysis tool that catches accessibility issues during development.

### 2. **@axe-core/react** 
Runtime accessibility testing that runs in the browser during development.

### 3. **jest-axe**
Unit testing utilities for accessibility testing in test suites.

---

## 🛠️ Setup Overview

### ESLint Configuration (`eslint.config.js`)
Enhanced with comprehensive jsx-a11y rules targeting WCAG 2.1 AA compliance:

- **ARIA rules**: Proper attributes, roles, and properties
- **Form rules**: Label associations and form field accessibility  
- **Keyboard navigation**: Focus management and tabindex validation
- **Semantic HTML**: Heading order, landmarks, and structure
- **Color contrast**: Automated color contrast checking
- **Interactive elements**: Button and link accessibility

### Axe-Core Integration (`src/utils/axeSetup.js`)
Runtime accessibility testing configured for:

- **Development mode only**: No performance impact in production
- **WCAG 2.1 AA rules**: Comprehensive rule set
- **Console logging**: Clear violation reporting
- **Manual checks**: Guidance for items requiring human verification

---

## 🚀 Usage Instructions

### 1. ESLint Accessibility Linting

#### Run accessibility linting:
```bash
npm run lint:a11y
```

#### Fix auto-fixable issues:
```bash
npm run lint:fix
```

#### Continuous linting:
Your editor should show accessibility violations in real-time if ESLint integration is enabled.

### 2. Runtime Accessibility Testing

#### Automatic initialization:
Axe-core automatically initializes in development mode when you run:
```bash
npm run dev
```

#### Browser console commands:
Open browser developer tools and use these commands:

```javascript
// Check entire page
checkA11y()

// Check specific component
checkComponentA11y('.header-nav')
checkComponentA11y('#main-content')
checkComponentA11y('[role="dialog"]')
```

#### Example output:
```
🚨 Accessibility Violations Found
  ❌ color-contrast: Elements must have sufficient color contrast
    Impact: serious
    Help: https://dequeuniversity.com/rules/axe/4.7/color-contrast
    Nodes: (array of affected elements)

⚠️ Manual Check Required
  🔍 focus-order-semantics: Ensure focusable elements are focused in a sensible order
    Help: https://dequeuniversity.com/rules/axe/4.7/focus-order-semantics
```

### 3. Automated Testing Integration

#### For future unit tests with Jest:
```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { setupJestAxe } from '../utils/axeSetup';

// Setup
setupJestAxe();

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 🎯 Key ESLint Rules Enforced

### Critical Rules (Errors)
- `jsx-a11y/alt-text` - Images must have alt text
- `jsx-a11y/aria-props` - Valid ARIA properties only  
- `jsx-a11y/aria-role` - Valid ARIA roles only
- `jsx-a11y/label-has-associated-control` - Form labels must be associated
- `jsx-a11y/interactive-supports-focus` - Interactive elements must be focusable
- `jsx-a11y/heading-has-content` - Headings must have content
- `jsx-a11y/click-events-have-key-events` - Click handlers need keyboard equivalents

### Warning Rules
- `jsx-a11y/no-autofocus` - Avoid autofocus (can be disorienting)

### Complete rule list:
See `eslint.config.js` for the full configuration.

---

## 🔍 Runtime Axe-Core Rules

### Enabled Rule Categories
- **WCAG 2.0 Level A** (`wcag2a`)
- **WCAG 2.0 Level AA** (`wcag2aa`) 
- **WCAG 2.1 Level AA** (`wcag21aa`)
- **Best practices** (`best-practice`)

### Key Rules Checked
- **Color contrast**: 4.5:1 ratio for normal text, 3:1 for large text
- **ARIA**: Proper attributes, roles, required properties
- **Forms**: Label associations, fieldset/legend usage
- **Keyboard**: Tab order, focus management
- **Structure**: Heading hierarchy, landmarks, page structure
- **Images**: Alt text presence and quality
- **Interactive elements**: Button/link naming and accessibility

---

## 🛡️ Violation Types & Severity

### Critical (Must Fix)
- **Missing alt text** on images
- **Form inputs without labels**
- **Invalid ARIA attributes**
- **Color contrast failures**
- **Missing heading structure**

### Serious (Should Fix)
- **Focus order issues**
- **Missing landmark roles**
- **Inadequate button/link names**
- **Keyboard accessibility problems**

### Moderate (Good to Fix)
- **Missing ARIA descriptions**
- **Redundant alt text**
- **Minor structural improvements**

### Minor (Optional)
- **Enhancement suggestions**
- **Best practice recommendations**

---

## 📋 Development Workflow

### 1. Pre-Development
```bash
# Check current accessibility status
npm run lint:a11y
```

### 2. During Development
- **ESLint** catches issues in your editor
- **Browser console** shows runtime violations
- Use `checkA11y()` to test specific features

### 3. Pre-Commit
```bash
# Run full accessibility check
npm run test:a11y

# Fix auto-fixable issues
npm run lint:fix
```

### 4. Code Review
- Review accessibility-related ESLint warnings/errors
- Test keyboard navigation for new features
- Verify screen reader compatibility

---

## 🎨 Common Fixes

### Color Contrast Issues
```jsx
// ❌ Insufficient contrast
<button className="text-gray-400 bg-gray-100">Click me</button>

// ✅ Sufficient contrast  
<button className="text-gray-800 bg-gray-100">Click me</button>
```

### Missing ARIA Labels
```jsx
// ❌ No accessible name
<button onClick={handleClose}>
  <XIcon />
</button>

// ✅ Proper accessible name
<button onClick={handleClose} aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

### Form Label Associations
```jsx
// ❌ No label association
<label>Email</label>
<input type="email" />

// ✅ Proper association
<label htmlFor="email">Email</label>
<input type="email" id="email" />
```

### Missing Alt Text
```jsx
// ❌ Missing alt text
<img src="/logo.png" />

// ✅ Descriptive alt text
<img src="/logo.png" alt="MyLocalRIA company logo" />

// ✅ Decorative image
<img src="/decoration.png" alt="" />
```

### Focus Management
```jsx
// ❌ No focus indicator
<button className="focus:outline-none">Submit</button>

// ✅ Visible focus indicator  
<button className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Submit
</button>
```

---

## 🔧 Troubleshooting

### ESLint Issues

#### "Rule not found" errors:
```bash
# Ensure all packages are installed
npm install
```

#### False positives:
```javascript
// Disable specific rule for a line
// eslint-disable-next-line jsx-a11y/click-events-have-key-events
<div onClick={handleClick}>Content</div>

// Disable for entire file (use sparingly)
/* eslint-disable jsx-a11y/click-events-have-key-events */
```

### Axe-Core Issues

#### Axe not initializing:
1. Check browser console for errors
2. Ensure you're in development mode
3. Verify network requests aren't blocked

#### Performance impact:
Axe-core only runs in development mode and won't affect production performance.

#### False positives:
Some violations may not apply to your specific use case. Use manual verification and document exceptions.

---

## 📚 Additional Resources

### WCAG Guidelines
- [WCAG 2.1 AA Success Criteria](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1&levels=aa)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)

### Testing Tools
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Color Contrast Analyzers](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers for Testing
- **Windows**: NVDA (free), JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

### Keyboard Testing
- Test all functionality using only:
  - **Tab** - Navigate forward
  - **Shift+Tab** - Navigate backward  
  - **Enter/Space** - Activate buttons
  - **Arrow keys** - Navigate within components
  - **Escape** - Close modals/menus

---

## 🎯 Next Steps

### Immediate
1. ✅ Tools installed and configured
2. Run `npm run lint:a11y` to see current status
3. Start development with `npm run dev`
4. Use `checkA11y()` in browser console

### Short-term
1. Address any existing accessibility violations
2. Integrate accessibility checks into CI/CD pipeline
3. Train team on accessibility testing workflow

### Long-term  
1. Add automated accessibility testing to unit tests
2. Conduct user testing with assistive technology users
3. Regular accessibility audits and reviews
4. Consider automated accessibility monitoring in production

---

## 💡 Pro Tips

1. **Test early and often** - Don't wait until the end to check accessibility
2. **Use semantic HTML first** - Often eliminates the need for ARIA
3. **Test with keyboard only** - Most accessibility issues surface this way
4. **Check color contrast** - Use browser dev tools or online checkers
5. **Use real screen readers** - Automated tools can't catch everything
6. **Document patterns** - Create a component library with accessibility built-in

---

For questions or issues with accessibility tools, refer to this guide or reach out to the development team.