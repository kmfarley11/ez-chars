import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollapsibleGridContentCardStory from './CollapsibleGridContentCardStory.svelte';

const meta = {
	title: 'Organisms/CollapsibleGridContentCard',
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
