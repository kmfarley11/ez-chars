import type { Meta, StoryObj } from '@storybook/sveltekit';
import type { seedChars } from '$fixtures/characters';
import type { emptyChar } from '$storage/store';
import type { ButtonSize } from '$utils/buttonTypes';

import BaseButtonStory from './BaseButtonStory.svelte';

// Keep the catalog build's SvelteKit alias coverage explicit without loading app state.
type StorybookAliasCoverage = [typeof seedChars, typeof emptyChar, ButtonSize];

const meta = {
	title: 'Atoms/BaseButton',
	component: BaseButtonStory,
	args: {
		label: 'Continue'
	}
} satisfies Meta<typeof BaseButtonStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkLarge: Story = {
	args: {
		label: 'Save character',
		shadingVariant: 'dark',
		size: 'lg'
	}
};

export const Disabled: Story = {
	args: {
		label: 'Unavailable',
		disabled: true
	}
};

export const IconOnly: Story = {
	args: {
		iconOnly: true,
		ariaLabel: 'Add a character'
	}
};
