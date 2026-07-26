import type { Meta, StoryObj } from '@storybook/sveltekit';
import Badge from './Badge.svelte';

const meta = {
	title: 'Atoms/Badge',
	component: Badge,
	args: {
		label: 'Inventory'
	}
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Custom: Story = {
	args: {
		label: 'Custom'
	}
};
