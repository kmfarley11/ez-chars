import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';

import ValidatedInputField from '$lib/ui/molecules/validated-input-field.svelte';

const meta = {
	title: 'Design System/Molecules/ValidatedInputField',
	component: ValidatedInputField,
	args: {
		label: 'Character name',
		value: '',
		onValueChange: fn()
	}
} satisfies Meta<typeof ValidatedInputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
	args: {
		required: true
	}
};

export const Invalid: Story = {
	args: {
		validator: (value) => (value.trim() ? undefined : 'Enter a character name')
	}
};
