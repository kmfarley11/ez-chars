import type { Meta, StoryObj } from '@storybook/sveltekit';
import TableStory from './table-story.svelte';

const meta = {
	title: 'Design System/Molecules/Table',
	component: TableStory
} satisfies Meta<typeof TableStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Composition: Story = {};
