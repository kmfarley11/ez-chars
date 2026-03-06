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

	/** @type {Record<string, string>} */
	const flowClassMap = {
		row: 'grid-flow-row',
		col: 'grid-flow-col',
		auto: 'grid-flow-row-dense'
	};

	/** @type {Record<string, string>} */
	const rowCountClassMap = {
		'1': 'grid-rows-1',
		'2': 'grid-rows-2',
		'3': 'grid-rows-3',
		'4': 'grid-rows-4',
		'5': 'grid-rows-5',
		'6': 'grid-rows-6',
		'7': 'grid-rows-7',
		'8': 'grid-rows-8',
		'9': 'grid-rows-9',
		'10': 'grid-rows-10',
		'11': 'grid-rows-11',
		'12': 'grid-rows-12'
	};

	const normalizedFlow = $derived(flowClassMap[flow] ? flow : 'row');
	const normalizedRowCount = $derived(
		Number.isFinite(rowCount) ? Math.max(1, Math.min(12, Math.trunc(rowCount))) : 1
	);

	let gridClasses = $derived(
		`grid ${flowClassMap[normalizedFlow]} ${rowCountClassMap[String(normalizedRowCount)]}` +
			(child ? ' grid-child' : '') +
			(parent ? ' grid-parent' : '')
	);
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
