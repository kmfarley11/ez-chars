<script lang="ts">
	import ResponsiveGrid from './ResponsiveGrid.svelte';

	let { cols = 1, colsSm = undefined, colsMd = undefined, colsLg = undefined } = $props();
</script>

<div class="theme-panel bg-white p-4">
	<ResponsiveGrid {cols} {colsSm} {colsMd} {colsLg}>
		<div
			class="h-16 w-full rounded border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center"
		>
			1
		</div>
		<div
			class="h-16 w-full rounded border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center"
		>
			2
		</div>
		<div
			class="h-16 w-full rounded border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center"
		>
			3
		</div>
		<div
			class="h-16 w-full rounded border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center"
		>
			4
		</div>
		<div
			class="h-16 w-full rounded border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center"
		>
			5
		</div>
		<div
			class="h-16 w-full rounded border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center"
		>
			6
		</div>
	</ResponsiveGrid>
</div>
