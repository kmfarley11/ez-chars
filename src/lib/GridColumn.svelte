<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type GridFlow = 'row' | 'col' | 'auto';
	type GridCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

	interface Props {
		children?: Snippet;
		child?: boolean;
		parent?: boolean;
		rowCount?: number;
		flow?: GridFlow;
		pad?: boolean;
		border?: boolean;
		classes?: string;
	}

	const GRID_LAYER_DEPTH_KEY = 'ez:grid-layer-depth';

	let {
		children = undefined,
		child = false,
		parent = false,
		rowCount = 1,
		flow = 'row',
		pad = false,
		border = false,
		classes = undefined
	}: Props = $props();

	// Share current grid nesting depth so nested GridRow/GridColumn wrappers can render stronger elevation.
	const parentLayerDepth = getContext<number>(GRID_LAYER_DEPTH_KEY) ?? 0;
	const gridLayerDepth = parentLayerDepth + 1;
	setContext(GRID_LAYER_DEPTH_KEY, gridLayerDepth);

	const flowClassMap: Record<GridFlow, string> = {
		row: 'grid-flow-row',
		col: 'grid-flow-col',
		auto: 'grid-flow-row-dense'
	};

	const rowCountClassMap: Record<GridCount, string> = {
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

	const toGridCount = (value: number | undefined, fallback: GridCount): GridCount => {
		if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
		return Math.max(1, Math.min(12, Math.trunc(value))) as GridCount;
	};

	const normalizedFlow = $derived(flow in flowClassMap ? flow : 'row');
	const normalizedRowCount = $derived(toGridCount(rowCount, 1));

	const gridClasses = $derived(
		`grid ${flowClassMap[normalizedFlow]} ${rowCountClassMap[normalizedRowCount]}` +
			(child ? ' grid-child' : '') +
			(parent ? ' grid-parent' : '')
	);
</script>

<div
	class={twMerge(
		'col-span-1',
		pad === true ? 'm-2 p-2' : '',
		border === true ? 'theme-grid-layer rounded-md border' : '',
		classes
	)}
	style={border === true ? `--grid-layer-depth:${gridLayerDepth};` : undefined}
>
	{#if child || parent}
		<div class={gridClasses}>
			{@render children?.()}
		</div>
	{:else}
		{@render children?.()}
	{/if}
</div>
