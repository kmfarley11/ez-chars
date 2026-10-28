import type { SheetLandmark } from '$lib/navigation/sheet-landmarks';

export const sheetLandmarks: ReadonlyArray<SheetLandmark> = [
	{ fragmentId: 'sheet-overview-heading', label: 'Overview', kind: 'region', order: 0 },
	{
		fragmentId: 'sheet-origin-heading',
		label: 'Identity & Origin',
		kind: 'section',
		parentId: 'sheet-overview-heading',
		order: 0,
		icon: 'identity'
	},
	{ fragmentId: 'sheet-runtime-heading', label: 'Runtime', kind: 'region', order: 1 },
	{
		fragmentId: 'sheet-quick-reference-heading',
		label: 'Quick Reference',
		kind: 'section',
		parentId: 'sheet-runtime-heading',
		order: 0,
		icon: 'quick-reference'
	},
	{
		fragmentId: 'sheet-actions-heading',
		label: 'Runtime Actions',
		kind: 'section',
		parentId: 'sheet-runtime-heading',
		order: 1,
		icon: 'actions'
	},
	{ fragmentId: 'sheet-organizational-heading', label: 'Organizational', kind: 'region', order: 2 },
	{
		fragmentId: 'sheet-abilities-heading',
		label: 'Abilities & Proficiencies',
		kind: 'section',
		parentId: 'sheet-runtime-heading',
		order: 2,
		icon: 'abilities'
	},
	{
		fragmentId: 'sheet-features-heading',
		label: 'Features & Traits',
		kind: 'section',
		parentId: 'sheet-runtime-heading',
		order: 3,
		icon: 'features'
	},
	{
		fragmentId: 'sheet-spells-heading',
		label: 'Spells',
		kind: 'section',
		parentId: 'sheet-runtime-heading',
		order: 4,
		icon: 'spells'
	},
	{
		fragmentId: 'sheet-inventory-heading',
		label: 'Inventory & Equipment',
		kind: 'section',
		parentId: 'sheet-organizational-heading',
		order: 0,
		icon: 'inventory'
	},
	{
		fragmentId: 'sheet-notes-heading',
		label: 'Background, Roleplay & Notes',
		kind: 'section',
		parentId: 'sheet-organizational-heading',
		order: 1,
		icon: 'notes'
	}
];
export const landmark = (id: string): SheetLandmark => {
	const result = sheetLandmarks.find((entry) => entry.fragmentId === id);
	if (!result) throw new Error(`Missing 2024 sheet landmark: ${id}`);
	return result;
};
