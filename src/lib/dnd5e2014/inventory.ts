import type { Item } from '../../schema';

export type InventoryGroup = 'weapons' | 'armorShields' | 'other';

const inventoryWeaponTag = 'inventory:weapon';
const inventoryArmorShieldTag = 'inventory:armor-shield';
const inventoryWeaponKeywords = [
	'axe',
	'bow',
	'club',
	'crossbow',
	'dagger',
	'dart',
	'flail',
	'halberd',
	'hammer',
	'javelin',
	'lance',
	'mace',
	'maul',
	'morningstar',
	'pike',
	'quarterstaff',
	'rapier',
	'scimitar',
	'shortbow',
	'shortsword',
	'sling',
	'spear',
	'staff',
	'sword',
	'trident',
	'war pick',
	'warhammer',
	'whip'
] as const;
const inventoryArmorShieldKeywords = [
	'armor',
	'breastplate',
	'chain',
	'helm',
	'hide',
	'leather',
	'mail',
	'padded',
	'plate',
	'ring',
	'scale',
	'shield',
	'splint',
	'studded'
] as const;

const inferInventoryGroup = (item: Item): InventoryGroup => {
	const normalizedName = item.name.trim().toLowerCase();
	if (inventoryWeaponKeywords.some((keyword) => normalizedName.includes(keyword))) {
		return 'weapons';
	}
	if (inventoryArmorShieldKeywords.some((keyword) => normalizedName.includes(keyword))) {
		return 'armorShields';
	}
	return 'other';
};

export const getInventoryGroupForItem = (item: Item): InventoryGroup => {
	if (item.tags?.includes(inventoryWeaponTag) === true) return 'weapons';
	if (item.tags?.includes(inventoryArmorShieldTag) === true) return 'armorShields';
	return inferInventoryGroup(item);
};

export const withInventoryGroupTags = (
	tags: Array<string> | undefined,
	group: InventoryGroup
): Array<string> | undefined => {
	const preservedTags = (tags ?? []).filter(
		(tag) => tag !== inventoryWeaponTag && tag !== inventoryArmorShieldTag
	);
	if (group === 'weapons') {
		preservedTags.push(inventoryWeaponTag);
	} else if (group === 'armorShields') {
		preservedTags.push(inventoryArmorShieldTag);
	}
	return preservedTags.length > 0 ? preservedTags : undefined;
};
