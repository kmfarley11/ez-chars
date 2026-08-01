# Fillable Character-Sheet PDF Interoperability Audit

- **Status:** Pre-schema-freeze evidence; no runtime support is implied
- **Date:** 2026-07-31

## Outcome

Fillable character-sheet PDFs are worth an early, export-first proof, but they are not a safe canonical persistence boundary and are not a prerequisite for the first external playtest.

The inspected forms are externally versioned, fixed-capacity, and unable to represent stable record identities, annotations, source links, arbitrary collections, or all system-native application data. The 2024 form is fillable but uses mostly opaque field IDs, while the visually richer 2024 download inspected alongside it has no form fields. None of the character-sheet templates has a verified redistribution license merely because it is free to download or because a separate SRD is CC BY.

Validated system documents remain the full-fidelity source of truth. JSON remains the lossless backup/restore contract. PDF adapters must declare their losses and target an exact publisher artifact.

## Inspection Method and Limits

On 2026-07-31, the official URLs below were downloaded to a temporary local directory and inspected with `pdf-lib` 1.17.1. The files were not added to the repository. Field counts, names, types, page counts, and SHA-256 hashes below describe those exact bytes and are useful drift detectors, not publisher-supplied version guarantees.

The audit did not test every PDF viewer, appearance-stream behavior, printing path, field maximum length, JavaScript calculation, or round-trip encoding. Rights conclusions are conservative product policy, not legal advice.

## Form Inventory

### D&D 5e 2014 official fillable sheet

- **Source:** [official 2016 fillable character sheet](https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf)
- **Artifact observed:** 3 pages; SHA-256 `8e7b282db42af119c46fef696b15e7430cb1e93bd09a478780623ca1a1908a48`
- **Form surface:** 334 fields: 210 text fields, 122 checkboxes, and 2 buttons
- **Representative stable identifiers:** `CharacterName`, `ClassLevel`, `Background`, `Race `, `STR`, `STRmod`, `AC`, `HPCurrent`, `HPMax`, `Wpn Name`, `Wpn1 AtkBonus`, `AttacksSpellcasting`, `Equipment`, `Features and Traits`, `Spellcasting Class 2`, and numbered spell/slot fields
- **Identifier cautions:** Some semantic names contain trailing spaces; many proficiency and spell checkboxes use generic numeric names; fixed weapon and spell rows encode page layout rather than record identity.
- **Rights/redistribution:** Official and freely downloadable, but no separate character-sheet redistribution license was verified. Keep the template link-only unless permission or terms are documented. The app already links rather than bundles it.

### D&D 5e 2024 Basic Rules fillable sheet

- **Source:** [official Basic Rules character-sheet download](https://media.dndbeyond.com/compendium-images/br/ph/character-sheet.pdf), linked from the official 2024 Basic Rules
- **Artifact observed:** 2 pages; SHA-256 `1d10652adb00415be9004bd6b170bafe82d84456a1f3edbbafcdae27ad5efd3e`
- **Form surface:** 411 fields: 260 text fields and 151 checkboxes
- **Representative stable identifiers:** `Text1`, `Text6`, `Text57`, `Text105.0` through `Text105.29`, `Text106.0` through `Text106.29`, and generic names such as `Check Box5`
- **Identifier cautions:** Most identifiers are opaque and cannot be mapped reliably from names alone. A supported adapter must bind an exact artifact hash to a reviewed field/geometry/label map and fail safely on an unknown revision.
- **Rights/redistribution:** Official and freely downloadable, but the sheet itself was not verified as part of the SRD's CC grant. Treat the template as link-only pending evidence.

### D&D 5e 2024 illustrated character-sheet download

- **Source:** [official 2024 character-sheet PDF](https://media.dndbeyond.com/compendium-images/phb/downloads/DnD_2024_Character-Sheet.pdf)
- **Artifact observed:** 2 pages; SHA-256 `f223ca7bf03bcb4062ed1487816c1c1fd8b8d51d49011bfd02d63cad75f54454`
- **Form surface:** No AcroForm fields were found.
- **Conclusion:** This is not a fillable import/export target for Horizon A. Supporting it would require generating an overlay or producing a derivative rather than filling stable publisher fields, which has different technical and rights implications.

### Shadowdark official form-fillable sheet

- **Source:** [official character-sheet download page](https://www.thearcanelibrary.com/blogs/shadowdark-blog/shadowdark-rpg-character-sheet), which links to the form through Dropbox
- **Artifact observed:** 1 page; SHA-256 `fb66668723422428d3ef81675e649434dddff8e11a4f390cd2ce22fa2f5986b9`
- **Form surface:** 50 text fields
- **Stable identifiers:** `Name`, `Race`, `Class`, `Level`, `Title`, `Alignment`, `Background`, `Deity`, six `* Total` and six `* Modifier` fields, `Armor Class`, `Hit Points`, `Attacks`, `Talents / Spells`, `XP Current`, `XP Target`, `Gold Pieces`, `Silver Pieces`, `Copper Pieces`, `Gear 1` through `Gear 20`, and `Free To Carry`
- **Identifier cautions:** Attacks and talents/spells are unstructured text areas; gear has exactly 20 named slots; totals and modifiers duplicate derived information; application-owned IDs and annotations are absent.
- **Rights/redistribution:** Free and official, but redistribution and application-processing permission remain unresolved. Treat the form as link-only and do not ship an adapter unless written permission or qualified review covers the exact import/export behavior; the conservative user-authored sheet/page-locator baseline does not extend to form processing.

## Concept Mapping and Fidelity

Legend: **direct** means a stable scalar or bounded slot can be mapped; **transform** means application data must be formatted, derived, or parsed; **lossy** means full application meaning cannot round-trip; **pending** means the target system schema or field map is not yet defined.

| Concept | 2014 fillable form | 2024 fillable form | Shadowdark fillable form | Canonical application direction |
| --- | --- | --- | --- | --- |
| Document/system identity and schema version | Unsupported | Unsupported | Unsupported | Retain only in validated character/JSON; bind PDF adapter to an external artifact version separately |
| Character display identity | Direct for name/player/class/background/race/alignment, with form-specific labels | Pending semantic field map despite visible 2024 identity labels | Direct for Name/Race/Class/Level and other scalar labels | Store system-native identity; expose computed list summary |
| Ability values | Direct plus duplicated score/modifier fields; transformation must choose authority | Pending map; visible ability fields and many checkboxes | Direct totals/modifiers, with authority/derivation decision | Store the system's authoritative value(s); compute display derivatives where possible |
| HP, defenses, initiative, speed, and similar runtime state | Mostly direct scalar fields | Pending map; visually represented | Direct only for HP and Armor Class | System-native runtime data; PDFs cannot define a universal combat model |
| Actions and attacks | Three structured weapon rows plus a large text area; lossy for arbitrary action records | Fixed visual rows and opaque IDs; lossy | One `Attacks` text area; lossy | Keep stable action IDs, structured values, notes, and source ownership internally; export formatted snapshots only |
| Inventory/gear and currency | One equipment text area plus coin fields; lossy for structured items | Fixed rows/boxes; pending map and capacity | Twenty gear slots, free-to-carry, and three coins; direct only within capacity | Retain ordered, identified, system-native collections; define overflow behavior per adapter |
| Features, traits, talents, and spells | Feature text area plus fixed spell rows/checkboxes; lossy and capacity-bound | Fixed features/spell sections with opaque IDs; lossy | One combined `Talents / Spells` text area; lossy | Preserve separate system-native records and render a deliberate PDF summary |
| Freeform notes/roleplay | Several fixed text areas; transforms application categories | Fixed appearance/backstory/personality areas; pending map | No general notes field on the inspected form | Keep flexible authoring internally; export only explicitly mapped summaries |
| Annotations and source references | Unsupported | Unsupported | Unsupported | Never discard from canonical data; PDF export is a derived view |
| Stable collection IDs and provenance | Unsupported | Unsupported | Unsupported | JSON/system document only; PDF import cannot reconstruct them without deterministic new IDs and review |
| Sparse/unknown data | Blank fields work | Blank fields work | Blank fields work | Preserve meaningful absence; do not manufacture defaults solely to fill the form |

## Round-Trip Risks

- **Capacity:** Forms expose a fixed number of weapon, spell, gear, currency, and prose areas. Overflow cannot round-trip without continuation sheets or a declared omission/summary rule.
- **Identity:** Repeated rows do not carry application record IDs. Importing an edited export cannot reliably match renamed or reordered records without a separate manifest.
- **Structure collapse:** Actions, inventory, features, and notes commonly collapse into multiline text. Parsing that text back would be inference, not lossless import.
- **Derived-value conflicts:** Forms may store both an authoritative score and a derived modifier or total. Imports need an explicit authority rule and validation warning.
- **Opaque 2024 fields:** A publisher revision can preserve visible layout while changing generic field names. Hash-pinned field maps and non-destructive rejection are required.
- **Viewer behavior:** Appearance rendering, checkbox values, fonts, long-text clipping, and calculations vary by PDF viewer and must be tested independently.
- **Rights:** Reading a user-selected form, bundling a template, and distributing a filled derivative may have different permission bases. Each shipped adapter must cite its reviewed basis.

## Persistence Decision

Do not rebase character storage onto official PDF layouts. A printed-form UI contract cannot preserve the application's richer records, annotations, references, stable IDs, source relationships, variable collections, or future system-native fields.

Instead:

1. validate and persist an explicit system document;
2. use JSON as its lossless backup and restore representation;
3. treat PDF export as a version-pinned derived projection with a visible fidelity statement;
4. treat PDF import as a reviewed, non-destructive conversion that creates or previews system data rather than mutating valid records silently;
5. retain original user-selected bytes only if a later local-file design explicitly needs them and clears privacy and rights review.

## BL-066 Recommendation

Promote `BL-066` from P2 to an early P1 improvement, but do not make PDF import/export a first-playtest readiness gate. The current audit itself supplies the required pre-schema-freeze evidence.

Refine implementation into bounded slices:

1. **Template delivery and rights spike:** resolve whether the adapter may bundle, fetch, or require the user to select each exact template; register the artifact hash and attribution.
2. **Export-first proof:** after the relevant system schema is stable enough, fill one publisher form from a representative fixture, disclose omitted/flattened data, test common viewers, and preserve canonical JSON unchanged. The 2014 form is the simplest initial semantic field map; Shadowdark is technically smaller but its form-processing expansion gate is unresolved.
3. **Reviewed import proof:** import scalar fields from one exact template into a preview, allocate deterministic test IDs for records that lack them, and reject unknown forms without modifying local data.
4. **System expansion:** add 2024 only after its opaque field map is manually verified; add a Shadowdark form adapter only after the expansion gate covers that exact behavior.
5. **Overflow and round-trip design:** decide continuation sheets, clipping warnings, and export-manifest ideas from actual proof results rather than before them.

The first external playtest may proceed with validated JSON backup/restore and direct official-sheet links. `BL-066` can run after `BL-070` establishes the multi-system/schema boundary or in parallel once a target schema and template-delivery decision are stable. Image, scan, OCR, and inferred extraction remain later proposals with human review and non-destructive failure requirements.

If a fundamental schema reset becomes necessary after durable v1 promises begin, revisit `BL-066` immediately as one possible recovery/interchange bridge before asking users to cross the reset. That trigger does not make PDF canonical or guarantee a lossless round trip; JSON, explicit schema versions, migrations, and recovery remain authoritative.
