# 2026-08-01 Pre-Playtest Survey Evidence

- **Status:** Directional vision evidence; not representative user research
- **Responses collected:** 2024-10-20 through 2025-03-08
- **Reviewed:** 2026-08-01 during `BL-067`
- **Privacy:** Usernames, email-equivalent fields, exact timestamps, and attributable quotations are excluded

## Purpose and Limits

The product owner supplied two small surveys originally conducted to understand players in the owner's tabletop circle. This synthesis records anonymous, high-level evidence that may inform ez-chars and its boundary with Dungeons and Dashboards.

The tooling survey has four responses; the broader play-preference survey has seven. These are convenience samples from prospective or current players, not statistically representative research. Counts are useful for identifying hypotheses and tensions, but they do not establish market demand or justify overriding direct playtest evidence.

Raw question PDFs and CSV exports remain owner-held local material. This document records only aggregate results and cross-response themes.

## Question Inventory

### TTRPG tooling and assets survey (`n=4`)

Questions covered:

- digital versus physical character sheets and dice;
- preference for digital maintenance, guided form filling, modifier calculation, and mobile support;
- comfort with physical character creation and maintenance;
- methods and frustrations when finding character options or rules;
- preferences for theater of the mind, digital combat, and physical or hybrid visual aids;
- the contribution of music, sound, voices, portraits, and scene imagery.

The 1–5 questions generally placed rejection or low importance at 1 and strong preference or necessity at 5.

### TTRPG play-preference survey (`n=7`)

Questions covered:

- interest in future games, campaign length, and trying unfamiliar systems;
- known or desired systems, genres, narrative motivations, and appetite for mechanical complexity;
- scheduling preferences;
- the contribution and possible drawbacks of exploration, roleplay, and combat.

## Anonymous Findings

### Character tooling

- All four respondents use a digital character sheet at least some of the time; three use digital sheets exclusively. General maintenance preference leaned digital but was not absolute (all responses were 3 or 4 on the 1–5 physical-to-digital scale).
- Mobile support was the strongest consistent tooling signal: all four rated it 4 or 5, and two selected the “necessary” endpoint.
- All four rated guided character management and form filling 4 of 5. Three of four rated their comfort with physical character creation and maintenance 2 of 5, suggesting that assistance and trustworthy pointers matter even when a complete builder is absent.
- Modifier abstraction was mixed: responses ranged from 2 to 4. The free-text themes likewise included both a desire for automatic math and a desire to understand or retain control over the numbers.
- Physical dice remained strongly preferred by three of four respondents, and three rated digital dice at the lowest importance. A dice engine is not supported as an ez-chars priority by this sample.

### Finding rules and character information

- Lookup behavior was fragmented across physical books, web search, GM assistance, and mixed methods; no one method dominated the four responses.
- Physical books were associated with availability and trust. General web search and existing digital platforms raised uncertainty about source reliability, discoverability, access, and content locked behind an additional marketplace purchase.
- Digital filtering was seen as particularly useful when choosing among large option sets such as spells or items, while books remained useful for browsing and understanding rules in context.
- This supports authoritative source identity, page/section navigation, contextual references, and future bounded filtering. It does not by itself support copying source content into a compendium.

### Learning systems and duration of use

- Six of seven respondents were interested in another game with the owner; one preferred to be asked later.
- Interest in unfamiliar systems was conditional rather than absent: four needed more information, two were interested if character creation and gameplay were straightforward or clearly explained, and one was unconditionally interested.
- Desired game length was broad: one-shots, mini-adventures, short campaigns, long campaigns, and less-bounded play all received multiple selections. The product should support both low-commitment experiments and characters that accumulate substantial campaign history.
- Mechanical-complexity preference clustered near neutral: six selected 3 of 5 and one selected 4. A single automation or “crunch” preference should not be treated as universal.
- The survey did not produce a reliable demand signal for the specific PRD v1 system set. Shadowdark and Cairn received no selections in this small sample, while interest was dispersed across 5e and several unrelated systems. The three-system target remains an owner-directed product and architecture test, not a survey-validated popularity claim.

### Play pillars and broader tooling boundary

- Exploration contributed to enjoyment for all seven respondents, combat for six, and roleplay for five. Narrative, meaningful choices, tactical play, intrigue, and social connection all appeared as motivations.
- Roleplay preferences varied, including comfort with descriptive intent without first-person performance. Character tools should preserve flexible authorship rather than assume one performative style.
- Digital combat and scene-setting media received meaningful interest in the tooling survey, but comments also emphasized convenience and GM preparation burden. This reinforces the current product boundary: character-owned runtime information belongs in ez-chars, while maps, atmosphere, session assets, and broader GM presentation remain Dungeons and Dashboards concerns.

## Reconciliation with Product Direction

| Evidence | Product implication | Reconciliation |
| --- | --- | --- |
| Strong mobile ratings and existing digital-sheet use | Phone usability is central rather than supplementary | Confirms the mobile-first P0 gate and phone-sized scenario matrix |
| Strong guided-management interest plus low physical-sheet confidence | Users need help knowing what to enter and where to verify it | Keep contextual references, informative empty states, and focused maintenance guidance in Horizon A; test whether they are sufficient before promoting a full builder |
| Mixed modifier-abstraction preferences | Automation should not conceal or replace user understanding | Refine progressive assistance toward optional, transparent computations while preserving editable source values and manual text |
| Fragmented lookup and weak trust/discoverability | Source provenance and navigation are part of character ownership | Confirms `BL-069`, visible source/version identity, multi-source locators, and contextual editor links |
| Physical dice preference and low digital-dice importance | Dice rolling is not required to make the character tool useful | Retain dice engines as an explicit non-goal |
| Conditional openness to unfamiliar systems | System support needs lightweight orientation without mandatory onboarding | Keep explicit system identity and system-native sheets; measure whether references and sparse editing make unfamiliar systems approachable |
| Broad campaign-length preferences | Both sparse starts and accumulated records matter | Confirms sparse and saturated fixtures before external handoff |
| Exploration, roleplay, and combat all matter | Runtime utility cannot mean combat data alone | Ensure system sheets and quick notes support scene-relevant information across all three pillars |
| Interest in VTT/atmosphere features | Adjacent session tooling has value but a different owner | Preserve the ez-chars / Dungeons and Dashboards boundary |

## Resulting Decisions

The surveys confirm more of PRD v1 than they overturn. They do not justify adding a full character builder, dice engine, VTT, compendium, or fourth playtest system to Horizon A.

They do justify four explicit refinements:

1. define runtime-first as scene-relevant rather than combat-only;
2. make progressive assistance optional and explainable where calculations are introduced;
3. treat contextual guidance and authoritative source navigation as a testable response to onboarding friction, not merely a convenience;
4. ask external playtesters whether those lighter aids are sufficient before prioritizing a complete creation workflow.

No personally identifying survey data is required for these conclusions.
