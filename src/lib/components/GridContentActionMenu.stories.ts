import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridContentActionMenuStory from './GridContentActionMenuStory.svelte';

const meta = {
	title: 'Molecules/GridContentActionMenu',
	component: GridContentActionMenuStory,
	args: {
		canEdit: true
	}
} satisfies Meta<typeof GridContentActionMenuStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReadOnly: Story = {
	args: { canEdit: false }
};
