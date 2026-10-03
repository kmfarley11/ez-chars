# BL-078 Verification Record

## Status

The owner explicitly approved the revised proof and final integrated result on 2026-10-03. Both consumers use the accepted controls on ordinary sheets, with no proof parameter. Final approval (“approved proceed to final stages”) authorizes closure and archival.

This supplemental record owns reviewer instructions and evidence, not normative requirements or a duplicate checklist. See [tasks](tasks.md), [design](design.md), and the [command guide](../../../../docs/verification.md).

## Initial Consumer Audit — 2026-10-02

| Area                    | Existing owner and finding                                                                                                                                                                                                                                           | Planned seam / constraint                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime Action metadata | `src/routes/charsheets/5e/components/runtimeActionRows.ts` projects Action for missing timing, Attack for missing category, and resolved source labels; its search matches all tokens against projected snapshot metadata.                                           | Keep timing labels/matching aligned, retain snapshot search, resolve the category conflict before adding consistent badges.                                                 |
| Runtime Action editing  | `smallEditAdapters.ts` and `runtimeActionEditing.ts` both use Effect for an absent category; `RuntimeActionDialog.svelte` explicitly initializes new custom/source-linked drafts to Effect.                                                                          | Do not infer category from source or overwrite explicit categories. A fallback choice needs owner confirmation because the current list and editor disagree.                |
| Runtime Action browse   | `RuntimeActionsCard.svelte` retains selected identity and browse-return flags; `RuntimeActionsCollection.svelte` owns text search and slices the unfiltered preview. `ResponsiveCollectionView.svelte` owns density, count/empty wording, focus, and focused scroll. | Lift retrieval state above conditional views, filter before preview slicing, retain full-record lookup, preserve other ResponsiveCollectionView consumers.                  |
| Spells                  | `src/lib/dnd5e2014/denseCollectionRows.ts` supplies global alphabetical pins and level/name remainders, Cantrip for absent level, and a Prepared badge only for true.                                                                                                | Preserve ordering; explicit preparation filtering must inspect recorded boolean state rather than search for Prepared, which also occurs in Not prepared text.              |
| Dense browse            | `GridContentList.svelte` previews original rows; `GridContentListView.svelte` filters independently and ignores query when search is disabled. `Dnd5e2014DenseCollectionCard.svelte` owns selected identity and modal return.                                        | Feed shared filtered results/counts into both responsive paths without double filtering or replacing inventory behavior.                                                    |
| Pin schema and adapters | `src/schema/zod/system.5e2014.ts` validates collection membership/duplicates; `src/lib/dnd5e2014/collectionPriority.ts` owns identities and cleanup; Runtime Actions are absent from these collection mappings.                                                      | Add optional action membership and validation, retain acceptance of records without pins, and reuse current comparator/reconciliation behavior.                             |
| Action/source lifecycle | `sheetEditIntents.ts` replaces actions without action-pin cleanup today; `runtimeActionSources.ts` drops broken source links but preserves snapshot identities and stored sequence. Resync preserves action identity.                                                | Reconcile action removal and pin membership atomically; preserve pins when detaching or refreshing a surviving action. Test direct edits as well as intent-based mutations. |

**Resolved decision — owner selected B:** An action without a saved category remains unclassified: no category badge and an unset editor until the user chooses a value. Explicit authored categories are preserved. Verify that opening Detail or changing another field does not silently classify an action.

## Available Sandbox Set

- Existing `Organisms/RuntimeActionsCollection / FiveActionBoundary`: sparse timing controls and no unnecessary bounded scrolling.
- Existing `Organisms/RuntimeActionsCollection / SixActionsDesktopInlineScroll`: mixed timing, pinned/source-linked/custom records, and dense retrieval. Both action sandboxes now use the real Card, small-edit adapters, and validated in-memory mutations instead of mock Edit callbacks. The retained wheel-playtest story adds only its existing scroll runway.
- Existing `Organisms/Dnd5e2014Spellcasting / SaturatedCharacter`: level/preparation composition, global pins, and editable spell detail.
- `Molecules/CollectionQuickfilters / Playground`: system-neutral keys/labels, a long label, text, an additional toggle, and independently resettable controlled state without a character workflow. Select Ready plus the long-label option, type text, toggle Favorites only, reset Status, clear search, then toggle Favorites off. Repeat at phone width and with keyboard activation.
- Ordinary sheet: `/ez-chars/charsheets/5e?id=char-5e-2014-saturated`. For a sparse character, open seeded Theren Vael (`id=char-001`). The former `proof=bl-078` switch is no longer necessary. Existing local changes can alter seeded fixture counts; use a disposable character or export first because real mutation adapters save to local storage.

Start the app with `npm run dev` (port 5173) and the catalog with `npm run storybook` (port 6006). In Storybook Controls, compare `showTimingHeadings` on the action stories. Spell choices now remain visible; the obsolete compact-filter control is removed. One shared-atom sandbox, `Atoms/ChipButton / Variants`, demonstrates controlled selection, reset, and disabled states together; no per-interaction or phone-only stories were added. Source navigation in the isolated action story reports the destination as text; use the real sheet for navigation and source deletion. Resync, Pin, Add, and independent edits use real adapters in both.

New filters and action pins now appear in ordinary application use as well as the sandboxes. Category creation defaults are unchanged; existing absent categories are no longer silently shown as Attack/Effect. Empty collections omit filter controls unless a restriction needs clearing.

## Human Proof Interactions

Use the same sandboxes at desktop and narrow-phone sizes. Repeat touch-critical paths on a physical phone when possible; simulated viewports do not prove physical Safari behavior.

### Runtime Actions — Both Existing Boundary Sandboxes

- Confirm all timing names are readable under “Quick filters: Timing”. Toggle a chip by click, Space, or Enter: selected shading changes, with no checkmark slot, text-width change, or newly inserted reset button. Repeat in light/dark themes.
- Select Reaction, then Action as well. Expect either timing, not a requirement that a record have both. Deselect each; the last deselection restores all timings.
- Enter text while timings are selected. Expect both restrictions to apply. Reset timings without clearing text, then Clear search to restore every record without changing pins. Matching results should have no dedicated Clear all pill; a no-match message still offers that one-click recovery.
- Select a zero-result timing and combine filters with nonmatching text. Expect an accurate zero/total count, stable controls, and easy recovery. A short list must still expose timing choices.
- Pin actions from different timings. Expect matching pins alphabetically first, followed by unpinned timing/name order; changing filters hides excluded pins without unpinning them. Check note/source controls and metadata remain distinct.
- Open a filtered action by name, edit its timing/name so it no longer matches, and close. Expect Detail to remain stable while open, then the same filters and a useful focus destination on return.
- Resync a pinned source-linked action in the sandbox. On the real sheet, delete a disposable source through its existing supported path. Expect the same action and pin to survive as a detached snapshot; deleting the action itself removes its pin.
- Open the first unclassified action in a boundary sandbox. Category should show unset, with no category badge; saving Name must not assign a category. Choose a category explicitly and verify its badge appears.
- Compare timing headings with badges-only: can you scan the All view quickly without spending excessive vertical space? Check duplicate labels do not cause identity or focus confusion.

### Spells — SaturatedCharacter

- Select levels 1 and 2 plus Prepared only, then enter text. Expect only explicitly prepared matches at either level. Disable Prepared only without losing the level or text selections.
- Pin a matching higher-level spell. Expect one alphabetical pinned tier with visible level context and no duplicate in its original group. Filtering it out must not lose its pin.
- Open a filtered spell and change Level or Prepared. Expect its Detail to stay open and its subsequent list membership/count to update without resetting restrictions.
- Confirm “Quick filters: Spell level & preparedness” labels always-visible Cantrip, 1–9, and Prepared only chips. No disclosure, All levels label, or selection-count summary should appear. At phone width, judge wrapping and list space; toggling selections should not change the filter group's height.

### Real Sheet — Required Alongside Isolated Review

- Scan the ordinary sheet at desktop and phone widths. Judge cumulative search/filter/badge density beside navigation and Rules, not just the standalone component.
- Filter on the phone sheet before opening Browse. Expect the preview to show the first matching ordered records, not the unfiltered first five; Browse must preserve the same restrictions and counts.
- Move from Browse to Detail and back, including after renaming/unpinning/removing an item. Expect one logical modal, preserved query/filter state, and meaningful focus even when the row disappears.
- Check keyboard order, clearly named pressed states, non-hover discovery, touch targets, single scroll ownership, no horizontal page overflow, and unaffected inventory/supporting collections.
- Reload or switch characters. Filters should reset; saved pins should remain. Export/import a disposable character and confirm pin/source/note preservation.

## Approval Records

- **Collection retrieval and priority proof:** Explicitly approved 2026-10-03: “otherwise consider this my explicit approval” and “proceed with applying the next batch of tasks.” The requested molecule sandbox was added before rollout; the current timing headings and always-visible spell chips are the accepted baseline.
- **Final integrated post-apply review:** Explicitly approved 2026-10-03: “approved proceed to final stages”. The checks below remain the durable reproduction/review guide; approval does not imply unreported physical-device or assistive-technology measurements.

## Final Integrated Review

Use the ordinary saturated sheet linked above, at desktop and physical-phone widths. Storybook is optional for this gate; the only new sandbox is the system-neutral molecule playground.

- In Runtime Actions, combine Action + Reaction with search. Reset timing must preserve search; Clear search must preserve timing. There should be no permanent Clear all pill, but an impossible search should offer Clear all recovery.
- In Spells, combine two levels with Prepared only and text. Review chip wrapping, selected contrast, and remaining list space. Pin a match, filter it out, then remove the restriction: its pin must survive.
- On a phone, filter before Browse, open a matching record, and edit it so it no longer matches. Back must retain restrictions and return to a useful focus destination. Unpinning a row out of a preview must not strand focus.
- Briefly compare inventory/supporting collections, navigation, and Rules. They should retain their prior interaction and scroll behavior. Reload: filters reset while pins remain.

## Strategic Review — 2026-10-03

- Shared ownership is explicit: ChipButton owns native button/pressed presentation; CollectionQuickfilters owns system-neutral controlled selection, search, and reset layout. Domain helpers own 2014 vocabulary, snapshot search, effective missing values, and stable priority ordering. No route-local chip implementation, badge parser, or new dependency was added.
- Both phone previews and full results consume the same filtered rows, while density derives from total records. Inventory and Supporting Collection text-search defaults remain unchanged. Detail lookup uses full records, so editing an item out of the current result set does not dismiss it prematurely.
- Latest-state validation owns persisted action pins; regression coverage includes inventory, spell, general/class feature, and trait source deletion, resync, action removal, invalid/stale membership, and JSON restore. Runtime action and source priority remain independent.
- Rollout review corrected the stable Add focus fallback when an unpinned action/spell leaves the phone preview. Temporary proof props/banner are removed, and stale Runtime Action priority guidance is reconciled in the interaction model, goals, and ADR.
- Existing follow-up ownership below remains sufficient; no new feature follow-up was introduced. Physical-device comfort and Firefox paint quality are not claimed by automated evidence.

## Automated Evidence

2026-10-03 integrated rollout evidence:

- Routine smoke: diagnostics **0 errors / 0 warnings**, formatting/ESLint clean, **35 unit files / 241 tests passed**, Chromium **59 passed / 5 intentional skips**. The separately confirmed Storybook run passes **39 files / 105 checks**, including the molecule playground. No play functions added.
- `npm run build` and `npm run build-storybook`: passed. Existing large-chunk warnings and the static adapter's fallback/index overwrite notice remain non-blocking; this is not a warning-free build claim.
- `npm run test:coverage`: passed; **81.8% statements, 67.66% branches, 83.16% functions, 85.14% lines**.
- Named Mobile Chrome accessibility plus collection-quickfilter checks: **8 passed**. Corrected legacy collection cases across all browser projects: **8 passed / 4 intentional skips**.
- The first full matrix exposed two stale phone test assumptions: search previously replaced Browse rather than coexisting with it, and Browse kept an unfiltered label after returning. Assertions now cover the accepted matching count, retained query, and focus. Runtime preview counts exclude timing headings rather than count them as action records. A separate Chromium search check encountered an unexpected dev-page reload during overlapping verification/document reconciliation; its isolated cross-browser rerun passed. The final uninterrupted matrix below confirms those corrections without remaining failures.
- Final `npm run test:e2e:all`: **229 passed / 27 intentional project/viewport skips**, across Chromium, Firefox, WebKit, and Mobile Chrome. No retries or relaxed timeouts were added. Formatting/ESLint passed again after the test updates.
- `npm run test:perf:compare`: **6 passed**, three serialized samples per engine. Chromium median **60.01 FPS / 0% dropped-frame intervals** meets the existing gate. Firefox median **46.16 FPS / 15% dropped-frame intervals** remains comparative only; the prior local report (2026-10-01) measured **46.16 FPS / 20%**. Chromium was previously **60.00 FPS / 0%**. This offers no new cadence-regression signal, but is neither a paint-quality conclusion nor proof of a meaningful Firefox improvement. The ignored local report is `performance-results/scroll-frame-comparison.json`; BL-072 retains headed/browser-platform follow-up ownership.
- `openspec validate --all --strict`: **20/20 passed**. No dependency manifests changed, so no dependency gate was triggered.

2026-10-03 revised chip proof evidence:

- `npm run verify:smoke` passed: Svelte diagnostics **0 errors / 0 warnings**; formatting and ESLint clean; Vitest **35 files / 236 tests passed**; Chromium **57 passed / 5 existing project-specific skips**; Storybook **38 files / 104 checks passed**, including the new shared atom sandbox. No Storybook play functions added.
- `npx playwright test tests/collectionQuickfilters.smoke.spec.ts --project="Mobile Chrome" --workers=1`: **3 passed**. The revised tests cover label presence, Space/Enter toggling and pressed state, stable selected chip/group dimensions, always-visible spell choices, 44px coarse-pointer targets, and existing retrieval/detail/pin contracts.
- Initial browser checks failed because text selectors matched both visible and hidden responsive headings. Selectors now require the visible heading; the clean runs above include the correction. This was test ambiguity, not duplicate visible controls.
- `openspec validate bl-078-add-collection-quickfilters --strict` and `git diff --check` passed. Svelte MCP reported no component issues; existing identity-reset effects and repository-specific lint suppressions retain the rationale recorded below.
- The prior missing-label appearance has not been reproduced independently. Chips now supply explicit themed text/background via BaseButton rather than inherit surrounding text color; human review should confirm timing labels and selected shading in both light/dark themes.

2026-10-02 proof evidence:

- `npm run verify:smoke` passed: Svelte diagnostics **0 errors / 0 warnings**; formatting and ESLint clean; Vitest **35 files / 236 tests passed**; Chromium **57 passed / 5 existing project-specific skips**; Storybook **37 files / 103 checks passed**. No Storybook play functions were added.
- `npm run test:e2e -- tests/collectionQuickfilters.smoke.spec.ts --workers=1`: **3 passed**. Verifies timing OR with text, resets, pin focus/reload persistence, filtered phone previews, edit exclusion with retained Detail and focus recovery, and ordinary-route opt-in isolation.
- `npx playwright test tests/collectionQuickfilters.smoke.spec.ts --project="Mobile Chrome" --workers=1`: **3 passed**, including 44px checkbox-label geometry and no horizontal page overflow. This is emulated coarse-pointer evidence, not physical iPhone evidence.
- `openspec validate bl-078-add-collection-quickfilters --strict` and `git diff --check` passed.
- Svelte MCP checked all changed components. No compiler issues were reported. Existing repository-specific ESLint suppressions were retained; the identity-reset effects intentionally manage mutable session input rather than deriving it afresh on every record edit.

The initial sandboxed browser run could not bind Vite's local port (`EPERM`); authorized execution outside that restriction passed. An early run overlapped formatting/HMR and was discarded. Subsequent failures were test-selector mismatches (hidden responsive duplicates and the existing accessible label including authored detail), corrected before the clean runs. No unresolved application failure remains in this proof batch.

Physical Safari scrolling, screen-reader comfort, and visual density remain human review; passing automation does not approve them. Performance cadence measures the existing representative sheet fixture, not exhaustive saturated-filter interaction or compositor paint quality.

Planning checks (2026-10-02): strict change validation passed; all strict OpenSpec validation passed 20/20. These validate artifact structure, not implemented behavior.

## Follow-Up Ownership

Closure phase: approved cleanup and archival at **Medium** reasoning (moderate), per the phase table in tasks.md. Final user approval was received 2026-10-03; the remaining follow-ups below do not block this accepted baseline.

- BL-082 owns broader phone rules-reader refinement; BL-072 owns browser/platform and Firefox paint-quality evidence.
- The backlog's collection-facet/badge exploration will own possible category/source facets, badge shortcuts, and explicit unprepared filtering, triggered only by retrieval evidence after the approved baseline. These are not implicit proof or rollout scope.
- Existing responsive-density and theme-mode ideation remains separate. Do not use this change to redesign the full sheet or shrink required touch targets.

## Closure — 2026-10-03

- Final human approval is recorded above; all 25 tasks are complete. Archived as `2026-10-03-bl-078-add-collection-quickfilters` with the original delta operation headings preserved.
- Synced collection-priority-management, dense-collection-interaction, and runtime-action-inference into their durable main specs, preserving unrelated requirements. The CLI's initial scenario-omission safeguard rejected approved scenario renames without changing files; the reviewed blocks were merged directly, individually validated, and then archived with `--skip-specs` to avoid applying them twice.
- Strict validation passed for each affected main spec and for all **19/19** remaining main specs after archive. The active change list is empty. External relative links were repaired; current goals, interaction guidance, ADR reference, accessibility audit, and vision sequence now reflect completion.
- Removed only the completed BL-078 queue/catalog entry and the oldest Done Recently summary, retaining five recent completions. Detailed context remains in this archive and Git history. BL-082 is next; the follow-ups above retain their existing backlog homes.
- Suggested commit: `feat(collections): add quickfilters and Runtime Action pins (BL-078)`. Archive changes remain unstaged; staging and committing remain with the owner.
