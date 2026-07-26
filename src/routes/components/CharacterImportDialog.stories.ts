import type { Meta, StoryObj } from '@storybook/sveltekit';
import CharacterImportDialog from './CharacterImportDialog.svelte';
import { fn } from 'storybook/test';

const meta = {
	title: 'Organisms/CharacterImportDialog',
	component: CharacterImportDialog,
	args: {
		open: true,
		state: 'reading',
		onmerge: fn(),
		onreplace: fn(),
		onclose: fn()
	}
} satisfies Meta<typeof CharacterImportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reading: Story = {};

export const ErrorState: Story = {
	args: {
		state: 'error',
		errorMessage: 'That file is not valid JSON.'
	}
};

export const Ready: Story = {
	args: {
		state: 'ready',
		characterCount: 3
	}
};

export const Success: Story = {
	args: {
		state: 'success',
		successMessage: 'Merged 3 new characters.'
	}
};
