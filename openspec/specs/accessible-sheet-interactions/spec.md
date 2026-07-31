# accessible-sheet-interactions Specification

## Purpose

Ensure the character sheet maintains a rigorous and reviewable accessibility baseline across desktop and phone-sized viewports, defining explicit standards and exceptions for touch targets, keyboard order, and overlay interactions.

## Requirements

### Requirement: Touch-oriented sheet controls meet the mobile target baseline

The character sheet SHALL present every non-exempt interactive control intended for direct touch with interactive bounds of at least 44 by 44 CSS pixels on a coarse-pointer presentation, and those bounds SHALL NOT overlap another control's interactive bounds.

#### Scenario: Shared control is rendered for touch

- **WHEN** a shared button, menu trigger, menu action, form control, or dialog action is rendered in a coarse-pointer presentation
- **THEN** its interactive width and height SHALL each be at least 44 CSS pixels unless it has an approved exception
- **AND** activating anywhere within those bounds SHALL invoke that control rather than an adjacent control

#### Scenario: Sheet-specific action is rendered for touch

- **WHEN** an interactive sheet action is rendered without a shared control owning its touch sizing
- **THEN** the sheet action SHALL meet the same non-overlapping 44-by-44 CSS-pixel baseline unless it has an approved exception

### Requirement: Touch-target exceptions are explicit and usable

Every control below the mobile target baseline SHALL be recorded as an exception with its surface, rationale, verification method, and equivalent accessible interaction path. An exception SHALL be limited to an inline control whose text flow would be harmed by literal sizing, a native control whose associated label or wrapper supplies the required hit area, or a redundant control with an equivalent conforming action; visual density alone SHALL NOT qualify.

#### Scenario: Inline text control is excepted

- **WHEN** an inline link within flowing prose remains below 44 by 44 CSS pixels
- **THEN** the audit SHALL identify it as an inline-flow exception
- **AND** it SHALL remain visibly identifiable, keyboard focusable, and operable without activating adjacent content

#### Scenario: Associated label supplies the hit area

- **WHEN** a native checkbox, radio, or similar control remains visually smaller than the baseline
- **THEN** its explicitly associated label or wrapper SHALL provide a non-overlapping touch area of at least 44 by 44 CSS pixels
- **AND** activating that area SHALL operate the named control

#### Scenario: Unsupported exception is proposed

- **WHEN** a control is below the baseline solely to preserve a dense layout and has no qualifying exception or equivalent conforming action
- **THEN** the accessibility audit SHALL treat the control as unresolved rather than complete

### Requirement: Responsive keyboard order remains logical

The character sheet SHALL expose interactive controls in a keyboard sequence that follows the visible reading and task order at desktop and phone-sized layouts. Responsive presentation SHALL NOT rely on positive `tabindex` values, duplicate focusable mobile controls, or visual reordering that contradicts document order.

#### Scenario: Sheet grid reflows on a phone-sized viewport

- **WHEN** responsive layout changes a multi-column sheet region into a narrower presentation
- **THEN** sequential keyboard navigation SHALL move through visible controls in the same logical order in which their labels and content are read

#### Scenario: Sheet region is collapsed or hidden

- **WHEN** a user collapses a region or a responsive state hides one of its controls
- **THEN** the unavailable controls SHALL NOT remain in the keyboard sequence
- **AND** the next keyboard destination SHALL remain within the visible task flow

### Requirement: Overlay interactions preserve keyboard context

Modal dialogs SHALL confine keyboard focus while open and restore focus to the invoking control when closed. Multi-step dialogs SHALL establish an explicit contextual focus destination after a step change, and popovers SHALL restore invoker focus after Escape dismissal across supported browsers.

#### Scenario: Modal dialog is traversed and closed

- **WHEN** a keyboard user navigates through an open modal dialog and dismisses it
- **THEN** focus SHALL remain inside the dialog until dismissal
- **AND** focus SHALL return to the control that opened it

#### Scenario: Multi-step dialog changes pages

- **WHEN** a keyboard user advances or returns between dialog steps
- **THEN** focus SHALL move to the new step's contextual heading or first appropriate field

#### Scenario: Popover is dismissed with Escape

- **WHEN** focus is inside an open popover and the user presses Escape
- **THEN** the popover SHALL close
- **AND** focus SHALL return to its invoking control in every supported browser project

### Requirement: The sheet accessibility audit remains reviewable

The repository SHALL maintain a bounded audit record that accounts for every interactive control family in the current character-sheet flow and records its owning surface, accessible name, touch-target result, keyboard-order result, automated evidence, manual evidence, and any approved exception.

#### Scenario: Audit is completed

- **WHEN** the accessibility change is considered complete
- **THEN** every in-scope control family SHALL be recorded as conforming, corrected, or excepted
- **AND** no unresolved critical menu, dialog, sheet-section, editing, annotation, spell, inventory, or runtime-action control SHALL remain

#### Scenario: New sheet control is introduced later

- **WHEN** a new touch-oriented or keyboard-operable sheet control is added
- **THEN** it SHALL inherit a conforming shared interaction pattern or receive an explicit audit entry and exception review
