# Keep D&D sheet coverage authored and deliberately bounded

- **Status:** Approved
- **Author:** Project owner with Codex
- **Date / Last reviewed:** 2026-10-26
- **Latest refinement:** BL-070 owner-approved 2014 coverage parity and edition-specific limitations. The filename is retained for existing links.

## Context and drivers

Comparison with both pages of the [official 2024 sheet](https://media.dndbeyond.com/compendium-images/phb/downloads/DnD_2024_Character-Sheet.pdf) distinguishes explicit data/UI support from information that can only be recorded in prose. The application prioritizes runtime ergonomics, sparse characters and manual authorship, not paper-layout parity or a rules engine. This comparison does not authorize redistribution of the publisher's template.

## Options and decision

Full structured parity would improve retrieval but expand schema and UI before evidence warrants it. Unqualified claims of complete coverage would hide meaningful differences. Retain bounded coverage, explicitly record accepted alternatives, and revisit them when actual use demonstrates a need.

| Official-sheet area                                              | Current application coverage / accepted disposition                                                                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity, origin, class/subclass and levels                      | Authored fields/records; no XP field. XP was an omission, now accepted until XP-based play or a level-up workflow creates a concrete need.                      |
| Abilities, saves, skills and proficiency                         | Authored values and proficiency levels; no automatic bonus calculation.                                                                                         |
| Health, defenses, initiative, speed, inspiration and death saves | Dedicated fields. Shield use can be recorded through equipped inventory; no separate shield indicator.                                                          |
| Hit Dice                                                         | **One schema string and one UI field**, not separate resource counts. This remains a known limitation, not an intentional claim of structured resource support. |
| Features, feats, traits, languages and training                  | Records/text; armor training does not need one boolean per printed checkbox.                                                                                    |
| Weapons and damaging cantrips                                    | Inventory/action names and descriptions; attack/DC, damage and type remain authored prose.                                                                      |
| Casting and slots                                                | Casting ability, save DC, attack bonus, and per-level used/max slots. No separate casting-modifier summary; ability modifiers remain available in abilities.    |
| Individual spells                                                | Name, level, preparation and description; timing, range, concentration, ritual and material details remain prose.                                               |
| Equipment, currency and attunement                               | Equipment and coins are structured. Attunement may use annotations; no dedicated field until evidence shows this is insufficient.                               |
| Appearance, personality and backstory                            | Authored text and notes.                                                                                                                                        |

The owner accepts these deviations except that structured Hit Dice tracking merits separate refinement. Do not broaden BL-070 into structured spell/attack metadata or a character builder based solely on paper-sheet parity. Attunement annotations are a stopgap, not automatic enforcement of an attunement limit.

## Consequences and follow-ups

### 2014 coverage refinement — 2026-10-26

The owner requested the same coverage scrutiny against all three pages of the [official 2014 sheet](https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf), accepted the bounded review recommendations, and expressed satisfaction with the sheets overall. The table above remains specifically about **2024**; it must not imply identical storage or rules semantics across editions.

- 2014 exposes its previously modeled save/skill bonuses, skill Expertise, Passive Perception, Player Name and subclass through existing independent Detail editing. Bonuses stay manually authored; flags do not recalculate them. The compact P/E summary reuses shared status presentation while 2014 retains independent proficiency/expertise leaf editing and preserves their original note paths.
- Inspiration is an optional 2014 boolean, labeled Inspiration rather than Heroic Inspiration. Viewing an unrecorded state does not persist a default or apply rules effects.
- **2014 Hit Dice already has separate total/remaining strings and corresponding controls.** It does not have structured numeric denomination pools. Preserve this existing representation; the one-string limitation and initial pool follow-up above refer to 2024.
- Ability scores/modifiers, HP, defenses, movement, death saves, languages/tools, features/traits, inventory/currency, spellcasting statistics, spell preparation/levels/slots and roleplay retain their established homes.
- XP, dedicated armor/weapon proficiency fields, portrait/symbol assets, separate appearance metrics and a visible spellcasting-class selector remain outside this bounded pass. Attack damage/type/bonus and attunement can use authored descriptions/notes. These are documented coverage limits, not claims of structured equivalence to every paper field.

The trade-off is explicit: improve high-frequency runtime access without imposing full paper-layout parity or a universal 5e rules model. Existing class/source ownership, required 2014 levels, notes and canonical fixture values remain intact. Both editions' remaining coverage triggers live in the backlog.

Manual text stays flexible but cannot provide field-specific filtering, resource controls or validation. Keep disclosures accurate; a hardened schema is not a claim of full official-sheet field parity.

The [backlog](../backlog.md#ideation-sandbox-raw--rough-ideas) owns the Hit Dice refinement and evidence triggers for XP/attunement. For Hit Dice, evaluate optional denomination/max/spent pools for multiclass characters with one compact summary. Preserve existing authored notation and notes deliberately; do not guess structured counts from arbitrary strings. No Hit Dice schema change is implemented by this ADR.
