import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import { create5e2014Character } from '../../../../schema';
import RuntimeActionsCardStoryHarness from './RuntimeActionsCardStoryHarness.svelte';

const character = create5e2014Character({
	features: [
		{ id: 'shield-feature', name: 'Shield', summary: 'A general feature with a duplicate name.' }
	],
	inventory: [
		{ id: 'sword-1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
		{ id: 'rope-1', name: 'Rope', equipped: false, notes: '50 feet' },
		{ id: 'shield-item', name: 'Shield', equipped: true, notes: '+2 AC' }
	],
	systemData: {
		race: {
			name: 'Elf',
			traits: [{ featureId: 'darkvision', name: 'Darkvision' }]
		},
		classes: [
			{
				name: 'Wizard',
				level: 2,
				features: [{ featureId: 'arcane-recovery', name: 'Arcane Recovery' }]
			}
		],
		spellcasting: {
			ability: 'int',
			spells: [
				{ spellId: 'shield-spell', name: 'Shield', level: 1, prepared: true },
				{ spellId: 'fire-bolt', name: 'Fire Bolt', level: 0 }
			]
		},
		runtimeActions: [
			{
				id: 'linked-action',
				name: 'Longsword attack',
				timing: 'action',
				category: 'attack',
				target: 'One creature',
				notes: 'Player-authored strike note.',
				source: { kind: 'item', id: 'sword-1' }
			},
			{
				id: 'spell-action',
				name: 'Shield reaction',
				timing: 'reaction',
				category: 'effect',
				source: { kind: 'spell', id: 'shield-spell' }
			},
			{
				id: 'custom-action',
				name: 'Improvise',
				timing: 'bonusAction',
				category: 'effect'
			}
		]
	}
});

const clutteredItems = [
	{ id: 'clutter-longsword', name: 'Longsword', equipped: true, notes: '1d8 slashing damage' },
	{ id: 'clutter-shield', name: 'Shield', equipped: true, notes: '+2 AC' },
	{ id: 'clutter-rope', name: 'Rope', quantity: 2, notes: '50 feet of hempen rope' },
	{ id: 'clutter-bucket', name: 'Bucket', notes: 'Wooden, slightly dented' },
	{ id: 'clutter-rock', name: 'Random rock', notes: 'Found in the XYZ dungeon' },
	{ id: 'clutter-potion', name: 'Potion of Healing', notes: 'Regain 2d4 + 2 hit points' },
	{ id: 'clutter-chalk', name: 'Chalk', quantity: 10, notes: 'White sticks for markings' },
	{ id: 'clutter-rations', name: 'Rations', quantity: 7, notes: 'One day of travel food' },
	{ id: 'clutter-oil', name: 'Flask of oil', quantity: 4, notes: 'Burns for 6 hours' },
	{ id: 'clutter-hook', name: 'Grappling hook', notes: 'Iron hook and rope' }
];

const meta = {
	title: 'Organisms/RuntimeActionsCard',
	component: RuntimeActionsCardStoryHarness,
	args: {
		initialCharacter: character,
		onCreateAction: fn(),
		onResyncAction: fn(),
		onNavigateToSource: fn(),
		confirmResync: fn(() => true)
	},
	parameters: {
		docs: {
			description: {
				component:
					'Runtime Action sandbox with custom and source-owned records. Manually verify focused detail/editing separately from View Source and Resync, using the viewport toolbar for phone review.'
			}
		}
	}
} satisfies Meta<typeof RuntimeActionsCardStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedLinkedAndCustom: Story = {};

export const SearchableClutteredSources: Story = {
	args: {
		initialCharacter: create5e2014Character({ inventory: clutteredItems })
	}
};
