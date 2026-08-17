## MODIFIED Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, Spells, Runtime Actions, and Supporting Collections (Features, Traits, Languages, Tools) with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Runtime Actions and Supporting Collections SHALL dynamically apply a "Rule of 10": collections with 10 or fewer items use a simple unbounded list, while collections with 11 or more items expose bounded or focused presentation and search controls. Supporting collections SHALL explicitly retain their existing card-level structured Edit/Notes action grammar rather than adopting the identity-owned row-action grammar of target collections.

#### Scenario: Viewing a populated target collection (Equipment, Spells)
- **WHEN** an equipment or spell collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** each record SHALL be exposed as one distinct list item with its complete actions associated with that item

#### Scenario: Viewing a populated Runtime Actions collection
- **WHEN** the Runtime Actions collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** the collection SHALL retain its card-level Add/Edit/Notes grammar plus its source-specific row commands without being forced into generic target-collection row actions

#### Scenario: Viewing a populated supporting collection
- **WHEN** a supporting collection (e.g. Features, Traits) contains one or more records
- **THEN** the collection SHALL retain its existing structured Edit/Notes action grammar without exposing complete row-level actions per item

#### Scenario: Viewing an empty target collection
- **WHEN** a target collection contains no records
- **THEN** the sheet SHALL present an explicit empty state and retain the available collection-level actions

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

#### Scenario: Viewing a supporting collection with 10 or fewer items
- **WHEN** a Runtime Action or Supporting Collection contains 10 or fewer items
- **THEN** it SHALL be presented as a simple list without search controls or bounded scrolling
- **AND** it SHALL retain the shared heading, semantic, and action-placement baseline

#### Scenario: Viewing a supporting collection with 11 or more items
- **WHEN** a Runtime Action or Supporting Collection contains 11 or more items
- **THEN** it SHALL activate a bounded height container or focused view and expose a search bar

### Requirement: Dense collection search is deterministic and scope-appropriate

The sheet SHALL provide case-insensitive text search over primary record labels and useful authored detail for each target collection. Equipment search SHALL remain scoped to the active Weapons, Armor & Shields, or Other Gear collection. Spell search SHALL span the character's logical spell collection across displayed levels. Runtime Action search SHALL comprehensively cover current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without live-source text.

#### Scenario: Searching one equipment group
- **WHEN** a user searches within Other Gear
- **THEN** matching Other Gear records SHALL be shown in their existing authored order
- **AND** Weapons and Armor & Shields SHALL NOT be introduced into that result set

#### Scenario: Searching spells across levels
- **WHEN** a user searches for text that matches spells at more than one level
- **THEN** every matching spell SHALL be discoverable through the same spell-search workflow
- **AND** each result SHALL identify itself as a Spell and display its cantrip or spell-level context plus prepared state when recorded

#### Scenario: Searching Runtime Actions
- **WHEN** a user searches Runtime Actions
- **THEN** every action whose current snapshot fields or source context (name, target, notes, timing, category, source label/category, source context) matches the query SHALL be returned
- **AND** the search SHALL NOT silently index newer live-source text that differs from the snapshot

#### Scenario: Search has no matches
- **WHEN** the active query matches no record in its collection scope
- **THEN** the sheet SHALL present a no-match state, a zero-result count, and an evident way to clear or revise the query

#### Scenario: Search changes the visible subset
- **WHEN** a query filters a target collection
- **THEN** matching records SHALL retain their relative authored order
- **AND** filtering SHALL NOT mutate canonical character data or imply a new saved ordering

### Requirement: Phone-sized collection cards preserve at-a-glance priority

On a phone-sized sheet, each target equipment/spell collection card SHALL show at most the first five authored records as compact previews. Runtime Actions and Supporting Collections on a phone-sized sheet SHALL show at most the first ten authored records as compact previews. The complete collection SHALL remain accessible. Each preview SHALL present its primary name and, when useful authored detail exists, a single-line `Name: detail` summary whose detail is visually secondary and italicized without removing the complete text from assistive technology.

#### Scenario: Phone collection has few enough records
- **WHEN** a phone-sized collection contains fewer records than its compact preview limit (5 for equipment/spells, 10 for actions/supporting)
- **THEN** every record SHALL appear in authored order within the compact card without a remaining-item announcement

#### Scenario: Phone collection exceeds its preview limit
- **WHEN** a phone-sized collection contains more records than its compact preview limit
- **THEN** only its limited first authored records SHALL appear in the compact preview
- **AND** the complete collection SHALL remain reachable through an explicitly named action that includes the exact total item count

#### Scenario: Preview detail exceeds the card width
- **WHEN** a compact preview summary is wider than its available row
- **THEN** the visible summary SHALL truncate on one line with an ellipsis rather than expanding or overflowing the card
- **AND** assistive technology SHALL retain access to the complete record label and detail

### Requirement: Focused and bounded collection browsing has one scroll owner

Dense collections SHALL avoid unbounded sheet growth by using bounded browsing or focused presentation on larger screens and a full-height focused presentation on phone-sized screens. For Runtime Actions and Supporting collections with 11+ items on a larger screen, the presentation SHALL keep collection identity, result count, and search available while the collection content scrolls through one explicit scroll owner, and SHALL provide Close navigation only when the selected presentation is focused/modal.

#### Scenario: Browsing a dense collection on a larger screen
- **WHEN** a collection exceeds 10 items on a larger screen
- **THEN** the collection SHALL provide bounded scrolling or a focused view without making any record unreachable
- **AND** its search control SHALL remain usable for the complete collection scope
- **AND** the presentation SHALL prevent accidental wheel capture (nested scrolling) by providing one obvious scroll owner

#### Scenario: Opening a dense collection on a phone
- **WHEN** a user opens an affected dense collection from its phone preview
- **THEN** a full-height focused presentation SHALL expose the complete collection with persistent collection identity, result count, search, and close navigation
- **AND** background sheet content SHALL NOT become a competing scroll owner while that presentation is modal
- **AND** lightweight visual overflow cues SHALL distinguish its scrollable content region from its persistent navigation

#### Scenario: Returning from a focused row or card task
- **WHEN** a user closes or completes a row edit, annotation task, or card-level Edit/Notes task opened from a focused collection
- **THEN** the collection's active query and focused browsing context SHALL remain available
- **AND** keyboard focus SHALL return to the invoking action or an equivalent stable destination when that action remains visible
