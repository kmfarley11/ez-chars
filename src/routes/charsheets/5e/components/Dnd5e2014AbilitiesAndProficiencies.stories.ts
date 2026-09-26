import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014SectionCompositionStory from './Dnd5e2014SectionCompositionStory.svelte';

const meta = {
	title: 'Organisms/Dnd5e2014AbilitiesAndProficiencies',
	component: Dnd5e2014SectionCompositionStory,
	args: { section: 'abilities-proficiencies' }
} satisfies Meta<typeof Dnd5e2014SectionCompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedCharacter: Story = {
	parameters: {
		docs: {
			description: {
				story: `**Verify manually:**

- Confirm Prof. Bonus fills its full-width bounded row, exposes exactly one field-level Detail action, and reaches the authored value and notes through Detail then Edit.
- Confirm all six ability cards align in a readable one-, two-, or three-column grid without clipped skill labels or horizontal overflow.
- Open an ability card, inspect score, modifier, saving throw, and skills, then Edit and Cancel back to the same detail.
- Confirm Languages and Tools keep compact rows, expose Add at the collection heading, and use only row-level Pin/Unpin for priority.
- Repeat with desktop, split-screen, and phone viewports.`
			}
		}
	}
};

export const RejectedFocusedSave: Story = {
	args: { rejectMutations: true },
	parameters: {
		docs: {
			description: {
				story: `**Verify manually:**

- Open Prof. Bonus, choose Edit, change the value, and choose Save.
- Confirm the focused workflow remains in Edit with actionable feedback and preserves the draft.
- Cancel back to Detail, then Close and confirm focus returns to the Prof. Bonus detail control.`
			}
		}
	}
};
