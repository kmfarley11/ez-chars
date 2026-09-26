# 2026-08-28 Share Collection Priority UX While Keeping Data System-Owned

- **Status:** Approved
- **Author:** Codex with project owner direction
- **Date:** 2026-08-28
- **Last reviewed:** 2026-09-20
- **Latest refinement:** [Archived `BL-077`](../../openspec/changes/archive/2026-09-26-bl-077-unify-detail-editing-annotations/proposal.md) promotes immediate record-level Pin/Unpin beside Detail across eligible collections and leaves the reusable batch manager dormant unless playtest evidence justifies restoring it.

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
