## MODIFIED Requirements

### Requirement: Inventory Action Suggestions

The system SHALL offer one action suggestion for any inventory item and SHALL seed the suggestion from that item's current name and notes. Equipped items SHALL be presented first in the default view.

#### Scenario: Viewing suggestions for inventory items

- **WHEN** a user requests inventory-based action suggestions
- **THEN** the system SHALL present suggestions for all inventory items
- **AND** equipped items SHALL be sorted before unequipped items, while preserving the underlying inventory order within each group
- **AND** each suggestion SHALL contain the source item's current name and notes

#### Scenario: No inventory items are available

- **WHEN** a user requests suggestions and no inventory items exist
- **THEN** the system SHALL display an empty state explaining that inventory is empty
- **AND** manual custom-action creation SHALL remain available
