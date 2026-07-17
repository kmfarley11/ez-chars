# Local Verification

Use these commands to verify changes before handing work back.

## Main Gates

Run the full set before considering behavior, schema, storage, import/export, or release-sensitive changes complete:

```bash
npm run test
npm run check
npm run lint
npm run build
```

For doc-only or narrow style-only changes, run the relevant subset and state what you skipped.

## Test Commands

```bash
npm run test
```

Runs the Vitest contract and smoke tests once.

## Browser E2E Commands

```bash
npm run test:e2e
```

Runs the canonical Playwright smoke suite in Chromium. The config reuses a dev server already listening on `http://localhost:5173`; otherwise, Playwright starts the local Vite server for the run.

```bash
npm run test:e2e:all
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Use the all-browser command or an individual project when a change needs cross-browser confirmation. The default local gate is Chromium so routine feedback remains fast.

```bash
npm run test:watch
```

Runs Vitest in watch mode while developing tests.

```bash
npm run test:coverage
```

Runs Vitest with V8 coverage and writes an HTML report to `coverage/`. Use this when adding or reviewing contract tests and you want an at-a-glance view of covered schema, storage, and import/export surfaces.

## App Checks

```bash
npm run check
```

Runs SvelteKit sync and Svelte type diagnostics.

```bash
npm run lint
```

Runs Prettier checks and ESLint.

```bash
npm run build
```

Builds the static production app. Use this before release-sensitive handoff or after config/dependency changes.

## Dev Server

```bash
npm run dev
```

Starts the local Vite dev server.

After dependency or SvelteKit/Vite config changes, restart stale dev processes before judging browser behavior. If the app shows stale module errors, stop existing Vite/Node processes and restart with:

```bash
npm run dev -- --force
```
