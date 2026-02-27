<script>
	import { twMerge } from 'tailwind-merge';

	// flow = col, auto, row
	let {
		children = undefined,
		child = false,
		parent = false,
		colCount = 1,
		flow = 'col',
		pad = false,
		border = false,
		classes = undefined
	} = $props();

	let gridClasses = $derived(
		`grid grid-flow-${flow} grid-cols-${colCount}` +
			(child ? ' grid-child' : '') +
			(parent ? ' grid-parent' : '')
	);
</script>

<div
	class={twMerge(
		'row-span-1',
		pad === true ? 'm-2 p-2' : '',
		border === true ? 'rounded-md border' : '',
		classes
	)}
>
	{#if child || parent}
		<div class={gridClasses}>
			{@render children?.()}
		</div>
	{:else}
		{@render children?.()}
	{/if}
</div>
