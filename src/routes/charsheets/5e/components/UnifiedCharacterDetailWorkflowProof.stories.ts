import type { Meta, StoryObj } from '@storybook/sveltekit';
import UnifiedCharacterDetailWorkflowProof from './UnifiedCharacterDetailWorkflowProof.svelte';

const manualReview = (...steps: Array<string>) => ({
	docs: {
		description: {
			story: `**Verify manually:**\n\n${steps.map((step) => `- ${step}`).join('\n')}`
		}
	}
});

const meta = {
	title: 'Organisms/Unified Character Detail Workflow',
	component: UnifiedCharacterDetailWorkflowProof,
	parameters: {
		layout: 'fullscreen'
	}
} satisfies Meta<typeof UnifiedCharacterDetailWorkflowProof>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeTierComparison: Story = {
	parameters: manualReview(
		'Compare Current HP, Temporary HP, and Maximum HP together. Confirm all three use the same compact vertical centering and height, and that Edit, Save/Cancel, and open-detail controls use one centered right-side icon rail without moving neighboring content. Also verify Enter, Escape, tooltips/accessibility names, and returned focus.',
		'Compare Background with Ancestry. Confirm each field keeps metadata badges inline with its label and content below before the open-detail icon. Edit Background authored text and its annotation in one draft; verify invalid empty text commits nothing, removal can be undone, Save is atomic, and Cancel returns to read-first detail before Close restores focus.',
		'Compare Weapons, Armor & Shields, and Other Gear. Confirm all three are compact bullet-list collections with the same Add, Pin/Unpin, and open-detail controls. Add one item from a collection heading, confirm only minimal initial information is requested, and verify successful Add closes the dialog and returns focus to that Add control. Add enough Other Gear to cross five items; confirm search, bounded scrolling, directional fades, and Browse all appear without unbounded sheet growth. Then verify focused Remove requires a separate confirmation before deletion. Open Random rock and verify its long detail, stable identity, annotations, provenance, and references remain intact.',
		'Compare saturated Features with the short Traits collection. Add a General feature, confirm successful Add closes back to the sheet, confirm class-owned feature detail omits Remove, and verify removing the added General feature requires confirmation. Search and scroll Features directly in-sheet, verify directional overflow shading and title-adjacent Owner then Notes badges before supporting content, then preserve a query across focused detail and Back.',
		'Confirm the bounded Spell list has the same directional overflow shading as Features. Search and scroll directly in-sheet; confirm title-adjacent Level, Prepared, then Notes badges remain scannable while Pin stays an action and duplicate Shield identities remain distinct. Open a noted spell to read its notes in context, then use the focused surface for expanded work and confirm its grouping, source context, icon-based immediate Pin/Unpin, and atomic focused draft.',
		'Add a spell from the collection heading, confirm the initial Add surface is record-scoped rather than a bulk editor, successful Add closes and returns focus to Add, and the added record can then be opened and removed from focused detail.',
		'Judge Prepared in both the scan row and focused Edit: decide whether both entry points are justified when they update one canonical state.',
		'Use the same story at desktop, split/narrow desktop, landscape phone, and portrait phone sizes. Confirm the workflow is full-height on phone, never nests dialogs, owns one scroll region, and preserves visible focus and pinch zoom.',
		'Compare the three bounded model summaries and decide whether global or general section Edit solves a task more clearly than the leading three-tier model.'
	)
};
