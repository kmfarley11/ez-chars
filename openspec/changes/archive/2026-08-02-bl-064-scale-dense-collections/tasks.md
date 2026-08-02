## 1. List Contract and Saturated Evidence

- [x] 1.1 Review the current Svelte 5 first-party guidance and existing dialog, menu, annotation, editing, touch-target, and responsive primitives before choosing any new control or reactivity pattern; record why any suitable local primitive is not reused.
- [x] 1.2 Define the smallest list-only row and collection presentation contract with explicit stable row identity, labels, authored detail, context, annotation presence, and supplied actions; keep domain mutation and arbitrary nested grid data outside it.
- [x] 1.3 Implement deterministic case-insensitive filtering, authored-order preservation, result counts, five-row phone preview selection, and exact total-count browse labels with unit coverage for empty, short, saturated, long-text, duplicate-name, annotated, and no-match data.
- [x] 1.4 Add one reusable saturated 2014 fixture that includes large inventory groups, spells across levels, duplicate names, annotations, runtime-action source links, representative non-target collections, and long authored text for Storybook and black-box browser seeding.
- [x] 1.5 Add stable-identity-focused projection and mutation tests proving that one selected inventory item or spell can be edited or annotated without replacing filtered-out records, losing hidden fields/source links, changing order, or confusing duplicate names.

## 2. Isolated Storybook Proof

- [x] 2.1 Implement the provisional list-oriented presentation boundary with semantic list/row markup, collection and filtered counts, explicit empty/no-match states, accessible search, and the existing complete row-menu primitives.
- [x] 2.2 Implement the larger-screen bounded list and the phone preview/full-height focused presentation with visible boundary-aware scroll cues, one modal scroll owner, background scroll locking, persistent in-session query state, Escape dismissal, and focus restoration.
- [x] 2.3 Implement focused singular-row Edit and Notes paths in the isolated harness, reusing the current form, dialog, and annotation machinery or extracting only the smallest form-body seam needed to avoid duplicate controls; retain a separately named bulk-edit action.
- [x] 2.4 Add stateful Storybook stories and play assertions for empty, five-row, over-five-row, saturated, long-text/truncation, duplicate-name, annotated, no-match, mobile, and larger-screen states, including search, menu, edit save/cancel, notes save/cancel, and focus return.
- [x] 2.5 Run `npm run check`, `npm run lint`, the focused unit tests, and `npm run test:storybook -- --run`; resolve automated accessibility findings and document the manual responsive/focus/touch checks the owner should perform in Storybook.

## 3. Mid-Apply Owner Gate

- [x] 3.1 **STOP — Human review and explicit approval of the dense-collection Storybook proof.** The owner reviews realistic gear-like desktop and phone states, five-item preview and count-bearing browse language, search/no-match behavior, visible bounded and focused scroll cues, row submenu, singular Edit/Notes flows, truncation, and keyboard/touch behavior. An agent MUST NOT check this task or begin sheet integration until the owner explicitly approves this proof; requested revisions remain in Section 2.

## 4. Other Gear Reference Integration

- [x] 4.1 Project Other Gear into stable list rows with group-local searchable text, quantity/context where useful, authored annotations, and identity-owned callbacks while preserving the canonical inventory list and current group categorization.
- [x] 4.2 Replace the Other Gear card's unbounded array presentation with the approved larger-screen and phone behavior, including clear counts, empty/no-match states, a complete browse action, row menus, and a separately named bulk editor.
- [x] 4.3 Route focused Other Gear edit and annotation saves through validated 2014 mutation boundaries and verify persistence, cancel behavior, runtime-action source links, duplicate-name identity, and return to the active query/row context.
- [x] 4.4 Add focused projection, mutation, component, and Chromium black-box coverage for the complete Other Gear workflow before propagation.

## 5. Target Collection Rollout

- [x] 5.1 Apply the approved Other Gear behavior to Weapons and Armor & Shields with independent group-local search, authored order, stable identity, row Edit/Notes actions, annotations, and bulk editing.
- [x] 5.2 Apply the approved behavior to Spells with one logical search across levels while preserving level-grouped organization and showing a discrete Spell label, cantrip or spell level, and prepared state when recorded.
- [x] 5.3 Verify inventory and spell focused saves retain record IDs, source links, annotations, hidden/authored fields, collection order, unrelated groups/levels, and local reload plus JSON export/restore behavior.
- [x] 5.4 Add black-box desktop and phone coverage for all four target families, including exact count-bearing browse actions, search scope, clearing no matches, duplicate names, long previews, collection-versus-row actions, edit/annotation persistence, modal scroll ownership, overflow cues, and focus restoration.

## 6. Saturated Sheet Audit and Reconciliation

- [x] 6.1 Audit Traits, Features, Runtime Actions, Proficiency Languages, Proficiency Tools, and Misc. Notes against the accepted heading, semantic-list, count, and action-placement grammar; reuse only justified pieces and record why short/simple collections omit density controls.
- [x] 6.2 Rehearse the saturated sheet's combat and non-combat region landmarks on desktop and phone without scene modes or hidden regions; record any whole-sheet discovery failure as bounded follow-up evidence rather than expanding this change without owner approval.
- [x] 6.3 Reconcile the touch-target/accessibility audit and theme visual checklist for new search, browse, menu, row, and dialog control families, including any documented exception and equivalent path.
- [x] 6.4 Run the supported cross-browser application suite and manually review the focused collection in Storybook or an equivalent phone presentation for physical scrolling, truncation, touch, and focus behavior.
- [x] 6.5 Recheck the saturated macOS Firefox case with the documented profiling workflow only if repeatable jank remains; retain a Firefox-specific code path only when captured evidence identifies a narrow application bottleneck, otherwise record that no special optimization was justified.

## 7. Verification and Implementation Fallout

- [x] 7.1 Run `npm run verify:smoke`, then run `npm run verify:all` for the deliberate pre-handoff cross-browser, coverage, build, Storybook, accessibility, and performance pass; report any environmental blocker and complete every remaining executable gate.
- [x] 7.2 Run `git diff --check` and `openspec validate bl-064-scale-dense-collections --strict`.
- [x] 7.3 Reconcile material implementation decisions, omissions, verification findings, and provisional list/form ownership into `design.md`, `tasks.md`, and maintainer documentation; update the proposal or delta spec only if approved observable scope changed.
- [x] 7.4 Confirm `BL-074` still owns the broader GridContent/GridContainer composition review and `BL-075` still owns stable manual ordering before saturated-sheet rehearsal; refine either backlog definition only when implementation produced concrete new evidence.
- [x] 7.5 Reconcile final-gate owner feedback by title-casing Bulk Edit controls, consolidating the former per-level spell-slot cards into one slot surface above the spell list, and allowing bounded desktop scroll regions to chain back to the sheet at their boundaries.
- [x] 7.6 Record the still-unresolved mid-list wheel interception and Misc. Notes density question as follow-up exploration evidence, then rerun affected Svelte, unit, Storybook, browser, formatting, and strict OpenSpec gates.
- [x] 7.7 Separate Spellcasting from one complete Spell Slots group, let absent levels be edited from `0 / 0` without storing untouched placeholders, and start the whole Spells section collapsed when it has neither spells nor meaningful slots.
- [x] 7.8 Add the deterministic saturated 2014 character to the default seed set, reuse it for sheet-level verification, reconcile the observable artifact changes, and rerun the affected full gates.
- [x] 7.9 Stack Spellcasting, Spell Slots, and the searchable spell collection as three full-width rows, then add a browser layout assertion and rerun the affected gates.
- [x] 7.10 Remove the redundant visible Spellcasting and Spell Slots subheadings while preserving named regions, then rerun the affected layout and accessibility checks.
- [x] 7.11 Reconcile the saturated owner rehearsal by equalizing the Feature and Trait card height treatment, recording the accepted spell/inventory outcomes, and routing runtime/supporting collection density plus outline navigation to bounded backlog follow-ups.
- [x] 7.12 Correct the Feature and Trait stretch treatment so their existing card margins remain visible inside the shared row boundary, then rerun the final focused verification.

## 8. Final Post-Apply Owner Gate

- [x] 8.1 **STOP — Human final review and explicit approval.** Present the implemented target collections, saturated sheet, verification results, documented fallout, and remaining `BL-074`/`BL-075` boundaries. An agent MUST NOT check this task, mark the change complete, or begin archival until the owner explicitly approves the final result.

## 9. Backlog Updates & Reconciliation

- [x] 9.1 During archival, sync the `dense-collection-interaction` delta into the main specifications and validate the resulting OpenSpec state.
- [x] 9.2 Remove `BL-064` from the P0 queue and refined backlog catalog, add a concise timestamped summary at the top of `Done Recently`, and keep that section bounded to its 3–5 newest entries.
- [x] 9.3 Re-sequence the `Next Recommended Sequence` so `BL-074` becomes the next target, `BL-076` follows it for saturated Runtime/supporting collections, and `BL-075` remains a Horizon A/P0 ordering prerequisite before external handoff.
- [x] 9.4 Update `docs/active-goals.md` and the vision horizon/priority wording to describe the completed dense-collection baseline plus the still-pending component-boundary, Runtime/supporting-collection, ordering, and outline-navigation evidence.

## Executor Recommendation

Use a complex implementation model at high reasoning (Codex Sol-equivalent). The work combines Svelte 5 responsive state, native modal/menu focus behavior, stable identity-preserving mutations, Storybook interaction design, and cross-browser accessibility; a simpler model is suitable only for isolated test or documentation follow-ups after the component proof is approved.
