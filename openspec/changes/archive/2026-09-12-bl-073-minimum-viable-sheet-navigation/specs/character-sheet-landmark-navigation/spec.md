## ADDED Requirements

### Requirement: A sheet exposes a system-owned landmark hierarchy

The character sheet SHALL expose one ordered navigation hierarchy whose labels and grouping reflect that system's visible sheet organization rather than a universal RPG taxonomy. The 2014 hierarchy SHALL include selectable Overview, Runtime, and Organizational parent landmarks and the child landmarks Meta / Top-level Info, Quick Reference, Actions / Runtime Summary, Abilities & Proficiencies, Features & Traits, Spells, Inventory / Equipment, and Background, Roleplay, & Notes.

#### Scenario: User opens the complete 2014 outline

- **WHEN** a user reveals the complete labeled sheet outline
- **THEN** the three parent landmarks and eight child landmarks SHALL appear in their visible sheet order and parent relationships
- **AND** individual fields, cards, inventory groups, and spell levels SHALL NOT appear as first-level navigation destinations

#### Scenario: A later system adopts sheet navigation

- **WHEN** another supported system exposes the landmark-navigation capability
- **THEN** that system SHALL provide labels, hierarchy, icons where used, and ordering that match its own visible sheet organization
- **AND** it SHALL NOT be required to adopt the 2014 landmark vocabulary

### Requirement: Navigation labels and destinations remain synchronized

Every landmark action SHALL resolve to one corresponding visible destination with the same user-facing identity, and a destination SHALL remain discoverable from the navigation model while its collapsed ancestors have removed its rendered content from the document.

#### Scenario: An outer region is collapsed

- **WHEN** a collapsed parent region removes a child destination from the rendered sheet
- **THEN** the child SHALL remain available in the sheet-navigation surface
- **AND** activating it SHALL resolve the current destination without relying on a stale or independently maintained label, order, or selector

#### Scenario: A destination exposes an icon

- **WHEN** a landmark icon appears in a slim rail or complete outline
- **THEN** it SHALL represent the same destination as the corresponding visible heading
- **AND** the action SHALL retain a complete accessible name without requiring the icon or a hover tooltip to communicate its purpose

### Requirement: Responsive sheet navigation remains compact and recoverable

The sheet SHALL provide a left-side expanded outline and minified destination rail on larger presentations and SHALL preserve the destination rail as the preferred phone baseline. The rail SHALL provide fixed-size landmark actions plus an obvious action that reveals the complete labeled outline. The initial 2014 implementation SHALL use a viewport-relative `1280px` transition, with an approximately `16rem` complete outline at and above that threshold and an approximately `3rem` rail below it. Complete labels SHALL remain recoverable without requiring continuous resizing.

#### Scenario: Wide sheet opens at the initial responsive baseline

- **WHEN** the sheet opens with enough usable workspace for the complete outline and representative sheet content
- **THEN** the complete outline SHALL initially reserve bounded space beside the sheet instead of covering its working content
- **AND** the user SHALL be able to minify it to the destination rail and reveal the complete labels again

#### Scenario: Tighter desktop presentation uses the rail

- **WHEN** the sheet opens without enough usable workspace to reserve the complete outline width
- **THEN** the destination rail SHALL remain available without permanently reserving the complete outline width
- **AND** revealing complete labels SHALL remain one evident action away

#### Scenario: Phone user navigates from the icon rail

- **WHEN** the sheet is presented at a phone-sized width
- **THEN** the preferred baseline SHALL expose a bounded destination-icon rail whose actions do not shrink or enlarge unpredictably to fit
- **AND** the complete labeled outline SHALL remain available without depending on hover tooltips or gesture-only discovery
- **AND** the complete labels SHALL be available through a bounded disclosure that preserves an evident return path and usable focus behavior

### Requirement: Explicit navigation reveals and focuses its destination

Activating a sheet landmark SHALL expand every collapsed ancestor required to render the destination, place that destination in view below persistent controls, and move keyboard focus to its heading. The action SHALL NOT mutate character data, persist navigation state, or collapse a destination that is already visible.

#### Scenario: User chooses a hidden child destination

- **WHEN** a user activates a child landmark whose parent region or panel is collapsed
- **THEN** every required ancestor SHALL expand without a confirmation prompt
- **AND** the child heading SHALL be rendered, placed in view, and visibly focused

#### Scenario: User chooses an already visible destination

- **WHEN** a user activates a landmark whose destination is already expanded and visible
- **THEN** the sheet SHALL reposition and focus that heading
- **AND** it SHALL NOT collapse the destination or change character data

### Requirement: Explicit landmark jumps participate in browser history

Selecting a landmark different from the current landmark SHALL create one stable same-sheet history destination. Selecting the current landmark SHALL reposition and refocus it without creating a duplicate history entry. Browser Back and Forward SHALL revisit different explicit landmark destinations and SHALL reopen collapsed ancestors needed to reveal the historical target; ordinary document scrolling SHALL NOT add, replace, or synchronize landmark history.

#### Scenario: User returns to a destination with Back

- **WHEN** a user selects one landmark, later selects another, and invokes browser Back
- **THEN** the prior landmark SHALL return to view
- **AND** any collapsed ancestor SHALL reopen so the historical destination is visible and focused rather than hidden

#### Scenario: User scrolls without selecting a landmark

- **WHEN** a user scrolls through one or more sheet regions without activating the landmark navigation
- **THEN** the sheet SHALL NOT create or rewrite history entries for the sections that cross the viewport
- **AND** the playtest baseline SHALL NOT require a persistent scroll-synchronized current-section marker

#### Scenario: User selects the current landmark again

- **WHEN** a user activates the landmark already represented by the current fragment
- **THEN** the sheet SHALL reposition and focus that destination without creating another history entry

#### Scenario: Rules history is interleaved with landmark history

- **WHEN** a user opens Rules from a sheet landmark and invokes Back
- **THEN** the Rules reference SHALL close through its established history step and restore focus to its invoking control
- **AND** the unchanged landmark SHALL NOT compete for focus or create another history entry
- **AND** a later Back or Forward that changes the landmark destination SHALL reopen, reveal, and focus that historical landmark

### Requirement: Approved 2014 landmarks have independent collapse boundaries

Abilities & Proficiencies and Features & Traits SHALL be separate 2014 landmark destinations and collapse units while the remaining accepted sheet organization stays unchanged.

#### Scenario: User collapses one formerly combined destination

- **WHEN** a user collapses Abilities & Proficiencies or Features & Traits
- **THEN** the other destination SHALL retain its existing expanded or collapsed state
- **AND** both destinations SHALL remain independently available through sheet navigation

### Requirement: Navigation remains accessible and non-obstructive

Sheet-navigation actions SHALL preserve logical keyboard order, visible focus, complete accessible names, conforming coarse-pointer targets, and bounded responsive geometry. The navigation presentation SHALL NOT create document-level horizontal overflow, cover required sheet actions at its accepted baseline, conflict with the Rules control, add scroll-synchronized state work to the playtest baseline, or introduce a reproducible saturated-sheet responsiveness regression.

#### Scenario: Keyboard user traverses and activates navigation

- **WHEN** a keyboard user enters the rail or complete outline and activates a destination
- **THEN** the visible actions SHALL occur in logical sheet order with visible focus
- **AND** focus SHALL move to the revealed destination heading without leaving hidden duplicate controls in the keyboard sequence

#### Scenario: Touch user operates the phone rail

- **WHEN** a coarse-pointer user activates a phone landmark or labeled-outline action
- **THEN** each direct-touch control SHALL meet the repository touch-target policy without overlapping another action
- **AND** the sheet SHALL remain free of document-level horizontal overflow

#### Scenario: Navigation and Rules are both available

- **WHEN** the sheet-navigation surface and persistent Rules action or open Rules reference coexist
- **THEN** each SHALL retain its accessible name and operable action
- **AND** neither SHALL obscure or disable the other's required control path

#### Scenario: User rapidly scrolls a saturated sheet

- **WHEN** a user rapidly scrolls the saturated 2014 sheet with the navigation surface present
- **THEN** the navigation SHALL remain operable without document-level layout instability or continuous scroll-driven navigation-state updates
- **AND** representative scroll responsiveness SHALL remain within the product's accepted performance baseline
