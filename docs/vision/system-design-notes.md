# System Design Notes

This file preserves earlier broad design notes and cross-system observations. It is a long-term planning document, not the active MVP backlog.

## Candidate Long-Term Systems

- D&D 5e 2014
- D&D 5e 2024
- Level Up: Advanced 5e
- Shadowdark
- Cairn v1
- Cairn v2
- other future candidates such as ATLA, Numenera, Daggerheart, Dragonbane

## Cross-System Observations

### Shared Needs

- record character identity, names, and treasure or currency
- store gear and inventory
- represent stats and combat state
- allow player-authored notes and annotations

### Inventory And Gear

- each system has different treasure names and categories
- some systems divide items by kind, such as weapon, armor, and misc
- some systems divide items by equip slot or body location
- each system records different item properties such as weight, value, and notes

### Stats And Rolls

- all investigated systems so far have HP, STR, and DEX or close equivalents
- some systems prefer roll-under or low-target representations instead of raw modifiers
- some systems use skills and proficiencies heavily, while others barely use them

### Player Notes And Annotations

- all systems benefit from flexible user-authored notes
- some systems need notes in generic freeform sections
- some systems benefit from notes attached directly to specific fields or containers

## Earlier Design Conclusions

- build shared data points without forcing all systems into identical shapes
- expect system-specific regrouping and annotations even when the raw fields overlap
- prefer simple, flexible field entry first and add guided UX later
- preserve room for player-authored annotation everywhere it materially helps
