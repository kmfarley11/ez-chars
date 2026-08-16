<script lang="ts">
	import PanelSurface from './PanelSurface.svelte';

	let { nested = false } = $props();
</script>

<div class="p-8">
	<PanelSurface>
		<p class="mb-4">This is a top-level panel surface.</p>
		{#if nested}
			<PanelSurface>
				<p>This is a nested panel surface with deeper elevation.</p>
			</PanelSurface>
		{/if}
	</PanelSurface>
</div>
