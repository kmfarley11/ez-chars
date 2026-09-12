import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014SheetNavigationProof from './Dnd5e2014SheetNavigationProof.svelte';

const manualReview = (...steps: Array<string>) => ({
	docs: {
		description: {
			story: `**Verify manually:**\n\n${steps.map((step) => `- ${step}`).join('\n')}`
		}
	}
});

const meta = {
	title: 'Organisms/Dnd5e2014SheetNavigation',
	component: Dnd5e2014SheetNavigationProof,
	args: {
		compactPresentation: 'rail',
		wideBreakpoint: 1280
	},
	argTypes: {
		compactPresentation: {
			control: 'radio',
			options: ['rail', 'drawer']
		},
		wideBreakpoint: {
			control: { type: 'number', min: 960, max: 1600, step: 16 }
		}
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'BL-073 retained sandbox for the 2014-owned landmark hierarchy, generic collapsible-panel seams, binary outline/rail presentation, and nested expansion/focus behavior. Route history, Rules coexistence, saturated data, and browser performance are verified against the application rather than duplicated here.'
			}
		}
	}
} satisfies Meta<typeof Dnd5e2014SheetNavigationProof>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveProof: Story = {
	parameters: manualReview(
		'Use the viewport toolbar near 1024, 1180, 1279, 1280, and 1440 CSS pixels; compare the displayed viewport and usable sheet-workspace measurements and note where the 16rem outline begins to squeeze the sheet.',
		'At a wide width, minify the labeled outline to the 3rem rail and reveal it again; confirm neither state covers required sheet content.',
		'Scroll until the proof measurements banner leaves view. Collapse Runtime, then use the Features & Traits rail shortcut; confirm Runtime and Features & Traits expand, the complete heading remains visible at the top of the viewport, and its heading receives visible focus.',
		'Collapse Abilities & Proficiencies and Features & Traits independently; confirm neither changes the other panel state.',
		'Identify each rail destination using its icon, matching native pointer tooltip, accessible name, and the complete labeled outline; record every icon that needs substitution before route rollout.',
		'Switch to phone portrait and landscape viewports; confirm every persistent control remains fixed-size and reachable without horizontal page overflow.',
		'At a phone viewport, open and dismiss the complete outline with pointer, keyboard, and Escape; confirm focus returns to Show complete sheet outline.',
		'Set compactPresentation to drawer and compare that single-trigger fallback with the preferred persistent phone rail; record which presentation is clearer.'
	)
};
