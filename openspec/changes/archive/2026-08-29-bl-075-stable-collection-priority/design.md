## Context

The completed dense-collection work presents inventory, spells, Runtime Actions, and Supporting Collections through several domain-owned projections that share responsive browsing conventions without sharing one universal record model. Inventory and spells already have stable identities and focused row actions. Features and Traits have stable identities but retain a compact card-level Edit/Notes grammar. Languages and Tools are compact supporting records whose current rendered keys depend on array index and display name, so they cannot safely own Pin state through filtering, renaming, or alphabetical sorting.

Current inventory projection preserves array order within an equipment group. Current spell projection fixes cantrip-to-ninth-level groups and preserves array order within each level. Supporting projection concatenates its domain sources. Those incidental orders now determine compact previews. The selected product direction replaces them for eligible collections with an unlimited pinned tier followed by a deterministic alphabetical baseline, while Runtime Actions retain their independent authored order and later action-economy work.

The shared design constraint is deliberate: systems should reuse an understandable Pin/Unpin interaction where it improves the same player job, but persisted data and domain meaning remain system-owned. This change therefore needs a reusable presentation and draft-management seam, not a universal RPG collection schema, reducer, or registry.

## Goals / Non-Goals

**Goals:**

- Establish one accessible Pin/Unpin and Manage Pins interaction language for eligible identity-owned collections.
- Add immediate state-sensitive Pin/Unpin to established equipment and spell row action menus while retaining batch Manage Pins.
- Persist 2014 Pin membership without adding priority properties to shared core item or feature schemas.
- Give Languages and Tools durable identities and preserve those identities through supported editing.
- Produce deterministic priority-first projections for inventory, spells, Features, Traits, Languages, and Tools.
- Keep short Supporting Collections visually compact and keep existing domain-owned editing and annotation workflows intact.
- Prove the Supporting Collection interaction in isolation and stop for owner approval before route, inventory, or spell propagation.
- Record the reusable-interaction/system-owned-data boundary in a lightweight ADR.

**Non-Goals:**

- Exact manual ordering, drag-and-drop, Move commands, ranking weights, or automatic rules-derived relevance.
- Pinning Runtime Actions, changing their source behavior, or solving their action-economy navigation.
- A cross-system persisted `pinned` field, generic domain reducer, universal collection registry, or one item-shaped schema.
- Always-visible per-row Pin controls, right-click or long-press context menus, gestures, or the Horizon B quick-action exploration.
- Adding search to short collections solely to support Pin management.
- Restoring compatibility for superseded pre-playtest v0 layouts.

## Decisions

### 1. Share a narrow priority presentation contract, not domain persistence

The reusable boundary will accept identity-keyed presentation rows with label, optional context/detail, current pinned state, and the existing display metadata needed by concrete collections. It will own draft Pin selection, deterministic presentation helpers, pinned markers, accessible management controls, Save/Cancel behavior, and focus return. A supplied domain callback will receive the complete intended Pin identity set on Save. The reusable layer will not inspect character documents, allocate domain IDs, edit record content, apply storage, or know inventory groups, spell levels, feature owners, or system identifiers.

The existing domain cards and route adapter remain responsible for projecting eligible identities and translating the accepted set into a validated 2014 typed intent. A future system can provide its own adapter and persisted representation while reusing the player-facing interaction.

Alternatives considered:

- Adding `pinned` to the shared core item and feature schemas would make projection easy but would turn a reusable interaction into a lowest-common-denominator persisted field before another system validates that shape.
- Building separate priority dialogs for inventory, spells, and each Supporting Collection would keep persistence local but duplicate draft, accessibility, filtering, and focus behavior.
- Creating a universal collection reducer or registry would overstate the evidence and couple presentation to hypothetical future systems.

### 2. Store 2014 Pin membership in one system-owned identity map

The 2014 system data will gain an optional collection-Pin group whose properties identify the eligible logical collections and whose values are duplicate-free arrays of stable record identities. Inventory uses one membership set across equipment groups so changing an item's group does not silently discard its priority. Spells use one set to support the global pinned-spell tier. Features use the validated character-wide feature identity namespace; Traits, Languages, and Tools use their concrete collection namespaces.

Validation will reject duplicate, dangling, ambiguous, or wrong-collection Pin identities. Empty membership lists and an entirely empty Pin group will be omitted from canonical saves so missing state consistently means unpinned. Supported record deletion or collection replacement must reconcile Pin membership in the same validated domain transaction; current-version hydration will not repair an already-invalid persisted document.

Languages and Tools will gain required stable IDs in their 2014 system-owned record shape. Their structured editor payloads will carry existing IDs, preserve them on rename, and allocate IDs only for genuinely new records through the existing injectable ID factory. Tests will inject deterministic ID allocation. Language IDs and Tool IDs need uniqueness within their respective collections; their display names and source labels remain non-identifying authored content.

Alternatives considered:

- Per-record Pin fields were rejected for root inventory and general Features because their current shared core schemas would acquire 2014 presentation policy. Defining 2014-only extensions for every record family would also scatter one membership concern across heterogeneous records.
- Tags or annotations were rejected because Pin state drives application presentation and must not masquerade as user-authored categorization or notes.
- Array position was rejected because alphabetical projection, filtering, editing, and future insertion make it unstable.

### 3. Use deterministic adapter-owned alphabetical comparison

A pure priority projection helper will partition pinned and unpinned rows, sort each tier with a supplied label comparator, and use stable identity as the final tie-break. Filtering will operate on the already canonical projection so results retain relative priority order. The current English-language 2014 adapter will use a fixed, case-insensitive normalized comparison rather than ambient browser locale, followed by exact label and stable identity tie-breaks. Unit fixtures will cover case variants, punctuation, numerals, accents supported by the chosen normalization, and duplicate labels.

The shared presentation contract accepts the comparator rather than declaring one locale or naming convention correct for every RPG. Future localized or system-native adapters can select an appropriate deterministic comparator without changing Pin/Unpin semantics.

Alternatives considered:

- Ambient `localeCompare` was rejected because environment locale and collation data can change ordering across test and browser environments.
- Stable ID as the primary order would be deterministic but meaningless to players.
- Preserving existing array order for unpinned records was rejected because it creates mixed legacy/new semantics and contradicts the selected predictable alphabetical baseline.

### 4. Present spells as one pinned tier and level-grouped unpinned tiers

Spell projection will first emit pinned spells from every level under one `Pinned spells` group, alphabetically ordered and carrying their cantrip/level and preparation context. It will then emit only unpinned spells under the existing cantrip-through-ninth-level headings, alphabetical within each level. A spell appears exactly once. Search spans this canonical logical collection, so matching pinned spells precede matching unpinned level groups without introducing another search bar.

This preserves level organization for the ordinary spell library while allowing an important higher-level spell to reach a compact preview. Duplicating pinned spells in both homes was rejected because it would create ambiguous row actions, counts, focus destinations, and search results.

### 5. Combine a draft-based manager with immediate established row-menu commands

The priority manager will reuse the native dialog shell, existing buttons, existing search/count language, and labeled native checkboxes with conforming coarse-pointer wrappers. Opening it snapshots the collection's current Pin membership into a local draft. Toggling checkboxes changes only the draft and does not reorder the open manager. Save submits the complete draft set atomically, closes after a successful commit, and lets the parent collection reproject. Cancel, Close, and Escape discard the draft and restore focus to the invoking Manage Pins action.

For collections above their existing density threshold, the manager opens with the collection's active query and shares query updates with the surrounding collection context. Hidden rows retain draft state. Short collections expose the same manager without gaining a search control. Normal Supporting Collection rows retain their compact bullet grammar and show only a quiet pinned marker. Their existing card action menu gains Manage Pins; other domain cards place the same named command in their established collection-action area rather than adopting one identical header layout.

Equipment and spell rows already expose an accessible action menu for identity-owned Edit and Notes commands. That menu will also expose state-sensitive Pin or Unpin. The command derives the complete intended membership set from the current canonical collection, commits one validated replacement transaction immediately, and then restores focus to the same keyed row action when it remains rendered. If priority movement removes that row from a compact preview, focus falls back to the collection's stable Manage Pins control. Manage Pins remains the batch path; Supporting Collections do not gain row menus merely for pinning.

The isolated proof compares pinned-marker clarity, checkbox-row density, Save/Cancel comprehension, filtered management, touch targets, keyboard order, and focus restoration. Focused inventory and spell stories separately document the established row-menu Pin/Unpin command, priority movement, reversible state, and focus fallback. Future quick-action/context-menu exploration remains limited to always-visible shortcuts, gestures, and command-surface refinements rather than deferring this baseline submenu command.

Alternatives considered:

- Immediate checkbox commits were rejected because several changes would produce several character transactions and priority reordering could move the focused row during the task.
- Always-visible per-row Pin buttons were rejected for the baseline because 44-pixel coarse-pointer targets would materially expand compact rows and increase tab-order density.
- Opening Manage Pins from an individual equipment or spell row was rejected because it adds a dialog to a single reversible change and duplicates the collection-level batch command.
- A custom drag or gesture interaction was rejected because it neither matches the selected binary priority model nor supplies a complete accessible path.

### 6. Route Pin updates through one validated 2014 typed intent

The 2014 mutation boundary will accept a collection discriminator and the complete intended set of stable Pin identities. The reducer will resolve every identity against the current character, reject invalid or cross-collection targets, update only the corresponding system-owned membership set, validate the final character once, and commit through the existing local-first store path. Both batch Manage Pins and one-entry row-menu changes use this boundary; the reusable presentation layer never emits schema paths or mutates storage.

Bulk record editors and deletion paths for eligible collections must preserve IDs for retained records and prune Pin membership for deliberately removed records within the same domain transaction. Rename keeps identity and Pin state. Search never contributes a filtered replacement collection. Existing annotations, source links, authored fields, unrelated Pin sets, and Runtime Actions remain untouched.

Alternatives considered:

- Raw array-index JSON Patch was rejected because sorting and filtering make positional targets stale.
- Replacing visible records from the management view was rejected because filtering could silently delete hidden data.
- A generic cross-system mutation event was rejected because only the player-facing interaction, not domain mutation, has cross-system evidence.

### 7. Record the architecture boundary in a new ADR

Apply work will add a lightweight ADR documenting the decision to share collection-priority presentation semantics while keeping stable identity, validation, and persistence system-owned. It will compare a universal persisted field, a universal collection API, duplicated system-specific UX, and the chosen narrow adapter boundary. The ADR will reference this change and the existing character-data versioning and component-composition decisions without rewriting their historical outcomes.

### 8. Stop after an isolated Supporting Collection proof

The pre-gate batch will establish the schema/identity contract, pure priority projection, generic draft manager, one 2014 Supporting Collection adapter, deterministic tests, and realistic stateful Supporting Collection stories. It will not integrate the main sheet route or begin inventory/spell rollout.

At the named `STOP — Human review and approval of the Supporting Collection priority management proof`, the owner reviews short and dense Features plus representative Language/Tool states, quiet pinned markers, Manage Pins placement, filtered draft behavior, Save/Cancel, keyboard/focus behavior, and coarse-pointer density. Only explicit approval unlocks route integration and propagation. Requested revisions remain in the pre-gate batch.

After approval, rollout proceeds from all four Supporting Collections to inventory and then spells. This order tests the deliberately heterogeneous compact presentation first and reserves the global spell-tier change until the interaction is accepted.

## Risks / Trade-offs

- **Pre-playtest v0 characters with nonempty Languages or Tools may fail the new strict identity requirement.** → Retain the approved v0 no-migration policy, update factories/fixtures/export examples, preserve rejected local/imported source data, and call out the break in proposal and review notes.
- **Immediate row-menu Pin/Unpin can reorder the invoking row.** → Key actions by stable identity, restore focus to the moved row when rendered, fall back to a stable collection control when a compact preview drops it, and retain Manage Pins for uninterrupted batch changes.
- **Pinned membership can become dangling when another edit deletes a record.** → Reconcile deletion and Pin membership in one domain transaction and reject dangling identities at validation boundaries.
- **Alphabetical repositioning can surprise users accustomed to insertion order.** → Apply one rule to existing and new unpinned records, use stable pinned markers, and protect ordering with deterministic tests and previews.
- **A global pinned-spell tier partially de-emphasizes level grouping and may surprise someone browsing a spell's former position.** → Keep level/preparation context visible, retain cross-level search, and keep every spell actionable in only one place. The evidence-dependent follow-up is tracked in the [backlog Ideation Sandbox](../../../../docs/backlog.md#raw-human-ideation-unsorted).
- **The reusable boundary could grow into a universal collection framework.** → Limit it to presentation rows, comparator, draft Pin state, and callbacks proven by current consumers; keep editing, source actions, validation, and persistence domain-owned.
- **Fixed 2014 collation may not suit future localized systems.** → Make comparison adapter-owned and require deterministic behavior, not one universal locale.

## Migration Plan

1. Add and test the strict 2014 stable Language/Tool identities and system-owned collection-Pin representation, then update factories and deterministic fixtures to the new current v0 shape.
2. Do not add a migration for earlier v0 documents. Continue to preserve and report invalid/outdated local or imported source data through the existing recovery boundary.
3. Build and approve the isolated Supporting Collection proof before any route integration.
4. After approval, integrate Supporting Collections, then inventory, then spells; reconcile deletion, source navigation, persistence, and export/restore at each rollout boundary.
5. A development rollback may restore the prior code and pre-change fixtures. Newly written priority-bearing documents are not promised compatibility with prior strict code, so retain JSON recovery copies during owner rehearsal.

## Open Questions

- **RESOLVED (2026-08-28):** The owner approved replacing the default list bullet with custom SVG icon atoms (`IconPin` and `IconBullet`) for pinned vs unpinned items (rather than adding a text badge) to maximize horizontal density and perfectly match the text color without emoji styling. The owner also explicitly requested that `Manage Pins` move to the bottom of the Card actions dropdown to prioritize frequent Edit/Notes actions.
- If implementation evidence shows the proposed system-owned identity map makes domain deletion or feature ownership materially unsafe, stop in the pre-gate batch and amend this design/ADR rather than moving persistence into the shared core schema implicitly.
