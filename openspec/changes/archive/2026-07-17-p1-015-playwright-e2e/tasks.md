## 1. Install & Configure Playwright

- [x] 1.1 Add `@playwright/test` to devDependencies in `package.json`
- [x] 1.2 Create a `playwright.config.ts` file configured with Chromium, Firefox, and WebKit projects, targeting `http://localhost:5173` with `reuseExistingServer: true`
- [x] 1.3 Add `test:e2e` (Chromium only) and `test:e2e:all` (all browsers) scripts to `package.json`

## 2. Implement Testing Strategy ADR

- [x] 2.1 Create `docs/decisions/2026-07-17-testing-strategy.md` outlining our E2E, Storybook, and component testing strategy

## 3. Write E2E Smoke Test

- [x] 3.1 Create `tests/characterSheet.smoke.spec.ts` that uses `page.addInitScript` to programmatically seed localStorage with mock character fixtures before navigation
- [x] 3.2 Implement checks for: navigating to the character page, collapsing/expanding card sections, and editing the Current HP value
- [x] 3.3 Implement note annotation tests (editing a note, inserting a D&D Beyond URL, and verifying that the badge links to the external reference)
- [x] 3.4 Implement backup tests (triggering character JSON export, verifying download, clearing local storage, uploading the backup file, and asserting character meta is restored)

## 4. Local Verification & Documentation

- [x] 4.1 Run `npm run test:e2e` and verify that the local test pass completes in under 5 seconds on Chromium
- [x] 4.2 Run `npx playwright test --project=firefox` to verify functional correctness and stability on Firefox
- [x] 4.3 Update `docs/verification.md` to document the E2E scripts and `AGENTS.md` to outline E2E execution boundaries

## 5. Backlog Updates & Reconciliation

- [x] 5.1 Prune `p1-015` from `docs/backlog.md`, move to `Done Recently` with a summary, and reconcile the "Next recommended target" header
- [x] 5.2 Validate the final changes using `npx openspec validate --changes`

## Executor Recommendation

- **Reasoning Level:** Medium
- **Model Complexity:** Medium
- **Rationale:** The setup of Playwright and configuring standard browser testing lifecycles is a standard integration task. Injecting local storage data and asserting on file downloads requires correct Playwright context manipulation, making a reasoning model helpful to avoid script errors.
