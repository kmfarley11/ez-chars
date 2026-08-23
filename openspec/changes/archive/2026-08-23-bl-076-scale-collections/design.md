## Context

Saturated 2014 sheet fixtures indicate that Runtime Actions and Supporting Collections (Features, Traits, Languages, Tools) can cause the character sheet to grow unbounded, making it difficult to scan. While we previously addressed Inventory and Spells with a 5-item cap and modal-based search, applying that same dense pattern to all supporting collections creates modal fatigue and adds unnecessary UI for smaller collections.

## Goals / Non-Goals

**Goals:**

- Provide a responsive presentation strategy for Runtime Actions and Supporting Collections.
- Dynamically switch Runtime Actions after 5 items and compact supporting collections after 7 items from a simple list to bounded/searchable presentation.
- Validate bounded desktop scrolling and focused phone views against scroll-owner risks.
- Support comprehensive search for Runtime Actions (name, target, notes, timing, category, source context).

**Non-Goals:**

- Do not unify the mutation (edit/save) models for Features, Traits, Languages, etc.
- Do not force heterogeneous structures (e.g. `GridContentData` vs identity-owned rows) into a single generic data wrapper.
- Do not implement custom ordering/favorites for Runtime Actions (deferred to BL-075).

## Decisions

**Decision 1: Reusing Minimal Presentation Seams**

- **Choice:** Establish the smallest shared seam by reusing `DialogShell`, list-row and count helpers, scroll-affordance pieces, and the accepted search/empty-state conventions proven by `GridContentListView`, rather than wrapping the complete component or creating a generic `<BoundedCollection>` data model.
- **Rationale:** Runtime Actions have projected identity-owned rows; supporting collections remain nested `GridContentData`. A presentation-only wrapper cannot filter heterogeneous structures without new projections or domain knowledge.

**Implementation refinement:** The isolated proof does not compose the complete `GridContentListView`. That component owns the inventory/spell row contract and its Edit/Notes row commands, while Runtime Actions require source navigation/resync commands and supporting collections retain card-level Edit/Notes. The shared responsive seam therefore accepts domain-rendered snippets and counts while each 5e adapter owns projection, filtering, and row commands. Supporting collections also retain the sheet's compact bullet-list visual grammar; they do not reuse the bordered `GridContentListRow` or Runtime Action row presentation merely to gain responsive browsing.

**Gate refinement:** Owner review first reduced the original ten-item threshold to seven. Further probing showed that information-rich Runtime Action rows still consume too much vertical space at seven, while compact supporting bullets remain comfortable at that boundary. The selected proof and rollout policy therefore caps Runtime Actions at five items and supporting collections at seven. Isolated stories name the exact 5/6 Runtime Action boundary and 7/8 supporting-collection boundary so both activation behaviors remain directly reviewable. The responsive seam retains a configurable threshold rather than embedding either domain policy in the shared presentation component.

**Supporting-list proof refinement:** The first supporting-collection proof mistakenly reused bordered `GridContentListRow` rendering and therefore visually resembled Runtime Actions instead of the sheet's current compact bullet list. The corrected proof keeps the bullet-list grammar. Because eight compact bullets can fit inside the bounded desktop region without overflow, the exact eight-item story proves search/density activation while a separate eighteen-item story proves actual overflow cues and wheel behavior.

**Horizontal-overflow refinement:** The bounded seam is a vertical scroll owner only. Full supporting-list rows wrap ordinary prose and unbroken tokens within the available width, while compact phone previews use the already-specified single-line ellipsis. The collection-level Browse action is the show-more path from a truncated dense preview to complete wrapping content. Paired narrow-width stories verify both states and assert that no horizontal scroll owner is introduced.

**Reviewer-viewport refinement:** Phone-specific Storybook harnesses render a visible review notice stating that the proof requires a phone preset or a canvas narrower than 640px. Storybook viewport parameters still provide the intended default, but the proof does not rely on reviewers noticing the toolbar state before evaluating responsive behavior.

**Route-integration refinement:** Runtime Action orchestration remains in `RuntimeActionsCard`, which now composes the approved collection presentation instead of duplicating its rows. A thin 2014 supporting-collection card composes the approved bullet-list presentation with the pre-existing structured Edit and Notes dialogs; the display projection remains separate from the authoritative `GridContentData` mutation contract.

**Focused-context refinement:** The shared responsive seam exposes its focused-open state only so domain orchestration can close a phone collection before navigating to a source elsewhere on the sheet. Runtime and supporting cards retain distinct outer-card and focused-dialog action triggers, allowing nested Edit/Notes tasks to restore focus inside the still-open focused collection while ordinary dialog closure continues to restore the Browse action.

**Decision 2: Runtime Action Search Scope**

- **Choice:** Search will index the action's current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without silently searching newer live-source text.
- **Rationale:** This creates a powerful filtering experience based on the character's immediate context without relying on remote or live text that might not match the snapshot.

**Decision 3: Desktop Bounded Scrolling vs Focused View (Hybrid Approach)**

- **Choice:** We will use a hybrid approach: inline bounded scrolling on desktop and a focused modal/dialog view on mobile.
- **Rationale:** On desktop, inline scrolling is accepted to avoid modal fatigue despite some nested-scroll risk (particularly on macOS/Firefox where wheel behavior is sensitive). On mobile, touch scrolling is easily hijacked, requiring the modal.

## Risks / Trade-offs

- **Risk:** Accidental wheel capture (nested scrolling) on desktop.
  → **Mitigation:** Rely on clear visual boundaries and a strict `max-height`. This is an accepted tradeoff to avoid modal fatigue. The mid-apply Storybook gate will validate visual affordances and explicitly test macOS/Firefox wheel behavior before route propagation.
- **Risk:** Search performance degradation on large collections.
  → **Mitigation:** Use simple substring matching. Svelte's derived state is extremely fast, so performance should be negligible up to several hundred items.

## Verification Outcome

- Focused projection/filter tests cover authored order, Runtime Action snapshot/source search, and all four supporting-collection projections.
- Saturated black-box tests cover the 5/6 Runtime Action and 7/8 supporting thresholds, desktop bounded browsing, phone previews and focused dialogs, nested Edit/Notes focus restoration, source navigation, query retention, and background scroll locking.
- The repository smoke gate and the full Chromium, Firefox, WebKit, and Mobile Chrome suite pass after route integration.
