## 1. Priority Data and Architecture Contract

- [x] 1.1 Review current first-party Svelte 5 guidance plus the existing dialog, button, badge, responsive-collection, search, focus-restoration, typed-intent, schema, storage, and touch-target primitives before choosing component seams; record why any suitable local primitive is not reused.
- [x] 1.2 Add a lightweight ADR under `docs/decisions/` for generic player-facing collection priority with system-owned identity and persistence, including the rejected universal-field, universal-reducer, and duplicated-UX options and links to this change plus the existing component-composition and character-versioning decisions.
- [x] 1.3 Extend the strict current 2014 schema with required stable Language and Tool identities plus the optional system-owned collection-Pin identity sets; reject missing/colliding record identities and duplicate, dangling, ambiguous, or wrong-collection Pin identities without adding a pre-playtest v0 migration.
- [x] 1.4 Update 2014 factories, seed/saturated fixtures, structured Language/Tool editor payloads, and reducers so retained records preserve IDs, new records allocate IDs through the injectable factory, deliberate deletion prunes affected Pin membership atomically, and empty Pin sets serialize canonically.
- [x] 1.5 Add nearby schema, reducer, storage, import/export, and hydration tests for deterministic ID allocation, rename preservation, invalid identity/Pin rejection, absent-state-as-unpinned behavior, non-destructive rejected-data handling, repeated hydration, and JSON round trips.
- [x] 1.6 Implement pure identity-keyed priority projection and filtering helpers with adapter-supplied deterministic comparison; cover pinned/unpinned partitioning, case and normalization behavior, numeric/punctuation cases, duplicate-label identity tie-breaking, unlimited pins, preview limits, and filtered relative order.

## 2. Supporting Collection Priority Management Proof

- [x] 2.1 Implement the narrow reusable priority-management presentation contract and draft state without importing character schemas, persistence, or 5e domain types; keep identity resolution and accepted-save mutation in supplied callbacks.
- [x] 2.2 Implement a native-dialog Manage Pins workflow using existing dialog/button/search conventions and labeled checkbox rows with conforming coarse-pointer targets, local draft state, atomic Save, discard-on-Cancel/Close/Escape, validation failure retention, and stable focus restoration.
- [x] 2.3 Adapt representative Features, Traits, Languages, and Tools projections to expose stable identity, current Pin state, deterministic comparison, quiet pinned markers, and collection-level Manage Pins while retaining compact bullets and card-level Edit/Notes behavior.
- [x] 2.4 Add the smallest realistic stateful Storybook set whose stories each provide a unique sandbox for empty, short and seven/eight-item boundaries, saturated and unlimited-pin data, duplicate names, long text, and invalid-save feedback. Reuse those stories for the manual filtered, Save/Cancel/Escape, phone viewport, pointer/touch-target, and keyboard/focus steps instead of creating interaction-outcome or viewport-only stories; include a visible owner-review notice naming the proof boundary.
- [x] 2.5 Run Svelte diagnostics/autofixing, focused unit/component tests, Storybook render/accessibility checks, scoped formatting/lint, and the documented manual keyboard/touch/responsive story interactions for the isolated proof; capture the named story sandboxes, interaction steps, expected outcomes, and evidence in [verify.md](verify.md), and update `docs/accessibility-control-audit.md` only if the new control family does not inherit a conforming shared pattern or needs an explicit exception.
- [x] 2.6 **STOP — Human review and explicit approval of the Supporting Collection priority management proof.** The owner reviews quiet pinned markers, Manage Pins placement and discoverability, native checkbox-row density, short and dense states, retained filtered context, atomic Save/Cancel/Escape behavior, validation feedback, phone presentation, touch targets, keyboard order, and focus return. An agent MUST NOT check this task or begin Sections 3-5 until the owner explicitly approves; requested revisions remain in Section 2.

## 3. Supporting Collection Route Rollout

- [x] 3.1 After proof approval, integrate Manage Pins and priority-first alphabetical projection for Features, Traits, Languages, and Tools on the 2014 sheet while preserving their existing density thresholds, query state, compact bullet grammar, annotations, source context, and card-level Edit/Notes actions.
- [x] 3.2 Route each Supporting Collection save through one validated identity-set intent that re-resolves every target against the current character, commits atomically, and preserves unrelated record families and Pin sets.
- [x] 3.3 Add focused mutation, component, persistence, and black-box coverage for all four Supporting Collections, including rename and deletion, duplicate labels, active-query management, reload, export/restore, phone/desktop presentation, and focus restoration.

## 4. Inventory Priority Rollout

- [x] 4.1 Project Weapons, Armor & Shields, and Other Gear from one character-owned inventory Pin set into group-local pinned-first alphabetical tiers; expose the approved Manage Pins interaction through each collection's established action area without changing row Edit/Notes behavior.
- [x] 4.2 Reconcile inventory bulk add/edit/delete and group-changing edits with stable identity and Pin membership so rename and group movement preserve priority, deliberate deletion removes obsolete membership, and source-linked Runtime Actions remain valid.
- [x] 4.3 Add unit, Storybook, persistence, and black-box coverage for each inventory group, unlimited pins beyond the five-item preview, duplicate names, group moves, deletion, filtered management, immediate row-menu Pin/Unpin with stable focus after reordering, source navigation, reload, and export/restore.

## 5. Spell Priority Rollout

- [x] 5.1 Project one global alphabetical `Pinned spells` tier across cantrips and spell levels, followed by unpinned cantrip-to-ninth-level groups in alphabetical order; keep level/preparation context visible and render each spell exactly once.
- [x] 5.2 Integrate the approved Manage Pins workflow and immediate state-sensitive row-menu Pin/Unpin with the logical Spells collection while preserving one search query, spell-slot and spellcasting summaries, stable spell identity, focused Edit/Notes, bulk editing, and Runtime Action source navigation.
- [x] 5.3 Add unit, Storybook, persistence, and black-box coverage for higher-level pins reaching previews, multiple pinned levels, unlimited pins, row-menu Pin/Unpin with stable focus after reordering, unpinning back into the correct group, search ordering, duplicate names, source navigation, reload, and export/restore.

## 6. Verification and Reconciliation

- [x] 6.1 Reconcile the implemented schema and interaction boundary with `docs/field-binding-contract.md`, the new ADR, current data-versioning guidance, and the component composition taxonomy; update only documentation whose operative guidance changed.
- [x] 6.2 Run the focused schema, reducer, projection, storage, import/export, component, Storybook, and application browser suites and resolve all failures, including accessibility checks and the Chromium, Firefox, WebKit, and Mobile Chrome matrix where collection/dialog behavior is relevant.
- [x] 6.3 Run `npm run verify:smoke`, `npm run test:e2e:all`, strict validation for every affected OpenSpec capability, `openspec validate --all --strict`, and `git diff --check`; record dated outcomes in [verify.md](verify.md) and report exact environmental blockers rather than treating unavailable browser binaries or host libraries as application regressions.
- [x] 6.4 Review every changed and untracked file, confirm no dependency manifest changed, preserve unrelated staged/user work, and ensure no generated, temporary, machine-specific, or absolute-path artifact entered the repository.

## 7. Post-Apply Human Review and Approval

- [x] 7.1 **STOP — Post-apply user review and explicit approval. Agents CANNOT self-complete this task.** Use [verify.md](verify.md) as the durable review guide; present the complete 2014 scope, the pre-playtest v0 identity/priority break, the new ADR boundary, Supporting/Inventory/Spell behavior, Runtime Action exclusion, verification evidence, backlog-reconciled follow-ups, and any material accessibility, persistence, or fixture fallout. The owner reviews the saturated character on phone and desktop plus JSON recovery/round-trip evidence; record the review status in `verify.md`, and only explicit approval permits archival.

## 8. Backlog Updates & Reconciliation

- [x] 8.1 After explicit post-apply approval, sync all delta specs into their affected main capabilities, preserving delta operation headings only in the historical change artifacts and leaving main specs with capability titles, meaningful Purpose sections, and Requirements sections.
- [x] 8.2 Run strict validation for each affected main spec and `openspec validate --all --strict`; reconcile every affected-spec failure before archival and explicitly identify any unrelated pre-existing failure.
- [x] 8.3 Archive `bl-075-stable-collection-priority` only after successful spec sync/validation and explicit owner approval.
- [x] 8.4 At archive time, remove `BL-075` from the P0 queue and refined catalog in `docs/backlog.md`, add a dated summary to the top of `Done Recently`, retain only the 3-5 most recent entries, and remove/resequence it in the Next Recommended Sequence block.
- [x] 8.5 Update `docs/active-goals.md` and `docs/vision/author-desires.md` to distinguish the completed priority capability from remaining first-playtest work and preserve the generic-interaction/system-native-data direction.
- [x] 8.6 Prepare the commit subject feat(collections): add stable pin priorities (BL-075) and summarize the pre-playtest schema break plus verification evidence for human-controlled staging and commit.

## Executor Recommendation

- **Minimum capability tier:** Advanced
- **Reasoning depth:** High
- **Model complexity:** Complex
- **Rationale:** Execution crosses strict schema identity, validated mutation, responsive Svelte workflows, focus/accessibility behavior, deterministic ordering, persistence/import-export boundaries, a human proof gate, and multi-surface rollout. The executor must preserve heterogeneous domain semantics while reviewing shared interaction code and broad test fallout.
