# BL-077 Verification Record

This supplemental record maps the smallest useful proof surfaces to manual interactions and dated automated evidence. Normative behavior remains in the delta specs, and task progress remains in `tasks.md`.

## Editable-Target Classification Audit

This is the explicit pre-rollout classification of the current 2014 sheet. It records interaction intent, not a promise that the legacy surface already behaves this way. Missing or newly introduced targets default to Tier 2 read-first treatment until deliberately reclassified.

| Current surface / target                                                                                                                                  | Classification                           | Proof or rollout rationale                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current HP, temporary HP, death-save successes/failures, and remaining hit dice                                                                           | **Tier 1 runtime**                       | Frequently changed during active play; retain stable inline controls.                                                                                                                                      |
| Spell-slot usage and spell Prepared state                                                                                                                 | **Tier 1 candidate**                     | Frequently changed during play, but Prepared placement is deliberately owner-reviewed in the proof before rollout. Slot maxima remain read-first.                                                          |
| Currency amounts                                                                                                                                          | **Tier 1 candidate**                     | Often updated during play but less time-sensitive than combat state; verify density during rollout rather than inferring from numeric type.                                                                |
| Maximum HP, initiative, armor class, movement values, total hit dice, ability scores/modifiers, saving-throw and skill proficiency, and proficiency bonus | **Tier 2 rich/read-first**               | Character-definition or derived values, not automatically runtime merely because they are primitive. Derived values remain non-editable where currently derived.                                           |
| Character name, class levels, ancestry, background, alignment, appearance, description, and roleplay/background fields                                    | **Tier 2 rich detail**                   | Open through explicit detail targets; edit authored information and annotations in one focused draft.                                                                                                      |
| Singular structured cards such as spellcasting summary and other non-collection informational groups                                                      | **Tier 2 rich detail**                   | Preserve typed validation and expose one target-owned focused workflow.                                                                                                                                    |
| Weapons, armor/shields, other gear, spells, features, traits, languages, tools, classes, and scratchpad notes                                             | **Tier 3 collection**                    | Keep scan-first browsing, edit one record through Tier 2 detail, preserve Pin/Unpin priority, create through direct Add, and keep eligible removal with the selected record.                               |
| Runtime Actions                                                                                                                                           | **Intentionally specialized collection** | Custom and source-linked actions may use focused detail, but Add Action, View Source, Resync, source ownership, and authored order remain domain-specific. Do not flatten them into generic dense records. |
| Pin/Unpin, Manage Pins, reference inspection, source navigation, and Resync                                                                               | **Specialized immediate commands**       | These commands do not become authored-detail fields; they preserve their existing canonical mutation or navigation boundary.                                                                               |

During rollout, every field currently inheriting `GridPrimitiveField`'s persistent default must be reconciled with this audit. The implementation must not use primitive type as a fallback classification rule.

## Bounded Proof State

The main proof uses one explicit presentation-state union for the five named fixtures and separate profile, inventory, feature, and spell drafts. Each domain owns its clone/validate/commit adapter; there is no universal record payload or reducer. The state machine covers read-first detail, edit, validation failure, atomic Save, whole-draft Cancel/Back to the same read-first detail, one-level annotation removal Undo, collection browse, and deterministic return focus when the workflow finally closes. Batch structural organization is isolated in a separate deferred concept and is not part of the proposed state machine.

The proof remains isolated from the persisted character store. It uses the saturated 2014 fixture and local component state so the owner can change the interaction direction without creating migration or rollback work.

## Pre-Gate Story Sandboxes

- **Retained sandbox:** `Organisms/Unified Character Detail Workflow / Three Tier Comparison` — the single stateful sandbox contains Current and Temporary HP beside read-first Maximum HP, annotated Background beside Ancestry, Random rock inside representative Weapons, Armor & Shields, and Other Gear collections, saturated Features beside a short Traits collection, and saturated Spells. A narrow shared `IconButton` supplies the proof's Edit, Confirm, Cancel, Detail, Pin/Unpin, and Add controls through the existing base-button sizing and accessibility contract. Repeatable records pair first-class priority and detail controls, collection headings expose Add, eligible record detail exposes labeled Remove, and Tier 3 retains bounded in-sheet search/browsing plus an optional focused expansion. Note badges follow their field/record label and precede its value or supporting content, aggregate collection-note badges are omitted, and ordinary record Edit/Notes overflow menus are absent. Same-list priority changes trial a brief reduced-motion-aware reorder animation. Singular fields such as Maximum HP, Background, and Ancestry intentionally omit pin controls because they have no collection priority. A visually separate reviewer-only callout summarizes the bounded global/section alternatives without presenting them as proposed sheet content.
- **Deferred concept sandbox:** `Organisms/Collection Organizer Concept / Deferred Batch Organization` — preserves the working add/remove/reorder experiment as Storybook-only design evidence. Both its rendered heading and story guidance identify it as deferred and outside the BL-077 rollout baseline.
- **Existing comparison context:** `Organisms/Dnd5e2014DenseCollectionCard / Spell Priority Across Levels` remains useful for comparing the legacy dense-row behavior, but was not modified or duplicated. Its legacy action shell cannot demonstrate the unified workflow without prematurely propagating production component changes, so the new proof reuses its grouping and identity concerns inside the one retained sandbox instead.
- No separate phone, Save, Cancel, keyboard, or touch stories were added. The organizer story is retained only because it provides a materially distinct, explicitly deferred concept rather than another interaction or viewport variation.
- Use Storybook's viewport toolbar on the same sandbox for desktop, split/narrow desktop, and phone-sized review. Do not add viewport-only duplicate stories and do not use Storybook `play` functions.

Repeatable state-machine assertions live in `proof-tests/bl077FocusedDetail.spec.ts`, run with `npx playwright test --config playwright.storybook.config.ts`; they are not Storybook `play` functions.

## Mid-Apply Human Proof

Run Storybook, open the mapped comparison sandbox, and review these interactions at desktop and phone-sized viewports. Repeat the touch-specific portions on a physical phone before approving propagation.

### Tier 1 — Hit Points in Quick Reference context

- Compare Current HP and Temporary HP with the neighboring read-first Maximum HP field; decide whether the combined layout spends an acceptable amount of space at desktop, split-screen, and phone widths.
- Activate each runtime field and confirm its value remains in place rather than opening a dialog; activate Maximum HP's open-view chevron and confirm that read-first value opens focused detail instead of presenting a non-interactive `Read-first` badge.
- Confirm entering edit state swaps the value for an input on the same line and changes the centered right-side action rail from Edit to Save/Cancel without shifting Maximum HP or the other runtime field; confirm every icon has an understandable accessible name/tooltip and inherits the repository's required coarse-pointer size from the shared icon-button primitive.
- Change and confirm the value, then reload the sandbox if supported and confirm the accepted state is represented.
- Start another change and cancel it; confirm the prior value returns and focus returns to the stable Current HP control.
- Decide whether the icon/text density is legible without making a frequently used runtime control visually dominant.

### Tier 2 — Annotated Background beside Ancestry

- Compare Background with Ancestry and activate each compact open-view target; confirm both demonstrate the same read-first detail-then-edit workflow rather than using Ancestry as non-interactive layout shorthand. Decide whether the compact value-plus-open composition communicates both readability and editability at an appropriate density.
- Confirm each field reads in the order label → note badge, when present → value, with the badge in the text column rather than beside the open-view action.
- Select and copy displayed text without opening detail, then activate the explicit detail target using pointer/touch and keyboard.
- Confirm the first view is readable rather than immediately form-like and that authored detail, provenance, annotations, and references are understandable in one stacked surface.
- Decide whether the detail target is discoverable enough without making the entire container an accidental activation target.
- Enter Edit, change both authored information and an annotation, then Save once; confirm both accepted changes appear together.
- Repeat with invalid authored or annotation input; confirm nothing commits and the complete draft remains with actionable feedback.
- Cancel a mixed authored/annotation draft; confirm neither change survives and the dialog returns to the same read-first detail instead of closing. Then Close the detail and confirm focus returns to the original invoker.
- Remove an annotation, invoke in-draft Undo, and confirm no separate persistence or confirmation occurs before the outer Save.
- Review the proposed authored detail → provenance → annotations → references order and identify any ordering that better supports real play.

### Tier 2 Dense Records — Equipment collections and Random rock

- Confirm Weapons, Armor & Shields, and Other Gear are all compact bullet-list collections using the same Add, Pin/Unpin, and open-detail grammar rather than inert layout placeholders.
- Use Add on each collection group at least once. Confirm it collects only the new record's minimum initial authored information, opens that record's focused detail, and does not expose the existing collection as a bulk form.
- Open Random rock from its compact open-view target and confirm long content wraps and remains readable without horizontal overflow.
- Confirm the state-sensitive Pin/Unpin control is visible immediately beside the open-view target, communicates its selected state visually and to assistive technology, and changes priority without entering Edit.
- Confirm Random rock has no `…` menu: Edit is reached from read-first detail, annotations and references are visible there, and Pin/Unpin remains the only immediate record mutation beside the detail target.
- Confirm the Random rock row reads title → note badge → supporting detail, with the badge outside the Pin and Detail action cluster.
- Change authored detail and annotations together, Save, and confirm Random rock retains its stable identity, pin state, provenance, and unrelated inventory data.
- Cancel a subsequent change and confirm the unchanged read-first detail remains open. Close that detail and confirm focus returns to the invoking row target or menu trigger.
- Add a disposable equipment record, request removal from that record's focused detail, verify the explicit Keep/Confirm step, and confirm final removal returns focus to the collection's Add control. Confirm removal is a labeled detail action rather than a destructive icon repeated on every row.

### Tier 3 — Saturated Features

- Compare the saturated Features card with the short, non-saturated Traits card; confirm both fit the same section without making the short collection feel artificially heavy.
- Confirm Tier 3 annotation badges use the same `note` / `notes` vocabulary as other tiers, follow the applicable record title and precede supporting content, and are not repeated as an aggregate collection badge.
- Search or scroll the saturated Features fixture directly in-sheet and confirm it remains a first-class scan surface rather than a single Browse affordance. Confirm the lower fade appears only while more content exists below, the upper fade appears only after scrolling down, and both clear at their respective boundaries. Open an individual general or class-owned feature directly, then compare the optional focused expansion; confirm query context remains coherent and the focused workflow preserves query, browsing position, and a useful focus destination across detail and Back.
- Pin and unpin a general or class-owned feature from the icon beside its open-view target. Confirm it moves into or out of priority order immediately, the toggle remains visually and accessibly understandable, and keyboard focus follows the moved record rather than disappearing.
- With normal motion enabled, decide whether the brief same-list movement makes the priority change easier to follow without visible jank. With reduced motion enabled, confirm the reorder is instantaneous.
- On a phone-sized viewport, move browse → detail → edit → Back and confirm the workflow does not stack a second modal or expose competing background scroll.
- Add a disposable General feature and confirm its focused Remove action requires explicit confirmation. Open a class-owned feature and confirm its ownership prevents a generic Remove action. Confirm the proof does not add a generic Organize Collection action alongside established Pin/Unpin, direct Add, and focused eligible Remove.
- Confirm quiet note badges identify records with notes and opening an indicated record exposes those notes in context, without a separate collection-wide annotation overview.
- Save a mixed general/class-owned change and confirm ownership, identity, order, annotations, and unexposed data remain intact.

### Tier 3 / Tier 2 — Saturated Spells

- Search or scroll the saturated spell fixture directly in-sheet and confirm it uses the same directional overflow fades as Features while pinned state, duplicate-name identities, level, Prepared state, and annotation indicators remain distinguishable before opening a focused surface. Compare that scan surface with the optional focused expansion and confirm source-linked context remains reachable.
- Open the duplicate-name Shield records and confirm focused detail preserves stable identity, spell level, pin state, preparation state, annotations, and source context without conflating them.
- Open the annotated saturated spell, change authored detail and an annotation in one draft, and confirm one Save commits both while Cancel commits neither.
- Exercise the proposed Prepared interaction and decide whether it is fast enough during play without creating competing row-level and focused-edit save paths.
- Pin and unpin spells from the icon immediately beside the open-view target in both the bounded sheet list and focused browse surface. Confirm the record changes priority immediately, its stable identity remains distinguishable across duplicate names, and focus follows a row that moves between level and pinned groups.
- Confirm the bounded sheet list uses the brief same-list movement with normal motion and reorders instantaneously with reduced motion; the focused view may move records between separate level groups without cross-group animation.
- Confirm ordinary Edit and Notes/References overflow accelerators are absent and Pin/Unpin does not require opening the authored-detail draft.
- Confirm spell note badges use the same note vocabulary and focused-detail path as Features, without a separate collection-wide annotation overview.
- Add a disposable spell through the collection heading, confirm the starter form stays record-scoped, then verify the focused Remove confirmation before deleting it.

### Deferred concept — Batch collection organization

- Open `Organisms/Collection Organizer Concept / Deferred Batch Organization` separately; confirm the component and story guidance clearly identify it as preserved design evidence rather than proposed BL-077 rollout UI.
- Add, remove, reorder, save, and reset records to confirm the useful interaction context remains available for future comparison.
- Observe that General and class-owned Features currently share the same structural controls. Treat ownership-specific removal and ordering rules as unresolved rather than inferring that this concept can safely scale across collections.
- Compare the concept with established Pin/Unpin and singular lifecycle actions. Revisit it only if later evidence shows that priority plus direct Add and focused eligible Remove is materially insufficient.

### Alternative Comparison and Responsive Boundary

- Confirm the alternatives are visually identified as reviewer-only context and are not mistaken for interactive sheet content.
- Compare the leading three-tier behavior with the bounded global-edit and general section-edit alternatives represented in the proof.
- Decide whether either alternative solves a real task more clearly without making the sheet form-like, hiding global state, or obstructing runtime changes.
- On wide, split/narrow desktop, landscape phone, and portrait phone, review when focused detail should change from centered/wide presentation to a full-height phone presentation.
- Verify logical keyboard order, accessible names, Escape/dismissal, visible focus, coarse-pointer target sizing, and manual pinch zoom throughout.

## Decisions Required at the Section 2 Gate

The owner may approve the design's recommendations as a group or request targeted revision. Explicitly capture:

- three-tier read-first model versus either alternative;
- Tier 1 control density;
- shared compact icon-button grammar and action alignment;
- adjacent first-class Pin/Unpin density for repeatable records;
- explicit detail-target discoverability;
- label → note badge → content placement without aggregate note badges;
- consistent equipment bullet-list composition and the direct Add / focused eligible Remove boundary;
- retained or removed priority-reorder motion;
- stacked detail ordering;
- spell Prepared placement; and
- the responsive focused-detail boundary.

## Post-Rollout Human Review

Before archival, replace this placeholder with the smallest list of real stories and application fixtures covering the propagated behavior. Re-run the interactions above against representative 2014 sheet sections on desktop and a physical phone, with special attention to fields and domains not present in the five-fixture proof. Record approval under Human Review Status.

## Automated Evidence

| Date       | Phase                      | Command                                                                                               | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | -------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-18 | Pre-gate focused contracts | `npm run test -- --run src/routes/charsheets/5e/components/__tests__/unifiedDetailProofState.test.ts` | Passed: 1 file, 6 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-18 | Pre-gate workflow proof    | `npx playwright test --config playwright.storybook.config.ts`                                         | Passed: 6 Chromium tests covering runtime Save/Cancel, Maximum HP focused detail/edit and focus return, atomic validation failure, collection query/Back/focus restoration, directional overflow cues, first-class Pin/Unpin state/reordering/focus, record-scoped Add, explicitly confirmed focused Remove, ownership-aware removal, and preserved focused context after removal. The latest run used an equivalent temporary port-6007 config because an unreachable process occupied the configured port 6006. |
| 2026-09-18 | Pre-gate                   | `npm run verify:smoke`                                                                                | Passed: Svelte diagnostics and lint clean; 29 unit files / 191 tests passed; Chromium application suite 36 passed / 5 intentionally skipped; 34 Storybook files / 123 tests passed.                                                                                                                                                                                                                                                                                                                   |
| Pending    | Post-rollout               | Applicable cross-browser Playwright suite                                                             | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Pending    | Post-rollout               | Applicable performance checks from `docs/verification.md`                                             | Not run                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-09-18 | Pre-gate change validation | `openspec validate bl-077-unify-detail-editing-annotations --strict`                                  | Passed: change is valid.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Human Review Status

- Mid-apply five-fixture gate: **Pending** — revised during owner review on 2026-09-18 to show representative neighboring grid content, a shared compact icon-button grammar with aligned action rails, explicit detail targets for read-first values including Maximum HP, consistent equipment bullet-list collections, direct collection Add plus focused eligible Remove, adjacent first-class Pin/Unpin for repeatable records, label → note badge → content ordering with no aggregate badge, no redundant ordinary Edit/Notes menu, reduced-motion-aware priority animation, first-class in-sheet Tier 3 search/browsing with directional overflow shading, visually separate reviewer-only alternatives, and a separately preserved but explicitly deferred organizer concept.
- Final post-apply desktop review: **Pending**
- Final post-apply physical-phone review: **Pending**
- Archive approval: **Pending**
