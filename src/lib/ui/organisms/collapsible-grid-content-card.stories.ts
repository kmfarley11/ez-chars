import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollapsibleGridContentCardStory from '$lib/ui/organisms/collapsible-grid-content-card-story.svelte';

const meta = {
	title: 'Design System/Organisms/CollapsibleGridContentCard',
	component: CollapsibleGridContentCardStory,
	args: {
		startsCollapsed: false
	}
} satisfies Meta<typeof CollapsibleGridContentCardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
	args: {
		startsCollapsed: true
	}
};
