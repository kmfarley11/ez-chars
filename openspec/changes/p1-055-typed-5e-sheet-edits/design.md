## Context

`GridContent` card-wide editing currently emits `GridContentPatch[]`, whose path is an arbitrary string/number array and whose value is `unknown`. The 5e feature then recognizes virtual paths, validates editor-shaped values property by property, coalesces related patches, supplies missing defaults, translates them into canonical character paths, and removes no-ops. `p1-045` made that behavior independently testable in `sheetPatches.ts`, but intentionally preserved the compatibility boundary.

The direct primitive field path already emits RFC 6902 documents and is not the source of this problem. The guard-heavy behavior is concentrated in structured collection/card edits where the editor representation differs from canonical 5e storage. `p1-060` is expected to change some canonical storage shapes later, so this change must establish a stable 5e edit vocabulary without baking current persistence conventions into the UI.

## Goals / Non-Goals

**Goals:**

- Give every supported structured 5e edit an explicit discriminated type and schema-backed payload.
- Separate decoding of generic editor output from 5e domain edit semantics.
- Apply a batch atomically and return either one validated next character or a failure with no committed partial result.
- Preserve unrelated records, existing IDs, annotation behavior, defaults, deletion behavior, and deterministic test identity allocation.
- Remove the virtual-path dispatch chain from the domain reducer and substantially reduce `sheetPatches.ts`.

**Non-Goals:**

- Changing persisted character, storage-envelope, import/export, or schema-version shapes.
- Replacing direct primitive RFC 6902 field edits.
- Defining a generic multi-system reducer or registry contract.
- Changing card layout, editing affordances, or supported user behavior.
- Moving unrelated files as part of `p1-050`.

## Decisions

### Decision 1: Use feature-local discriminated edit intents

Define a 5e-only union covering the current structured edit families: spell lists, runtime actions, proficiency languages, class features, inventory groups, currency, roleplay fields, scratchpad notes, and annotations. Each variant carries the semantic target and a typed payload rather than a virtual destination path.

This vocabulary remains near the 5e route. It is evidence for a future system adapter, not a mandatory cross-system interface. A generic intent hierarchy was rejected because one system still cannot establish which operations genuinely repeat across systems.

### Decision 2: Keep a narrow decoder at the generic editor boundary

`GridContent` may continue emitting its current compatibility patches during this change. A narrow 5e decoder will recognize the finite virtual paths, coalesce related card patches, and parse payloads with dedicated Zod schemas into typed intents. After decoding, no domain reducer function accepts `unknown` values or dispatches on virtual paths.

This transitional decoder is preferred over changing generic grid component APIs in the same change. It localizes unavoidable untrusted-boundary checks while avoiding a cross-cutting renderer redesign. Projection metadata or a later renderer change may eventually eliminate even this adapter, but that is not required to remove weak values from domain logic.

### Decision 3: Reduce intents directly to a validated next character

Use a pure feature-local reducer with a result boundary equivalent to:

```ts
type SheetEditResult =
	| { ok: true; character: CharacterDocument5e2014 }
	| { ok: false; issues: ReadonlyArray<SheetEditIssue> };
```

The reducer accepts the current character, a batch of typed intents, and an injectable ID factory. It builds a candidate without mutating the input, validates the final candidate with the 5e schema, and returns success only after the whole batch is valid. The route commits only successful results.

Returning a character is preferred over compiling structured domain commands back into RFC 6902. Collection replacement, identity preservation, coalescing, and default insertion are clearer as domain transformations; recreating path operations would retain much of the current translation machinery. Direct primitive edits remain RFC 6902 because they already target canonical leaf fields naturally.

### Decision 4: Validate payloads once, then rely on exhaustiveness

Each decoder uses a schema dedicated to its editor payload. Manual guards remain only where they classify an external path or report a malformed payload. Reducer branches receive inferred types and use an exhaustive `switch` with a `never` assertion so adding an intent requires adding its behavior and tests.

Malformed or unrecognized structured edits produce a typed failure and do not silently become empty arrays or partial deletes. Existing empty-value deletion semantics remain explicit valid intent behavior.

### Decision 5: Preserve stable identity and unrelated data as reducer invariants

Replacement intents merge by existing ID where the editor supplies one and allocate an ID only for genuinely new records. Each domain reducer owns how it preserves records outside its target group. Multi-field surfaces such as currency and organizational notes are decoded into one semantic intent before reduction so they cannot partially commit.

### Decision 6: Record the API-boundary decision

Add a lightweight ADR documenting the feature-local intent/decoder/reducer boundary, why structured edits return a validated next character, and why the design remains non-binding for other game systems. Reconcile the field-binding and rendering docs after implementation.

## Risks / Trade-offs

- **[Risk] The decoder merely renames the old monolith.** → Limit it to path classification, coalescing, and schema parsing; prohibit canonical character transformation inside the decoder.
- **[Risk] Direct field and structured card saves remain two mechanisms.** → Keep their ownership explicit and cover both in browser tests; unification is not valuable if it forces domain commands back into leaf patches.
- **[Risk] Returning a whole candidate character could hide accidental mutation.** → Freeze or compare the input in focused tests and require immutable transformations.
- **[Risk] Silent invalid-edit behavior changes.** → Return typed failures, leave the stored character untouched, and test malformed payloads. Do not introduce new user messaging unless implementation reveals an existing reachable invalid state.
- **[Trade-off] A thin compatibility decoder remains.** → Accept the narrow adapter until generic grid editing has a proven system-neutral intent hook; the domain layer still becomes typed and exhaustive now.
- **[Risk] `p1-060` changes canonical shapes soon afterward.** → Keep intents semantic and storage-agnostic so only reducer implementations, not the editor vocabulary, need to change.

## Migration Plan

1. Define intent and result types plus payload schemas without changing call sites.
2. Introduce the decoder and reducer beside `sheetPatches.ts`, using the current tests as equivalence fixtures.
3. Rewire the 5e card-wide save path to decode and reduce atomically.
4. Remove superseded normalization branches and rename any remaining file to reflect its narrow adapter responsibility.
5. Run focused, full, and browser verification; restore the previous route call site if an unsupported compatibility case is discovered.

No persisted-data migration or release sequencing is required.

## Open Questions

None block implementation. File names and whether intent variants are grouped into domain sub-unions may follow the smallest organization that keeps the reducer and tests readable.
