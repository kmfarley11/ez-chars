# 2026-08-30 Control Self-Hosted PDF Navigation In-App

- **Status:** Approved
- **Author:** Codex with project owner direction
- **Date:** 2026-08-30
- **Last reviewed:** 2026-09-07
- **Latest refinement:** [`BL-069`](../../openspec/changes/bl-069-rights-classified-reference-navigation/proposal.md) accepts the compact viewer baseline with a temporary Firefox/macOS rapid-scroll notice, defaults stacked phone navigation closed, and delegates supported-platform classification and broader mobile toolbar optimization to `BL-072` and `BL-082`.

## Context & Problem Statement

ez-chars currently opens PDF references in separate browser tabs. That is a lawful and resilient fallback, but repeated references accumulate tabs, browser PDF behavior varies, and phone users lose useful character-sheet context. The first playtest also needs a trustworthy distinction between self-hosted resources the application may process and link-only resources that remain at an authoritative external destination.

The application is a static, base-path-deployed SvelteKit client. Character and annotation drafts remain component-local until deliberately saved, so reference inspection must not navigate away from or remount the active sheet/editor. The [rules-resource rights decision](2026-07-31-classify-rules-resources-by-rights.md) already determines which documents may be included or processed; this decision defines the navigation and indexing boundary within that policy.

## Decision Drivers

- Avoid stale-tab accumulation while preserving a direct browser fallback.
- Keep phone navigation, browser Back, keyboard focus, and active drafts understandable.
- Process only verified self-hosted resources and never imply access to link-only material.
- Support exact pages, outline navigation, selectable text, and find within one open document.
- Keep discovery bounded to curated metadata until playtest evidence justifies a broader index.
- Lazy-load and fully clean up a security- and performance-sensitive PDF dependency.
- Reuse the repository's established presentation and accessibility primitives where their ownership fits.

## Considered Options

### Open every PDF in the browser viewer

This requires no PDF dependency and remains the most resilient fallback. It does not provide consistent outline, find, page state, failure, focus, phone, or tab-management behavior, so it does not meet the primary experience.

### Embed external documents with an object or frame

This looks visually integrated but leaves controls and failures browser-specific, creates cross-origin and framing constraints, and would blur the rule that link-only source documents are not processed by ez-chars.

### Adopt an app-controlled viewer for verified self-hosted documents

This creates dependency and performance work, but provides one controllable navigation contract while retaining the browser viewer as an explicit fallback. Link-only resources remain external.

### Precompute a cross-document full-text index

This would improve broad recall, but expands source processing, bundle/storage, attribution, search-quality, and update responsibilities before the playtest has shown curated metadata to be insufficient.

### Introduce a universal resource-provider facade

This could anticipate user-local and future-system sources, but would freeze speculative provider APIs before a second implemented source pipeline exists. A validated static catalog is enough for the current source set.

## Decision Outcome

Use exact-pinned `pdfjs-dist` `5.5.207` behind an app-owned, lazy viewer boundary for verified self-hosted PDFs. This is the newest reviewed release on the Node `20.19.5`-compatible line that is outside the `GHSA-hq66-cqwq-w95j` vulnerable range reported during the dependency-change audit; the newer fixed 6.x line requires Node 22.13 or newer and is not adopted implicitly. The application owns source context, toolbar, responsive presentation, history, focus, error language, and lifecycle cleanup. PDF.js owns document parsing, outline data, per-page rendering, text layers, and document-scoped find. Keep the complete page range ordinarily scrollable through lightweight stable slots while rendering only the visible page and a bounded nearby window; destroy loading tasks, documents, render tasks, observers, event subscriptions, and any object URLs when the viewer closes or changes documents.

Resolve every PDF.js worker and supporting resource through explicit build-managed URLs. Resolve adopted document URLs with SvelteKit `asset(...)` so development, Storybook, production builds, and the `/ez-chars` deployment base remain aligned. Do not copy the upstream generic viewer, examples, telemetry, onboarding, test fixtures, or source tree into the repository. This follows the official [PDF.js setup guidance](https://github.com/mozilla/pdf.js/wiki/Setup-pdf.js-in-a-website), [display-layer example](https://mozilla.github.io/pdf.js/examples/), and [API resource options](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html).

Use SvelteKit shallow routing for sheet-owned reference state: `pushState('', state)` creates a dismissible history entry, and Close converges on browser Back. Read the state through `$app/state`; direct entry and reload cannot rely on history state and must retain a browser-PDF fallback. This follows the current [SvelteKit shallow-routing guidance](https://svelte.dev/docs/kit/shallow-routing) and its documented first-load/JavaScript caveats.

Present a sheet reference as a non-modal side panel at desktop width and as a full-viewport reference mode at phone width. When reference inspection begins inside an existing native edit dialog, render it as a back-navigable step inside that dialog rather than opening a second modal. Keep the underlying draft mounted, unchanged, and focus-confined; returning restores focus to the invoking control.

Resource discovery searches only registered titles, versions, project-owned topics, curated labels, and independently authored descriptions. Find inside an open PDF may process that document transiently, but extracted text is not cataloged, persisted, exported, or reused as a cross-document corpus. A bounded app-owned index requires separate evidence-triggered backlog work. User-selected or user-local PDFs remain independently scoped as `BL-080` because they require source verification, browser storage, privacy, removal, and rights decisions.

Resolve delivery rights, user access, locator health, runtime availability, and preferred-source relationship as separate facts. The presentation resolver emits the actionable disposition `internal`, `external`, `stale`, or `unavailable`. A preferred verified self-hosted source stays visually quiet; link-only ownership guidance appears before its external action; a stale exact locator fails closed; and no source silently substitutes for another.

### Local primitive reuse audit

- Reuse `BaseButton.svelte` for viewer, navigation, fallback, retry, and dismissal controls so visible focus and coarse-pointer sizing inherit the shared contract.
- Reuse `PanelSurface.svelte` for the desktop reference shell. Add a focused viewer surface inside it because no existing panel owns PDF canvas/text layers, a bounded rendered-page window, outline state, or document lifecycle.
- Reuse `DialogShell.svelte` for the existing annotation/editor modal and its Back-step, scroll, cancellation, and focus-confinement behavior. Do not use a second `DialogShell` for the nested reference because simultaneous modal focus traps would be invalid and confusing. Do not use it for the desktop panel because that presentation is intentionally non-modal.
- Reuse `createScrollAffordanceAttachment` for bounded textual side regions such as a long outline when the visual cue is useful. Do not use it as the PDF virtualization mechanism: page visibility and render cancellation require page-aware `IntersectionObserver` ownership rather than only top/bottom overflow state.
- Reuse `asset(...)` and extend the existing URL helpers for adopted document links. PDF.js worker/support assets use build-managed module URLs because they come from the pinned package rather than the repository's static asset inventory.
- Reuse established labeled search-input, result-count, clear-query, no-match, and empty-state language. No generic search component currently exists, and dense collection views own unrelated row, dialog, and mutation behavior, so they are not embedded in the resource proof.
- Reuse the current annotation draft owner and reference-template seam. Extend it with an optional registered-reference callback; retain ordinary anchors for legacy lawful URLs and browser fallback. Do not move annotation drafts into a global store or character persistence merely to inspect a reference.
- Reuse native anchors with `target="_blank"` and `rel="external noopener noreferrer"` for deliberate external and browser-viewer actions. Do not route external URLs through SvelteKit navigation or PDF.js.
- Reuse Svelte's attachment/effect cleanup patterns and named semantic regions. A separate global viewer store is unnecessary for the one sheet-level controller and would make draft/focus ownership less explicit.

## Consequences

- Self-hosted SRD navigation can be consistent and tab-light while retaining browser-native escape hatches.
- The runtime dependency and worker/support assets increase build weight and require full dependency, browser, performance, and cleanup verification.
- Direct page loads cannot reconstruct ephemeral invocation state; they use a dedicated/fallback presentation rather than pretending a sheet draft exists.
- Link-only sources receive less integrated behavior by design, because the application neither includes nor processes their documents.
- Search has two intentionally separate scopes: curated resource discovery and transient find within one open document.
- Future user-local sources may reuse the viewer presentation only after `BL-080` establishes a verified local document handle and lifecycle; this ADR does not preapprove arbitrary import.

## Refinements & Follow-Ups

### 2026-08-30 — BL-069 proof boundary

The first implementation stops after one adopted SRD 5.1 viewer, mixed source-state fixtures, responsive/history behavior, and annotation draft return. Resource-library rollout and the character/class, equipment, and spell contextual actions remain blocked until the owner approves the desktop and physical-phone proof recorded in the change-local `verify.md`.

If the proof fails phone performance, keyboard/focus, selectable-text, outline, find, or tab-management review, amend the design before propagation. Do not silently downgrade the approved primary path to browser-only navigation.

### 2026-09-06 — Bounded pane resizing and outline progression

Owner review found that the fixed desktop reference width obscured more sheet context than necessary and that the fixed navigation/document allocation could not adapt to outline-heavy work. Retain the non-modal overlay for the playtest, but give its sheet-facing edge and the side-by-side viewer navigation one reusable, named horizontal separator. Each separator supports pointer drag and Left/Right/Home/End keys, clamps both panes to usable bounds, and keeps its value component-local rather than persisting it in character data. Phone-sized layouts remain full-screen and stacked without horizontal separators.

Keep curated locators immediately visible, but collapse the lower-value publisher PDF outline by default and progressively expose its recursive branches. When navigation stacks above the document, give an expanded outline a bounded viewport-relative minimum height and independent scrolling. A true reflowing split workspace, docking model, or remembered layout is deliberately deferred to post-playtest backlog exploration because it changes sheet layout ownership beyond this viewer proof.

### 2026-09-07 — Full-range scrolling and compact persistent access

Post-rollout owner review found two material gaps. First, the translucent sticky Rules row consumed avoidable sheet height and caused untenable Firefox scroll lag beyond the earlier dense-sheet baseline. Replace that row with one opaque, icon-only book tab on the right viewport edge; keep its accessible name, keyboard position, coarse-pointer target, and overlap/non-obstruction behavior in the final human gate. Do not leave the viewer or a full-height collapsed panel mounted merely to expose the trigger.

Second, mounting only the previous, current, and next page without a visibility-driven progression left the viewer as a three-page island, and initial exact-page navigation could display the preceding page while merely highlighting the target below it. Preserve bounded PDF.js work, but represent the complete page range with lightweight stable slots, update the current page from slot visibility, and mount canvas/text layers only for the current page and immediate neighbors. Initial, curated, page-input, outline, and Find jumps align the requested slot in view. This makes continuous scrolling a navigation path without increasing the simultaneous PDF render window.

### 2026-09-07 — Compact contextual actions and resize dismissal

Final density review found that visible `References: ...` rows displaced character content even though each action belongs to an existing collapsible sheet section. Move the Class, Spells, and Equipment actions beside their owning panel toggles as icon-only book controls. Preserve their distinct accessible names and coarse-pointer targets while removing the repeated visible labels and standalone rows.

Treat the outer desktop divider's terminal right-edge snap as another way to dismiss the reference. It uses the same shallow-history, PDF cleanup, and invoker-focus restoration path as Close, while the persistent Rules or contextual book action remains available to reopen it. Do not retain a zero-width loaded viewer or invisible edge separator after dismissal.

### 2026-09-07 — Firefox paint stability and phone navigation baseline

Physical Firefox review found black-region corruption during fast sheet scrolling after the lag-heavy translucent row had already been replaced. Retain the compact opaque fixed tab, but remove layout/paint containment and the forced 3D transform from its wrapper; a control this small does not justify compositor promotion, and physical Firefox remains the acceptance boundary because frame-rate automation cannot observe paint corruption.

On stacked phone/tablet layouts, default document navigation closed behind a full-width, visibly named `Outline & find` button with a directional chevron. Preserve the icon-only minimized rail on desktop and keep the global page toolbar visible for this accepted baseline. P0 `BL-082` will compare persistent, disclosed, sticky, and scroll-aware phone tools across the complete source presentations before external playtest hardening; it may refine this ADR if that proof changes the durable presentation boundary.

### 2026-09-07 — Accepted Firefox/macOS limitation pending matrix evidence

The owner's final headed review still reproduces transient black or unpainted regions during rapid sheet scrolling in Firefox on macOS after the translucent row and explicit compositor hints were removed. Slow scrolling is usable, automated Firefox behavior passes, and no equivalent physical non-macOS Firefox result is yet available. Accept the interaction implementation without another speculative browser-specific workaround. During the pre-release period, identify the observed Firefox/macOS combination and recommend another current browser when the artifact disrupts play; do not describe Firefox generally as unsupported or attribute the root cause without evidence. `BL-072` owns the headed macOS/non-macOS comparison, profiling, supported-platform decision, and the eventual removal or revision of the notice.
