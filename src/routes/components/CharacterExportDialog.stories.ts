import type { Meta, StoryObj } from '@storybook/sveltekit';
import CharacterExportDialog from './CharacterExportDialog.svelte';
import { fn } from 'storybook/test';

const meta = {
	title: 'Organisms/CharacterExportDialog',
	component: CharacterExportDialog,
	args: {
		open: true,
		characterCount: 3,
		onconfirm: fn(),
		onclose: fn()
	}
} satisfies Meta<typeof CharacterExportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
