import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import { create5e2014Character } from '../../../../schema';
import RuntimeActionsCardStoryHarness from './RuntimeActionsCardStoryHarness.svelte';

const character = create5e2014Character({
	features: [
		{
			id: 'shield-feature',
			name: 'Shield',
			summary: 'A general feature with a duplicate name.'
		}
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

const meta = {
	title: 'Organisms/RuntimeActionsCard',
	component: RuntimeActionsCardStoryHarness,
	args: {
		initialCharacter: character,
		onEditSavePatches: fn(),
		onCreateAction: fn(),
		onResyncAction: fn(),
		onNavigateToSource: fn(),
		confirmResync: fn(() => true)
	}
} satisfies Meta<typeof RuntimeActionsCardStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedLinkedAndCustom: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const actions = within(canvas.getByRole('list', { name: 'Runtime actions' }));
		await expect(actions.getByText('Player-authored strike note.')).toBeVisible();
		const inventoryAction = actions.getByText('Longsword attack').closest('li');
		const spellAction = actions.getByText('Shield reaction').closest('li');
		const customAction = actions.getByText('Improvise').closest('li');
		if (!inventoryAction || !spellAction || !customAction) {
			throw new Error('Expected all runtime-action rows');
		}
		await expect(within(inventoryAction).getByText('Inventory')).toBeVisible();
		await expect(within(spellAction).getByText('Spell')).toBeVisible();
		await expect(within(customAction).getByText('Custom')).toBeVisible();
		await expect(
			actions.queryByRole('button', { name: 'Source actions for Improvise' })
		).not.toBeInTheDocument();

		await userEvent.click(
			actions.getByRole('button', { name: 'Source actions for Shield reaction' })
		);
		await userEvent.click(actions.getByRole('menuitem', { name: 'View Spell · Shield' }));
		await expect(canvas.getByRole('status')).toHaveTextContent(
			'Source navigation requested for Spell · Shield'
		);
		await expect(args.onNavigateToSource).toHaveBeenCalledWith({
			kind: 'spell',
			id: 'shield-spell'
		});
	}
};

export const MixedSourceDialogFlow: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action' }));
		const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
			name: 'Add action'
		});
		const picker = within(dialog);
		await expect(picker.getByText('Level 1 · Prepared')).toBeVisible();
		await expect(picker.getAllByText('Spell')[0]).toBeVisible();
		await userEvent.click(picker.getByRole('button', { name: /Arcane Recovery/ }));

		const review = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Review action'
		});
		await userEvent.type(within(review).getByRole('textbox', { name: 'Target' }), 'Self');
		await userEvent.click(within(review).getByRole('button', { name: 'Confirm Action' }));
		await expect(args.onCreateAction).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'Arcane Recovery',
				target: 'Self',
				source: { kind: 'feature', id: 'arcane-recovery' }
			})
		);
	}
};

export const CustomActionFlow: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action' }));
		const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Add action'
		});
		await userEvent.click(within(dialog).getByRole('button', { name: /Create custom action/ }));
		const review = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Review action'
		});
		await userEvent.type(within(review).getByRole('textbox', { name: 'Name' }), 'Distract');
		await userEvent.click(within(review).getByRole('button', { name: 'Confirm Action' }));
		await expect(args.onCreateAction).toHaveBeenCalledWith(
			expect.not.objectContaining({ source: expect.anything() })
		);
	}
};

export const ResyncConfirmationCancelled: Story = {
	args: {
		confirmResync: fn(() => false)
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const actions = within(canvas.getByRole('list', { name: 'Runtime actions' }));
		await userEvent.click(
			actions.getByRole('button', { name: 'Source actions for Longsword attack' })
		);
		await userEvent.click(actions.getByRole('menuitem', { name: 'Resync from source' }));
		await expect(args.confirmResync).toHaveBeenCalledWith(
			'Longsword attack',
			'Inventory · Longsword'
		);
		await expect(args.onResyncAction).not.toHaveBeenCalled();
	}
};

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

export const SearchableClutteredSources: Story = {
	args: {
		initialCharacter: create5e2014Character({ inventory: clutteredItems })
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action' }));
		const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Add action'
		});
		await userEvent.type(within(dialog).getByRole('searchbox'), 'xyz rock');
		await expect(within(dialog).getByText('Random rock')).toBeVisible();
		await expect(within(dialog).queryByText('Rope')).not.toBeInTheDocument();
	}
};

export const NarrowScreen: Story = {
	parameters: {
		viewport: { defaultViewport: 'mobile1' }
	}
};
