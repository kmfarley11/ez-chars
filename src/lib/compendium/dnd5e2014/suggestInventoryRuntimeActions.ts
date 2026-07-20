import type { Item, RuntimeAction, RuntimeActionSource } from '../../../schema';

export type RuntimeActionSuggestion = Omit<RuntimeAction, 'id' | 'annotations' | 'source'> & {
	source: RuntimeActionSource;
};

export const suggest5eInventoryRuntimeActions = async (
	items: ReadonlyArray<Item>
): Promise<RuntimeActionSuggestion[]> =>
	items
		.filter((item) => item.equipped === true)
		.map((item) => ({
			name: item.name,
			...(item.notes !== undefined ? { notes: item.notes } : {}),
			source: { kind: 'item', id: item.id }
		}));
