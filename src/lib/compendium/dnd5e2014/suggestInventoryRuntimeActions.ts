import type { Item, RuntimeAction, RuntimeActionSource } from '../../../schema';

export type RuntimeActionSuggestion = Omit<RuntimeAction, 'id' | 'annotations' | 'source'> & {
	source: RuntimeActionSource;
};

export const filterAndSortInventoryItems = (
	items: ReadonlyArray<Item>,
	query: string,
	equippedOnly: boolean
): ReadonlyArray<Item> => {
	const tokens = query
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t.length > 0);

	let filtered = items.filter((item) => {
		if (equippedOnly && !item.equipped) return false;
		if (tokens.length === 0) return true;
		const text = `${item.name} ${item.notes ?? ''}`.toLowerCase();
		return tokens.every((token) => text.includes(token));
	});

	const equipped = filtered.filter((i) => i.equipped);
	const unequipped = filtered.filter((i) => !i.equipped);

	return [...equipped, ...unequipped];
};

export const toRuntimeActionSuggestion = (item: Item): RuntimeActionSuggestion => {
	return {
		name: item.name,
		...(item.notes !== undefined ? { notes: item.notes } : {}),
		source: { kind: 'item', id: item.id }
	};
};

export const suggest5eInventoryRuntimeActions = async (
	items: ReadonlyArray<Item>
): Promise<ReadonlyArray<RuntimeActionSuggestion>> => {
	return items.map(toRuntimeActionSuggestion);
};
