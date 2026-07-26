## MODIFIED Requirements

### Requirement: Guided Action Templating Workflow

The system SHALL provide one multi-step modal workflow for creating a runtime action from an eligible on-sheet source or from a custom draft, without modifying character data until explicit final confirmation.

#### Scenario: Opening the workflow

- **WHEN** a user activates the "Add action" command
- **THEN** the system SHALL present a modal dialog starting at the source or custom creation step
- **AND** the character's data SHALL NOT be modified by opening this workflow

#### Scenario: Confirming a linked final draft

- **WHEN** a user selects an eligible source, reviews the draft, and confirms it
- **THEN** the system SHALL create exactly one linked runtime action using the reviewed draft values
- **AND** the modal workflow SHALL close

#### Scenario: Confirming a custom final draft

- **WHEN** a user chooses custom creation, completes the draft, and confirms it
- **THEN** the system SHALL create exactly one unlinked runtime action using the reviewed draft values
- **AND** the modal workflow SHALL close

#### Scenario: Canceling the workflow

- **WHEN** a user cancels or dismisses the modal at any step
- **THEN** the system SHALL NOT create any new runtime actions
- **AND** the modal workflow SHALL close

### Requirement: Searchable Source Selection

The system SHALL present one on-sheet source picker that filters eligible inventory items, spells, Features, and Traits using text search and source-category controls while retaining the selected source if subsequent filtering hides it.

#### Scenario: Searching for a source

- **WHEN** a user enters text into the search field
- **THEN** the picker SHALL use case-insensitive, whitespace-tokenized matching
- **AND** every non-empty query token MUST appear somewhere in the candidate's combined name, authored detail, or concise source context

#### Scenario: Filtering by source category

- **WHEN** a user selects Inventory, Spells, Features, or Traits
- **THEN** the picker SHALL show only candidates from that user-facing category
- **AND** selecting All SHALL restore candidates from every eligible category

#### Scenario: Selected source is filtered out

- **WHEN** a source is selected and a subsequent search or category filter hides it from the result list
- **THEN** the selected source SHALL remain selected and clearly identified until deliberately changed

#### Scenario: No search matches

- **WHEN** the active search and category filters match no eligible sources
- **THEN** the system SHALL display an explicit no-match state
- **AND** custom action creation SHALL remain available

### Requirement: Equipped-Only Toggle

The system SHALL provide an optional equipped-only filter for the Inventory source category without applying equipment state to spells, Features, or Traits.

#### Scenario: Toggling equipped-only inventory

- **WHEN** a user activates the equipped-only filter while viewing Inventory sources
- **THEN** unequipped inventory items SHALL be hidden
- **AND** equipped items SHALL remain in stable order

#### Scenario: Viewing another source category

- **WHEN** a user views Spells, Features, Traits, or All
- **THEN** equipment state SHALL NOT exclude non-inventory candidates

### Requirement: Focused Draft Review

The system SHALL present a focused form to review and edit a pending linked or custom action draft before it is saved.

#### Scenario: Editing a source-based draft

- **WHEN** a user selects an eligible source and proceeds to review
- **THEN** the system SHALL present an editable form containing the source's mapped text
- **AND** the draft SHALL use deterministic defaults for timing, category, and target
- **AND** edits made in this form SHALL NOT modify the underlying source

#### Scenario: Editing a custom draft

- **WHEN** a user chooses custom action creation
- **THEN** the system SHALL present the same focused form without a source link
- **AND** confirmation SHALL require a non-empty action name

### Requirement: Workflow Navigation

The system SHALL allow users to navigate backward to source or custom selection without accidentally committing an action.

#### Scenario: Navigating backward

- **WHEN** a user is on the draft review step and activates the "Back" control
- **THEN** the system SHALL return to the selection step
- **AND** the previous source or custom selection SHALL remain selected
- **AND** the character SHALL remain unchanged

### Requirement: Source Context Presentation

The system SHALL display sufficient source-specific context to distinguish similarly named inventory items, spells, Features, and Traits.

#### Scenario: Viewing inventory options

- **WHEN** a user views inventory candidates
- **THEN** each option SHALL display its name, equipped status, quantity when applicable, and concise notes when present

#### Scenario: Viewing spell options

- **WHEN** a user views spell candidates
- **THEN** each option SHALL display its name, spell level, prepared state when recorded, and concise notes when present

#### Scenario: Viewing Feature and Trait options

- **WHEN** a user views Feature or Trait candidates
- **THEN** each option SHALL display its name and available general, class/subclass, or ancestry context
- **AND** Features and Traits SHALL remain distinguishable

## REMOVED Requirements

### Requirement: Suggestion Request States

**Reason**: All candidates in this workflow are current character-owned records and are projected locally. External-provider lookup is outside this dialog, so request loading and failure states are no longer observable action-selection behavior.

**Migration**: Replace the asynchronous inventory suggestion request with the synchronous combined source projection. Continue to expose custom action creation in empty and no-match states.
