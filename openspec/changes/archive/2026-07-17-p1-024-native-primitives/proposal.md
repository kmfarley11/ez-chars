## Why

Simplify the codebase and reduce runtime JavaScript execution overhead by shifting custom event/state handling, measurement logic, and overlay rendering to standard browser-native capabilities (e.g., native `<dialog>`, CSS popovers, `:has()`, scroll-snap). This ensures highly performant, accessible, and bug-free interactions on both desktop and mobile viewports without third-party library bloat.

## What Changes

- **Add** a new Architecture Decision Record (ADR) under `docs/decisions/` (and linked in `AGENTS.md`) documenting the preference for platform-native HTML and CSS primitives over custom JavaScript state.
- **Add** a documented inventory of custom JavaScript-heavy UI patterns (such as dialog overlays, dropdown menus, resize observers, tooltips) mapped to native replacements directly inside the new ADR.
- **Modify** one target custom JS-driven UI component (such as a dropdown menu, tooltip, or a modal element) to use its native platform equivalent (like native `<dialog>` or CSS popover/anchors).
- **Ensure** complete visual parity, keyboard accessibility, and standard Svelte reactivity bindings for the replaced candidate.

## Capabilities

### New Capabilities

- `native-ui-interaction`: Standardizing interactive UI overlays, overlays, and transitions using modern browser-native HTML/CSS primitives for enhanced accessibility and performance.

### Modified Capabilities

## Impact

- Affected code: `src/lib/` UI components (dialog overlays, menus, custom measurement wrappers).
- APIs: Event and state bindings in components will rely on native event handlers and standard Svelte runes instead of custom overlay state/methods.
- Dependencies: None. No new packages or libraries will be introduced.
