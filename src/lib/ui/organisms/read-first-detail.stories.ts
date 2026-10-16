import type { Meta, StoryObj } from '@storybook/sveltekit';
import ReadFirstDetailStory from './read-first-detail-story.svelte';
const meta = {
	id: 'design-system-organisms-read-first-detail',
	title: 'Design System/Organisms/Read-first Detail (Tier 2 Field)',
	component: ReadFirstDetailStory
} satisfies Meta<typeof ReadFirstDetailStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const IndependentEdits: Story = {};
