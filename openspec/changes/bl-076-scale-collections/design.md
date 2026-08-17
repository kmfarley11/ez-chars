## Context

Saturated 2014 sheet fixtures indicate that Runtime Actions and Supporting Collections (Features, Traits, Languages, Tools) can cause the character sheet to grow unbounded, making it difficult to scan. While we previously addressed Inventory and Spells with a 5-item cap and modal-based search, applying that same dense pattern to all supporting collections creates modal fatigue and adds unnecessary UI for smaller collections.

## Goals / Non-Goals

**Goals:**
- Provide a responsive presentation strategy for Runtime Actions and Supporting Collections.
- Implement the "Rule of 10": dynamically switch from simple list to bounded/searchable list when items exceed 10.
- Compare desktop inline scrolling vs focused views to avoid scroll traps.
- Support comprehensive search for Runtime Actions (name, target, notes, timing, category, source context).

**Non-Goals:**
- Do not unify the mutation (edit/save) models for Features, Traits, Languages, etc.
- Do not force heterogeneous structures (e.g. `GridContentData` vs identity-owned rows) into a single generic data wrapper.
- Do not implement custom ordering/favorites for Runtime Actions (deferred to BL-075).

## Decisions

**Decision 1: Reusing Minimal Presentation Seams**
- **Choice:** Establish the smallest shared seam by reusing existing primitives like `GridContentListView`, `DialogShell`, and discrete scroll-affordance pieces where applicable, rather than a generic `<BoundedCollection>` wrapper.
- **Rationale:** Runtime Actions have projected identity-owned rows; supporting collections remain nested `GridContentData`. A presentation-only wrapper cannot filter heterogeneous structures without new projections or domain knowledge.

**Decision 2: Runtime Action Search Scope**
- **Choice:** Search will index the action's current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without silently searching newer live-source text.
- **Rationale:** This creates a powerful filtering experience based on the character's immediate context without relying on remote or live text that might not match the snapshot.

**Decision 3: Desktop Bounded Scrolling vs Focused View (Deferred to Proof)**
- **Choice:** The Storybook/fixture proof will explicitly compare an inline focus/height-limit affordance against a focused desktop view before committing to a final implementation.
- **Rationale:** Inline scrolling contradicts the backlog's safeguard against multiple scroll traps. Borders and shadows make scrolling visible but do not prevent accidental wheel capture.

## Risks / Trade-offs

- **Risk:** Accidental wheel capture (nested scrolling) on desktop.
  → **Mitigation:** Rely on the mid-apply proof to evaluate inline vs focused views and choose the safest affordance.
- **Risk:** Search performance degradation on large collections.
  → **Mitigation:** Use simple substring matching. Svelte's derived state is extremely fast, so performance should be negligible up to several hundred items.
