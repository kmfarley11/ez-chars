import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import { bryltin } from '../../../fixtures/characters';
import { sparseCharacter5e2024 } from '../../../fixtures/characters-5e2024';
import { create5eSheetEditSession } from '$lib/systems/dnd5e-2014/editing/sheet-edit-session';
import { createSheetEditSession } from '$lib/systems/dnd5e-2024/editing/sheet-edit-session';
import { project5eSheet } from '$lib/systems/dnd5e-2014/sheet-projections';
import FieldGroupView from '$lib/ui/molecules/field-group-view.svelte';
import {
	safeParseStoredCharacterDocuments,
	serializeStoredCharacterDocuments
} from '../../../schema/storedCharacters';

describe('BL-089 runtime integration contracts', () => {
	it('places 2014 Inspiration only in Live state, preserving missing presence and notes', () => {
		const character = structuredClone(bryltin);
		delete character.systemData.combat.inspiration;
		character.systemData.annotations = {
			combat: {
				inspiration: {
					_annotations: {
						'inspiration-note': {
							id: 'inspiration-note',
							kind: 'note',
							origin: 'user',
							text: 'Kept after relocation'
						}
					}
				}
			}
		};
		const original = structuredClone(character);
		const proof = project5eSheet(character);
		expect(proof.quickRefReferenceData.inspiration).toBeUndefined();
		expect(proof.quickRefLiveData.inspiration).toMatchObject({
			value: false,
			inputKind: 'boolean',
			binding: { valuePatchOperation: 'add' },
			interaction: { tier: 'runtime' }
		});
		expect(proof.quickRefLiveData.inspiration.annotationBindPath).toEqual([
			'systemData',
			'annotations',
			'combat',
			'inspiration',
			'_annotations'
		]);
		expect(proof.quickRefLiveData.inspiration.annotations?.[0].text).toBe('Kept after relocation');
		expect(character).toEqual(original);
	});

	it('guards 2014 absent and existing values and writes exactly once per accepted activation', () => {
		let character = structuredClone(bryltin);
		delete character.systemData.combat.inspiration;
		let reject = false;
		const write = vi.fn((next: typeof character) => {
			character = next;
		});
		const session = create5eSheetEditSession({
			read: () => character,
			write,
			reject: () => reject
		});
		const path = '/systemData/combat/inspiration';
		const unrelated = structuredClone(character.systemData);
		expect(session.patch([{ op: 'add', path, value: true }]).ok).toBe(true);
		expect(write).toHaveBeenCalledTimes(1);
		expect(session.patch([{ op: 'add', path, value: false }]).ok).toBe(false);
		expect(session.patch([{ op: 'replace', path, value: false }]).ok).toBe(false);
		reject = true;
		expect(
			session.patch([
				{ op: 'test', path, value: true },
				{ op: 'replace', path, value: false }
			]).ok
		).toBe(false);
		expect(write).toHaveBeenCalledTimes(1);
		reject = false;
		expect(
			session.patch([
				{ op: 'test', path, value: true },
				{ op: 'replace', path, value: false }
			]).ok
		).toBe(true);
		expect(write).toHaveBeenCalledTimes(2);
		expect(character.systemData).toEqual({
			...unrelated,
			combat: { ...unrelated.combat, inspiration: false }
		});
		expect(session.patch([{ op: 'replace', path, value: 'yes' }]).ok).toBe(false);
	});

	it('classifies only selected 2024 runtime fields and rejects stale optional text without losing notes', () => {
		let character = structuredClone(sparseCharacter5e2024);
		character.systemData.combat = {};
		character.systemData.fieldNotes = {
			'/systemData/combat/conditions': [
				{ id: 'note', kind: 'note', origin: 'user', text: 'Keep me' }
			]
		};
		let reject = false;
		const write = vi.fn((next: typeof character) => {
			character = next;
		});
		const owner = { read: () => character, write, reject: () => reject };
		const session = createSheetEditSession(owner);
		const path = '/systemData/combat/conditions';
		expect(session.project(['conditions']).conditions.interaction?.tier).toBe('runtime');
		expect(session.project(['species']).species.interaction?.tier).toBe('read-first');
		expect(
			session.patch([{ op: 'add', path: '/systemData/identity/species', value: 'Elf' }]).ok
		).toBe(false);
		expect(session.project(['heroicInspiration']).heroicInspiration).toMatchObject({
			value: false,
			inputKind: 'boolean',
			binding: { valuePatchOperation: 'add' }
		});
		expect(write).not.toHaveBeenCalled();
		expect(session.patch([{ op: 'add', path, value: 'Prone\nConcentrating' }]).ok).toBe(true);
		expect(session.patch([{ op: 'add', path, value: 'Stale draft' }]).ok).toBe(false);
		expect(
			session.patch([
				{ op: 'test', path, value: 'Old' },
				{ op: 'replace', path, value: 'Stale' }
			]).ok
		).toBe(false);
		reject = true;
		const clear = [
			{ op: 'test' as const, path, value: 'Prone\nConcentrating' },
			{ op: 'replace' as const, path, value: '' }
		];
		expect(session.patch(clear).ok).toBe(false);
		expect(write).toHaveBeenCalledTimes(1);
		reject = false;
		expect(session.patch(clear).ok).toBe(true);
		expect(character.systemData.combat?.conditions).toBe('');
		expect(character.systemData.fieldNotes?.[path]?.[0].text).toBe('Keep me');
		expect(session.patch([{ op: 'replace', path, value: 42 }]).ok).toBe(false);
		const flagPath = '/systemData/combat/heroicInspiration';
		expect(session.patch([{ op: 'add', path: flagPath, value: true }]).ok).toBe(true);
		expect(session.patch([{ op: 'add', path: flagPath, value: false }]).ok).toBe(false);
	});

	it('round-trips absent, false and true runtime flags, multiline text and notes through existing JSON boundaries', () => {
		for (const value of [undefined, false, true]) {
			const oldEdition = structuredClone(bryltin);
			const newEdition = structuredClone(sparseCharacter5e2024);
			delete oldEdition.systemData.combat.inspiration;
			oldEdition.systemData.annotations = {
				combat: {
					inspiration: {
						_annotations: {
							'flag-note': {
								id: 'flag-note',
								kind: 'note',
								origin: 'user',
								text: 'Inspiration note'
							}
						}
					}
				}
			};
			newEdition.systemData.combat = { conditions: 'Prone\nConcentrating' };
			if (value !== undefined) {
				oldEdition.systemData.combat.inspiration = value;
				newEdition.systemData.combat.heroicInspiration = value;
			}
			newEdition.systemData.fieldNotes = {
				'/systemData/combat/conditions': [
					{ id: 'kept', kind: 'note', origin: 'user', text: 'Keep this' }
				]
			};
			const characters = [oldEdition, newEdition];
			const restored = safeParseStoredCharacterDocuments(
				JSON.parse(JSON.stringify(serializeStoredCharacterDocuments(characters)))
			);
			expect(restored.success).toBe(true);
			if (restored.success) expect(restored.data).toEqual(characters);
		}
	});

	it('routes only runtime booleans into actionable controls even with checkbox display metadata', () => {
		const field = {
			fieldName: 'Ready',
			value: false,
			inputKind: 'boolean' as const,
			displayAs: 'checkbox' as const,
			bindPath: ['ready'],
			capabilities: { canEditValue: true },
			binding: { valuePatchOperation: 'add' as const }
		};
		const proof = render(FieldGroupView, {
			props: { data: { ready: { ...field, interaction: { tier: 'runtime' } } }, interactive: true }
		}).body;
		expect(proof).toContain('aria-label="Ready"');
		expect(proof).toContain('Not recorded');
		const baseline = render(FieldGroupView, {
			props: {
				data: { ready: { ...field, interaction: { tier: 'read-first' } } },
				interactive: true
			}
		}).body;
		expect(baseline).toContain('disabled=""');
	});
});
