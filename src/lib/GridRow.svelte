<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type GridFlow = 'col' | 'row' | 'auto';
	type GridCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
	type ColCountClassSet = { base: string; sm: string; md: string; lg: string };

	interface Props {
		children?: Snippet;
		child?: boolean;
		parent?: boolean;
		colCount?: number;
		colCountSm?: number;
		colCountMd?: number;
		colCountLg?: number;
		flow?: GridFlow;
		pad?: boolean;
		border?: boolean;
		classes?: string;
		collapsible?: boolean;
		defaultCollapsed?: boolean;
		collapseLabel?: string;
	}

	const GRID_LAYER_DEPTH_KEY = 'ez:grid-layer-depth';

	let {
		children = undefined,
		child = false,
		parent = false,
		colCount = 1,
		colCountSm = undefined,
		colCountMd = undefined,
		colCountLg = undefined,
		flow = 'col',
		pad = false,
		border = false,
		classes = undefined,
		collapsible = undefined,
		defaultCollapsed = false,
		collapseLabel = undefined
	}: Props = $props();

	// Share current grid nesting depth so nested GridRow/GridColumn wrappers can render stronger elevation.
	const parentLayerDepth = getContext<number>(GRID_LAYER_DEPTH_KEY) ?? 0;
	const gridLayerDepth = parentLayerDepth + 1;
	setContext(GRID_LAYER_DEPTH_KEY, gridLayerDepth);

	const flowClassMap: Record<GridFlow, string> = {
		col: 'grid-flow-col',
		row: 'grid-flow-row',
		auto: 'grid-flow-col-dense'
	};

	// Keep every utility as a literal so Tailwind can statically detect and emit responsive classes.
	const colCountClassMap: Record<GridCount, ColCountClassSet> = {
		'1': { base: 'grid-cols-1', sm: 'sm:grid-cols-1', md: 'md:grid-cols-1', lg: 'lg:grid-cols-1' },
		'2': { base: 'grid-cols-2', sm: 'sm:grid-cols-2', md: 'md:grid-cols-2', lg: 'lg:grid-cols-2' },
		'3': { base: 'grid-cols-3', sm: 'sm:grid-cols-3', md: 'md:grid-cols-3', lg: 'lg:grid-cols-3' },
		'4': { base: 'grid-cols-4', sm: 'sm:grid-cols-4', md: 'md:grid-cols-4', lg: 'lg:grid-cols-4' },
		'5': { base: 'grid-cols-5', sm: 'sm:grid-cols-5', md: 'md:grid-cols-5', lg: 'lg:grid-cols-5' },
		'6': { base: 'grid-cols-6', sm: 'sm:grid-cols-6', md: 'md:grid-cols-6', lg: 'lg:grid-cols-6' },
		'7': { base: 'grid-cols-7', sm: 'sm:grid-cols-7', md: 'md:grid-cols-7', lg: 'lg:grid-cols-7' },
		'8': { base: 'grid-cols-8', sm: 'sm:grid-cols-8', md: 'md:grid-cols-8', lg: 'lg:grid-cols-8' },
		'9': { base: 'grid-cols-9', sm: 'sm:grid-cols-9', md: 'md:grid-cols-9', lg: 'lg:grid-cols-9' },
		'10': {
			base: 'grid-cols-10',
			sm: 'sm:grid-cols-10',
			md: 'md:grid-cols-10',
			lg: 'lg:grid-cols-10'
		},
		'11': {
			base: 'grid-cols-11',
			sm: 'sm:grid-cols-11',
			md: 'md:grid-cols-11',
			lg: 'lg:grid-cols-11'
		},
		'12': {
			base: 'grid-cols-12',
			sm: 'sm:grid-cols-12',
			md: 'md:grid-cols-12',
			lg: 'lg:grid-cols-12'
		}
	};

	const toGridCount = (value: number | undefined, fallback: GridCount): GridCount => {
		if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
		return Math.max(1, Math.min(12, Math.trunc(value))) as GridCount;
	};

	const toOptionalGridCount = (value: number | undefined): GridCount | undefined => {
		if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
		return toGridCount(value, 1);
	};

	const getColCountClassSet = (count: GridCount): ColCountClassSet => colCountClassMap[count];

	const normalizedFlow = $derived(flow in flowClassMap ? flow : 'col');
	const normalizedColCount = $derived(toGridCount(colCount, 1));
	const normalizedColCountSm = $derived(toOptionalGridCount(colCountSm));
	const normalizedColCountMd = $derived(toOptionalGridCount(colCountMd));
	const normalizedColCountLg = $derived(toOptionalGridCount(colCountLg));
	const isCollapsible = $derived(
		typeof collapsible === 'boolean' ? collapsible : parent === true && border === true
	);
	const collapseControlLabel = $derived(
		typeof collapseLabel === 'string' && collapseLabel.trim().length > 0
			? ` ${collapseLabel.trim()}`
			: ''
	);
	let isCollapsed = $derived(defaultCollapsed);

	const gridClasses = $derived(
		`grid ${flowClassMap[normalizedFlow]} ${getColCountClassSet(normalizedColCount).base}` +
			(normalizedColCountSm ? ` ${getColCountClassSet(normalizedColCountSm).sm}` : '') +
			(normalizedColCountMd ? ` ${getColCountClassSet(normalizedColCountMd).md}` : '') +
			(normalizedColCountLg ? ` ${getColCountClassSet(normalizedColCountLg).lg}` : '') +
			(child ? ' grid-child' : '') +
			(parent ? ' grid-parent' : '')
	);

	$effect(() => {
		if (!isCollapsible) {
			isCollapsed = false;
		}
	});

	const onToggleCollapse = () => {
		isCollapsed = !isCollapsed;
	};
</script>

<div
	class={twMerge(
		'row-span-1',
		pad === true ? 'm-2 p-2' : '',
		border === true ? 'theme-grid-layer rounded-md border' : '',
		classes
	)}
	style={border === true ? `--grid-layer-depth:${gridLayerDepth};` : undefined}
>
	{#if child || parent}
		{#if isCollapsible}
			<div class="mb-1 flex justify-end">
				<button
					type="button"
					class="theme-btn-light btn rounded-sm border px-2 py-0.5 text-xs"
					aria-expanded={!isCollapsed}
					aria-label={isCollapsed
						? `Expand${collapseControlLabel}`
						: `Collapse${collapseControlLabel}`}
					onclick={onToggleCollapse}
				>
					{isCollapsed ? 'Expand' : 'Collapse'}
				</button>
			</div>
		{/if}
		{#if !isCollapsible || !isCollapsed}
			<div class={gridClasses}>
				{@render children?.()}
			</div>
		{/if}
	{:else}
		{@render children?.()}
	{/if}
</div>
