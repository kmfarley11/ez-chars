# BL-070 — archived verification

**Integrated sheets approved on 2026-10-26; archived on 2026-10-28.** The owner also authorized dependency maintenance and the assessed major toolchain upgrade. No repeat UI approval is requested. Non-audit verification is complete with documented reruns. On October 28 the owner explicitly approved the bounded deepmerge exception and closure; full audit still fails with six low affected-package findings from one advisory. See the [current evidence](verification-record.md#continued-verification--2026-10-28) and [approved bounded exception](../../../../docs/decisions/2026-10-10-bound-development-security-overrides.md#2026-10-28--deepmerge-assessment-and-proposed-exception).

## Optional regression spot-check

Use Node >=22.17, restart old servers, then `npm run dev`. Open maintained examples from the home list. Existing saved characters are not reseeded; do not reset valuable data for new examples.

- **Bryltin/Zindra and Mira:** edit HP, a class/subclass and a field note; close and reload. Values/notes persist on the correct character. Classes remain compact and in authored order; note badges follow values.
- **Abilities:** open a skill. In 2014, edit Bonus and Expertise independently. In 2024, choose Proficient/Expertise and check P/E. Neither edition recalculates the authored bonus. Cancel leaves the prior value.
- **Sparse 2024 (Pip):** add a class and an absent spell-slot value. Other unknown facts remain unset; an invalid value retains the editable draft and error.
- **Saturated, either edition:** combine search/quickfilters, pin a matching spell/item, then open its Detail. Filters and identity remain correct; pin movement stays in the operated list. Check at phone width and by keyboard.
- **Sources and Rules:** open a linked action, use View source, edit and return. Only confirmed Refresh changes its copied text. Rules opens SRD 5.1 for 2014, 5.2.1 for 2024; Close preserves independent sheet navigation.

**Catalog alternative:** `npm run storybook` → **Systems / D&D 2014 / Character Sheet / Bryltin, Zindra, Saturated**, or **Systems / D&D 2024 / Character Sheet / Representative, Sparse, Saturated**. These use the production Pages but isolate state: Reset restores the fixture; app persistence/history checks belong in the app. Reuse the viewport toolbar, not extra phone stories.

## Destructive-path checks — disposable browser profile only

- Export/import a mixed-edition backup: preserve values, notes, sources and pins. Duplicate an ID in the input: Replace rejects without mutation; Merge New skips/reports duplicates.
- With rejected old storage, temporary demo edits and import attempts never overwrite the original. Download original data preserves exact bytes; Cancel or failed reset leaves recovery active.

No real user data reset is needed. Detailed setup, original failures and automation are in [verification-record.md](verification-record.md#dependency-maintenance-and-final-verification--2026-10-27).

## Limits

Both v0 schemas remain unstable. This is an authored sheet, not a rules/leveling calculator; refresh is explicit, not automatic propagation. Physical Android/iPhone coverage is not established by desktop automation. Official-paper coverage decisions and deferred Hit Dice/XP/attunement work are recorded in the [paired coverage ADR](../../../../docs/decisions/2026-10-26-bound-2024-character-sheet-coverage.md) and [backlog](../../../../docs/backlog.md).
