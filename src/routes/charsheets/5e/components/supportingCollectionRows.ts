import type {
	CharacterDocument5e2014,
	NamedProficiency,
	ProficiencySourceKind
} from '../../../../schema';
import type { GridContentListRow } from '$components/gridContentList';
import {
	projectCollectionPriorityRows,
	type CollectionPriorityRow
} from '$components/collectionPriority';
import { compare5e2014PriorityLabels } from '$lib/dnd5e2014/collectionPriority';

export type SupportingCollectionKind = 'features' | 'traits' | 'languages' | 'tools';
export type SupportingCollectionRow = GridContentListRow & CollectionPriorityRow;

const sourceLabels: Record<ProficiencySourceKind, string> = {
	ancestry: 'Ancestry',
	background: 'Background',
	class: 'Class',
	feature: 'Feature',
	other: 'Other'
};

const projectProficiencyRows = (
	kind: 'languages' | 'tools',
	values: ReadonlyArray<NamedProficiency>,
	pinnedIdentities: ReadonlySet<string>
): Array<SupportingCollectionRow> =>
	values.map((entry) => ({
		key: `${kind}:${entry.id}`,
		identity: entry.id,
		label: entry.name,
		pinned: pinnedIdentities.has(entry.id),
		...(entry.source ? { context: sourceLabels[entry.source.kind] } : {}),
		...(entry.annotations ? { annotations: entry.annotations } : {})
	}));

export const projectSupportingCollectionRows = (
	character: CharacterDocument5e2014,
	kind: SupportingCollectionKind
): Array<SupportingCollectionRow> => {
	switch (kind) {
		case 'features': {
			const featurePins = new Set(character.systemData.collectionPins?.features ?? []);
			return [
				...character.features.map((feature) => ({
					key: `general-feature:${feature.id}`,
					identity: feature.id,
					label: feature.name,
					pinned: featurePins.has(feature.id),
					...(feature.summary || feature.description
						? { detail: feature.summary ?? feature.description }
						: {}),
					context: 'General feature',
					...(feature.annotations ? { annotations: feature.annotations } : {})
				})),
				...character.systemData.classes.flatMap((classLevel, classIndex) =>
					(classLevel.features ?? []).map((feature) => ({
						key: `class-feature:${classIndex}:${feature.featureId}`,
						identity: feature.featureId,
						label: feature.name,
						pinned: featurePins.has(feature.featureId),
						context: classLevel.subclass
							? `${classLevel.name} · ${classLevel.subclass}`
							: classLevel.name,
						...(feature.annotations ? { annotations: feature.annotations } : {})
					}))
				)
			];
		}
		case 'traits': {
			const traitPins = new Set(character.systemData.collectionPins?.traits ?? []);
			return (character.systemData.race?.traits ?? []).map((trait) => ({
				key: `trait:${trait.featureId}`,
				identity: trait.featureId,
				label: trait.name,
				pinned: traitPins.has(trait.featureId),
				context: character.systemData.race?.name ?? 'Ancestry trait',
				...(trait.annotations ? { annotations: trait.annotations } : {})
			}));
		}
		case 'languages':
			return projectProficiencyRows(
				'languages',
				character.systemData.proficiencies.languages,
				new Set(character.systemData.collectionPins?.languages ?? [])
			);
		case 'tools':
			return projectProficiencyRows(
				'tools',
				character.systemData.proficiencies.tools,
				new Set(character.systemData.collectionPins?.tools ?? [])
			);
	}
};

export const projectPrioritizedSupportingCollectionRows = (
	character: CharacterDocument5e2014,
	kind: SupportingCollectionKind
): Array<SupportingCollectionRow> =>
	projectCollectionPriorityRows(
		projectSupportingCollectionRows(character, kind),
		compare5e2014PriorityLabels
	);

export const filterSupportingCollectionRows = (
	rows: ReadonlyArray<SupportingCollectionRow>,
	query: string
): Array<SupportingCollectionRow> => {
	const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return [...rows];
	return rows.filter((row) => {
		const searchText = [row.label, row.detail, row.context, ...(row.badges ?? [])]
			.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
			.join(' ')
			.toLocaleLowerCase();
		return tokens.every((token) => searchText.includes(token));
	});
};
