## Why

The saturated 2014 character sheet now requires too much repeated scrolling to reach high-value regions, and adding more systems before resolving that friction would multiply both player effort and the human-review surface. A bounded landmark-navigation baseline can improve retrieval without replacing the continuous sheet with tabs or imposing one system's information architecture on another.

## What Changes

- Add a compact character-sheet navigation surface backed by an ordered, system-owned hierarchy of parent regions and high-value child landmarks.
- Present a left-side expanded outline and a slim destination-icon rail, with a human-calibrated responsive transition and an obvious way to reveal complete text labels.
- Prefer the bounded icon-rail grammar on phones with fixed touch targets and labeled-outline access, while retaining a drawer without persistent destination icons as the proof fallback if the rail fails review.
- Make explicit landmark navigation reveal collapsed ancestors, place the destination in view, and move keyboard focus to its heading.
- Give jumps to different landmarks predictable same-sheet Back and Forward behavior, including reopening ancestors when history revisits a hidden destination, while repeated activation of the current landmark only repositions and refocuses it.
- Split the combined Abilities and Proficiencies, Features and Traits collapse unit into two independently navigable and collapsible destinations.
- Require later system work to audit this behavior and deliberately adopt, adapt, or decline it; any system that adopts it supplies its own landmark labels, hierarchy, and ordering.
- Use a named human proof gate to settle the responsive transition, phone presentation, icons, labeled-outline disclosure, and nested expansion/focus behavior before full-route propagation.

### Non-goals

- Replacing the continuous sheet with tabs or pages.
- Adding whole-sheet content search, scroll-synchronized active-section tracking, scene-aware modes, or persisted navigation preferences.
- Continuously resizing the outline, broadly reorganizing sheet content, or adding individual cards, fields, inventory groups, or spell levels to the first landmark set.
- Defining a universal RPG navigation taxonomy or universal sheet renderer.

## Capabilities

### New Capabilities

- `character-sheet-landmark-navigation`: System-owned sheet landmarks, responsive navigation presentations, collapsed-destination behavior, focus, and explicit-jump history semantics.

### Modified Capabilities

None.

## Impact

- Affects the 2014 sheet's region and collapsible-section composition, responsive layout, keyboard focus, and same-document history behavior.
- Adds a 2014 feature-local coordination boundary between navigation metadata and mounted sheet destinations without changing character persistence or schema data; later systems may generalize only behavior supported by additional evidence.
- Extends component, accessibility, and black-box browser evidence for desktop, phone, Back and Forward navigation, collapsed targets, and coexistence with Rules.
- Adds no third-party dependency and makes no compatibility or stored-data promise.
