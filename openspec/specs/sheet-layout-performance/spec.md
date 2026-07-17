# sheet-layout-performance

## Purpose

Ensure that dense card grids and auto-measurement layouts on the 5e character sheet maintain smooth rendering frame rates, avoiding layout thrashing or unproven complexity changes.

## Requirements

### Requirement: Evidence-based Firefox scroll changes

The project MUST retain a Firefox-specific scroll-performance code change only when a representative headed Firefox profile identifies the targeted application work as material to the recorded jank.

#### Scenario: Profile does not implicate the targeted application work

- **WHEN** a headed Firefox profile shows negligible synchronous reflow and scroll-handler time for a proposed grid-measurement optimization
- **THEN** the proposed optimization SHALL be reverted rather than retained as an unproven complexity cost

#### Scenario: Profile identifies a narrow application bottleneck

- **WHEN** a headed Firefox profile identifies a material, attributable application bottleneck
- **THEN** any follow-up SHALL target that bottleneck narrowly and preserve current visual layout behavior

### Requirement: Deferred repeatable performance verification

The project MUST route repeatable browser-performance verification and a future replacement of JavaScript grid measurement to their planned, separately scoped work.

#### Scenario: No material grid-measurement cost found

- **WHEN** the profile does not implicate the current grid-measurement path
- **THEN** performance automation SHALL remain with `p1-026` and native grid-model exploration SHALL remain with `p1-027`
