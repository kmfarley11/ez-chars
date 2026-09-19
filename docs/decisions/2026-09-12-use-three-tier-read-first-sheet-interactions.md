# 2026-09-12 Use Three-Tier Read-First Sheet Interactions

**Status:** Proposed  
**Author:** Codex  
**Date:** 2026-09-12  
**Last reviewed:** 2026-09-18  
**Latest refinement:** BL-077 five-fixture proof; collection-wide annotation overview and generic collection organization rejected for rollout, while the latest revision proposes label → note badge → content ordering, one shared compact icon-button grammar, consistent equipment bullet lists, removal of duplicate ordinary Edit/Notes menus, first-class row-level Pin/Unpin plus Manage Pins, direct Add, and focused eligible Remove. Priority motion and the revised presentation remain pending at the mid-apply gate.

## Context & Problem Statement

The 2014 character sheet exposes several independently reasonable editing patterns: persistent inline controls, separate Edit and Notes dialogs, dense-row menus, and collection-wide forms. Together they make it difficult to predict whether an action will read, edit, annotate, or reorganize content. The ambiguity is most costly on phones, where collection dialogs can hand off into more dialogs and broad forms lose the context that prompted an edit.

The product needs one understandable interaction language without turning the character sheet into a generic form or flattening system-specific records into a universal payload.

## Decision Drivers

- Keep frequently changed play state fast without making unrelated content look editable.
- Keep the normal sheet readable, selectable, and useful as a character overview.
- Let authored information and its annotations Save or Cancel as one target-owned draft.
- Separate singular record editing from collection structure.
- Preserve stable identities, provenance, source ownership, validation, and unrelated data.
- Preserve useful browse context and avoid nested phone dialogs.
- Avoid a premature cross-system record or reducer abstraction while only one system is implemented.

## Considered Options

1. **Global View/Edit mode**
   - Offers one obvious switch, but makes interaction depend on hidden global state, exposes controls across unrelated sections, and conflicts with rapid runtime changes.
2. **General section-wide editing**
   - Bounds the form more narrowly, but still combines unrelated records and annotations and preserves much of the current bulk-form ambiguity.
3. **Read-first three-tier interaction**
   - Keeps explicitly classified runtime state inline, opens rich targets into focused detail and editing, and keeps collection browsing, priority, and record lifecycle distinct. It introduces another navigation depth, so discoverability, Back behavior, and responsive presentation require proof.

## Proposed Decision Outcome

Adopt the read-first three-tier model if the BL-077 human proof validates it:

1. **Runtime state** uses deliberately classified, geometrically stable inline controls.
2. **Rich detail** opens through an explicit target into a read-first surface. Edit creates one local draft containing authored information and annotations; one Save validates and commits the whole target, while Cancel discards it.
3. **Collections** remain scan-first. Individual records use focused detail; established Pin/Unpin owns player priority, direct Add creates one record, and eligible Remove remains associated with the selected record and requires confirmation or a recoverable undo path. Generic collection organization and reordering are deferred.

The shared layer may coordinate view/edit/back/focus state and presentation, but each domain retains its own data adapter and candidate validation. Pin/Unpin is promoted beside the detail target for repeatable pinnable records, remains an immediate accessible toggle, and preserves focus when priority reordering moves a record. Singular fields do not receive a pin merely for visual consistency. Source navigation, resynchronization, and other justified quick commands also remain distinct rather than being forced through the focused draft.

Quiet note badges follow the annotated field or record label and precede its value or supporting content rather than appearing among action controls, and collections do not repeat those notes as an aggregate badge. Compact Edit, Confirm, Cancel, Detail, Pin/Unpin, and Add actions share one base-button-backed icon grammar, while consequential Remove remains labeled in focused detail. Once an ordinary record's detail target owns authored editing, annotations, and references, its duplicate Edit and Notes/References overflow menu is removed. Domain-specific menus remain available where commands such as View Source or Resync are not authored-detail actions. A brief reduced-motion-aware priority animation remains a proof judgment rather than an approved architectural dependency.

This proposal does not authorize a global sheet edit mode, a general section-wide edit mode, a universal record payload, or changed persistence semantics.

## Consequences

- The sheet should become calmer and more predictable in its default state.
- Frequent state requires an explicit classification audit; an omitted classification safely falls back to read-first behavior.
- Ordinary record Edit and Notes/References overflow accelerators are removed once focused detail owns those paths; domain-specific source commands may retain a menu.
- Note badges remain record-scoped and text-associated rather than becoming aggregate collection counts or action-cluster content.
- Existing collection-wide rich editing and annotation editing will be removed after equivalent focused and structural paths exist.
- A successful batch organizer concept remains available in Storybook as deferred evidence, but it is not part of the rollout unless later playtest evidence shows that pinning plus singular lifecycle actions is insufficient.
- Phone collection browse, detail, and edit must transition inside one logical surface with one scroll owner.
- A focused-detail presentation and navigation coordinator may be shared, while domain draft shapes and reducers remain explicit.
- The extra navigation depth makes target discoverability and focus/Back restoration first-class verification concerns.

## Refinements & Follow-Ups

### 2026-09-18 — Five-fixture proof awaiting owner review

The isolated proof covers Current and Temporary HP beside read-first Maximum HP, annotated Background and Ancestry fields, Random rock within consistent Weapons, Armor & Shields, and Other Gear bullet-list collections, saturated Features, and saturated Spells. Owner review established that per-record note badges plus focused detail provide the useful annotation path and rejected a read-only Annotated Items overview. The latest proof revision also omits aggregate collection badges because they do not identify the relevant records, orders compact summaries as label/title → note badge → value/supporting content, and uses one base-button-backed icon primitive for the approved compact action vocabulary; these refinements remain pending gate confirmation. Owner review also found the working Organize Collection interaction promising but premature to adopt or scale. It is preserved as an explicitly deferred Storybook-only concept while rollout retains first-class row-level Pin/Unpin, Manage Pins, direct collection Add, and labeled focused eligible Remove. The proof promotes the pin toggle beside the detail control for repeatable records, intentionally excludes singular Maximum HP, Background, and Ancestry fields, and now removes the ordinary record `…` menu because detail owns Edit and annotation/reference access; that removal also remains pending confirmation. A short reduced-motion-aware same-list reorder animation remains under proof. The proof continues to expose Prepared both as a scan-row action and focused-edit field for judgment.

Before this ADR becomes Approved, the owner must decide or delegate:

- Tier 1 control density;
- shared compact icon-button grammar and action alignment;
- first-class Pin/Unpin density and discoverability on repeatable records;
- focused-detail target discoverability and label → note badge → content placement;
- consistent equipment list composition and the direct Add / focused eligible Remove boundary;
- removal of aggregate note badges and ordinary Edit/Notes overflow menus;
- whether priority-reorder motion should survive the proof;
- stacked authored/provenance/annotation/reference ordering;
- spell Prepared placement; and
- the responsive boundary for full-height focused detail.

The authoritative proof mapping and evidence live in [the BL-077 verification record](../../openspec/changes/bl-077-unify-detail-editing-annotations/verify.md).
