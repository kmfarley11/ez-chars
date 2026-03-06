<script>
	import { twMerge } from 'tailwind-merge';

	// flow = col, auto, row
	let {
		children = undefined,
		child = false,
		parent = false,
		colCount = 1,
		colCountMd = undefined,
		colCountLg = undefined,
		flow = 'col',
		pad = false,
		border = false,
		classes = undefined
	} = $props();

	/** @type {Record<string, string>} */
	const flowClassMap = {
		col: 'grid-flow-col',
		row: 'grid-flow-row',
		auto: 'grid-flow-col-dense'
	};

	/** @type {Record<string, string>} */
	const colCountClassMap = {
		'1': 'grid-cols-1',
		'2': 'grid-cols-2',
		'3': 'grid-cols-3',
		'4': 'grid-cols-4',
		'5': 'grid-cols-5',
		'6': 'grid-cols-6',
		'7': 'grid-cols-7',
		'8': 'grid-cols-8',
		'9': 'grid-cols-9',
		'10': 'grid-cols-10',
		'11': 'grid-cols-11',
		'12': 'grid-cols-12'
	};

	const normalizedFlow = $derived(flowClassMap[flow] ? flow : 'col');
	const normalizedColCount = $derived(
		Number.isFinite(colCount) ? Math.max(1, Math.min(12, Math.trunc(colCount))) : 1
	);
	const normalizedColCountMd = $derived(
		Number.isFinite(colCountMd) ? Math.max(1, Math.min(12, Math.trunc(colCountMd))) : undefined
	);
	const normalizedColCountLg = $derived(
		Number.isFinite(colCountLg) ? Math.max(1, Math.min(12, Math.trunc(colCountLg))) : undefined
	);

	let gridClasses = $derived(
		`grid ${flowClassMap[normalizedFlow]} ${colCountClassMap[String(normalizedColCount)]}` +
			(normalizedColCountMd ? ` md:${colCountClassMap[String(normalizedColCountMd)]}` : '') +
			(normalizedColCountLg ? ` lg:${colCountClassMap[String(normalizedColCountLg)]}` : '') +
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
