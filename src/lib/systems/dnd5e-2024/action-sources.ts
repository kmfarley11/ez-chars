import type { CharacterDocument5e2024 } from '../../../schema/system-5e2024';
import { featureKinds2024 } from '../../../schema/fields-5e2024';

export type ActionSource = NonNullable<
	CharacterDocument5e2024['systemData']['runtimeActions'][number]['source']
>;

export const sourceCollection = (character: CharacterDocument5e2024, source: ActionSource) => {
	if (source.kind === 'item') return 'inventory' as const;
	if (source.kind === 'spell') return 'spells' as const;
	return featureKinds2024.find((kind) =>
		character.systemData[kind]?.some((entry) => entry.id === source.id)
	);
};

export const resolveActionSource = (character: CharacterDocument5e2024, source: ActionSource) => {
	const kind = sourceCollection(character, source);
	return kind ? character.systemData[kind]?.find((entry) => entry.id === source.id) : undefined;
};

export const actionSourceCandidates = (character: CharacterDocument5e2024) =>
	(['inventory', 'spells', ...featureKinds2024] as const).flatMap((collection) =>
		(character.systemData[collection] ?? []).map((entry) => {
			const kind =
				collection === 'inventory' ? 'item' : collection === 'spells' ? 'spell' : 'feature';
			return {
				key: `${kind}:${entry.id}`,
				label: entry.name,
				detail: entry.detail,
				badges: [
					collection === 'inventory'
						? 'Inventory'
						: collection[0].toUpperCase() + collection.slice(1)
				],
				source: { kind, id: entry.id } satisfies ActionSource
			};
		})
	);
