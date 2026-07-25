import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import InventoryActionDialog from './InventoryActionDialog.svelte';
import type { Item } from '../../../../schema';

const mockItems: Item[] = [
	{ id: '1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
	{ id: '2', name: 'Rope', equipped: false, notes: '50 feet' }
];

const mockSuggestions = async (items: ReadonlyArray<Item>) => {
	return items.map((item) => ({
		name: item.name,
		notes: item.notes,
		source: { kind: 'item' as const, id: item.id }
	}));
};

const mockErrorSuggestions = async () => {
	throw new Error('Failed to load');
};

const meta = {
	title: 'Organisms/InventoryActionDialog',
	component: InventoryActionDialog,
	args: {
		open: true,
		inventory: mockItems,
		loadSuggestions: mockSuggestions,
		onConfirm: fn(),
		onClose: fn()
	}
} satisfies Meta<typeof InventoryActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyInventory: Story = {
	args: {
		inventory: []
	}
};

export const LoadingError: Story = {
	args: {
		loadSuggestions: mockErrorSuggestions
	}
};

export const Interaction: Story = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement.parentElement!);

		await step('Select item to proceed to draft step', async () => {
			const longswordBtn = await canvas.findByText('Longsword');
			await userEvent.click(longswordBtn);
			await expect(canvas.getByText('Customize Action')).toBeVisible();
			await expect(canvas.getByRole('textbox', { name: /name/i })).toHaveValue('Longsword');
		});

		await step('Go back to item selection', async () => {
			const backBtn = canvas.getByRole('button', { name: 'Back' });
			await userEvent.click(backBtn);
			await expect(canvas.getByText('Select Inventory Item')).toBeVisible();
		});
	}
};
