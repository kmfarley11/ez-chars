## Context

Physical-iPhone solo rehearsals during `BL-073` navigation testing identified three critical mobile viability blockers outside sheet navigation itself:

1. The home character list (`src/routes/+page.svelte`) renders via `src/lib/components/Table.svelte`, which displays a rigid HTML table that horizontally overflows phone screens and formats raw serialized data (e.g. `{ name: ..., alignment: ..., lineage: ... }`).
2. Popover menus across the app (`MenuButton`, `GridContentActionMenu`, etc.) maintain a stale `×` icon and expanded state when a menu action opens a modal dialog or overlay, failing to reset disclosure state upon command execution.
3. Focusing text inputs or textareas on iOS Safari triggers involuntary automatic page zoom because input font sizes compute to less than 16px (e.g. `text-sm` / 14px in Tailwind), disorienting the user and requiring manual pinch-to-zoom recovery.

Fixing these core shell and interaction defects now prevents propagating broken mobile navigation, disclosure, and typography patterns to subsequent collection quickfilters (`BL-078`), rules-reader refinement (`BL-082`), and multi-system sheets (`BL-070`, `BL-071`).

## Goals / Non-Goals

**Goals:**

- Provide a responsive home character list that renders an accessible, readable card list on mobile viewports (< 768px initial breakpoint) with zero horizontal document overflow, while preserving the existing structured HTML table on desktop viewports (>= 768px).
- Derive character display strings through a route-local `toCharacterSummary` view-model helper in `src/routes/characterSummary.ts` (consumed by `src/routes/+page.svelte`), rendering human-readable identity and class labels rather than serialized JSON.
- Establish a single, default shared close-on-command seam across menu primitives (`MenuButton` / `MenuItemButton`) so command activations close and reset the popover trigger (`…`), eliminating duplicated ad-hoc `hidePopover()` calls across consumers.
- Ensure dialog focus restoration cleanly returns to the closed menu trigger upon dialog dismissal or save.
- Ensure all mobile inputs, textareas, and select elements compute to $\ge 16$px font size to avoid WebKit auto-focus zoom across iPhone viewports without restricting pinch-to-zoom.
- Verify behavior through Vitest unit tests, Playwright cross-browser assertions (Chromium, Firefox, WebKit, Mobile Chrome), and targeted Storybook sandboxes with explicit human inspection steps.

**Non-Goals:**

- Defining a universal cross-system summary adapter or character lifecycle API (explicitly owned by `BL-070`).
- Redesigning the broader View/Edit/Annotate interaction model or creating 3-tier detail sheets (owned by P0 `BL-077`).
- Redesigning rules-reader PDF rendering or mobile reader navigation (owned by P0 `BL-082`).
- Mutating HTML table semantics with CSS flex/grid hacks (`display: block` on `<tr>` / `<td>`), which degrades screen-reader accessibility trees.
- Disabling user pinch zoom, setting `user-scalable=no` or `maximum-scale=1`, or using browser-sniffing or forced programmatic zoom restoration scripts.
- Changing character schemas or persistence envelopes.

## Decisions

### Decision 1: Dual-Semantic Character List via Route-Local Summary Model

- **Choice**: Derive a route-local character summary projection in `src/routes/characterSummary.ts` (imported by `src/routes/+page.svelte`), and render:
  - Desktop (initial baseline >= 768px / `md`): Semantic HTML `<table>` with columns: Identity, System, Classes, Updated, and Actions.
  - Mobile (initial baseline < 768px): Semantic `<ul role="list">` of `<li>` cards containing `<article>` elements displaying character name, system badge, classes, formatted updated date, and comfortably spaced touch-friendly actions.
  - Secondary action placement: Evaluate during the character-list proof whether secondary management actions (e.g. Delete) remain directly visible beside Open or live under a compact card options menu.
  - Boundary note: This route-local projection is strictly a presentation helper for the home route. It is explicitly NOT the future cross-system adapter boundary (`BL-070` will design the authoritative multi-system lifecycle and computed summary seam).
- **Why over alternatives**:
  - _Alternative: CSS table-to-card reflow (`display: flex` on table elements)._ Hacking `<table>`, `<tr>`, and `<td>` with flex/grid CSS breaks screen reader accessibility trees in many browsers and produces fragile styling.
  - _Alternative: Mobile-only card view for all viewports._ Desktop users benefit from the higher information density and scannability of a multi-column table.

### Decision 2: Default Shared Close-on-Command Seam in Menu Primitives

- **Choice**: Establish one centralized close-on-command mechanism:
  - Inventory existing consumers: `MenuButton`, `MenuItemButton`, `GridContentActionMenu`, `GridContentListRow`, `RuntimeActionsCollection`, and home route create menu.
  - In `MenuItemButton`: Trigger an owning popover close by default upon click/activation, resetting `isMenuOpen = false` and calling `node.hidePopover()` if currently open.
  - Remove duplicate, ad-hoc `hidePopover()` logic previously maintained inside `GridContentListRow.svelte` and `RuntimeActionsCollection.svelte`.
  - Retain `×` only while the menu popover is physically open. On command invocation, the trigger immediately restores `…`.
  - Handle dialog focus restoration as an overlay handoff: When a launched dialog closes (Save, Cancel, Escape, Backdrop), focus returns to the closed menu trigger button.
- **Why over alternatives**:
  - _Alternative: Consumer-by-consumer manual wiring._ Inconsistent and fragile; already led to duplicate code in two collection components while leaving `GridContentActionMenu` broken.
  - _Alternative: Rely on native browser popover light-dismiss._ Clicking an element _inside_ a `popover="auto"` does not trigger light-dismiss. Programmatic closure on command invocation is required.

### Decision 3: WebKit 16px Form Typography Baseline

- **Choice**: Establish a $\ge 16$px computed font size baseline on all mobile text inputs, textareas, and selects:
  - In `src/app.css`: Add a rule under `@media (pointer: coarse)` and `@media (max-width: 767px)` ensuring `input:not([type='checkbox']):not([type='radio']):not([type='file'])`, `textarea`, `select`, and `.theme-input` compute to `font-size: 1rem` (16px).
  - In components currently using explicit `text-sm` (14px) or `text-xs` (12px) on inputs (e.g. `GridPrimitiveField.svelte`, `StructuredForm.svelte`, `ActionDraftForm.svelte`): replace with responsive classes (e.g. `text-base md:text-sm`) or remove sub-16px overrides so the baseline applies.
  - Acceptance criterion: Validate on physical iPhone Safari that focusing inputs does not trigger involuntary viewport auto-zoom, while unrestricted user pinch-to-zoom is preserved.
- **Why over alternatives**:
  - _Alternative: Programmatic viewport reset scripts (`window.scrollTo`, resetting meta tags)._ Brittle, causes visual stutter, and frequently fails across iOS releases.
  - _Alternative: Disabling user zooming in viewport meta._ Severe accessibility violation (WCAG SC 1.4.4) and breaks user control on touch devices.

### Proof-Before-Propagation Boundary & Storybook Economy

Follow repository storybook economy rules:

1. Add **one unique responsive character-list sandbox story** under `Organisms/CharacterList / Responsive` demonstrating:
   - Desktop table vs. mobile `ul > li > article` card reflow across the initial 768px breakpoint.
   - Evaluation of secondary action placement (direct button vs. card options menu) with $\ge 44\times 44$ CSS-pixel coarse-pointer targets.
2. Reuse and update **existing stories**:
   - `Molecules/GridContentActionMenu / Default` and `Molecules/MenuButton / Default` to verify popover command close and dialog focus restoration.
   - `Molecules/GridPrimitiveField / Default` (consolidated from `GuardedEscapedPatch` upon migrating play assertions) and `Molecules/StructuredForm / Default` to verify $\ge 16$px computed mobile typography.
3. Add **no Storybook `play` functions**. Migrate any existing play assertions touched by this work to Vitest or Playwright.
4. Run full cross-browser test matrix (`npm run test:e2e:all`) to verify popover lifecycle and input typography across Chromium, Firefox, WebKit, and Mobile Chrome. Physical iPhone Safari remains the authoritative manual proof for visual viewport focus auto-zoom behavior.
5. Stop at a named mid-apply checkpoint (`STOP — Human review and approval`) where the human reviewer validates the behavior in Storybook and on a physical mobile device before completing the full application rollout.

## Risks / Trade-offs

- **[Risk]** Increasing mobile input font size to 16px might expand input widths or disrupt tight horizontal layouts (e.g. in `GridPrimitiveField.svelte` where a numeric input is set to `w-20`).
  - **Mitigation:** Test tight numeric inputs on 320px-375px viewports. Adjust padding or width slightly (e.g. `w-24` or flex-shrink adjustments) while maintaining comfortable touch targets.
- **[Risk]** `hidePopover()` might throw an error if called when the element is not currently in the open state.
  - **Mitigation:** Guard popover dismissal with a `matches(':popover-open')` check before calling `hidePopover()`.
- **[Risk]** Desktop Playwright WebKit cannot simulate physical iOS Safari visual viewport auto-zoom.
  - **Mitigation:** Rely on Playwright WebKit for computed CSS font-size assertions, and enforce physical iPhone Safari testing at the human review gates.

## Migration Plan

- No data migration required.
- Purely additive and responsive UI hardening.

## Open Questions

- Exact secondary action composition on mobile character cards (direct button vs. options menu): left flexible for tuning during the Storybook character-list proof.
