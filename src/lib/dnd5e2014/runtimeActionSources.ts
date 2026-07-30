import type {
	CharacterDocument5e2014,
	Feature,
	FeatureRef,
	Item,
	RuntimeAction,
	RuntimeActionSource,
	SpellRef,
	SpellLevel
} from '../../schema';
import { getInventoryGroupForItem, type InventoryGroup } from './inventory';

type SpellListLevel = SpellLevel;

export type RuntimeActionSourceCategory = 'inventory' | 'spell' | 'feature' | 'trait';
export type RuntimeActionSourceCategoryFilter = 'all' | RuntimeActionSourceCategory;

export type RuntimeActionSourceDestination =
	| { kind: 'inventory'; group: InventoryGroup }
	| { kind: 'spell'; level: SpellListLevel }
	| { kind: 'features' }
	| { kind: 'traits' };

type SourceOwnedActionText =
	{ name: string; ownsNotes: false } | { name: string; ownsNotes: true; notes?: string };

type ResolvedSourceBase = {
	source: RuntimeActionSource;
	category: RuntimeActionSourceCategory;
	destination: RuntimeActionSourceDestination;
	sourceLabel: string;
	context: string;
	badges: Array<string>;
	ownedText: SourceOwnedActionText;
};

export type ResolvedRuntimeActionSource =
	| (ResolvedSourceBase & { kind: 'item'; record: Item; equipped: boolean })
	| (ResolvedSourceBase & { kind: 'spell'; record: SpellRef })
	| (ResolvedSourceBase & { kind: 'general-feature'; record: Feature })
	| (ResolvedSourceBase & {
			kind: 'class-feature';
			record: FeatureRef;
			classIndex: number;
	  })
	| (ResolvedSourceBase & { kind: 'trait'; record: FeatureRef });

export type RuntimeActionSourceCandidate = {
	key: string;
	source: RuntimeActionSource;
	category: RuntimeActionSourceCategory;
	label: string;
	detail?: string;
	context: string;
	searchText: string;
	sourceLabel: string;
	badges: Array<string>;
	equipped?: boolean;
	destination: RuntimeActionSourceDestination;
	ownedText: SourceOwnedActionText;
};

export type RuntimeActionDraft = Omit<RuntimeAction, 'id' | 'annotations'>;

export type RuntimeActionSourceFilter = {
	query: string;
	category: RuntimeActionSourceCategoryFilter;
	equippedOnly: boolean;
};

const sourceCategoryLabels: Record<RuntimeActionSourceCategory, string> = {
	inventory: 'Inventory',
	spell: 'Spell',
	feature: 'Feature',
	trait: 'Trait'
};

export const get5eRuntimeActionSourceCategoryLabel = (
	category: RuntimeActionSourceCategory
): string => sourceCategoryLabels[category];

const nonEmptyText = (value: string | undefined): string | undefined => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

const inventoryGroupLabels: Record<InventoryGroup, string> = {
	weapons: 'Weapons',
	armorShields: 'Armor & Shields',
	other: 'Other Gear'
};

const spellLevelLabel = (level: SpellListLevel): string =>
	level === 0 ? 'Cantrip' : `Level ${level}`;

const toSourceKey = (source: RuntimeActionSource): string => `${source.kind}:${source.id}`;

const toCandidate = (resolved: ResolvedRuntimeActionSource): RuntimeActionSourceCandidate => {
	const detail =
		resolved.ownedText.ownsNotes && resolved.ownedText.notes ? resolved.ownedText.notes : undefined;
	return {
		key: toSourceKey(resolved.source),
		source: resolved.source,
		category: resolved.category,
		label: resolved.ownedText.name,
		...(detail ? { detail } : {}),
		context: resolved.context,
		searchText: [
			resolved.ownedText.name,
			detail,
			resolved.context,
			resolved.sourceLabel,
			...resolved.badges
		]
			.filter(Boolean)
			.join(' ')
			.toLocaleLowerCase(),
		sourceLabel: resolved.sourceLabel,
		badges: resolved.badges,
		...('equipped' in resolved ? { equipped: resolved.equipped } : {}),
		destination: resolved.destination,
		ownedText: resolved.ownedText
	};
};

const projectInventorySources = (
	character: CharacterDocument5e2014
): Array<ResolvedRuntimeActionSource> => {
	const project = (item: Item): ResolvedRuntimeActionSource => {
		const group = getInventoryGroupForItem(item);
		const notes = nonEmptyText(item.notes);
		const equipped = item.equipped === true;
		const quantityLabel =
			item.quantity !== undefined && item.quantity !== 1 ? `Quantity ${item.quantity}` : undefined;
		return {
			kind: 'item',
			record: item,
			source: { kind: 'item', id: item.id },
			category: 'inventory',
			destination: { kind: 'inventory', group },
			sourceLabel: `Inventory · ${item.name}`,
			context: [inventoryGroupLabels[group], quantityLabel].filter(Boolean).join(' · '),
			badges: [
				get5eRuntimeActionSourceCategoryLabel('inventory'),
				...(equipped ? ['Equipped'] : [])
			],
			equipped,
			ownedText: {
				name: item.name,
				ownsNotes: true,
				...(notes ? { notes } : {})
			}
		};
	};
	return [
		...character.inventory.filter((item) => item.equipped).map(project),
		...character.inventory.filter((item) => !item.equipped).map(project)
	];
};

const projectSpellSources = (
	character: CharacterDocument5e2014
): Array<ResolvedRuntimeActionSource> =>
	(character.systemData.spellcasting?.spells ?? []).map((spell) => {
		const level = spell.level ?? 0;
		const notes = nonEmptyText(spell.notes);
		const preparedLabel =
			spell.prepared === true ? 'Prepared' : spell.prepared === false ? 'Not prepared' : undefined;
		return {
			kind: 'spell',
			record: spell,
			source: { kind: 'spell', id: spell.spellId },
			category: 'spell',
			destination: { kind: 'spell', level },
			sourceLabel: `Spell · ${spell.name}`,
			context: [spellLevelLabel(level), preparedLabel].filter(Boolean).join(' · '),
			badges: [get5eRuntimeActionSourceCategoryLabel('spell')],
			ownedText: {
				name: spell.name,
				ownsNotes: true,
				...(notes ? { notes } : {})
			}
		};
	});

const projectFeatureSources = (
	character: CharacterDocument5e2014
): Array<ResolvedRuntimeActionSource> => {
	const general: Array<ResolvedRuntimeActionSource> = character.features.map((feature) => {
		const notes = nonEmptyText(feature.summary) ?? nonEmptyText(feature.description);
		return {
			kind: 'general-feature',
			record: feature,
			source: { kind: 'feature', id: feature.id },
			category: 'feature',
			destination: { kind: 'features' },
			sourceLabel: `Feature · ${feature.name}`,
			context: 'General feature',
			badges: [get5eRuntimeActionSourceCategoryLabel('feature'), 'General'],
			ownedText: {
				name: feature.name,
				ownsNotes: true,
				...(notes ? { notes } : {})
			}
		};
	});
	const classOwned: Array<ResolvedRuntimeActionSource> = character.systemData.classes.flatMap(
		(classLevel, classIndex) =>
			(classLevel.features ?? []).map((feature) => {
				const context = classLevel.subclass
					? `${classLevel.name} · ${classLevel.subclass}`
					: classLevel.name;
				return {
					kind: 'class-feature',
					record: feature,
					classIndex,
					source: { kind: 'feature', id: feature.featureId },
					category: 'feature',
					destination: { kind: 'features' },
					sourceLabel: `Feature · ${feature.name}`,
					context,
					badges: [get5eRuntimeActionSourceCategoryLabel('feature'), 'Class'],
					ownedText: { name: feature.name, ownsNotes: false }
				};
			})
	);
	return [...general, ...classOwned];
};

const projectTraitSources = (
	character: CharacterDocument5e2014
): Array<ResolvedRuntimeActionSource> =>
	(character.systemData.race?.traits ?? []).map((trait) => ({
		kind: 'trait',
		record: trait,
		source: { kind: 'feature', id: trait.featureId },
		category: 'trait',
		destination: { kind: 'traits' },
		sourceLabel: `Trait · ${trait.name}`,
		context: character.systemData.race?.name ?? 'Ancestry trait',
		badges: [get5eRuntimeActionSourceCategoryLabel('trait'), 'Ancestry'],
		ownedText: { name: trait.name, ownsNotes: false }
	}));

export const list5eRuntimeActionSourceCandidates = (
	character: CharacterDocument5e2014
): Array<RuntimeActionSourceCandidate> =>
	[
		...projectInventorySources(character),
		...projectSpellSources(character),
		...projectFeatureSources(character),
		...projectTraitSources(character)
	].map(toCandidate);

export const resolve5eRuntimeActionSource = (
	character: CharacterDocument5e2014,
	source: RuntimeActionSource
): ResolvedRuntimeActionSource | undefined => {
	const matches = [
		...projectInventorySources(character),
		...projectSpellSources(character),
		...projectFeatureSources(character),
		...projectTraitSources(character)
	].filter(
		(candidate) => candidate.source.kind === source.kind && candidate.source.id === source.id
	);
	return matches.length === 1 ? matches[0] : undefined;
};

export const filter5eRuntimeActionSourceCandidates = (
	candidates: ReadonlyArray<RuntimeActionSourceCandidate>,
	filter: RuntimeActionSourceFilter
): Array<RuntimeActionSourceCandidate> => {
	const tokens = filter.query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
	return candidates.filter((candidate) => {
		if (filter.category !== 'all' && candidate.category !== filter.category) return false;
		if (filter.category === 'inventory' && filter.equippedOnly && candidate.equipped !== true) {
			return false;
		}
		return tokens.every((token) => candidate.searchText.includes(token));
	});
};

export const is5eRuntimeActionSourceValid = (
	character: CharacterDocument5e2014,
	source: RuntimeActionSource
): boolean => resolve5eRuntimeActionSource(character, source) !== undefined;

export const reconcile5eRuntimeActionSourceLinks = (
	character: CharacterDocument5e2014
): CharacterDocument5e2014 => {
	let changed = false;
	const runtimeActions = character.systemData.runtimeActions.map((action): RuntimeAction => {
		if (!action.source || is5eRuntimeActionSourceValid(character, action.source)) return action;
		changed = true;
		const { source: _source, ...snapshot } = action;
		return snapshot;
	});
	if (!changed) return character;
	return {
		...character,
		systemData: {
			...character.systemData,
			runtimeActions
		}
	};
};

export const apply5eSourceOwnedText = (
	action: RuntimeAction,
	source: ResolvedRuntimeActionSource
): RuntimeAction => {
	if (!source.ownedText.ownsNotes) {
		return { ...action, name: source.ownedText.name };
	}
	const { notes: _notes, ...withoutNotes } = action;
	return {
		...withoutNotes,
		name: source.ownedText.name,
		...(source.ownedText.notes ? { notes: source.ownedText.notes } : {})
	};
};
