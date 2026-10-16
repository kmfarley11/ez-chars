import type { Meta, StoryObj } from '@storybook/sveltekit';
import Badge from '$lib/ui/atoms/badge.svelte';

const meta = {
	title: 'Design System/Atoms/Badge',
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
