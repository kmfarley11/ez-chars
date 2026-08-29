# BL-075 Verification and Human Review

Last reconciled: 2026-08-29

This supplemental record preserves reproducible verification and review evidence for `bl-075-stable-collection-priority`. Behavioral requirements remain in the delta specs, technical decisions remain in `design.md`, and completion state remains in `tasks.md`.

## Review Status

- Automated gates: passing at the latest recorded runs below.
- Supporting Collection keyboard traversal and visible focus on Card actions and Save Pins: owner verified on 2026-08-29.
- Final post-apply phone/desktop, persistence, JSON recovery, and round-trip result: owner approved on 2026-08-29; task 7.1 complete.
- Runtime Actions: intentionally excluded from priority management; action-economy navigation remains tracked separately as `BL-078`.
- Globally pinned spell discoverability: accepted for this MVP with an evidence-dependent follow-up in the [backlog Ideation Sandbox](../../../../docs/backlog.md#raw-human-ideation-unsorted).

## Storybook Sandboxes and Manual Interactions

Use the smallest applicable sandbox below rather than creating a story for each interaction. Start Storybook with `npm run storybook`, select the named story, and use the viewport toolbar when a phone review is requested.

The Supporting Collection sandboxes are defined in [SupportingCollectionView stories](../../../../src/routes/charsheets/5e/components/SupportingCollectionView.stories.ts). The inventory and spell sandboxes are defined in [D&D 5e 2014 Dense Collection Card stories](../../../../src/routes/charsheets/5e/components/Dnd5e2014DenseCollectionCard.stories.ts).

### Supporting Collections

- `SevenFeatureBoundary`
  - Confirm seven compact rows render without search.
  - Open Card actions → Manage Pins and confirm the short manager also omits search.
  - Change a checkbox, Cancel, reopen, and confirm the draft was discarded.
  - Repeat with Escape and confirm visible focus returns to Card actions.
- `EightFeaturesDenseBoundary`
  - Confirm the eighth row activates dense search and bounded or focused presentation.
  - Enter a query, open Manage Pins, and confirm the query is retained.
  - Using only Shift+Tab, Enter, and Tab, traverse Search Features, Card actions, Edit, Notes, Manage Pins, the checkbox rows, Cancel, and Save Pins; confirm visible focus throughout.
  - Save one change and confirm focus returns visibly to Card actions.
  - Switch to a phone preset; confirm seven preview rows plus Browse all 8 items, then confirm the focused view and manager require neither horizontal scrolling nor a precision pointer and provide comfortable checkbox-row and dialog-action targets.
- `EighteenFeaturesSaturated`
  - Confirm ten alphabetized pinned entries precede every reachable unpinned entry.
  - Filter for `feature summary 1`, open Manage Pins, and confirm the query and subset are retained.
  - Change a visible draft Pin, clear the manager query, and confirm hidden draft state remains intact.
- `EighteenFeaturesPageScrollRunway`
  - Center the collection and continue scrolling with the pointer inside its bounded results.
  - Confirm the inner results scroll while content remains and page scrolling resumes at the collection boundary.
  - Repeat with a phone preset and confirm the same handoff remains usable.
- `LongFeatureContentAcrossViewports`
  - At desktop width, confirm the long row wraps without horizontal scrolling.
  - Switch to a phone preset and confirm the compact preview truncates the long row and offers Browse all 8 items.
  - Open Browse all and confirm the complete row wraps without horizontal scrolling.
- `ShortLanguages`
  - Confirm Elvish has a quiet pinned marker while preserving compact row grammar and source context.
  - Open Manage Pins, confirm all three languages are available without search, and use Tab and Space to change and save the draft with visible focus return.
- `EmptyFeaturesPriority`
  - Confirm the compact empty state and Edit/Notes actions remain, while Manage Pins is omitted.
- `DuplicateNamePriority`
  - Confirm the pinned Arcane Recall precedes its identically named peer.
  - Use authored detail to distinguish the identities in Manage Pins, save one change, and confirm the intended record changes.
- `InvalidSaveRetainsDialog`
  - Change a draft checkbox and choose Save Pins.
  - Confirm the dialog remains open, announces the understandable validation message, and retains the draft.
  - Change another checkbox and confirm the stale message clears before retrying.

### Inventory and Spells

- `Default`
  - Confirm pinned Longsword precedes the alphabetical unpinned Weapons tier.
  - Pin and then unpin Dagger through its row actions; confirm ordering, state-sensitive command text, and visible focus restoration to the same identity-owned row action.
  - Use Manage Pins to save a batch change and confirm focus returns to Manage Pins.
- `Empty`
  - Confirm the empty state and Bulk Edit remain available while Manage Pins is omitted.
- `OtherGearFilteredUnlimitedPins`
  - Confirm duplicate Rope rows remain distinguishable, the active query is retained in Manage Pins, and clearing it reveals all seven selected Pins beyond the five-row phone preview limit.
  - Save a change and confirm filtered context and focus are preserved.
- `InvalidInventoryPrioritySave`
  - Attempt an immediate row-menu Pin and confirm the validation alert appears without reordering and focus returns to that row action.
  - Attempt a batch Save Pins and confirm the alert remains in the open dialog without a partial commit; changing the draft clears the stale alert.
- `SpellPriorityAcrossLevels`
  - Confirm one Pinned spells tier contains Fireball and Teleport alphabetically with visible level/preparation context.
  - Confirm every other spell appears exactly once under its cantrip-through-ninth-level heading and alphabetically within that level.
  - Pin and unpin Magic Missile through its row menu; confirm it moves between the global tier and first-level group with visible focus restoration.
  - Confirm one Manage Pins workflow and search context span all spell levels.

## Saturated Character and JSON Review

Use the Saturated Playtest Adventurer in the running application on desktop and a phone-sized viewport.

- Confirm Supporting Collections, all three inventory groups, and Spells preserve their collection-specific row grammar while sharing recognizable Manage Pins language.
- Confirm pinned entries reach compact previews, every remaining entry stays reachable, and no collection introduces horizontal page scrolling.
- Confirm equipment and spell row menus expose state-sensitive Pin/Unpin while Supporting Collections keep quiet markers and collection-level management.
- Search a dense Supporting Collection, inventory group, and Spells; manage Pins without losing the active query or hidden draft membership.
- Reload after saved Pin changes and confirm the same membership and canonical ordering return.
- Export JSON with Pins, retain the download as the recovery source, make different Pin changes, restore through the supported JSON replacement flow, and confirm identities, Pin membership, annotations, authored content, and ordering return semantically unchanged.
- Confirm Runtime Actions retain their existing authored order and do not imply that priority management applies.

## Automated Evidence

Canonical command descriptions live in [docs/verification.md](../../../../docs/verification.md).

| Date       | Command                                                        | Result                                                                               |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2026-08-28 | `npm run verify:smoke`                                         | Passed: 130 Vitest tests, 17 Chromium tests, 4 expected skips, and Storybook checks. |
| 2026-08-28 | `npm run test:e2e:all`                                         | Passed: 62 browser tests with 22 expected project-specific skips.                    |
| 2026-08-28 | `npm run check`                                                | Passed with 0 Svelte errors and 0 warnings.                                          |
| 2026-08-28 | `npm run lint`                                                 | Passed formatting and ESLint checks.                                                 |
| 2026-08-28 | `npm run test:storybook -- --run`                              | Passed after story consolidation: 29 files and 123 stories.                          |
| 2026-08-28 | `openspec validate bl-075-stable-collection-priority --strict` | Passed.                                                                              |
| 2026-08-28 | `openspec validate --all --strict`                             | Passed: 15 items and 0 failures.                                                     |
| 2026-08-28 | `git diff --check`                                             | Passed.                                                                              |

## Material Reproduction Records

### Supporting Collection keyboard focus — resolved and owner verified

1. Open `EightFeaturesDenseBoundary`.
2. Focus Search Features and use only Shift+Tab, Enter, and Tab to reach Card actions and its Edit, Notes, and Manage Pins commands.
3. Open Manage Pins and continue through checkbox rows, Cancel, and Save Pins.
4. Save or dismiss and inspect the restored collection control.

Expected and verified result: Card actions and Save Pins expose evident focus styling, dialog traversal is logical, and focus returns visibly to the invoking stable action after Save, Cancel, or Escape.

### Storybook proof dialogs rapidly opening and closing — resolved

Previous automated Storybook `play` functions exercised transient dialog states immediately during story rendering, which made the catalog distracting for human inspection. BL-075 stories now provide stable initial sandboxes with their interaction instructions in story descriptions and this record; repeatable application behavior is covered by Vitest and Playwright instead.

## Human Approval Record

- Post-apply approval: **Approved by the owner on 2026-08-29**.
- Approval statement: “alright we're good, i approve of the latest please finish the apply changes workflow for the rest of the tasks”.
- Reviewer notes: Supporting Collection keyboard fixes and the final BL-075 result were accepted; archival is authorized.

## Commit Handoff

Suggested subject:

`feat(collections): add stable pin priorities (BL-075)`

Summary:

- Add stable, character-owned priority membership and durable Language/Tool identities to the explicitly unstable pre-playtest `dnd5e-2014.schema.v0` shape; previously saved v0 data is not promised automatic migration.
- Add reusable accessible Manage Pins presentation plus immediate equipment/spell row commands while keeping identity, validation, mutation, and persistence system-owned and leaving Runtime Actions independent.
- Preserve priority through deterministic projection, filtering, reload, JSON export/restore, responsive previews, and focused collection workflows.
- Verification passed through the recorded unit, Storybook, Chromium, cross-browser, strict OpenSpec, formatting, and diff gates; the owner approved the final phone/desktop and recovery result on 2026-08-29.
