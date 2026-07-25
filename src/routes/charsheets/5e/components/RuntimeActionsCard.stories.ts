import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { RuntimeActionSuggestion } from '$lib/compendium/dnd5e2014/suggestInventoryRuntimeActions';
import { create5e2014Character } from '../../../../schema';
import RuntimeActionsCardStoryHarness from './RuntimeActionsCardStoryHarness.svelte';

const character = create5e2014Character({
	inventory: [
		{ id: 'sword-1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
		{ id: 'rope-1', name: 'Rope', equipped: false, notes: '50 feet' },
		{ id: 'shield-1', name: 'Shield', equipped: true, notes: '+2 AC' }
	],
	systemData: {
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
				id: 'custom-action',
				name: 'Improvise',
				timing: 'bonusAction',
				category: 'effect'
			}
		]
	}
});
const suggestions: RuntimeActionSuggestion[] = character.inventory.map((item) => ({
	name: item.name,
	notes: item.notes,
	source: { kind: 'item', id: item.id }
}));

const meta = {
	title: 'Organisms/RuntimeActionsCard',
	component: RuntimeActionsCardStoryHarness,
	args: {
		initialCharacter: character,
		loadSuggestions: async () => suggestions,
		onEditSavePatches: fn(),
		onAcceptSuggestion: fn(),
		onResyncAction: fn(),
		onNavigateToSource: fn()
	}
} satisfies Meta<typeof RuntimeActionsCardStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InteractivePlayground: Story = {};

export const LinkedAndCustom: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const actionList = within(canvas.getByRole('list', { name: 'Runtime actions' }));
		await expect(actionList.getByText('Player-authored strike note.')).toBeVisible();
		await expect(actionList.getAllByText('Longsword attack', { exact: true })).toHaveLength(1);
		await expect(actionList.getByText(/Bonus action/)).toBeVisible();
		await expect(
			actionList.queryByRole('button', { name: 'Source actions for Improvise' })
		).not.toBeInTheDocument();

		await userEvent.click(
			actionList.getByRole('button', { name: 'Source actions for Longsword attack' })
		);
		await userEvent.click(actionList.getByRole('menuitem', { name: 'View Longsword' }));
		await expect(canvas.getByRole('status')).toHaveTextContent(
			'Source navigation requested for Longsword'
		);
		await expect(args.onNavigateToSource).toHaveBeenCalledWith('sword-1');
	}
};

export const DialogFlow: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));

		const document = canvasElement.ownerDocument;
		const dialog = await within(document.body).findByRole('dialog', {
			name: 'Select Inventory Item'
		});

		await expect(dialog).toBeVisible();

		const dialogWithin = within(dialog);
		await expect(await dialogWithin.findByText('Longsword')).toBeVisible();
		await userEvent.click(dialogWithin.getByRole('button', { name: /Longsword/ }));

		// Step 2
		const customizeDialog = within(document.body).getByRole('dialog', { name: 'Customize Action' });
		await expect(customizeDialog).toBeVisible();

		const customizeWithin = within(customizeDialog);
		await userEvent.type(customizeWithin.getByRole('textbox', { name: 'Target' }), 'Self');

		await userEvent.click(customizeWithin.getByRole('button', { name: 'Confirm Action' }));
		await expect(args.onAcceptSuggestion).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Longsword', target: 'Self' })
		);
	}
};

export const DialogBackNavigation: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));

		const document = canvasElement.ownerDocument;

		const dialog = await within(document.body).findByRole('dialog', {
			name: 'Select Inventory Item'
		});
		const dialogWithin = within(dialog);

		await userEvent.click(dialogWithin.getByRole('button', { name: /Longsword/ }));

		const customizeDialog = within(document.body).getByRole('dialog', { name: 'Customize Action' });
		const customizeWithin = within(customizeDialog);
		await userEvent.click(customizeWithin.getByRole('button', { name: 'Back' }));

		const dialogAgain = within(document.body).getByRole('dialog', {
			name: 'Select Inventory Item'
		});
		await expect(dialogAgain).toBeVisible();
		const searchInput = within(dialogAgain).getByRole('searchbox');
		await userEvent.type(searchInput, 'rope');
		await expect(within(dialogAgain).getByText('Selected (Filtered)')).toBeVisible();
	}
};

export const EmptyInventory: Story = {
	args: {
		initialCharacter: create5e2014Character({ inventory: [] })
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));

		const document = canvasElement.ownerDocument;
		const dialog = within(document.body).getByRole('dialog', { name: 'Select Inventory Item' });
		await expect(within(dialog).getByText('Your inventory is empty.')).toBeVisible();
	}
};

export const LoadingState: Story = {
	args: {
		loadSuggestions: () => new Promise(() => {}) // never resolves
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));

		const document = canvasElement.ownerDocument;
		const dialog = within(document.body).getByRole('dialog', { name: 'Select Inventory Item' });
		await expect(within(dialog).getByText('Loading inventory items…')).toBeVisible();
	}
};

export const ErrorState: Story = {
	args: {
		loadSuggestions: () => Promise.reject(new Error('Failed'))
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));

		const document = canvasElement.ownerDocument;
		const dialog = await within(document.body).findByRole('dialog', {
			name: 'Select Inventory Item'
		});
		await expect(await within(dialog).findByText('Failed to load suggestions')).toBeVisible();
	}
};

const clutteredItems = [
	{ id: 'clutter-longsword', name: 'Longsword', equipped: true, notes: '1d8 slashing damage' },
	{ id: 'clutter-shield', name: 'Shield', equipped: true, notes: '+2 AC' },
	{ id: 'clutter-tools', name: "Thieves' tools", equipped: true, notes: 'For locks and traps' },
	{ id: 'clutter-rope', name: 'Rope', quantity: 2, notes: '50 feet of hempen rope' },
	{ id: 'clutter-bucket', name: 'Bucket', notes: 'Wooden, slightly dented' },
	{ id: 'clutter-rock', name: 'Random rock', notes: 'Found in the XYZ dungeon' },
	{
		id: 'clutter-potion',
		name: 'Potion of Healing',
		quantity: 2,
		notes: 'Regain 2d4 + 2 hit points'
	},
	{ id: 'clutter-chalk', name: 'Chalk', quantity: 10, notes: 'White sticks for markings' },
	{ id: 'clutter-rations', name: 'Rations', quantity: 7, notes: 'One day of travel food' },
	{ id: 'clutter-oil', name: 'Flask of oil', quantity: 4, notes: 'Burns for 6 hours' },
	{ id: 'clutter-hook', name: 'Grappling hook', notes: 'Iron hook and 50 feet of rope' },
	{ id: 'clutter-waterskin', name: 'Waterskin', notes: 'Holds 4 pints' },
	{ id: 'clutter-spellbook', name: 'Spellbook', notes: 'Ink-stained travel journal' },
	{ id: 'clutter-key', name: 'Old brass key', notes: 'Marked with a crescent moon' }
];

export const ClutteredInventory: Story = {
	args: {
		initialCharacter: create5e2014Character({ inventory: clutteredItems }),
		loadSuggestions: async () =>
			clutteredItems.map((i) => ({
				name: i.name,
				notes: i.notes,
				source: { kind: 'item' as const, id: i.id }
			}))
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));

		const document = canvasElement.ownerDocument;
		const dialog = await within(document.body).findByRole('dialog', {
			name: 'Select Inventory Item'
		});
		const searchInput = within(dialog).getByRole('searchbox');

		await userEvent.type(searchInput, 'xyz rock');
		await expect(within(dialog).getByText('Random rock')).toBeVisible();
		await expect(within(dialog).queryByText('Rope')).not.toBeInTheDocument();
	}
};
