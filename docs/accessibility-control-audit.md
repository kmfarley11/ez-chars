# Character-Sheet Interaction Audit

**Status:** Automated implementation resolved; physical-device and screen-reader review retained before external playtesting  
**Audit date:** 2026-08-02
**Last reviewed:** 2026-09-12
**Scope:** Current home-to-character-sheet flow, including dense inventory/spell browsing and 2014 landmark navigation, on the phone-sized, coarse-pointer presentation

This is a bounded audit of control families, not an inventory of every repeated character record. A family is complete only when its accessible name, touch geometry, keyboard order, automated evidence, and any manual-only conclusion are accounted for.

## Evidence

- **Mobile geometry:** `npx playwright test tests/mobileAccessibility.smoke.spec.ts --project="Mobile Chrome"`
- **Dense collection geometry and modal context:** `npx playwright test tests/denseCollections.smoke.spec.ts --project="Mobile Chrome"`
- **Component semantics:** Storybook browser checks and Svelte diagnostics
- **Cross-browser overlays:** `npm run test:e2e:all`
- **Manual review:** the phone-sized section of `docs/theme-visual-checklist.md`

Playwright bounding boxes and DOM client rectangles are CSS-pixel measurements and are compared directly with the 44-by-44 baseline. They are not normalized by device pixel ratio.

## Baseline Findings

The first Mobile Chrome geometry run on 2026-07-31 passed navigation-menu sizing, collapsed-region keyboard order, modal confinement, and invoker restoration. It identified these representative undersized targets before remediation:

| Control                                |                     Baseline CSS-pixel bounds |
| -------------------------------------- | --------------------------------------------: |
| Runtime sheet-region toggle            |                                 96.50 × 25.59 |
| Quick Reference heading toggle         |                                182.39 × 36.00 |
| Current HP Edit / Notes                |                 39.84 × 26.00 / 51.41 × 26.00 |
| Runtime Add action / Source menu       |                 98.45 × 36.00 / 97.52 × 36.00 |
| Spell / inventory card-action triggers |                                 28.00 × 28.00 |
| Current HP input / Save / Cancel       | 80.00 × 30.00 / 46.30 × 26.00 / 56.83 × 26.00 |
| Card menu Edit / Notes                 |                                136.00 × 42.00 |
| Dialog Cancel                          |                                 75.89 × 34.00 |
| Source search                          |                                323.00 × 38.00 |
| Source category filters                |                30.00 high; All was 38.08 wide |
| Equipped-only associated label         |                                323.00 × 20.00 |

Source candidates and the custom-action choice already exceeded the baseline through their content layout. Main-menu and More-options triggers also passed. Source inspection additionally found compact dialog/editor controls, native form controls, summary toggles, and the click-only home character row requiring remediation or explicit classification.

## Control-Family Inventory

| Surface / control family                               | Accessible-name owner                                       | Baseline touch / keyboard result                                                                      | Resolution and evidence                                                                                                                                                        | Exception / manual evidence                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Mobile navigation menu triggers                        | Explicit `aria-label` on `MenuButton`                       | Touch pass; logical DOM order pass                                                                    | Conforming; Mobile Chrome geometry and cross-browser menu tests pass                                                                                                           | Verify physical thumb spacing manually                                             |
| Desktop navigation icon links                          | Explicit link label from `NavButton`                        | 40 × 40 before shared policy                                                                          | Corrected through the shared coarse-pointer owner; Svelte and Storybook checks pass                                                                                            | None                                                                               |
| Menu actions                                           | Visible button text                                         | 42 px high before remediation; native sequential order                                                | Corrected; representative geometry and native popover tests pass                                                                                                               | None                                                                               |
| Home character selection and delete                    | Character identity / explicit action labels                 | Row was pointer-only; compact Delete was below baseline                                               | Corrected with named Open and Delete controls; Mobile Chrome uses Open for the test path                                                                                       | Row click remains a redundant convenience with the conforming Open action          |
| Sheet-region toggles                                   | Visible region heading                                      | 25.59 px representative height; document order pass                                                   | Corrected; Mobile Chrome geometry and order tests pass                                                                                                                         | None                                                                               |
| Collapsible `CollapsiblePanel` headings                | Generated expand/collapse label                             | 36 px representative height; unmounted children correctly leave tab order                             | Corrected; collapsed-content keyboard test passes                                                                                                                              | None                                                                               |
| Direct primitive edit, save, cancel, and input         | Explicit field/action text and input label                  | 26–30 px representative height; edit/input/focus-return order pass                                    | Corrected; representative editor geometry passes                                                                                                                               | None                                                                               |
| Field annotation trigger and editor actions            | Explicit field-aware label / visible action text            | 26 px trigger and compact editor controls                                                             | Corrected; shared policy, dialog flow, and Storybook checks pass                                                                                                               | None                                                                               |
| Specialized card/source action trigger and menu        | Explicit context-aware label / visible menu text            | 28 px legacy trigger; 42 px menu actions                                                              | Corrected with conforming owner; ordinary Edit/Notes menus were removed by BL-077, while source-owned menus retain explicit labels and coarse-pointer targets                  | None                                                                               |
| Dialog shell and dialog actions                        | Dialog title / visible button text                          | Close action 34 px; modal confinement/restoration pass                                                | Corrected; geometry, confinement, scroll lock, and invoker restoration pass                                                                                                    | None                                                                               |
| Text, number, search, select, and textarea controls    | Associated label or explicit ARIA label                     | Representative inputs 30–38 px high; sequential order follows markup                                  | Corrected through the shared form-control policy; component and browser checks pass                                                                                            | None                                                                               |
| Checkbox and radio choices                             | Explicitly associated wrapping label                        | Native input is intentionally small; wrapping label was 20 px high                                    | Corrected with 44-pixel labels; browser coverage verifies label activation                                                                                                     | Associated-label category; physical clarity remains a checklist item               |
| Spell, feature, trait, and inventory cards             | Card/region label plus visible action labels                | Display content is passive; 28 px card-action controls failed                                         | Corrected actionable descendants; passive rows/cards remain unsized                                                                                                            | None                                                                               |
| Runtime-action list and source menu                    | Action-aware source-menu label                              | Source menu was 36 px high; list content is passive                                                   | Corrected; runtime source geometry and workflow pass                                                                                                                           | None                                                                               |
| Runtime source search, filters, and candidates         | Explicit search label, visible category/source text         | Search 38 px; filters 30 px high; candidates pass; label hit area failed                              | Corrected; Mobile Chrome geometry, non-overlap, and label activation pass                                                                                                      | Associated-label category for Equipped only                                        |
| Dense collection search and collection actions         | Explicit collection-aware label / visible action text       | New surface; sequential order follows collection heading, direct actions, search, count, then results | Conforming through shared input and button policy; saturated desktop/phone checks cover Add, row-level Pin/Unpin, search, count-bearing Browse, and Close                      | None                                                                               |
| Dense collection detail, priority, and focused editing | Stable record-aware labels / focused-detail title           | Passive row is not the touch owner; compact Detail and Pin/Unpin are adjacent                         | Conforming through shared `IconButton` targets; focused view/edit/back preserves context and restores the invoking target or a stable fallback after movement/removal          | Passive row remains intentionally unsized                                          |
| Dense no-match inline Clear                            | Visible inline action text                                  | Inline prose action is below the literal target baseline                                              | Retained beside the conforming full-size `Clear search` equivalent path                                                                                                        | Approved inline-flow/equivalent-action exception; verify prose separation manually |
| Dense focused collection scroll region                 | Collection title, named result list, visible Close          | New native modal surface with one content scroll owner                                                | Mobile Chrome verifies background lock, complete search/results, nested row task return, and Browse invoker restoration                                                        | Physical thumb and screen-reader review remain manual                              |
| Horizontal pane resize separators                      | Explicit context label from `HorizontalResizeHandle`        | New desktop-only ARIA separator; pointer drag plus Left/Right/Home/End keys                           | Conforming shared owner; focused Chromium, Firefox, and WebKit tests verify bounded value changes, while stacked phone layout omits it                                         | Verify physical drag affordance and screen-reader announcement manually            |
| Sheet landmark icon rail                               | Descriptor-owned accessible label                           | New persistent nine-action rail; fixed visual order precedes the sheet in DOM order                   | Conforming through `BaseButton` and the shared coarse-pointer policy; Mobile Chrome verifies 44-by-44 geometry, no overlap, no document overflow, and labeled-outline recovery | Verify physical thumb comfort and icon comprehension manually                      |
| Complete labeled sheet outline                         | Visible descriptor-owned region and destination text        | New modal disclosure below the wide-layout threshold; native buttons follow visible sheet order       | Conforming through `DialogShell` focus confinement and shared buttons; application coverage verifies Escape return and destination focus                                       | Verify representative screen-reader hierarchy comprehension manually               |
| Navigable region and panel headings                    | Descriptor-owned visible heading plus expand/collapse state | Existing disclosure families now receive stable fragments and programmatic focus                      | Inherits the conforming sheet-region and `CollapsiblePanel` families; application coverage verifies hidden-ancestor reopening and focus                                        | None                                                                               |
| Inline reference and attribution links                 | Visible inline link text                                    | Below literal target where text remains in prose flow                                                 | Retain visible focus and adjacent-content separation                                                                                                                           | Approved inline-flow exception; verify manually                                    |
| Hidden import file input                               | Explicit label; visible Import button invokes it            | Native input is intentionally visually hidden; conforming visible trigger is the interaction path     | Retain BaseButton trigger and import-flow browser coverage                                                                                                                     | Approved equivalent-action exception                                               |
| Disabled read-only checkboxes                          | Field-aware disabled label                                  | Not operable and not a direct-touch control                                                           | No target-size requirement; retain readable disabled state                                                                                                                     | Not an exception because the control is unavailable                                |

## Completion Rules

- Every pending row must finish as conforming, corrected, or one of the approved exception categories.
- Passive rows and cards are not assigned minimum dimensions unless the container itself owns the action.
- A small actionable descendant still needs the full target. If that causes an unacceptable structural layout cost, the row stays unresolved and returns to backlog refinement.
- Automated geometry does not establish screen-reader comprehension, physical thumb comfort, inline-flow usability, or associated-label clarity; those conclusions remain manual checklist items.

## p1-020 Completion Evidence (2026-07-31)

- `npm run verify:smoke`: passed with 93 unit tests, 9 Chromium application tests plus 3 intentional mobile-project skips, and 52 Storybook tests.
- `npm run test:e2e:all`: passed with 39 tests across Chromium, Firefox, WebKit, and Mobile Chrome plus 9 intentional non-mobile skips.
- `npx playwright test tests/mobileAccessibility.smoke.spec.ts --project="Mobile Chrome"`: passed all 3 geometry, keyboard-order, and modal-context tests.
- `npm run test:perf`: passed the Chromium scroll-frame baseline.
- Official Svelte autofixer: zero issues for every modified Svelte component; local Svelte diagnostics report zero errors and warnings.

No critical control family remains unresolved. Human physical-device and screen-reader review remains required before external playtesting because the automated suite deliberately does not claim those conclusions.

## BL-064 Dense-Collection Evidence (2026-08-02)

- Mobile Chrome verifies exact five-row previews and count-bearing Browse actions for Weapons, Armor & Shields, Other Gear, and Spells; representative Browse, search, row-menu, and Close geometry meets the 44-by-44 CSS-pixel baseline.
- The focused phone collection verifies background scroll locking, one results scroll owner, retained query through a nested focused edit, row-menu focus restoration, and Browse-trigger restoration on close.
- The complete application suite passes 53 tests across Chromium, Firefox, WebKit, and Mobile Chrome with 15 intentional project/viewport skips. The focused saturated Firefox workflows pass without a browser-specific implementation path.
- Storybook passes 63 interaction/accessibility checks, including dense search, scroll affordances, duplicate names, focused Edit/Notes save and cancel, phone browsing, and focus return.
- Automated evidence still does not replace the physical scrolling, thumb comfort, truncation, theme contrast, and screen-reader checks in `docs/theme-visual-checklist.md` and `docs/dense-collection-storybook-checklist.md`.

## BL-069 Reference-Resize Evidence (2026-09-06)

- One shared named separator owns both desktop reference-width and side-by-side navigation/document resizing. It exposes bounded values, pointer capture, and Left/Right/Home/End operation; the sheet-facing edge reverses physical movement without reversing the user's arrow direction.
- The focused reference-viewer matrix passes 20 checks across Chromium, Firefox, WebKit, and Mobile Chrome with 4 intentional viewport-specific skips. Desktop checks exercise both separators; Mobile Chrome confirms the full-screen presentation omits them and retains 44-by-44 primary controls.
- Physical drag discoverability, separator announcement in representative screen readers, and phone outline comfort remain part of the owner proof in the change-local `verify.md`.

## BL-073 Landmark-Navigation Evidence (2026-09-12)

- The retained 2014 navigation sandbox and the saturated application use the same descriptor-owned labels, icons, and destination controllers. Every rail action has a matching native pointer tooltip and accessible name; the complete outline remains the non-hover teaching and recovery surface.
- Focused Chromium application coverage verifies ordered landmarks, independent collapse units, direct and hidden jumps, stable fragments, history deduplication, Back/Forward reopening, Rules close-focus precedence, fixed phone targets, labeled-outline dismissal, and absence of document-level horizontal overflow.
- Cross-browser automation and the physical phone, screen-reader, and headed Firefox/macOS checks remain recorded in the change-local `verify.md` until the final owner gate.
