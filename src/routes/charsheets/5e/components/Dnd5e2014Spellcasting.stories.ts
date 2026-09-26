import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014SectionCompositionStory from './Dnd5e2014SectionCompositionStory.svelte';

const meta = {
	title: 'Organisms/Dnd5e2014Spellcasting',
	component: Dnd5e2014SectionCompositionStory,
	args: { section: 'spellcasting' }
} satisfies Meta<typeof Dnd5e2014SectionCompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedCharacter: Story = {
	parameters: {
		docs: {
			description: {
				story: `**Verify manually:**

- Confirm Ability, Save DC, and Attack Bonus read as one quiet summary and remain editable through Detail then Edit.
- Edit Used and Max independently within one spell-slot level; confirm both values stay left-aligned, each row keeps Edit and Notes together, the level card preserves its geometry, and the group does not expose a redundant Detail action.
- Confirm the saturated spell collection remains scan-first with search, level groups, Prepared metadata, row-level Pin/Unpin, Detail, and Add.
- Confirm no redundant Manage Pins action competes with the promoted row-level priority control.
- Repeat with desktop, split-screen, and phone viewports.`
			}
		}
	}
};
