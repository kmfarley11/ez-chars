## ADDED Requirements

### Requirement: Guided Action Templating Workflow

The system SHALL provide a multi-step modal workflow for creating runtime actions from inventory items that does not modify character data until explicit final confirmation.

#### Scenario: Opening the workflow

- **WHEN** a user activates the "Add action from inventory" command
- **THEN** the system SHALL present a modal dialog starting at the source selection step
- **AND** the character's data SHALL NOT be modified by opening this workflow

#### Scenario: Confirming the final draft

- **WHEN** a user completes the review step and confirms the draft
- **THEN** the system SHALL create exactly one linked runtime action using the draft values
- **AND** the modal workflow SHALL close

#### Scenario: Canceling the workflow

- **WHEN** a user cancels or dismisses the modal at any step
- **THEN** the system SHALL NOT create any new runtime actions
- **AND** the modal workflow SHALL close

### Requirement: Searchable Source Selection

The system SHALL present an inventory item picker that allows filtering by a text search against item names and notes, while retaining visibility of the selected item if it is filtered out of view.

#### Scenario: Searching for an item

- **WHEN** a user enters text into the search field
- **THEN** the picker SHALL filter the list of items using case-insensitive, whitespace-tokenized matching, where every non-empty query token MUST appear somewhere in the combined name and notes text of the item

#### Scenario: Selected item filtered out

- **WHEN** an item is selected and a subsequent search or filter hides that item from the list
- **THEN** the selected item SHALL remain selected and clearly identified in the UI until deliberately changed

#### Scenario: No search matches

- **WHEN** a search query matches no items
- **THEN** the system SHALL display an empty state explaining there are no matches
- **AND** manual custom-action creation SHALL remain available

### Requirement: Equipped-Only Toggle

The system SHALL provide an optional toggle to filter the inventory item picker to only equipped items.

#### Scenario: Toggling equipped-only view

- **WHEN** a user activates the "Equipped only" filter
- **THEN** unequipped items SHALL be hidden from the picker list
- **AND** the equipped items SHALL remain in their stable order

### Requirement: Focused Draft Review

The system SHALL present a focused form to review and edit the pending action draft before it is saved.

#### Scenario: Editing the draft

- **WHEN** a user selects an inventory source and proceeds to the next step
- **THEN** the system SHALL present an editable form containing the action's draft values
- **AND** the draft's name and notes SHALL be seeded from the inventory source
- **AND** the draft SHALL use deterministic defaults for other fields (Timing: action, Category: effect, Target: empty)
- **AND** edits made in this form SHALL NOT modify the underlying inventory item

### Requirement: Workflow Navigation

The system SHALL allow users to navigate backward to the source selection step without accidentally committing the action.

#### Scenario: Navigating backward

- **WHEN** a user is on the draft review step and activates the "Back" control
- **THEN** the system SHALL return to the source selection step
- **AND** the previously selected inventory item SHALL remain selected

### Requirement: Source Context Presentation

The system SHALL display sufficient context for each item in the picker to distinguish similarly named items.

#### Scenario: Viewing item options

- **WHEN** a user views the list of inventory items in the picker
- **THEN** each option SHALL display the item's name, equipped status, quantity (if applicable), and concise details/notes (if present)

### Requirement: Suggestion Request States

The system SHALL communicate pending and failed asynchronous suggestion requests without blocking manual action creation.

#### Scenario: Suggestions are loading

- **WHEN** the inventory items are being loaded asynchronously
- **THEN** the UI SHALL display a loading state until the request completes

#### Scenario: Suggestion request fails

- **WHEN** loading inventory items fails
- **THEN** the UI SHALL display a non-destructive error state
- **AND** manual custom-action creation SHALL remain available

### Requirement: Responsive Dialog Presentation

The system SHALL present the modal dialog appropriately based on screen size using a single workflow state model.

#### Scenario: Viewing on a large screen

- **WHEN** the user opens the workflow on a desktop or tablet
- **THEN** the modal SHALL be presented as a centered, constrained dialog

#### Scenario: Viewing on a small screen

- **WHEN** the user opens the workflow on a mobile phone
- **THEN** the modal SHALL adapt to a full-height, full-width presentation
