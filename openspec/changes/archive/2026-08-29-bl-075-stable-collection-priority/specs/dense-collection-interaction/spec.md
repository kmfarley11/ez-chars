## MODIFIED Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, Spells, Runtime Actions, and Supporting Collections (Features, Traits, Languages, Tools) with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Runtime Actions SHALL use a five-item simple-list limit because their information-rich rows consume more space, while compact Supporting Collections SHALL use a seven-item simple-list limit. Collections that exceed their applicable limit SHALL expose bounded or focused presentation and search controls. Eligible equipment, spell, and Supporting Collections SHALL expose collection-level Manage Pins while preserving their collection-specific editing grammar. Equipment and spell rows SHALL add state-sensitive Pin/Unpin to their established action menus, while Supporting Collections SHALL retain compact bullet rows and card-level structured Edit/Notes actions rather than adopting that identity-owned row-action grammar.

#### Scenario: Viewing a populated target collection (Equipment, Spells)

- **WHEN** an equipment or spell collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** each record SHALL be exposed as one distinct list item whose established row action menu includes Edit, Notes, and state-sensitive Pin or Unpin
- **AND** the collection SHALL expose a separately named Manage Pins action

#### Scenario: Viewing a populated Runtime Actions collection

- **WHEN** the Runtime Actions collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** the collection SHALL retain its card-level Add/Edit/Notes grammar plus its source-specific row commands without being forced into generic target-collection row actions or priority management

#### Scenario: Viewing a populated supporting collection

- **WHEN** a supporting collection (e.g. Features, Traits) contains one or more records
- **THEN** the collection SHALL retain its existing structured Edit/Notes action grammar without exposing complete row-level actions per item
- **AND** its records SHALL retain the compact bullet-list presentation with a quiet marker when pinned rather than adopting the more detailed Runtime Action or equipment/spell row treatment
- **AND** the collection SHALL expose a separately named Manage Pins action

#### Scenario: Viewing an empty target collection

- **WHEN** a target collection contains no records
- **THEN** the sheet SHALL present an explicit empty state and retain every collection-level action that remains meaningful for an empty collection

#### Scenario: Viewing spellcasting summary and spells

- **WHEN** a character has spellcasting summary data, spell slots, and spell records
- **THEN** the sheet SHALL present ability, save DC, and attack bonus in a compact full-width Spellcasting group
- **AND** it SHALL present Spell Slots as a discrete full-width group on the next row before the searchable spell collection
- **AND** every first- through ninth-level slot SHALL appear once as an editable `used / max` pair, defaulting to `0 / 0` when that level is not yet stored
- **AND** it SHALL NOT repeat the same slot usage as a separate `Used` field or level-specific slot card

#### Scenario: Adding a previously absent spell-slot level

- **WHEN** a user edits a `0 / 0` slot level and saves a nonzero used or maximum value
- **THEN** that level SHALL become part of the character's persisted spell-slot data
- **AND** untouched `0 / 0` defaults SHALL NOT require persisted placeholder records

#### Scenario: Viewing a character without spells or spell slots

- **WHEN** a character has no spell records and no nonzero spell-slot levels
- **THEN** the Spells section SHALL start collapsed
- **AND** the user SHALL be able to expand it to reach spellcasting, spell-slot, and spell-list setup controls

#### Scenario: Viewing Runtime Actions within the simple-list limit

- **WHEN** the Runtime Actions collection contains 5 or fewer items
- **THEN** it SHALL be presented as a simple list without search controls or bounded scrolling
- **AND** it SHALL retain the shared heading, semantic, and action-placement baseline

#### Scenario: Viewing Runtime Actions above the simple-list limit

- **WHEN** the Runtime Actions collection contains 6 or more items
- **THEN** it SHALL activate a bounded height container or focused view and expose a search bar

#### Scenario: Viewing a supporting collection within the simple-list limit

- **WHEN** a Supporting Collection contains 7 or fewer items
- **THEN** it SHALL be presented as a simple list without search controls or bounded scrolling
- **AND** it SHALL retain the shared heading, semantic, action-placement, and Manage Pins baseline

#### Scenario: Viewing a supporting collection above the simple-list limit

- **WHEN** a Supporting Collection contains 8 or more items
- **THEN** it SHALL activate a bounded height container or focused view and expose a search bar
- **AND** Manage Pins SHALL remain available in the applicable presentation

### Requirement: Dense collection search is deterministic and scope-appropriate

The sheet SHALL provide case-insensitive text search over primary record labels and useful authored detail for each searchable collection. Equipment search SHALL remain scoped to the active Weapons, Armor & Shields, or Other Gear collection. Spell search SHALL span the character's logical spell collection across displayed levels. Supporting Collection search SHALL remain scoped to the active Features, Traits, Languages, or Tools collection. Eligible matching records SHALL retain their relative canonical priority-first alphabetical order. Runtime Action search SHALL comprehensively cover current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without live-source text and SHALL retain independently authored order.

#### Scenario: Searching one equipment group

- **WHEN** a user searches within Other Gear
- **THEN** matching pinned Other Gear records SHALL precede matching unpinned records and each tier SHALL remain alphabetical
- **AND** Weapons and Armor & Shields SHALL NOT be introduced into that result set

#### Scenario: Searching spells across levels

- **WHEN** a user searches for text that matches spells at more than one level
- **THEN** every matching spell SHALL be discoverable through the same spell-search workflow
- **AND** matching pinned spells SHALL precede unpinned level-grouped matches
- **AND** each result SHALL identify itself as a Spell and display its cantrip or spell-level context plus prepared state when recorded

#### Scenario: Searching a Supporting Collection

- **WHEN** a user searches Features, Traits, Languages, or Tools
- **THEN** results SHALL remain scoped to that one supporting collection
- **AND** matching pinned entries SHALL precede matching unpinned entries in canonical alphabetical order

#### Scenario: Searching Runtime Actions

- **WHEN** a user searches Runtime Actions
- **THEN** every action whose current snapshot fields or source context (name, target, notes, timing, category, source label/category, source context) matches the query SHALL be returned in independently authored order
- **AND** the search SHALL NOT silently index newer live-source text that differs from the snapshot

#### Scenario: Search has no matches

- **WHEN** the active query matches no record in its collection scope
- **THEN** the sheet SHALL present a no-match state, a zero-result count, and an evident way to clear or revise the query

#### Scenario: Search changes the visible subset

- **WHEN** a query filters a searchable collection
- **THEN** matching records SHALL retain their relative canonical presentation order
- **AND** filtering SHALL NOT mutate Pin state, authored order, or other canonical character data

### Requirement: Phone-sized collection cards preserve at-a-glance priority

On a phone-sized sheet, each eligible equipment/spell collection card SHALL show at most the first five records from its canonical priority-first presentation, and each eligible Supporting Collection SHALL show at most the first seven records from that presentation. Runtime Actions SHALL continue to show at most the first five independently authored records. The complete collection SHALL remain accessible. Each preview SHALL present its primary name and, when useful authored detail exists, a single-line `Name: detail` summary whose detail is visually secondary and italicized without removing the complete text from assistive technology.

#### Scenario: Phone eligible collection has few enough records

- **WHEN** a phone-sized eligible collection contains no more records than its compact preview limit (5 for equipment and spells; 7 for Supporting Collections)
- **THEN** every record SHALL appear in canonical priority-first alphabetical order within the compact card without a remaining-item announcement

#### Scenario: Phone Runtime Actions has few enough records

- **WHEN** Runtime Actions contains 5 or fewer records on a phone-sized sheet
- **THEN** every action SHALL appear in independently authored order within the compact card without a remaining-item announcement

#### Scenario: Phone collection exceeds its preview limit

- **WHEN** a phone-sized collection contains more records than its applicable compact preview limit
- **THEN** only the applicable first canonical records SHALL appear in the compact preview
- **AND** the complete collection SHALL remain reachable through an explicitly named action that includes the exact total item count

#### Scenario: Pinned records exceed the eligible preview limit

- **WHEN** an eligible collection contains more pinned records than fit in its phone preview
- **THEN** the preview SHALL contain only the applicable number of alphabetically first pinned records
- **AND** every other pinned and unpinned record SHALL remain reachable through the complete collection workflow

#### Scenario: Preview detail exceeds the card width

- **WHEN** a compact preview summary is wider than its available row
- **THEN** the visible summary SHALL truncate on one line with an ellipsis rather than expanding or overflowing the card
- **AND** assistive technology SHALL retain access to the complete record label and detail
- **AND** the compact preview SHALL NOT introduce horizontal scrolling
