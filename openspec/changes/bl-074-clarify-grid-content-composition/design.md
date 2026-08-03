## Context

The completed dense-collection work provides the first concrete list-oriented alternative to the original field/card renderer. The 2014 sheet now has enough real consumers to distinguish reusable presentation from page and domain orchestration without inventing contracts for hypothetical game systems.

The current boundaries concentrate several concerns:

| Boundary | Current responsibilities |
| --- | --- |
| `GridContent` | Normalizes field projections, classifies direct fields, lays out and formats values, routes primitive editing and annotations, owns card actions, opens Edit and Notes dialogs, restores focus, and adapts three save shapes. |
| `GridContentEditDialog` | Owns native dialog lifecycle, structured draft cloning, recursive field and array form rendering, value coercion, Save/Cancel, and patch collection. |
| `GridContentNotesDialog` and `FieldAnnotationControl` | Independently own overlapping dialog, focus, read/edit, annotation-draft, and save behavior for grouped and singular annotations. |
| `GridContainer` | Acts as a responsive layout grid, grid item, bordered/padded surface, nested-elevation owner, heading, and locally collapsed panel. |
| `Dnd5e2014DenseCollectionCard` | Owns selected-row and focus state, domain projection, typed identity translation, focused Edit/Notes workflows, and bulk editing. |

The 2014 route uses the container boundary for outer collapsible sections, responsive layout-only grids, bordered leaf cards, and field wrappers. The dense-list adapter also proves that generic row selection needs only an opaque stable key while semantic record identity and commit behavior stay domain-owned.

No canonical schema, persisted character, source-link, or user-visible workflow migration is part of this change. Existing specifications remain the behavioral baseline. `BL-077` separately owns any later View/Edit/annotation redesign.

## Goals / Non-Goals

**Goals:**

- Make display, structured-form, annotation, action/dialog, responsive-layout, panel, and domain responsibilities independently understandable and testable.
- Preserve current 2014 rendering, direct editing, structured editing, annotations, focus, validation, and local persistence.
- Supply stateful Storybook proofs before changing all current consumers.
- Keep generic row keys, domain record identity, and primitive binding identity distinct.
- Complete the approved migration and delete superseded component and prototype surfaces before archival.
- Leave bounded seams that `BL-076`, `BL-069`, and `BL-070` can evaluate rather than assume are universal.

**Non-Goals:**

- Implement View/Edit/annotation behavior from `BL-077` in the character sheet.
- Change collection density policy, search behavior, manual ordering, or runtime-action orchestration.
- Define a cross-system field projection, reducer, registry, page template, form engine, or universal card/list framework.
- Move projection, validation, typed intent, persistence, source navigation, or resync ownership into generic components.
- Retain a compatibility wrapper or rejected Storybook prototype as an undocumented cleanup task.

## Decisions

### 1. Keep a display-oriented field-group kernel

The cohesive responsibility inside `GridContent` is rendering a projected group of fields: normalize the existing `GridContentData`, choose the appropriate field presentation, and arrange those presentations. Extract this as a display-oriented body with no action-menu state, dialog state, focus restoration, or storage-facing save adaptation.

Working names such as `GridContentBody` or `FieldGroupView` are provisional until the Storybook proof makes the public prop language clear. The body may continue accepting `GridContentData` during this change; splitting the projection type is not required merely to enforce a narrower component boundary.

`GridPrimitiveField` remains the focused owner of direct primitive display, draft state, validation feedback, RFC 6902 patch preparation, and focus behavior. Pure formatting branches may become small render helpers when that reduces duplicated markup, but the change will not introduce one component per scalar display variant.

**Alternatives considered:**

- Keep `GridContent` as the complete card workflow: rejected because actions, dialogs, focus, form rendering, and save adaptation prevent isolated display testing and conflict with the approved component-composition direction.
- Replace `GridContentData` with a universal field schema: rejected because only one system sheet exists and the existing type is sufficient for a behavior-preserving extraction.

### 2. Compose card actions and focused workflows outside the display body

A card-level organism composes the field-group body with the existing action menu, focused Edit and Notes workflows, and focus restoration. The final name may remain `GridContent` for migration ergonomics or become `GridContentCard`; the Storybook gate selects the clearest owner-facing API.

The organism may adapt direct RFC 6902 callbacks and the current compatibility patch callbacks, but the display body will not. Page and domain code continue applying and validating changes. `Dnd5e2014DenseCollectionCard` remains feature-owned because selected-row identity, typed intent translation, query/source context, and bulk behavior are not generic presentation concerns.

The accepted Edit and Notes commands remain unchanged on the sheet. BL-074 may use extracted bodies in a non-shipping Storybook interaction study for `BL-077`, but rejected alternatives must be deleted or explicitly retained as named BL-077 evidence before this change is archived.

### 3. Extract structured form rendering from dialog lifecycle

The recursive field and array form belongs in a focused structured-form body. It owns local draft interaction, leaf input rendering, add/remove array controls, and validation presentation, but not native dialog opening, backdrop behavior, trigger focus, character persistence, or domain decoding.

The existing focused edit dialog becomes a thin composition of the form body with a platform-native dialog shell. Prefer native form semantics, including an explicit form owner and submit control, over custom event forwarding. Extend `DialogShell` only when the proof demonstrates one narrow, reusable form-footer or cancel contract; do not turn it into a general workflow controller.

The form body initially consumes the existing projection shape. Domain-specific projections and decoders remain outside it so a spell, inventory item, or future system record is not forced into a generic persisted model.

### 4. Reuse annotation display and editor bodies without unifying behavior prematurely

`GridContentAnnotationsDisplay` and `GridContentAnnotationsEditor` remain the reusable read and draft-edit bodies. A focused annotation surface composes them with dialog and focus behavior for either one field or grouped card annotations.

The current singular and grouped workflows may share this surface, but BL-074 will not change the visible Edit/Notes action grammar or combine authored and annotation saves. That behavioral transaction belongs to `BL-077` and requires specification changes.

The Storybook interaction study will compare:

1. bulk values with separate annotation management;
2. collapsed annotations inside each bulk row; and
3. bulk values with a focused per-row annotation action.

The study informs BL-077 only. It does not become route behavior during this change.

### 5. Layer identity rather than adding a general grid record ID

Identity remains purpose-specific:

- Generic list rows require an opaque stable `key` for keyed rendering, selection, and focus restoration.
- Domain adapters retain semantic identity such as item ID plus inventory group or spell ID plus level, and resolve it against the current character at commit time.
- Primitive field identity remains its binding/read path.
- Array indexes inside a structured-form draft are temporary traversal details and must not become persisted or selection identity.

This preserves the proven `GridContentListRow` plus domain-row extension pattern. `GridContentData` will not gain a universal record ID, and list rows will not learn domain mutation behavior.

### 6. Replace the multi-purpose container with focused layout and panel boundaries

The proof will separate three jobs:

- A responsive layout molecule owns grid flow, base and breakpoint column counts, gaps, and child placement behavior.
- A panel-surface molecule owns border, padding, visual surface, and nested elevation context.
- A collapsible-panel molecule composes a heading/toggle and panel content while owning local collapse state.

Working names such as `ResponsiveGrid`, `PanelSurface`, and `CollapsiblePanel` are provisional. Props should express the focused job directly and avoid reproducing the existing container's entire combinatorial prop surface.

`GridContainer` may exist only while the approved migration is actively in progress. The change must maintain an explicit use-site inventory, migrate every current consumer, prove that no imports or render call sites remain, and delete the wrapper before completion. If a concrete consumer demonstrates that the proposed split is incorrect, implementation stops at the owner gate and revises this decision instead of leaving a compatibility layer indefinitely.

### 7. Use Storybook as the pre-propagation proof, not as page simulation

Pre-gate stories will exercise reusable contracts with realistic state:

- field-group display with read-only, direct editable, annotated, empty, multiline/array, and responsive examples;
- primitive validation failure, cancel, save, and focus restoration;
- structured forms with nested fields, add/remove array entries, invalid input, and cancelled drafts;
- grouped and singular annotations with empty, read, add, edit, remove, cancel, and reference states;
- responsive layout plus nested, bordered, collapsed, and plain panels;
- the three non-shipping BL-077 bulk-annotation comparisons;
- dense-list composition and taxonomy using the existing saturated gear evidence rather than duplicating page-specific stories.

Automated play functions protect deterministic interactions and accessibility. Page-specific composition, persistence, and modal flows remain black-box Playwright responsibilities.

The apply workflow stops after this proof. Owner approval is required before the route-wide migration batch begins.

### 8. Reconcile documentation according to durability

- `docs/field-binding-contract.md` remains the current developer contract and will be corrected to match current locations and the direct-patch versus typed-intent boundary.
- `docs/field-interaction-model.md` retains durable selection, copy, accessibility, explicit-commit, and persistence-ownership principles while identifying exact View/Edit affordances as pending BL-077.
- `docs/field-rendering-api.md` will be marked historical/superseded because its call-site inventory and instruction that one component own all card dialogs no longer describe the approved direction.
- `docs/decisions/2026-07-25-classify-ui-component-composition.md` will be refined with the implemented molecule/organism and layout/panel ownership. No parallel organization-only ADR will be created.
- `docs/decisions/2026-07-18-use-typed-5e-sheet-edit-intents.md` remains authoritative for direct primitive versus typed structured mutation ownership.

## Risks / Trade-offs

- **[Risk] The refactor recreates the old component through many passthrough props.** → Keep display, form, annotation, dialog, layout, and panel proofs independently renderable; reject a seam that only moves files without narrowing ownership.
- **[Risk] A broad route migration changes visible layout or focus behavior.** → Establish Storybook baselines first, migrate representative mixed-field, dense-list, and nested-panel surfaces, then run focused browser checks before propagating further.
- **[Risk] Extracted generic types freeze 2014 assumptions before another system exists.** → Reuse current projections narrowly and preserve domain adapters; defer cross-system projection contracts to BL-070.
- **[Risk] A compatibility wrapper or throwaway prototype survives indefinitely.** → Track every old import and prototype in the task checklist, require zero-use searches and deletion before verification, and block archival if cleanup is incomplete.
- **[Risk] Dialog reuse weakens native form, Escape, focus, or mobile behavior.** → Prefer native dialog and form relationships, reuse the existing shell only through a narrow proven contract, and cover cancellation and focus restoration in Storybook plus cross-browser tests where relevant.
- **[Risk] The BL-077 comparison accidentally changes shipped behavior.** → Keep it in isolated stories, require owner review, and remove rejected experimental code before route migration.
- **[Trade-off] More focused components increase the number of files and composition points.** → Extract only boundaries with distinct state, rendering, or verification responsibilities; avoid wrappers whose only purpose is taxonomy.

## Migration Plan

1. Record the current `GridContent`, `GridContainer`, dialog, annotation, list, and 2014 route consumers plus their intended destination.
2. Establish focused unit and Storybook baselines without changing route behavior.
3. Extract field-group, structured-form, annotation, responsive-layout, panel-surface, and collapsible-panel proofs; add the BL-077 comparison study.
4. Stop at the named Storybook owner gate. Record approved names, ownership, taxonomy, and BL-077 study outcome before continuing.
5. Migrate one representative mixed field card, dense collection, and nested/collapsible panel composition; run focused diagnostics, component checks, and browser checks.
6. Migrate all remaining 2014 consumers while preserving page/domain mutation and navigation ownership.
7. Search for every legacy import, render call, compatibility-only helper, and rejected prototype. Delete `GridContainer` and other superseded surfaces once their use count reaches zero.
8. Reconcile ADRs and field/maintainer documentation, run the repository smoke gate plus relevant cross-browser coverage, and report implementation fallout.
9. Stop at the final user review gate. Archive only after explicit approval.

There is no persisted-data migration or deployment rollback. If the component migration regresses behavior, revert the affected composition to the last verified boundary; character documents remain unchanged.

## Open Questions

- Which final component names and minimal prop APIs are clearest in the isolated proof?
- Can `DialogShell` remain unchanged by using native form ownership for footer actions, or does the proof justify one narrow form-aware extension?
- Should the responsive preview/focused-dialog `GridContentList` move from the Storybook molecule category to organism while its view and row components remain molecules?
- Which bulk-annotation comparison should be recorded as BL-077's preferred starting point?
