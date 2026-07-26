import { describe, expect, it } from 'vitest';
import { create5e2014Character } from '../../../../schema';
import {
	apply5eSourceOwnedText,
	filter5eRuntimeActionSourceCandidates,
	list5eRuntimeActionSourceCandidates,
	reconcile5eRuntimeActionSourceLinks,
	resolve5eRuntimeActionSource
} from '$lib/dnd5e2014/runtimeActionSources';

const createMixedSourceCharacter = () =>
	create5e2014Character({
		features: [
			{
				id: 'general-shield',
				name: 'Shield',
				summary: 'First summary',
				description: 'Long description'
			}
		],
		inventory: [
			{ id: 'rope', name: 'Rope', notes: '50 feet', equipped: false },
			{ id: 'shield-item', name: 'Shield', notes: 'Armor', quantity: 2, equipped: true }
		],
		systemData: {
			race: {
				name: 'Elf',
				traits: [{ featureId: 'darkvision', name: 'Darkvision' }]
			},
			background: {
				name: 'Sage',
				features: [{ featureId: 'researcher', name: 'Researcher' }]
			},
			classes: [
				{
					name: 'Wizard',
					subclass: 'Evocation',
					level: 2,
					features: [
						{ featureId: 'arcane-recovery', name: 'Arcane Recovery' },
						{ featureId: 'class-shield', name: 'Shield' }
					]
				}
			],
			spellcasting: {
				ability: 'int',
				spells: [
					{ spellId: 'fire-bolt', name: 'Fire Bolt', level: 0 },
					{ spellId: 'shield-spell', name: 'Shield', level: 1, prepared: true }
				]
			}
		}
	});

describe('5e runtime action sources', () => {
	it('projects mixed eligible sources in stable category and sheet order', () => {
		const candidates = list5eRuntimeActionSourceCandidates(createMixedSourceCharacter());

		expect(candidates.map((candidate) => candidate.key)).toEqual([
			'item:shield-item',
			'item:rope',
			'spell:fire-bolt',
			'spell:shield-spell',
			'feature:general-shield',
			'feature:arcane-recovery',
			'feature:class-shield',
			'feature:darkvision'
		]);
		expect(candidates.map((candidate) => candidate.category)).toEqual([
			'inventory',
			'inventory',
			'spell',
			'spell',
			'feature',
			'feature',
			'feature',
			'trait'
		]);
		expect(candidates.some((candidate) => candidate.source.id === 'researcher')).toBe(false);
	});

	it('disambiguates duplicate display names with source context and compound keys', () => {
		const shields = list5eRuntimeActionSourceCandidates(createMixedSourceCharacter()).filter(
			(candidate) => candidate.label === 'Shield'
		);

		expect(shields.map((candidate) => candidate.key)).toEqual([
			'item:shield-item',
			'spell:shield-spell',
			'feature:general-shield',
			'feature:class-shield'
		]);
		expect(shields.map((candidate) => candidate.context)).toEqual([
			'Armor & Shields · Quantity 2',
			'Level 1 · Prepared',
			'General feature',
			'Wizard · Evocation'
		]);
		expect(shields.map((candidate) => candidate.badges)).toEqual([
			['Inventory', 'Equipped'],
			['Spell'],
			['Feature', 'General'],
			['Feature', 'Class']
		]);
		expect(shields[0]?.searchText).toContain('quantity 2');
		expect(
			list5eRuntimeActionSourceCandidates(createMixedSourceCharacter()).find(
				(candidate) => candidate.key === 'spell:fire-bolt'
			)
		).toMatchObject({
			context: 'Cantrip',
			badges: ['Spell']
		});
	});

	it('filters text and categories while limiting equipped-only behavior to Inventory', () => {
		const candidates = list5eRuntimeActionSourceCandidates(createMixedSourceCharacter());

		expect(
			filter5eRuntimeActionSourceCandidates(candidates, {
				query: 'shield prepared',
				category: 'all',
				equippedOnly: true
			}).map((candidate) => candidate.key)
		).toEqual(['spell:shield-spell']);
		expect(
			filter5eRuntimeActionSourceCandidates(candidates, {
				query: '',
				category: 'inventory',
				equippedOnly: true
			}).map((candidate) => candidate.key)
		).toEqual(['item:shield-item']);
		expect(
			filter5eRuntimeActionSourceCandidates(candidates, {
				query: 'missing source',
				category: 'all',
				equippedOnly: false
			})
		).toEqual([]);
	});

	it('maps source-owned text and preserves notes for name-only feature sources', () => {
		const character = createMixedSourceCharacter();
		const general = resolve5eRuntimeActionSource(character, {
			kind: 'feature',
			id: 'general-shield'
		});
		const classFeature = resolve5eRuntimeActionSource(character, {
			kind: 'feature',
			id: 'arcane-recovery'
		});
		if (!general || !classFeature) throw new Error('Expected feature sources');

		expect(general.ownedText).toEqual({
			name: 'Shield',
			ownsNotes: true,
			notes: 'First summary'
		});
		expect(
			apply5eSourceOwnedText({ id: 'action-1', name: 'Old', notes: 'Authored notes' }, classFeature)
		).toEqual({
			id: 'action-1',
			name: 'Arcane Recovery',
			notes: 'Authored notes'
		});
	});

	it('resolves exactly one eligible source and unlinks deleted or ineligible links', () => {
		const character = createMixedSourceCharacter();
		character.systemData.runtimeActions = [
			{
				id: 'rope-action',
				name: 'Use rope',
				notes: 'Snapshot',
				source: { kind: 'item', id: 'rope' }
			},
			{
				id: 'background-action',
				name: 'Researcher',
				source: { kind: 'feature', id: 'researcher' }
			}
		];

		expect(resolve5eRuntimeActionSource(character, { kind: 'item', id: 'rope' })?.kind).toBe(
			'item'
		);
		character.inventory = [];
		expect(reconcile5eRuntimeActionSourceLinks(character).systemData.runtimeActions).toEqual([
			{ id: 'rope-action', name: 'Use rope', notes: 'Snapshot' },
			{ id: 'background-action', name: 'Researcher' }
		]);
	});
});
