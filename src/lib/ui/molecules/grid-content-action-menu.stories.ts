import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridContentActionMenuStory from '$lib/ui/molecules/grid-content-action-menu-story.svelte';

const meta = {
	title: 'Design System/Molecules/GridContentActionMenu',
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
