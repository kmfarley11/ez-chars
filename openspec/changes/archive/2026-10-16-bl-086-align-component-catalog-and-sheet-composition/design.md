## Context

BL-086 began as catalog cleanup. Owner refinement expands it into a coordinated ownership, composition, and discoverability refactor before broad BL-070 implementation. The [proposal](proposal.md) preserves approved player interactions and existing character data.

Concrete evidence:

- `src/lib/components` mixes generic primitives/workflows with domain consumers such as `RuntimeActionSourcePicker`; physical placement is not reliable evidence of generic ownership.
- `src/routes/charsheets/5e/components/UnifiedCharacterDetailWorkflowProof.svelte` is a 1,674-line historical proof with its own `unifiedDetailProofState.ts`. Its atomic drafts and controls no longer represent the approved label-targeted independent-save baseline.
- `Dnd5e2014SectionCompositionStory.svelte` uses real projections and organisms but duplicates route mutation orchestration, including patch handling and death-save initialization. Both wrappers must delegate to a single domain-owned implementation.
- The 2014 route owns sheet composition, persistence integration, navigation, and reference hosting. A source move alone will not make a production-backed Page example.
- Existing sparse/dense, long-content, duplicate-name, invalid-pin, rejected-removal, and page-scroll stories provide distinct evidence. Their coverage must be mapped, not presumed redundant.

The existing [composition ADR](../../../../docs/decisions/2026-07-25-classify-ui-component-composition.md) explicitly anticipates page-level examples as a revisit trigger. Its definitions of atoms, molecules, and organisms remain useful; its Pages deferral now needs amendment. BL-070 continues to own actual multi-system dispatch and schema boundaries.

## Goals / Non-Goals

**Goals:** trustworthy catalog provenance; understandable source ownership; shared production sheet composition and mutation logic; small use-case-driven generic sandboxes; preserved canonical fixtures and coverage; behavior-preserving migration with human review.

**Non-Goals:** a visual redesign, new system support, persistence/schema changes, universal sheet templates or registries, converting every organism to generic UI, new dependencies, BL-079 icon consolidation, or a repository-wide naming sweep.

## Decisions

### 1. Separate ownership from compositional scale

Use `src/lib/ui` for reusable presentation, not `src/lib/core`. UI describes the boundary more precisely; Core could become a miscellaneous bucket and overlap shared data-model terminology. System-specific organisms are legitimate organisms but do not belong to the generic UI hierarchy.

Target organization (illustrative file names, not APIs):

```text
src/lib/ui/
  atoms/icon-button.svelte
  molecules/...
  organisms/...
src/lib/systems/dnd5e-2014/
  components/...
  pages/character-sheet.svelte
  editing/...
src/lib/storybook/
  concepts/...
src/routes/charsheets/5e/+page.svelte
```

Colocate `.stories.ts`, story-only wrappers, and nearby `__tests__` with their owner. Generic helpers remain in their evidenced shared subsystem rather than being forced into UI; domain-edit helpers remain domain-owned. Scope the migration to the current component catalog, its UI owners, and the 2014 composition needed for authentic examples. Unrelated storage/schema/resource internals need not move.

The ownership inventory distinguishes **generic UI**, **system-owned**, **application-owned**, and **concept-only** code. Application navigation, branding, and version/theme controls such as `NavBar` and `AboutButton` are not generic UI or 2014 gameplay components. They may remain with their application host or in an explicitly documented retained location; a new directory is not required just to classify them. Record migration disposition separately as move, retain in place, replace, or retire. Map which existing `src/lib/dnd5e2014` helpers join the new system tree and which deliberately remain, with rationale and consumer links rather than an unexplained parallel hierarchy.

Document dependency direction in that inventory and the maintainer guide: application hosts and system compositions may consume generic UI; generic UI must not depend on application persistence/navigation owners or system-specific rules/catalog selection, including through intermediate helpers. Neutral shared types/utilities remain valid dependencies. Production code must not import story wrappers or concepts. Check transitive imports as well as filenames; no repository-wide dependency-enforcement tool is required for this change.

Use kebab-case for new or moved source files and folders, including story/test basenames. Preserve required names such as `+page.svelte` and `__tests__`, language component identifiers such as `IconButton`, and persisted IDs/schema keys. Do not rename canonical fixture data files solely for consistency. Update imports, mocks, discovery/configuration, and current documentation with each move. Historical archived instructions remain historical; provide a current catalog mapping instead of rewriting history.

Prefer explicit `$lib/ui/...` and `$lib/systems/dnd5e-2014/...` imports. Audit `$components` consumers; retire that alias if migration removes all legitimate uses. Avoid permanent re-export compatibility trees or mass barrel imports that obscure ownership. Any temporary bridge gets a removal task before completion.

Alternative rejected: taxonomy-only folders containing all system-specific code. That would make genericity harder to judge while solving only physical navigation.

### 2. Use Design System, Systems, and Concepts catalog roots

```text
Design System / Atoms | Molecules | Organisms
Systems / D&D 2014 / Character Sheet / Bryltin | Zindra | Saturated
Systems / D&D 2014 / [unique system-owned section examples]
Concepts / Deferred Collection Organizer
```

Retained application-owned stories receive an explicit Application grouping when needed, not a misleading Design System or D&D classification. This is ownership navigation, not another atomic-design level, and does not require new stories for application controls already covered elsewhere.

Pages are concrete system-sheet compositions, not another generic UI tier forced between organisms and routes. Canonical/production-backed describes provenance, not a fourth atomic level. Templates remain deferred until real repeated layout evidence warrants them.

Generic organisms demonstrate shared use cases: runtime field groups, read-first piecewise detail, searchable/pinnable collections, and navigable sheet sections. Prefer existing organisms and simple story arrangements; do not invent a production component solely to host a catalog heading. A tiny illustrative data shape and local interaction state are acceptable; duplicated game rules, validation, or save semantics are not.

Keep only materially distinct fixtures. Desktop/phone, keyboard/touch, Save/Cancel/Escape are interactions against the same sandbox. Empty, rejection, density boundaries, long content, and outer-scroll composition can justify different fixtures. Evaluate the missing direct IconButton specimen and existing FieldGroupView specimens through this inventory rather than requiring a story per component.

Display provenance, material host limitations, and manual review directions in a small, plainly noninteractive Canvas introduction or another verified visible surface supported by the existing catalog. Do not rely solely on `parameters.docs.description.story`: the current configuration enables accessibility and Vitest addons, not a Docs addon. Keep any real proof controls visibly separate from explanatory text. No new documentation dependency is needed.

### 3. Extract one real 2014 composition with explicit host ownership

```text
App route ── persisted character + browser navigation host ─┐
                                                         ├─ 2014 sheet composition
Story ── isolated canonical clone + sandbox host ──────────┘    + same projections/editing
```

Move sheet rendering and system-owned editing orchestration out of the route so the route and canonical Page stories import the same composition. Consolidate shared 2014 candidate/patch/intent processing used by route and section stories, including initialization cases, with nearby contract tests. Preserve full-document validation, independent saves, failed-write semantics, stable identity, notes, and pin ownership.

Use the smallest concrete host inputs/callbacks needed by those two consumers. The app host owns selected-document lookup, persistence, actual URL/history effects, and lifecycle. The story host owns a cloned fixture and reset, and may inject a rejected-write response through the same commit boundary. Neither host reimplements the domain reducer or rules. Do not import the live character store into stories or require application data to render them.

Navigation/reference presentation remains real. Isolate URL/history effects and cleanup so catalog navigation cannot commandeer the Storybook manager or leak state between stories. A sandbox-local navigation host may model those effects, clearly labeled; actual browser Back/Forward, base-path handling, persistence, and route entry remain application E2E responsibilities. Do not silently disable the reader or replace editing with no-op callbacks and label the result authoritative. If the existing reference controller needs an environment seam, extract only that seam; 2014 source selection stays 2014-owned and multi-system reference dispatch remains BL-070.

The reference seam also covers indirect domain coupling: `SmallEditDialog` and `FieldAnnotationControl` currently import `resources/annotationReference.ts`, which selects the 2014 catalog. Supply the existing resolution and curated-section behavior through a small injected provider/callback boundary, with 2014 selection owned by the system composition. Shared controls consume neutral resolved reference data and retain existing viewer, external-link, dirty-draft, and focus-return behavior; they must not keep a hidden 2014 fallback. Use the same provider in the app and canonical stories; generic sandboxes can supply small illustrative reference results. This is dependency inversion for existing consumers, not a new multi-system registry or source-dispatch feature.

The canonical host's rejection control must declare and exercise its supported mutation paths. Cover runtime JSON patches, structured/grid edits, focused value/note edits, collection creation/removal, and priority writes where exposed by the fixture. Do not assume a guard in the focused-edit adapter also intercepts raw patches or pin commands. Route each intended path through the shared acceptance boundary, verify that rejected writes leave the character unchanged, and retain existing error/draft behavior. Distinguish simulated commit rejection from actual localStorage failure; the proof does not establish storage-error handling it never executes.

Alternative rejected: copying route markup into a more realistic story. It preserves the exact drift this work is intended to remove. A universal sheet controller is also rejected: the two current consumers justify a 2014 seam, not an RPG-wide API.

### 4. Preserve fixture identity, determinism, and behavioral evidence

Use isolated clones of the existing Bryltin, Zindra, and saturated fixtures. Reset replaces only sandbox state; story actions never mutate fixture singletons or saved characters. Canonical examples use default approved presentation, without unexplained experimental control modes.

New tests use the existing shared storage/patch scaffolding. Control timestamps and generated IDs through existing dependency seams or test mocks, keeping them deterministic and local to tests; do not alter production identity semantics for a proof. Preserve the existing separation of unit tests, browser-backed catalog rendering/accessibility checks, and black-box application E2E. No Storybook `play` functions.

Maintain a consumer/coverage inventory in change-local `inventory.md`: current owner, production consumers, unique evidence, destination, retain/replace/retire decision, and replacement tests/story. This must account for the historical unified proof, all its helper tests, older workflow fallbacks, and section-story wrappers. Preserve intentionally deferred Collection Organizer with its existing backlog trigger. Retire superseded code only when its unique evidence has a working replacement. Do not remove a live fallback merely because a proof is retired.

Assign verification to executable homes rather than treating all passing suites as equivalent:

| Contract                                                              | Evidence owner                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Domain candidate processing and injected reference resolution         | Nearby deterministic Vitest contracts                                         |
| Isolated host cloning, reset, and rejection across mutation paths     | Pure host-state/commit helpers tested by the existing Node Vitest project     |
| Actual app navigation, focus, reader lifecycle, and persisted editing | Existing black-box Playwright application suites                              |
| Catalog rendering and configured accessibility rules                  | Existing Storybook browser checks                                             |
| Actual story switching, UI reset, host cleanup, and visible guidance  | Explicit manual proof steps in verify.md, recorded separately from automation |

The current Node unit project is not a client-side component-interaction runner, and Storybook render/accessibility checks without `play` do not exercise reset or switching. Do not claim those UI behaviors are automated from a green catalog run. No new runner is planned; if actual sandbox browser automation becomes necessary, reconcile a bounded execution path using existing dependencies before adding it. Current story/test discovery globs already cover the proposed destinations; change configuration only where imports, aliases, or evidenced discovery needs require it.

### 5. Prove the architecture before propagating file moves

Pre-gate work establishes the inventory, one compact generic read-first-detail organism sandbox with rejected-save/dirty-work behavior, and one production-backed saturated Page example. Extract the actual sheet composition for that example and route; reuse unmoved dependencies where possible. This is intentionally a thin real vertical slice, not a second throwaway proof. Canonical fixture controls and exact story names go in [verify.md](verify.md).

Perform extraction in independently verifiable steps: first move composition behind the existing application host and confirm app parity; then introduce the reference-provider and isolated story-host seams; then verify both hosts and their lifecycle before the proof handoff. Run relevant diagnostics/contracts after each step rather than combining a large extraction and source-tree migration in one unchecked batch. These are execution checkpoints, not additional human approval gates.

The named human checkpoint reviews catalog clarity, schema-light use-case relevance, app/story fidelity, sandbox isolation, and the proposed ownership map. Only approval unlocks broad taxonomy moves, remaining canonical Pages, wider organism cleanup, and old-proof retirement. A separate final review covers the migrated catalog and actual app. The final inventory acts as a navigation map so the owner knows what represents current UI.

Amend the existing composition ADR during implementation after proof approval, updating its review metadata and explicitly superseding Pages deferral and the prior BL-070-only audit ownership. Update AGENTS and current docs to agree; keep the current ADR operative until this proposal is approved and the proof confirms its shape.

### 6. Make navigation and contribution guidance part of delivery

Provide one practical `docs/component-maintenance.md` guide for both human and agent maintainers. The ADR owns architectural rationale; the guide owns day-to-day instructions; `docs/verification.md` remains the command/gate authority. Avoid copying those rules into every directory.

- Root `README.md` and `docs/index.md` provide a short "find UI / find examples / contribute" entry point to the guide, actual source locations, and catalog startup instructions.
- Add lightweight `README.md` landing maps at `src/lib/ui` and `src/lib/systems` once those destinations exist. Explain shared versus domain ownership and link to implementation, colocated stories/tests, and canonical Pages. Add deeper READMEs only when a real navigation gap warrants one; do not create one per component or tier.
- Keep `AGENTS.md` concise: link the same guide and state the essential reuse-first, ownership, naming, and documentation-update expectations. Do not create a separate agent-only interpretation of the design system.

The guide establishes a small starting set of conventions:

1. Explain the actual source and Storybook hierarchy, including where `.svelte` implementations, `.stories.ts` examples, story-only wrappers, fixtures, and `__tests__` live. Include representative working links and catalog titles, not an exhaustive hand-maintained component registry.
2. Document kebab-case for new/moved files and folders, retaining framework conventions, conventional `README.md`/`AGENTS.md` entrypoint names, PascalCase component identifiers, and unchanged persisted data keys. Existing unrelated names need no churn.
3. Give a reuse/extend/create decision path: inspect the closest component, story, and production consumers first; extend shared presentation only when the interaction fits; retain system-owned behavior when semantics differ. Explain application-owned and intentionally retained locations, permitted dependency direction including transitive helpers, and atom/molecule/organism placement without forcing every component generic.
4. Show a small contribution checklist: locate the owner, assess affected consumers, make the change once in the shared implementation, update relevant tests and unique story states, supply manual interaction bullets, and update navigation/docs with moves or contract changes. Cover accessible names, keyboard/focus, coarse-pointer sizing, and responsive review by linking existing policies rather than inventing new ones.
5. Explain sandbox economy, no Storybook `play` proofs, canonical fixture isolation, and production-backed versus conceptual examples. Refer to existing verification guidance for commands and gate scope.

Publish links as destinations become real during rollout; do not advertise proposed paths as existing implementation before migration. Verify the documentation by navigating from both README and AGENTS to a shared control, its story/test, a system-owned organism, and a canonical sheet example. This is part of final human review, not merely a documentation checkbox. Broader style standards, automated naming enforcement, and repository-wide renaming remain out of scope.

## Risks / Trade-offs

- [Extraction changes focus, scroll, history, or persistence timing] → preserve actual host behavior, add focused tests at the extracted seam, and rerun real route E2E/cross-browser checks rather than accepting story appearance as proof.
- [Many path changes conceal behavioral edits] → inventory first, separate extraction from mechanical moves, keep batches small, and inspect diffs for unintended changes.
- [Generic stories become another invented framework] → use small presentation fixtures and existing callbacks; keep system rules in system examples.
- [Storybook wrapper falsely implies full app fidelity] → document host differences visibly and verify routing/persistence in the app. Share composition and mutation implementation, not a simulated copy.
- [Retirement loses unusual regression coverage] → require per-fixture evidence mapping before deletion, including density thresholds and outer-scroll cases.
- [Refactor expands indefinitely before playtest] → stop at evidenced UI ownership and 2014 composition. Future multi-system design and Icon consolidation retain their existing backlog owners.

## Migration Plan

1. Inventory consumers and capture current baseline evidence; establish the small extraction proof without broad source relocation.
2. After human approval, move shared/system-owned components by coherent batches, updating imports/tests/catalog descriptions as each batch lands.
3. Complete canonical examples, replace duplicate bindings, then retire mapped obsolete proofs and temporary bridges.
4. Reconcile ADR/guidance, verify build/catalog/application behavior and performance, and obtain separate final human approval.

No data migration is required. A failed batch can be reverted as a source/import change without resetting user storage; do not use destructive Git operations or wipe character data as a recovery technique. Avoid simultaneously changing dependencies or player behavior to make migration easier.

## Open Questions

### Pre-gate implementation findings

- Human review exposed a catalog-host theme mismatch: these stories inherited Storybook's foreground, while production components used application surface colors. Both new proof hosts now share a story-only application theme surface, without app storage or navigation chrome. Browser preference and Storybook background must not make text, currentColor borders, or inputs invisible. The rejection checkbox is a sandbox control; a separate labeled boolean fixture demonstrates read-first editing.
- The schema-light proof now exercises optional italic suffixes and compact paired-but-independently-editable fields through existing FieldGroupView metadata; no system-specific renderer or new formatting API is needed.
- Add opt-in catalog-host Playwright regressions using the existing dependency, with a separate `playwright.catalog.config.ts` server target and `tests/catalog/` excluded from application discovery. They check light/dark preference foregrounds, actual focused/boolean/paired edits, and runtime save/reset in the canonical host. This addresses evidence missed by render-only checks, not a new runner or Storybook play proof. Manual visual review, story switching, and broader lifecycle review remain human checks.
- Correct the table inventory: TableHeader has a live CharacterList consumer. During approved rollout, replace the obsolete domain-coupled Table and text-only TableDataRow with narrowly reusable semantic presentation grounded in CharacterList, leaving character columns, mobile card composition, and action ownership in the application. Preserve behavior and avoid speculative sorting or data-table abstractions.

- The full-sheet catalog audit measured about 19 seconds, exceeding the existing 15-second default. The existing Storybook Vitest project receives a 30-second timeout; no new runner, discovery change, or disabled accessibility rule is introduced. It exposed skipped heading semantics, repaired in the shared CollapsiblePanel by wrapping its unchanged button in an h2. This preserves the visible interaction while making its existing title discoverable as a heading.

### Final catalog review refinements

- Canonical Canvas accessibility scans are on-demand to avoid blocking human interaction. CLI and audit-enabled manager runs retain automatic audits, and a test setup guard requires an accessibility report for every story when audits are requested. Explicit component-only manager runs are respected instead of forcing or requiring an audit. This changes scan scheduling, not audit scope or rules.
- Use short component aliases and section story labels within the explicit system namespace; retain qualified domain APIs. No file naming exception or new system facade is needed.
- Make the existing generic edit-first molecule sandbox explicitly discoverable as Tier 1, and document its relationship to read-first detail and collections. Interaction tiers are not composition levels; do not duplicate a molecule as an organism merely for taxonomy symmetry.
- Demonstrate semantic table primitives together in one generic Composition story. CharacterList remains the application-owned responsive example. Disclose callback-only subsystem controls and direct reviewers to canonical Pages for end-to-end sandbox interactions.
- Runtime Action creation/resync retain their existing void callback semantics. The proof suppresses their rejected writes but does not claim their dialogs retain an editable failure draft. Canvas discloses that limitation and the backlog owns the follow-up; redesigning those commands is not hidden inside this refactor.
- Reset is outside modal details. Human lifecycle review resets the non-modal desktop reader, or switches stories with a modal open; it must not ask the reviewer to interact with an inert background button.

No further product decision blocks apply. Inventory resolves exact ownership/file destinations and unique fixture retention before code moves. The proof must determine whether the proposed catalog and shared host boundary genuinely improve review clarity; any necessary change to approved player interactions or persistence semantics requires artifact reconciliation and owner review rather than being treated as routine refactoring.

### Approved rollout reconciliation (2026-10-12)

The approved ownership map is implemented, with the delivered catalog and retirement evidence recorded in inventory.md. Bryltin, Zindra and Saturated share the production composition through a keyed isolated host; section collection saves now delegate to the same concrete edit session. Shared table/row/cell presentation serves CharacterList without moving its application responsibilities. The deferred organizer retains only its own concept-local record helper. No universal system renderer or new schema/persistence contract was introduced.

The application-themed story surface is now a catalog decorator so existing specimens inherit readable foreground/background consistently. Canonical and generic detail examples retain their explicit host wrappers as self-contained compositions. The semantic heading and injected reference-provider changes from the proof remain the only shared behavioral corrections beyond presentation extraction.

Quiet serialized browser verification is required when diagnosing unexpected development-server reloads: intermediate failures showed navigation/reconnect during assertions and passed unchanged with a quiet workspace. No production workaround, retry, or relaxed assertion was introduced. The operational guide records this execution constraint; verify.md distinguishes the failed runs from successful reruns.
