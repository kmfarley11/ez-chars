## 1. Audit & Scan

- [x] 1.1 Run baseline build and lint checks to establish a clean diagnostics starting point
- [x] 1.2 Scan all components under `src/lib/` for legacy Svelte 4 structures (e.g. `export let`, `on:`, slots)
- [x] 1.3 Scan all route components under `src/routes/` for Svelte 4 legacy structures

## 2. Reactivity & Event Syntax Modernization

- [x] 2.1 Standardize any legacy props declarations to Svelte 5 `$props()` runes
- [x] 2.2 Standardize any legacy computed values to Svelte 5 `$derived()` runes
- [x] 2.3 Standardize event listeners to native properties (e.g. `onclick` instead of `on:click`)
- [x] 2.4 Modernize component slots to Svelte 5 snippets (`{#snippet}`) and renders (`{@render}`)

## 3. Verification

- [x] 3.1 Run `npm run build` to verify Svelte compiler issues zero warnings or deprecations
- [x] 3.2 Run `npm run check` and `npm run lint` to verify zero diagnostic or style issues remain
- [x] 3.3 Run `npm run test` to verify Vitest contract and workflow tests pass without regression
- [x] 3.4 Manually verify character editing, annotations, and UI state switches in a browser view

## 4. Backlog Updates & Reconciliation

- [x] 4.1 Update backlog item `p1-050` with any global store or schema restructuring findings discovered during the Svelte 5 audit
- [x] 4.2 Update backlog item `p1-045` with any route-level projection or Svelte 5 layout composition findings discovered
- [x] 4.3 Update backlog item `p1-025` with any Svelte 5 reactivity or paint-performance audit findings related to scroll rendering
