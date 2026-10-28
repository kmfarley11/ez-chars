export type SheetLandmarkIcon =
	| 'identity'
	| 'quick-reference'
	| 'actions'
	| 'abilities'
	| 'features'
	| 'spells'
	| 'inventory'
	| 'notes';

export type SheetLandmarkKind = 'region' | 'section';

export interface SheetLandmark {
	fragmentId: string;
	label: string;
	kind: SheetLandmarkKind;
	order: number;
	parentId?: string;
	icon?: SheetLandmarkIcon;
}

export interface SheetLandmarkValidationIssue {
	code: 'duplicate-fragment' | 'invalid-parent' | 'invalid-kind' | 'duplicate-order' | 'cycle';
	fragmentId: string;
	message: string;
}

const compareLandmarkOrder = (a: SheetLandmark, b: SheetLandmark): number => a.order - b.order;

export const getSheetLandmarkRegions = (
	landmarks: ReadonlyArray<SheetLandmark>
): Array<SheetLandmark> =>
	landmarks.filter((landmark) => landmark.kind === 'region').sort(compareLandmarkOrder);

export const getSheetLandmarkChildren = (
	parentId: string,
	landmarks: ReadonlyArray<SheetLandmark>
): Array<SheetLandmark> =>
	landmarks.filter((landmark) => landmark.parentId === parentId).sort(compareLandmarkOrder);

export const resolveSheetLandmarkPath = (
	fragmentId: string,
	landmarks: ReadonlyArray<SheetLandmark>
): Array<SheetLandmark> | undefined => {
	const byFragment = new Map(landmarks.map((landmark) => [landmark.fragmentId, landmark]));
	const path: Array<SheetLandmark> = [];
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

export const validateSheetLandmarks = (
	landmarks: ReadonlyArray<SheetLandmark>
): Array<SheetLandmarkValidationIssue> => {
	const issues: Array<SheetLandmarkValidationIssue> = [];
	const byFragment = new Map<string, SheetLandmark>();
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

		if (!resolveSheetLandmarkPath(landmark.fragmentId, landmarks)) {
			issues.push({
				code: 'cycle',
				fragmentId: landmark.fragmentId,
				message: 'Landmark ancestry must resolve without cycles.'
			});
		}
	}

	return issues;
};
