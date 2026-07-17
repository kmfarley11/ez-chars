# 2026-07-17 Testing strategy

**Status:** Approved  
**Date:** 2026-07-17

## Context

Vitest protects schema, storage, and helper contracts, but it cannot verify browser-only workflows such as navigation, dialogs, downloads, and file upload. The project needs a small, reliable browser smoke suite without coupling it to component markup or snapshots.

## Decision

- Use Playwright E2E smoke tests for critical user journeys. Chromium is the default fast local target; Firefox and WebKit are opt-in cross-browser projects.
- Seed localStorage with validated fixture data through `page.addInitScript`, then assert visible behavior through roles, labels, and text.
- Add Storybook when reusable component extraction makes isolated visual and interaction development valuable.
- Defer Svelte Testing Library component tests until the component structure stabilizes; retain Vitest for pure helpers and durable data-boundary contracts.

## Consequences

- E2E tests remain few, black-box, and focused on user-visible regressions.
- `npm run test:e2e` is the routine Chromium command; `npm run test:e2e:all` is reserved for explicit cross-browser checks.
- Screenshot diffing, visual-regression services, and broad component-test migration are outside this decision.
