# Docs Index

This directory now separates the active MVP working set from longer-term vision material.

## Current Working Set

Use these docs for near-term implementation work:

- [../AGENTS.md](../AGENTS.md): shortest current-state guide for coding agents
- [active-goals.md](active-goals.md): active product scope and success criteria
- [vision/PRD-v1.md](vision/PRD-v1.md): target-state first-external-playtest contract; not a statement of current behavior
- [backlog.md](backlog.md): prioritized engineering backlog
- [rules-resource-policy.md](rules-resource-policy.md): source-rights classifications, reference minimum, and adopted/candidate source register
- [fillable-pdf-interoperability-audit.md](fillable-pdf-interoperability-audit.md): three-system form inventory, fidelity matrix, and export/import sequencing
- [import-export-json.md](import-export-json.md): MVP JSON backup envelope and import semantics
- [field-interaction-model.md](field-interaction-model.md): target MVP model for field editing and annotations
- [field-binding-contract.md](field-binding-contract.md): field-scoped read, mutation, patch, and save contract for grid editing
- [field-rendering-api.md](field-rendering-api.md): current direction for consolidating grid rendering, primitive editing, annotations, and binding APIs
- [accessibility-control-audit.md](accessibility-control-audit.md): bounded home-to-sheet control-family audit and verification evidence
- [verification.md](verification.md): local test/check/lint/build command guide

## Maintenance And Reference

- [theme-visual-checklist.md](theme-visual-checklist.md): UI and theme smoke checklist
- [ext/Readme.md](ext/Readme.md): notes for bundled third-party reference docs/assets
- [../THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md): licensing and attribution for third-party materials

## Architecture Decisions

- [decisions/2026-07-12-adopt-openspec-workflow.md](decisions/2026-07-12-adopt-openspec-workflow.md): ADR adopting OpenSpec and backlog refinement workflows
- [decisions/2026-07-17-testing-strategy.md](decisions/2026-07-17-testing-strategy.md): ADR defining the Vitest and Playwright testing boundaries
- [decisions/2026-07-17-prefer-platform-native-ui-primitives.md](decisions/2026-07-17-prefer-platform-native-ui-primitives.md): ADR preferring platform primitives while documenting retained UI exceptions
- [decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md](decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md): ADR keeping current sheet helpers feature-local while preserving the long-term registry direction
- [decisions/2026-07-19-runtime-action-templating-architecture.md](decisions/2026-07-19-runtime-action-templating-architecture.md): ADR designing local inference and asynchronous boundaries for deriving 5e actions from character source records
- [decisions/2026-07-25-classify-ui-component-composition.md](decisions/2026-07-25-classify-ui-component-composition.md): ADR defining atoms, molecules, and organisms for component composition and Storybook organization
- [decisions/2026-07-31-require-coarse-pointer-touch-targets.md](decisions/2026-07-31-require-coarse-pointer-touch-targets.md): ADR requiring explicit coarse-pointer touch targets and bounded exceptions
- [decisions/2026-07-31-classify-rules-resources-by-rights.md](decisions/2026-07-31-classify-rules-resources-by-rights.md): ADR selecting a hybrid self-hosted/link-only reference strategy based on verified permitted use

## Long-Term Vision

Use these docs for future planning, not as the active implementation backlog:

- [vision/index.md](vision/index.md): long-term vision hub
- [vision/author-desires.md](vision/author-desires.md): durable product intent, product horizons, and vision-level priority queue
- [vision/PRD-v0.md](vision/PRD-v0.md): historical baseline for the initial stack and product direction
- [vision/system-design-notes.md](vision/system-design-notes.md): preserved cross-system design notes
- [vision/evidence/2026-08-01-pre-playtest-surveys.md](vision/evidence/2026-08-01-pre-playtest-surveys.md): anonymous pre-playtest survey evidence and product-direction reconciliation
