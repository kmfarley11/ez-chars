import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { bryltin, seedChars, zindra } from '../characters';
import { saturatedCharacter5e2014 } from '../saturatedCharacter.5e2014';
import { is5e2014Character } from '../../schema/storedCharacters';

// Baseline captured before BL-070 moves the persisted gameplay roots. Stable property
// ordering ignores object construction order, not array order or authored values.
const stableJson = (value: unknown): string => {
	if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
	if (value && typeof value === 'object') {
		return `{${Object.entries(value)
			.filter(([, v]) => v !== undefined)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`)
			.join(',')}}`;
	}
	return JSON.stringify(value);
};

describe('canonical 2014 authored-content parity across the envelope rebase', () => {
	for (const fixture of [
		bryltin,
		zindra,
		saturatedCharacter5e2014,
		...seedChars
			.filter(is5e2014Character)
			.filter(
				(c) =>
					![bryltin.meta.id, zindra.meta.id, saturatedCharacter5e2014.meta.id].includes(c.meta.id)
			)
	]) {
		it(`preserves ${fixture.meta.id}`, () => {
			const { createdAt: _createdAt, updatedAt: _updatedAt, ...meta } = fixture.meta;
			const {
				identity,
				inventory,
				features,
				notes,
				characterAnnotations,
				provenance,
				...systemData
			} = fixture.systemData;
			// Compare with the frozen pre-rebase digest, not an updated expected snapshot.
			// Only envelope placement and the newly explicit category differ intentionally.
			const originalShape = {
				meta,
				system: { ...fixture.system, ...provenance },
				identity,
				inventory: inventory.map(({ category: _category, ...item }) => item),
				features,
				notes,
				systemData,
				...(characterAnnotations !== undefined ? { annotations: characterAnnotations } : {})
			};
			// Personal example factories historically initialize timestamps on module load.
			const digest = createHash('sha256').update(stableJson(originalShape)).digest('hex');
			expect(digest).toMatchSnapshot();
		});
	}
});
