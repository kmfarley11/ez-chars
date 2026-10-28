<script lang="ts">
	import type { CharacterDocument5e2024 } from '../../../../schema/system-5e2024';
	import CanonicalSheetHost from './canonical-sheet-host.svelte';
	let { fixture }: { fixture: CharacterDocument5e2024 } = $props();
</script>

{#key fixture}<CanonicalSheetHost {fixture} />{/key}
