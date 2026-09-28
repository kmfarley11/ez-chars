import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014SectionCompositionStory from './Dnd5e2014SectionCompositionStory.svelte';

const meta = {
	title: 'Organisms/Dnd5e2014AbilitiesAndProficiencies',
	component: Dnd5e2014SectionCompositionStory,
	args: { section: 'abilities-proficiencies', entryStyle: 'label' },
	argTypes: { entryStyle: { control: 'select', options: ['button', 'label', 'chevron', 'group'] } }
} satisfies Meta<typeof Dnd5e2014SectionCompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedCharacter: Story = {
	parameters: {
		docs: {
			description: {
				story: `**Verify manually:**

- Confirm Prof. Bonus fills its full-width bounded row. Its label and field chevron open the same authored detail and highlight the requested value.
- Confirm all six ability cards align in a readable one-, two-, or three-column grid without clipped skill labels or horizontal overflow.
- BL-085: use Score, Modifier, a skill, and the CON Save labels to open the parent Detail with that field highlighted. Group > opens an unhighlighted overview. In Controls compare button, label (underlined), chevron, and group. Values remain selectable.
- Edit and save Score, edit Athletics and Cancel; Score remains saved, Athletics stays unchanged, and no outer Save appears.
- Start a dirty edit, choose another Edit or Close/Back/Escape, and try all three resolution choices. Add/Edit/Remove one note, Undo removal, then confirm it.
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
- Confirm the local editor retains actionable feedback and the draft. Try Close then Save and continue: it must also reject without losing your work.
- Cancel back to Detail, then Close and confirm focus returns to the Prof. Bonus detail control.`
			}
		}
	}
};
