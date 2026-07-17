## 1. Documentation & Guidelines

- [x] 1.1 Create a new Architecture Decision Record (ADR) under `docs/decisions/` documenting the decision to prefer modern platform-native primitives (like Popover, Anchor Positioning, native Dialog) over custom JS state
- [x] 1.2 Update `AGENTS.md` to reference the new platform primitives ADR as part of the agent workflow and rules
- [x] 1.3 Audit the codebase and document the custom UI pattern inventory (dropdowns, dialogs, observers, tooltips) directly inside the new ADR file

## 2. Refactor Dropdown Menus (Popover API & CSS Anchor Positioning)

- [x] 2.1 Refactor `src/lib/MenuButton.svelte` to use the HTML `popover` attribute on the menu wrapper and `popovertarget` on the trigger toggle button
- [x] 2.2 Implement scoped CSS Anchor Positioning inside `src/lib/MenuButton.svelte` to align the top-layer popover dropdown relative to its button trigger
- [x] 2.3 Standardize event bindings in `src/lib/MenuButton.svelte` and `src/lib/MenuItemButton.svelte` to clean, Svelte-idiomatic native attributes and runes

## 3. Verification

- [x] 3.1 Run `npm run check` and `npm run lint` to verify zero diagnostic or styling issues in the modified components
- [x] 3.2 Run `npm run test` to verify Vitest contract and smoke tests pass without regressions
- [x] 3.3 Manually verify that MenuButton toggles, closes correctly on clicking away/ESC, and maintains exact visual/layout parity in desktop and mobile viewports

## 4. Backlog Updates & Reconciliation

- [x] 4.1 Update backlog item `p1-024` in `docs/backlog.md` (remove from queue, move to `Done Recently` with summary) and reconcile the "Next recommended target" header when this change is archived
- [x] 4.2 Record any custom measurement, layout, or observer findings discovered during the refactoring on follow-up backlog item `p1-025` as appropriate

## Executor Recommendation

- **Reasoning Level:** Medium to High
- **Model Complexity:** Complex (e.g. Gemini 1.5 Pro / Claude 3.5 Sonnet / GPT-4o)
- **Rationale:** Implementing CSS Anchor Positioning scoped directly within a Svelte component requires careful layout understanding, viewport bounds checks, and Svelte 5 runes lifecycle coordination to prevent visual clipping or alignment regressions.
