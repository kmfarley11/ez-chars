## Context

The 2014 sheet currently has sound low-level mutation boundaries but several competing interaction shells. Frequently changed scalar values morph inline; ordinary cards expose separate Edit and Notes actions; dense rows repeat Edit, Notes, and Pin commands; supporting collections rely on card-wide bulk dialogs; and phone-focused collections can hand off into additional dialogs. Each path works in isolation, but the combined language is difficult to predict and especially cumbersome on a phone.

The implementation already distinguishes two important save mechanisms that should remain intact:

- direct primitive edits produce guarded RFC 6902 patches; and
- compound records and collections use domain-owned edit intents, validate a complete candidate character, and commit only valid state.

This change therefore redesigns presentation and workflow composition without changing the persisted schema, record identities, annotation model, or local-first persistence boundary. It precedes category-navigation and multi-system expansion so those efforts inherit a coherent interaction language.

## Goals / Non-Goals

**Goals:**

- Make the normal sheet an uncluttered read surface with editing available at a predictable depth.
- Preserve fast inline interaction for explicitly classified runtime state.
- Present authored detail, provenance, annotations, and references together for rich fields and records.
- Make one focused Save or Cancel apply to the complete draft rather than requiring independent Edit and Notes submissions.
- Keep scan-first collection browsing, player priority, direct record creation, and focused record removal understandable as separate concerns.
- Preserve collection query, scroll context, focus return, and a predictable Back path across browse, detail, and edit states.
- Prove the model on representative runtime, rich-field, dense-record, and mixed-ownership collection fixtures before broad rollout.

**Non-Goals:**

- Shipping a global sheet-wide edit mode, a general section-edit mode, or a form-like default sheet. Bounded comparison proofs remain in scope until the owner approves the leading model.
- Retaining legacy rich-record bulk editing or collection-wide bulk annotation editing as parallel editing models.
- A universal cross-system detail payload, record schema, reducer, or form engine.
- New character schema fields, migrations, source synchronization, or annotation storage semantics.
- Replacing efficient inline runtime controls with dialogs.
- Redesigning quickfilters, the PDF reader, or other work owned by later backlog items.

## Decisions

### Use a read-first three-tier interaction model

The sheet will have an implicit View state rather than a global View/Edit toggle:

1. **Runtime state:** explicitly classified, frequently changed scalar values edit in place within a stable control shell.
2. **Rich detail:** an explicit target opens a read-first focused view; one Edit action turns that view into a draft for authored information and annotations.
3. **Collections:** the sheet and focused collection surfaces remain scan-first; individual records use the rich-detail workflow, established Pin/Unpin owns player priority, collection-level Add creates one record, and eligible removal remains associated with that record.

This model is preferred over a global edit mode because combat-time changes should not turn unrelated sheet content into controls, and because a hidden global state makes it harder to predict what a tap will do. A general section-local edit mode is also rejected for rollout: it preserves much of the current bulk-form ambiguity and combines unrelated records. Both alternatives remain bounded proof comparisons until the owner approves the leading direction.

### Require explicit classification for persistent inline editing

Only fields deliberately classified as frequent runtime state receive persistent inline affordances. Missing or incomplete presentation metadata defaults to read-first, quiet behavior. The initial runtime set follows the existing projections for values such as current and temporary hit points, death saves, and remaining hit dice; rollout must audit the complete 2014 sheet rather than infer runtime behavior from primitive data type alone.

The inline shell keeps its dimensions stable when editing begins and uses compact, named controls with accessible labels for confirm and cancel. Generic increment/decrement controls are not introduced because numeric fields do not share one safe delta meaning.

The proof also establishes a narrow shared `IconButton` presentation primitive for the compact controls it actually exercises: Edit, Confirm, Cancel, open Detail, Pin/Unpin, and Add. It delegates sizing, shading, focus treatment, and coarse-pointer targets to the existing base button rather than reproducing those contracts at each call site. Every use still supplies a contextual accessible name and tooltip. Consequential lifecycle actions such as Remove remain labeled text controls. This is not a universal icon registry: standalone semantic glyphs such as list bullets and pin markers remain explicit components until multiple non-button consumers demonstrate a stable shared API, and rollout adds button variants only when an approved interaction needs them.

### Open rich detail through an explicit target, not the whole container

A name, value, or dedicated detail affordance opens focused detail. The whole card or row will not silently become a tap target because that conflicts with text selection, nested links, menus, and assistive interaction. Once that target exposes authored information, annotations, and references together, ordinary Edit and Notes/References overflow accelerators are removed rather than retained as duplicate entry paths. Menus remain justified only for genuinely domain-specific commands, such as Runtime Action source navigation and resynchronization, that the focused authored-detail workflow does not absorb.

The read-first view presents the approved vertically ordered, scrollable composition of authored detail, provenance, annotations, and references. A stacked composition is preferred over tabs because it keeps context visible, makes one atomic Save understandable, and avoids hiding important content behind unlabeled state on narrow screens.

### Use one local draft and one atomic commit for focused editing

Entering Edit creates one local draft for the selected target, including both authored values and annotations. Annotation removal changes only the draft and offers in-draft Undo; it does not persist immediately or require a confirmation dialog. Cancel discards the entire draft and returns one logical level to the same target's read-first detail; it does not dismiss the focused workflow. Escape and backdrop cancellation follow that same one-level unwind while editing, while Close from read-first detail dismisses the workflow. Save validates and commits the complete target once, or leaves the character unchanged and keeps the draft available with actionable errors.

An annotation-capable leaf with no draft annotations uses a compact, right-aligned Add note action rather than rendering a bordered `Notes (0)` disclosure and empty message. Creating the first annotation reveals and focuses the full existing editor; populated annotation collections retain their count and disclosure. The schema and implementation continue to call these structured entries annotations, while the user-facing UI consistently uses the shorter, familiar Note/Notes vocabulary. This density correction does not require annotations on every field and does not change the target-wide atomic Save boundary. Production review also raised a broader idea—piecewise field editing within read-first Detail—but that choice affects draft ownership, partial commits, validation, dirty-state visibility, and navigation. P0 `BL-085` owns a production-backed comparison before the shared focused workflow changes.

The shared workflow coordinates presentation state and commit timing, not domain data shape:

- a rich primitive target may compose authored and annotation operations into one guarded patch document; and
- a compound record continues through its domain-owned adapter or typed intent, which applies the draft to a candidate character before one schema validation and commit.

This preserves current schema ownership and avoids a premature universal item reducer.

### Treat collection browse, record detail, priority, and lifecycle as one navigable workflow

Collection browsing opens record detail without losing the active query, scroll position, or invoking focus destination. On a phone, a focused collection transitions inside the same full-height workflow from browse to detail to edit; it must not stack a second modal over the first. Back returns one logical level and restores the prior browse context. On larger screens, the same logical state may use a centered or wider dialog while preserving equivalent navigation.

State-sensitive Pin/Unpin is the accepted cross-collection priority grammar. For repeatable records in pinnable collections, it is a first-class row action immediately beside the explicit detail target rather than being hidden behind that record's overflow menu or duplicated by a collection-level batch manager. The pin control communicates its toggle state accessibly, commits immediately outside the authored-detail draft, and preserves a useful focus destination when priority reordering moves the record. The reusable batch Pin implementation remains in the component layer but is not exposed by this rollout; reconsider it only if playtest evidence shows that repeated row-level changes are materially slow. Same-list moves use the approved brief transform-only reorder animation with a zero-duration reduced-motion path; rollout pauses if measured performance evidence contradicts the proof. Singular rich fields such as Background and Ancestry do not receive meaningless pin controls because they have no sibling collection priority to change. Creating a record uses a direct collection-level Add action that captures only the minimum authored information needed to create it. Traits create an ancestry-owned record through the existing validated reducer and remain subject to ancestry ownership for removal. Successful creation closes that bounded task, returns focus to its invoking Add control, and leaves the new record reachable from the collection rather than forcing an unsolicited transition into detail. Eligible removal stays with the selected record's focused workflow, where ownership and destructive-action treatment can be represented accurately. Existing rich-record values and annotations remain editable only through individual focused detail. A generic Organize Collection or reorder workflow is not part of the rollout baseline because it adds a competing collection action, can duplicate pinning, and cannot safely assume that general, class-owned, source-owned, and minimal records share removal or ordering semantics.

The working batch organizer remains valuable design evidence, so it is preserved in one explicitly deferred Storybook-only concept sandbox. That sandbox is not a proposed production surface and does not authorize propagation. A backlog trigger governs reconsideration if playtesting shows that Pin/Unpin plus singular Add/Remove becomes materially inefficient.

Supporting collections retain their compact scan surface, but each item gains an explicit path to focused detail without being forced to adopt the full equipment/spell row-menu grammar.

The legacy collection-wide Notes dialog will not remain an editing surface, and the proof will not retain a read-only Annotated Items overview. Compact record metadata is presented as inline title-adjacent badges in semantic reading order—domain descriptor or ownership first, transient state such as Prepared next, and the note count last—before any supporting detail. This is a density and scanning treatment, not an implicit promise that every badge is interactive, sortable, or filterable; BL-078 owns evidence-based quickfilter behavior. Aggregate collection-note badges are omitted because they add visual weight without identifying which records need attention. Opening a record presents its actual annotations in context.

### Preserve Runtime Actions' source-aware boundaries

Runtime Actions participate in the interaction language without being flattened into generic dense records. Custom and source-linked actions may open the same read-first focused detail, and eligible action-owned fields plus annotations may share one focused draft. The existing Add Action workflow remains a specialized source-picker-or-custom creation path. View Source and Resync remain distinct source-specific commands, and the change does not alter which snapshot fields a source owns, what resynchronization may overwrite, or the collection's independently authored ordering.

The legacy card-wide Edit and Notes dialogs cease to be the canonical way to modify all actions once individual paths and explicit record-lifecycle actions cover their responsibilities. If the current source-ownership contract cannot be represented without changing resync semantics, rollout pauses for artifact reconciliation rather than broadening this change silently. Action-category quickfilters remain deferred to BL-078.

### Prove the pattern before propagating it

One economical Storybook proof should exercise five representative fixtures in a shared comparison sandbox and the closest reusable existing stories:

- Current HP for stable Tier 1 runtime editing;
- an annotated profile or background field for Tier 2 read-first detail and atomic authored-plus-annotation editing;
- the saturated character's Random rock equipment record for long detail, identity, pin state, annotations, and row entry points;
- the saturated Features collection for Tier 3 browsing, mixed general/class ownership, individual detail, and per-record note discovery; and
- the saturated Spells collection for level grouping, prepared state, global pinning, duplicate-name identities, per-record note discovery, and source links.

The Spells proof reuses the existing grouping and identity concerns without adding a redundant story. The approved baseline exposes Prepared as rapid scan-row state and within focused Edit while routing both through one canonical mutation boundary.

The Random rock fixture appears inside a representative three-group equipment composition rather than beside inert placeholders. Weapons, Armor & Shields, and Other Gear all use compact bullet rows with title-adjacent metadata and note badges followed by supporting content, adjacent Pin/Unpin and Detail controls, and a collection-level Add action. Each group remains a simple list through five records; the sixth record activates search, bounded scrolling with directional overflow cues, and a complete Browse All path so repeated Add cannot grow the sheet indefinitely. Add collects only minimum initial authored information, closes on success, and returns focus to the invoking Add control; eligible Remove is a labeled destructive action in focused detail with an explicit confirmation step, while source- or class-owned records omit it. This makes lifecycle placement and saturation behavior part of the pre-gate decision instead of deferring an unproven interaction until broad rollout.

One additional Storybook-only organizer sandbox is justified because it preserves a materially distinct batch-structure concept that the owner found promising but explicitly declined to propagate. Its manual review notes must identify it as deferred and surface the ownership and more-than-pinning evidence required before reconsideration.

The leading three-tier option must be stateful enough to evaluate open, edit, validation, Save, Cancel, annotation removal/Undo, Back, and focus restoration. The global and general section-edit alternatives may be bounded comparisons using existing behavior; they need not become throwaway full implementations. Storybook `play` functions are prohibited. Repeatable contracts belong in Vitest or Playwright, while `verify.md` maps the smallest story set to explicit human interactions on desktop and phone.

The proof's bounded equipment, Feature, and Spell lists share one proof-local bounded-region component built on the existing scroll-affordance attachment and fade styles, so their independent scroll boundaries match the production sheet without prematurely replacing the legacy collection components under evaluation. After the gate, rollout should promote the approved bounded viewport, focusable region, and directional-fade composition into a small reusable production presentation component for inline collection consumers; `DialogShell` retains its distinct whole-surface scroll composition and sticky footer behavior.

Propagation began only after the owner approved discoverability, density, navigation, and the browse/manage boundary at the named human checkpoint on 2026-09-19.

### Reconcile production section composition before final approval

The first proof established the interaction vocabulary successfully, but rollout review showed that its bespoke comparison did not exercise enough of the real section composition. In particular, it did not expose the legacy Tier 1 annotation control, the renderer's automatic reordering of mixed runtime/read-first fields, the complete six-ability and skill layout, the spellcasting summary, or the redundant competition between row-level Pin/Unpin and collection-level Manage Pins.

The corrective proof therefore uses production-backed organisms and the actual 2014 projections rather than expanding the all-in-one proof. Quick Reference owns the placement of its fields instead of allowing a generic renderer to hoist runtime fields implicitly. It groups frequent live state separately from a coherent read-first reference-stat card, keeps Remaining Hit Dice in only the live-state group, and gives the reference group one explicit focused-detail path. A lightweight shared section-break option gives movement values a labeled Speeds boundary without splitting their atomic Reference Stats edit. The shared field renderer owns both a compact inline label-and-value grammar and an explicit stacked label-over-value variant; ordinary read-first Meta, Reference Stats, and Background/Roleplay groups use the compact default consistently, while a section may deliberately opt into the more prominent stacked variant. Runtime tiles fill their grid tracks so short values do not create irregular bordered whitespace. The same group-level detail rule applies when multiple non-runtime fields share a visually bounded `GridContentCard`, including identity, appearance, and roleplay groups; a singular Prof. Bonus field uses only its own focused-detail target so it does not present duplicate chevrons. All-runtime groups retain their faster inline controls without a redundant group dialog. Treasure is deliberately reclassified as Tier 1 because coin totals change often during play. The same evidence verifies that read-first proficiency and spellcasting values remain editable through Detail then Edit without being promoted to persistent inline controls.

Tier 1 annotations remain distinct from the rapid value draft so a note does not force combat state into a modal workflow, but their entry control joins the compact action rail as a shared accessible icon action rather than occupying a new text row. Runtime Actions retain their independently authored order and remain outside generic pinning in this change; repeated owner feedback expands BL-078 to reconcile explicit timing navigation with persisted first-class Runtime Action Pin/Unpin. Trait creation uses the existing validated `replace-traits` intent and deliberately creates an ancestry-owned trait. Because the persisted model does not distinguish a newly authored trait from other ancestry-owned traits, generic Trait removal remains unavailable rather than implying ownership the schema cannot preserve.

Production review rejected a mixed interaction classification inside one compact spell-slot card. Used and Max now share the same Tier 1 classification and familiar runtime-row grammar within a compact level group: labels and values stay left-aligned while each field owns its adjacent Edit and annotation actions. Saving either row still submits the complete typed Used/Max pair required by the spell-slot intent, but the UI no longer invents a group-wide Edit control disconnected from field-local notes. The shared nested-runtime group fills its complete grid track in read and edit states so short values do not collapse inside their allocated row or column, and Spell Slots retain no competing group-detail target.

A final architecture audit makes the classification boundary explicit rather than styling-derived. Projection metadata declares `runtime` or `read-first`; missing classification remains safely read-first, while edit-affordance metadata only controls presentation within that semantic choice. Centralized helpers classify individual fields, all-runtime nested groups, and whole-card inline eligibility so card and field-group decisions cannot drift. The nested runtime-group component is a thin compound-save adapter around the same shared primitive renderer used for standalone Tier 1 fields—it does not own a second input, button, annotation, focus, or validation implementation. System code therefore selects content, tier, order, and typed mutation semantics, while the shared layer owns the approved interaction grammar. Purposefully isolated Storybook comparison scaffolding may remain bespoke, but production routes must compose these shared boundaries instead of reproducing them.

The current per-field annotation affordance remains a hypothesis about selective contextual notes, not an instruction that every value should accumulate annotations. BL-081's survey and facilitator prompts now distinguish lack of need from attachment-point confusion and later rediscovery failure. That evidence, plus the existing cross-record-note backlog trigger, will determine whether the long-term product needs coarser attachment or a character-level note discovery path.

Rejected focused saves and removals must report failure through their workflow boundary and leave the active surface open. Production-backed Quick Reference, Abilities & Proficiencies, and Spellcasting stories form a second named human checkpoint before final approval. Existing dense, supporting, and Runtime Action stories remain the review surfaces for collection action density; no viewport-only or interaction-only stories are added.

### Record the approved interaction trade-off in an ADR

The pre-gate batch will draft a lightweight Proposed ADR comparing the three-tier model with global and section-local edit modes. After explicit owner approval, rollout will update it to Approved with the actual proof outcome and consequences. The ADR records the durable design choice; OpenSpec continues to own the behavioral delta and execution plan.

## Risks / Trade-offs

- **[Risk] Explicit detail targets may be too quiet for new users.** → The proof tests visible naming, familiar iconography, and touch targets without converting the entire container into an ambiguous target or retaining duplicate ordinary menus.
- **[Risk] A unified detail surface becomes another oversized form.** → Keep it read-first, enter Edit explicitly, stack related content in a deliberate order, and keep Add plus eligible Remove as narrow lifecycle actions rather than another bulk form.
- **[Risk] Atomic authored-plus-annotation drafts accidentally create a universal data abstraction.** → Share workflow state and presentation only; retain domain-owned adapters and final schema validation.
- **[Risk] Phone collection transitions create nested overlays or lose context.** → Keep browse/detail/edit in one logical workflow and test Back, query, scroll, and focus restoration before rollout.
- **[Risk] Quiet defaults make an unclassified runtime field inefficient.** → Audit every current persistent field during rollout and treat omissions as reviewable classification defects rather than silently restoring the noisy default.
- **[Risk] Removing bulk editing makes repeated initial entry slower.** → Preserve dedicated Add flows, permit compact structural entry for genuinely minimal records, and validate the boundary against saturated Features and Spells rather than restoring an all-fields bulk form.
- **[Risk] Removing collection-wide annotation surfaces makes cross-record review harder.** → Use quiet note counts and focused detail for the first rollout. Revisit a true cross-record review surface only if playtest evidence shows that users accumulate enough notes for record-by-record discovery to fail.
- **[Risk] First-class Pin/Unpin makes compact rows too action-heavy.** → Pair one stateful pin icon with the existing detail target, retain accessible names and toggle state, and verify density on split-screen and physical-phone layouts before rollout.
- **[Risk] Priority reordering animation introduces mobile jank or disorients reduced-motion users.** → Trial only a brief transform-based same-list animation in the proof, make reduced motion instantaneous, and omit animation from rollout if human or performance evidence is negative.
- **[Risk] The deferred organizer concept is mistaken for approved rollout UI.** → Keep it in one separately named Storybook-only sandbox, label it as deferred in the rendered component and story guidance, and require backlog-trigger evidence before any propagation.

## Migration Plan

1. Build the five-fixture proof and Proposed ADR without propagating the pattern.
2. Run automated contract checks and record manual desktop/phone instructions in `verify.md`.
3. Stop for explicit owner review of the decisions listed below.
4. After approval, introduce the shared workflow shell and domain adapters incrementally, beginning with the proven fixtures.
5. Audit and explicitly classify direct fields, then migrate remaining rich cards and dense/supporting collections in bounded batches.
6. Remove superseded dialog paths only after equivalent entry points, validation, persistence, and focus behavior are covered.
7. Update legacy interaction documentation, approve the ADR, reconcile follow-ups into the backlog, and run the repository gates.

Because persisted data is unchanged, rollback consists of restoring the previous presentation components and entry-point wiring; no data migration or repair is required.

## Resolved Proof Decisions

The 2026-09-19 owner approval resolved the proof questions as follows:

- retain the compact stable Tier 1 shell and shared icon-button density;
- retain explicit detail targets while preserving selectable text;
- keep record-scoped note badges inline with semantic metadata and remove aggregate note badges plus ordinary Edit/Notes accelerators;
- retain brief same-list priority motion with an instantaneous reduced-motion path;
- use authored information, provenance, annotations, then references as the stacked detail order;
- expose Prepared in scan rows and focused Edit through one canonical state; and
- use the existing `DialogShell` full-height mobile boundary while keeping one logical workflow and one scroll owner.
