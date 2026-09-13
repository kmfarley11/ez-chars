# Verification Plan & Evidence: BL-084 Harden Core Mobile Viability

This document records the verification strategy, mapped Storybook stories, manual interaction steps, and test results for `BL-084`.

## Verification Strategy

1. **Automated Unit & Contract Tests (Vitest)**:
   - Test route-local `toCharacterSummary` view-model projection: verify correct formatting of identity name, system label, class summary, and updated timestamps; verify fallback to identifier when identity name is absent.
   - Test focused component contracts in isolation without asserting CSS media query breakpoint reflow.
2. **Automated Black-Box Tests (Playwright)**:
   - Run complete cross-browser matrix: `npm run test:e2e:all` (Chromium, Firefox, WebKit, Mobile Chrome).
   - Responsive character list: Assert semantic `<table>` renders on desktop viewports and semantic `<ul role="list">` of `<li>` card items containing `<article>` elements displaying character name, system badge, classes, formatted updated date, and comfortably spaced touch-friendly actions.
   - Secondary action placement: Evaluate during the character-list proof whether secondary management actions (e.g. Delete) remain directly visible beside Open or live under a compact card options menu.
   - Popover disclosure reset: Assert selecting a menu command closes the popover, resets the trigger button to the closed state (`…`), opens the target dialog, and restores focus to the closed trigger on dismissal.
   - Input typography: Measure computed font-size of text inputs and textareas on mobile viewports across WebKit and Mobile Chrome, asserting `parseFloat(fontSize) >= 16`.
3. **Manual Human Verification (Storybook & Physical Phone)**:
   - Map every manual check to an explicit catalog title and story export in Storybook.
   - Physical iPhone Safari review of table vs. card reflow, menu dismissal, and input focus. Desktop Playwright WebKit cannot simulate physical iOS Safari visual viewport auto-zoom, making physical phone verification mandatory for focus-zoom acceptance.

## Storybook Sandbox Economy & Story Mapping

Per repository quality gates, do not create redundant stories or use Storybook `play` functions. Use Storybook's viewport toolbar for desktop vs. phone checks.

| Surface / Concern                    | Story Title / Export                          | Purpose                                                                                                                                                                                   |
| :----------------------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsive Character List**        | `Organisms/CharacterList` / `Responsive`      | Evaluates desktop table vs. mobile `ul > li > article` card reflow, breakpoint tuning, and direct vs. menu secondary action placement.                                                    |
| **Action Menu Popover Lifecycle**    | `Molecules/GridContentActionMenu` / `Default` | Verifies command execution closes popover, resets trigger to `…`, opens dialog, and returns focus on dismissal.                                                                           |
| **Menu Button Primitives**           | `Molecules/MenuButton` / `Default`            | Verifies shared close-on-command seam and escape dismissal focus return.                                                                                                                  |
| **Primitive Field Input Typography** | `Molecules/GridPrimitiveField` / `Default`    | Verifies $\ge 16$px computed font size on mobile viewports and in-place scalar editing. (Consolidated from legacy `GuardedEscapedPatch` export during task 1.6 play-assertion migration). |
| **Structured Form Typography**       | `Molecules/StructuredForm` / `Default`        | Verifies modal form inputs and textareas compute to $\ge 16$px on mobile without layout clipping.                                                                                         |

## Post-Propagation Review Instructions (Task 5.1 Human Verification Guide)

These explicit instructions are for the human reviewer to verify the integrated application in the browser and on a physical iPhone following full rollout.

### Environment Setup

1. **Start the local development server**:
   ```bash
   npm run dev -- --host
   ```
2. **Access the application**:
   - **Desktop**: Navigate to `http://localhost:5173/` in Chromium, Firefox, or Safari.
   - **Physical iPhone**: Connect your iPhone to the same local Wi-Fi network and navigate to `http://<your-host-lan-ip>:5173/` in Safari.

---

### Procedure 1: Home Character List Presentation (`/` Route)

#### Desktop Review ($\ge 768$px / md Viewport)

1. Navigate to `http://localhost:5173/`.
2. **Table Presentation**:
   - Verify the character list renders as a semantic HTML `<table>` with visible headers: "Identity", "System", "Classes", "Updated", and "Actions".
   - Verify all table headers and data columns are left-aligned (`text-left`).
   - Verify the "Actions" column is compact and snug (`w-px whitespace-nowrap`), without wide empty leading whitespace.
   - Verify both "Open" and "Delete" use consistent `BaseButton` styling (`theme-btn-light` / `theme-btn-dark`, small size).
3. **Interactions**:
   - Click either the row itself or the "Open" button for a character (e.g. "Theren Vael"). Verify seamless navigation to `/charsheets/5e?id=...`.
   - Return to `/` and click the "Delete" button for a character:
     - Verify the modal confirmation dialog appears: "Delete <Character Name>?".
     - Click "Cancel": verify the dialog dismisses and focus restores directly to the "Delete" button.
     - Reopen and click "Delete": verify the character is deleted and removed from the table.

#### Mobile Phone Review ($< 768$px Viewport / Physical iPhone)

1. View `http://localhost:5173/` on your phone or in desktop DevTools responsive mode ($390 \times 844$).
2. **Card List Presentation**:
   - Verify the desktop `<table>` is hidden (`hidden md:block`) and the mobile card list is visible (`block md:hidden`).
   - Verify the card list is structured as `<ul role="list">` with individual `<li>` card `<article>` elements.
   - Verify each card shows:
     - Prominent character name heading (`<h3>`).
     - System pill badge (e.g., "5e (2014)").
     - Formatted classes summary (e.g. "Wizard 10").
     - Formatted update timestamp (e.g. "Sep 12, 2026").
3. **Actions & Touch Targets**:
   - Verify "Open" and "Delete" are rendered cleanly inside the card footer.
   - Verify each button has an interactive touch target of at least $44 \times 44$ CSS pixels on coarse pointers, with comfortable spacing and no overlapping hit areas.
   - Tap "Open": verify immediate navigation to `/charsheets/5e?id=...`.
4. **Horizontal Overflow**:
   - Verify zero horizontal page scrolling or clipped cards (`document.documentElement.scrollWidth <= window.innerWidth`).

---

### Procedure 2: Action Menu Popover Lifecycle & Disclosure Seam (`/charsheets/5e`)

1. Open any character sheet on desktop or mobile (e.g. `/charsheets/5e?id=char-5e-2014-saturated` or `/charsheets/5e?id=e2e-character`).
2. Locate any card actions menu trigger (`…`), such as on "Actions / Runtime Summary", "Prof. Languages", or "Traits".
3. **Open Popover**:
   - Tap/click the `…` trigger button.
   - Verify the popover menu opens immediately.
   - Verify the trigger button icon changes from `…` to `×`, with `aria-expanded="true"`.
4. **Command Execution & Immediate Seam Reset**:
   - Tap/click "Edit" (or "Notes" / "Manage Pins").
   - **Crucial check**: Verify the popover menu closes immediately upon clicking the menu item.
   - **Crucial check**: Verify the trigger button immediately resets its disclosure icon from `×` back to `…` (`aria-expanded="false"`) as the modal dialog opens.
   - Verify no orphaned popover menu remains open over or behind the dialog backdrop.
5. **Modal Dismissal & Focus Restoration**:
   - Dismiss the modal dialog using "Cancel", "Save", or pressing `Escape`.
   - Verify the dialog closes cleanly.
   - Verify keyboard/assistive focus returns directly to the card actions trigger button (`…`).
   - Verify the trigger button remains in its closed state (`…`), ready to be reopened if desired.
6. **Popover Escape Dismissal**:
   - Reopen the card actions menu (`…` -> `×`).
   - Press `Escape` while the popover is focused:
     - Verify the popover closes.
     - Verify focus restores to the trigger button (`…`).

---

### Procedure 3: Involuntary Focus-Zoom & Mobile Typography (Physical iPhone Safari)

_Note: Automated Playwright WebKit cannot simulate physical iOS Safari visual viewport auto-zoom behavior; physical iPhone review is required._

1. **In-Place Primitive Field Editing**:
   - On a physical iPhone in Safari, navigate to a character sheet.
   - Tap into an in-place scalar field, such as "Current HP", "Armor Class", or "Temporary HP".
   - **Crucial check**: Verify that iOS Safari **does NOT** involuntarily zoom into or pan the page when the input receives focus.
   - Verify the computed font size is at least 16px (`1rem`).
   - Change a value and tap "Save" (or tap outside the input):
     - Verify the edit commits cleanly.
     - Verify the page zoom level does not involuntarily shift or reset.
2. **Modal Form Input & Textarea Editing**:
   - Tap the card actions menu on "Actions / Runtime Summary" and tap "Edit", or tap "Add Action" in the Actions panel.
   - In the modal dialog, tap into each text input (e.g. "Action Name"), number input, and textarea (e.g. "Notes").
   - **Crucial check**: Verify iOS Safari does NOT involuntarily zoom or jump the viewport for any field.
   - Verify the on-screen virtual keyboard appears cleanly without obscuring active fields or causing horizontal layout overflow.
   - Dismiss the dialog via "Cancel" or "Save":
     - Verify keyboard dismisses smoothly.
     - Verify viewport returns to normal scale without lingering zoom.
3. **Intentional User Pinch-to-Zoom Preservation**:
   - Use a two-finger pinch gesture to zoom into the character sheet (e.g. to 125% or 150%).
   - Verify that intentional user pinch-to-zoom is fully functional and responsive (WCAG 1.4.4 compliance; `user-scalable=no` is not used).
   - While intentionally zoomed, tap into an input field:
     - Verify Safari respects the user's zoom level without snapping or jarring viewport resets.

---

### Procedure 4: Document Overflow & Viewport Boundaries

1. Test the application at standard mobile viewports (320px, 375px, 390px, 414px):
   - On Home (`/`): confirm zero horizontal scrolling, cards fill width with consistent padding, and header navigation remains intact.
   - On Sheet (`/charsheets/5e`): confirm zero horizontal document scrolling, fixed bottom rail remains centered and accessible, and collapsed accordion panels stay within viewport width.
2. Open the saturated 2014 sheet and scroll to **Features & Traits**:
   - Confirm the Features card, its compact preview rows, and **Browse all 18 items** remain inside the containing grid panel.
   - Confirm the page cannot be dragged or scrolled horizontally and no content extends beyond the right viewport edge.
3. While still on the saturated sheet, inspect the fixed **Rules** button in both light and dark system themes:
   - Confirm the sheet remains visually continuous beneath the overlaid button rather than shifting left or exposing a solid white/black strip.
   - If a blank or displaced surface appears only after opening the rules reader, record that separately for `BL-082`; this correction does not redesign the mobile reader workspace.

---

## Automated Verification Records

### Batch 1 (Proof-Before-Propagation) Verification — 2026-09-12

- **Type Diagnostics**: `npm run check` — 0 errors, 0 warnings
- **Code Style & Lint**: `npm run lint` — All matched files match Prettier, 0 ESLint errors
- **Unit & Contract Tests**: `npm run test` — 28 test files passed, 185 tests passed (including `characterSummary.test.ts`, `fieldDraftHelpers.test.ts`, and `characterGridHelpers.test.ts`)
- **Storybook Component Tests**: `npm run test:storybook -- --run` — 32 test files passed, 121 tests passed
- **Chromium Smoke Suite**: `npm run test:e2e` — 31 passed, 5 skipped (including scalar editing focus restoration, Escape cancellation, unchanged save, validation error checks, and structured form external submission with array add/remove)
- **Strict OpenSpec Validation**: `npx openspec validate bl-084-harden-core-mobile-viability --strict` — Valid

### Batch 4 (Full Rollout & Hardening) Verification — 2026-09-12

- **Type Diagnostics**: `npm run check` — 0 errors, 0 warnings
- **Code Style & Lint**: `npm run lint` — All matched files match Prettier, 0 ESLint errors
- **Unit & Contract Tests**: `npm run test` — 28 test files passed, 185 tests passed
- **Storybook Component Tests**: `npm run test:storybook -- --run` — 32 test files passed, 121 tests passed
- **Chromium Smoke Suite**: `npm run test:e2e` — 35 passed, 5 skipped
- **Complete Cross-Browser Matrix**: `npm run test:e2e:all` — 133 passed, 27 skipped, 0 failed across Chromium, Firefox, WebKit, and Mobile Chrome:
  - Responsive character list verified (semantic table on desktop, `ul > li > article` card list on mobile).
  - Document overflow verified (0 horizontal overflow on `/` and `/charsheets/5e`).
  - Popover disclosure reset verified (trigger resets from `×` to `…` immediately on modal dialog open and restores focus on dismissal).
  - Mobile input typography verified ($\ge 16$px computed font size on mobile viewports while the viewport contract continues to permit user pinch-to-zoom).
- **Strict OpenSpec Validation**: `npx openspec validate bl-084-harden-core-mobile-viability --strict` — Valid

### Corrective Physical-iPhone Focus Experiment — 2026-09-12

- **Failed physical evidence:** On the saturated 2014 sheet in iPhone Safari, focusing inline numeric editors such as Current HP and Death Saves still persistently magnified the page after the original 16px typography rollout. Changing `1rem` to explicit `16px !important` and avoiding `select()` for numeric controls produced no observable improvement.
- **Corrective experiment:** The inline editor now focuses its newly rendered input with `focus({ preventScroll: true })`, while retaining the explicit 16px mobile control baseline and unrestricted user pinch zoom. This asks WebKit not to run its automatic focus reveal/zoom path; it does not script a forced zoom reset.
- **Focused automation:** `npx playwright test tests/mobileViability.smoke.spec.ts --project=webkit --project="Mobile Chrome" --reporter=line` — 8 passed. The test now confirms that emulated inline focus preserves visual-viewport scale and document scroll coordinates, but it cannot substitute for physical iPhone Safari behavior.
- **Local diagnostics:** `npm run check` — 0 errors, 0 warnings; `npm run lint` — passed after formatting.
- **Human status:** Passed. The owner rechecked the corrective focus behavior on physical iPhone Safari and verified that the persistent involuntary magnification no longer occurs. Task 4.4 is approved; unrestricted intentional pinch zoom remains part of the accepted contract.

### Corrective Saturated-Sheet Containment Pass — 2026-09-12

- **Physical evidence:** After approving the focus correction, the owner found that the saturated Features listing expanded beyond its containing mobile grid and that the sheet beneath the fixed right-edge Rules action could appear shifted against a solid light/dark theme background.
- **Root cause:** At a 390px viewport, the Features region had 274px available but 393px of scrollable content, its nested shared panel resolved to approximately 385px wide, and the document expanded to 475px. The dense Features fixture exposed an intrinsic-width leak through a `PanelSurface` used as a CSS-grid child.
- **Correction:** The shared `PanelSurface` now explicitly permits intrinsic shrinking with `min-width: 0`. A transient browser measurement reduced the same document from 475px to 390px and the overflowing panel from approximately 385px to 258px without clipping its compact content.
- **Regression coverage:** `tests/mobileViability.smoke.spec.ts` now seeds the exact saturated character and asserts at a 390px viewport that both the Features region and the complete document remain within their available widths.
- **Focused cross-browser evidence:** The new saturated containment case passed in Chromium, WebKit, and Mobile Chrome (3/3). The complete focused suite then passed 14/15; its only failure was a non-repeatable WebKit development-server module import in the pre-existing typography case, which passed immediately when rerun alone.
- **Canonical smoke gate:** `npm run verify:smoke` — passed: 0 Svelte diagnostics; formatting and ESLint clean; 28 unit files / 185 tests passed; Chromium application suite 36 passed / 5 intentionally skipped; Storybook 32 files / 121 tests passed. The first sandboxed invocation could not bind the local Vite port (`EPERM`), so the identical gate was rerun outside that environment restriction.
- **Human status:** Passed. The owner verified on the physical phone that the saturated Features collection, document width, and closed Rules-button presentation are corrected in the reviewed themes.

### Final Human Approval — 2026-09-12

- The owner explicitly approved the completed `BL-084` mobile viability result after verifying the focus behavior and saturated-sheet containment corrections on the physical phone.
- The only remaining observed mobile defect occurs after opening the Rules reader: `Page 1: undefined is not a function (near '...value of readableStream...')`. This is not a residual `BL-084` layout or input defect; `BL-082` already names reproduction and resolution of this exact physical-iPhone PDF rendering failure as P0 scope.
