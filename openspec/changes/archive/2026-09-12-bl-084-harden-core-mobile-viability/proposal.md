## Why

Physical-iPhone solo rehearsals during `BL-073` navigation testing identified three critical mobile viability blockers outside sheet navigation itself:

1. The entrypoint character list renders as a rigid data table that horizontally overflows phone screens and formats raw serialized data, making character identification, creation, and management awkward on mobile.
2. Menu popovers retain a stale close icon (`×`) and expanded state when an action opens a modal dialog or overlay, failing to reset disclosure state upon command invocation.
3. Focusing text inputs or textareas on iOS Safari triggers involuntary automatic page zoom because input font sizes compute to less than 16px, disorienting the user and requiring manual pinch-to-zoom recovery.

Fixing these core shell and interaction defects now prevents propagating broken mobile navigation, disclosure, and typography patterns to subsequent collection quickfilters (`BL-078`), rules-reader refinement (`BL-082`), and multi-system sheets (`BL-070`, `BL-071`).

## What Changes

- **Responsive Character List**: Transform the entrypoint character list to render a structured table on desktop viewports and an accessible card list (`<ul role="list">` with `<li>` card items containing `<article>`) on mobile viewports. Character entries display human-readable identity, system, and class metadata rather than raw serialized objects. Eliminates document-level horizontal overflow on mobile while preserving accessible table semantics on desktop.
- **Menu Popover Lifecycle Contract**: Establish a default shared close-on-command seam across menu primitives. When a menu item command opens an overlay, dialog, or drawer, the owning popover must close and reset its trigger button to the closed state before transferring control or focus to the overlay, and restore focus cleanly when the dialog is dismissed or saved. Remove existing ad-hoc consumer popover dismissal logic in favor of this shared contract.
- **Mobile Input Typography Baseline**: Enforce a $\ge 16$px computed font size baseline on all mobile text inputs, textareas, and select elements across the application to prevent iOS Safari automatic focus zoom, without resorting to restrictive viewport meta tags (`user-scalable=no`, `maximum-scale=1`) or brittle programmatic zoom restoration scripts.
- **Verification & Testing**: Update unit and black-box browser test suites to assert mobile card semantics, desktop table semantics, menu reset on dialog open/close, and mobile computed input typography ($\ge 16$px) across Chromium, WebKit, and Mobile Chrome. Provide a dedicated Storybook sandbox for the responsive character list and reuse existing sandboxes for action menus and primitive fields, with explicit physical-phone verification steps mapped to named stories.

## Capabilities

### New Capabilities

- `character-list-presentation`: Responsive character listing that renders a structured table on desktop viewports and an accessible card list on mobile viewports derived from human-readable summary values.

### Modified Capabilities

- `accessible-sheet-interactions`: Add explicit popover disclosure lifecycle requirements (resetting trigger disclosure and icon state upon invoking overlay actions) and mobile form input typography requirements ($\ge 16$ CSS pixels computed font-size on mobile viewports to prevent involuntary focus zoom).

## Impact

- **Affected Surfaces**:
  - Entrypoint route: Character list presentation and action handling
  - Shared UI primitives: Menu button and menu item button popover lifecycle wiring
  - Application typography & form styles: Mobile form control font-size rules and input components across the sheet and dialogs
- **Dependencies**: No new npm dependencies; uses standard platform-native Web APIs (Popover API, media queries).
- **APIs & Data**: No schema migrations, persistence shape changes, or public cross-system contract modifications.
