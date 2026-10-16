# System-Owned Presentation

[D&D 2014](dnd5e-2014/) is the only implemented system:

- [components](dnd5e-2014/components/): system-owned sections and controls, with colocated **Systems / D&D 2014** stories.
- [pages](dnd5e-2014/pages/): production sheet composition and isolated **Systems / D&D 2014 / Character Sheet** examples (Bryltin, Zindra, Saturated).
- [editing](dnd5e-2014/editing/): concrete mutation adapters and the edit session shared by application and story hosts.
- Root helpers: projections, landmarks, collection/source rules and injected reference resolution; nearby `__tests__/` protect their contracts.

The actual route in `src/routes/charsheets/5e/` owns app persistence and navigation. Shared controls remain in [ui](../ui/README.md). See the [component maintenance guide](../../../docs/component-maintenance.md) before extending or adding a system; this layout does not prescribe a universal system adapter.
