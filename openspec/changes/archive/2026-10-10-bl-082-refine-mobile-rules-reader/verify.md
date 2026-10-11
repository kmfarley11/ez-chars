# BL-082 Verification Record

## Current Status

**24/24 tasks complete; archived 2026-10-10.** Implementation and integrated human review are complete. The owner explicitly approved the narrowly scoped security exception, completing task 5.2 with accepted limitations—not a clean full audit. BL-072 owns the advisory deadline, monitored WebKit recurrence, and physical Android evidence gap. The capability spec is synced, backlog and active goals reconciled, and BL-070 leads the recommended sequence. Targeted spec validation and strict repository validation passed (20/20 remaining active items). Archival performed no staging or commit; earlier owner-staged changes remain untouched in the index.

The owner explicitly authorized rollout on **2026-10-09**, accepting unavailable physical Android coverage, then approved the integrated result: “everything looks great! yeah go ahead with dependency maintenance”. The approved reader is now the normal presentation across sheet and annotation hosts; proof switches and the legacy layout have been removed. This is final reader approval, not an audit waiver or additional device evidence. [tasks.md](tasks.md) owns execution and approval gates; this supplemental record owns reproducible review instructions and evidence.

## Advisory Assessment and Owner Acceptance — 2026-10-10

The owner authorized the bounded assessment, not a security exception. Fresh `npm audit --json` still reports **6 high package findings from GHSA-vfj7-8cjw-p6xm**; `npm audit --omit=dev --json` reports **0**. The initial sandbox audit could not resolve the registry; the approved network-enabled rerun returned the actual advisory result. Registry queries confirm braces 3.0.3 remains latest and the latest OpenSpec/gh-pages still retain the affected dependency paths. No install, deployment, manifest change, or lockfile edit occurred.

The [security decision](../../../../docs/decisions/2026-10-10-bound-development-security-overrides.md#2026-10-10--advisory-reachability-and-proposed-temporary-exception) records inspected call sites, fixed brace-free patterns, package-schema resolution, residual risk, alternatives, and proposed exception conditions. Recommend narrowly accepting this development-tool denial-of-service risk with BL-072 review by 2026-11-09 or before external playtest, whichever comes first. Keep the full audit failing and distinguish accepted closure from passing verification. **Subsequent owner response: “I do approve.” This explicitly approves the exception and completes 5.2 with accepted limitations.** This documentation-only assessment does not rerun or supersede the dated application suites below.

## Formal Owner Approval — 2026-10-09

- The owner states: “i now formally approve of current state, please proceed onward with tasking.” This satisfies the human proof approval portion of gate 3.1, not the separate final integrated review after rollout.
- No new physical Android result, exact browser-version matrix, or older-device support evidence accompanied that approval. The existing positive owner reports remain valid within their reported scope.
- Follow-up authorization: “proceed with rollout. I cannot test physical android unfortunately, and my iphone is a 16 pro max, using the latest firefox, safari, and chrome available today.” This explicitly closes gate 3.1 with a documented physical-Android evidence exception. It does not reduce required Android functionality or certify emulation as a physical pass.
- Owner-reported device: iPhone 16 Pro Max; previously reported iOS 26.6.2; latest installed Safari, Firefox, and Chrome as of 2026-10-09. Exact numeric browser versions and runtime capability readings were not supplied. Positive prior proof reports remain owner evidence, not independently observed device tests. BL-072 owns additional physical matrix evidence and the still-unknown older-version boundary.

## Owner Proof Feedback — 2026-10-04

- Owner reports: “the result is solid! way better and no bugs detected.” This is positive human proof evidence, not an agent-observed device run. The feedback does not enumerate browser versions or certify each required device/browser combination; keep the outstanding matrix explicit without discarding the positive report.
- Approved revisions: highlight matching text in contextual Find previews; allow results to collapse without hiding the input/status; move expanded-reader Previous/page-entry/Next above the PDF. Compact readers retain their existing dedicated Page tool.
- In-PDF highlighting remains excluded and tracked in the existing backlog exploration. No new story or Storybook play automation is needed.
- Requested revisions remain pre-gate work, not approval to begin normal rollout.

### Focused Re-review After These Revisions

Reuse **Organisms / ReferenceProof / SelfHostedSrdViewer** or the actual sheet proof URL below:

- Search **armor**. Confirm matches stand out inside the contextual snippets in both light and dark themes; the PDF itself is intentionally unchanged.
- Collapse **Results · … matching pages**. Query, count, and status remain visible; Outline is easier to reach. Reopen results and confirm they remain usable. Editing the query without submitting must not change old highlights; submitting a new search reopens results.
- On a wide reader, use Previous/page entry/Next above the PDF. Scroll results/outline and confirm those page controls remain available, including with navigation minified. The top current-page action should focus page entry.
- Narrow the same viewer: the compact current-page action still opens its dedicated Page tools. Check the current page, query/results, and usable reading space survive the transition.

## Reader Tool Revisions — Owner Reported 2026-10-07

Reproduce in **SelfHostedSrdViewer** or the opt-in sheet URL below. The owner reports that opening **More** and clicking outside leaves the dropdown open until More is toggled; phone sizing/text alignment is awkward. On desktop, **Outline** appears to do nothing. On phone-sized readers, **Find** and page tools stretch to the full available height even with little content.

Inspection found a local `<details>` menu rather than the shared light-dismiss popover; a shortcut that neither reopens collapsed outline content nor reliably aligns its heading; and full-height tool wrappers. This was a reuse/interaction-review omission despite existing shared-primitive guidance, not a missing menu capability. `AGENTS.md` now explicitly distinguishes action popovers from inline disclosure and requires actual-host dismissal/focus/touch checks.

Recheck with the same sandbox (no new story required):

- Open the **… / More reference actions** menu. Click/tap outside; it must close and reset its icon. Reopen, focus an item, then Escape: only the menu closes and focus returns to its trigger. **Open in browser** remains a real new-tab link at the current page; **Browse resources** dismisses the menu before changing context.
- On desktop, search **armor**, leave the long results expanded, collapse **Document outline**, then use the top **Outline** button. The outline must reopen and bring its heading/curated entries into view with focus on the heading; results must remain intact.
- On a phone viewport, open Page tools and empty Find: the panel should fit its controls rather than stretching to full height. Search **armor**: results grow the panel only up to available height and scroll inside it. Collapse results and confirm the panel shrinks; return to the document without changing its page/scroll position.

These revisions remain pre-gate; passing automated evidence is recorded below. Physical-phone appearance and keyboard sizing still require owner review.

## Desktop Sheet Scrolling — Owner Reported 2026-10-07; Retest 2026-10-08

- **Reproduction:** In the actual desktop sheet with `readerProof=bl-082`, scroll down (for example, jump to Features & Traits in the left outline), then open Rules. The owner reports that the left sheet outline shifts out of view. Try scrolling the exposed sheet with the reader still open, including after resizing it: sheet scrolling is blocked. This is a desktop non-modal defect, distinct from intentional phone/modal background isolation.
- **Agent reproduction:** The new application regression reproduced a **2,109 CSS-pixel** outline displacement while the sheet's `window.scrollY` remained unchanged. The global `html/body:has(dialog[open])` overflow lock applied to the non-modal reader and changed the sticky outline's scroll context. Restricting that rule to `dialog:modal` fixes the reproduced displacement and allows independent sheet scrolling.
- **Manual retest:** Use the same scrolled desktop sheet; open Rules, confirm the outline remains visible, resize the reader narrower, then scroll the exposed sheet. The reader should stay open and retain its page. Jump to a PDF page and verify the sheet does not move. Open a real field-note dialog: background scrolling should be locked until that dialog closes, then resume with Rules still open. On a phone, Rules must still isolate the underlying sheet.
- **Separate resume suggestion:** General Rules entry currently resets after close because the viewer and transient state are released. The owner proposed local storage; the backlog now records a session-first recommendation and optional last-page persistence with explicit locator precedence. No resume/persistence behavior is implemented or approved by these scroll fixes.

## Reader Close After Jumps — Owner Reported 2026-10-08

- **Owner observation:** With Rules open, jumping pages and navigating otherwise worked, but Close behaved like Back through previous jumps and required repeated clicks before the reader disappeared. The owner also approved keeping the session-resume recommendation backlogged.
- **Reproduction and diagnosis:** On a fresh desktop proof sheet, jump to Quick Reference, open Rules, go to PDF page 62, then use the sheet outline to jump to Features & Traits and Spells. Click Close once. Before the fix, the new regression leaves the reader visibly open. PDF page entry does not increase history length; sheet section jumps copied open-reader state into additional entries. Repeated source invocation had the same risk.
- **Correction:** Keep one sheet-invoked reader entry and replace its current section/source while open. Preserve original invocation ownership. Close and browser Back return to pre-reader context in one action; Forward may reopen that single entry. Sheet jumps made while Rules is open are deliberately not separate history steps. Closed-reader sheet navigation retains ordinary Back/Forward behavior. Directly linked readers must not invent a prior sheet-origin entry.
- **Manual recheck (actual sheet proof, no new story):** Reload once to start without old hot-reload history entries. Repeat the sequence above; one Close must dismiss and focus Rules. Reopen, make more section jumps, then use browser Back: it must also dismiss once. With Rules closed, jump between sheet sections and confirm Back still navigates those sections normally. Resume-position persistence is not included.

## In-Place Dismissal Follow-up — 2026-10-08

The preceding Close-to-origin correction is superseded for explicit dismissal by the owner follow-up below; browser Back retains its separate navigation behavior.

### Close Must Not Undo Sheet Navigation — Owner Follow-up 2026-10-08

- **Original reproduction:** Start `npm run dev` and open the actual sheet proof at `/ez-chars/charsheets/5e?id=char-5e-2014-saturated&readerProof=bl-082` in a desktop-width window. Click **Quick Reference**, open **Rules**, click **Inventory / Equipment** in sheet navigation, then **Close** in the reader. The owner reports the reader now closes once, but the sheet jumps back to Quick Reference instead of staying at Inventory. Browser/version was not supplied for this follow-up.
- **Agent reproduction:** The revised Chromium application test fails with the URL changing from `#sheet-inventory-heading` to `#sheet-quick-reference-heading`. The prior test checked dismissal and focus but did not assert preservation of the current section/scroll, so it encoded an inadequate Close contract. An intermediate replacement using an empty URL dropped the fragment; the final implementation preserves the explicit full sheet URL.
- **Correction:** Explicit dismissal replaces the current reader history entry with a closed entry, preserving the live fragment and scroll position. Invoker focus uses `preventScroll`, including when the original contextual button is offscreen. Browser Back is deliberately different: it still navigates to the pre-reader context. Back/Forward after explicit Close must not reopen that closed entry; Forward after browser Back may reopen the reader. No resume-position persistence is introduced.
- **Manual retest:** Reload the proof and repeat Quick Reference → Rules → Inventory / Equipment → Close. Inventory and its exact scroll position must remain unchanged. Repeat after scrolling farther within the sheet and after opening from a contextual book button; returning focus must not pull an offscreen invoker into view. Resize the reader fully closed and expect the same result. Separately reopen, navigate the sheet, and use browser Back: the reader closes to its invocation context. Normal closed-reader section navigation must continue to work.
- **Automated status:** Full smoke and all 36 reader/sheet-navigation cross-browser checks pass, including offscreen-invoker/resize coverage (details below). The earlier interrupted run was blocked by sandbox port permissions and then the approval service's usage limit, not an application failure.

## Baseline Evidence — Recorded 2026-10-04

- Exploration inspected the current shared reader, sheet host, both annotation hosts, PDF loading/text path, and reference browser tests. The missing stream async-iteration explanation remains a hypothesis. The device and current owner reproduction, initially unknown, are supplied in the clarification below.
- Historical evidence: [BL-084](../2026-09-12-bl-084-harden-core-mobile-viability/verify.md) records physical approval of the closed Rules-tab/saturated-sheet containment correction, with the page error still outstanding. Do not conflate those defects.
- Pre-change command: `npx playwright test tests/referenceViewer.smoke.spec.ts --project=webkit --project='Mobile Chrome' --workers=1 --grep 'finds text|shows a browser fallback|uses a full-screen'` — **5 passed, 1 intentional skip**. The phone-bounds case is limited to Mobile Chrome, so desktop WebKit skips it. Initial sandbox execution could not bind port 5173 (`EPERM`); the approved rerun outside that restriction passed.
- These baseline checks cover Find, initialization fallback, and emulated phone bounds. They do not establish the affected physical Safari behavior, late page/text failure recovery, or the proposed controls. Implementation evidence is recorded separately below.

## Owner Clarification — 2026-10-04

- **Device:** iPhone 16 Pro Max, iOS **26.6.2 as reported by the owner**, not independently inspected by the agent.
- **Entry:** LAN HTTP development server on port 5173; portable reproduction path `/ez-chars/charsheets/5e?id=char-5e-2014-saturated`. Use the current development host address; do not hardcode the owner's private LAN address into committed instructions.
- **Phone browsers:** Safari confirmed; the owner reproduced the same page/Find findings in Firefox and Chrome on this same iPhone. These are three browser-app observations on one device, not evidence of failure in three independent desktop engines.
- **Page behavior:** PDF content visibly renders but shows `Page 1: undefined is not a function (near '...value of readableStream...')`.
- **Find behavior:** `Find could not finish. You can still browse the document` is observed. The owner also sees an apparent stall at `Searching page 6 of 403...`; pressing Find again shows the failure message. No successful phone Find/result jump is established.
- **Desktop comparison:** the owner reports Safari, Firefox, and Chrome work on desktop. Desktop OS/browser versions were not supplied. This is owner evidence, not an agent-run cross-platform certification.
- **Support direction accepted:** working in-app reading and Find on this phone and current stable iOS/Safari and Android/Chrome are required. Support older devices where practical, recording tested limits and graceful fallback rather than promising all versions. Fallback alone does not resolve a required-platform defect. Any downgrade of this baseline requires explicit owner approval.

### Original Bug Reproduction — Owner-Reported 2026-10-04

Preserve this baseline after the fix; append retest results rather than replacing the original failure with passing instructions. These are the owner's reported steps, not an agent-performed physical-device reproduction.

1. On the development computer, from the repository root run `npm run dev` and leave the server running. The current script already enables LAN access with `--host`.
2. Connect the iPhone to the same local network as that computer. Copy the reachable LAN **Network** URL printed by Vite (or obtain the computer's active LAN IP from its network settings and use the port printed by Vite). Use `http://<dev-host-lan-ip>:<vite-port>/ez-chars/` on the phone, not `localhost`; the reported run used port 5173. If Vite prints several network addresses, choose the one reachable on the phone's network. Use a trusted local network; no public port forwarding is needed.
3. Open that URL in iPhone Safari and open any supported character sheet, then the **Rules** tab. For the concrete reported fixture, navigate directly to `http://<dev-host-lan-ip>:<vite-port>/ez-chars/charsheets/5e?id=char-5e-2014-saturated`. The owner describes the flow as applicable to any sheet; the saturated 2014 sheet is the recorded reproduction fixture, not evidence that every character was tested.
4. Let the default SRD open. **Reported failure:** PDF content paints, but the reader shows `Page 1: undefined is not a function (near '...value of readableStream...')`.
5. Expand the document navigation / Outline & Find tooling and scroll within that pane to the Find bar. Enter **`armor`** and initiate Find. **Reported failure:** progress appears stuck at `Searching page 6 of 403...`. The original report supplies no measured wait duration; record elapsed time during a retest rather than treating a brief progress message as a hang.
6. Press **Find** again. **Reported failure:** the status becomes `Find could not finish. You can still browse the document` instead of completing the search.
7. Repeat the same flow in Firefox and Chrome **on that iPhone** to check the reported phone-browser agreement. Compare with the desktop browsers, which the owner reports work. Keep physical-phone results separate from desktop or viewport-emulation results.

### Regression Retest — Fixed When

Repeat the same LAN setup, character/source, and `armor` search on the affected physical phone. If BL-082 has changed the controls, use the new direct **Find** action instead of scrolling through the old navigation pane; retain the original steps above as historical evidence.

- Opening Rules paints the document without the reported page error; check text selection independently of canvas painting.
- Searching `armor` completes with results rather than remaining stuck at page 6 or failing. Select a result and confirm navigation to its matching page in-app.
- Run Find again after completion and confirm it also completes without stale progress or the reported failure. Use the controlled search-race fixture below to verify retry while older work remains pending; do not manufacture a phone failure merely to exercise retry.
- Record the date, app revision/build, device/OS/browser, source, observed duration/status, and pass/fail separately for each retest. A visible PDF alone, a browser fallback, or a desktop pass does not establish that this phone bug is fixed.

### Observations Versus Hypotheses

The painted-page-plus-error and failed Find are consistent with their shared text-extraction path failing after canvas painting begins. They do not establish which API or build condition causes it. The reported iOS version is later than the cited stream-support release, so do not classify this as an old-iOS defect without runtime evidence.

Code inspection separately identifies six concurrent search loops, per-page progress publication in `finally`, and unguarded result/progress callbacks after the aggregate promise rejects. This permits a late callback to overwrite a terminal failure, plausibly explaining the six-page status. The exact physical-device sequence is not yet instrumented; add deterministic failure/late-callback/retry coverage regardless of the eventual extraction fix.

## Remaining Device and Support Evidence

### Compatibility Experiment — 2026-10-04

- Added `tests/referenceCompatibility.smoke.spec.ts`: remove `ReadableStream.prototype[Symbol.asyncIterator]` before app startup, then open Rules and check selectable text plus a completed `armor` search and result navigation. This is a targeted missing-capability fixture, not iOS emulation.
- The pinned **5.5.207 modern module/worker** reproduced the owner's exact `Page 1: undefined is not a function (near '...value of readableStream...')` in Playwright WebKit. Temporarily selecting the pinned **legacy module and matching legacy worker** failed identically; the experiment was reverted. No dependency or PDF build selection changed.
- A local `readPdfText` adapter aggregates `streamTextContent().getReader()` chunks using the same item/style/language semantics as the pinned `getTextContent`, avoiding stream async iteration without patching browser globals. Both selectable page text and Find use it; cancellation releases the reader. This fixes the controlled failure path, but does not establish the owner's actual runtime capability or physical-phone result.
- `npx playwright test tests/referenceCompatibility.smoke.spec.ts --project=webkit --workers=1`: **1 passed** after the adapter (3.8-second test). Earlier intermediate reruns exposed a fixture text-casing mistake and an HMR-interrupted session; neither is reported as a product defect. Initial sandbox server binding failed with `EPERM`; approved execution outside that restriction ran successfully.
- `npm run check`: **0 errors, 0 warnings**. Focused `pdfText` / `pdfViewer` unit suites: **8 passed**, including cancellation, chunk aggregation, and failure followed by late sibling completion and independent retry. Wider pre-gate results are recorded below.
- Physical evidence remains open: the reported iPhone and current stable iOS/Safari and Android/Chrome must be tested at the proof gate with concrete versions recorded then. Desktop WebKit and Mobile Chrome emulation do not satisfy that gate or establish an oldest supported phone version.

During apply, augment the recorded reproduction with concrete browser versions, orientation, app revision/build and worker identity, runtime stream-capability presence when obtainable, and a failing stack/stage. Record the experiment and outcome separately from baseline evidence. Identify the current stable Android/Chrome test device and concrete current iOS/Safari target, and document any missing physical coverage. No further owner baseline report is needed before apply. Do not include character contents or personally sensitive logs, invent a lowest supported version, or silently treat emulator coverage as physical evidence.

### Physical Retest Record to Complete

Use the existing LAN development setup above, with the proof path below. The current local build is based on commit `8cbf0ed` plus the uncommitted BL-082 changes; both engine and worker remain PDF.js **5.5.207**, using their existing modern build assets. Record the actual revision at retest if this changes.

| Target                        | What remains to record                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Owner's iPhone 16 Pro Max     | Confirm OS version; Safari, Firefox, and Chrome app versions; page/text/Find/result-jump outcome and approximate search duration for each |
| Current stable iOS/Safari     | Confirm whether the owner's device covers this target; otherwise record the additional device/version and result                          |
| Current stable Android/Chrome | Available physical device, OS/browser versions, and the same reading/Find result; no device is currently supplied                         |
| Older phones                  | Only actual tested limits; no oldest-supported-version claim is established by this proof                                                 |

If the original error persists, retain its exact wording and when it occurs. If Safari remote inspection is available, the read-only expression `typeof ReadableStream.prototype[Symbol.asyncIterator]` and the failing stack help distinguish the tested hypothesis from a different runtime problem; this is optional diagnostic evidence, not a prerequisite to trying the proof. Do not reset character storage to perform the test.

## Smallest Sandbox Set

- **Organisms / ReferenceProof / SelfHostedSrdViewer:** reuse for compact/wide controls, scrolling, Find, outline, page input, and failures. Expand **Reviewer setup (not reader UI)** and select **Cannot open document** or **Page text and Find failure**; the latter deliberately fails text extraction while retaining canvas painting. Select **Working document** to recover. This is story-only fault injection, not a real-device diagnosis.
- **Organisms / ReferenceProof / MixedSourceStates:** reuse for stale/external/unavailable/alternate-source regressions; do not build duplicate phone stories.
- **Normal actual sheet:** `/ez-chars/charsheets/5e?id=char-5e-2014-saturated` on the same LAN development host used in the original reproduction. No proof query parameters are needed. Exercise Rules/contextual entry and focused-field notes through the normal piecewise detail host.
- **Retained standalone annotation host:** reuse **Molecules / FieldAnnotationControl / Empty**. The temporary `annotationHost=field` application override has been removed; this existing sandbox covers the fallback component when no piecewise handoff is supplied. No additional story or play function.

Use the same stories at different viewport sizes. Physical-phone results remain separate from emulation; the unavailable Android run is an explicitly accepted rollout gap. Historical proof URLs in the dated records below describe earlier runs, not a current requirement. Do not add Storybook play functions.

## Mid-Apply Human Interactions

- **SelfHostedSrdViewer, phone:** On initial open, identify Find, Outline, current page, source, and return/dismissal without opening a hidden pane. Check document space and readable labels at a small viewport; no keyboard appears until deliberately entering an input.
- **Same story, Find:** Open Find, enter a term, inspect progress/results, and select a result. The document returns at the target with no focus left hidden behind it. Reopen Find and confirm query/results remain. Return without a selection and confirm prior reading position. Check real keyboard space and dismissal on the phone.
- **Same story, Outline/Page:** Open curated and nested native outline entries, return, and use page input/Previous/Next. Long tools/results show directional overflow cues. Tools are explicitly recoverable and never disappear merely because you scroll.
- **Same story, responsive:** Rotate the phone; test a narrow reader in a wide desktop window and expand/rescale the desktop panes. Preserve page/search state, usable focus, resize-to-collapse, and continuous scrolling. No duplicate PDF scroll surface or horizontal page overflow.
- **Actual sheet proof:** Open Rules and a contextual reference on a physical phone, then close and use browser Back. The obscured sheet is not interactable during full-screen reading; closing restores the invoker and leaves no blank panel/shift. Regression-check the closed Rules tab on the saturated sheet in light and dark themes.
- **Actual annotation proof:** Enter unsaved note text from both supported annotation hosts, open a source, use Find/Outline, and return to the editor. Verify the draft remains unchanged, one modal owns focus, the reader fills usable height, and `Back to document` cannot be confused with return to the editor.
  - Normal sheet URL: **Current HP → notes icon → Add note for Current HP** (or open an existing note). Enter disposable text, choose **SRD 5.1 (local PDF)**, set page **8**, and use **(view in app)**. **Back** returns to the draft without saving it; cancel/discard the disposable edit afterward.
  - **FieldAnnotationControl / Empty:** **Add notes for Test Field → Add note** opens the editor; use its **Add note** control to create an entry. Enter disposable text and select the **SRD class features** source template, then **(view in app)**. Use Find/Outline, return with **Back**, and confirm the draft remains. Cancel/discard afterward. This checks the retained standalone host without a production-only test routing override.
- **Controlled error fixture:** Trigger initialization failure and separately a late page/text/Find failure. Expect understandable status, direct browser fallback, useful retry where applicable, and working return/dismissal. Partial/failed Find is not a successful no-match result; rendering cancellations during ordinary scrolling are not alerts.
- **Automated search-race contract (not a manual story step):** `pdfViewer.test.ts` fails one concurrent page inspection, completes an independent retry, then resolves remaining old inspections. It verifies no stale callbacks or further scheduling, with cleanup for late pages. In the story's text-failure fixture, manually check that repeated Find attempts retain an honest failure and direct fallback rather than claiming no matches.
- **Required mobile compatibility:** Recheck page painting, text selection, Find, and a result jump on the owner's phone in Safari, Firefox, and Chrome, plus the documented current iOS/Safari and Android/Chrome baseline. Contrast with desktop regressions. Record actual versions/results and physical-device gaps; browser fallback alone is not a pass for required targets.
- **MixedSourceStates:** Verify external sources remain external, stale locators cannot regain untrusted exact jumps, and unavailable states remain understandable. Browser fallback uses the best verified current context without affecting character data.

## Automated Evidence — 2026-10-04 Pre-Gate

- `npm run verify:smoke` — **passed**: Svelte diagnostics (0 errors/warnings), repository formatting/ESLint, 36 unit files / **245 tests**, the Chromium application smoke suite, and 39 Storybook files / **105 tests**. Existing project-specific skips remain; no new skips or Storybook play functions were added.
- `npx playwright test tests/referenceCompatibility.smoke.spec.ts tests/referenceReaderProof.smoke.spec.ts tests/referenceViewer.smoke.spec.ts --project=webkit --project=firefox --project='Mobile Chrome' --workers=1` — **39 passed, 3 intentional skips**. The existing phone-only bounds test skips the two desktop projects; the desktop-only divider test skips Mobile Chrome. All new tests run in all selected projects.
- New proof coverage checks direct Find and completed `armor` results, hidden-tool focus, reading/query preservation, exact outline/page jumps, current-page browser fallback, browser Back/invoker restoration, modal background isolation, compact/wide transitions, and both annotation hosts' unsaved drafts. The controlled missing-async-iterator fixture independently verifies selectable text and full-document Find in the normal entry path.
- `npm run build` — **passed**, including build-managed PDF module/worker assets. The existing static-adapter fallback overwrite notice remains informational.
- `PLAYWRIGHT_PERF=1 npx playwright test tests/performance.perf.spec.ts --project=chromium --workers=1` — **1 passed**, meeting the existing sheet-scroll gate (at least 55 average FPS and no more than 5% missed-frame intervals). This is the existing closed-reader sheet baseline, not PDF paint/phone-performance certification.
- `openspec validate bl-082-refine-mobile-rules-reader --strict` and `git diff --check` — **passed**.
- Intermediate evidence: rapid resize exposed PDF.js's requirement that stream cancellation carry an `Error`; corrected and protected by a unit contract. A WebKit standalone-host test initially navigated twice during module loading; the fixture now makes one initial navigation. A later cross-browser run overlapped production-build/document edits and showed Vite reconnections with reader state lost; the unchanged code passed the complete rerun above with no concurrent writes. Do not run builds or edit watched files during browser verification.
- No dependency, lockfile, PDF build-selection, or build-tool configuration changes. Full audit/coverage/static Storybook build and the comprehensive all-browser suite remain scheduled for task 5.2; they are not claimed here.

At the automated handoff, physical iOS/Android compatibility, native keyboard/safe-area behavior, landscape comfort, large-text usability, and the original owner's regression were not yet independently verified. Subsequent positive owner feedback is recorded above; exact device/browser coverage remains unenumerated. The desktop engines and mobile viewport project cannot close task 1.1 or approve gate 3.1.

## Automated Evidence — 2026-10-07 Proof Refinement

- `npm run verify:smoke` — **passed**: 0 Svelte errors/warnings, formatting/ESLint clean, **250 unit tests across 37 files**, **65 Chromium E2E passed / 5 existing intentional phone-project skips**, and **105 Storybook tests across 39 files**.
- `npx playwright test tests/referenceReaderProof.smoke.spec.ts tests/referenceCompatibility.smoke.spec.ts --project=firefox --project=webkit --project='Mobile Chrome' --workers=1` — **18 passed**, no skips.
- Added five pure preview contracts covering case-preserving literal highlights, regex metacharacters and markup as text, Unicode normalization/offsets, bounded excerpts with whole-page counts, and empty/no-match queries. The shared reader uses semantic `mark` elements, not HTML injection or PDF text-layer mutation.
- Added one actual-sheet proof regression for desktop toolbar position and operation, page-entry focus with a collapsed sidebar, collapsed-result preservation, unsubmitted-query highlight stability, new-search expansion, and compact transitions. The existing compact test now checks highlighted snippets too; no new story or play function.
- Svelte autofixer reports no issues for the two changed components. Strict change validation and `git diff --check` pass. Initial runs caught a missing keyed preview loop and test selectors that did not distinguish the existing accessible names; corrected before the passing runs above.
- No dependency/build configuration changes. The prior build/performance results remain dated evidence above, not a claim they were rerun for this bounded proof revision. Comprehensive final gates remain task 5.2.

## Automated Evidence — 2026-10-07 Menu, Outline, and Sizing Correction

- `npm run verify:smoke` — **passed**: 0 Svelte errors/warnings, formatting/ESLint clean, **250 unit tests / 37 files**, **65 Chromium E2E passed / 5 existing intentional skips**, **105 Storybook tests / 39 files**.
- `npx playwright test tests/referenceReaderProof.smoke.spec.ts tests/referenceCompatibility.smoke.spec.ts --project=firefox --project=webkit --project='Mobile Chrome' --workers=1` — **18 passed**, no skips.
- Expanded existing actual-host regressions, without adding stories: outside-click menu dismissal and closed trigger state; Escape/focus restoration without closing the reader; native browser-link/new-tab activation; Browse resources handoff; reopening/focusing a collapsed desktop outline beneath long expanded results; content-sized empty Find/Page panels; bounded long results, reachable last result, and shrink-on-collapse; retained reading and draft state.
- A first Chromium run encountered the headless native PDF popup's blank URL. The test now checks the actual link destination and new-tab activation rather than inspecting browser-owned PDF viewer internals. No application workaround was introduced for that test limitation.
- Svelte autofixer reports no issues for the three changed components. The shared menu item accepts caller-resolved URLs, with a documented local routing-lint exception rather than attempting to resolve external/PDF assets as app routes. Strict change validation and `git diff --check` pass.
- No dependencies, build configuration, PDF rendering strategy, or rollout boundary changed. Full final gates remain task 5.2; these results do not supply physical-device evidence or approve gate 3.1.

## Automated Evidence — 2026-10-08 Desktop Scroll Correction

- `npm run verify:smoke` — **passed**: diagnostics (0 errors/warnings), formatting/ESLint, **250 unit tests / 37 files**, **66 Chromium E2E passed / 5 existing intentional skips**, and **105 Storybook tests / 39 files**.
- `npx playwright test tests/referenceReaderProof.smoke.spec.ts tests/referenceCompatibility.smoke.spec.ts tests/mobileAccessibility.smoke.spec.ts --project=firefox --project=webkit --project='Mobile Chrome' --workers=1` — **24 passed / 6 intentional skips**. The three phone-only accessibility tests skip the two desktop projects and pass in Mobile Chrome; every reader/compatibility test passes in each project.
- Added one actual-sheet regression, first failing against the previous global scroll lock and then passing after the modal-only correction. It covers stable scrolled-sheet/outline position on reader open, bounded resizing, independent sheet wheel scrolling, unchanged sheet position on PDF page jumps, true-modal background locking, and restored sheet scrolling after the modal closes while Rules remains open. Existing phone isolation, draft, and reference compatibility tests also pass.
- Strict change validation and `git diff --check` pass. No dependency, build, PDF engine, storage, or rollout change; full final gates remain task 5.2. Physical-phone behavior still needs owner confirmation rather than treating viewport emulation as device evidence.

## Automated Evidence — 2026-10-08 Single-Entry Reader History

- `npm run verify:smoke` — **passed**: 0 Svelte errors/warnings, formatting/ESLint clean, **254 unit tests / 38 files**, **67 Chromium E2E passed / 5 existing intentional phone-project skips**, and **105 Storybook tests / 39 files**.
- `npx playwright test tests/referenceReaderProof.smoke.spec.ts tests/sheetNavigation.smoke.spec.ts --project=firefox --project=webkit --project='Mobile Chrome' --workers=1` — **33 passed**, no skips. This includes the new single-Close/Back regression and existing normal sheet Back/Forward/focus behavior in all three projects.
- Four new unit contracts cover first-open versus repeated source choice, open-reader versus closed-reader sheet jumps, direct-link origin preservation, and reopening after a direct locator was dismissed. The actual-sheet regression first failed with the reader still visible after Close, then passed after the centralized history correction, including Forward/reopen and a subsequent browser Back.
- Svelte autofixer, strict change validation, and `git diff --check` pass. No reader-state persistence or dependency changes; proof gate 3.1 remains open. The accepted session-resume direction is recorded in the backlog, not implemented here.

## Automated Evidence — 2026-10-08 In-Place Close

- `npm run verify:smoke` — **passed**: 0 Svelte errors/warnings, formatting/ESLint clean, **256 unit tests / 38 files**, **68 Chromium E2E passed / 5 existing intentional phone-project skips**, and **105 Storybook tests / 39 files**.
- `npx playwright test tests/referenceReaderProof.smoke.spec.ts tests/sheetNavigation.smoke.spec.ts --project=firefox --project=webkit --project='Mobile Chrome' --workers=1` — **36 passed**, no skips. Desktop cases deliberately set desktop geometry even in the coarse-pointer project; this is engine/input/viewport evidence, not physical-phone certification.
- Two new unit contracts verify in-place state/fragment cleanup and direct-locator dismissal/reopening. The updated application regression first reproduced the owner's Quick Reference rewind, then passed with explicit Close preserving Inventory's fragment and scroll position. A second regression verifies resize-to-close preserves the exact scrolled position while focusing an offscreen contextual invoker without scrolling it into view. Back/Forward coverage distinguishes explicitly closed entries from readers dismissed through browser Back.
- The first full smoke run caught the older sheet-navigation test's assumption that explicit Close consumes a history entry. Updated it to verify the documented closed same-location entry, then ordinary Back navigation. The complete rerun above passes; no skips or relaxed scroll assertions were introduced.
- Svelte autofixer reports no component issues (existing lifecycle/focus suggestions reviewed); strict change validation and `git diff --check` pass. No dependencies, renderer, persistence, or annotation-draft changes. Full final gates remain task 5.2; task 3.1 and dependent rollout stay open for human review.

### Ongoing Evidence Guidance

Record exact commands/results for compatibility fixtures, actual page/text readiness, late failures, search cancellation/supersession, tool transitions, accessible focus, history, draft preservation, and container-responsive geometry. Keep behavioral contracts in Vitest/Playwright. State when a capability-removal test approximates only one missing API rather than an old iOS browser.

Use [repository verification guidance](../../../../docs/verification.md), including full audit/build/coverage/browser/performance gates for relevant dependency or build changes. Record skips and environment failures separately from product regressions. Compare performance against existing budgets rather than claiming headless cadence proves visual paint quality.

## Approval and Reconciliation

### Rollout Review — 2026-10-09

- Shared ownership: one reader layout and PDF lifecycle across sheet, piecewise-note, and retained standalone-note hosts. The legacy layout, proof switches, forced standalone app routing, and fixed nested reader heights are removed. Phone modality and non-modal desktop scrolling remain host-owned; the existing note dialog is never nested beneath a second reader modal.
- Regression review covers hidden/inert tool focus, breakpoint changes, same-document state, async text cancellation and stale callbacks, trusted/stale source resolution, in-place Close, genuine Back/Forward, and offscreen invoker focus. No new dependency, persistence, source processing, or browser-specific layout branch.
- `npm run verify:smoke` passed after rollout: diagnostics/lint, **256 unit tests / 38 files**, **67 Chromium passes / 5 intentional skips**, and **105 Storybook tests / 39 files**. The removed forced-host E2E path is no longer a production entry point; its previous evidence remains above, and the existing FieldAnnotationControl / Empty story now owns manual fallback-host review. The ordinary piecewise-note draft regression remains automated.
- Added a normal direct-locator entry/dismiss/reopen regression, passing in **all four browser projects**. Its initial double-navigation fixture aborted WebKit module imports; entering the direct URL on the first navigation corrected the fixture without weakening the console-error guard. Existing suites now use normal app URLs, not proof flags. Comprehensive final results follow when available.
- Backlog reconciliation preserves session-resume and in-PDF-highlight follow-ups, the owner-triggered latent history entry, and BL-072's explicitly accepted physical Android/version-evidence gap. No new feature or support reduction is implied by rollout.

### Comprehensive Gate Findings — 2026-10-09

- `npm run verify:all` stopped at audit: **10 findings (8 high, 2 moderate)** in the unchanged development dependency tree. `npm audit --omit=dev` reports **zero**. Affected roots include brace-expansion 5.0.9, braces 3.0.3, postcss-selector-parser 6.0.10/7.1.4, and source-map-js 1.2.1. Do not treat a production-only clean audit as a waiver; task 5.2 remains incomplete. Separately authorized maintenance must review upgrades/overrides rather than blindly accepting suggested breaking OpenSpec/typography downgrades. BL-072 records this readiness concern, explicitly including the current BL-082 closure blocker.
- Ran the remaining gate chain separately without altering dependencies: check/lint, **256 unit tests**, coverage (**81.76% statements / 67.88% branches / 82.93% functions / 85% lines**), app/static-Storybook builds, and **105 Storybook tests** passed. Builds retain the static-adapter fallback overwrite notice and Storybook chunk-size advisory.
- The first full cross-browser pass found **2 failures**, **252 passes**, **25 intentional skips**, and **13 serial tests not run after failures**; these are not a successful full run. Mobile continuous scrolling still asserted a page input that is intentionally hidden behind Page tools; changed it to the persistent page indicator. WebKit's More menu was genuinely outside the viewport after deep sheet scrolling; the shared menu now activates its viewport fallback only for measured offscreen native placement. No force-click or browser-specific skip masks the defect.
- The two affected cases subsequently passed in WebKit and Mobile Chrome (**4 passes**). Shared-menu Escape/reopen checks and the complete remaining gate chain are rerun after the correction; final results are recorded below. Temporary geometry logging was removed. Svelte autofixer reports no issues; the pre-existing action-to-attachment suggestion is unrelated to this correction.

### Final Automated Rerun — 2026-10-09

The following chain passed after the shared-menu correction, without concurrent source edits:

```sh
npm run check && npm run lint && npm run test && npm run test:coverage && npm run build && npm run build-storybook && npm run test:storybook -- --run && npm run test:e2e:all && npm run test:perf
```

- Diagnostics: **0 errors / 0 warnings**; formatting/ESLint clean.
- Unit contracts: **256 tests / 38 files passed**, including the coverage run. Final coverage: **81.54% statements, 67.61% branches, 82.93% functions, 84.74% lines**. This Node-suite coverage does not include Playwright's browser interaction coverage of the menu fallback.
- Production and static Storybook builds passed; existing fallback-page and Storybook chunk-size notices remain non-failing.
- Storybook render/accessibility checks: **105 tests / 39 files passed**; no new stories or play functions.
- Full application matrix: **265 passed / 27 intentional skips / 0 failed / 0 not run**, using the pinned Playwright projects Chromium, Firefox, WebKit, and Mobile Chrome. The skips are existing project boundaries: 5 Chromium, 7 Firefox, 7 WebKit, and 8 Mobile Chrome. Phone-only checks run in Mobile Chrome; desktop-only collection/resize, Chromium-owned keyboard/persistence, and desktop Git-revision-link checks run in their intended projects. No rollout skip was added.
- Chromium performance: **1 passed**, meeting the existing >=55 average FPS and <=5% over-33.3ms interval budgets. This measures the closed-reader sheet baseline, not physical-phone PDF performance or Firefox/macOS paint correctness.
- Strict OpenSpec validation: **21/21 passed**; diff whitespace checks passed after documentation cleanup. No manifest/lockfile changes, no audit waiver, no physical Android claim. The full `verify:all` command remains blocked at audit as documented above.

### Final Integrated Human Spot-Check

Use the normal LAN sheet URL, with no proof parameters; no new Storybook proof is required for the main workflow.

- **iPhone, Rules:** Find `armor`, select a result, collapse/reopen results, and return between Find/Outline/Page tools and the document. Confirm no stream error, stuck progress, lost reading context, or trapped keyboard. Prior positive device feedback remains evidence; this spot-check confirms normal entry after flag removal.
- **Sheet note:** From Current HP's notes action, start a disposable note, choose the local SRD/page 8, open it in-app, and return with Back. The unsaved note must remain; cancel it afterward.
- **Desktop, deeply scrolled sheet:** Open Rules → More. Its actions must remain reachable; on engines with broken native anchoring the menu may use the viewport-edge fallback. Check click-away/Escape, reopening, and Browse resources. Navigate the sheet beside the reader, then Close: the current sheet section and scroll position must remain unchanged.

Final approval was subsequently recorded below; prior proof approval alone did not close task 5.3. Audit remediation and resolution of the post-maintenance verification findings remain independently required before claiming all gates clean or archiving.

- Physical-phone proof gate: **approved 2026-10-09, including explicit permission to roll out without physical Android testing**. Required targets must still support in-app reading/Find. No fallback-only baseline reduction or guessed device evidence.
- Final integrated review: **approved 2026-10-09**, with separate authorization for dependency maintenance; no security exception approved.
- Follow-ups: reconciled into [docs/backlog.md](../../../../docs/backlog.md). BL-072 owns subsequent matrix rehearsal and the explicitly accepted physical-Android/version-evidence gap. Session resume, in-PDF highlights, and the latent duplicate-history annoyance trigger remain separately backlogged; none is silently implemented here.

### Authorized Dependency Maintenance — 2026-10-10

- Updated brace-expansion **5.0.9 → 5.0.12**, source-map-js **1.2.1 → 1.2.2**, and both postcss-selector-parser copies **6.0.10 / 7.1.4 → 7.1.6**. No application source or test changes. The [bounded override decision](../../../../docs/decisions/2026-10-10-bound-development-security-overrides.md) records the typography parser compatibility trade-off and removal trigger. Unrelated candidate picomatch updates were reverted before verification; broad deduplication was previewed, not applied.
- `npm ci --ignore-scripts` succeeded from the updated lockfile. `npm run verify:all` still stops at **6 high findings**, all from the unpatched braces advisory and its dependent packages. `npm audit --omit=dev`: **0 findings**. No audit threshold, suppression, forced downgrade, or security exception was introduced.
- `npm ls picomatch postcss-selector-parser` independently reports an existing optional-peer mismatch: svelte-check's fdir requests picomatch 3.x/4.x but resolves 2.3.2. The unchanged staged baseline contains the same placement; a clean install reproduces it. This is not an additional advisory or a demonstrated svelte-check failure. BL-072 records the follow-up.
- Ran all remaining comprehensive gates separately: diagnostics **0 errors / 0 warnings**, formatting/ESLint clean, **256 unit tests / 38 files** passed, coverage **81.54% statements / 67.61% branches / 82.93% functions / 84.74% lines**, production/static-Storybook builds passed, **105 Storybook checks / 39 files** passed. Existing build notices remain unchanged. The production app stylesheet SHA-256 remained `f71b76d5cb25f2d03789911ce747a4a71d64c9a2d5d07e85fb7475b9c06959db` before/after the parser update; this is bounded CSS evidence, not complete semantic equivalence.
- Restarted the stale LAN dev server with fresh dependency optimization before the browser matrix. No concurrent source edits or builds occurred during browser verification.
- Full browser matrix: **261 passed / 1 failed / 27 intentional skips / 3 not run**. WebKit failed the resize-dismissal scroll assertion described below; three subsequent serial reader tests were not run. Do not describe this as a green matrix.
- Without modifying source or assertions, repeated the entire WebKit reader suite three times: **24/24 passed**, including all three repeats of the failed case and all previously unrun cases. This demonstrates intermittency, not a fix or proof that the dependency update caused/did not cause it.
- Ran the Chromium performance gate separately after the failed matrix stopped the chained command: **1 passed**, enforcing the existing >=55 average FPS / <=5% over-33.3ms interval budgets. No new physical-device or Firefox paint claims.
- Strict OpenSpec validation: **21/21 passed**. Your integrated approval remains recorded; task 5.2 and archival stay open for the audit and intermittent browser finding.

#### Intermittent WebKit Resize-Dismissal Scroll Failure

- Automated reproduction: `npx playwright test tests/referenceReaderProof.smoke.spec.ts --project=webkit --workers=1`. The failure appeared during the full matrix, not the subsequent three repetitions of this file.
- Equivalent interaction: at a 1440 × 1000 viewport, open the Classes reference and wait for page 8 selectable text; navigate the background sheet to Inventory / Equipment, scroll another 130 pixels until the Classes reference invoker is offscreen, then focus **Resize or close rules reference** and press **Home**.
- Expected: reader closes; focus returns to the reference invoker without changing the sheet URL or scroll position. Observed once: the URL and focus assertions passed, but scroll position changed from **2972 to 0** and remained wrong for the five-second assertion window. No physical Safari reproduction has been established.
- Original local evidence is retained in `test-results/referenceReaderProof.smoke-2c936-erence-invoker-is-offscreen-webkit/trace.zip` and its `error-context.md`. These are ignored diagnostic artifacts, not archived evidence; the durable observation is recorded here. Reruns used `--output=test-results/dependency-followup` and performance used `--output=test-results/dependency-performance` to preserve that trace.
- Next investigation should distinguish keyboard focus/scroll caused while focusing the separator from dismissal/unmount or delayed native focus restoration. No retry, sleep, looser assertion, skip, or UI workaround was added. BL-082's backlog entry and task 5.2 retain this as an unresolved closure concern.

#### Approved Scroll Diagnostics — 2026-10-10

- Read-only follow-up first ran the unchanged resize regression **15 times in WebKit: 15 passed**, retaining traces in `test-results/scroll-investigation`. The original trace has scroll 2972 immediately before the combined press and 0 afterward, but Playwright's combined press also focuses the separator; it cannot establish which substep moved the sheet.
- With owner approval, expanded the existing test into three black-box paths: original combined Home press, explicit handle focus followed by separate keydown/keyup, and Close-button clicking with the same offscreen invoker. The split path independently asserts that handle focus preserves scroll. All paths retain the exact final scroll, URL, closure, and invoker-focus assertions.
- Each path attaches `reader-scroll-diagnostic` JSON in a finally block, bounded to 100 samples. It records phase/time, scroll position, accessible focus/target identity, reader presence, keyboard key, and event cancellation; capture listeners are removed afterward. There is no production instrumentation, native method override, added sleep/retry, relaxed assertion, or browser-specific workaround. Instrumentation and split commands can perturb timing; the combined path is retained as a comparison, not claimed to be timing-identical to the original uninstrumented run.
- An initial **30/30 WebKit comparison run** passed (`--grep 'resize dismissal' --repeat-each=10 --trace=on --output=test-results/scroll-checkpoints`). That draft's capture-queued microtask ran before the application handler and was incorrectly named after-dispatch; it is not evidence that cancellation failed. Replaced it with distinct bubbling/after-bubble observations, and corrected the diagnostic window's TypeScript type before final validation.
- With the final instrumentation, the **entire WebKit project passed: 68 passed / 7 existing intentional skips / 0 failures / 0 not run**, including all three dismissal paths (`--project=webkit --workers=1 --trace=on --output=test-results/scroll-checkpoints-full`). The corresponding paths in Chromium, Firefox, and Mobile Chrome also passed **9/9** (`--grep 'resize dismissal' --workers=1 --trace=on --output=test-results/scroll-checkpoints-engines`). No production changes or concurrent edits were made during these runs.
- In the inspected final WebKit combined-Home attachment, handle focus preserves 2972; the reader is removed and Classes regains focus before the keydown reaches the window bubbling listener; keydown is **defaultPrevented: true**; keyup reaches Classes, and scroll remains 2972 throughout. This establishes the successful event sequence, not the failed sequence's cause. It does not justify a blanket scroll reset or extra key cancellation.
- `npm run check`: **0 errors / 0 warnings**; `npm run lint` and diff whitespace checks passed. This diagnostic-only revision does not rerun unit coverage, builds, Storybook, audit, or performance; their dated maintenance evidence and outstanding audit findings remain above. The final test changes are checked across all four browser projects, with the complete WebKit project specifically exercising preceding suite activity.
- **Conclusion:** the original failure remains unexplained, not fixed or waived. Keep the diagnostic attachments for the next full-matrix occurrence; inspect the first changed scroll sample against focus, keydown cancellation, keyup, and reader removal before proposing a lifecycle fix. Once a cause is reproduced and protected by a deterministic regression, remove temporary diagnostic logging while retaining appropriate behavioral coverage. Task 5.2 remains open; no new human proof is requested for test-only instrumentation.

#### Owner Acceptance of Recurrence Monitoring — 2026-10-10

The owner reports: “i haven't observed it in manual testing either. I'm alright moving on from this and just keeping tabs for when it pops up again.” This explicitly accepts deferring further scroll investigation and removes this finding as a BL-082 closure blocker. It does not establish a fix, erase the original failed run, weaken the scroll-preservation requirement, or waive the independent dependency audit.

BL-072 in [the backlog](../../../../docs/backlog.md#harden-the-three-system-external-playtest-matrix) owns the follow-up after BL-082 archival. Resume investigation on any owner/player report of a reader-close jump or a new automated recurrence. Record browser/OS, dismissal method, source and sheet location; inspect `reader-scroll-diagnostic` alongside the trace to locate the first scroll divergence. Keep the existing strict tests and diagnostic attachments; no skip, retry, or production workaround is authorized by this acceptance. No additional manual proof is requested now.
