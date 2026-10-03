import type { Meta, StoryObj } from '@storybook/sveltekit';
import ChipButtonStory from './ChipButtonStory.svelte';

const meta = {
	title: 'Atoms/ChipButton',
	component: ChipButtonStory
} satisfies Meta<typeof ChipButtonStory>;
export default meta;
type Story = StoryObj<typeof meta>;

// One interactive specimen covers action, toggle, and disabled states.
export const Variants: Story = {};
