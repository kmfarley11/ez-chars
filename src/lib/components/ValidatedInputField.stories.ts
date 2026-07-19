import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';

import ValidatedInputField from './ValidatedInputField.svelte';

const meta = {
	title: 'Molecules/ValidatedInputField',
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

export const TypingNotifiesTheOwner: Story = {
	args: {
		onValueChange: fn()
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('textbox', { name: 'Character name' });

		await userEvent.type(input, 'Aster');

		await expect(args.onValueChange).toHaveBeenLastCalledWith('Aster');
	}
};
