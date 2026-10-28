## MODIFIED Requirements

### Requirement: Representative sheet contexts expose focused rules references

Both supported D&D character sheets SHALL expose clearly named contextual References actions near representative character creation or class, equipment, and spell information, plus the 2024 action context without replacing the existing edit, annotation, or collection workflows.

#### Scenario: Contextual actions preserve sheet density

- **WHEN** a contextual References action appears for a collapsible sheet section
- **THEN** it SHALL share that section's heading row instead of consuming a separate content row
- **AND** its compact presentation SHALL retain a context-specific accessible name

#### Scenario: User requests a class-related reference

- **WHEN** a user activates References from the configured character creation or class context
- **THEN** the system SHALL resolve and present the registered SRD resource for the active character's edition and curated locator for that context

#### Scenario: User requests an equipment reference

- **WHEN** a user activates References from the configured equipment context
- **THEN** the system SHALL resolve and present the registered equipment locator for the active character's edition without changing the equipment record or collection state

#### Scenario: User requests a spell reference

- **WHEN** a user activates References from the configured spell context
- **THEN** the system SHALL resolve and present the registered spell locator for the active character's edition without changing spell, slot, preparation, annotation, or priority state

#### Scenario: User requests a 2024 action reference

- **WHEN** a user requests References from the 2024 action context
- **THEN** the system SHALL open its configured 2024 action topic without altering the authored action
- **AND** it SHALL NOT silently substitute a 2014 topic or page

### Requirement: The preferred system rules source remains available for general lookup

Both supported D&D character sheets SHALL expose one persistent, clearly named Rules action that opens the configured preferred rules source for general in-app lookup independently of contextual References actions.

#### Scenario: User needs to look up an unrelated rule

- **WHEN** a user activates Rules from anywhere in the active character sheet
- **THEN** the system SHALL open the preferred verified self-hosted source for the active edition (SRD 5.1 for 2014 or the adopted SRD 5.2.1 for 2024) in the in-app viewer at a safe general document context
- **AND** document Find and navigation SHALL be available without inventing a contextual exact-page locator

#### Scenario: User has scrolled away from the beginning of the sheet

- **WHEN** a user navigates through a long character sheet
- **THEN** the Rules action SHALL remain reachable without requiring a return to the beginning of the sheet
- **AND** it SHALL remain keyboard operable, visibly focused, and conforming to the coarse-pointer target policy
- **AND** its persistent presentation SHALL NOT introduce untenable scrolling lag or severe visible paint corruption in a supported browser

#### Scenario: Persistent rules access coexists with ordinary sheet use

- **WHEN** the persistent Rules action is available while a user reads, scrolls, edits, or operates another sheet control
- **THEN** ordinary sheet content and controls SHALL remain visible and operable without unexpected document-level overflow
- **AND** the Rules action SHALL NOT materially obstruct or displace the user's normal sheet workflow at supported desktop or phone sizes

#### Scenario: Pre-release browser-platform limitation remains unresolved

- **WHEN** owner review reproduces a severe presentation defect in one browser-platform combination but has not established its root cause or cross-platform scope
- **THEN** the pre-release experience SHALL identify the observed combination and offer a practical alternate-browser recommendation
- **AND** the notice SHALL NOT claim that the browser is unsupported or defective without the supported-platform evidence reserved for playtest hardening

#### Scenario: An automatic reference is missing or incompatible

- **WHEN** the active edition's requested preferred or contextual locator cannot be resolved
- **THEN** the system SHALL expose an honest unavailable or review-needed state without silently opening another edition's default
- **AND** character edits, draft state, and sheet location SHALL remain intact

#### Scenario: An authored reference intentionally targets another source

- **WHEN** a user opens an explicitly authored annotation reference to another edition or resource
- **THEN** the system SHALL honor that source through the existing rights-classified reference behavior
- **AND** it SHALL NOT rewrite the reference to the active sheet's preferred source
