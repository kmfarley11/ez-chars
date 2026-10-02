# BL-085 Verification Record

## Status

Archived 2026-10-02 after final approval. Both capability deltas are synced; all 29 tasks are complete. The backlog and author-vision sequence now start with BL-078.

2026-10-02 final approval: the owner explicitly approved the integrated result, including label-only detail entry and selective centering, and authorized completion. The dated revision statuses below are historical; task 5.1 is complete.

2026-10-02 revision: trial selective centering for spellcasting summary, compact slot text, Proficiency Bonus, and currency using the shared alignment option. Other groups stay left-aligned; no touch sizes or responsive breakpoints change. Implementation verification is complete; final visual approval remains pending.

2026-10-01 revision: the owner approved removing redundant `>` entry controls wherever clickable labels/names already provide complete detail access. The September retention decision below is historical. This revision is implemented and verified; final integrated approval remains pending.

2026-09-28: The owner approved the proof on September 27 and authorized rollout (task 2.1). Accepted: underlined label entry, selected-field highlighting, independent value/note saves, compact read-first spell slots, centered collection glyphs, and retained group/record chevrons. The normal sheet now uses this flow without a proof query parameter. Implementation, strategic self-review, and final automated verification are complete; integrated approval (5.1) and archival remain pending. The lower-priority per-theme light/dark preference exploration is captured in the backlog.

This is supplemental review evidence, not a normative specification or duplicate task checklist. See [tasks](tasks.md), [design](design.md), and the [local command guide](../../../../docs/verification.md).

### Archival Checks — 2026-10-02

- Both affected main specs passed individual strict validation; `openspec validate --all --strict` passed 19/19. The previous total included this now-archived change; no capability was removed from the validation set.
- Reconciled stale main-spec spell-slot prose with the approved read-first Used/Max detail workflow and the existing default-expanded Spells section before syncing. Archived deltas retain their operation headings; main specs retain Purpose and Requirements.
- Repaired the relocated verification links and the interaction ADR's change link. Documentation formatting and whitespace checks passed; `openspec list --json` reports no active changes.
- Preserved BL-078 quickfilters/Runtime Action priority, BL-072 browser/platform evidence, and the lower-priority responsive-density and theme-mode exploration in the backlog. No application code changed during archival; application suites were not rerun beyond the dated evidence below.
- The archive command reported the three archive-time tasks incomplete while moving the change; those tasks were completed afterward. Its non-blocking proposal warnings did not prevent successful strict spec validation.

## Integrated Rollout Review — Approved

Use the ordinary app URL with your existing character ID; remove old `proof`, `entry`, and `slots` query parameters. Seeded saturated example: `/ez-chars/charsheets/5e?id=char-5e-2014-saturated`. Use a disposable character or export a backup before destructive checks. Review in the app; Storybook is optional for focused comparison, not an additional required round.

- Click a skill, Reference Stats label, roleplay label, Name, and Class Levels. Confirm targeted highlighting, independent Save/Cancel, and access to the complete group without a duplicate `>` button or its reserved whitespace. Try save A/cancel B and dirty Close/Escape. Class Add uses a short coherent form; confirmed class removal includes its owned features, so use disposable data. Empty Class Levels and Misc. Notes & Scratchpad labels must still expose Add.
- Check Used/Max slots use the compact Score/Modifier grammar, with independently saved values and note badges. Current HP, death saves, hit dice, and currency retain their established inline controls.
- Open one weapon/gear item, spell, feature, language/tool, trait, and Runtime Action by name; there should be no second detail button. Edit one field and one note independently; verify the record stays correct after renaming with a search active, and closing returns focus to the name or stable browse destination. Spell Level is editable; trait/class-feature removal remains unavailable. Pin/Prepared/source commands remain distinct; Runtime Action pinning/filtering is still BL-078.
- Create then remove a disposable scratchpad note and collection item. Add remains a complete creation operation; existing values never require an outer Save. Test the dirty-navigation choices while creating a scratchpad note.
- While editing a note, preview its local SRD source, then Back: draft, focus, and reading position should remain. Also inspect a saved source. Only one modal should be visible.
- On a real phone, check label/icon density, wrapping, focus zoom, touch targets, collection browse return, and keyboard/scroll behavior. Scan light/dark appearance; theme-mode settings are deferred rather than part of this approval.
- Alignment trial: on the normal sheet at phone and desktop widths, compare centered Ability / Save DC / Attack Bonus, Used / Max pairs, Proficiency Bonus, and coinage with unchanged left-aligned HP, prose, and ability/skill content. Edit GP and cancel/save: the label/value/input should stay centered within the value column, with actions remaining separate on the right. Check slot wrapping and note badges. Rejecting the visual preference only requires changing the affected groups' alignment option; no data or editing contract changes. Broader phone spacing and wide-window column reflow are deferred in the backlog.

The isolated story sandboxes below remain available if a specific interaction needs closer inspection. Final review should judge the integrated sheet rather than repeat every historical proof comparison.

## Historical Proof Entry Points — Retired URL Opt-In

The instructions in this section document the pre-gate comparison. The production opt-in and banner have now been removed; use the current entry above.

Start `npm run dev -- --host 0.0.0.0` for the app, or `npm run storybook -- --host 0.0.0.0` for the isolated stories. Use the existing development-server address on your phone.

**Whole sheet (required):** open a local character, append `&proof=bl-085` to its URL, and keep the existing `id`. On a fresh seeded profile the saturated entry is `/ez-chars/charsheets/5e?id=char-5e-2014-saturated&proof=bl-085`; a sparse comparison is `/ez-chars/charsheets/5e?id=char-bryltin&proof=bl-085`. If those seed IDs are absent from existing storage, use a fresh private browser profile or create a disposable character—do not reset existing data for this review.

The proof uses real persistence: export important characters first or use disposable/private-profile data. Remove `proof=bl-085` to compare the shipped baseline; this changes the UI, not saved values. The proof is disabled in production builds.

The owner-selected default is **underlined label entry** (`entry=label`). Add `&entry=button` for the bordered alternative, `&entry=chevron` for chevrons, or `&entry=group` for group-only entry. All keep independent saves inside Detail. Supported scalar labels and collection names are clickable; the existing group/record `>` remains for overview access. No whole-row click targets were added. Inventory/supporting/Runtime Action name buttons open their existing record workflow, not a newly migrated editor.

**Coverage:** the real layout, navigation, and Rules controls remain in place. Canonically bound scalar groups (abilities, reference stats, spellcasting summary, alignment/appearance and other eligible prose), Character Name, spells (including Level), and Tier 1 note entry use the proof. Spell slots now trial read-first Used/Max per level; append `&slots=runtime` to compare the previous Tier 1 layout. Other Tier 1 value controls and collection creation remain unchanged. Inventory, supporting collections, Class Levels, roleplay pseudo-paths, and Runtime Actions retain their existing focused workflows until rollout. Their dialogs show a proof coverage notice; the collapsible banner coverage summary distinguishes them from new editing. Class Levels label opens that legacy editor, while Name opens its own piecewise edit. Repetition and adjacency are real; this is not a claim that every domain adapter has migrated.

## Smallest Sandbox Set

Reuse these existing sandboxes across desktop, split-screen, and phone viewports:

- `Organisms/Dnd5e2014AbilitiesAndProficiencies / SaturatedCharacter`: actual six ability cards, mixed numeric/boolean leaves, group and targeted entry, repeated proficiency edits.
- `Organisms/Dnd5e2014QuickReference / SaturatedCharacter`: existing Tier 1 HP controls and note entry beside a larger read-first Reference Stats group.
- `Organisms/Dnd5e2014Spellcasting / SaturatedCharacter`: searchable saturated spells, focused record fields/notes, responsive three-field summary, and read-first slot comparison (`readFirstSlots` control).
- `Organisms/Dnd5e2014AbilitiesAndProficiencies / RejectedFocusedSave`: reuse the existing rejection fixture for failed local Save and dirty-navigation recovery.

No additional story was needed. Mixed authored detail is covered by **Alignment and appearance** and **Background details** on the real sheet. Reuse `Molecules/FieldGroupView / ReadOnly` and its **Inspect read-only context** button for the explicitly illustrative derived/unavailable fixture: confirm no Edit/Clear controls and keyboard/touch access to the explanation. This is not a new calculated production statistic.

The Abilities and Quick Reference stories expose `entryStyle` in Storybook Controls to compare button, label, chevron, and group entry using the same sandbox. Stories show a short proof reminder, and their Docs descriptions contain interaction bullets. Whole-sheet review above remains required separately.

### Latest Review Revision

Compact-pair/alignment follow-up: on the same whole-sheet proof or existing Spellcasting story, compare `1st: 1 Used / 4 Max` with the Score/Modifier format. Click Used and Max and verify the selected field is highlighted; save a note and confirm its badge remains reachable in the compact pair. In Abilities & Proficiencies, inspect Languages/Tools and pin/unpin a row: the leading glyph should center against the label/badge content at desktop and phone sizes. Existing `IconPrefixedListItem` stories expose `iconAlign` for comparing centered controls versus first-line prose; no new sandbox was added. Chevrons remain unchanged pending a decision on removing duplicate record entry.

Observed phone trade-off: the pair can wrap onto two lines with the current reserved group-chevron space and 44px touch targets. The compact format is not a promise of one line on every viewport; judge the remaining density cost at this gate rather than shrinking touch targets to force a fit.

The owner approved the following proof revisions on 2026-09-27. Retain these checks for integrated rollout review:

- Click Score, Modifier, CON Save, and Prof. Bonus. Each must open its appropriate Detail, reveal and focus that field, and mark it with a steady tint/leading border. No editor starts until Edit is activated. Try another field's Edit: the marker follows that deliberate selection without animation or layout movement.
- Open a group's `>` instead: the overview starts without selecting a particular field. Judge whether this distinction makes the two entry paths useful rather than confusing.
- Confirm the selected underlined labels work on touch and keyboard in both themes; the bordered alternative remains available only for comparison as `entry=button`.
- Open a spell, inventory item, or supporting record by its name and by `>`. Both reach the same record; Close returns to the invoking action (or a stable row action when phone browse remounts). Pin remains independent. Select/copy neighboring values and prose without opening a dialog.
- Click Character Name, save a rename, and close. Click Class Levels: its legacy editor remains functional and explicitly marked as awaiting rollout, including Add/Remove Class. Name does not require editing the whole array.
- Click Longsword attack (or another Runtime Action name): the existing action detail opens, with a coverage notice. Source commands remain separate. The older collection footer Remove placement is intentional pre-rollout; rollout will use removal below the fields like the spell proof.
- Review Ability, Save DC, and Attack Bonus as separate responsive fields. Click each label and confirm the correct field is highlighted.
- Compare per-level read-first Used/Max with `slots=runtime`. Is the compact presentation worth the extra entry step during play? Save Used, cancel a Max edit, close/reopen, and confirm only Used changed. Repeat on phone.
- Edit a spell's Level: try 10 (rejected), then a valid level 0–9. Confirm grouping/badges change while notes and pins survive, including after reload. This edits the recorded base spell level, not upcasting.

## Human Proof Interactions

Repeat the same stories with keyboard/pointer and phone touch; no action-specific stories or automated Storybook play functions were added. The whole-sheet opt-in is the production-composition comparison, not a replacement for the isolated rejection fixture.

### Whole-Sheet Composition — Required Before Rollout

- **Read-only scan:** before clicking, scan the whole sheet with sparse data and then saturated data. Are headings and values still dominant, or do repeated icons, borders, and actions compete with them? Compare with the unchanged baseline using the same fixture and viewport.
- Repeat on desktop and narrow phone viewports. Check whether touch-target expansion introduces extra wrapping, spacing, or loss of useful content even when the icons themselves look small. Include existing sheet navigation and Rules access.
- Inspect a small coherent group: can one group entry expose its local Edit controls clearly without redundant leaf buttons? Confirm independent saves remain available inside Detail.
- Inspect a group where a particular field would otherwise be buried. Can you recognize and activate the targeted path without hovering or long pressing? Compare a visibly interactive label control with a selective chevron where appropriate; quiet styling must not mean invisible interactivity.
- **Runtime task:** reach and change one specific value, then change several proficiencies in succession. Are fewer visible controls costing awkward searching or extra navigation? Judge both reading calm and editing effort before approving the entry pattern.
- Traverse representative regions by keyboard. Check useful focus order and whether redundant controls add excessive stops. Select/copy displayed values without opening Detail accidentally.
- Record acceptance or requested revisions for the whole-sheet composition separately from isolated interaction correctness. Neither a tidy single card nor a functioning local Save is sufficient evidence of whole-sheet density.

### Abilities & Proficiencies

- From the sheet-like composition, reach a specific skill through the proposed group or targeted entry. Where targeted access is needed, confirm it opens at that skill with Edit in view. Where group entry already suffices, confirm no redundant leaf control is required. Is the route obvious without a dialog search?
- Edit and save a score, then edit a skill proficiency and cancel. Confirm the score remains saved, the skill remains unchanged, Detail stays open, and there is no outer Save/Cancel.
- Edit several saving-throw/skill proficiency values in succession. Judge actual speed and effort, not just density: do local controls/focus make the next edit easy, or are repeated actions cumbersome?
- While an edit is dirty, select another field, try Close, Back, and Escape. Exercise Save and continue, Discard and continue, and Keep editing. Confirm the choice is local, no second modal stacks, and nothing silently saves or disappears.
- Check readable labels, no misleading Enabled repetition, no persistent Calculated labels, preserved authored Modifier editing, and comfortable non-overlapping touch targets.

### Quick Reference

- Edit Current HP and cancel/save as before. Check narrow-phone read/edit geometry and input zoom behavior; this effort should not redesign Tier 1.
- Inspect and edit one HP note without changing HP. Compare its note actions with the read-first examples.
- Reach a particular reference-stat field through the least obstructive proposed entry. Verify it is readily visible/editable without searching unrelated stats, and that local Save leaves neighbors alone; do not require an individual sheet button when the group entry already meets that goal.

### Mixed Authored Detail

- Read and select/copy prose without opening an editor accidentally. Edit only that prose field; verify neighboring values remain compact and the editor's Save/Cancel stay conveniently reachable on a phone.
- Open an existing note count: first read notes, then edit one. Confirm other notes and the authored value are untouched.
- Add a note on an empty eligible field, then cancel. Confirm no note persists and no empty bordered section remains.
- Stage an existing note's removal, Undo it, then repeat and explicitly confirm removal. Confirm the attachment and other notes remain intact.
- Clear eligible optional information while retaining attached notes; confirm required values have no Delete. Inspect any supplemental derived-value explanation with keyboard and touch as well as pointer.

### Spellcasting

- Find a spell, open its detail, save one authored field, cancel a later note edit, and verify the first change remains. Check badges remain compact and do not falsely imply that authored fields are read-only.
- Keep a query active and rename the selected spell so it no longer matches. Confirm Detail still refers to that spell and returning preserves the query with sensible focus.
- Verify Pin/Unpin, Prepared shortcuts, Add, and eligible confirmed Remove remain distinct. Creating a record must still require final Add and return to its invoker.
- Follow a note's source reference and return without losing context, including a source below a long note: Back must restore both focus and the visible reading position. In phone browse, detail and edit must share one logical modal/scroll owner.

### RejectedFocusedSave

- Attempt a local Save in the rejecting fixture. Confirm actionable feedback remains beside the editor, the draft survives, and nothing is committed.
- Try Save and continue from dirty navigation; rejection must leave the draft active. Discard explicitly, then confirm focus/context recovery.

## Approval Decisions

Mid-apply gate: **Focused editing and save-boundary approval — explicitly approved 2026-09-27**. The owner approved the proof design as it stands and directed rollout. This includes the compact read-first slot comparison and retained chevrons. Approval permits application rollout, not archival.

Earlier September 27 revision requests are superseded by that explicit approval. The unrelated checkbox/theme observation was reconciled into the backlog's lower-priority Ideation Sandbox.

Final integrated-sheet review: **explicitly approved 2026-10-02**. Following integrated application review and the final alignment revision, the owner stated: “everything looks great! lets proceed. consider this my formal approval”. This closes task 5.1 and authorizes archival; it does not claim new physical-device or browser-matrix evidence beyond the results recorded below.

## Rollout And Exception Matrix

Initial audit completed 2026-09-26; the table records the original proof/rollout division. As of September 28, all listed consumers use the shared small-edit model. Classes conservatively guard their ID-less array, scratchpad resolves stable note IDs, and roleplay maps its pseudo-paths to canonical data while preserving notes. Creation and Runtime Action source selection/resync remain specialized; dormant legacy components are available to standalone consumers but not mounted behind migrated sheet content.

| Consumer                              | Current owner / save                                                           | Proof scope and entry rationale                                                                                     | Constraints / later rollout                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Six ability/skill cards               | GridContentCard → GridContentDetailWorkflow; canonical field patches           | Real numeric/boolean leaf edits. Compare targeted skill labels/chevrons with group overview on the longer cards.    | Modifier remains authored. Optional proficiency is not a required field deletion.                                         |
| Quick Reference                       | Same group workflow; GridPrimitiveField for runtime                            | Reference Stats is long enough for targeted access; Current HP stays Tier 1, notes exercise the shared note path.   | Preserve runtime geometry; the separately requested spell-slot comparison is confined to Spellcasting.                    |
| Profile / background / roleplay       | Group workflow, canonical identity/system fields and roleplay-specific intents | Alignment/Appearance supplies mixed text/value/optional information in the real sheet. Small groups keep one entry. | Class arrays and roleplay pseudo-paths need domain adaptation during rollout; do not treat display paths as canonical.    |
| Spellcasting summary / spells         | Group workflow / GridRecordDetailWorkflow; denseCollectionEditing adapters     | Summary fields and real stable-ID spells. Record entry remains one row Detail action.                               | Full-record payload adapters must merge into current state; preserve Prepared and pin commands, Add and confirmed Remove. |
| Inventory                             | GridRecordDetailWorkflow; denseCollectionEditing                               | Existing neighbor in whole-sheet density review; record adapter propagation follows approval.                       | Distinguish group/category ownership and optional fields; preserve unexposed properties.                                  |
| Features / Traits / Languages / Tools | SupportingCollectionCard and supportingCollectionEditing                       | Existing neighbors; not claimed as migrated by proof.                                                               | Preserve ancestry/class ownership and existing Trait removal restriction; stable-ID adapter rollout after gate.           |
| Runtime Actions                       | RuntimeActionDialog and runtimeActionEditing                                   | Existing neighbor and source-command regression boundary.                                                           | Source creation/resync stays specialized; authored detail migration follows gate. BL-078 still owns priority/filter work. |

No new genuine coupled value editor is required by the inspected proof fields. A note's text/name/reference metadata is a coherent small unit. Candidate validation remains authoritative; no additional rules-legality coupling is introduced. Shared workflow/input/notes components will own the new UI, and domain adapters will own path/identity resolution and current-state commits.

2026-09-27 matrix amendment: spellcasting now trials read-first per-level Used/Max with a targeted slot intent, and exposes recorded spell Level as independently editable. Runtime Actions and Class Levels have label entry but retain their old editors with visible notices. Name has a canonical one-field fallback when its containing group includes the unmigrated class array. These are explicit proof boundaries, not omissions or full rollout.

## Automated Evidence

### Selective alignment revision — 2026-10-02

- `npm run verify:smoke`: passed, with **0 diagnostic errors/warnings**, clean lint, **231 unit tests**, **54 Chromium passes / 5 unchanged phone-only skips**, and **103 Storybook checks**. The new application regression covers centered currency read/edit geometry, Save/reload persistence, focus restoration, and unchanged left-aligned HP input.
- `smallEdits.smoke.spec.ts` plus `mobileAccessibility.smoke.spec.ts` on Mobile Chrome: **20 passed**. The targeted alignment test also passed again for screenshot inspection. Existing phone targets remain at least 44px; no target-policy exception was introduced.
- Focused WebKit suite: **17 passed with one worker**. The first four-worker run had **16 passes / 1 timeout** in the existing multi-step class-removal regression, exceeding its 10-second overall deadline; the same case completed in **2.3 seconds** in the serial rerun without code, timeout, or assertion changes. This is not proof of a specific browser defect or a general absence of timing sensitivity.
- Production build passed. Official Svelte tooling reported no issues; retained ESLint directives match the repository configuration, and `FieldDraft.update` is an existing class method. Desktop and phone screenshots were inspected; subjective centering preference and physical-device comfort remain for the owner.
- The new check first exposed a pre-existing currency save error (`/__currency/gp` incorrectly sent to canonical JSON Patch) and a 32px phone value-column shift when the second action appeared. Currency now uses its existing typed decoder, callback rejection results propagate, and the shared runtime action cluster reserves 92px for two 44px controls plus their gap. No data-model or currency-rule change was made.
- Initial browser execution was blocked by sandbox port-binding permissions; it ran after permission to start the local server. No new dependency or story was added. Full Firefox/performance, coverage, and static Storybook builds were not repeated for this scoped revision; earlier results above/below retain their original dates.

### Label-only entry revision — 2026-10-01

- `npm run verify:smoke`: passed; diagnostics **0/0**, formatting/ESLint clean, **231 unit tests**, **53 Chromium passes / 5 intentional phone-only skips**, and **103 Storybook checks**. Three new pure contracts cover fallback eligibility, empty-collection/compact-pair entry, and the distinction from inline runtime controls.
- `npm run build`: passed. `npm run test:e2e:all`: **205 passed / 27 unchanged project-specific skips**. Existing lifecycle, dirty editing, source return, query preservation, and renamed-row focus checks now use label/name entry. Negative assertions guard against duplicate group, Proficiency Bonus, and spell-detail controls. Phone checks continue to enforce non-overlapping 44px targets and focus return.
- `npm run test:perf:compare`: **6 passed**. Median Chromium **60.00 FPS / 0% dropped-frame intervals**; Firefox **46.16 FPS / 20%**. Chromium passes its gate; Firefox remains comparable diagnostic cadence, not a paint-quality conclusion.
- Strict change validation and `git diff --check` passed. Official Svelte tooling found no issues; its existing ESLint-directive suggestions conflict with the clean repository lint configuration, and the existing `FieldDraft.update` call is a class method, not a rune mutation error.
- Desktop targeted-field screenshot inspected. Physical phone comfort and the visual preference for label-only access still require the owner. No new stories, play functions, dependency, or persistence change; the earlier full coverage/static-Storybook-build evidence remains dated September 28 rather than being claimed as a new run.

### Final rollout — 2026-09-28

- `npm run verify:smoke`: passed. Diagnostics **0 errors / 0 warnings**, formatting/ESLint clean, **228 unit tests in 33 files**, **53 Chromium checks / 5 intentional phone-only skips**, and **103 Storybook checks in 37 files**.
- `npm run build` and `npm run build-storybook`: passed. No dependency manifests changed; no dependency adoption or new audit exemption was introduced.
- `npm run test:coverage`: passed; **80.52% statements, 66.03% branches, 81.30% functions, 83.92% lines**. Coverage is not a substitute for the browser and human interaction checks.
- `npm run test:e2e:all`: **205 passed / 27 intentional project-specific skips**, across Chromium, Firefox, WebKit, and Mobile Chrome. This includes the phone accessibility suite, 44px targets, modal focus return, note/source return, existing import/export and source-resync regressions, and all **16 focused-editing cases on each project**. The skip policy is unchanged; no BL-085 case is skipped.
- `npm run test:perf:compare`: **6 passed**, three serialized samples per engine. Median Chromium **60.12 FPS / 0% intervals over 33.3ms**; Firefox **46.16 FPS / 18.33%**. The preceding September 28 sample was 60.01 / 45.62 FPS; the September 26 baseline was 60.00 / 44.92 FPS. These small movements do not establish an improvement or regression. Chromium meets the existing gate; Firefox remains non-gating callback-cadence evidence, not physical-device paint/compositor evidence. Raw local samples are in `performance-results/scroll-frame-comparison.json`; BL-072 retains the headed/real-device follow-up.
- `openspec validate --all --strict`: **20 passed**. `git diff --check`: clean. Official Svelte tooling found no component issues; imperative handles remain for shared focus/scroll restoration.

Failures found and resolved before the final clean run:

- Duplicate display labels (Runtime Action timing and category both “Other”) were incorrectly used as unique badge keys. Shared rendering now accepts repeated labels; the existing phone browse/detail regression exercises this case.
- Class-note attachment arrays could acquire invalid gaps when attaching a note to a later class. The adapter fills only missing mirrored nodes and preserves surviving attachments through removal; a deterministic contract covers it.
- A pending positional class action could outlive this dialog's own preceding removal. The session-local structure revision rejects that stale action rather than targeting the new index occupant. A failing-first unit test and the four-browser Save-and-continue/removal/reload test verify that neither surviving class is changed.
- Old bulk-edit assertions were migrated to independent actions without removing lifecycle coverage. A Firefox/WebKit test bootstrap race was fixed by waiting for the initial sheet before replacing the fixture and navigating again, not by suppressing browser errors. The browser-error guard remains enabled.

Physical iPhone focus zoom, thumb comfort, screen-reader interpretation, and subjective painted-frame quality are **not** established by these runs. Those remain the final human review and existing compatibility follow-up, not unexplained automation gaps.

### Earlier evidence

Initial rollout checks (2026-09-28): clean smoke gate passed with diagnostics 0/0, lint clean, **226 unit tests**, **51 Chromium checks / 5 existing phone-only skips**, and **103 Storybook checks**. The earlier failed pass exposed outdated bulk-edit assertions and an unconnected draft-note source-preview callback; both were corrected and the existing reference-return regression now passes. Additional scratchpad/lifecycle and final matrix checks follow; do not treat these initial numbers as the final matrix result.

Compact-pair/alignment revision (2026-09-27): `npm run verify:smoke` passed with 0 diagnostic errors/warnings, clean lint, **214 unit tests**, **51 Chromium passes / 5 existing phone-only skips**, and **103 Storybook checks**. The **14 Mobile Chrome proof checks** also passed. The existing slot check now verifies compact pair text, both label targets, independent save/cancel, note creation and badge reopening after reload, and the runtime comparison. Desktop/phone screenshots were inspected; physical-phone alignment/comfort remains human review. Strict change validation and whitespace checks passed. Official Svelte tooling reported no issues; its unused-directive suggestions do not match repository ESLint configuration, which passes. No new stories or play functions were added.

Latest proof-revision checks (2026-09-27, label selection / spellcasting comparison):

- Clean `npm run verify:smoke`: diagnostics 0 errors/0 warnings, formatting/ESLint passed, **214 unit tests**, **51 Chromium checks passed / 5 existing phone-only skips**, and **103 Storybook checks** passed. Strict change validation and whitespace checks passed.
- Final `smallEdits.smoke.spec.ts` Mobile Chrome pass: **14/14 passed**. Coverage now includes Name editing, explicit Class Levels legacy coverage, Runtime Action name entry/focus return, spell-level validation/reload/pin preservation, and independent read-first slot saves with the runtime comparison still reachable. This is phone emulation, not physical iPhone evidence.
- Unit contracts cover absent slot initialization, preserving annotated zero levels and neighboring fields, rejecting removed owners/stale edits, spell identity/pins, and an empty class array not being silently omitted from a scalar-only dialog. The last case exposed and fixed a real proof coverage bug. Two initial browser assertions were corrected to use the actual notice wording and level-qualified runtime button names.
- One intervening full run lost open dialogs/focus during document reloads; traces show Vite reconnecting while proof artifacts were being updated. It was not accepted as a verification pass. With all edits paused for the rerun, the complete smoke gate passed, including source inspection and contextual PDF navigation. Hold documentation edits too while browser checks use the watched dev server.
- Reviewed the desktop composition screenshot: distinct responsive summary fields and compact per-level slot cards reuse the shared field/grid renderer. The slot experiment stays in the 5e composition, not the generic editing context. Human review still decides the space-versus-interaction trade-off. No new story sandbox or Storybook play function was added.

Proof-revision checks (2026-09-27, after label/highlight feedback):

- `npm run verify:smoke`: passed; diagnostics 0 errors/0 warnings, lint passed, **210 unit tests**, **47 Chromium checks passed / 5 existing phone-only skips**, and **103 Storybook checks** passed.
- After a final comparison-style correction (underlined labels explicitly override button background/border) and adding touch-geometry assertions, reran `smallEdits.smoke.spec.ts` on Chromium and Mobile Chrome: **20/20 passed**. The two added cases cover Score/Modifier/CON Save/Prof. Bonus targeting, no automatic editing, overview without a marker, focus return, collection-name entry, and independent Pin. Representative label targets meet 44-by-44 CSS pixels in phone emulation. Targeted lint/formatting also passed.
- Reviewed captured desktop and phone target/detail screenshots. Physical-device comfort, theme preference, border density, and whether both label and chevron entry should remain still need human review. No additional story or Storybook play function was introduced.
- Strict change validation and whitespace checks passed; final gate remains pending.

Proof-batch checks (2026-09-27):

- `npm run verify:smoke`: passed. Svelte diagnostics: 0 errors, 0 warnings; formatting/ESLint: passed; unit contracts: **33 files / 210 tests passed**; Chromium application suite: **45 passed, 5 skipped**; Storybook component checks: **37 files / 103 tests passed**. The five Chromium skips are the existing phone-only checks, not skipped BL-085 cases.
- The 12 focused Vitest tests cover independent drafts, parse rejection, deterministic note allocation, canonical property-order comparison, ID/snapshot targeting (including ID-less notes), latest-state merging, optional Clear, validation/rejection, and removed/changed owners. Spell edits and notes reject a changed character even when its spell ID matches.
- All eight BL-085 Chromium cases passed: targeted/group entry, Tier 1 note independence, save-A/cancel-B, dirty Close/Back/Escape, failed and successful Save and continue, local invalid input, note Add/Edit/Remove/Undo, optional clearing, saturated query/record identity, source inspection, and focus/visible reading-position return after a long note.
- `npx playwright test tests/smallEdits.smoke.spec.ts --project='Mobile Chrome'`: **8 passed**, including phone browse-to-detail return with the query preserved. This is emulation, not physical iPhone evidence.
- Strict change validation and `git diff --check`: passed.
- Official Svelte tooling reported no syntax issues. Imperative component/element handles are retained for focus and scroll restoration; the shared dialog owns both, rather than reaching into its DOM from an adapter.
- Regressions found and resolved during verification: the single-note variant initially reset the existing native disclosure while typing (fixed with a variant-only attachment); source Back initially restored focus without restoring scroll (fixed in the shared scroll owner). The original D&D Beyond note test and the long-note source-return check now pass. An initial PDF divider timeout did not recur in the clean full run. A new test's responsive-entry race was fixed by waiting for the visible search/browse entry before choosing its path, rather than increasing its timeout.
- Browser checks need permission to start local servers in this sandbox; the initial restricted attempt failed with `listen EPERM 127.0.0.1:5173`, then ran with that permission. The usage-limit interruption was resumed before this clean run. Neither is an app failure.

This pre-gate pass does not claim physical iPhone verification, a fresh Firefox/WebKit matrix, production-build verification, or painted-frame performance results. The named human gate covers real-device ergonomics; the later integrated-verification batch remains pending.

Planning-only checks on 2026-09-26:

- `openspec validate bl-085-focus-piecewise-detail-editing --strict`: passed.
- `openspec validate --all --strict`: 20 passed, 0 failed.
- Prettier check of all new artifacts and the three reconciled repository documents: passed.
- `git diff --check`: passed. No implementation, browser, or runtime-performance checks were run for this documentation-only proposal.

Performance comparison is callback-cadence evidence, not proof of painted-frame correctness or physical-phone usability; follow the existing verification guide and BL-072 for Firefox/macOS interpretation.

## Fallout And Follow-Ups

Strategic review: the route only wires the shared editing scope. `SmallEditDialog`, `ScalarEditInput`, existing note components, and shared label/pair/list primitives own presentation and draft/focus behavior; `smallEditAdapters.ts` owns explicit 5e path/identity resolution and validated commits. Class/scratchpad lifecycle uses the same shared operation renderer, not in-page forms. Coherent record creation and Runtime Action source selection/resync intentionally retain specialized workflows. Legacy detail components remain available to standalone consumers, but are not mounted behind migrated sheet content. There is no new multi-system registry, schema migration, dependency, Storybook story, or play function.

Existing BL-078 owns collection quickfilters and Runtime Action priority; BL-072 owns compatibility evidence. The owner-requested per-theme light/dark/system preference exploration, including native checkbox coloration, is now in the [backlog](../../../../docs/backlog.md) Ideation Sandbox with a lower-priority owner/playtest trigger. No theme-setting implementation or new playtest prerequisite is included here.
