import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridPrimitiveFieldStory from '$lib/ui/molecules/grid-primitive-field-story.svelte';

const meta = {
	id: 'design-system-molecules-edit-first-fields-tier-1',
	title: 'Design System/Molecules/Edit-first (Tier 1 Field)',
	component: GridPrimitiveFieldStory,
	args: {
		kind: 'number',
		withAnnotation: false,
		editAffordance: 'persistent'
	}
} satisfies Meta<typeof GridPrimitiveFieldStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Annotated: Story = {
	args: { withAnnotation: true }
};

export const QuietAffordance: Story = {
	args: { kind: 'text', editAffordance: 'hover' }
};
