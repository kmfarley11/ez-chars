## Context

The 2014 sheet is one long document with three outer regions—Overview, Runtime, and Organizational—and nested `CollapsiblePanel` surfaces. Only the three outer toggles currently have stable heading IDs. The Runtime region combines Abilities & Proficiencies with Features & Traits in one unusually large collapse unit. Outer-region collapse conditionally removes every nested panel, while each `CollapsiblePanel` privately owns its own expanded state.

The sheet already has an icon-only Rules action fixed at the right edge and a shared, keyboard-operable horizontal-resize primitive for the rules viewer. The owner prefers an efficient icon rail but wants beginners to be able to reveal complete labels. The accepted touch policy requires 44-by-44 CSS-pixel coarse-pointer targets, and prior Firefox/macOS review makes scroll-driven work or another heavily composited fixed surface a specific proof risk.

The proposal introduces navigation behavior before the second and third systems exist. It may share presentation and coordination mechanics, but the current architecture decisions prohibit treating 2014 labels, layout, projections, or route structure as a universal system contract.

## Goals / Non-Goals

**Goals:**

- Define one authoritative 2014 landmark hierarchy that remains available while destinations are unmounted.
- Coordinate explicit expansion, rendering, scrolling, focus, and same-sheet history across outer regions and nested panels.
- Provide a compact icon rail and complete labeled outline without obscuring wide sheet content or shrinking touch controls.
- Prove and human-calibrate the responsive breakpoint and phone rail before propagating navigation across the full route.
- Preserve system ownership so later changes can provide different landmark vocabularies and layouts.

**Non-Goals:**

- Whole-sheet search, tabs, pages, scene-aware focus, observer-driven active tracking, or persistent navigation preferences.
- Continuous outline resizing or a general two-sided workspace framework.
- A universal renderer, route registry, RPG landmark taxonomy, or cross-system adapter API.
- Broad sheet reorganization beyond separating the two approved Runtime collapse units.
- Completing the deferred repository-wide icon consolidation.

## Decisions

### Use a system-owned descriptor tree plus sheet-local context

Define one 2014-owned descriptor tree containing stable fragment ID, visible label, optional icon key, parent ID, kind, and order. The complete outline, rail, and corresponding headings consume those same descriptor objects rather than copying labels or selector strings.

A sheet-local Svelte context coordinates runtime concerns: mounted destination elements, outer-region and panel expansion requests, and post-render focus. The descriptor tree exists independently of mounted children, so collapsing an outer region cannot remove destinations from navigation. Mounted destinations register only their current element and controller; they do not determine identity or ordering.

Keep the shared `CollapsiblePanel` molecule domain-neutral. Extend it only with generic composition seams needed by navigation, such as a stable heading ID, optional heading-icon content, externally requested expansion, and access to its heading focus target. A 2014 feature-local navigable wrapper or attachment consumes the landmark descriptor, supplies those generic inputs, and registers the panel controller with the sheet-local context. Outer sheet regions participate through the same coordinator even though they retain their region-specific presentation. Context keeps this orchestration local to one rendered sheet and avoids an application store.

Alternatives considered:

- Let mounted panels register all metadata dynamically. Rejected because outer collapse unmounts descendants and would erase the very destinations navigation must reopen.
- Keep a separate route-owned list of labels and query the DOM. Rejected because labels, ordering, selectors, and collapse behavior can silently drift.
- Introduce a universal system navigation registry. Rejected until later systems provide concrete evidence for a stable cross-system API.

### Use one hierarchy at panel granularity

The 2014 descriptors contain three selectable parent regions and eight child destinations in visible sheet order. The navigation surface does not descend into individual cards, fields, inventory groups, or spell levels. Parent activation expands and focuses the region heading; child activation expands both the parent and child collapse units as necessary.

Split the current combined Abilities & Proficiencies, Features & Traits `CollapsiblePanel` into two sibling panels. This is the only information-architecture change: it makes two owner-approved landmarks independently reachable and prevents navigation to Features & Traits from opening an unrelated, oversized collapse unit.

Alternatives considered:

- Keep the combined panel and add an inner anchor. Rejected for the proof because the approved landmarks would still share collapse state and fail to reduce the oversized retrieval unit.
- Split every language, tool, feature, trait, item group, or spell level. Rejected because it would create an unwieldy outline and overlap collection-level discovery.

### Use binary expanded and slim presentations

Do not reuse the horizontal-resize control for the first sheet outline. Use the owner-approved binary presentation: an approximately `16rem` complete outline and `3rem` rail with a viewport-relative `1280px` transition. At and above that threshold, default the complete outline open and reserve its width in the sheet layout; below it, default to the rail. At tighter widths, revealing labels uses a temporary bounded overlay/drawer rather than permanently reflowing the sheet by the complete width. The proof recorded remaining sheet-content width to validate the viewport proxy, and the accepted baseline does not add a container observer.

The proof explicitly exercised widths near the accepted breakpoint. State remains component-local and is not written to character data or durable browser preferences.

Alternatives considered:

- Continuous horizontal resizing. Rejected for the baseline because binary access meets the known need with less motor, focus, responsive, and two-sided-panel complexity. The existing resize primitive remains available if proof evidence invalidates this decision.
- Always overlay the desktop sheet. Rejected at wide widths because the outline is intended to remain useful while reading the sheet.
- Always reserve the expanded width. Rejected at medium and phone widths because it would materially reduce the sheet workspace.

### Make destination icons shortcuts, not the only vocabulary

The slim desktop and phone presentations expose icon buttons for the eight high-value child destinations plus one conspicuous control for the complete labeled hierarchy. Parent-region navigation remains available in the labeled outline. Buttons keep a fixed visual and interactive size; rail height may scroll independently only if the physical phone proof finds that understandable in landscape. Unlike the single overlaid Rules action, this nine-control navigation surface reserves its narrow rail width beside the sheet: overlaying the whole rail would obscure too much working content and create a tall accidental-touch boundary. The two surfaces should share edge-control clarity without pretending that one action and a destination set have identical geometry.

Every icon button has a complete accessible name, and its native pointer tooltip repeats the same descriptor-owned label. Tooltips supplement rather than provide the screen-reader name. Touch familiarity comes from the conspicuous labeled-outline action and the repeated pairing of icons with headings in that outline; do not add long-press instruction because it is hidden, conflicts with browser gestures, and cannot serve every input mode. A second Help action would spend another scarce rail target to duplicate the labeled outline unless human evidence shows that the outline control itself is not understood. The 2014 navigable-panel composition consumes the descriptor's icon key and heading together, then supplies generic heading and icon inputs to `CollapsiblePanel`, so the destination and navigation surface cannot select different identities without making the shared molecule understand sheet descriptors.

The owner-directed final icon proof moves the compass to the labeled Outline action, uses a bookmark for Quick Reference, uses a badge/rosette for Features & Traits, uses sparkles for Spells, and replaces the ambiguous bag/lock silhouette with a backpack for Inventory / Equipment. The bookmark replaces a short-lived pushpin trial so the navigation action does not collide with the established collection-priority Pin/Unpin meaning. The badge is preferred over an eye, which can imply visibility/show-hide or overrepresent one particular trait, and over a class emblem, which would omit ancestry, background, and other feature sources.

Keep the complete outline visually parallel to the sheet hierarchy without copying the sheet headings' full display weight. On fine-pointer presentations, use compact approximately `2.25rem` rows, lighter child text, tighter hierarchy spacing, a short `Outline` heading, and a compact minify action so the first wide-desktop cut fits common viewport heights without scrolling where practical. The existing `touch-target` policy restores a `44px` minimum for coarse pointers. Bounded vertical scrolling remains the fallback for short windows, landscape phones, increased text size, and coarse-pointer layouts; fitting without scroll must not shrink touch targets or hide destinations.

Distinguish navigable child-panel boundaries from their nested grid content with one consistent, low-contrast, theme-aware header band spanning the available panel width. Keep the approved heading typography and landmark icon, include any contextual header action in the same band, and retain the stronger brand treatment for parent-region headers. Keep the band's perimeter at one pixel; when the panel is expanded, use a subtly stronger theme-tinted two-pixel lower divider to clarify the boundary with its content, while a collapsed band remains uniformly one pixel. Do not assign destination-specific colors: the band communicates hierarchy without turning the long sheet into a competing set of category colors.

The repository currently has only a few dedicated icon components, while `BL-079` owns eventual icon consolidation. The proof must audit those assets first and add only the minimum feature-local, centralized landmark icon vocabulary needed here—without a dependency or a premature repository-wide Icon API. If the icon set is not understandable in owner review, reduce persistent shortcuts or use the labeled-drawer fallback rather than shrinking controls or inventing obscure symbols.

Alternatives considered:

- One Sections button with no direct rail destinations. More beginner-safe but rejected as the preferred baseline because it removes the owner's desired rapid jumps.
- A new icon package or immediate completion of `BL-079`. Rejected because this bounded navigation proof does not justify a dependency or repo-wide icon migration.

### Treat direct selection and history traversal as navigation requests

An explicit landmark action expands required ancestors, waits for the destination to render, scrolls with persistent-control offset, and focuses the destination heading. When its stable fragment differs from the current landmark fragment, it writes one same-document history entry while preserving the current SvelteKit page state. Selecting the current fragment or another already-current destination repeats scroll and focus without adding a duplicate history entry and never toggles the destination closed.

Back and Forward resolve the historical fragment through the same coordinator. They reopen ancestors and reveal and focus the destination even if the user collapsed it after the original visit. History traversal is itself an explicit request to revisit that location; restoring an invisible fragment would be less predictable than reopening ephemeral UI state. Ordinary scrolling never changes the fragment or creates history.

Prefer native fragment semantics where they preserve base paths and SvelteKit state, but route all explicit and history-driven destinations through one resolver so unmounted children can be expanded before scrolling. A Rules shallow-history entry preserves the current fragment. When Back removes an active Rules entry without changing that fragment, the Rules controller alone restores focus to its invoker and the landmark resolver does not replay the unchanged destination. A later Back or Forward that changes the landmark fragment uses the landmark resolver to reopen, scroll, and focus the historical destination. This focus precedence preserves the existing Rules close contract and prevents competing focus restoration.

Alternatives considered:

- Preserve collapsed state and focus the nearest visible ancestor on Back. Rejected because the historical URL would name a destination the user cannot see.
- Replace history instead of pushing explicit jumps. Rejected because it prevents Back from retracing deliberate sheet navigation.
- Synchronize the fragment while scrolling. Rejected because it pollutes history and adds unnecessary scroll work.

### Omit active-section tracking from the playtest baseline

The rail is optimized as a set of explicit jump actions. It does not maintain `aria-current` from viewport position, and no scroll listener or `IntersectionObserver` is needed for the baseline. Focus and the fragment identify the result of an explicit jump. `BL-072` can collect evidence that users lose orientation and promote tracking later if warranted.

### Use proof-before-propagation

Build one isolated, stateful navigation proof using the real landmark descriptor/context behavior and representative nested collapsed regions. Prefer one configurable Storybook sandbox over separate stories for desktop, phone, expand, collapse, or input modes. Storybook contains no `play` function; `verify.md` maps manual interactions to the smallest sandbox and, after propagation, the existing saturated application fixture.

The pre-gate proof starts with the `1280px` viewport proxy, records usable sheet width, and presents the `16rem` complete outline, `3rem` icon rail, phone icon rail, complete-label disclosure, the two Runtime panels, and nested expansion/focus behavior. Its measurement banner remains in normal document flow and scrolls away, so proof scaffolding cannot cover a destination used to judge scroll placement. Focused automated evidence covers descriptor validation, generic panel seams, and destination resolution with Vitest. The owner reviews nearby desktop widths, phone portrait and landscape, icon and label comprehension, keyboard/touch behavior, and disclosure focus. Any requested icon substitutions are iterated and explicitly finalized in the same proof before route propagation. No full-route propagation begins until explicit approval, and proof feedback is reconciled into the planning artifacts before rollout.

Collapsed Runtime, Organizational, Features & Traits, and Spells states in the isolated proof are test fixtures that make nested expansion observable. They do not establish route defaults. The integrated sheet preserves the existing default-expanded baseline; navigation assists retrieval and reopens user-collapsed destinations rather than using its presence to hide sheet content initially.

Fragment history, interleaved Rules state, real grid reflow, saturated scrolling, and Firefox/macOS paint behavior require the actual application route. They are implemented and verified after the presentation gate, then remain subject to the separate final owner approval before archival. The Storybook proof must not grow into a duplicate app shell merely to claim those route-level conclusions early.

## Risks / Trade-offs

- **[The descriptor tree and rendered sheet drift]** → Let the feature-local navigable composition translate the same descriptor objects into navigation and generic panel inputs, validate unique IDs and parent references, and test every descriptor against a resolvable route destination.
- **[Collapsed ancestors unmount their descendants]** → Keep identity outside runtime registration and resolve expansion from parent to child before querying, scrolling, or focusing.
- **[The rail consumes scarce phone width or height]** → Preserve fixed targets, test physical portrait and landscape sizes, provide complete labels, and switch to the drawer fallback if the gate rejects the rail.
- **[Icons are obscure or expand the deferred icon work]** → Keep the set minimal and centralized, pair every icon with an accessible name and labeled outline, and avoid a new dependency or broad consolidation.
- **[A docked sticky surface worsens Firefox/macOS paint behavior]** → Avoid continuous scroll handlers and unnecessary compositor hints; compare the saturated baseline with and without navigation during post-rollout headed review before final approval.
- **[Breakpoint-driven reflow destabilizes the sheet]** → Preserve the owner-calibrated `1280px` transition and binary widths in application coverage, including the adjacent `1279px` state.
- **[Landmark history conflicts with Rules history]** → Preserve SvelteKit page state and the current fragment in Rules entries, ignore unchanged-fragment traversal in the landmark resolver, and exercise interleaved sheet jumps, Rules open/close, Back, and Forward through black-box tests and human review.
- **[Context becomes a speculative cross-system framework]** → Keep the first descriptor and route composition 2014-owned; `BL-070` and `BL-071` must independently adopt, adapt, or decline the mechanism.

## Migration Plan

1. Add the descriptor/context and isolated proof without changing persisted character data.
2. Stop for owner review and reconcile the selected responsive threshold, phone presentation, icon set, labeled-outline behavior, and any design fallout.
3. Propagate the approved presentation to the 2014 route, including the bounded panel split, deduplicated landmark history, and Rules focus precedence.
4. Retain an immediate rollback path by removing the navigation presentation and restoring the combined panel; no stored-data migration or cleanup is required.

## Approved Proof Decisions

The owner approved the isolated proof on 2026-09-12 with these playtest decisions:

- Keep the transition viewport-relative at `1280px`; use a fixed `16rem` complete outline and `3rem` minified rail rather than continuous resizing.
- Keep the docked rail as the preferred desktop and phone presentation. On tighter widths, its compass action opens the complete labeled hierarchy in the existing modal disclosure and preserves focus return on dismissal.
- Use the approved identity, bookmark, action-bolt, ability-die, feature-badge, spell-sparkles, backpack, and notes-document icon vocabulary. Native pointer tooltips and accessible names repeat the descriptor-owned labels.
- Keep all normal route sections default-expanded; collapsed proof fixtures exist only to exercise reveal behavior.
- Omit observer-driven active tracking and persistent presentation preferences.
- Keep the coordinator and navigable wrappers feature-local. The shared `CollapsiblePanel` additions remain domain-neutral composition seams, so the proof establishes neither a public API nor a cross-system architecture decision and does not trigger an ADR.
