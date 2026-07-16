## Why

The application was migrated to Svelte 5 but has not undergone a comprehensive app-wide audit to identify residual Svelte 4 legacy patterns, Svelte 5 compilation/reactivity warnings, or render-cycle inefficiencies. This change guarantees that our reactivity models, component boundaries, and event handlers conform strictly to Svelte 5 best practices, preventing runtime quirks and visual stuttering on mobile viewports.

## What Changes

- Run an app-wide review/audit of all `.svelte` components under `src/lib/` and `src/routes/` for Svelte 5 correctness.
- Standardize all component props to `$props()` and remove any residual `export let` statements.
- Clean up any legacy reactive declarations (`$:`) and convert them to `$derived()` runes.
- Standardize all event listener syntax to native handlers (`onclick` instead of `on:click`, etc.).
- Modernize slots to Svelte 5 snippets (`{#snippet}` and `{@render}`) where appropriate.
- Resolve any Svelte 5 compiler diagnostics or warnings output during `npm run build` or `npm run check`.
- Catch and record any large or complex architectural findings (e.g. store restructuring) as separate follow-up backlog tickets rather than trying to fix them in this sweep.

## Capabilities

### New Capabilities

- `svelte5-audit`: Conformance of Svelte UI components to Svelte 5 runes and event handling syntax.

### Modified Capabilities

- None

## Impact

- All Svelte component files in `src/lib/` and `src/routes/` are potentially affected by syntax cleanups.
- Development tooling configurations or scripts (e.g., eslint config or checks) are validated but unchanged.
- No impact on Zod data schemas, JSON import/export, or page layouts.
