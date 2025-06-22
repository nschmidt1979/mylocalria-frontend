
# MylocalRIA Background Agent Tracker

This file documents all background agents that have been implemented, are in progress, or are planned for the MylocalRIA project using Cursor.

---

## ✅ Implemented Agents

### [Agent Task: Accessibility Audit]
Run a full accessibility audit of all major UI components and flag areas not meeting WCAG standards. Suggest inline fixes with reasoning.

### [Agent Task: Component Documentation]
Generate detailed documentation for all React components using JSDoc or docblocks. Organize them by type and location. Prioritize public-facing and reusable components.

### [Agent Task: Source Code Cleanup]
Refactor and clean up the `src/` directory to remove dead code, apply consistent formatting, and fix linter warnings. Preserve working functionality.

### [Agent Task: Lighthouse Performance Audit]
Run Lighthouse audit on main routes (e.g. `/`, `/directory`, `/advisor/:id`) and output actionable suggestions for performance improvements.

### [Agent Task: Unit Test Generation]
Create Jest/React Testing Library unit tests for all key React components. Focus on:
- AdvisorCard
- Profile Page
- Registration & Login

### [Agent Task: Security Audit on Dependencies]
Audit all packages listed in `package.json` for known vulnerabilities. Suggest upgrades or replacement libraries with context.

---

## 🔄 In Progress Agents

### [Agent Task: Generate E2E Test Scaffolding]
Set up Cypress and generate basic tests for login flow, advisor search, and profile views. Include configuration and GitHub Actions runner for CI.

---

## 🔜 Planned Agents

### [Agent Task: CI/CD Setup for Vite + Firebase]
Generate a GitHub Actions workflow for:
- Installing dependencies
- Running tests (unit + E2E)
- Building the app
- Deploying to Firebase Hosting (on push to `main`)
Ensure secrets and deploy steps are environment-aware.

---

## 💡 Notes
- All agents are scheduled to run manually as needed.
- Future enhancement: configure agents to auto-trigger on pull request or deploy.
- This tracker complements `README.md` and technical docs in the `/docs` folder.
