import type { Meta, StoryObj } from '@storybook/sveltekit';
import type { seedChars } from '../../../fixtures/characters';
import type { emptyChar } from '$lib/storage/store';
import type { ButtonSize } from '$lib/utils/buttonTypes';

import BaseButtonStory from '$lib/ui/atoms/base-button-story.svelte';

// Keep the catalog build's SvelteKit alias coverage explicit without loading app state.
type StorybookAliasCoverage = [typeof seedChars, typeof emptyChar, ButtonSize];

const meta = {
	title: 'Design System/Atoms/BaseButton',
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

export const Compact: Story = {
	args: {
		label: 'Card action',
		size: 'sm'
	}
};

export const CompactIconOnly: Story = {
	args: {
		size: 'sm',
		iconOnly: true,
		ariaLabel: 'Open card actions'
	}
};
