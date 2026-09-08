## Why

The project has verified lawful rules-source boundaries and adopted self-hosted SRD artifacts, but users still have to follow isolated PDF links into accumulating browser tabs without a searchable resource path, consistent phone experience, or trustworthy source-state feedback. Rights-classified discovery and contextual navigation are now the next P0 prerequisite because the 2014 sheet must prove this document-oriented reference experience before later system sheets reuse it.

## What Changes

- Add searchable discovery over registered rules resources and curated sections, including version, attribution, ownership, availability, and locator health information.
- Allow one topic to reference more than one lawful source while keeping the preferred free, self-hosted path simple and placing alternate-source choices behind an explicit secondary action.
- Open supported self-hosted PDFs in a responsive in-app reference experience with exact-page navigation, document outline and find affordances, browser-history dismissal, and an explicit browser-viewer fallback.
- Present link-only references as clearly external, not-included sources with authoritative acquisition or information actions rather than attempting to embed or process their documents.
- Keep the preferred rules source for the active character system available through one persistent sheet-level Rules action so users can perform general document lookup without first finding a contextual locator.
- Add focused contextual References actions near representative character creation/class, equipment, and spell content while preserving an in-progress sheet edit across reference inspection and return.
- Fail closed when a source or locator cannot be verified: retain the citation and character-editing path, explain the unavailable or stale condition, and never silently substitute or remap the destination.
- Add deterministic locator-integrity, responsive navigation, accessibility, and black-box interaction coverage plus owner-reviewed desktop and physical-phone proof before propagating the viewer across the sheet.

## Non-Goals

- Normalized rules, spell, item, or class records; a public compendium API; generated rules summaries; semantic search; OCR; or a precomputed cross-document full-text index.
- User PDF selection, upload, local attachment, device persistence, cloud sync, or server-side document processing. A separate backlog follow-up owns future user-local PDF connection.
- Bundling, embedding, excerpting, or ingesting link-only sources, or implying that ez-chars supplies access to paid material.
- End-user editing of repository-maintained resource identity, rights/access classification, availability, or curated locator health from source-state results. User-authored annotation editing and future device-local source connection remain separate workflows.
- Creating, pinning, or organizing new user-authored document locations from inside the viewer. A post-playtest backlog exploration owns that source-aware annotation workflow.
- Assuming that every browser PDF viewer supports identical search, outline, focus, or deep-link behavior without an explicit fallback.

## Capabilities

### New Capabilities

- `rules-resource-discovery`: Search and inspect rights-classified resources and curated section locators while understanding source identity, attribution, ownership, availability, alternates, and locator health.
- `contextual-reference-navigation`: Follow registered references from character-sheet context into the appropriate in-app or external source experience and return without losing in-progress work or interaction context.

### Modified Capabilities

None.

## Impact

- Introduces a shared resource catalog and curated locator data consumed by the resource library and 2014 character sheet.
- Adds a responsive reference-viewing surface, history-aware navigation state, explicit external-source handling, and source-integrity failure states.
- Adds a pinned client-side PDF rendering dependency within the isolated viewer proof, retains it for rollout only after approval, and therefore triggers the repository dependency verification gates.
- Establishes an ADR for the durable resource-viewer, browser fallback, source-processing, and indexing boundary.
- Expands component, unit, and browser verification around search, exact-page navigation, document find/outline behavior, draft preservation, keyboard focus, phone navigation, source drift, and unavailable states.
