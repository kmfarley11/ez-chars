## MODIFIED Requirements

### Requirement: Eligible collections expose one familiar priority-management language

The application SHALL let users manage Pin and Unpin state for identity-owned entries in eligible collections. The D&D 5e 2014 eligible collections SHALL be Weapons, Armor & Shields, Other Gear, Spells, Features, Traits, Languages, Tools, and Runtime Actions. Each SHALL expose first-class state-sensitive Pin/Unpin on the record without requiring a batch Pin manager or opening record editing.

#### Scenario: Managing priorities in a short collection

- **WHEN** an eligible collection is short enough to remain in its simple presentation
- **THEN** each eligible entry SHALL expose Pin or Unpin without adding a search control solely because pinning exists
- **AND** the user SHALL be able to inspect and change Pin state for every entry

#### Scenario: Managing priorities in a dense filtered collection

- **WHEN** an eligible dense collection has an active query or quickfilter and the user pins a matching entry
- **THEN** that membership change SHALL retain the active restrictions
- **AND** filtered-out entries and their Pin states SHALL remain unchanged

#### Scenario: Changing one priority from its row

- **WHEN** a user invokes Pin or Unpin directly on an eligible collection record
- **THEN** that one membership change SHALL commit immediately as a validated character update
- **AND** a batch Pin manager SHALL NOT be required for the operation

#### Scenario: Viewing Runtime Actions

- **WHEN** the user views or searches Runtime Actions
- **THEN** the collection SHALL use the same explicit Pin/Unpin interaction while preserving specialized source commands
- **AND** its stored action sequence SHALL remain unchanged by presentation sorting

### Requirement: Pin management is atomic and cancelable

An immediate record-level Pin or Unpin SHALL validate and commit exactly one intended membership change atomically against current character data and SHALL remain reversible through the opposite record-level action. It SHALL NOT create an authored-value or note draft or require batch Save/Cancel. Any separately retained batch-management surface SHALL preserve its local draft, atomic Save, and cancellation contract without becoming required production navigation.

#### Scenario: Saving several Pin changes in a retained batch surface

- **WHEN** a separately retained batch surface allows several draft Pin changes and the user saves
- **THEN** all valid changes SHALL commit as one intentional character update
- **AND** unrelated character data SHALL remain unchanged
- **AND** the collection SHALL reappear in its updated canonical presentation

#### Scenario: Canceling draft Pin changes

- **WHEN** a user changes draft Pin states in such a batch surface and cancels or dismisses it
- **THEN** every persisted Pin state SHALL remain unchanged
- **AND** focus SHALL return to its invoking control or an equivalent stable destination

#### Scenario: Pin target becomes invalid before save

- **WHEN** a retained draft refers to an identity that is no longer valid for the owning collection at save time
- **THEN** the character update SHALL fail without partially committing remaining Pin changes
- **AND** the user SHALL retain an understandable context for correction or cancellation

#### Scenario: Immediate Pin target becomes invalid

- **WHEN** an entry is no longer a valid member of its collection when Pin or Unpin is committed
- **THEN** the update SHALL fail without changing any Pin membership or unrelated character data
- **AND** it SHALL NOT recreate the missing record

#### Scenario: Reversing an immediate Pin

- **WHEN** a user pins an eligible record and then invokes Unpin
- **THEN** that record SHALL return to the owning collection's unpinned presentation without changing its authored fields or other records' pins

### Requirement: Eligible collections use priority-first alphabetical presentation

An eligible collection SHALL present matching pinned entries before matching unpinned entries. The pinned tier SHALL use deterministic case-insensitive alphabetical order with a deterministic tie rule for equivalent or duplicate labels. Unpinned equipment and Supporting Collections SHALL remain alphabetical; unpinned Spells SHALL use level then name; unpinned Runtime Actions SHALL use Action, Bonus action, Reaction, Free, Other timing order then name. Pin count SHALL be unlimited. Filtering SHALL preserve the relative presentation order of matching entries without rewriting the stored record sequence. Category, preparation, creation time, edit time, and pin time SHALL NOT become additional sort keys.

#### Scenario: Viewing pinned and unpinned entries

- **WHEN** an eligible collection contains both pinned and unpinned entries
- **THEN** matching pinned entries SHALL appear first in deterministic alphabetical order
- **AND** matching unpinned entries SHALL follow in the owning collection's specified order

#### Scenario: Renaming an unpinned entry

- **WHEN** a user renames an unpinned entry and saves it
- **THEN** the entry SHALL take its new alphabetical position within its applicable timing, level, or ungrouped tier without changing Pin state or identity

#### Scenario: More entries are pinned than fit in a compact preview

- **WHEN** matching pinned entries exceed the collection's compact preview limit
- **THEN** the preview SHALL show the applicable number of alphabetically first matching pins
- **AND** every remaining matching record SHALL remain reachable through complete browsing, with excluded records recoverable by resetting restrictions

#### Scenario: Searching a prioritized collection

- **WHEN** a query and any active quickfilters match pinned and unpinned entries
- **THEN** matching pinned entries SHALL precede matching unpinned entries
- **AND** narrowing SHALL NOT mutate Pin state or canonical character data

#### Scenario: Changing an action's timing

- **WHEN** an action's timing is edited and saved
- **THEN** its identity and Pin membership SHALL remain unchanged
- **AND** an unpinned action SHALL use its new timing/name display position while the underlying action sequence remains unchanged

### Requirement: Spells expose one global pinned tier

The logical Spells collection SHALL present matching pinned spells from any cantrip or spell level in one global alphabetical pinned tier without duplication. Every pinned spell SHALL retain visible cantrip or level and preparation context. Unpinned spells SHALL remain grouped from cantrips through ninth level and SHALL be alphabetical within each level. Active Level, Prepared-only, and text restrictions SHALL apply equally to pinned and unpinned spells.

#### Scenario: Pinning a higher-level spell

- **WHEN** a user pins a higher-level spell while lower-level unpinned spells match the active restrictions
- **THEN** the pinned spell SHALL appear before those spells if it also matches
- **AND** its level context SHALL remain visible

#### Scenario: Viewing a spell after unpinning it

- **WHEN** a user unpins a spell
- **THEN** the matching spell SHALL appear exactly once in its cantrip or spell-level group at its alphabetical position

### Requirement: Normal collection presentation keeps priority quiet and evident

Eligible collection entries SHALL communicate persisted Pin state and expose state-sensitive first-class Pin/Unpin controls separate from their label-based Detail entry. Supporting Collections SHALL retain their compact bullet-list grammar and quiet pinned marker. Controls SHALL meet the repository's touch, keyboard, focus, and assistive-technology requirements without requiring overflow menus or batch management for priority.

#### Scenario: Changing a visible record's priority

- **WHEN** a user activates Pin or Unpin on an eligible record
- **THEN** the control SHALL communicate the resulting state
- **AND** focus SHALL remain with that identity-owned control after reordering when it remains rendered, or return to an equivalent stable collection destination
- **AND** independent detail or source commands SHALL NOT fire as a side effect

#### Scenario: Viewing a pinned supporting entry

- **WHEN** a Feature, Trait, Language, or Tool is pinned
- **THEN** its compact row SHALL expose an understandable pinned state and first-class Unpin without adopting a complete equipment/action row menu
- **AND** existing label-based Detail and collection Add access SHALL remain intact

#### Scenario: Using Pins with touch or keyboard

- **WHEN** a touch or keyboard user changes a record's Pin state
- **THEN** the control SHALL have an evident accessible name, conforming activation target, visible focus, and logical navigation order
- **AND** no pointer-only, drag-only, right-click-only, or long-press-only path SHALL be required

## ADDED Requirements

### Requirement: Runtime Action priority follows action identity through its lifecycle

Runtime Action Pin membership SHALL belong to the character's action identity, independently of source identity or source Pin state. It SHALL survive valid persistence and JSON round trips. Valid current-format characters without action pins SHALL remain accepted. Invalid external priority references SHALL be rejected through validated input rather than silently assigned to similarly named records.

#### Scenario: Renaming or resynchronizing a pinned action

- **WHEN** a pinned action is renamed, edited, or resynchronized from its source
- **THEN** the same action identity SHALL remain pinned without changing unrelated memberships
- **AND** its current name and timing SHALL determine its matching presentation

#### Scenario: Deleting a pinned action

- **WHEN** an action is removed
- **THEN** its Pin membership SHALL be removed in the same validated mutation
- **AND** remaining actions and their Pin states SHALL be preserved

#### Scenario: Deleting or pinning a source

- **WHEN** a pinned action's source is deleted
- **THEN** the surviving detached action snapshot SHALL retain its pin
- **AND** pinning or unpinning a source SHALL NOT change action priority, nor SHALL action priority change source priority

#### Scenario: Valid action pins round-trip

- **WHEN** a character with custom and source-linked pinned actions is saved, reloaded, exported, and restored
- **THEN** valid action membership, identity, annotations, authored content, stored sequence, and source context SHALL remain semantically equivalent
- **AND** temporary quickfilter and text-search state SHALL NOT become character data

#### Scenario: Invalid action priority is imported

- **WHEN** imported priority contains duplicate memberships or identities that are missing, ambiguous, or belong only to another collection
- **THEN** import SHALL fail validation without partially replacing the current character
- **AND** records SHALL NOT be matched by name or silently recreated
