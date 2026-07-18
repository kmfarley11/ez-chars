# 2026-07-18 Use typed 5e sheet edit intents

**Status:** Approved  
**Author:** Codex with project owner direction  
**Date:** 2026-07-18

## Context & Problem Statement

The generic grid editor emits paths paired with values of unknown shape. The 5e sheet previously interpreted virtual paths, validated editor payloads, inserted domain defaults, preserved record identities, and produced canonical character patches in one guard-heavy module. That boundary made supported edits difficult to enumerate and increased the cost of later schema, storage, and feature work.

The project needs a clearer 5e editing boundary before playtesting and before `p1-060` changes canonical runtime and persisted shapes. It must improve developer and agent comprehension without defining a premature multi-system API.

## Decision Drivers

- Make every supported structured 5e edit explicit, schema-backed, and exhaustively handled.
- Reject malformed batches without mutating or partially committing a character.
- Preserve stable IDs, annotations, unrelated records, and current deletion/default behavior.
- Keep direct primitive RFC 6902 editing intact.
- Give `p1-060` a semantic edit vocabulary that is not coupled to current storage paths.
- Keep the implementation feature-local until another game system supplies evidence for a shared contract.

## Considered Options

### Continue normalizing generic grid patches into canonical patches

This preserves the smallest route change, but keeps domain behavior coupled to arbitrary virtual paths and unknown values. Adding a new edit still requires extending a monolithic dispatch chain.

### Compile typed intents back into RFC 6902 operations

This would give both save paths one output format, but collection replacement, identity preservation, note coalescing, and default insertion remain more complicated when expressed as path operations. It would retain translation machinery without improving the domain model.

### Decode feature-local intents and reduce them to a validated character

This confines path and unknown-value inspection to one narrow adapter. The reducer receives only typed semantic intents, transforms a private candidate, validates the final character once, and returns either the complete next character or explicit issues.

## Decision Outcome

Use feature-local discriminated 5e sheet edit intents for spells, runtime actions, proficiency languages and tools, class features, inventory groups, currency, organizational notes, and annotations.

The boundary has two parts:

1. `sheetEditDecoder.ts` classifies the current generic grid output, parses editor payloads with dedicated Zod schemas, coalesces currency and organizational-note batches, and reports malformed or unsupported structured targets. Canonical card patches that do not require 5e semantic translation remain an explicit compatibility output.
2. `sheetEditIntents.ts` exhaustively reduces typed intents against an isolated candidate and validates the final 5e character once. It returns a discriminated success/failure result; the route commits only successful results.

Direct primitive fields continue to emit and apply RFC 6902 documents through their existing route-owned path. The typed structured boundary does not replace that mechanism.

This decision does not define a shared adapter, registry, reducer signature, or intent hierarchy for other game systems. The 5e types are implementation evidence for future comparison, not a binding cross-system contract.

### Consequences

- Supported structured edits are discoverable from one intent union and one exhaustive reducer switch.
- Payload validation and generic path classification are isolated from domain transformation.
- Invalid batches cannot partially update the store.
- Stable identity behavior can be tested deterministically through an injected ID factory.
- Later 5e schema migration should primarily change reducer implementations rather than editor vocabulary.
- A thin canonical-patch compatibility path remains until generic grid/card editing gains a proven system-neutral semantic hook.
- Structured and direct primitive saves intentionally remain separate mechanisms with shared route/store persistence ownership.

## Refinements & Follow-Ups

- `p1-060` should reuse the semantic intent vocabulary while updating reducers for normalized runtime and persisted shapes.
- `p1-050` may relocate the feature-local modules if broader repository organization benefits, but should preserve their established responsibilities.
- A future additional-system proposal must compare its editing needs with this boundary before extracting shared interfaces.

### 2026-07-18: `p1-060` canonical reducer ownership

The reducers now write only canonical `dnd5e-2014.v2` groups. Runtime actions remain a required collection; currency and roleplay are keyed semantic singletons without synthetic item/note IDs; and language/tool rows carry ancestry, background, class, feature, or other provenance under `systemData.proficiencies`. The decoder gained the matching tool-proficiency intent because direct array patches would otherwise write strings into source-aware records.

Legacy representations are upgraded before the sheet receives a character. Removing their fallback branches from the decoder, reducer, and projections preserves the original semantic boundary rather than changing it into a migration layer.
