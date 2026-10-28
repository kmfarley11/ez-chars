## ADDED Requirements

### Requirement: The 2024 sheet supports bounded system-native authorship

The 2024 sheet SHALL let users record identity/origin, optional class and subclass information, runtime state and defenses, abilities and proficiencies, actions, features/feats and mastery information, equipment/currency, optional spellcasting, and freeform notes. It SHALL support manual authorship without enforcing a complete build, automatically selecting rules options, or requiring legality validation.

#### Scenario: Maintaining a representative player character

- **WHEN** a user records a character's species/background, class/subclass, abilities/proficiencies, HP/defenses, a feature or feat, weapon mastery information, an action, equipment, and a note
- **THEN** each supplied fact has a readable, editable home and survives reload and supported backup/restore
- **AND** no character-creation wizard or rules-option catalog is required

#### Scenario: Maintaining a spellcaster

- **WHEN** the user adds spellcasting information
- **THEN** casting statistics, authored spells with level and preparation state, and used/maximum slot values are editable and preserved
- **AND** the app does not infer a legal spell selection or slot progression from class choices

### Requirement: Sparse characters can grow without changing formats

The 2024 sheet SHALL remain useful when only a name, a few runtime values, one action, and a note are supplied. Unknown optional information SHALL remain absent rather than appearing as fabricated gameplay values. Adding further information SHALL enrich the same character without a simple-to-full conversion or a new identity.

#### Scenario: Using a sparse ally

- **WHEN** a character contains a name, current/maximum HP, AC, one action, and one note, but no species, class, ability scores, inventory, or spells
- **THEN** its recorded runtime information is reachable and editable without completing the absent sections
- **AND** absent facts are not displayed as authored zero values or default ability scores

#### Scenario: Growing the same record

- **WHEN** the user later adds a class, equipment, and spellcasting to a sparse character
- **THEN** its document identity, existing values, notes, and collection identities remain intact
- **AND** the newly supplied information becomes accessible through the same sheet

### Requirement: Edition vocabulary preserves familiar meaning

The 2024 sheet SHALL use recognizable terminology from its adopted rules, while existing 2014 presentation SHALL retain its accepted terminology and meaning. Equivalent interactions SHALL behave consistently across the two sheets. Label similarity SHALL NOT silently equate different rules concepts, and authored names or notes SHALL NOT be rewritten into an application-invented vocabulary.

#### Scenario: Reviewing origin and capabilities

- **WHEN** a user reads 2024 origin and capability information
- **THEN** species, background, feats, training, and Heroic Inspiration are identifiable using edition-appropriate labels
- **AND** accessing equivalent editing/notes controls remains familiar from the 2014 sheet

#### Scenario: Switching between editions

- **WHEN** the user switches between 2014 and 2024 characters
- **THEN** the edition is clear without requiring a new interaction grammar or displaying misleading universal rules claims

### Requirement: Runtime editing and detail preserve the established interaction language

The 2024 sheet SHALL use the established edit-first, read-first Detail, and collection interaction tiers where applicable. Focused edits and notes SHALL save independently after validating the candidate character, protect active drafts, preserve unrelated information, and provide rejection feedback without losing editable work. Calculated context SHALL remain distinguishable from authored values. Quick freeform note entry SHALL be reachable within two deliberate control activations from the open sheet.

#### Scenario: Changing runtime HP

- **WHEN** the user changes current HP through its runtime control
- **THEN** the value can be saved or cancelled without entering an unrelated bulk editor
- **AND** surrounding runtime information retains the stable compact presentation

#### Scenario: Targeting one read-first field

- **WHEN** the user selects a read-first field label
- **THEN** Detail identifies the selected field and supports a focused independent edit
- **AND** save rejection retains the draft with feedback, while successful save changes only the intended authored information

#### Scenario: Leaving a dirty note

- **WHEN** the user attempts to leave a focused note with unsaved changes
- **THEN** the established dirty-work protection prevents silent loss and permits returning to the draft

### Requirement: Proficiency levels are explicit without relying on hover

The 2024 sheet SHALL present one compact proficiency status per skill or saving throw, with a visible key for proficiency and expertise. Focused Detail SHALL offer one proficiency-level selection: unrecorded, none, proficient, and skill expertise where applicable. The selection SHALL preserve unrelated notes and authored bonuses; the sheet SHALL NOT imply that it automatically calculates those bonuses.

#### Scenario: Choosing skill expertise

- **WHEN** the user selects Expertise for a skill and saves
- **THEN** the skill is recorded as proficient with expertise in one validated update
- **AND** its status is distinguishable from ordinary proficiency without needing a tooltip
- **AND** cancelling or rejecting the save leaves the recorded values unchanged

#### Scenario: Retaining unusual or unknown data

- **WHEN** existing information is unrecorded, partially supplied or an unusual proficiency combination
- **THEN** inspecting it SHALL NOT silently normalize it
- **AND** unusual combinations SHALL be identified for review with their original values and notes still accessible
- **AND** an explicit unrecorded choice SHALL remain distinct from a recorded absence of proficiency

#### Scenario: Editing a saving throw

- **WHEN** the user edits saving-throw proficiency
- **THEN** standard skill Expertise SHALL NOT be offered as a saving-throw level
- **AND** existing custom information SHALL remain recoverable until explicitly replaced

### Requirement: Collections remain usable at sparse and saturated sizes

The 2024 sheet SHALL provide direct creation, focused detail/notes, and eligible confirmed removal for its authored actions, inventory, spells, and supporting record collections. These collections SHALL offer identity-owned Pin/Unpin except for compact class summaries, which SHALL omit pin controls and preserve authored class order. Large collections SHALL retain bounded responsive browsing and text search. Action timing and spell-level/Prepared filters SHALL compose with search using system-owned semantics. Pins SHALL remain global within their collection and only matching pinned records SHALL lead filtered results.

#### Scenario: Reading compact classes

- **WHEN** the user reads the class summary
- **THEN** class names, level/subclass metadata and existing note counts remain discoverable without pin controls
- **AND** class creation, focused editing and notes remain available

#### Scenario: Locating a reaction

- **WHEN** the user selects a timing filter and enters a text query
- **THEN** only matching actions are shown, with matching pinned actions first
- **AND** clearing either restriction leaves the other restriction intact

#### Scenario: Locating a prepared spell

- **WHEN** the user combines selected spell levels, Prepared-only, and text
- **THEN** all active restrictions are respected and an empty result offers a clear recovery path

#### Scenario: Maintaining a collection record

- **WHEN** a user renames, pins, edits notes on, or removes an eligible record
- **THEN** identity is preserved across non-destructive edits and removed references/priority membership are reconciled through validation
- **AND** unrelated records are not changed

### Requirement: System landmarks preserve mobile and keyboard usability

The 2024 sheet SHALL provide meaningful system-owned landmarks through the established outline/jump interaction, including expansion of collapsed target ancestors and predictable browser navigation. Reading, editing, notes, and collection use SHALL remain accessible on phone and desktop without document-level horizontal overflow or controls obscuring required content.

#### Scenario: Navigating a saturated sheet

- **WHEN** a user jumps between 2024 runtime, equipment, and spellcasting regions using keyboard or touch
- **THEN** the target heading is reachable and visible, collapsed ancestors open as needed, and normal sheet work remains usable
- **AND** the corresponding controls retain the established accessible names, focus behavior, and coarse-pointer targets

### Requirement: Source-assisted actions remain editable snapshots

The 2024 sheet SHALL offer custom action creation and explicit source selection from the character's inventory, authored spells and features/feats. Source-assisted creation SHALL seed an editable name and description without inferring timing or rules effects. Multiple actions MAY use the same source. Source identity SHALL survive renaming and reclassification; names SHALL NOT identify source records. Saving SHALL validate that the selected source still exists on that character.

#### Scenario: Reviewing a source-assisted draft

- **WHEN** the user chooses a source
- **THEN** its name and available description SHALL seed a reviewable action draft
- **AND** the user SHALL be able to edit that text and select timing before saving, or cancel without creating an action
- **AND** a rejected save SHALL retain the draft with actionable feedback

#### Scenario: Editing a source after action creation

- **WHEN** the user edits the source or the copied action text
- **THEN** the other record SHALL remain unchanged until an explicit action refresh

#### Scenario: Discovering source controls

- **WHEN** the user opens a linked action's detail
- **THEN** its source name, View source and Refresh from source SHALL be grouped near the top

#### Scenario: Inspecting the linked source

- **WHEN** the user chooses View source
- **THEN** the source's editable detail SHALL replace the action detail within the same dialog, without jumping the sheet or stacking dialogs
- **AND** Back SHALL return to the action's reading position and source control, while Close SHALL dismiss the dialog
- **AND** leaving either record with unsaved work SHALL require an explicit save, discard or keep-editing choice; failed saves SHALL retain the draft
- **AND** editing the source SHALL NOT refresh the action automatically

#### Scenario: Confirming copied text refresh

- **WHEN** the user requests refresh from an action's source
- **THEN** confirmation SHALL explain that the current source name and description replace those action fields, including direct player edits and clearing text when the source description is empty
- **AND** cancellation SHALL change nothing
- **AND** confirmation SHALL preserve action identity, timing, independent notes and pins while validating the current source at commit time

#### Scenario: Deleting a source

- **WHEN** a source is removed
- **THEN** every linked action SHALL become unlinked in the same validated update while preserving its snapshot, identity, timing, independent notes and pins
- **AND** other actions SHALL remain unchanged

#### Scenario: Persisting source relationships

- **WHEN** source-linked actions are saved, reloaded or backed up and restored
- **THEN** their valid character-local source identities and authored content SHALL survive
- **AND** unsupported or dangling source references SHALL be rejected rather than silently repaired or resolved against another character
