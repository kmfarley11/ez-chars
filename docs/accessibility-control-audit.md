# Character-Sheet Interaction Audit

**Status:** Automated implementation resolved; physical-device and screen-reader review retained before external playtesting  
**Audit date:** 2026-08-02
**Scope:** Current home-to-character-sheet flow, including dense inventory/spell browsing, on the phone-sized, coarse-pointer presentation

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

| Surface / control family                            | Accessible-name owner                                 | Baseline touch / keyboard result                                                                   | Resolution and evidence                                                                                                                    | Exception / manual evidence                                                        |
| --------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Mobile navigation menu triggers                     | Explicit `aria-label` on `MenuButton`                 | Touch pass; logical DOM order pass                                                                 | Conforming; Mobile Chrome geometry and cross-browser menu tests pass                                                                       | Verify physical thumb spacing manually                                             |
| Desktop navigation icon links                       | Explicit link label from `NavButton`                  | 40 × 40 before shared policy                                                                       | Corrected through the shared coarse-pointer owner; Svelte and Storybook checks pass                                                        | None                                                                               |
| Menu actions                                        | Visible button text                                   | 42 px high before remediation; native sequential order                                             | Corrected; representative geometry and native popover tests pass                                                                           | None                                                                               |
| Home character selection and delete                 | Character identity / explicit action labels           | Row was pointer-only; compact Delete was below baseline                                            | Corrected with named Open and Delete controls; Mobile Chrome uses Open for the test path                                                   | Row click remains a redundant convenience with the conforming Open action          |
| Sheet-region toggles                                | Visible region heading                                | 25.59 px representative height; document order pass                                                | Corrected; Mobile Chrome geometry and order tests pass                                                                                     | None                                                                               |
| Collapsible `CollapsiblePanel` headings             | Generated expand/collapse label                       | 36 px representative height; unmounted children correctly leave tab order                          | Corrected; collapsed-content keyboard test passes                                                                                          | None                                                                               |
| Direct primitive edit, save, cancel, and input      | Explicit field/action text and input label            | 26–30 px representative height; edit/input/focus-return order pass                                 | Corrected; representative editor geometry passes                                                                                           | None                                                                               |
| Field annotation trigger and editor actions         | Explicit field-aware label / visible action text      | 26 px trigger and compact editor controls                                                          | Corrected; shared policy, dialog flow, and Storybook checks pass                                                                           | None                                                                               |
| Card-action trigger and menu                        | Explicit `Card actions` label / visible menu text     | 28 px trigger; 42 px menu actions                                                                  | Corrected with conforming owner and reserved coarse-pointer card offset                                                                    | None                                                                               |
| Dialog shell and dialog actions                     | Dialog title / visible button text                    | Close action 34 px; modal confinement/restoration pass                                             | Corrected; geometry, confinement, scroll lock, and invoker restoration pass                                                                | None                                                                               |
| Text, number, search, select, and textarea controls | Associated label or explicit ARIA label               | Representative inputs 30–38 px high; sequential order follows markup                               | Corrected through the shared form-control policy; component and browser checks pass                                                        | None                                                                               |
| Checkbox and radio choices                          | Explicitly associated wrapping label                  | Native input is intentionally small; wrapping label was 20 px high                                 | Corrected with 44-pixel labels; browser coverage verifies label activation                                                                 | Associated-label category; physical clarity remains a checklist item               |
| Spell, feature, trait, and inventory cards          | Card/region label plus visible action labels          | Display content is passive; 28 px card-action controls failed                                      | Corrected actionable descendants; passive rows/cards remain unsized                                                                        | None                                                                               |
| Runtime-action list and source menu                 | Action-aware source-menu label                        | Source menu was 36 px high; list content is passive                                                | Corrected; runtime source geometry and workflow pass                                                                                       | None                                                                               |
| Runtime source search, filters, and candidates      | Explicit search label, visible category/source text   | Search 38 px; filters 30 px high; candidates pass; label hit area failed                           | Corrected; Mobile Chrome geometry, non-overlap, and label activation pass                                                                  | Associated-label category for Equipped only                                        |
| Dense collection search and collection actions      | Explicit collection-aware label / visible action text | New surface; sequential order follows collection heading, bulk action, search, count, then results | Conforming through shared input and button policy; saturated desktop/phone checks cover search, count-bearing Browse, bulk edit, and Close | None                                                                               |
| Dense collection row menus and focused dialogs      | Stable row label and context / dialog title           | New surface; passive row is not the touch owner                                                    | Conforming row-menu target; nested Edit and Notes preserve modal context and restore the invoking menu                                     | Passive row remains intentionally unsized                                          |
| Dense no-match inline Clear                         | Visible inline action text                            | Inline prose action is below the literal target baseline                                           | Retained beside the conforming full-size `Clear search` equivalent path                                                                    | Approved inline-flow/equivalent-action exception; verify prose separation manually |
| Dense focused collection scroll region              | Collection title, named result list, visible Close    | New native modal surface with one content scroll owner                                             | Mobile Chrome verifies background lock, complete search/results, nested row task return, and Browse invoker restoration                    | Physical thumb and screen-reader review remain manual                              |
| Inline reference and attribution links              | Visible inline link text                              | Below literal target where text remains in prose flow                                              | Retain visible focus and adjacent-content separation                                                                                       | Approved inline-flow exception; verify manually                                    |
| Hidden import file input                            | Explicit label; visible Import button invokes it      | Native input is intentionally visually hidden; conforming visible trigger is the interaction path  | Retain BaseButton trigger and import-flow browser coverage                                                                                 | Approved equivalent-action exception                                               |
| Disabled read-only checkboxes                       | Field-aware disabled label                            | Not operable and not a direct-touch control                                                        | No target-size requirement; retain readable disabled state                                                                                 | Not an exception because the control is unavailable                                |

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
