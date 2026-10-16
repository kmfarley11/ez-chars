# BL-086 Review and Verification

## Status

- 2026-10-11: Apply started; ownership/coverage inventory is in [inventory.md](inventory.md). Broad migration and retirement remain gated.
- 2026-10-12: Pre-proof batch 1.1–1.8 complete (8/23 tasks). Paused at task 2.1 for human review; no broad migration or old-proof retirement has begun.
- Composition/catalog proof approval: explicitly approved on 2026-10-12; task 2.1 complete. Broad rollout authorized; final review remains separate.
- Final integrated approval: explicitly received 2026-10-16, including archival authorization.

### 2026-10-14 strategic review follow-through

- Accessibility report enforcement now respects the addon's explicit component-only mode. Canonical story metadata no longer overrides the runner's audit selection; ordinary CLI runs still require audits. The setup uses the pinned addon's `storybook/test-provided` run configuration key, which should be checked when upgrading Storybook.
- Dense Collections and Runtime Actions Canvas introductions explicitly identify their retained whole-record Detail/Edit fallback. Canonical Pages remain the current independent-save examples; no production workflow was changed.
- Removed the obsolete component-local runtime-action-rows re-export and updated all consumers to the domain helper. Corrected the maintainer guide's storage location to `src/lib/storage/`.
- Catalog lifecycle regression: after an HP edit, open Rules, enable rejection, and Reset. The reader closes and rejection resets; reopening and closing still work. The test asserts unchanged iframe URL/history length and unchanged sentinel application character storage. All six catalog checks passed across light/dark preferences in 11.3 seconds. Fixture switching with a modal open remains manual coverage.
- Explicit component-only mode passed five checks across Badge and canonical Character Sheet stories in 3.69 seconds, with only 271ms in test bodies. This is distinct from the standard accessibility-enabled gate.
- `npm run verify:smoke` passed after all review fixes: diagnostics 0 errors/warnings, lint clean, 266 unit tests, Chromium 70 passed / 5 intentional skips, and all 111 catalog render/accessibility checks passed. The default audit-report guard remains enforced. No application behavior, schema, fixture contents, dependencies, or audit rules changed.
- Production and static Storybook builds passed with the existing build notices. Strict change validation and diff checks passed. Review refinements remain unstaged and final task 4.4 remains pending; no archival was performed.

To reproduce the component-only runner check without changing repository configuration (the normal CLI has no `--provide` option):

```bash
STORYBOOK_TEST=1 node --input-type=module -e 'import { startVitest } from "vitest/node"; const ctx = await startVitest("test", ["src/lib/ui/atoms/badge.stories.ts", "src/lib/systems/dnd5e-2014/pages/character-sheet.stories.ts"], { project: ["storybook"], run: true, provide: { "storybook/test-provided": { a11y: false } } }); if (!ctx) process.exitCode = 1; else { if (ctx.state.getFiles().some(file => file.result?.state === "fail")) process.exitCode = 1; await ctx.close(); }'
```

This supplements [tasks.md](tasks.md). The rollout and final owner review are complete; this archived record preserves evidence and accepted limitations. [inventory.md](inventory.md) preserves the original mapping and records delivered destinations and retirement evidence.

## Minimal Proof Sandboxes

| Intended catalog destination                     | Distinct purpose                                                                                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design System / Organisms / Read-first Detail    | Small generic composition: independently saved edits, derived context, optional notes, dirty-work handling, and controllable rejection. Reuse/adapt an existing suitable sandbox. |
| Systems / D&D 2014 / Character Sheet / Saturated | Full production composition with isolated canonical data; demonstrates real density, shared domain bindings, reset, and host boundaries.                                          |

After proof approval, add Bryltin and Zindra canonical Pages. Reuse the inventory's closest existing runtime-field, collection, and navigation sandboxes for the remaining use cases; add fixtures only for distinct states or compositions. Retain the explicitly deferred Collection Organizer under Concepts.

### Final rollout review links and interactions

Current generic tier titles (existing links below remain stable): **Edit-first (Tier 1 Field)** under Molecules, **Read-first Detail (Tier 2 Field)** and **Collections (Tier 3 Field)** under Organisms. Collections reuses the existing generic Dense/Sparse/Empty/NoMatches/AnnotatedLongContent sandboxes; it is not the deferred organizer or the 2014 SupportingCollectionView. Its small editor demonstrates row callbacks; domain-specific creation/removal remains in system examples.

2026-10-13 tier-discovery refinement: consistent tier names now appear in both sidebar titles and Canvas headings, with explicit stable story IDs preserving existing URLs and browser checks. Diagnostics and lint passed; all 42 catalog files / 111 accessibility/render checks passed. An initial wrapper heading change skipped the nested list heading level; restoring the wrapper's original h2 resolved the audit failure without changing production markup or audit rules. Strict change validation and diff checks passed. This is a naming/guidance revision, not new collection-management behavior.

- **[Edit-first Fields (Tier 1) / Default](http://localhost:6006/?path=/story/design-system-molecules-edit-first-fields-tier-1--default):** Edit/confirm/cancel, try Escape and notes, then use Controls for text versus number. Reuse Annotated for existing notes and phone widths. Quiet Affordance is a primitive variant, not the Tier 2 workflow.
- **[Table / Composition](http://localhost:6006/?path=/story/design-system-molecules-table--composition):** Inspect wrapping at phone width, tab to Select, and confirm the selected-row status. CharacterList remains the integration example for mobile cards.
- **Canonical Canvas responsiveness:** Try editing Saturated immediately after load. Accessibility scans are now on-demand here; run Accessibility → Run test separately. Automated catalog checks still audit all stories. Shorter system section names use the same system-owned production components. Supporting Collection View explicitly labels its callback-only Add/Open controls; use the canonical Page for full editing.
- **[Bryltin](http://localhost:6006/?path=/story/systems-d-d-2014-character-sheet--bryltin), [Zindra](http://localhost:6006/?path=/story/systems-d-d-2014-character-sheet--zindra), [Saturated](http://localhost:6006/?path=/story/systems-d-d-2014-character-sheet--saturated):** Check familiar content and subgroup headings. Edit HP and a read-first field, pin an item, then Reset. Switch examples while a dialog or Rules is open; confirm the next example starts clean. App characters must remain unchanged.
- **[Read-first Detail](http://localhost:6006/?path=/story/design-system-organisms-read-first-detail--independent-edits):** Check visible values, optional suffix context and paired Quantity/Capacity. Edit one, verify the other stays unchanged; toggle Ready through its labeled detail. Enable rejection and confirm recovery without losing the draft.
- **[GridContentList / Dense](http://localhost:6006/?path=/story/design-system-organisms-gridcontentlist--dense):** Search, pin/unpin, open a row and save/cancel; test long content and phone width. This is generic list presentation, not a duplicate 2014 sheet editor. Sparse/Empty/NoMatches retain their distinct boundaries.
- **[IconButton / Configurable](http://localhost:6006/?path=/story/design-system-atoms-iconbutton--configurable):** Use Controls to compare supported icons/sizes; retain an appropriate accessible label for the selected action.
- **[CharacterList / Responsive](http://localhost:6006/?path=/story/application-characterlist--responsive):** Check desktop table and phone cards, Open/Delete styling, confirmation cancellation and focus return. Shared semantic table primitives must not change the app behavior.
- **[Deferred Collection Organizer](http://localhost:6006/?path=/story/concepts-deferred-collection-organizer--deferred-batch-organization):** Locate the preserved concept; it is not the current app interaction contract.
- **Maintainer walkthrough:** Follow README → component maintenance guide → shared UI/system landing maps. Locate a shared control and its story/test, then the actual sheet composition and its isolated host. Verify the distinction is clear without consulting chat.

Repeat representative sheet and collection checks at phone width; no separate phone-only stories are required. Actual app persistence, browser Back/Forward and storage recovery belong in the app, not the isolated Page hosts.

Direct proof links (after `npm run storybook`):

- [Read-first Detail / Independent Edits](http://localhost:6006/?path=/story/design-system-organisms-read-first-detail--independent-edits)
- [Character Sheet / Saturated](http://localhost:6006/?path=/story/systems-d-d-2014-character-sheet--saturated)
- App parity URL after `npm run dev`: `http://localhost:5173/ez-chars/charsheets/5e?id=char-5e-2014-saturated` (use the actual emitted port if different).

The canonical host rejects all character mutation paths when enabled. Existing Runtime Action creation/resync void callbacks cannot retain/report a recoverable host rejection: creation may close without adding. This pre-existing limitation is disclosed in Canvas and captured in the backlog; it is not a new storage-failure simulation claim.

## Setup

- Start the catalog with `npm run storybook` and open `http://localhost:6006`.
- Start the app with `npm run dev`. Open `/ez-chars/charsheets/5e?id=char-5e-2014-saturated` on the emitted local URL; representative fixture IDs are `char-bryltin` and `char-zindra` when present in the development seed set.
- Use an isolated browser profile/context for automated or disposable fixture testing. Do not wipe or overwrite an owner's saved characters for parity checks. Back up any personally edited app fixture before changing it during manual review.
- For phone review, reuse these sandboxes with Storybook's viewport toolbar. If physical-device review is useful, expose the relevant development server on the LAN and use `http://<development-host-ip>:<port>` from the same network; record actual device/browser evidence separately from viewport simulation.

## Proof Interactions

- **Both proof sandboxes:** Without opening source code or relying on a Docs tab, find the visible provenance, host limitations, and interaction directions. Confirm explanatory content is visually separate from working controls.
- **Read-first Detail:** Find the example without knowing a 5e section name. Open a field by label, edit/save it, then edit a different field and Cancel. Confirm only the saved change persists and the example explains a reusable interaction, not a miniature game schema.
- **Read-first Detail:** Begin a change and navigate away; inspect dirty-work protection. Enable the sandbox's rejected-write option, attempt Save, then recover. Confirm the unsaved work and visible error behave like the production workflow. Review notes and derived context without a separate story for each command.
- **Read-first Detail:** Check Range's italic parenthesized context. Load renders Quantity / Capacity together; each label opens its own highlighted field and saves independently. Change Quantity, then inspect Capacity: it should remain unchanged. Ready's checkbox is a read-only value; its clickable label opens boolean editing. The separate “Reject example saves” checkbox controls the sandbox, not the example data.
- **Both new sandboxes:** Check values, checkbox labels, subgroup headings and borders with light and dark browser preferences. The preview uses the same theme surface as the app, regardless of Storybook's surrounding background. Current HP in Saturated must enter an input, save, and reset—these controls are not layout-only placeholders.
- **Saturated Page:** Compare with the actual app at desktop and phone widths. Inspect Quick Reference, read-first details, Features, Spells, and Runtime Actions. Approved labels, compact presentation, filter/pin behavior, and note controls should agree; no legacy proof-only interaction should appear as the default.
- **Saturated Page:** Edit a field, add/change a note, and pin an item; exercise rejected-save recovery through the host control. Reset the story, switch stories, and return. Confirm canonical data is restored and app-saved characters and other story instances remain unchanged.
- **Saturated Page rejection control:** Check its declared scope against representative runtime patches, group/structured edits, focused value/note edits, collection Add/Remove, and Pin/Unpin. Each covered rejected mutation must leave the character unchanged and retain that interaction's existing failure/draft behavior. Disable rejection and retry. Do not interpret this as a physical localStorage-failure test.
- **Annotation references in the app and canonical Page:** Open a known internal reference through both a field-note control and focused Detail. Return to the note/detail and check focus and draft preservation; verify external references retain their existing behavior. This checks the injected provider beyond the top-level Rules control.
- **Saturated Page host lifecycle:** On desktop, Reset while the non-modal reader is open. With a modal detail open, switch stories and return instead; the background Reset control is intentionally inaccessible inside a modal. Also close a detail normally and Reset. Verify stale dialogs, navigation callbacks, and pending work from the old instance do not affect the new instance or another story. These UI interactions remain pending human review, separate from the pure clone/reset tests.
- **Saturated Page and actual app:** Jump sections, open Rules, move within the sheet, close the reader, and reopen it. Check focus and scroll continuity. Review the visible sandbox host-limits explanation; test actual browser Back/Forward and persistence in the app, not as an inferred Storybook guarantee.
- **Catalog and inventory:** Can you immediately distinguish current generic UI, system-owned actual sheet examples, and deferred concepts? Inspect the proposed retirement map and flag any unique useful sandbox being lost. This decision—not merely whether the story looks nice—is the proof gate.

## Final Integrated Review

- **Bryltin and Zindra Pages:** Confirm familiar canonical content remains intact and each uses actual production layout and editing. Edit one example and reset it; ensure the other example remains untouched.
- **Saturated Page and retained collection sandbox:** Exercise search plus quickfilters, pin/unpin, empty/no-match recovery, and dense scrolling on desktop and phone widths. Use the same story for keyboard, touch, and responsive checks.
- **Actual application:** Open representative and saturated characters, perform runtime and read-first edits, exercise notes and collection changes, reload, and verify persistence. Recheck navigation and Rules interactions after the source migration.
- **Catalog navigation:** Locate shared controls and organisms, system sections/Pages, and Collection Organizer. Confirm descriptions distinguish production defaults from concepts and explain meaningful host limitations.
- **Coverage map:** Review any retained fallback or deferred retirement, its actual production consumer, and corresponding test/story evidence. No count-based story purge should replace this mapping.
- **Maintainer navigation:** Start separately from root README.md and AGENTS.md. Follow the documented paths to a shared control, its story and tests, a system-owned organism, and a canonical sheet example. Confirm the same guide explains kebab-case exceptions, reuse versus extension, ownership, and the checks expected when changing shared UI; no chat history or archived inventory should be necessary for ordinary contribution.
- **Ownership map:** Locate an application-owned control and an intentionally retained domain helper. Confirm their placement and allowed imports are explained without implying they are generic UI or leaving the old and new system trees as unexplained alternatives.

## Verification Ownership

| What is being verified                                                             | Required evidence home                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Domain processing and injected reference resolution                                | Deterministic nearby Vitest contracts                                   |
| Canonical host clone/reset and rejected commits across the declared mutation paths | Pure host-state/commit helper tests in the existing Node Vitest project |
| Actual app focus/navigation, reader lifecycle, and persisted edits                 | Existing black-box Playwright application suites                        |
| Catalog renderability and configured accessibility rules                           | Existing Storybook browser checks                                       |
| Actual story switching, UI reset/cleanup, and visible guidance                     | Named manual proof interactions above; record actual reviewer results   |

Neither the Node unit runner nor the render/accessibility catalog pass establishes client-side story interaction coverage by itself. Record exact tests where a behavior is automated and distinguish manual outcomes and pending checks. No new runner or Storybook `play` assertions are planned; reconcile any later need for sandbox-browser automation before adding it. Keep the existing discovery globs unless a concrete move exposes a discovery problem.

## Automated Evidence To Record During Apply

### 2026-10-11 pre-change baseline

- `npm run verify:smoke`: passed after permitting local server/browser execution. Diagnostics: 0 errors/warnings; lint passed; unit: 38 files / 256 tests; Chromium: 70 passed / 5 project-specific skips; catalog: 39 files / 105 render/accessibility checks. The initial sandboxed attempt stopped at `listen EPERM 127.0.0.1:5173`, not an application regression.
- `npm run build`: passed, including static output. Existing adapter fallback-overwrite notice remains informational.
- Neither run establishes manual story interaction or physical-device coverage.

### Shared editing and app-host extraction

- `npm run check && npm run test`: 0 diagnostics; 39 unit files / 261 tests passed, including shared acceptance, death-save initialization, independent notes, rejected saves, and pin preservation.
- `npm run test:e2e -- tests/characterSheet.smoke.spec.ts tests/sheetNavigation.smoke.spec.ts tests/referenceReaderProof.smoke.spec.ts tests/smallEdits.smoke.spec.ts`: 42 Chromium tests passed after extraction, before adding the canonical story host. Covers persisted editing, landmark history/focus, independent edits, reader close/resize/scroll and dirty-note behavior.

### Injected references and canonical host (2026-10-11–12)

- Reference-provider regression command: `npm run test:e2e -- tests/referenceViewer.smoke.spec.ts tests/referenceReaderProof.smoke.spec.ts tests/smallEdits.smoke.spec.ts` — 35 passed, 1 phone-project skip. Tests cover both annotation surfaces, internal inspection, unsaved drafts, and focus/reader return.
- `npm run check && npm run test` — 0 diagnostics; 41 files / 272 unit tests. New provider tests cover requested page/base-path resolution and unsupported references. Pure canonical-state tests cover clone isolation, reset, rejection/retry of patches, grid edits, focused values/notes, collection Add/Remove, runtime creation, and pins. They do not execute browser story switching.
- Both new sandboxes pass the catalog render/accessibility check. Initial full-sheet runs exceeded the 15-second default; a diagnostic 60-second CLI override completed in about 19 seconds and exposed a heading-order violation. Shared CollapsiblePanel now wraps its existing trigger in an `h2` (same visible control), with a server-render contract. No accessibility rules were disabled.
- Catalog-only timeout is now 30 seconds to accommodate a full-sheet audit; the app E2E, unit runner, discovery globs, and dependencies are unchanged. This is audit duration, not a measurement of player interaction latency.

### Final pre-proof verification (2026-10-12)

- `npm run verify:smoke` — passed: diagnostics 0 errors/warnings; lint passed; 41 unit files / 272 tests; Chromium app suite 70 passed / 5 intentional project-specific skips; 41 catalog files / 107 render/accessibility checks.
- `npm run build && npm run build-storybook` — both passed after the shared heading correction. Existing adapter fallback-overwrite notice and Storybook large-chunk warning remain; no build errors.
- `npx playwright test tests/sheetNavigation.smoke.spec.ts tests/referenceReaderProof.smoke.spec.ts --project=firefox --project=webkit --workers=1` — all 28 tests passed. This is focused cross-browser navigation/reader coverage, not the full cross-browser suite.
- Strict validation of this OpenSpec change and `git diff --check` passed. Comprehensive audit/coverage/performance and final rollout gates remain task 4.2 work; no physical-device or manual sandbox-interaction pass is claimed.

Record dated commands, results, and limitations here. Use [the canonical verification guide](../../../../docs/verification.md); do not infer automation from a manual story walkthrough.

- Pre-change and post-extraction smoke/build results, distinguishing inherited failures from new failures.
- Deterministic contract evidence for extracted domain processing and sandbox clone/reset/write rejection.
- Existing/new black-box application coverage for route navigation, focus, reader behavior, persisted edits, notes, and priority.
- Final diagnostics/lint, tests/coverage, audit, production/static catalog builds, catalog rendering/accessibility, cross-browser application E2E, and performance baseline/comparison.
- Any accepted dependency or platform limitation with its existing backlog owner; a failing aggregate command is not a clean pass even if remaining sub-gates pass individually.

## Human Evidence Log

### Rollout automated evidence — 2026-10-12

- Diagnostics: 0 errors/warnings. Lint passed before final documentation reconciliation; final formatting/lint is recorded below. Unit and coverage runs: 40 files / 266 tests passed. Reported aggregate coverage: 81.70% statements, 67.95% branches, 83.14% functions, 84.82% lines; this is not a claim of equivalent UI interaction coverage.
- Full application matrix: 270 passed, 27 intentional project-specific skips, one Chromium PDF text-layer deadline failure and two interrupted cases. Firefox, WebKit and Mobile Chrome had no failures. A subsequent four-worker Chromium run had three reader/edit failures and 13 interrupted cases; the spell-validation trace showed the expected error before an unexpected navigation and Vite reconnect. Repository writes occurred during these runs, so they were not quiet-server evidence.
- Quiet serialized Chromium rerun (`npm run test:e2e -- --workers=1`): **70 passed / 5 intentional skips**, including every failed/interrupted case. No test assertions/timeouts or PDF implementation were changed to obtain this result. This is successful rerun evidence, not a retroactive clean aggregate claim. Avoid writes/builds during browser checks; the operational guide now states this for app suites too.
- Catalog render/accessibility: **41 files / 110 checks passed**. Opt-in catalog interaction suite: **4 passed in 45.5s**, across light/dark browser preferences; canonical save/reset flows took 20.6/21.3s. Story switching and physical-device ergonomics remain manual checks.
- `npm audit`: the same six high package findings from the single `braces` advisory GHSA-vfj7-8cjw-p6xm. The accepted temporary exception and reassessment trigger remain owned by BL-072; no dependency changes or forced downgrade. `verify:all` cannot be called clean. All remaining required checks are run individually.
- Svelte autofixer found no component issues in the new table primitives, canonical host and revised collection harnesses. Its unused-disable suggestions differ from repository lint treatment; existing TypeScript callback lint directives were retained. Local diagnostics/lint remain authoritative alongside this review.

- Production and static Storybook builds passed. Existing adapter fallback-overwrite and large-chunk notices remain; no build errors.
- Chromium performance baseline passed. Serialized three-sample comparison passed all six runs: Chromium median **60.00 FPS / 0.00% dropped-frame intervals**; Firefox **46.14 FPS / 20.00%**. Firefox is non-gating content-frame cadence, not evidence of physical-device paint/compositor correctness. BL-072 retains the compatibility assessment and headed-profile trigger; no threshold was changed.
- Strategic review found no duplicate production mutation implementation, source fixture content changes, live storage imports in story hosts, remaining `$components` consumers, or shared UI selecting the 2014 resource catalog. Original canonical fixture exports changed visibility only. Retained subsystem catalogs are not imported by generic UI. Source/catalog ownership and retirement evidence are recorded in inventory.md and the maintainer guide.

Final documentation reconciliation: `npm run lint`, strict change validation and `git diff --check` passed. Progress is 19/23; task 4.4 and the three archive-time tasks remain unchecked. The implementation, documentation and automated evidence are ready for owner review; no physical-device or manual story-switching completion is claimed.

### 2026-10-12 proof revisions (approval remains pending)

Owner reported invisible values, an unlabeled-looking checkbox, missing collection borders/subheadings, and apparently inert runtime editing in the two new stories. Reproduce by opening the direct proof URLs above, inspecting Name/Quantity and the rejection checkbox, then Saturated Current HP, proficiency rows and Weapons/Armor headings. Browser preference/background is material: the hosts lacked the application's theme surface and inherited Storybook's foreground while controls used application colors.

Browser investigation found the values in the DOM and successfully exercised focused editing and Current HP save/reset before the style fix. Dark preference reproduced the mismatched foreground/background styling. Both new sandboxes now reuse a story-only app-themed surface; no live binding is intentionally disabled. If any control still appears inert after refresh, record browser, Storybook background, field and click sequence rather than assuming layout-only behavior.

Added generic suffix, paired-independent-field, and boolean examples through existing rendering metadata, and corrected TableHeader's live-consumer classification. Proposed table presentation reuse and explicit system-root wording are in inventory/design/tasks; broader rollout remains behind task 2.1.

Catalog-host regression command: `npx playwright test --config playwright.catalog.config.ts`. Four checks (two flows × light/dark Chromium preference) cover readable inherited foreground, named controls, focused/boolean/paired saves, and canonical runtime save/reset. They do not prove all story switching, phone comfort, arbitrary themes, or every collection command.

Final revision evidence:

- `npm run verify:smoke` passed: 0 diagnostics, clean lint, 272 unit tests, 70 Chromium app tests / 5 intentional skips, and 107 catalog checks. An earlier run overlapped catalog browser work and failed the existing PDF text-layer deadline; the complete sequential rerun passed, including that test. No production PDF changes were made.
- `npx playwright test --config playwright.catalog.config.ts` passed all 4 checks in 45.2 seconds with no concurrent suites or file changes; canonical flows took 20.4 and 21.3 seconds. Earlier 30-second concurrent runs timed out; one intermediate run also timed out during input fill and its trace showed a Vite reconnect. The opt-in suite now uses one worker and a 60-second whole-flow limit, without retries or relaxed assertions. Avoid editing/rebuilding while this dev-server-based check runs.
- `npm run build-storybook` passed; existing large-chunk warning remains. Strict OpenSpec validation, formatting, diff checks and the Svelte autofixer passed. Production build/cross-browser app evidence from the pre-proof batch remains separate; these revisions change story hosts/fixtures and catalog test wiring, not production components.

2026-10-12: Owner approved the revised proof and ownership plan: “ok everything looks great! please proceed”. This approves task 2.1 and unlocks rollout, not final task 4.4 or archival.

Append dated owner feedback, exact sandboxes reviewed, decisions, and explicit gate approvals here. Preserve material repro steps and record any deferred concerns in the backlog as well.

### 2026-10-13 final review refinements

- Applied the approved review recommendations: shorter system component/story names, explicit callback-only sandbox guidance, one composed generic Table example, and visible Tier 1 discovery using the existing primitive-field stories. The maintainer guide and UI README map edit-first, read-first and collection patterns; tiers are not atom/molecule/organism levels.
- Saturated interaction investigation: the prior trace showed a roughly 19-second delay on the second HP Edit click, not initial navigation. Canonical Canvas accessibility scans are now on-demand; the Accessibility panel remains available. Automated runs retain all audits and a new setup guard requires an accessibility report per story.
- Sequential catalog comparison (`npx playwright test --config playwright.catalog.config.ts --trace=on`): all four light/dark checks passed in 7.1 seconds; canonical save/reset flows took 1.7 and 1.5 seconds versus roughly 21 seconds before. This supports automatic axe scanning as the observed interaction blocker, not a production-sheet regression. It does not measure cold-server startup or physical-device performance.
- `npm run verify:smoke` passed: diagnostics 0 errors/warnings, formatting/lint clean, 40 unit files / 266 tests, Chromium 70 passed / 5 intentional project skips, and 42 Storybook files / 111 render/accessibility checks. The new audit-report guard passed for every story, including canonical Pages.
- Svelte review found no component errors. The primitive-field sandbox retains its existing effect that resets editable local state when Controls change; the autofixer's derived-state suggestion was not adopted because the state must also accept independent local saves.
- Production and static Storybook builds passed; existing fallback-overwrite/large-chunk notices remain. Strict change validation and `git diff --check` passed after documentation reconciliation.
- Final human approval remains pending at task 4.4. These refinements remain unstaged; no archival or fixture/schema changes were made. The previously recorded BL-072 dependency-audit exception remains unresolved, so this is not a new clean `verify:all` claim.

### 2026-10-16 final approval and archival

- Owner explicitly approved all changes and requested archival, completing task 4.4. Prior dated pending-review statements remain historical.
- Final strategic review found no remaining blockers. Fresh review checks passed: diagnostics (0 errors/warnings), 40 unit files / 266 tests, 42 Storybook files / 111 checks, and strict change validation. Earlier application, lifecycle, build, cross-browser, and performance evidence remains recorded above; archival does not claim a new full-suite run.
- Synced five added and one modified component-sandbox requirements, preserving unrelated requirements. Runtime Action rejected-write recovery and deferred Collection Organizer remain backlogged; BL-072 retains audit/platform limitations. BL-070 now leads the recommended sequence.
- Changes remain unstaged and uncommitted for owner control.
- Archive validation: affected component-sandbox specification passed strict validation; `openspec validate --all --strict` passed all 20 items. All 23 tasks are complete.
