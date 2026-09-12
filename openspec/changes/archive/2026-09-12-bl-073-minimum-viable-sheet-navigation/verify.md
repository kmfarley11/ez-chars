# BL-073 Verification Record

This supplemental record owns the human proof and post-apply verification evidence for `bl-073-minimum-viable-sheet-navigation`. Normative behavior remains in `specs/character-sheet-landmark-navigation/spec.md`, and implementation progress remains in `tasks.md`.

## Smallest Unique Sandboxes

- **`Organisms/Dnd5e2014SheetNavigation / Interactive Proof`:** One configurable, stateful Storybook example containing the real descriptor/context behavior, three parent regions, the eight proposed child destinations, nested collapsed states, independent Abilities & Proficiencies and Features & Traits panels, the desktop complete outline and icon rail, and the preferred phone rail plus labeled-outline fallback. Use Storybook controls or ordinary human interaction for presentation changes; it has no `play` function or viewport-only duplicate stories. Its measurement banner scrolls away instead of covering jump targets.
- **Saturated 2014 application fixture:** Reuse the existing saturated character for route-level history, Rules coexistence, real grid reflow, phone geometry, and rapid-scroll verification after the proof is approved.

Run `npm run storybook`, open **Organisms → Dnd5e2014SheetNavigation → Interactive Proof**, and use Storybook's viewport toolbar plus the `compactPresentation` and `wideBreakpoint` controls. The proof header reports both viewport and remaining sheet-workspace width.

## Pre-Propagation Human Gate

The following review blocks all full-route rollout until the owner explicitly approves it.

### Desktop breakpoint and binary panel

- Review the initial `1280px` viewport proxy at approximately 1024, 1180, 1279, 1280, and 1440 CSS-pixel viewport widths, recording the remaining sheet-content width at each point.
- Confirm the initial approximately `16rem` complete outline leaves the representative sheet useful and does not create undesirable grid reflow; decide whether the accepted threshold can remain viewport-relative or must follow available sheet-container width.
- Minify to the approximately `3rem` rail and reveal the labeled outline again; confirm no continuous resizing is necessary for the tested jobs.
- At a representative laptop-height fine-pointer viewport, confirm the compact `Outline` header and hierarchy normally avoid internal scrolling while retaining clear parent/child relationships. At short heights, coarse-pointer layouts, increased text size, and phone landscape, confirm bounded scrolling remains available rather than shrinking targets or hiding destinations.
- At tighter desktop widths, confirm revealing complete labels does not permanently sacrifice an unreasonable amount of sheet width.
- Record the accepted breakpoint and binary widths, or the exact revision required before propagation.

### Icons, labels, and phone presentation

- Identify every destination from the icon rail without relying solely on hover; use the complete labeled outline whenever an icon is unfamiliar and record every icon that needs substitution before rollout.
- Confirm each desktop native pointer tooltip and accessible name repeats the same descriptor-owned label as its visible sheet heading. Treat the accessible name—not the tooltip—as the screen-reader contract.
- At representative small and large phone portrait widths, confirm rail buttons remain fixed, non-overlapping 44-by-44 CSS-pixel targets and the sheet has no horizontal page overflow.
- At representative phone landscape height, confirm all destinations remain practically reachable without shrinking controls or making the rail's own scrolling surprising.
- Open and dismiss the complete labeled outline, verifying its return path and focus behavior.
- On touch, use the labeled-outline action as the teaching and recovery surface; confirm that this is sufficiently evident without a gesture-only long press or a second Help action.
- Compare the preferred persistent icon rail with the labeled-drawer fallback and record which presentation the owner approves.

### Landmarks, collapse, and focus

- Confirm the labeled outline presents Overview, Runtime, and Organizational parents plus the eight approved children in visible sheet order.
- Scroll until the proof measurement banner leaves view. Collapse an outer region, then choose one of its children from the rail and outline; confirm the ancestors open, the complete destination heading remains visible rather than being passed or covered, and its heading receives visible focus.
- Choose an already visible destination and confirm it repositions and focuses without collapsing or mutating content.
- Independently collapse Abilities & Proficiencies and Features & Traits and confirm neither changes the other's state.

### Accessibility and disclosure behavior

- Traverse the rail, complete outline, collapse controls, and revealed destinations with keyboard alone; confirm logical order, no hidden duplicate stops, and visible focus.
- Review light and dark themes and representative zoom/text sizing for clipped labels, icon comprehension, and document overflow.

### Decisions required for approval

- Accepted responsive threshold, whether viewport- or container-relative, and complete/rail widths: viewport-relative `1280px`; `16rem` complete and `3rem` rail.
- Accepted phone presentation: preferred persistent icon rail; labeled drawer remains a fallback rather than the selected baseline.
- Accepted labeled-outline presentation and dismissal/focus path: compass action opens the modal labeled hierarchy; ordinary dismissal returns focus to the compass action and destination selection focuses the destination.
- Accepted minimum icon vocabulary or required substitutions: identity, bookmark, action bolt, ability die, feature badge/rosette, spell sparkles, backpack, and notes document.
- Bookmark communicates Quick Reference without colliding with collection-priority Pin/Unpin, or another quick-summary mark is required: accepted bookmark.
- Labeled outline is sufficient touch teaching/recovery, or a different discoverable mechanism is required: labeled outline accepted; no Help or long-press action.
- Docked `3rem` rail remains preferable to overlaying the nine-control surface like the single Rules action, or evidence requires a revision: docked rail accepted for propagation.
- Active tracking remains omitted, or evidence requires an artifact change: omission accepted.
- Sheet-local context remains an implementation detail, or an ADR/refinement is required: feature-local implementation accepted; no ADR triggered.
- Owner decision, date, and explicit approval: tasks 1.8 and 2.1 explicitly approved on 2026-09-12.

## Post-Rollout Application Verification

These checks use the saturated 2014 application fixture after the presentation proof is approved and the route integration exists. They do not block the earlier isolated-proof decision; their results block final owner approval and archival.

### History and collapse restoration

- Jump to two or more different destinations, collapse an ancestor of the earlier destination, then use Back and Forward; confirm history reopens and reveals the historical target rather than landing on hidden content.
- Activate the current landmark repeatedly; confirm it repositions and refocuses the heading without adding duplicate Back entries.
- Scroll normally between regions and confirm the URL/history does not change and no persistent active-section marker appears.

### Rules history and focus precedence

- Open Rules from a sheet landmark, then invoke Back once; confirm Rules closes through its established history step and focus returns to the invoking Rules control without the unchanged landmark competing for focus.
- Invoke Back or Forward again when it changes the landmark fragment; confirm the historical sheet destination reopens, scrolls into view, and receives focus.
- Interleave several sheet jumps and Rules open/close actions; confirm landmark fragments and SvelteKit page state remain intact and predictable.
- Confirm the left navigation and right Rules action do not obscure, overlap, or disable each other's required controls.

### Saturated route and browser performance

- Rapidly scroll the saturated sheet with navigation present and confirm ordinary scrolling does not update landmark state or history.
- Run the repository's automated Chromium performance gate and record whether its declared thresholds pass.
- Rapidly scroll the saturated sheet in headed Firefox on macOS and compare it with the accepted pre-change baseline. Record lag, layout instability, or black/unpainted regions without inferring an unsupported root cause.

### Final integrated-route manual pass

- At a wide desktop viewport, use the complete outline to visit a visible destination, then minify to the rail and visit a child of a collapsed region. Confirm the region and panel reopen, the whole heading is visible, and focus lands on that heading.
- At widths immediately below and above `1280px`, confirm the sheet starts with the rail at `1279px` and the complete outline at `1280px`; confirm the `16rem` outline does not make the remaining grid unusable and manual minification restores the `3rem` rail.
- Create at least two different landmark jumps, collapse the earlier destination's parent, then use browser Back and Forward. Re-select the current destination and scroll normally; confirm only different explicit destinations add history and historical hidden targets reopen.
- From a landmark destination, open Rules and close it with both its Close action and browser Back. Confirm the fragment remains unchanged, focus returns to the Rules button, and a later Back that changes the fragment focuses the historical sheet heading.
- In phone portrait and landscape, confirm the rail stays fixed-width, all nine actions remain reachable without page-level sideways scrolling, and the compass opens the labeled outline. Dismiss with Escape or `Return to sheet`, then reopen and select a destination; confirm focus return and destination focus respectively.
- Traverse the rail, labeled outline, region headings, and child headings using keyboard alone. With a representative screen reader, confirm the compass, eight destination buttons, dialog, region hierarchy, and expand/collapse states have understandable names and announcements.
- Review light and dark themes plus increased text/zoom for clipped labels, lost focus indication, navigation/Rules overlap, or controls that shrink below comfortable touch size.
- In both expanded and collapsed child panels, confirm the new low-contrast header band clearly separates the panel heading, landmark icon, and contextual reference action from nested grid content without competing with the stronger parent-region header or becoming visually noisy in either theme.
- In headed Firefox on macOS, rapidly scroll the fullest available 2014 sheet with the outline expanded and minified. Compare the previously accepted black-region behavior and record whether navigation materially worsens it; `BL-072` owns platform profiling and support-policy follow-up.

## Automated Evidence

| Date       | Command                                                                                                                                 | Result               | Notes                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-12 | `npm run test -- --run src/lib/components/__tests__/collapsiblePanel.test.ts src/routes/charsheets/5e/__tests__/sheetLandmarks.test.ts` | Pass                 | 2 files and 8 tests after checkpoint revisions                                                                                                                 |
| 2026-09-12 | `npm run check`                                                                                                                         | Pass                 | 0 Svelte errors and 0 warnings after checkpoint revisions                                                                                                      |
| 2026-09-12 | `npm run lint`                                                                                                                          | Pass                 | Prettier and ESLint after checkpoint revisions                                                                                                                 |
| 2026-09-12 | `npm run build-storybook`                                                                                                               | Pass                 | Static catalog includes the revised unique interactive proof                                                                                                   |
| 2026-09-12 | `npm run test:storybook -- --run`                                                                                                       | Pass                 | 31 files and 123 tests; proof has no `play` function                                                                                                           |
| 2026-09-12 | `npm run verify:smoke`                                                                                                                  | Pass                 | 163 unit tests, 29 Chromium passes with 5 skips, and 123 Storybook checks                                                                                      |
| 2026-09-12 | `npm run build`                                                                                                                         | Pass                 | Static production build completed                                                                                                                              |
| 2026-09-12 | `npm run build-storybook`                                                                                                               | Pass                 | Retained navigation sandbox built successfully                                                                                                                 |
| 2026-09-12 | `npm run test:e2e:all`                                                                                                                  | Pass                 | 110 passes and 26 intentional project/viewport skips across Chromium, Firefox, WebKit, and Mobile Chrome                                                       |
| 2026-09-12 | `npm run test:perf`                                                                                                                     | Pass                 | Chromium saturated-sheet scroll thresholds passed                                                                                                              |
| 2026-09-12 | `PLAYWRIGHT_PERF=1 npx playwright test tests/performance.perf.spec.ts --project=firefox`                                                | Non-gating deviation | Headless Firefox averaged 48.65 FPS against the Chromium-oriented 55 FPS threshold; functional Firefox coverage passed and `BL-072` retains platform profiling |
| 2026-09-12 | Post-feedback `npm run check`, `npm run lint`, focused Vitest, Storybook, and Chromium/Mobile Chrome navigation suites                  | Pass                 | 0 diagnostics, 9 focused unit tests, 123 Storybook checks, and 8 application navigation checks after adding the shared child-panel header band                 |
| 2026-09-12 | Post-border-refinement `npm run check`, `npm run lint`, focused `CollapsiblePanel` Vitest, and Storybook component checks               | Pass                 | 0 diagnostics, 2 focused unit tests, and 123 Storybook checks after limiting the two-pixel divider to expanded child-panel headers                             |

## Material Deviations and Follow-Ups

- 2026-09-12 final physical-phone review exposed four core-mobile findings outside BL-073's landmark-navigation scope: the entrypoint character list compresses poorly, an options trigger can retain its `×` state after a submenu dialog closes, inline-edit focus zoom may remain after Save or Cancel, and the existing Edit/Annotate composition remains rough with the on-screen keyboard. These are now refined as P0 `BL-084`; deeper View/Edit/Annotations unification remains P1 `BL-077` rather than being hidden inside the readiness repair.
- 2026-09-12 final physical-phone review also exposed three resource-reader findings outside BL-073's scope: the right-side reference presentation can white out or displace the underlying sheet, physical-iPhone PDF rendering reports a `readableStream`-adjacent page error, and Find plus the scrollability of Outline/Find are insufficiently apparent. Existing P0 `BL-082` now owns explicit reproduction, fallback, presentation, Find-prominence, and scroll-affordance outcomes.
- 2026-09-12 physical-iPhone interaction-state review: after a landmark action, Safari may temporarily retain the button's hover shading, but ordinary touch scrolling clears it. Inspection confirms that the navigation has no `aria-current`, viewport observer, scroll listener, or active-landmark state. Treat the shading as transient touch feedback rather than a current-section marker; retain the approved no-active-tracking baseline unless playtest evidence shows an orientation problem.
- 2026-09-12 integrated-route hierarchy feedback: the owner approved a consistent low-contrast, theme-aware band behind each child-panel heading, landmark icon, and contextual header action. The shared `CollapsiblePanel` owns the treatment so ordinary and navigable panels retain one hierarchy grammar; parent-region headers remain visually stronger and destination-specific colors remain out of scope. The perimeter remains one pixel, with a subtly stronger theme-tinted two-pixel lower divider only while expanded; collapsed bands remain uniformly one pixel.
- 2026-09-12 post-rollout Firefox comparison: the required functional Firefox matrix passed, while the non-gating headless performance comparison averaged 48.65 FPS and therefore did not satisfy the Chromium-oriented 55 FPS threshold. This does not establish the cause of the owner's headed Firefox/macOS paint artifact. Existing `BL-072` already owns headed macOS and non-macOS reproduction, profiling, comparison without the persistent edge control, browser-support policy, and the compatibility notice; no duplicate backlog item was added.
- 2026-09-12 route-history integration exposed that the existing Rules shallow-state helpers used an empty URL and therefore discarded a landmark fragment. The helpers now preserve the live query and fragment while retaining their existing state and focus semantics; the application test interleaves landmark jumps, Rules open/close, and later Back navigation.
- 2026-09-12 focused rollout coverage: Chromium and Mobile Chrome pass route-level checks for the exact `1279px`/`1280px` transition, manual minification, ordered labels, hidden-target reopening, independent collapse, fragment deduplication, Back/Forward focus, Rules precedence, 44-by-44 phone targets, non-overlap, labeled-outline keyboard recovery, and absence of horizontal document overflow.
- 2026-09-12 outline-density iteration: the wide fine-pointer outline now uses a shorter heading, compact minify action, approximately `2.25rem` rows, lighter child weight, and tighter hierarchy spacing. Coarse-pointer controls retain the global `44px` minimum, and bounded scrolling remains intentional when height or text sizing requires it.
- 2026-09-12 icon iteration: Quick Reference now trials a bookmark instead of the pushpin, avoiding collision with the application's established Pin/Unpin priority meaning while preserving the owner's intended “keep this reference handy” metaphor.
- 2026-09-12 icon iteration: the owner requested a backpack for Inventory / Equipment, sparkles for Spells, a compass for the labeled Outline action, and an initial pushpin trial for Quick Reference. Features & Traits uses the approved badge/rosette rather than an eye or source-specific class emblem. The pushpin review exposed its collision with collection priority and led to the approved bookmark.
- 2026-09-12 default-state clarification: collapsed regions and panels in the proof exist only to exercise nested expansion. Route rollout retains the sheet's default-expanded presentation; navigation assists access to content and does not justify hiding it initially.
- 2026-09-12 checkpoint feedback: the owner generally approved the direction but requested explicit consideration of tooltip/accessibility identity, touch learning, docked-versus-overlaid geometry, proof-banner interference with jumps, and a pre-rollout icon-finalization task. Native `title` and accessible labels already share each descriptor label; the proof banner now scrolls away. The labeled outline remains the recommended touch teaching surface, the multi-action rail remains docked rather than copied from the one-action Rules overlay, and icon finalization remains open in task 1.8.
- 2026-09-11 agent render sanity check: the proof rendered without an obvious overflow or runtime failure at 1440×900 (1168px reported sheet workspace) and 390×844 (326px reported sheet workspace). This is not owner approval or a substitute for the viewport, touch, keyboard, icon-comprehension, and physical-phone checks above.
- The Svelte autofixer reported no component issues. It suggested attachments as an optional alternative to the deliberate `bind:this` focus-target bindings; the bindings remain because the generic panel and region controllers must expose their exact native heading buttons for deterministic focus.

Every unresolved item must be reconciled into `docs/backlog.md`; this file must not become its only durable record.

## Post-Apply Human Review

- **Status:** Approved
- **Reviewed scope:** The isolated proof, complete 2014 route, expanded and rail presentations, physical-phone navigation, icon vocabulary, default-expanded sheet organization, collapsed-destination recovery, history/Rules interaction, child-panel hierarchy treatment, themes, and known Firefox/macOS behavior were reviewed through iterative owner feedback.
- **Owner feedback:** The owner reports that button-based outline navigation materially improves viability across platforms and approves the current interaction and aesthetic baseline. The final physical-phone pass found unrelated home, menu, editing, annotation, resource-panel, PDF-rendering, and reader-discoverability work that does not invalidate BL-073.
- **Follow-up reconciliation:** Core phone findings are refined as new P0 `BL-084`; resource-reader findings expand existing P0 `BL-082`; the headed Firefox/macOS classification remains in `BL-072`; deeper focused View/Edit/Annotations unification remains P1 `BL-077`.
- **Explicit approval and date:** Approved by the owner on 2026-09-12.
