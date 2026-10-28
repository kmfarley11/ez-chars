import type { Meta, StoryObj } from '@storybook/sveltekit';
import NoticeBanner from './notice-banner.svelte';

const meta = {
	title: 'Design System/Molecules/Notice Banner',
	component: NoticeBanner,
	args: {
		title: 'Preview — review scope',
		message: 'Review the available controls. Additional content is planned after approval.',
		tone: 'orange',
		role: 'note'
	},
	argTypes: {
		tone: { control: 'select', options: ['amber', 'orange'] },
		role: { control: 'select', options: ['note', 'alert'] },
		children: { control: false }
	}
} satisfies Meta<typeof NoticeBanner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
