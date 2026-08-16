<script lang="ts">
	import CollapsiblePanel from './CollapsiblePanel.svelte';

	interface Props {
		heading: string;
		startsCollapsed?: boolean;
	}
	let { heading, startsCollapsed = false }: Props = $props();
</script>

<div class="p-4" style="max-width: 600px;">
	<CollapsiblePanel {heading} {startsCollapsed}>
		<div class="p-4 text-center">
			<p>Content goes here</p>
		</div>
	</CollapsiblePanel>
</div>
