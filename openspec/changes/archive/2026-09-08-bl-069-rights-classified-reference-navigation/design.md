## Context

The application currently renders annotation references as base-path-safe URLs with optional PDF `#page=` fragments and opens them in a new browser tab. That preserves the sheet only because the current page remains mounted, but it creates tab accumulation and delegates page navigation, search, outline, focus, failure, and phone behavior to browser-specific PDF viewers. There is no resource library or source resolver today.

`BL-068` established the governing rights classifications, adopted exact SRD 5.1 and SRD 5.2.1 artifacts, centralized their provenance in `THIRD_PARTY_NOTICES.md`, and bounded Shadowdark to authoritative external links plus conservative locators. The first `BL-069` proof uses only SRD 5.1 for in-app viewing while ensuring the resource representation can express multiple sources and link-only behavior without processing protected documents.

The current application is static, base-path deployed, and local-first. Character and annotation edit drafts are component-local until accepted. Native dialogs already own focus confinement for several editing flows, so a reference opened during an edit cannot safely create an unrelated second modal or navigate away and unmount the draft.

## Goals / Non-Goals

**Goals:**

- Establish a versioned, rights-classified resource and curated-locator catalog with stable identities.
- Provide metadata-bounded resource discovery and deterministic preferred/alternate source resolution.
- Use one app-controlled PDF viewer for self-hosted sources, with page, outline, find, browser fallback, responsive presentation, and explicit lifecycle cleanup.
- Keep the default self-hosted path quiet while disclosing link-only, ownership, alternate, unavailable, offline, and stale-locator information only where it changes the next action.
- Keep the active system's preferred rules source persistently reachable for general document lookup as well as through contextual locators.
- Preserve active sheet and annotation drafts, browser-history expectations, keyboard context, and exact return focus.
- Detect adopted-artifact and locator drift deterministically before release and fail closed at runtime.
- Prove the viewer and draft-return interaction in isolation before propagating contextual references across the 2014 sheet.

**Non-Goals:**

- A normalized compendium, structured rules corpus, persistent cross-document full-text index, semantic search, OCR, or generated excerpts.
- User-selected PDFs, user-local source persistence, cloud/server upload, vendor authentication, DRM handling, or arbitrary document ingestion; `BL-080` owns that future expansion.
- A universal system resource facade or hypothetical cross-system adapter API. The static catalog supports the known source vocabulary without changing character schemas.
- In-app framing, fetching, or processing of link-only sources.
- A generic source-state `Edit` action. Repository-maintained resource identity, rights/access classification, availability, and locator health are not user-authored data; annotation edits and future local-source connection use their owning workflows instead.
- Modifying or forking third-party PDF viewer source merely to reproduce the application's visual theme.

## Decisions

### 1. Keep resource identity and locator data in a validated static catalog

Add a first-party resource catalog whose records carry stable resource identity, system/rules identity, source and edition/version identity, display title, publisher, rights delivery mode, access guidance, authoritative destination, adopted local asset when applicable, attribution reference, and explicit preferred-source policy. Curated locator records carry stable locator identity, resource identity, project-owned topic keys, independently authored label/description, locator kind, and page/anchor/URL data.

The catalog is repository-configured product metadata, not character data or user persistence. Its version belongs to the catalog contract; it does not change `dnd5e-2014.schema.v0` or require character migration. Stable resource and locator IDs, rather than labels or URLs, become the referential boundary. No random or time-dependent IDs are allocated at runtime, so catalog and search tests remain deterministic.

Source records refer to the centralized notice inventory rather than duplicating official downloads, checksums, review dates, modification status, license text, or exact attribution across new documentation. The existing `docs/ext` publication boundary and base-path asset resolution remain the only self-hosted artifact path.

Alternatives considered:

- Persisting resource records with each character would make backups self-describing but would duplicate global provenance, freeze stale URLs into character data, and create migrations unrelated to character authorship.
- Reusing annotation `sourceId` plus display names as the full registry would not represent source versions, alternate locators, rights delivery, or health safely.
- A generic provider/registry interface was rejected because only static first-party metadata is currently implemented.

### 2. Resolve orthogonal source facts into a small presentation disposition

Do not collapse delivery rights, user access, locator health, connectivity, and preferred/alternate relationship into one combinatorial status enum. A pure resolver combines the registered facts for the requested resource and locator into one of four actionable dispositions:

- `internal`: verified self-hosted source and exact in-app locator;
- `external`: link-only source with authoritative external action and ownership guidance;
- `stale`: known source whose exact locator is not trusted, retaining a general document or source-details action when lawful; a still-available self-hosted document remains an internal general-document action, while a link-only source remains external;
- `unavailable`: source cannot currently be opened, retaining its citation and retry or acquisition guidance.

Preferred source is explicit catalog policy, not inferred from incidental array order. The initial 2014 topic mappings prefer the verified self-hosted SRD. Alternate mappings remain available behind one `Other sources (N)` disclosure. A successful self-hosted result shows only its useful title/version/locator and primary Open action. Link-only and ownership notices appear before the external action; they are not deferred until a failed click. Runtime fetch failure, rather than `navigator.onLine` alone, determines an offline/unavailable result.

Source-state results expose only actions that can resolve the represented condition: internal or external Open, Retry, source details, alternate selection, or the separately owned local-source connection workflow. They do not offer a generic quick edit for repository-maintained catalog facts. If a user-authored annotation points to the wrong source, its focused annotation workflow owns that correction; if adopted metadata is wrong, catalog maintenance and integrity review own it.

Alternatives considered:

- Rendering all rights and health badges on every result was rejected because it burdens the free-first path with administrative state.
- Hiding link-only ownership until activation was rejected because it makes external navigation and required acquisition feel like an error or bait-and-switch.
- Silently falling through from a stale preferred locator to an alternate was rejected by the fail-closed resource policy.

### 3. Separate catalog discovery from find within the open document

Resource-library search operates only over registered titles, source versions, project-owned topics, curated section labels, and independently authored descriptions. It returns resource/locator projections; it never searches or stores source text. Matching and ordering use fixed normalization and stable identity tie-breaks so results do not vary with ambient locale.

Find within a self-hosted PDF is an on-demand viewer operation scoped to the currently opened document. Extracted text used by the viewer is not added to the resource catalog, persisted, exported, or made available as a cross-document corpus. A future bounded text index is reconsidered only through the backlog trigger established during this change.

Alternatives considered:

- Pre-extracting the licensed SRD into a search index would improve broad recall but expands source processing, update, attribution, performance, and product scope before playtest evidence shows metadata discovery is insufficient.
- Treating browser-native Find as sufficient would leave the primary experience inconsistent across supported viewers and phone browsers.

### 4. Adopt a pinned PDF.js dependency behind an app-owned viewer boundary

Use an exact pinned `pdfjs-dist` version within the isolated proof and retain it for rollout only after that proof verifies the adopted SRD, supported browsers, phone performance, keyboard traversal, text selection, outline destinations, and find behavior. The application owns the reference toolbar and presentation shell; PDF.js owns parsing, incremental page rendering, text layers, outline data, link resolution, and document-scoped find. Represent the complete document as lightweight stable page slots so ordinary scrolling can reach the full page range, use page visibility to mount only the current page and a bounded nearby canvas/text-layer window, and align explicit jumps only after the target slot exists. Destroy the document, workers, object URLs, observers, and event subscriptions when the viewer closes.

Worker, font, character-map, image, and WebAssembly asset paths must be explicit, base-path-safe, and production-build tested. Dependency adoption must not copy example applications, onboarding files, telemetry, upstream test fixtures, or an upstream viewer fork into the repository. Package and lockfile changes trigger `npm audit`, all documented main gates, Chromium smoke, relevant cross-browser checks, and performance verification.

The app retains `Open in browser` as a secondary action for self-hosted documents and as the fallback when the controlled viewer cannot initialize. Link-only documents never pass through PDF.js; their explicit publisher action opens an external browsing context.

Alternatives considered:

- A raw browser `<object>` or PDF iframe avoids a dependency but does not provide a dependable app contract for outline, find, page state, focus, or load failure.
- Building a PDF parser/viewer from application primitives is disproportionate and would recreate security- and performance-sensitive document behavior.
- Opening every PDF in a browser tab remains useful as fallback but fails the primary phone and tab-management goals.

### 5. Use one history-aware reference controller with context-sensitive presentation

A sheet-level reference controller owns the selected resource/locator, resolved disposition, viewer lifecycle, return target, and shallow history entry. Opening a reference does not navigate away from or remount the character sheet. Browser Back and supported mobile back gestures dismiss the reference state; an explicit Close action uses the same history path. Direct/reloaded URLs fall back to a dedicated reference presentation without assuming ephemeral sheet state exists.

When invoked from the normal sheet, the controlled viewer appears as a non-modal side panel at desktop width and a full-screen reference mode at phone width. When invoked inside an existing native edit/annotation dialog, the viewer becomes a back-navigable step within that same dialog presentation rather than opening a second native modal; the underlying draft remains mounted and unchanged. Returning restores the exact editor step, draft values, scroll context where practical, and focus to the invoking reference control.

The desktop side panel has one bounded horizontal divider on its sheet-facing edge. Its default remains responsive, but pointer drag or Left/Right/Home/End keys can adjust the temporary width while a minimum document width and a useful portion of the sheet remain visible. The viewer uses the same reusable horizontal-resize handle between its navigation and document panes when they render side by side. That inner allocation is also clamped so neither pane can consume the other. A separate named toggle may minimize the whole document-navigation pane to a narrow map-icon rail; the divider remains as the narrow separator and drag target, dragging fully left snaps to the rail, and dragging right from the rail restores the minimum usable navigation allocation. Activating the toggle restores the previous bounded allocation. The visible icon is decorative to the toggle's explicit accessible name. Resize and minimized state remain component-local and are not character data or persisted preferences. Phone mode remains full-screen and omits horizontal dividers because a competing sliver of sheet or document navigation would make both regions less usable, while the same minimize toggle may compact the stacked navigation when the user wants to prioritize the document.

The outer divider also exposes dismissal as its terminal snap point: dragging the panel through its minimum readable width toward the right edge, or using the divider's Home key, invokes the same shallow-history close path as the visible Close button. The viewer then unmounts and releases its PDF resources; the existing persistent Rules affordance reopens it. Keeping a zero-width viewer or invisible edge divider mounted was rejected because it would create an undiscoverable interaction trap and weaken the lazy viewer lifecycle.

Curated sections remain immediately visible in the expanded navigation pane. The publisher-provided PDF outline is a secondary, collapsed disclosure because its top-level entries are less useful for the adopted SRD; nested branches render recursively and expand only on request. Their destination buttons and document Find results use the conventional pointer cursor as well as underline, focus, and button semantics so the reset button style does not make them feel inert. On narrower layouts the navigation and document stack, default the navigation closed behind a full-width, visibly named `Outline & find` control with a directional chevron. Expanding it supplies a bounded viewport-relative minimum height and independent scrolling rather than collapsing into a nearly unusable strip or displacing the document completely. Desktop retains its icon-only minimized rail. The global page toolbar remains visible in this baseline; `BL-082` owns the pre-playtest comparison of compact, disclosed, sticky, or scroll-aware controls rather than adding an unreviewed auto-hide rule here.

All variants reuse existing button, panel, dialog, icon, scroll-affordance, and touch-target patterns where their behavior fits. The map glyph follows the existing repo-local decorative icon contract rather than introducing a package or standalone icon sandbox; broader icon unification remains `BL-079`. A new viewer surface is justified because current dialog and collection primitives do not own PDF canvas/text layers, document navigation, or responsive split presentation.

Alternatives considered:

- A conventional dedicated route would give clean URLs but can unmount component-local drafts and makes desktop comparison unnecessarily disruptive.
- A second modal over an edit dialog was rejected because nested focus confinement and dismissal are difficult to make understandable.
- Keeping all references external would preserve drafts but retain the primary UX problem.

### 6. Verify provenance and locators at the build/test boundary, then fail closed at runtime

Automated integrity fixtures read the adopted artifact, verify the centralized expected hash and page basis, confirm every registered resource/locator reference resolves, ensure page locators fall within the adopted page count, and reject duplicate IDs, unknown topics, or an external locator presented as included. These deterministic checks run without network access. External URL reachability remains a dated maintainer review rather than a nondeterministic unit test.

Runtime viewer initialization and asset fetches report an unavailable state without disturbing character editing. A catalog locator explicitly marked stale disables the exact-page action while retaining independently authored section context and any lawful general-open action. Neither runtime nor tests silently rewrite locators after artifact drift.

### 7. Stop after a one-source viewer proof before propagating contextual actions

The pre-gate batch establishes the catalog/resolver, one SRD 5.1 locator fixture, the pinned PDF.js boundary, responsive viewer controller, history and draft-return behavior, focused tests, and the smallest unique human-review sandboxes. It does not add the complete resource library or propagate references through character creation/class, equipment, and spells.

At `STOP — Human review and explicit approval of the SRD reference viewer proof`, the owner reviews the actual SRD on desktop and a physical phone: exact page landing, outline, find, text readability, load time, page scrolling, Back/Close behavior, browser fallback, unsaved annotation-draft return, keyboard focus, and absence of tab accumulation. The owner also reviews one mixed-source discovery sandbox for the progressive self-hosted, external, alternate, stale, and unavailable language. Only explicit approval unlocks resource-library and sheet rollout; requested revisions remain in the pre-gate batch.

Storybook stories are added only for materially distinct fixtures or initial states. Existing annotation/editor sandboxes are extended where practical, viewport review uses Storybook controls rather than phone-only duplicate stories, and no Storybook `play` functions automate the human proof. Repeatable behavior belongs in Vitest and Playwright. The linked `verify.md` is the durable source for manual interactions, expected outcomes, dated automated evidence, and approval status.

Live and static Storybook use an explicit Storybook build marker so SvelteKit resolves adopted documents and PDF.js supporting assets from Storybook's root rather than the deployed `/ez-chars` base. The existing Vite asset plugins remain the single serving/copying boundary and continue excluding `docs/ext/local-only`; Storybook does not acquire a duplicate PDF fixture or an independent asset-copy implementation.

The sheet-top `Open SRD viewer proof` trigger is temporary pre-gate wording and placement scaffolding, but it exposed a distinct first-playtest need that contextual references do not satisfy: players frequently need to search the system's preferred rules source without starting from a particular field. After approval, rollout converts that trigger into one compact, persistent `Rules` action. It opens the configured preferred verified self-hosted source at a safe general document context, leaving exact-page navigation to contextual and annotation references. Final review found that the first translucent sticky row consumed unnecessary vertical space and made dense-sheet scrolling untenable in Firefox. The revised presentation is one opaque, icon-only book tab attached to the right viewport edge: it stays out of sheet layout, avoids backdrop filtering, retains an explicit accessible name and coarse-pointer target, and does not leave a collapsed viewer mounted. The action remains reachable while the sheet scrolls, does not obscure or intercept sheet content and controls, avoids document-level overflow and disproportionate viewport loss, follows the existing focus contracts, and uses the same history-aware controller so the sheet and drafts remain intact. Because whether a persistent control feels materially encumbering is partly experiential, final desktop and physical-phone review exercises normal reading, scrolling, editing, menus, and focused collection use around the action rather than relying only on fixed geometry assertions.

The three contextual Class, Spells, and Equipment actions reuse that book glyph as compact icon-only controls beside their owning collapsible-panel toggles. Their context-specific accessible names and titles carry the meaning that no longer needs a repeated visible `References: ...` label. This removes three standalone action rows while keeping the locator entry points discoverable next to the section structures they describe; it extends the existing collapsible-panel header composition instead of adding bespoke absolute positioning.

The bounded edge tab is preferred over retaining the sticky row because it eliminates both the permanent layout height and the Firefox-sensitive translucent repaint surface. A later physical-Firefox review found black viewport regions during fast scroll even though ordinary slow scrolling was acceptable; remove the tab wrapper's `contain: layout paint` and forced 3D transform so the browser is not asked to maintain a separate compositor layer for this tiny opaque control. The tab stays fixed and out of layout without those hints. It is preferred over a full-height collapsed panel because opening the document should remain an explicit action and PDF resources should stay unloaded until requested. Putting a system-specific action directly into the global application navbar would couple the global shell to active character routing; later evidence may justify that broader shell integration, but the 2014 playtest does not require it. The tab's small overlap and Firefox paint-stability risks remain explicit human-review conditions rather than being assumed away.

The owner's final Firefox-on-macOS review still reproduces transient black/unpainted regions during rapid sheet scrolling after removing those hints, while slow scrolling and the accepted interaction design remain usable. This change does not add more speculative browser-specific CSS or declare Firefox generally unsupported without a non-macOS comparison. Instead, the existing pre-release notice names the observed browser-platform combination and suggests Chrome or Safari when the artifact disrupts play. `BL-072` owns headed cross-platform reproduction, profiling, supported-matrix classification, and removal or revision of the temporary notice.

### 8. Record the durable viewer and indexing boundary in an ADR

Apply work adds a lightweight ADR selecting an app-controlled PDF.js viewer for self-hosted sources, explicit external navigation for link-only sources, metadata discovery plus document-scoped find for the playtest, and a separate future user-local source workflow. The ADR records rejected browser-only, embedded-external, precomputed-index, and premature universal-provider alternatives and links to the rights-classification ADR and `BL-080` follow-up.

## Risks / Trade-offs

- **PDF.js increases dependency and built-asset weight.** → Pin the exact version, lazy-load viewer code only after reference activation, render incrementally, destroy resources on close, and enforce dependency, build, browser, and performance gates.
- **A 403-page document can exhaust phone memory or scroll poorly.** → Render only visible/nearby pages, keep the pre-gate proof on an actual phone, measure initialization and representative navigation, and stop before rollout if the bounded viewer cannot meet the repository thresholds.
- **A lightweight full-document scroll model can drift from real page geometry.** → Use stable page slots sized to the adopted page basis, keep actual PDF canvases bounded to nearby pages, update current-page state from intersection evidence, and verify initial, curated, first-page, and last-page landing in black-box tests.
- **PDF content and the app create competing keyboard/scroll regions.** → Give the viewer a named region and explicit toolbar order, avoid nested modals, restore invoker focus, and document the transition into and out of document content.
- **Resizable panes can become inaccessible or collapse useful content.** → Use one named separator contract with pointer and keyboard operation, clamp both allocations, keep resize state ephemeral, and omit the dividers when the panes stack on phone-sized layouts.
- **Drag-to-dismiss can be mistaken for a still-mounted minimized viewer.** → Snap only after crossing the minimum readable width, converge on the visible Close action's history and focus path, release document resources, and leave the persistent Rules trigger visible for restoration.
- **A forced compositor layer for the fixed Rules tab can produce Firefox paint artifacts during fast scroll.** → Keep the control small and opaque, avoid backdrop filtering, layout/paint containment, transforms, and `will-change`, then require a physical Firefox fast-scroll recheck because headless frame counts cannot detect black-region corruption.
- **The Firefox/macOS artifact persists after removing the identified paint triggers.** → Preserve the usable bounded implementation, disclose the observed combination without asserting an unverified cause, recommend another current browser when needed, and delegate headed macOS/non-macOS comparison plus supported-platform policy to `BL-072`.
- **Collapsing phone tools can trade space for discoverability.** → Default only the stacked outline/Find pane closed, retain visible text and a directional chevron on its expansion control, leave the page toolbar stable in this baseline, and defer broader control visibility decisions to P0 `BL-082` with physical-phone proof.
- **Shallow history state is unavailable on reload or without JavaScript.** → Provide a direct browser-PDF fallback and a dedicated reference presentation for direct entry; never depend on ephemeral state to preserve committed character data.
- **Source state language may feel legalistic.** → Keep the internal path quiet, use plain action-oriented notices only for affected sources, and review mixed states before propagation.
- **Static locator maps can drift from adopted bytes.** → Couple every exact locator to source/version identity and artifact integrity fixtures, fail closed, and require a deliberate adoption/remapping event.
- **Future user-local PDFs could be mistaken as part of this change.** → Keep selection, local persistence, and file processing excluded here and track the actionable expansion independently as `BL-080`.
- **The resource catalog could become a premature compendium/provider framework.** → Store only known document metadata and curated locators; add no universal provider, source-text, or normalized-rule API.

## Migration Plan

1. Add the ADR, static catalog contract, SRD 5.1 resource/locator fixture, and deterministic integrity tests without changing character persistence.
2. Add and prove the lazy app-controlled viewer and history/draft-return controller against the existing self-hosted artifact.
3. Stop for explicit owner approval using `verify.md`; revise or replace the viewer design within the proof batch if the actual phone/desktop result is not acceptable.
4. After approval, add resource discovery and progressive source dispositions, convert the proof launcher into the persistent sheet-level Rules action, then propagate contextual references through the three approved 2014 sheet contexts.
5. Preserve existing external `#page=` links as a rollback/fallback path until the controlled viewer and full verification matrix pass.
6. A rollback removes the resource UI/controller and dependency while leaving adopted PDFs, existing annotations, character data, and external browser links intact; no character migration is required.

## Open Questions

- **Resolved:** The primary self-hosted path uses an app-controlled PDF.js viewer, a desktop panel, and a full-screen history-backed phone presentation; browser viewing remains an explicit fallback.
- **Resolved:** The playtest uses metadata-bounded discovery plus find within the open document, not a persisted app-owned text corpus.
- **Resolved:** Link-only sources disclose that they are not included and open explicitly at the publisher; they are neither embedded nor treated as missing uploads.
- **Resolved:** User-local PDF connection is a separate P2 follow-up (`BL-080`) with its own storage, privacy, identity, and rights design.
- **Proof-gated:** If the controlled SRD viewer fails physical-phone performance, accessibility, or document-navigation review, implementation stops before contextual rollout and this design is amended rather than silently degrading the primary contract.
- **Proof-refined:** Desktop reference and side-by-side navigation widths are temporarily adjustable through one accessible bounded separator; phone mode remains full-screen. A true reflowing sheet/reference split workspace remains post-playtest exploration rather than part of this overlay proof.
