import type { GridContentListRow } from '$components/gridContentList';
import { getInventoryGroupForItem, type InventoryGroup } from './inventory';
import type { Item, SpellLevel, SpellRef } from '../../schema';

export type Dnd5e2014DenseCollectionRow = GridContentListRow & {
	source:
		| { kind: 'item'; id: string; group: InventoryGroup }
		| { kind: 'spell'; id: string; level: SpellLevel };
};

const inventoryGroupLabels: Record<InventoryGroup, string> = {
	weapons: 'Weapons',
	armorShields: 'Armor & Shields',
	other: 'Other Gear'
};

const getSpellLevelGroupLabel = (level: SpellLevel): string => {
	if (level === 0) return 'Cantrips';
	const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
	return `${level}${suffix}-level spells`;
};

export const projectInventoryDenseCollectionRows = (
	items: ReadonlyArray<Item>,
	group: InventoryGroup
): Array<Dnd5e2014DenseCollectionRow> =>
	items
		.filter((item) => getInventoryGroupForItem(item) === group)
		.map((item) => {
			const contextParts = [
				typeof item.quantity === 'number' ? `Quantity ${item.quantity}` : undefined,
				item.equipped === true ? 'Equipped' : undefined
			].filter((value): value is string => value !== undefined);

			return {
				key: `item:${item.id}`,
				label: item.name,
				detail: item.notes,
				context: contextParts.length > 0 ? contextParts.join(' · ') : undefined,
				annotations: item.annotations,
				searchText: `${inventoryGroupLabels[group]} ${item.value ?? ''}`,
				source: { kind: 'item', id: item.id, group }
			};
		});

export const projectSpellDenseCollectionRows = (
	spells: ReadonlyArray<SpellRef>
): Array<Dnd5e2014DenseCollectionRow> =>
	([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).flatMap((level) =>
		spells
			.filter((spell) => (spell.level ?? 0) === level)
			.map((spell) => {
				const levelLabel = level === 0 ? 'Cantrip' : `Spell level ${level}`;
				const context =
					spell.prepared === undefined
						? levelLabel
						: `${levelLabel} · ${spell.prepared ? 'Prepared' : 'Not prepared'}`;

				return {
					key: `spell:${spell.spellId}`,
					label: spell.name,
					detail: spell.notes,
					context,
					groupLabel: getSpellLevelGroupLabel(level),
					badges: ['Spell'],
					annotations: spell.annotations,
					searchText: context,
					source: { kind: 'spell', id: spell.spellId, level }
				};
			})
	);
