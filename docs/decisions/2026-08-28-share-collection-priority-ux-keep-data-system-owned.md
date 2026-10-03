# 2026-08-28 Share Collection Priority UX While Keeping Data System-Owned

- **Status:** Approved
- **Author:** Codex with project owner direction
- **Date:** 2026-08-28
- **Last reviewed:** 2026-10-03
- **Latest refinement:** [BL-078](../../openspec/changes/archive/2026-10-03-bl-078-add-collection-quickfilters/proposal.md) adopts Runtime Action pins, system-owned display ordering, and ephemeral quickfilters after explicit proof approval; shared chip controls do not impose a cross-system taxonomy.

## Context & Problem Statement

Players need one familiar way to keep important entries visible across inventory, spells, and compact Supporting Collections. Those collections do not share one domain model, and future RPG systems may represent identity, provenance, editing, and persistence differently. Sharing one persisted `pinned` field or universal collection reducer would turn a player-facing convention into a premature cross-system data contract.

The current D&D 5e 2014 implementation also needs stable Pin targets. Inventory, spells, and features already have durable identities. Languages and Tools currently use mutable authored names and array indexes, neither of which remains safe through rename, filtering, or alphabetical presentation.

## Decision Drivers

- Give players consistent Pin/Unpin language without normalizing distinct RPG data models.
- Keep Pin changes atomic, cancelable, keyboard-accessible, and usable on coarse pointers.
- Preserve stable identity through rename, filtering, sorting, persistence, and JSON backup/restore.
- Reuse proven local interaction primitives and avoid new dependencies.
- Limit the shared API to behavior demonstrated by current collections.

## Considered Options

### Add one universal persisted `pinned` field

This makes projection direct, but adds D&D 5e presentation policy to shared item and feature records and assumes future systems want the same storage location.

### Add one universal collection registry or reducer

This centralizes identity resolution and persistence, but freezes speculative cross-system collection categories and mutation semantics before a second implemented system provides evidence.

### Build separate priority UX for each collection

This preserves domain ownership, but duplicates draft management, Save/Cancel behavior, focus restoration, search behavior, accessibility, and tests.

### Share a narrow presentation contract with system-owned adapters

This reuses player-facing behavior while each system supplies stable row identity, current Pin membership, deterministic comparison, and a validated save callback.

## Decision Outcome

Share a narrow collection-priority presentation and draft-management boundary. It may receive identity-keyed rows, current Pin state, a deterministic comparator, query context, and a callback that accepts the complete intended Pin identity set. It must not inspect character schemas, allocate domain identities, emit storage paths, or define a universal persisted record shape.

Each game-system adapter owns identity, validation, mutation, and persistence. D&D 5e 2014 stores priority membership in a system-owned collection map. Languages and Tools gain opaque stable record identities; their names, sources, and annotations remain authored, non-identifying content. A future content catalog may add a separate canonical definition identity without replacing the character-record identity.

The reusable batch workflow uses a local draft and submits one complete set on Save. Cancel, native dismissal, and Escape discard the draft. Equipment and spell rows also expose immediate state-sensitive Pin/Unpin through their established action menus; each command derives and submits one complete intended identity set through the same validated adapter callback. Supporting Collections do not gain row menus solely for pinning. Runtime Actions do not adopt this boundary in BL-075 because their authored order and action-economy navigation require independent product work.

**Operative refinement:** BL-077 retains the narrow data and mutation boundary but changes the rollout presentation. Eligible repeatable records now expose first-class row-level Pin/Unpin beside Detail, including Supporting Collections, while the batch manager remains dormant. This supersedes the earlier placement guidance below without changing identity ownership, complete-set mutation semantics, validation, or persistence.

**BL-078 extension:** Runtime Actions now adopt that boundary as well. The prior exclusion above is historical: stable action IDs own their pins independently of source IDs. Filtering and timing/name presentation do not rewrite the canonical action array. The refinement below is the operative retrieval and ordering policy.

### Local primitive reuse audit

- Reuse `DialogShell.svelte` for native modal lifecycle, cancellation interception, scroll ownership, and close behavior.
- Reuse `BaseButton.svelte` and the established form-control classes for conforming touch targets and visible actions.
- Extend `GridContentActionMenu.svelte` with the optional Manage Pins command so compact Supporting Collections retain their card-level Edit/Notes grammar.
- Extend the existing identity-owned row action seam with optional state-sensitive Pin/Unpin so equipment and spells gain no additional always-visible control or touch target.
- Add the focused `IconPin.svelte`, `IconBullet.svelte`, and `IconPrefixedListItem.svelte` primitives for the approved quiet priority treatment. The existing `Badge.svelte` was not reused because its labeled surface made every pinned row visually heavier than the owner-approved pin-versus-bullet grammar.
- Reuse the search labels, count language, and no-match conventions established by `ResponsiveCollectionView.svelte`, but do not embed that component inside Manage Pins because it owns a separate responsive browse-dialog lifecycle and passive result presentation.
- Use labeled native checkboxes rather than introducing a checkbox component. The existing coarse-pointer policy already treats the wrapping label as the touch owner, and no additional behavior has yet justified another abstraction.
- Keep identity-keyed projection and filtering as pure TypeScript helpers rather than adding reactive shared state. Svelte components use `$state` for owned drafts, `$derived` for presentation, callback props for accepted changes, keyed `{#each}` blocks for stable rows, and native event attributes in accordance with current first-party Svelte 5 guidance.

## Consequences

- Users receive one recognizable priority-management language across eligible collections.
- Future systems can reuse the interaction without adopting D&D 5e record shapes or persistence.
- The D&D 5e adapter must validate every Pin target and reconcile deletion atomically.
- Required Language and Tool IDs can reject earlier pre-playtest v0 records that lack them; no v0 migration is promised by the existing versioning policy.
- The presentation contract must remain narrow. Domain editing, provenance, source actions, and collection-specific grouping stay outside it.
- The first Supporting Collection implementation remained an isolated Storybook proof until explicit owner approval unlocked route, inventory, and spell rollout.

## Refinements & Follow-Ups

### 2026-08-28 — Initial BL-075 proof boundary

The decision applies first to Supporting Collections. Main-sheet integration, inventory propagation, and the global pinned-spell tier wait behind the named human review checkpoint in [`BL-075`](../../openspec/changes/bl-075-stable-collection-priority/tasks.md). This decision refines but does not replace the [component composition taxonomy](2026-07-25-classify-ui-component-composition.md), [platform-native primitive decision](2026-07-17-prefer-platform-native-ui-primitives.md), [touch-target policy](2026-07-31-require-coarse-pointer-touch-targets.md), or [character-data versioning decision](2026-07-18-version-and-normalize-5e-character-data.md).

### 2026-08-28 — Distinguish row-menu commands from future quick actions

Owner review established that Pin/Unpin belongs in the already-visible equipment and spell row action menu alongside Edit and Notes. This is the complete discoverable path for one reversible change, while Manage Pins remains the uninterrupted batch workflow. The deferred quick-action exploration now concerns always-visible shortcuts, platform context-menu enhancements, and optional gestures—not baseline Pin/Unpin inside an established submenu. Priority movement restores focus to the same keyed row action when it remains rendered and otherwise falls back to a stable collection control.

### 2026-08-28 — Implementation reconciliation

The completed boundary preserves the existing composition taxonomy: `ManagePinsDialog` and the icon-prefixed list item are focused molecules, while Supporting and dense collection cards remain organisms that own domain adaptation and workflow placement. The 5e reducer accepts a complete identity set, re-resolves it against the current character, validates the resulting character once, and commits or rejects the operation atomically. This typed intent is a compound collection mutation under the existing field-binding contract, not a new primitive JSON Patch convention or a system-neutral mutation API.

### 2026-09-20 — Prefer the record-local priority action during BL-077

Production-composition review found that exposing both Manage Pins and a promoted Pin/Unpin control duplicated the same operation and crowded collection headings. BL-077 therefore uses row-level Pin/Unpin as the only visible priority path for eligible records. The reusable batch dialog and complete-set callback remain available in the component layer, but no rollout consumer exposes them. Reconsider a batch surface only if owner or external-playtest evidence shows that repeated individual priority changes are materially slow or confusing.

### 2026-10-03 — Adopt Runtime Action priority and explicit collection quickfilters

The owner approved the production-backed BL-078 proof and requested default rollout. Runtime Action membership lives in the optional 2014 `collectionPins.runtimeActions` set and commits through the existing latest-state validated reducer. Rename, resync, and source deletion preserve a surviving action's identity and pin; deleting the action removes membership atomically. Source pins remain independent. External duplicate, dangling, ambiguous, or wrong-collection identities are rejected rather than silently repaired.

Matching pins form a global alphabetical tier. Unpinned actions display in Action, Bonus action, Reaction, Free, Other timing order then name; unpinned spells remain level/name ordered. Prepared is a restriction, not another sort key. Category and timestamps do not influence order. These are pure display projections, not mutations of authored arrays or a promise that other systems share 2014 semantics.

Collection controllers retain query and facet selections across browsing, Detail, Add, and source navigation in the same mounted session; a different character or fresh session resets them. Temporary retrieval state is not exported or persisted. Filtering applies equally to pinned and unpinned records and precedes phone preview slicing. A detail edit may exclude its record without closing Detail or clearing the user's restrictions.

The shared ChipButton atom composes native BaseButton keyboard/focus/touch behavior; CollectionQuickfilters groups system-supplied keys and labels with search/reset controls and a supplementary-control snippet. Selected shading and `aria-pressed` replace the rejected checkbox proof. All spell choices remain visible. Neither component parses passive badges, owns character data, nor defines a universal facet registry. The independent molecule playground demonstrates system-neutral labels and long-label wrapping; the existing organism stories retain real-domain review coverage.

Current-v0 documents without action pins stay valid; adding the optional key does not introduce a new compatibility epoch. Older binaries may reject exports containing the new key. Preserve backups for rollback rather than stripping priority data. The earlier batch/menu guidance remains superseded, not restored by this extension.
