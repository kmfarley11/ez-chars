import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import InventoryItemPicker from './InventoryItemPicker.svelte';
import type { Item } from '../../schema';

const mockItems: Item[] = [
	{ id: '1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
	{ id: '2', name: 'Rope', equipped: false, notes: '50 feet' },
	{ id: '3', name: 'Health Potion', equipped: false, notes: 'Heals 2d4+2' },
	{ id: '4', name: 'Shield', equipped: true, notes: '+2 AC' }
];

const meta = {
	title: 'Molecules/InventoryItemPicker',
	component: InventoryItemPicker,
	args: {
		items: mockItems,
		onSelect: fn()
	}
} satisfies Meta<typeof InventoryItemPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: {
		items: []
	}
};

export const WithSelected: Story = {
	args: {
		selectedId: '2'
	}
};

export const FilterInteraction: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const searchInput = canvas.getByRole('searchbox');
		await userEvent.type(searchInput, 'sword');
		await expect(canvas.getByText('Longsword')).toBeVisible();
		await expect(canvas.queryByText('Health Potion')).not.toBeInTheDocument();

		await userEvent.clear(searchInput);
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Equipped only' }));
		await expect(canvas.getByText('Longsword')).toBeVisible();
		await expect(canvas.getByText('Shield')).toBeVisible();
		await expect(canvas.queryByText('Rope')).not.toBeInTheDocument();
	}
};
