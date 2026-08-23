import type {
	CharacterDocument5e2014,
	NamedProficiency,
	ProficiencySourceKind
} from '../../../../schema';
import type { GridContentListRow } from '$components/gridContentList';

export type SupportingCollectionKind = 'features' | 'traits' | 'languages' | 'tools';
export type SupportingCollectionRow = GridContentListRow;

const sourceLabels: Record<ProficiencySourceKind, string> = {
	ancestry: 'Ancestry',
	background: 'Background',
	class: 'Class',
	feature: 'Feature',
	other: 'Other'
};

const projectProficiencyRows = (
	kind: 'languages' | 'tools',
	values: ReadonlyArray<NamedProficiency>
): Array<SupportingCollectionRow> =>
	values.map((entry, index) => ({
		key: `${kind}:${index}:${entry.name}`,
		label: entry.name,
		...(entry.source ? { context: sourceLabels[entry.source.kind] } : {}),
		...(entry.annotations ? { annotations: entry.annotations } : {})
	}));

export const projectSupportingCollectionRows = (
	character: CharacterDocument5e2014,
	kind: SupportingCollectionKind
): Array<SupportingCollectionRow> => {
	switch (kind) {
		case 'features':
			return [
				...character.features.map((feature) => ({
					key: `general-feature:${feature.id}`,
					label: feature.name,
					...(feature.summary || feature.description
						? { detail: feature.summary ?? feature.description }
						: {}),
					context: 'General feature',
					...(feature.annotations ? { annotations: feature.annotations } : {})
				})),
				...character.systemData.classes.flatMap((classLevel, classIndex) =>
					(classLevel.features ?? []).map((feature) => ({
						key: `class-feature:${classIndex}:${feature.featureId}`,
						label: feature.name,
						context: classLevel.subclass
							? `${classLevel.name} · ${classLevel.subclass}`
							: classLevel.name,
						...(feature.annotations ? { annotations: feature.annotations } : {})
					}))
				)
			];
		case 'traits':
			return (character.systemData.race?.traits ?? []).map((trait) => ({
				key: `trait:${trait.featureId}`,
				label: trait.name,
				context: character.systemData.race?.name ?? 'Ancestry trait',
				...(trait.annotations ? { annotations: trait.annotations } : {})
			}));
		case 'languages':
			return projectProficiencyRows('languages', character.systemData.proficiencies.languages);
		case 'tools':
			return projectProficiencyRows('tools', character.systemData.proficiencies.tools);
	}
};

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
