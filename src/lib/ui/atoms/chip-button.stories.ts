import type { Meta, StoryObj } from '@storybook/sveltekit';
import ChipButtonStory from '$lib/ui/atoms/chip-button-story.svelte';

const meta = {
	title: 'Design System/Atoms/ChipButton',
	component: ChipButtonStory
} satisfies Meta<typeof ChipButtonStory>;
export default meta;
type Story = StoryObj<typeof meta>;

// One interactive specimen covers action, toggle, and disabled states.
export const Variants: Story = {};
