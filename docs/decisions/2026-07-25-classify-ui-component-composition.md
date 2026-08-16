# 2026-07-25 Classify UI Component Composition

## Metadata

- **Status:** Approved
- **Author:** User and Codex
- **Date:** 2026-07-25
- **Last reviewed:** 2026-08-16
- **Latest refinement:** Completed `BL-074` establishes concrete boundaries for field, form, annotation, layout, panel, and organism primitives.

## Context & Problem Statement

The Storybook catalog already uses atom, molecule, and organism labels, but the repository has not defined what those labels mean. Without a shared boundary, a feature-specific composition can be mistaken for a reusable molecule, and new dialog or form work can produce either premature generic abstractions or page-specific controls in the shared component layer.

The guided runtime-action templating workflow needs reusable dialog, navigation, and focused-form pieces plus a concrete multi-step composition. It also provides immediate evidence for separating GridContent display from its existing action and dialog orchestration.

## Decision Drivers

- Give humans and agents stable vocabulary for component design and Storybook organization.
- Keep small controls and focused reusable combinations distinct from workflow-bearing compositions.
- Allow platform-native and third-party primitives to participate without requiring local wrappers for everything.
- Support future multi-step character editing and creation without building a universal wizard framework now.
- Keep feature specificity separate from compositional complexity.
- Avoid extracting a generic card abstraction before repeated concrete use demonstrates one.

## Considered Options

### 1. Organize stories only by feature

- **Pros:** Simple placement for page-specific components.
- **Cons:** Does not communicate compositional scale or encourage reusable UI boundaries.

### 2. Define atoms, molecules, and organisms by composition

- **Pros:** Establishes a small durable vocabulary, accommodates platform primitives, and covers the immediate dialog workflow.
- **Cons:** Some components require judgment when their internal composition evolves.

### 3. Adopt the complete atomic-design hierarchy immediately

- **Pros:** Also defines templates and pages.
- **Cons:** Adds categories without current examples and risks classifying route structure before the product needs that vocabulary.

## Decision Outcome

Choose Option 2. Use compositional responsibility—not file location or feature specificity—to classify cataloged UI:

This is staged adoption, not rejection of the complete hierarchy. At the time of this decision, the repository has concrete atoms and molecules, emerging organisms, one real character-sheet route, and no repeated page-level composition from which to derive a durable template. Templates and pages will be defined when product structure supplies that evidence.

### Atoms

Atoms are the smallest focused UI primitives owned by the repository. An atom may directly wrap a platform-native element or an external-library primitive to provide consistent styling, accessibility, or behavior, but it does not compose repository molecules.

Examples include `BaseButton` and `Heading`. Native elements and external API primitives may also be used directly as primitive building blocks without first becoming cataloged atoms.

### Molecules

Molecules are focused, reusable groupings of atoms and/or platform or external primitives. A molecule performs one focused UI job and does not own a multi-step product workflow. Feature specificity is orthogonal to this compositional level.

Examples include a validated input field, a native dialog shell, step navigation, or a focused form section.

### Organisms

Organisms compose one or more molecules, optionally with atoms or direct platform/external primitives, into a cohesive region or workflow. An organism may be generic or feature-specific; feature specificity does not demote it to a molecule.

Examples include a multi-step dialog form and `RuntimeActionsCard`. A functional card that coordinates menus, dialogs, forms, and domain behavior is likewise an organism even if its visual shell is simple.

Templates and pages remain undefined until concrete repository examples require those additional levels.

## P1-062 Application

- Build the source-selection and draft-review experience as two steps of one native dialog.
- Treat the reusable dialog shell, step navigation, and focused form sections as molecules.
- Treat the inventory-item picker as a focused molecule: it composes platform-native search and single-choice controls to provide searchable, filterable item selection without owning source loading, draft state, or workflow navigation.
- Treat the stateful multi-step dialog form as an organism.
- Keep `RuntimeActionsCard` as a feature-specific organism; use a nested Storybook category later if multiple system-specific organisms make that useful.
- Do not extract a generic card organism solely to rename the current feature card. A lightweight card shell may become a molecule only when repeated concrete consumers justify it.
- Keep the first picker API inventory-focused. Generalize searchable selection only after another concrete source type demonstrates compatible selection, filtering, option-rendering, and accessibility requirements.
- Separate GridContent field display from its action menu and Edit/Notes dialogs, then remove the controls-only presentation bridge. Extract the focused menu, dialog, and form pieces as molecules that both the GridContent organism and runtime-action organism can compose directly; do not introduce a shared workflow organism solely to reuse those pieces.
- Reuse one workflow state model across responsive presentations: centered and constrained on larger screens, full-height on small screens.

## Full-Hierarchy Revisit Triggers

Do not create a prioritized taxonomy project merely because P1-062 adds more organisms. Revisit templates and pages when page-level structure becomes a concrete source of reuse, testing, or maintenance pressure. Triggers include:

- designing a second system-specific character sheet;
- adding character creation or another substantial route-level editing workflow;
- duplicating the same top-level composition across two or more routes;
- needing page-level Storybook examples with realistic content variants;
- finding route components difficult to test because reusable layout and concrete data cannot be separated; or
- discovering during P1-062 reconciliation that organism boundaries are carrying responsibilities better expressed as a page template.

When a trigger occurs, perform a focused repository audit, refine this ADR, and create a backlog item only if implementation work is justified. Until then, templates and pages remain deliberately deferred behind current product work.

In technical artifacts, call navigation units inside a dialog **steps** or **panels**. Atomic-design **Pages** refer to concrete page-level instances and must not be confused with steps inside a modal workflow.

## Consequences

- Storybook placement communicates component composition while still allowing feature-specific organisms.
- Reusable dialog and form work is extracted from concrete consumers rather than a speculative framework.
- Multi-step dialog behavior gains a durable composition boundary that can support later character editing and creation.
- Components may move between catalog levels when their responsibilities materially change; such moves should be intentional and reflected in stories.
- The taxonomy does not require every platform element, external primitive, route, or one-off helper to receive a Storybook story.

## Refinements & Follow-Ups

P1-062 is the first implementation proof. Its design must record the concrete molecule and organism APIs, and implementation reconciliation must update this decision if actual composition invalidates any classification.

### 2026-07-25: Searchable inventory selection

Allowing all inventory items makes search and filtering part of the minimum useful source-selection behavior rather than a later enhancement. P1-062 will prove an inventory-focused picker molecule built from platform-native search and choice controls. A second source-selection consumer is the trigger to compare concrete contracts and either retain source-specific molecules or extract a shared searchable-selection molecule; long-term similarity alone is not sufficient evidence for the generic API.

### 2026-08-01: Second-system trigger activated

PRD v1 makes a second system-specific sheet concrete, so `BL-070` now owns the focused hierarchy and route-composition audit described above. It should evaluate whether repeated sheet landmarks or layouts justify templates/Pages and whether current organisms carry route-level responsibilities. It should also audit the existing grid/card, field-binding, annotation, focused-edit, dialog, and navigation primitives for honest reuse.

The trigger does not predetermine a complete atomic-design hierarchy, repo-wide file move, or generic page template. The audit may conclude that atoms, molecules, organisms, and system-specific route composition remain sufficient for the first two sheets. Shadowdark supplies the stronger non-5e validation before any page-level convention is treated as universal.

### 2026-08-05: BL-074 Implementation Boundaries

BL-074 implemented a cohesive set of boundaries replacing the legacy `GridContent` components:

- **Atoms/Primitives:** Base inputs and structural primitives like `BaseButton` and `Badge` are atoms. They handle display or basic input but don't orchestrate complex forms.
- **Molecules:** Components like `PanelSurface`, `ResponsiveGrid`, `FieldAnnotationControl`, `FieldGroupView`, `CollapsiblePanel`, and `StructuredForm` compose primitives into one focused reusable UI job.
- **Organisms:** Cards such as `GridContentCard` compose multiple molecules (field groups, action menus, forms, and dialogs) into cohesive regions. Dense collection cards (e.g., `Dnd5e2014DenseCollectionCard`) are domain-specific organisms.
- **Focused form boundary:** `StructuredForm` remains a molecule. It performs one reusable form-rendering job and does not own dialog lifecycle, domain decoding, or a product workflow.

The typed-edit-intents architecture remains authoritative for complex mutations; this classification only establishes the structural composition of the UI.
