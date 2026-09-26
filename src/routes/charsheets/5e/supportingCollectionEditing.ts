import type { GridContentAnnotation, GridContentData } from '$utils/gridContentTypes';
import type { CharacterDocument5e2014 } from '../../../schema';
import type { FeatureEditorPayload, SheetEditIntent } from './sheetEditIntents';
import type {
	SupportingCollectionKind,
	SupportingCollectionRow
} from './components/supportingCollectionRows';

const valueAt = (data: GridContentData, key: string): unknown => data[key]?.value;

export const projectSupportingRecordEditData = (
	character: CharacterDocument5e2014,
	row: SupportingCollectionRow | undefined
): GridContentData => {
	if (!row) return {};
	if (row.source.kind === 'general-feature') {
		const feature = character.features.find((entry) => entry.id === row.source.id);
		return feature
			? {
					name: { fieldName: 'Name', value: feature.name },
					detail: {
						fieldName: 'Detail',
						value: feature.summary ?? feature.description ?? '',
						multiline: true
					}
				}
			: {};
	}
	if (row.source.kind === 'class-feature') {
		const feature = character.systemData.classes[row.source.classIndex]?.features?.find(
			(entry) => entry.featureId === row.source.id
		);
		return feature ? { name: { fieldName: 'Name', value: feature.name } } : {};
	}
	if (row.source.kind === 'trait') {
		const trait = character.systemData.race?.traits?.find(
			(entry) => entry.featureId === row.source.id
		);
		return trait ? { name: { fieldName: 'Name', value: trait.name } } : {};
	}
	const proficiency = character.systemData.proficiencies[row.source.collection].find(
		(entry) => entry.id === row.source.id
	);
	return proficiency
		? {
				name: { fieldName: 'Name', value: proficiency.name },
				source: {
					fieldName: 'Source',
					value: proficiency.source?.kind ?? 'other',
					options: ['ancestry', 'background', 'class', 'feature', 'other']
				}
			}
		: {};
};

const featurePayload = (
	character: CharacterDocument5e2014,
	selected: SupportingCollectionRow | undefined,
	data: GridContentData | undefined,
	annotations: ReadonlyArray<GridContentAnnotation> | undefined,
	removeSelected: boolean
): FeatureEditorPayload => {
	const result: FeatureEditorPayload = [];
	for (const feature of character.features) {
		if (selected?.source.kind === 'general-feature' && feature.id === selected.source.id) {
			if (!removeSelected) {
				result.push({
					featureId: feature.id,
					name: String(valueAt(data ?? {}, 'name') ?? feature.name),
					owner: 'general' as const,
					summary: String(valueAt(data ?? {}, 'detail') ?? feature.summary ?? ''),
					annotations: [...(annotations ?? feature.annotations ?? [])]
				});
			}
			continue;
		}
		result.push({
			featureId: feature.id,
			name: feature.name,
			owner: 'general' as const,
			summary: feature.summary,
			description: feature.description,
			annotations: feature.annotations
		});
	}
	for (const [classIndex, classLevel] of character.systemData.classes.entries()) {
		for (const feature of classLevel.features ?? []) {
			const isSelected =
				selected?.source.kind === 'class-feature' &&
				selected.source.classIndex === classIndex &&
				selected.source.id === feature.featureId;
			result.push({
				featureId: feature.featureId,
				name: isSelected ? String(valueAt(data ?? {}, 'name') ?? feature.name) : feature.name,
				owner: 'class' as const,
				classIndex,
				annotations: isSelected
					? [...(annotations ?? feature.annotations ?? [])]
					: feature.annotations
			});
		}
	}
	return result;
};

const traitPayload = (
	character: CharacterDocument5e2014,
	selected: SupportingCollectionRow | undefined,
	data: GridContentData | undefined,
	annotations: ReadonlyArray<GridContentAnnotation> | undefined
) =>
	(character.systemData.race?.traits ?? []).map((trait) => {
		const isSelected = selected?.source.kind === 'trait' && selected.source.id === trait.featureId;
		return {
			featureId: trait.featureId,
			name: isSelected ? String(valueAt(data ?? {}, 'name') ?? trait.name) : trait.name,
			annotations: isSelected ? [...(annotations ?? trait.annotations ?? [])] : trait.annotations
		};
	});

const proficiencyPayload = (
	character: CharacterDocument5e2014,
	kind: 'languages' | 'tools',
	selected: SupportingCollectionRow | undefined,
	data: GridContentData | undefined,
	annotations: ReadonlyArray<GridContentAnnotation> | undefined,
	removeSelected: boolean
) =>
	character.systemData.proficiencies[kind].flatMap((entry) => {
		const isSelected = selected?.source.kind === 'proficiency' && selected.source.id === entry.id;
		if (isSelected && removeSelected) return [];
		return [
			{
				id: entry.id,
				name: isSelected ? String(valueAt(data ?? {}, 'name') ?? entry.name) : entry.name,
				source: isSelected
					? (String(valueAt(data ?? {}, 'source') ?? entry.source?.kind ?? 'other') as
							'ancestry' | 'background' | 'class' | 'feature' | 'other')
					: (entry.source?.kind ?? 'other'),
				annotations: isSelected ? [...(annotations ?? entry.annotations ?? [])] : entry.annotations
			}
		];
	});

export const decodeSupportingRecordSaveIntent = (
	character: CharacterDocument5e2014,
	kind: SupportingCollectionKind,
	row: SupportingCollectionRow,
	data: GridContentData,
	annotations: ReadonlyArray<GridContentAnnotation>
): SheetEditIntent | undefined => {
	const name = valueAt(data, 'name');
	if (typeof name !== 'string' || !name.trim()) return undefined;
	if (kind === 'features') {
		return {
			type: 'replace-features',
			features: featurePayload(character, row, data, annotations, false)
		};
	}
	if (kind === 'traits') {
		return { type: 'replace-traits', traits: traitPayload(character, row, data, annotations) };
	}
	const values = proficiencyPayload(character, kind, row, data, annotations, false);
	return kind === 'languages'
		? { type: 'replace-proficiency-languages', languages: values }
		: { type: 'replace-proficiency-tools', tools: values };
};

export const projectSupportingAddData = (kind: SupportingCollectionKind): GridContentData => ({
	name: {
		fieldName: 'Name',
		value: kind === 'features' ? 'Feature' : kind === 'traits' ? 'Trait' : 'Proficiency'
	},
	...(kind === 'features'
		? { detail: { fieldName: 'Initial detail', value: '', multiline: true } }
		: {}),
	...(kind === 'languages' || kind === 'tools'
		? {
				source: {
					fieldName: 'Source',
					value: 'other',
					options: ['ancestry', 'background', 'class', 'feature', 'other']
				}
			}
		: {})
});

export const decodeSupportingAddIntent = (
	character: CharacterDocument5e2014,
	kind: SupportingCollectionKind,
	data: GridContentData
): SheetEditIntent | undefined => {
	const name = valueAt(data, 'name');
	if (typeof name !== 'string' || !name.trim()) return undefined;
	if (kind === 'features') {
		return {
			type: 'replace-features',
			features: [
				...featurePayload(character, undefined, undefined, undefined, false),
				{
					name: name.trim(),
					owner: 'general' as const,
					summary: String(valueAt(data, 'detail') ?? '')
				}
			]
		};
	}
	if (kind === 'traits') {
		return {
			type: 'replace-traits',
			traits: [...traitPayload(character, undefined, undefined, undefined), { name: name.trim() }]
		};
	}
	const values = [
		...proficiencyPayload(character, kind, undefined, undefined, undefined, false),
		{
			name: name.trim(),
			source: String(valueAt(data, 'source') ?? 'other') as 'other'
		}
	];
	return kind === 'languages'
		? { type: 'replace-proficiency-languages', languages: values }
		: { type: 'replace-proficiency-tools', tools: values };
};

export const isSupportingRecordRemovable = (row: SupportingCollectionRow): boolean =>
	row.source.kind === 'general-feature' || row.source.kind === 'proficiency';

export const decodeSupportingRemoveIntent = (
	character: CharacterDocument5e2014,
	kind: SupportingCollectionKind,
	row: SupportingCollectionRow
): SheetEditIntent | undefined => {
	if (row.source.kind === 'general-feature') {
		return {
			type: 'replace-features',
			features: featurePayload(character, row, undefined, undefined, true)
		};
	}
	if (row.source.kind !== 'proficiency' || (kind !== 'languages' && kind !== 'tools')) {
		return undefined;
	}
	const values = proficiencyPayload(character, kind, row, undefined, undefined, true);
	return kind === 'languages'
		? { type: 'replace-proficiency-languages', languages: values }
		: { type: 'replace-proficiency-tools', tools: values };
};
