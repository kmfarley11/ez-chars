<script>
	import { twMerge } from 'tailwind-merge';

	// flow = row, auto, col
	let {
		children = undefined,
		child = false,
		parent = false,
		rowCount = 1,
		flow = 'row',
		pad = false,
		border = false,
        classes = undefined
	} = $props();

	let gridClasses = $state(`grid grid-flow-${flow} grid-rows-${rowCount}`);
	if (child) gridClasses += 'grid-child';
	if (parent) gridClasses += 'grid-parent';
</script>

<div
	class={twMerge(
		'col-span-1',
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
