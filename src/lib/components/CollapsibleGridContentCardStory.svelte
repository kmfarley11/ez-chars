<script lang="ts">
	import CollapsiblePanel from './CollapsiblePanel.svelte';
	import GridContentCard from './GridContentCard.svelte';
	import ResponsiveGrid from './ResponsiveGrid.svelte';

	import type { GridContentData } from '$utils/gridContentTypes';

	let { startsCollapsed = false } = $props<{ startsCollapsed?: boolean }>();

	const mockData: GridContentData = {
		hp: {
			fieldName: 'HP',
			value: 24,
			bindPath: ['hp'],
			capabilities: { canEditValue: true },
			interaction: { editAffordance: 'persistent' }
		},
		ac: {
			fieldName: 'AC',
			value: 16,
			bindPath: ['ac'],
			capabilities: { canEditValue: true },
			interaction: { editAffordance: 'persistent' }
		}
	};
</script>

<div class="p-4" style="max-width: 600px;">
	<CollapsiblePanel heading="Stats" {startsCollapsed}>
		<ResponsiveGrid cols={1} classes="gap-3">
			<GridContentCard data={mockData} />
			<GridContentCard data={mockData} />
		</ResponsiveGrid>
	</CollapsiblePanel>
</div>
