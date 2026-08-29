## ADDED Requirements

### Requirement: Eligible collections expose one familiar priority-management language

The application SHALL let users manage Pin and Unpin state for identity-owned entries in eligible collections. The initial D&D 5e 2014 eligible collections SHALL be Weapons, Armor & Shields, Other Gear, Spells, Features, Traits, Languages, and Tools. Runtime Actions SHALL remain outside this capability until their independently owned priority and action-economy behavior is deliberately reconciled.

#### Scenario: Managing priorities in a short collection

- **WHEN** an eligible collection is short enough to remain in its simple presentation
- **THEN** the collection SHALL expose a clearly named Manage Pins action without adding a search control solely because pinning exists
- **AND** the user SHALL be able to inspect and change Pin state for every entry

#### Scenario: Managing priorities in a dense filtered collection

- **WHEN** an eligible dense collection has an active text query and the user opens Manage Pins
- **THEN** the management workflow SHALL retain the active query and expose Pin state for the matching identity-owned entries
- **AND** filtered-out entries and their Pin states SHALL remain unchanged unless the user subsequently makes them visible and deliberately changes them

#### Scenario: Changing one equipment or spell priority from its row

- **WHEN** a user invokes Pin or Unpin from an equipment or spell row's established action menu
- **THEN** that one membership change SHALL commit immediately as a validated character update
- **AND** Manage Pins SHALL remain available for changing several entries together

#### Scenario: Viewing Runtime Actions during the initial rollout

- **WHEN** the user views or searches Runtime Actions
- **THEN** that collection SHALL retain its independently authored order and specialized source/action-economy behavior
- **AND** it SHALL NOT imply that the generic Pin/Unpin capability applies

### Requirement: Pin management is atomic and cancelable

Manage Pins SHALL maintain a local draft of Pin state. Saving SHALL validate and commit the complete intended Pin state for that collection atomically, then return the user to the invoking collection with its canonical priority order. Canceling or dismissing the workflow SHALL discard the draft without changing character data. An immediate row-menu Pin or Unpin SHALL validate and commit exactly one intended membership change atomically and SHALL remain reversible through the resulting row menu or Manage Pins.

#### Scenario: Saving several Pin changes

- **WHEN** a user pins and unpins several visible entries and saves Manage Pins
- **THEN** all valid changes SHALL commit as one intentional character update
- **AND** the collection SHALL reappear in its updated canonical priority order
- **AND** unrelated character data SHALL remain unchanged

#### Scenario: Canceling Pin changes

- **WHEN** a user changes one or more draft Pin states and then cancels or dismisses Manage Pins
- **THEN** every persisted Pin state SHALL remain unchanged
- **AND** focus SHALL return to the invoking Manage Pins action or an equivalent stable destination

#### Scenario: Pin target becomes invalid before save

- **WHEN** a draft refers to an entry identity that is no longer valid for the owning collection at save time
- **THEN** the character update SHALL fail without partially committing the remaining Pin changes
- **AND** the user SHALL retain an understandable management context for correction or cancellation

#### Scenario: Immediate row-menu Pin target becomes invalid

- **WHEN** an equipment or spell entry is no longer a valid member of its owning collection when its row-menu Pin or Unpin is committed
- **THEN** the character update SHALL fail without changing any Pin membership or unrelated character data

### Requirement: Eligible collections use priority-first alphabetical presentation

An eligible collection SHALL present every pinned entry before every unpinned entry. Entries within each tier SHALL use a deterministic case-insensitive alphabetical order with a deterministic tie rule for equivalent or duplicate labels. Pin count SHALL be unlimited, and filtering SHALL preserve the relative canonical priority order of matching entries.

#### Scenario: Viewing pinned and unpinned entries

- **WHEN** an eligible collection contains both pinned and unpinned entries
- **THEN** all pinned entries SHALL appear first in deterministic alphabetical order
- **AND** all unpinned entries SHALL follow in deterministic alphabetical order

#### Scenario: Renaming an unpinned entry

- **WHEN** a user renames an unpinned entry and saves it
- **THEN** the entry SHALL take its new alphabetical position without changing Pin state or identity

#### Scenario: More entries are pinned than fit in a compact preview

- **WHEN** the number of pinned entries exceeds the collection's compact preview limit
- **THEN** the preview SHALL show the applicable number of alphabetically first pinned entries
- **AND** every remaining pinned and unpinned entry SHALL remain reachable through the complete collection workflow

#### Scenario: Searching a prioritized collection

- **WHEN** a text query matches pinned and unpinned entries
- **THEN** matching pinned entries SHALL precede matching unpinned entries
- **AND** the query SHALL NOT mutate Pin state or canonical character data

### Requirement: Spells expose one global pinned tier

The logical Spells collection SHALL present pinned spells from any cantrip or spell level in one global pinned tier without duplication. Every pinned spell SHALL retain visible cantrip or level and preparation context. Unpinned spells SHALL remain grouped from cantrips through ninth level and SHALL be alphabetical within each level.

#### Scenario: Pinning a higher-level spell

- **WHEN** a user pins a higher-level spell while lower-level unpinned spells exist
- **THEN** the pinned spell SHALL appear in the global pinned tier before those unpinned spells
- **AND** its level context SHALL remain visible

#### Scenario: Viewing a spell after unpinning it

- **WHEN** a user unpins a spell and saves Manage Pins
- **THEN** the spell SHALL appear exactly once in its cantrip or spell-level group
- **AND** it SHALL take its alphabetical position within that group

### Requirement: Normal collection presentation keeps priority quiet and evident

Eligible collection entries SHALL communicate persisted Pin state. Equipment and spell rows SHALL expose state-sensitive Pin or Unpin through their established row action menus without adding an always-visible row control. Compact Supporting Collections SHALL retain their bullet-list grammar and SHALL use a quiet persistent pinned marker plus collection-level Manage Pins. Priority controls and their associated labels SHALL meet the repository's touch, keyboard, focus, and assistive-technology interaction requirements.

#### Scenario: Viewing an equipment or spell row action menu

- **WHEN** a user opens an eligible equipment or spell row's action menu
- **THEN** the menu SHALL expose Pin when the entry is unpinned or Unpin when it is pinned alongside the existing row actions
- **AND** completing the command SHALL restore focus to the same identity-owned row action when it remains rendered or to an equivalent stable collection destination after priority reordering

#### Scenario: Viewing a pinned supporting entry

- **WHEN** a Feature, Trait, Language, or Tool is pinned
- **THEN** its normal compact row SHALL expose an understandable pinned state without becoming a full identity-owned action row
- **AND** the collection's existing card-level Edit and Notes grammar SHALL remain available

#### Scenario: Managing Pins with touch or keyboard

- **WHEN** a touch or keyboard user opens Manage Pins and changes a draft state
- **THEN** every control SHALL have an evident accessible name, conforming activation target, visible focus, and logical navigation order
- **AND** no pointer-only, drag-only, right-click-only, or long-press-only path SHALL be required

### Requirement: Priority persistence remains system-owned and round-trippable

Pin state SHALL belong to the character and SHALL survive validated local persistence and JSON backup/restore. A system or domain SHALL opt into the familiar priority-management interaction by supplying durable entry identity, current Pin state, and validated mutation behavior; adoption SHALL NOT require unrelated game systems to persist one universal Pin property or collection schema.

#### Scenario: Reopening a prioritized character

- **WHEN** a character with pinned entries is saved and reopened
- **THEN** every valid Pin state and resulting canonical presentation SHALL be preserved

#### Scenario: Exporting and restoring a prioritized character

- **WHEN** a character with pinned entries is exported and restored through the supported JSON workflow
- **THEN** Pin state, stable identities, annotations, source context, and authored content SHALL remain semantically equivalent

#### Scenario: A future system adopts priority management

- **WHEN** another game system adopts the shared Pin/Unpin experience for one of its identity-owned collections
- **THEN** it SHALL be permitted to retain a system-native record shape and priority storage strategy
- **AND** users SHALL receive the same observable Pin/Unpin and priority-ordering language where that capability is offered
