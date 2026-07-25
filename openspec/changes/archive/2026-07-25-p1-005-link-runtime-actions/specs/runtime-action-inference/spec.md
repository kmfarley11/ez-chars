## ADDED Requirements

### Requirement: Inventory Action Suggestions

The system SHALL offer one action suggestion for each equipped inventory item and SHALL seed the suggestion from that item's current name and notes.

#### Scenario: Viewing suggestions for equipped items

- **WHEN** a user requests suggestions for equipped inventory items
- **THEN** the system SHALL present one suggestion per equipped item in the same order as those items appear in inventory
- **AND** each suggestion SHALL contain the source item's current name and notes

#### Scenario: Ignoring unequipped items

- **WHEN** a user requests inventory-based action suggestions
- **THEN** unequipped inventory items SHALL NOT produce suggestions

#### Scenario: No equipped items are available

- **WHEN** a user requests suggestions and no inventory items are equipped
- **THEN** the system SHALL display an empty state
- **AND** manual custom-action creation SHALL remain available

### Requirement: Action Snapshot Creation

When a user accepts an inventory-based suggestion, the system SHALL create an independently editable action snapshot linked to that character-owned source item. Source changes SHALL NOT automatically update accepted snapshots.

#### Scenario: Adding a suggested action

- **WHEN** a user accepts a suggestion for an equipped "Longsword" item
- **THEN** a new action SHALL be added to the runtime list with the "Longsword" name and notes from the accepted suggestion
- **AND** the action SHALL retain a stable identity distinct from the source item's identity
- **AND** the action SHALL remain linked to that source item

#### Scenario: Editing the source after acceptance

- **WHEN** a user changes the linked "Longsword" item's name or notes
- **THEN** the accepted action snapshot SHALL remain unchanged until the user explicitly resyncs it

#### Scenario: Accepting the same source more than once

- **WHEN** a user accepts more than one suggestion derived from the same source item
- **THEN** each accepted action SHALL have its own stable identity
- **AND** the system SHALL allow all accepted actions to remain linked to that same source item

### Requirement: Custom Action Preservation

The system SHALL preserve the ability to create and edit manual, unlinked actions regardless of suggestion availability.

#### Scenario: Creating a custom action

- **WHEN** a user chooses to add a manual custom action
- **THEN** a new action SHALL be added without a source link

### Requirement: Runtime Action Summary and Bulk Editing

The system SHALL present each runtime action as one concise entry that prioritizes its playable summary while retaining the existing card-level bulk editing and annotation workflows.

#### Scenario: Viewing an action with player-authored notes

- **WHEN** a runtime action has a name, timing, category, and non-empty notes
- **THEN** its entry SHALL present the name, timing, and category as the primary summary
- **AND** its notes SHALL appear beneath or after that summary as visually secondary italic text
- **AND** the action SHALL NOT be duplicated in a separate source-status list

#### Scenario: Viewing an action without notes

- **WHEN** a runtime action has no authored note content
- **THEN** its entry SHALL remain concise without displaying an empty-note placeholder

#### Scenario: Using bulk action editing

- **WHEN** a user needs to add, remove, or edit multiple runtime actions together
- **THEN** the existing card-level bulk Edit workflow SHALL remain available
- **AND** the existing card-level Notes workflow SHALL remain available for annotation/reference notes

### Requirement: Explicit Action Resync

The system SHALL allow users to explicitly refresh a linked action's name and notes from its source item without replacing the action or its other user-edited fields.

#### Scenario: Resyncing an action

- **WHEN** a user triggers the "Resync from source" command on a linked action
- **THEN** the action's name and notes SHALL be overwritten with the source item's latest name and notes
- **AND** the action's identity, source link, timing, category, target, and annotations SHALL be preserved

#### Scenario: Source notes were removed

- **WHEN** the linked source item's notes have been removed and the user resyncs the action
- **THEN** stale notes from the previous action snapshot SHALL no longer be present

### Requirement: Source Commands and Navigation

The system SHALL keep source-specific commands attached to the linked action they affect and SHALL provide a keyboard-accessible way to navigate from that action to its source item without adding a separate source-status list.

#### Scenario: Viewing a linked action

- **WHEN** the user views a runtime action linked to an inventory item
- **THEN** that action's entry SHALL expose a concise source control or menu containing source navigation and resync commands
- **AND** the source item name SHALL be available within those commands
- **AND** the action SHALL NOT appear in a second source-management list

#### Scenario: Viewing a custom action

- **WHEN** the user views a runtime action without a source link
- **THEN** its entry SHALL NOT expose source navigation or resync commands
- **AND** it SHALL NOT require a persistent custom-action label

#### Scenario: Navigating to a source item

- **WHEN** the user activates a linked action's source-navigation control
- **THEN** the inventory card containing the source item SHALL be scrolled into view
- **AND** keyboard focus SHALL move to that containing inventory card

### Requirement: Source Deletion Fallback

The system SHALL preserve an action snapshot if its linked source item is deleted and SHALL convert the action to a custom, unlinked action in the same committed edit.

#### Scenario: Deleting the source item

- **WHEN** a user deletes the "Longsword" item from inventory
- **THEN** every runtime action linked to that item SHALL remain in the runtime list with its snapshot fields unchanged
- **AND** those actions' source links SHALL be permanently removed
- **AND** source-navigation and resync controls SHALL no longer be shown for those actions

### Requirement: Suggestion Request States

The system SHALL communicate pending and failed suggestion requests without blocking manual action creation.

#### Scenario: Suggestions are loading

- **WHEN** an inventory suggestion request has not yet resolved
- **THEN** the UI SHALL display a loading state until the request completes

#### Scenario: Suggestion request fails

- **WHEN** an inventory suggestion request fails
- **THEN** the UI SHALL display a non-destructive error state
- **AND** manual custom-action creation SHALL remain available

### Requirement: Versioned Source-Link Persistence

The system SHALL migrate supported older 5e character documents to the new current layout without inventing source links, and SHALL preserve valid source links through current save and import/export round trips.

#### Scenario: Existing character without source links is loaded

- **WHEN** a supported older character document contains runtime actions without source links
- **THEN** migration SHALL preserve those actions as custom actions with their existing identities and authored fields

#### Scenario: Linked action round-trips

- **WHEN** a current character containing a linked action is saved, exported, and imported
- **THEN** the action and its valid source link SHALL remain semantically equivalent
