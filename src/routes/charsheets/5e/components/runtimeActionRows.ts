import type { Item, RuntimeAction } from '../../../../schema';

const timingLabels: Record<NonNullable<RuntimeAction['timing']>, string> = {
	action: 'Action',
	bonusAction: 'Bonus action',
	reaction: 'Reaction',
	free: 'Free',
	other: 'Other'
};

const categoryLabels: Record<NonNullable<RuntimeAction['category']>, string> = {
	attack: 'Attack',
	effect: 'Effect',
	other: 'Other'
};

export type RuntimeActionRow = {
	id: string;
	name: string;
	timingLabel: string;
	categoryLabel: string;
	target?: string;
	notes?: string;
	source?: {
		itemId: string;
		itemName: string;
	};
};

const nonEmptyText = (value: string | undefined): string | undefined => {
	const normalized = value?.trim();
	return normalized ? normalized : undefined;
};

export const projectRuntimeActionRows = (
	actions: ReadonlyArray<RuntimeAction>,
	inventory: ReadonlyArray<Item>
): Array<RuntimeActionRow> => {
	const inventoryById = new Map(inventory.map((item) => [item.id, item]));

	return actions.map((action) => {
		const sourceItem = action.source ? inventoryById.get(action.source.id) : undefined;
		const target = nonEmptyText(action.target);
		const notes = nonEmptyText(action.notes);
		return {
			id: action.id,
			name: action.name,
			timingLabel: timingLabels[action.timing ?? 'action'],
			categoryLabel: categoryLabels[action.category ?? 'attack'],
			...(target ? { target } : {}),
			...(notes ? { notes } : {}),
			...(sourceItem
				? {
						source: {
							itemId: sourceItem.id,
							itemName: sourceItem.name
						}
					}
				: {})
		};
	});
};
