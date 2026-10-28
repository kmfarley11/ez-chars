<script lang="ts">
	import CollapsiblePanel from '$lib/ui/molecules/collapsible-panel.svelte';
	import GridContentCard from '$lib/ui/organisms/grid-content-card.svelte';
	import ResponsiveGrid from '$lib/ui/molecules/responsive-grid.svelte';

	import type { GridContentData } from '$lib/utils/gridContentTypes';

	let { startsCollapsed = false }: { startsCollapsed?: boolean } = $props();

	const mockData: GridContentData = {
		hp: {
			fieldName: 'HP',
			value: 24,
			bindPath: ['hp'],
			capabilities: { canEditValue: true },
			interaction: { tier: 'runtime', editAffordance: 'persistent' }
		},
		ac: {
			fieldName: 'AC',
			value: 16,
			bindPath: ['ac'],
			capabilities: { canEditValue: true },
			interaction: { tier: 'runtime', editAffordance: 'persistent' }
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
