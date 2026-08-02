# Dense Collection Storybook Review

Use this checklist at the `BL-064` mid-apply owner gate before any character-sheet integration. Start Storybook with `npm run storybook`, open **Molecules / GridContentList**, and review at least the Saturated Gear, Phone Preview and Focused Browse, Duplicate Name Edit Saved, Focused Edit Cancelled, Annotation Saved, No Matches, and Long Text Phone Truncation stories.

Scope note: the proof's **Bulk Edit** action represents the existing collection editor, which retains Add and Remove during sheet integration. The focused row submenu intentionally proves Edit and Notes only; a dedicated destructive row Delete flow is not implied by this gate.

## Owner checks

- [ ] On a larger viewport, search and the bounded list feel easier to scan than an unbounded card; its border, scrollbar, and boundary shading make scrolling evident without creating a confusing page-versus-list scroll fight.
- [ ] On a phone viewport, exactly five authored rows remain at a glance and the `Browse all X items` action communicates both completeness and scale without consuming another preview row.
- [ ] Long `Name: detail` previews truncate cleanly while the full text remains available to assistive technology and in the focused view.
- [ ] Opening the complete collection produces a full-height phone dialog with one visibly scrollable content region; the background sheet/canvas does not scroll.
- [ ] Search is deterministic, clears easily through both the full-size button and inline no-match guidance, reports result counts, and makes the no-match state obvious.
- [ ] Duplicate names remain distinguishable through context and stable row behavior.
- [ ] Group-local inventory rows do not repeat an Inventory badge; optional badges remain reserved for context that distinguishes records within the active collection.
- [ ] The row ellipsis menu is discoverable and Edit versus Notes feels clear; Bulk Edit remains visibly collection-level.
- [ ] The focused phone collection's scrolling content and fixed Close footer are separated by comfortable spacing and a quiet horizontal rule.
- [ ] Saving and cancelling the singular edit behave as expected and return focus to the row menu trigger.
- [ ] Saving and cancelling Notes preserve the browsing query/context and return focus predictably.
- [ ] Keyboard order follows the visible task order, Escape closes native overlays, and all touch controls feel comfortably sized on a physical or equivalently configured phone.
- [ ] Empty, short, exactly-five, over-five, annotated, and saturated states all feel intentional.

Record requested revisions in the active OpenSpec change. Explicit owner approval of this proof unlocks Other Gear sheet integration; agents cannot approve the gate themselves.
