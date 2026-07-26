## ADDED Requirements

### Requirement: On-sheet source eligibility and text mapping

The system SHALL offer text-first runtime-action sources from all character inventory items, all on-sheet spells, all general features, all class and subclass features, and all ancestry Traits.

#### Scenario: Viewing spell sources

- **WHEN** the character has prepared and unprepared spells at one or more levels
- **THEN** every recorded spell SHALL be eligible as an action source
- **AND** spell level and prepared state SHALL be available as distinguishing context rather than eligibility rules

#### Scenario: Viewing Feature and Trait sources

- **WHEN** the character has general, class, subclass, or ancestry-trait records
- **THEN** each of those records SHALL be eligible as an action source
- **AND** Features and Traits SHALL remain distinguishable source categories

#### Scenario: Seeding source-owned text

- **WHEN** a user selects an eligible source
- **THEN** inventory items and spells SHALL seed name and notes
- **AND** general features SHALL seed name plus the first available summary or description text
- **AND** class features, subclass features, and ancestry Traits SHALL seed name without claiming ownership of action notes

#### Scenario: Background feature is present

- **WHEN** the character has a background feature
- **THEN** that background feature SHALL NOT be offered as an action source in this capability

## MODIFIED Requirements

### Requirement: Action Snapshot Creation

When a user confirms an action draft based on an eligible character-owned source, the system SHALL create an independently editable action snapshot linked to that source. Source changes SHALL NOT automatically update accepted snapshots.

#### Scenario: Adding a source-based action

- **WHEN** a user confirms a reviewed draft based on an eligible inventory item, spell, Feature, or Trait
- **THEN** a new action SHALL be added with the reviewed draft values
- **AND** the action SHALL retain a stable identity distinct from the source identity
- **AND** the action SHALL remain linked to that character-owned source

#### Scenario: Editing the source after acceptance

- **WHEN** a user changes a linked source's name or source-owned text
- **THEN** the accepted action snapshot SHALL remain unchanged until the user explicitly resyncs it

#### Scenario: Accepting the same source more than once

- **WHEN** a user accepts more than one draft derived from the same source
- **THEN** each accepted action SHALL have its own stable identity
- **AND** the system SHALL allow all accepted actions to remain linked to that source

#### Scenario: Source disappears before confirmation

- **WHEN** the selected source no longer exists when the user confirms the draft
- **THEN** the system SHALL reject the action creation without committing a partial or dangling link

### Requirement: Custom Action Preservation

The system SHALL allow users to create and edit manual, unlinked actions regardless of source availability.

#### Scenario: Creating a custom action through the guided workflow

- **WHEN** a user chooses custom action creation, completes the focused draft, and confirms it
- **THEN** exactly one new action SHALL be added without a source link

#### Scenario: Using bulk custom-action editing

- **WHEN** a user needs to add, remove, or edit multiple runtime actions together
- **THEN** the existing card-level bulk Edit workflow SHALL remain available

### Requirement: Explicit Action Resync

The system SHALL allow users to explicitly refresh a linked action's source-owned text after confirming that direct action edits to those fields may be overwritten, without replacing the action or its action-owned fields.

#### Scenario: Confirming resync

- **WHEN** a user confirms "Resync from source" on a linked action
- **THEN** the action SHALL receive the source's latest source-owned text
- **AND** the action's identity, source link, timing, category, target, and annotations SHALL be preserved

#### Scenario: Canceling resync

- **WHEN** a user declines or dismisses the resync confirmation
- **THEN** the action SHALL remain unchanged

#### Scenario: Source-owned notes were removed

- **WHEN** an inventory item, spell, or general feature no longer contains source-owned notes and the user confirms resync
- **THEN** stale source-owned notes from the previous action snapshot SHALL no longer be present

#### Scenario: Name-only source is resynced

- **WHEN** a class feature, subclass feature, or ancestry Trait is linked to an action with action-authored notes and the user confirms resync
- **THEN** the action name SHALL refresh from the source
- **AND** the action-authored notes SHALL remain unchanged

#### Scenario: Source is missing at resync commit

- **WHEN** the linked source no longer resolves when confirmed resync is committed
- **THEN** the system SHALL reject the resync without partially changing the action

### Requirement: Source Commands and Navigation

The system SHALL keep source-specific commands attached to the linked action they affect and SHALL provide a keyboard-accessible way to navigate from that action to its current containing sheet card without adding a separate source-status list.

#### Scenario: Viewing a linked action

- **WHEN** the user views a runtime action linked to an inventory item, spell, Feature, or Trait
- **THEN** that action's entry SHALL expose a concise source control or menu containing source navigation and resync commands
- **AND** the source name and kind context SHALL be available within those commands
- **AND** the action SHALL NOT appear in a second source-management list

#### Scenario: Viewing a custom action

- **WHEN** the user views a runtime action without a source link
- **THEN** its entry SHALL NOT expose source navigation or resync commands
- **AND** it SHALL NOT require a persistent custom-action label

#### Scenario: Navigating to an inventory source

- **WHEN** the user activates source navigation for an inventory-linked action
- **THEN** the inventory card containing the item SHALL be scrolled into view
- **AND** keyboard focus SHALL move to that containing card

#### Scenario: Navigating to a spell source

- **WHEN** the user activates source navigation for a spell-linked action
- **THEN** the spell-level card containing the spell SHALL be scrolled into view
- **AND** keyboard focus SHALL move to that containing card

#### Scenario: Navigating to a Feature or Trait source

- **WHEN** the user activates source navigation for a Feature- or Trait-linked action
- **THEN** the separate Features or Traits card containing that source SHALL be scrolled into view
- **AND** keyboard focus SHALL move to that containing card

### Requirement: Source Deletion Fallback

The system SHALL preserve action snapshots whose linked character-owned sources are deleted and SHALL remove their source links in the same committed edit.

#### Scenario: Deleting a linked source

- **WHEN** a user deletes an inventory item, spell, general feature, class feature, subclass feature, or ancestry Trait
- **THEN** every runtime action linked to that source SHALL remain in the runtime list with its snapshot fields, identity, annotations, and order unchanged
- **AND** those actions' source links SHALL be permanently removed
- **AND** source-navigation and resync controls SHALL no longer be shown for those actions

#### Scenario: Deleting one source among several

- **WHEN** a structured edit removes one source while retaining other source records
- **THEN** only actions linked to the removed source SHALL be unlinked
- **AND** links to retained sources SHALL remain unchanged

### Requirement: Versioned Source-Link Persistence

The system SHALL preserve valid item, spell, and feature source links through current v0 save and import/export round trips.

#### Scenario: Custom actions round-trip

- **WHEN** a current character containing custom actions without source links is saved, exported, and imported
- **THEN** those actions SHALL retain their identities and authored fields without gaining source links

#### Scenario: Widened source links round-trip

- **WHEN** a current character containing valid item-, spell-, feature-, or trait-derived action links is saved, exported, and imported
- **THEN** the actions and their character-owned source links SHALL remain semantically equivalent

## REMOVED Requirements

### Requirement: Suggestion Request States

**Reason**: Runtime-action candidates in this workflow are now projected synchronously from character-owned records. External-provider lookup occurs before a record becomes an action source, so loading and provider-failure states no longer belong in action selection.

**Migration**: Remove the action-dialog suggestion request, loading state, and failure state. Keep custom action creation continuously available through the local guided workflow.
