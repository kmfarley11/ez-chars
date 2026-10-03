## MODIFIED Requirements

### Requirement: Source Deletion Fallback

The system SHALL preserve action snapshots whose linked character-owned sources are deleted and SHALL remove their source links in the same committed edit. Source detachment SHALL preserve action-owned Pin membership and stored action sequence; visible retrieval order SHALL follow the collection's priority and timing presentation independently of that sequence.

#### Scenario: Deleting a linked source

- **WHEN** a user deletes an inventory item, spell, general feature, class feature, subclass feature, or ancestry Trait
- **THEN** every runtime action linked to that source SHALL remain in the runtime list with its snapshot fields, identity, annotations, Pin membership, and stored sequence unchanged
- **AND** those actions' source links SHALL be permanently removed
- **AND** source-navigation and resync controls SHALL no longer be shown for those actions
- **AND** no action SHALL be removed or unpinned merely because its former source was removed

#### Scenario: Deleting one source among several

- **WHEN** a structured edit removes one source while retaining other source records
- **THEN** only actions linked to the removed source SHALL be unlinked
- **AND** links and action-owned Pin membership of retained actions SHALL remain unchanged
