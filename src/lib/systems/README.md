# System-Owned Presentation

[D&D 2014](dnd5e-2014/) remains the full implemented baseline:

- [components](dnd5e-2014/components/): system-owned sections and controls, with colocated **Systems / D&D 2014** stories.
- [pages](dnd5e-2014/pages/): production sheet composition and isolated **Systems / D&D 2014 / Character Sheet** examples (Bryltin, Zindra, Saturated).
- [editing](dnd5e-2014/editing/): concrete mutation adapters and the edit session shared by application and story hosts.
- Root helpers: projections, landmarks, collection/source rules and injected reference resolution; nearby `__tests__/` protect their contracts.

[D&D 2024](dnd5e-2024/) contains the owner-approved BL-070 authored sheet: identity/classes, runtime/reference stats, abilities/checks/training, named capabilities, equipment/currency, optional spells/slots and notes. Its Representative, Sparse and Saturated [Pages](dnd5e-2024/pages/) use the same composition and [edit session](dnd5e-2024/editing/) as the actual route. `sheet-fields.ts` owns editable metadata, `sheet-projections.ts` owns grouping, and `action-sources.ts` resolves item/spell/feature snapshots. Unknown values stay absent; 2024 does not infer build legality, bonuses or progression.

Both editions keep equivalent content in familiar sections and use shared Tier 1/2/3 controls. [QuickReference](../ui/organisms/quick-reference.svelte) is a neutral two-panel layout consumed by both. Edition-owned record creation still differs: the 2014 intent-based adapters and 2024 definition-based session share interaction contracts, not a universal mutation reducer. Neither Page uses bulk editing as a fallback for supported read-first fields; `GridContentEditDialog` remains useful for explicit new-record creation.

The concrete routes in `src/routes/charsheets/5e/` and `src/routes/charsheets/5e2024/` own app persistence and system guards. Shared controls remain in [ui](../ui/README.md); [navigation](../navigation/) owns neutral landmark coordination and the host contract, while each system supplies its own landmarks/catalog. Story hosts reuse [isolated state](../storybook/canonical-sheet-state.ts), not duplicated domain mutations. See the [component maintenance guide](../../../docs/component-maintenance.md) before extending or adding a system; this layout does not prescribe a universal system adapter.
