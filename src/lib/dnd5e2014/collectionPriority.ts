import type {
	CharacterDocument5e2014,
	CollectionPriorityKind5e2014
} from '../../schema/system.5e2014';
import { getInventoryGroupForItem, type InventoryGroup } from './inventory';

const normalizeEnglishLabel = (value: string): string =>
	value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();

export const compare5e2014PriorityLabels = (left: string, right: string): number => {
	const normalizedLeft = normalizeEnglishLabel(left);
	const normalizedRight = normalizeEnglishLabel(right);
	return normalizedLeft < normalizedRight ? -1 : normalizedLeft > normalizedRight ? 1 : 0;
};

export const get5e2014PriorityIdentities = (
	character: CharacterDocument5e2014,
	collection: CollectionPriorityKind5e2014
): Array<string> => {
	switch (collection) {
		case 'inventory':
			return character.inventory.map((item) => item.id);
		case 'spells':
			return (character.systemData.spellcasting?.spells ?? []).map((spell) => spell.spellId);
		case 'features':
			return [
				...character.features.map((feature) => feature.id),
				...character.systemData.classes.flatMap((classLevel) =>
					(classLevel.features ?? []).map((feature) => feature.featureId)
				)
			];
		case 'traits':
			return (character.systemData.race?.traits ?? []).map((trait) => trait.featureId);
		case 'languages':
			return character.systemData.proficiencies.languages.map((language) => language.id);
		case 'tools':
			return character.systemData.proficiencies.tools.map((tool) => tool.id);
	}
};

export const set5e2014CollectionPins = (
	character: CharacterDocument5e2014,
	collection: CollectionPriorityKind5e2014,
	identities: ReadonlyArray<string>
): CharacterDocument5e2014 => {
	const collectionPins = { ...character.systemData.collectionPins };
	if (identities.length > 0) collectionPins[collection] = [...identities].sort();
	else delete collectionPins[collection];

	const systemData = { ...character.systemData };
	if (Object.keys(collectionPins).length > 0) systemData.collectionPins = collectionPins;
	else delete systemData.collectionPins;

	return { ...character, systemData };
};

export const merge5e2014InventoryGroupPins = (
	character: CharacterDocument5e2014,
	group: InventoryGroup,
	draft: ReadonlyArray<string>
): Array<string> => {
	const groupIdentities = new Set(
		character.inventory
			.filter((item) => getInventoryGroupForItem(item) === group)
			.map((item) => item.id)
	);
	return [
		...(character.systemData.collectionPins?.inventory ?? []).filter(
			(identity) => !groupIdentities.has(identity)
		),
		...draft
	];
};

export const reconcile5e2014CollectionPins = (
	character: CharacterDocument5e2014,
	collection: CollectionPriorityKind5e2014
): CharacterDocument5e2014 => {
	const currentPins = character.systemData.collectionPins?.[collection];
	if (!currentPins) return character;
	const eligibleIdentities = new Set(get5e2014PriorityIdentities(character, collection));
	return set5e2014CollectionPins(
		character,
		collection,
		currentPins.filter((identity) => eligibleIdentities.has(identity))
	);
};
