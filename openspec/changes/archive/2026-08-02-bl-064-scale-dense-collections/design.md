## Context

The current 2014 sheet projects equipment groups and each spell level into general `GridContentData`, then asks `GridContent` to render arrays, host card-level edit/notes actions, and coordinate dialogs. That path works for small collections but exposes only bulk editing and expands directly with collection size. It also relies on array position for several rendered keys even though inventory and spell records now have stable identities.

This change must prove dense behavior with four concrete consumers without preempting `BL-074`, which will review the wider `GridContent`/`GridContainer` composition, or `BL-075`, which will add stable manual ordering before the playtest. The implementation must also preserve current schema, validated mutation, annotations, runtime-action source links, and local persistence.

## Goals / Non-Goals

**Goals:**

- Establish one list-oriented boundary grounded in Weapons, Armor & Shields, Other Gear, and Spells.
- Keep compact sheet scanning distinct from complete focused browsing and focused row mutation.
- Preserve explicit stable row identity through filtering, duplicate names, focused edits, and annotation updates.
- Prove the interaction in Storybook and stop for owner approval before route integration.
- Roll out from Other Gear to the remaining targets, then audit the whole saturated sheet and supported input modes.

**Non-Goals:**

- Generalize `GridContent` into a universal list/form framework or settle the broader component taxonomy owned by `BL-074`.
- Add stored ordering controls; `BL-075` follows this work and uses the stable row contract proven here.
- Change persisted character shapes, inventory categorization, spell grouping, or import/export formats.
- Add fuzzy search, arbitrary filtering, virtualization, whole-sheet search, scene modes, gestures, or advanced list keyboard shortcuts.

## Decisions

### 1. Add a list-only presentation contract beside `GridContent`

Introduce a dedicated list-oriented component boundary, provisionally `GridContentList`, rather than adding another array-specific branch to `GridContent`. Its input is a small presentation contract containing an explicit stable row key, primary label, optional authored detail, optional context/badges, annotation presence, and supplied row actions. It owns semantic list display, counts, search presentation, compact previews, and the canonical row submenu; the 2014 adapter retains ownership of domain projection and mutation.

This boundary is reusable only to the extent proven by the four target consumers. It does not accept arbitrary nested `GridContentData`, infer domain labels, write patches, or claim a cross-system API. A broader extraction or rename remains evidence for `BL-074`.

Alternatives considered:

- Extending `GridContent` with a dense-array mode would keep fewer components but deepen the same conditional orchestration that prompted this work.
- Building an inventory-specific component would be smaller initially but would duplicate the same interaction for spells and provide weak evidence for the imminent component review.
- Building a universal collection framework would freeze hypothetical sorting, pagination, and cross-system contracts before they exist.

### 2. Project stable rows and route mutations through domain-owned callbacks

The 2014 sheet projection will expose explicit list descriptors for the three inventory groups and the logical spell collection. Inventory rows use item IDs and spell rows use spell IDs; duplicate display names never become identity. Domain-owned callbacks resolve the selected identity against current canonical data at save time and reuse the validated edit-intent boundary so focused editing changes one record while preserving hidden fields, annotations, source links, order, and unrelated records.

The list presentation never reconstructs canonical records from visible text. If the existing form renderer can be reused with a single-row projection cleanly, it should be; otherwise extract only the focused form-body seam required to avoid duplicating field controls. Dialog-shell, panel, and general form architecture remain for `BL-074`.

Alternatives considered:

- Index-only keys and index-based saves are rejected because filtering and later ordering would make them ambiguous.
- Replacing the whole filtered collection from visible rows is rejected because search could omit records and silently destroy data.
- Adding a new schema-level order field is rejected because current array order is already the authored order and `BL-075` owns mutation semantics.

### 3. Separate sheet previews from complete browsing

On phone-sized layouts, target cards render the first five rows in authored order. Each visual preview row remains a one-line `Name: detail` presentation; CSS truncation preserves the complete accessible text in the DOM. One full-width browse action incorporates the exact total item count instead of spending a separate preview row on the hidden count, then opens the complete collection in a native modal dialog styled as a full-height phone surface.

On larger screens, target lists use a measured visual boundary with their own content scroll region and accessible search. A subtle border, lightweight scrollbar, and boundary-aware top/bottom shading make overflow visible without permanently obscuring the first or final row. The bounded region uses normal scroll chaining so wheel input can return to the sheet when the collection reaches a boundary. A modal focused view locks background scrolling through the existing dialog behavior and has one internal content scroll owner with the same boundary-aware cues while its heading, count, search, and close controls remain available.

Search state belongs to the active collection browsing session. It survives a nested focused edit or annotation dialog and restores row context afterward; reopening a collection may start with an empty query. No duplicate mobile and desktop controls remain focusable at the same breakpoint.

Alternatives considered:

- Height-driven preview measurement would react to containers but create unstable counts, hydration/test complexity, and a less predictable at-a-glance contract.
- Nested inline scrolling on phones would keep the user on the sheet but creates competing scroll owners for collections that may contain hundreds of entries.
- Progressive disclosure without a complete focused view would make records harder to discover and was not supported by the owner preference.

### 4. Use collection-appropriate search scope without creating a search service

Search is a deterministic, case-insensitive substring match over the row's primary label and selected authored detail. It preserves relative authored order and never mutates data. Each equipment group owns an independent query and result count. Spell discovery uses one logical query across all spell rows, then presents results with a discrete Spell label plus cantrip or level and prepared context so duplicate names remain understandable.

The search helper may be a small pure function shared by the target components and unit tests. It is not a remote index, fuzzy scorer, general filter registry, or the runtime-action source-picker API. Those contracts can share visual primitives only where their current inputs honestly align.

### 5. Keep row commands complete but compact

Each target row uses the existing accessible menu primitives to expose Edit and Notes as the complete baseline path. The edit action opens a focused singular-record dialog. Notes opens the corresponding annotation editor. A quiet annotation indicator is present only when the row has annotations. The collection-level action menu retains an explicitly named bulk-edit command.

Quick actions, hover-only affordances, swipe/long-press gestures, and a reorder command are excluded. They can supplement the submenu after evidence, but cannot replace the complete keyboard/touch path.

### 6. Deliver through a proof-before-propagation gate

The first implementation batch produces a stateful Storybook proof using realistic gear-like data. It must cover empty, short, saturated, long-text, duplicate-name, annotated, and no-match states; mobile and larger-screen presentations; search; the row submenu; focused edit cancellation/save; annotation behavior; and focus restoration. Component checks should exercise real state changes and at least one invalid or interrupted path.

The apply workflow then stops at a named, unchecked human-review task. The owner reviews the component proof and explicitly approves or requests revisions. Agents cannot approve or check this gate themselves. Only after approval may implementation integrate Other Gear, then Weapons, Armor & Shields, and Spells. The repository's separate final post-apply approval gate still applies before completion or archival.

### 7. Verify saturation through layered evidence

Unit tests cover deterministic search, preview counts, stable identity, and focused mutation. Storybook covers isolated state and accessibility. Black-box Playwright seeds a saturated 2014 character and verifies desktop plus phone discovery, search, row actions, editing/annotation persistence, keyboard context, and dialog scroll ownership. Existing mobile geometry and accessibility checks remain applicable.

The saturated fixture must also exercise non-target collections and sheet landmarks so the audit can distinguish local collection problems from whole-sheet navigation problems. Run supported cross-browser checks because menus, native dialogs, focus restoration, and overflow differ by engine. Repeat the documented headed macOS Firefox profile only if the reproducible fixture still shows jank; retain browser-specific code only when the trace implicates a narrow application bottleneck.

## Risks / Trade-offs

- **The provisional list boundary duplicates some display/form concepts before `BL-074`.** → Keep it list-only, reuse existing primitives, record implementation fallout, and defer broad renaming or composition changes.
- **Nested focused tasks can lose query, scroll, or focus context.** → Keep browsing state outside the nested dialog, key rows by stable identity, and test cancel/save/return behavior across browsers.
- **Bounded desktop lists can create awkward nested scrolling.** → Limit them to the four proven dense targets, give each a clear boundary, allow normal boundary scroll chaining, and keep phones on the focused single-scroll presentation. The remaining case where a pointer wheel scrolls a still-scrollable collection instead of the sheet is explicit follow-up evidence; collapsing or focusing every desktop collection needs an isolated proof before replacing the accepted baseline.
- **Searchable detail may expose surprising matches.** → Define a small explicit searchable-text projection and cover it with deterministic unit cases rather than traversing arbitrary hidden fields.
- **Spell-level cards and logical spell search can present competing scopes.** → Keep level labels as visual organization while one spell browsing workflow owns search across levels and always displays level/prepared context.
- **Focused saves could overwrite unrelated or filtered records.** → Resolve by stable identity against current canonical data and reuse atomic validated mutations; never save the visible filtered subset as a collection replacement.
- **The five-item preview initially reflects insertion order rather than deliberate priority.** → Preserve authored order consistently here and complete the already prioritized `BL-075` ordering change before saturated-sheet rehearsal.

## Migration Plan

1. Add the list projection, pure filtering/preview logic, and isolated Storybook proof without changing route consumers.
2. Stop for explicit owner review and revise the proof until approved.
3. Integrate Other Gear as the first route consumer while retaining a straightforward rollback to its existing `GridContent` card.
4. Roll the approved boundary through Weapons, Armor & Shields, and Spells, then audit the remaining sheet collections and landmarks.
5. Run focused and full applicable verification, reconcile implementation fallout into the artifacts and maintainer docs, and stop again for final owner approval.

The change has no data migration. Rollback restores the prior presentation while leaving canonical character data untouched.

## Open Questions

No product decision currently blocks implementation. The implementer may choose the smallest internal single-row form seam after inspecting current form machinery, but must bring any broader component-contract or observable-scope change back to the owner rather than absorbing `BL-074` or `BL-075` into this change.

## Implementation Notes

### 2026-08-02 pre-gate primitive audit

- Reuse `MenuButton` and `MenuItemButton` for the canonical row submenu, including the existing native-popover and WebKit focus fallback.
- Reuse `DialogShell` for complete focused browsing because it already supplies native modal behavior, full-height mobile presentation, one content scroll owner, close handling, and the repository-wide background scroll lock.
- Reuse `GridContentEditDialog` and `GridContentNotesDialog` in the isolated harness so the proof exercises current field and annotation controls. Add only a focused title seam if needed; do not extract the broader form architecture before `BL-074`.
- Reuse `BaseButton`, `Badge`, theme input classes, and the global touch-target baseline. No bespoke button, badge, checkbox, or dialog primitive is justified.
- Do not render the new list through `GridContent`: its arbitrary nested-field and card-dialog responsibilities would require the extra conditional branch this bounded proof is meant to avoid.
- Do not reuse `FieldAnnotationControl` as the row Notes command because it owns a separate visible trigger, which would conflict with the accepted submenu as the canonical complete row-action path. Reuse the existing annotation dialog/editor machinery instead.
- Do not reuse `RuntimeActionSourcePicker` as the list implementation. Its selection, category-filter, retained-hidden-selection, and equipped-only contracts differ from collection browsing; only compatible visual/search concepts are carried forward.

### 2026-08-02 isolated-proof verification

- `npm run check` passes with zero Svelte errors or warnings. The Svelte autofixer reports no issues in the new list components; its remaining lifecycle suggestions concern the existing `GridContentEditDialog` open/close pattern, which this proof reuses rather than refactors ahead of `BL-074`.
- The focused list/projection tests pass (2 files, 7 tests), and the complete Storybook browser suite passes (13 files, 63 tests), including responsive browsing, filtering, Edit and Notes save/cancel behavior, background scroll locking, and focus restoration.
- Repository ESLint and a Prettier check scoped to every file changed by this implementation pass. The required `npm run lint` command was also run, but its repository-wide first Prettier stage remains blocked by seven pre-existing documentation files outside `BL-064`: `AGENTS.md`, `docs/fillable-pdf-interoperability-audit.md`, `docs/vision/evidence/2026-08-01-pre-playtest-surveys.md`, `docs/vision/PRD-v0.md`, `docs/vision/system-design-notes.md`, and two archived `BL-067` artifacts. This change does not rewrite unrelated documentation merely to make the global formatter pass.
- The owner-facing manual responsive, focus, touch, truncation, search, and scrolling checks are recorded in `docs/dense-collection-storybook-checklist.md`. Sheet integration remains intentionally untouched until task 3.1 receives explicit owner approval.

### 2026-08-02 owner proof feedback

- Replace the separate phone `… / X more items` row with one full-width `Browse all X items` action so the five-row preview uses the available height for authored content.
- Use a visible boundary, lightweight scrollbar, and scroll-position-aware shading to signal overflow on bounded desktop lists and the focused phone dialog. The shading disappears at the reached boundary instead of fading the final item permanently.
- Keep both the full-size `Clear search` control and a directly actionable inline `Clear` in the no-match explanation. The inline control is an approved prose-flow touch-target exception with the full-size button retained as its equivalent path.
- Add and Remove remain available through the existing collection-level bulk editor during sheet integration. The accepted row submenu remains the focused Edit/Notes baseline; a dedicated row Delete action would require a separately approved destructive-confirmation and validated-mutation scope rather than being implied by this presentation proof.
- Keep row badges optional and omit the redundant Inventory type badge from group-local Weapons, Armor & Shields, and Other Gear projections. Quantity, equipped state, and other row-distinguishing context remain available; mixed-source surfaces continue to own their source-type labels independently.
- Separate the focused collection's fixed Close footer from its scrolling content with a quiet rule and additional spacing. Scope this treatment to the opt-in scroll-affordance mode so ordinary dialogs do not acquire an unrelated visual change.

### 2026-08-02 sheet integration fallout

- Keep `GridContentList` presentation-only. A thin 2014 sheet adapter owns selection state, projects the existing focused edit/annotation dialogs, and translates saves into identity-owned sheet intents; it does not teach the list component about inventory, spells, schema paths, or persistence.
- Add atomic item/spell value and annotation intents that resolve the supplied stable ID against current canonical data and verify its expected equipment group or spell level before mutation. These intents preserve record position, hidden fields, source links, and unrelated records; bulk Add/Remove continues through the existing validated collection editor.
- Present Spells as one searchable logical collection with discrete Spell badges, cantrip/level/prepared context, and cantrip-to-ninth-level visual grouping that preserves relative authored order within each level. Keep ability, save DC, and attack bonus in a compact Spellcasting summary, followed by one discrete Spell Slots group and then the collection. Runtime-action source navigation targets the logical Spells collection and clears a collection query that would otherwise hide the requested inventory or spell source.
- Reuse `GridContentEditDialog` and `GridContentNotesDialog` for focused record work; the only dialog API seam added is a focused edit title. The adapter supplies record-shaped data and translates the result, while broader form-body extraction remains evidence for `BL-074` rather than a prerequisite for this behavior.
- Traits, Features, Runtime Actions, proficiency languages/tools, and miscellaneous notes remain on their existing paths in this change. Their current headings and actions are understandable, but owner review of the ten-note saturated fixture identified Misc. Notes as a plausible next dense consumer rather than proving it should stay simple. That visible expansion and the broader component ownership question remain follow-up exploration evidence for `BL-074`, not an unreviewed fifth target here.
- Retain Overview, Runtime, and Organizational regions as the non-destructive whole-sheet landmarks. Saturated desktop and phone browser checks found no need to introduce whole-sheet search, sticky navigation, selected-pillar modes, or hidden regions in this change.
- Treat the inline no-match `Clear` as a prose-flow touch-target exception with the full-size `Clear search` button retained as its equivalent conforming path. All new Browse, bulk, search, row-menu, dialog, and Close families otherwise use the repository touch-target baseline.
- No Firefox-specific code path is introduced. Cross-browser verification determines whether ordinary native menu/dialog/list behavior remains sufficient; the documented macOS profiling workflow is reserved for repeatable jank, not run speculatively.

### 2026-08-02 final verification and reconciliation

- Both required wrapper commands were run. `npm run verify:smoke` and `npm run verify:all` reach clean Svelte diagnostics, and the comprehensive command also reports zero audit vulnerabilities, but both stop at the repository-wide Prettier baseline: seven unrelated pre-existing documents remain unformatted. BL-064 does not rewrite those staged/historical files solely to make its gate green.
- Every downstream gate was therefore run independently: 102 unit tests and coverage pass; the application and Storybook builds pass; 63 Storybook browser interactions pass; the full application suite passes 53 tests across Chromium, Firefox, WebKit, and Mobile Chrome with 15 intentional viewport/project skips; and the Chromium performance baseline passes. Full ESLint, BL-064-scoped Prettier, Svelte diagnostics/autofixer, `git diff --check`, and strict OpenSpec validation pass.
- The first fully parallel cross-browser run exposed test-duration pressure in the saturated Firefox workflow, not a repeatable UI-jank signature. The two deliberately long desktop workflows now use a 20-second test budget; isolated Firefox and the complete rerun pass without application conditionals, so profiling and a Firefox-specific code path are not justified.
- The full suite also exposed that the third-party-notices link assertion describes the desktop About dialog while Mobile Chrome uses a different navbar surface. The test is now explicitly scoped to its existing desktop behavior instead of timing out while waiting for a control absent by design; mobile navigation retains its separate interaction and geometry coverage.
- Source navigation is reconciled with collection-local query state: navigating from a runtime action clears a query that would hide the requested item/spell, then focuses the stable collection landmark. Browser coverage protects both inventory and spell paths.

### 2026-08-02 final owner-gate revisions

- Title-case the visible collection command and its dialog as `Bulk Edit …`; the row command remains the focused singular `Edit` path.
- Put the searchable spell collection below the spellcasting and spell-slot summaries. The former duplicate `<level> Used` value and separate per-level slot cards are removed.
- Remove scroll containment from bounded desktop collections. This restores ordinary boundary chaining to the sheet but intentionally does not pretend to solve wheel interception while the nested list can still scroll.
- Record two owner-observed follow-ups in the ideation sandbox: compare explicit/focused desktop collection browsing against nested inline scrolling, and evaluate Misc. Notes & Scratchpad as another identity-owned searchable collection. A collapse-by-default behavior is not adopted without a proof because it could hide useful runtime information and weaken at-a-glance scanning.
- Revision verification passes: Svelte diagnostics report zero errors and warnings; all 102 unit tests pass; all 63 Storybook interactions pass; and the full Playwright matrix passes 53 tests with 15 intentional viewport/project skips across Chromium, Firefox, WebKit, and Mobile Chrome. Scoped Prettier and ESLint, `git diff --check`, strict OpenSpec validation, and the official Svelte autofixer also report no code issues. The autofixer considers the established type-only callback lint suppressions unnecessary, while the repository's configured ESLint requires them; retain the local lint-compatible pattern pending a separate TypeScript-aware ESLint configuration decision.

### 2026-08-02 empty-spellcasting and seed revisions

- Keep the compact Spellcasting summary and Spell Slots as two visually and accessibly distinct full-width rows, followed by the full-width searchable spell collection. The slot group always projects first through ninth level as editable `used / max` pairs with `0 / 0` defaults, so adding a newly reached spell level does not require a special add-row interaction.
- Decode the slot card's canonical-looking field patches as one validated semantic replacement. The reducer creates a spellcasting block with the class-derived or `int` fallback ability when the first meaningful slot is saved, preserves existing slot metadata, and omits every untouched `0 / 0` level from persisted data.
- Initialize the outer Spells panel collapsed only when the character has neither spell records nor a nonzero slot pair. Expansion remains the explicit path to the three setup surfaces; after the first spell or meaningful slot is saved, a reload starts the section expanded.
- Reuse the deterministic saturated fixture as a dedicated default seed with identity `char-5e-2014-saturated`. This gives owner rehearsal a stable UI entry point without making `char-001` unrealistically overloaded or maintaining a second saturated data copy.
- Revision verification passes: Svelte diagnostics report zero errors and warnings; 105 unit tests and coverage pass; 63 Storybook interactions pass; the full Playwright matrix passes 57 tests with 15 intentional viewport/project skips across Chromium, Firefox, WebKit, and Mobile Chrome; and both production builds plus the Chromium performance baseline pass. Scoped Prettier and configured Svelte ESLint, `git diff --check`, strict OpenSpec validation, and the official Svelte autofixer also report no issues in the affected files. The repository-wide Prettier baseline remains the same seven unrelated pre-existing documentation files recorded above.
- Final layout feedback stacks Spellcasting, Spell Slots, and the searchable spell collection as three full-width rows rather than allowing the first two groups to share a responsive row. A cross-browser geometry assertion protects that order; the focused dense-collection rerun passes 7 tests with 5 intentional viewport/project skips, alongside clean Svelte diagnostics, scoped formatting/lint, diff checks, strict OpenSpec validation, and official Svelte autofixing.
- The outer Spells heading and the fields themselves provide sufficient visible context, so the full-width Spellcasting and Spell Slots rows omit redundant visible subheadings while retaining named regions for assistive navigation. The focused cross-browser rerun passes 7 tests with 5 intentional viewport/project skips, and Svelte diagnostics, scoped formatting/lint, diff checks, strict OpenSpec validation, and official Svelte autofixing remain clean.

### 2026-08-02 saturated owner rehearsal

- The owner found the revised spell and inventory/equipment surfaces clear and highly functional under the dedicated saturated character. Preserve those accepted behaviors as the BL-064 baseline.
- The grid stretches the direct language and tool cards to their shared row height, while the bordered Feature and Trait cards sit inside stretched landmark wrappers. Give both inner cards full height so the visible borders follow the same row grammar; this is a narrow audit correction rather than a new density interaction.
- The Runtime Actions summary is demonstrably too tall under saturation, but it owns source badges, source navigation, resync, custom/source creation, and deletion-fallback behavior beyond the four BL-064 consumers. Route its searchable ten-item compact treatment and the simpler proficiency/Feature/Trait bounding questions to `BL-076` after `BL-074` clarifies the reusable presentation seam.
- The owner also found a sheet outline or jump-navigation surface increasingly valuable as saturation makes more containers and subcontainers meaningful. Record this as direct evidence for `BL-073`; do not add a navigation bar or scene mode inside the collection change.
- Verification after the height correction and backlog reconciliation passes with zero Svelte diagnostics or official-autofixer findings, clean scoped formatting and configured Svelte lint, clean staged/unstaged diff checks, strict OpenSpec validation, and the saturated Chromium collection suite passing 2 tests with 1 intentional mobile-only skip.
- Final visual review found that applying `height: 100%` to the inner Feature and Trait cards also added that height to their existing margins, pushing their borders into the parent boundary. Make each landmark wrapper a one-cell stretch grid instead; the inner card then fills the available track while its existing margin produces the same desirable inset as the direct Languages and Tools cards.
- The corrected inset treatment passes the final cross-browser saturated collection run with 7 tests and 5 intentional viewport/project skips, alongside clean Svelte diagnostics/autofixing, scoped formatting/lint, staged and unstaged diff checks, and strict OpenSpec validation. The owner explicitly approved completion and archival after this correction.
