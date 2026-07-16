## Context

The repository has transitioned to Svelte 5 but contains a mix of component structures. An app-wide audit is necessary to identify and resolve any residual legacy Svelte 4 structures, reactivity warnings, and potential render loop issues.

## Goals / Non-Goals

**Goals:**

- Perform a comprehensive audit of all `.svelte` files under `src/lib/` and `src/routes/`.
- Modernize component prop declarations (`$props()`), state runes (`$state()`), computed values (`$derived()`), and event handlers (`onclick`, etc.).
- Ensure a clean build output and diagnostic status.

**Non-Goals:**

- Migrating global store structures (`$charsArray` or localStorage bindings) to Svelte 5 state classes.
- Reworking page layouts or visual elements.
- Addressing grid sizing performance directly.

## Decisions

### Svelte Store Paradigm Retention

- **Choice**: Retain legacy Svelte writable store paradigm (`$charsArray` and reactive subscriptions) inside components rather than replacing them with Svelte 5 state classes.
- **Rationale**: The store-to-rune integration is already stable in Svelte 5 (reading/writing to stores via `$store` syntax continues to work perfectly). Replacing the entire store structure is out of scope for an audit and introduces high regression risk.

### Targeted Low-Risk Fixes

- **Choice**: Limit code modifications strictly to low-risk syntax updates (e.g. standardizing prop bounds, event handlers, and derived values).
- **Rationale**: Capturing larger structural findings as follow-up backlog tickets prevents scope creep and keeps this task focused on immediate correctness and diagnostic safety.

## Risks / Trade-offs

- **Risk**: Automated cleanups (like mass event handler replacements) could cause silent binding failures.
  - **Mitigation**: Perform syntax updates manually or carefully, verifying with Svelte compiler checks (`npm run check`) and the Vitest test suite (`npm run test`) at every step.
