export type Dnd5e2014SheetLandmarkIcon =
	| 'identity'
	| 'quick-reference'
	| 'actions'
	| 'abilities'
	| 'features'
	| 'spells'
	| 'inventory'
	| 'notes';

export type Dnd5e2014SheetLandmarkKind = 'region' | 'section';

export interface Dnd5e2014SheetLandmark {
	fragmentId: string;
	label: string;
	kind: Dnd5e2014SheetLandmarkKind;
	order: number;
	parentId?: string;
	icon?: Dnd5e2014SheetLandmarkIcon;
}

export const dnd5e2014SheetLandmarks: ReadonlyArray<Dnd5e2014SheetLandmark> = [
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

export interface Dnd5e2014SheetLandmarkValidationIssue {
	code: 'duplicate-fragment' | 'invalid-parent' | 'invalid-kind' | 'duplicate-order' | 'cycle';
	fragmentId: string;
	message: string;
}

const compareLandmarkOrder = (a: Dnd5e2014SheetLandmark, b: Dnd5e2014SheetLandmark): number =>
	a.order - b.order;

export const getDnd5e2014SheetLandmarkRegions = (
	landmarks: ReadonlyArray<Dnd5e2014SheetLandmark> = dnd5e2014SheetLandmarks
): Array<Dnd5e2014SheetLandmark> =>
	landmarks.filter((landmark) => landmark.kind === 'region').sort(compareLandmarkOrder);

export const getDnd5e2014SheetLandmarkChildren = (
	parentId: string,
	landmarks: ReadonlyArray<Dnd5e2014SheetLandmark> = dnd5e2014SheetLandmarks
): Array<Dnd5e2014SheetLandmark> =>
	landmarks.filter((landmark) => landmark.parentId === parentId).sort(compareLandmarkOrder);

export const resolveDnd5e2014SheetLandmarkPath = (
	fragmentId: string,
	landmarks: ReadonlyArray<Dnd5e2014SheetLandmark> = dnd5e2014SheetLandmarks
): Array<Dnd5e2014SheetLandmark> | undefined => {
	const byFragment = new Map(landmarks.map((landmark) => [landmark.fragmentId, landmark]));
	const path: Array<Dnd5e2014SheetLandmark> = [];
	const visited = new Set<string>();
	let current = byFragment.get(fragmentId);

	while (current) {
		if (visited.has(current.fragmentId)) return undefined;
		visited.add(current.fragmentId);
		path.unshift(current);
		if (!current.parentId) return path;
		current = byFragment.get(current.parentId);
	}

	return undefined;
};

export const validateDnd5e2014SheetLandmarks = (
	landmarks: ReadonlyArray<Dnd5e2014SheetLandmark> = dnd5e2014SheetLandmarks
): Array<Dnd5e2014SheetLandmarkValidationIssue> => {
	const issues: Array<Dnd5e2014SheetLandmarkValidationIssue> = [];
	const byFragment = new Map<string, Dnd5e2014SheetLandmark>();
	const siblingOrders = new Map<string, Set<number>>();

	for (const landmark of landmarks) {
		if (byFragment.has(landmark.fragmentId)) {
			issues.push({
				code: 'duplicate-fragment',
				fragmentId: landmark.fragmentId,
				message: `Duplicate landmark fragment: ${landmark.fragmentId}`
			});
		} else {
			byFragment.set(landmark.fragmentId, landmark);
		}

		const siblingKey = landmark.parentId ?? '__root__';
		const usedOrders = siblingOrders.get(siblingKey) ?? new Set<number>();
		if (usedOrders.has(landmark.order)) {
			issues.push({
				code: 'duplicate-order',
				fragmentId: landmark.fragmentId,
				message: `Duplicate order ${landmark.order} under ${siblingKey}`
			});
		}
		usedOrders.add(landmark.order);
		siblingOrders.set(siblingKey, usedOrders);
	}

	for (const landmark of landmarks) {
		if (landmark.kind === 'region' && landmark.parentId) {
			issues.push({
				code: 'invalid-kind',
				fragmentId: landmark.fragmentId,
				message: 'Region landmarks cannot have a parent.'
			});
		}

		if (landmark.kind === 'section') {
			const parent = landmark.parentId ? byFragment.get(landmark.parentId) : undefined;
			if (!parent || parent.kind !== 'region') {
				issues.push({
					code: 'invalid-parent',
					fragmentId: landmark.fragmentId,
					message: 'Section landmarks must reference an existing region parent.'
				});
			}
		}

		if (!resolveDnd5e2014SheetLandmarkPath(landmark.fragmentId, landmarks)) {
			issues.push({
				code: 'cycle',
				fragmentId: landmark.fragmentId,
				message: 'Landmark ancestry must resolve without cycles.'
			});
		}
	}

	return issues;
};
