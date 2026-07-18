## Context

`src/routes/charsheets/5e/+page.svelte` currently owns selected-character lookup, Svelte state, layout composition, static 5e metadata, card projections, annotation-path projection, compatibility patch normalization, validation, and save dispatch. The route is compiler-clean and behaviorally established, but this concentration makes feature work difficult to review and leaves important patch rules coupled to component compilation.

The active product scope remains D&D 5e 2014. The long-term product direction includes adding TTRPG systems quickly with limited duplication by pairing a schema registry with dynamic Svelte sheet rendering. That direction should constrain new work against needless drift, but one implemented system is not enough evidence to define the final registry, rendering contract, route shape, or adapter signatures.

## Goals / Non-Goals

**Goals:**

- Move 5e-specific metadata, projection calculations, and compatibility patch normalization out of the route.
- Keep extracted calculations stateless and deterministic for explicit inputs, including an injected ID factory where new identities are required.
- Preserve the existing `GridContentPatch[]` compatibility boundary and all current user-visible behavior.
- Add focused tests for the high-risk projection and virtual-path branches.
- Establish feature-local seams that can inform a future multi-system contract without pretending to be that contract today.

**Non-Goals:**

- Implementing additional game systems, a schema registry, dynamic sheet registration, or a unified dynamic route.
- Defining a mandatory cross-system projection or patch-normalization signature.
- Converting compatibility `GridContentPatch[]` operations to RFC 6902 JSON Patch documents.
- Migrating `$charsArray`, persistence, fixtures, or schema ownership; broader ownership cleanup remains in `p1-050`.
- Changing shared grid components, field interaction behavior, visual layout, styling, or persisted character data.

## Decisions

### Decision 1: Use feature-local modules without declaring a universal adapter

Extracted code will remain under `src/routes/charsheets/5e/`, close to the Svelte route and the page composition it supports. The route may import multiple focused modules; this change does not require a facade object or adapter class.

The expected responsibility groups are:

- static sheet metadata used across multiple projections or patch rules;
- 5e card and section projection builders;
- virtual-path recognition and compatibility patch normalization.

Constants that have only one owner should remain with that owner instead of turning a general constants module into a catch-all. Generic path and annotation behavior already available in `src/lib/` should be reused where its contract matches rather than copied into 5e modules.

This location is preferred over `src/lib/` or `src/schema/` because the extracted behavior is currently coupled to one sheet presentation. `p1-050` may later move proven feature boundaries as part of broader repository organization.

### Decision 2: Prefer cohesive per-surface projections over one generic return shape

The route currently renders independent overview, runtime, ability, proficiency, spell, inventory, and organizational card groups. Extraction will preserve those meaningful shapes through focused projection builders or a 5e-specific aggregate view model only where aggregation improves the route naturally.

This change will not force all outputs through `project(char): GridContentData`. A single `GridContentData` return cannot naturally represent every current array and card group, and imposing it now would make the extraction less faithful to the existing page.

### Decision 3: Preserve the compatibility patch boundary

The extracted normalizer will accept the current character plus `GridContentPatch[]` and return normalized `GridContentPatch[]`. It will preserve virtual paths, coalescing, default insertion, annotation conversion, no-op removal, `undefined` deletion semantics, and final application through `applyGridPatches`.

Direct primitive fields may continue to emit RFC 6902 `JSONPatchDocument` values through the existing field-save path. Unifying that path with legacy card-wide compatibility patches would change a stable boundary and belongs in a separate change.

### Decision 4: Make identity allocation explicit

Several normalizers allocate IDs for new annotations, actions, inventory items, currency records, and notes. Because the production allocator uses `crypto.randomUUID()`, these helpers are not deterministic from character and patch inputs alone.

Patch normalization will therefore accept an ID-factory dependency, defaulting to the current production allocator. Tests will inject a deterministic factory. The modules remain stateless and perform no persistence or store mutation.

### Decision 5: Keep Svelte reactivity and validation in the route

`$charsArray`, route props, selected-character lookup, collapse state, Svelte `$derived` declarations, schema validation, and save dispatch remain in `+page.svelte`. Extracted functions receive plain character data and return plain projection or patch data. The route continues to determine when recalculation and persistence occur.

### Decision 6: Preserve a non-binding multi-system architectural direction

The long-term intent is for a schema registry and dynamic Svelte rendering to work together so new TTRPG systems can reuse common loading, editing, annotation, and layout infrastructure without duplicating whole routes. Future system work should look for shared registration and rendering seams and explicitly document intentional divergence so system implementations do not drift independently by default.

This intent does not yet select:

- registry ownership or source location;
- static versus lazy registration;
- component, descriptor, or generated-layout rendering;
- route parameters;
- generic TypeScript signatures;
- how much layout is shared versus system-specific.

The architecture decision created by this change will record both the desired direction and the decision to defer those mechanics until at least one additional system provides concrete requirements. Future work may refine or supersede that decision rather than being constrained by guessed 5e-shaped interfaces.

## Risks / Trade-offs

- **[Risk] Virtual patch behavior regresses during extraction.** → Cover every virtual-path family, coalescing behavior, identity allocation, defaults, annotation conversion, and no-op handling with focused tests; run the black-box browser suite.
- **[Risk] A monolithic projection function merely moves route complexity.** → Preserve cohesive per-surface builders and use an aggregate only when it materially clarifies route composition.
- **[Risk] Generic helpers are duplicated in the 5e feature folder.** → Audit route helpers against existing `src/lib/` path, annotation, and descriptor utilities before extracting them.
- **[Risk] The long-term direction becomes an accidental present-day API.** → Keep registry and dynamic-rendering mechanics explicitly non-binding until another system tests the boundary.
- **[Trade-off] Feature-local modules may move under `p1-050`.** → Accept one possible later relocation in exchange for a safe extraction from the current route.

## Migration Plan

This is an internal, behavior-preserving refactor with no persisted-data migration. Extract one responsibility group at a time, keep the route wired to the current behavior throughout, and run focused tests after each group. If a slice regresses behavior, restore the route call site for that responsibility while retaining already verified extractions.

## Open Questions

None block implementation. The final number and names of projection functions may follow the existing sheet surfaces as extraction reveals cohesive boundaries; they must not be forced into a generic multi-system API by this change.
