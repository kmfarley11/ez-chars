import { is5e2014Character, type CharacterWithSystemData } from '../schema/index.js';
import { SYSTEM_ID_5E2014 } from '../schema/versions.5e2014.js';
import { SYSTEM_ID_5E2024 } from '../schema/versions-5e2024';

export interface CharacterSummary {
	id: string;
	name: string;
	systemId: string;
	systemLabel: string;
	classSummary: string;
	updatedAt: string;
	updatedAtRaw: string;
	createdAt: string;
	createdAtRaw: string;
	raw: CharacterWithSystemData;
}

export const formatCharacterName = (name?: string, fallbackId: string = ''): string => {
	const trimmed = name?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : fallbackId;
};

export const formatSystemLabel = (systemId?: string): string => {
	if (systemId === SYSTEM_ID_5E2024) return 'D&D 5e (2024)';
	if (systemId === SYSTEM_ID_5E2014) {
		return 'D&D 5e (2014)';
	}
	return systemId && systemId.trim() ? systemId.trim() : 'Unknown System';
};

export const formatClassSummary = (character: CharacterWithSystemData): string => {
	if (!is5e2014Character(character))
		return (
			character.systemData.classes
				?.map(
					(entry) => `${entry.name.trim()}${entry.level === undefined ? '' : ` ${entry.level}`}`
				)
				.join(', ') || '—'
		);
	return (
		character.systemData.classes.map((entry) => `${entry.name.trim()} ${entry.level}`).join(', ') ||
		'—'
	);
};

export const formatTimestamp = (isoString?: string): string => {
	if (!isoString) return '—';
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return isoString;

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});
};

export const toCharacterSummary = (character: CharacterWithSystemData): CharacterSummary => {
	const id = character.meta?.id ?? '';
	const name = formatCharacterName(character.systemData.identity?.name, id);
	const systemId = character.system?.id ?? '';
	const systemLabel = formatSystemLabel(systemId);
	const classSummary = formatClassSummary(character);
	const updatedAt = formatTimestamp(character.meta?.updatedAt);
	const createdAt = formatTimestamp(character.meta?.createdAt);

	return {
		id,
		name,
		systemId,
		systemLabel,
		classSummary,
		updatedAt,
		updatedAtRaw: character.meta?.updatedAt ?? '',
		createdAt,
		createdAtRaw: character.meta?.createdAt ?? '',
		raw: character
	};
};
