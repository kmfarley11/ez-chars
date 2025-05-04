# docs

Documentation for maintenance or hosting. Wip...

General / initial intent is to save excalidraw design files here

# Design

## system comparison & design insights

**all systems have need to...**

_record names & coinage_

- each system has different treasure nomenclature and kinds

_store gear / inventory_

- some prescribe gear into categories
  - by kind: weapon vs. armor vs. misc
  - by equip methodologies: body vs. head vs. hands
- each has different ways of recording properties like weight, value, notes

_represent stats_

- all have hp, STR, & DEX so far
- some represent a Roll (low) DC (cairn) vs. raw modifiers (5e, SD)
- some represent skills & proficiencies, some do not

_allow for player annotations / notes_

- some have generic spots for players to jot notes vs. in certain sections of the sheet

### insight outcomes

- **Start with a simpler system such as Shadowdark** to find room to streamline more complicated systems later
- **Build out common data points without bias where possible**, but anticipate re-groupings & annotations based on system
  - i.e. gear, coinage, name, stats are generic. But are typed and grouped differently based on system
- **Build out as simple and flexible as possible**, but anticipate better UX guidance in the future based on system
  - i.e. stick to flat text fields to start and expect business logic, tool tips, etc. to provide system-based guidance
- **Build out concept of player-based annotation as simply and robustly as possible**
  - i.e. simple & custom "Notes" section added to each container to provide custom tooltips etc.
  - maybe a questionmark button with an editable textarea on every container?
