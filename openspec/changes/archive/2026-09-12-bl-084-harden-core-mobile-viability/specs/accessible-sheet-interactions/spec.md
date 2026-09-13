## MODIFIED Requirements

### Requirement: Overlay interactions preserve keyboard context

Modal dialogs SHALL confine keyboard focus while open and restore focus to the invoking control when closed. Multi-step dialogs SHALL establish an explicit contextual focus destination after a step change, and popovers SHALL restore invoker focus after Escape dismissal across supported browsers. When an action within a popover menu opens a modal dialog or overlay, the popover SHALL close and reset its trigger disclosure state before transferring control, and closing the dialog SHALL return focus to the closed trigger without leaving it in an expanded or open state.

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

#### Scenario: Menu action opens a modal dialog

- **WHEN** a user selects a menu command from an open popover that opens a modal dialog
- **THEN** the popover SHALL close and reset its disclosure state
- **AND** the trigger button SHALL immediately reflect the closed state rather than a close icon or expanded state
- **AND** closing or dismissing the modal dialog SHALL restore focus to the closed menu trigger

## ADDED Requirements

### Requirement: Mobile form controls enforce a focus-zoom prevention typography baseline

The application SHALL ensure that all interactive text inputs, textareas, and select controls have a computed font size of at least 16 CSS pixels on mobile viewports (below the responsive layout breakpoint) and coarse-pointer devices to avoid triggering browser automatic focus zooming. The application SHALL NOT disable or restrict user pinch-to-zoom.

#### Scenario: Input field is focused on mobile viewport

- **WHEN** a user focuses an input, textarea, or select element on a mobile viewport or coarse-pointer device
- **THEN** the computed font size of the control SHALL be at least 16 CSS pixels
- **AND** the element SHALL maintain its accessible bounds

#### Scenario: User pinch-zooms on mobile viewport

- **WHEN** a user performs a pinch-to-zoom gesture on any sheet or application view
- **THEN** the viewport meta configuration SHALL permit normal user zooming without `user-scalable=no` or restrictive `maximum-scale` limits
