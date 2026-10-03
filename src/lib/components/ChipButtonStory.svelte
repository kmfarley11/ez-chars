<script lang="ts">
	import ChipButton from './ChipButton.svelte';
	let selected = $state(false);
</script>

<div class="theme-dialog space-y-3 rounded-md border p-3">
	<p class="theme-text-muted text-sm">
		Toggle Reaction with click, Space, or Enter. Its size should stay fixed. Clear selection is an
		action, not a toggle. Selection changes shading without adding an icon or shifting the label.
	</p>
	<div class="flex flex-wrap items-center gap-2">
		<ChipButton label="Reaction" {selected} onclick={() => (selected = !selected)} />
		<ChipButton label="Clear selection" disabled={!selected} onclick={() => (selected = false)} />
		<ChipButton label="Unavailable choice" selected={false} disabled />
	</div>
</div>
