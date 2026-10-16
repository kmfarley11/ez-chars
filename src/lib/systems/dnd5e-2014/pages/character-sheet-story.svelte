<script lang="ts">
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import CanonicalSheetHost from './canonical-sheet-host.svelte';
	let { fixture }: { fixture: CharacterDocument5e2014 } = $props();
</script>

<!-- Fixture switching replaces dialogs, navigation and rejection controls too. -->
{#key fixture}
	<CanonicalSheetHost {fixture} />
{/key}
