<script lang="ts">
	import BaseButton from './BaseButton.svelte';

	// Controlled button presentation: omission of selected means an ordinary action.
	let {
		label,
		selected,
		disabled = false,
		onclick
	}: {
		label: string;
		selected?: boolean;
		disabled?: boolean;
		onclick?: () => void;
	} = $props();
	const classes = 'min-h-8 rounded-full px-2.5 py-1 text-xs font-semibold shadow-none ring-0';
</script>

<BaseButton
	size="sm"
	{classes}
	{disabled}
	{onclick}
	ariaPressed={selected}
	shadingVariant={selected ? 'dark' : 'light'}
>
	<span>{label}</span>
</BaseButton>
