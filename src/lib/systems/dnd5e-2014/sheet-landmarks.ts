import {
	getSheetLandmarkRegions,
	getSheetLandmarkChildren,
	resolveSheetLandmarkPath,
	validateSheetLandmarks,
	type SheetLandmark
} from '$lib/navigation/sheet-landmarks';
export type {
	SheetLandmark as Dnd5e2014SheetLandmark,
	SheetLandmarkIcon as Dnd5e2014SheetLandmarkIcon,
	SheetLandmarkKind as Dnd5e2014SheetLandmarkKind,
	SheetLandmarkValidationIssue as Dnd5e2014SheetLandmarkValidationIssue
} from '$lib/navigation/sheet-landmarks';

export const dnd5e2014SheetLandmarks: ReadonlyArray<SheetLandmark> = [
	{
		fragmentId: 'sheet-overview-heading',
		label: 'Overview',
		kind: 'region',
		order: 0
	},
	{
		fragmentId: 'sheet-meta-heading',
		label: 'Meta / Top-level Info',
		kind: 'section',
		order: 0,
		parentId: 'sheet-overview-heading',
		icon: 'identity'
	},
	{
		fragmentId: 'sheet-runtime-heading',
		label: 'Runtime',
		kind: 'region',
		order: 1
	},
	{
		fragmentId: 'sheet-quick-reference-heading',
		label: 'Quick Reference',
		kind: 'section',
		order: 0,
		parentId: 'sheet-runtime-heading',
		icon: 'quick-reference'
	},
	{
		fragmentId: 'sheet-actions-heading',
		label: 'Actions / Runtime Summary',
		kind: 'section',
		order: 1,
		parentId: 'sheet-runtime-heading',
		icon: 'actions'
	},
	{
		fragmentId: 'sheet-abilities-proficiencies-heading',
		label: 'Abilities & Proficiencies',
		kind: 'section',
		order: 2,
		parentId: 'sheet-runtime-heading',
		icon: 'abilities'
	},
	{
		fragmentId: 'sheet-features-traits-heading',
		label: 'Features & Traits',
		kind: 'section',
		order: 3,
		parentId: 'sheet-runtime-heading',
		icon: 'features'
	},
	{
		fragmentId: 'sheet-spells-heading',
		label: 'Spells',
		kind: 'section',
		order: 4,
		parentId: 'sheet-runtime-heading',
		icon: 'spells'
	},
	{
		fragmentId: 'sheet-organizational-heading',
		label: 'Organizational',
		kind: 'region',
		order: 2
	},
	{
		fragmentId: 'sheet-inventory-heading',
		label: 'Inventory / Equipment',
		kind: 'section',
		order: 0,
		parentId: 'sheet-organizational-heading',
		icon: 'inventory'
	},
	{
		fragmentId: 'sheet-background-notes-heading',
		label: 'Background, Roleplay, & Notes',
		kind: 'section',
		order: 1,
		parentId: 'sheet-organizational-heading',
		icon: 'notes'
	}
];

export const getDnd5e2014SheetLandmarkRegions = (landmarks = dnd5e2014SheetLandmarks) =>
	getSheetLandmarkRegions(landmarks);
export const getDnd5e2014SheetLandmarkChildren = (
	parentId: string,
	landmarks = dnd5e2014SheetLandmarks
) => getSheetLandmarkChildren(parentId, landmarks);
export const resolveDnd5e2014SheetLandmarkPath = (
	fragmentId: string,
	landmarks = dnd5e2014SheetLandmarks
) => resolveSheetLandmarkPath(fragmentId, landmarks);
export const validateDnd5e2014SheetLandmarks = (landmarks = dnd5e2014SheetLandmarks) =>
	validateSheetLandmarks(landmarks);
