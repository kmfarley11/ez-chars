import type { GridContentListRow } from '$components/gridContentList';
import type { CollectionPriorityRow } from '$components/collectionPriority';
import { projectCollectionPriorityRows } from '$components/collectionPriority';
import { compare5e2014PriorityLabels } from './collectionPriority';
import { getInventoryGroupForItem, type InventoryGroup } from './inventory';
import type { Item, SpellLevel, SpellRef } from '../../schema';

export type Dnd5e2014DenseCollectionRow = GridContentListRow &
	CollectionPriorityRow & {
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
	group: InventoryGroup,
	pinnedIdentities: ReadonlySet<string> = new Set()
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
				identity: item.id,
				label: item.name,
				pinned: pinnedIdentities.has(item.id),
				detail: item.notes,
				badges: contextParts,
				annotations: item.annotations,
				searchText: `${inventoryGroupLabels[group]} ${item.value ?? ''}`,
				source: { kind: 'item', id: item.id, group }
			};
		});

export const projectSpellDenseCollectionRows = (
	spells: ReadonlyArray<SpellRef>,
	pinnedIdentities: ReadonlySet<string> = new Set()
): Array<Dnd5e2014DenseCollectionRow> =>
	([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).flatMap((level) =>
		spells
			.filter((spell) => (spell.level ?? 0) === level)
			.map((spell) => {
				const levelLabel = level === 0 ? 'Cantrip' : `Spell level ${level}`;
				const stateBadges = [levelLabel, ...(spell.prepared === true ? ['Prepared'] : [])];

				return {
					key: `spell:${spell.spellId}`,
					identity: spell.spellId,
					label: spell.name,
					pinned: pinnedIdentities.has(spell.spellId),
					detail: spell.notes,
					groupLabel: getSpellLevelGroupLabel(level),
					badges: stateBadges,
					annotations: spell.annotations,
					searchText: `${levelLabel} ${spell.prepared ? 'Prepared' : 'Not prepared'}`,
					source: { kind: 'spell', id: spell.spellId, level }
				};
			})
	);
export const projectPrioritizedInventoryDenseCollectionRows = (
	items: ReadonlyArray<Item>,
	group: InventoryGroup,
	pinnedIdentities: ReadonlySet<string> = new Set()
): Array<Dnd5e2014DenseCollectionRow> =>
	projectCollectionPriorityRows(
		projectInventoryDenseCollectionRows(items, group, pinnedIdentities),
		compare5e2014PriorityLabels
	);

export const projectPrioritizedSpellDenseCollectionRows = (
	spells: ReadonlyArray<SpellRef>,
	pinnedIdentities: ReadonlySet<string> = new Set()
): Array<Dnd5e2014DenseCollectionRow> => {
	const rows = projectSpellDenseCollectionRows(spells, pinnedIdentities);
	const pinnedRows = projectCollectionPriorityRows(
		rows.filter((row) => row.pinned).map((row) => ({ ...row, groupLabel: 'Pinned spells' })),
		compare5e2014PriorityLabels
	);
	const unpinnedRows = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).flatMap((level) =>
		projectCollectionPriorityRows(
			rows.filter(
				(row) => row.source.kind === 'spell' && row.source.level === level && !row.pinned
			),
			compare5e2014PriorityLabels
		)
	);
	return [...pinnedRows, ...unpinnedRows];
};
