<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import GridContainer from '$lib/GridContainer.svelte';

	type GridFlow = 'col' | 'row' | 'auto';

	interface Props {
		children?: Snippet;
		maxCols?: number;
		minCols?: number;
		gapPx?: number;
		measureSelector?: string;
		parent?: boolean;
		child?: boolean;
		flow?: GridFlow;
		pad?: boolean;
		border?: boolean;
		classes?: string;
	}

	let {
		children = undefined,
		maxCols = 3,
		minCols = 1,
		gapPx = 8,
		// Measured elements should use intrinsic width (e.g. inline-block + nowrap) for accurate fit checks.
		measureSelector = '[data-grid-auto-item]',
		parent = true,
		child = true,
		flow = 'row',
		pad = false,
		border = false,
		classes = undefined
	}: Props = $props();

	let layoutEl: HTMLDivElement | undefined;
	let colCount = $state(1);

	// Keep all computed counts inside valid Tailwind grid utility range.
	const clampGridCount = (value: number, fallback = 1): number => {
		if (!Number.isFinite(value)) return fallback;
		return Math.max(1, Math.min(12, Math.trunc(value)));
	};

	// Normalize user-provided bounds once so the fit loop can stay simple.
	const normalizedMinCols = $derived(clampGridCount(minCols, 1));
	const normalizedMaxCols = $derived(Math.max(normalizedMinCols, clampGridCount(maxCols, 3)));
	const normalizedGapPx = $derived(Number.isFinite(gapPx) ? Math.max(0, gapPx) : 8);

	// Pick the largest column count where every measured item can fit within a single column width.
	const recalculateColCount = () => {
		if (!layoutEl) {
			colCount = normalizedMinCols;
			return;
		}

		const style = getComputedStyle(layoutEl);
		const horizontalPadding =
			Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
		const availableWidth = layoutEl.clientWidth - horizontalPadding;
		if (availableWidth <= 0) {
			colCount = normalizedMinCols;
			return;
		}

		const itemWidths = Array.from(layoutEl.querySelectorAll<HTMLElement>(measureSelector))
			.map((item) => item.scrollWidth)
			.filter((width) => width > 0);
		if (itemWidths.length === 0) {
			colCount = normalizedMinCols;
			return;
		}

		for (let cols = normalizedMaxCols; cols >= normalizedMinCols; cols -= 1) {
			const widthPerCol = (availableWidth - normalizedGapPx * (cols - 1)) / cols;
			if (itemWidths.every((width) => width <= widthPerCol)) {
				colCount = cols;
				return;
			}
		}

		colCount = normalizedMinCols;
	};

	// Re-evaluate after reactive input changes and after DOM has painted those changes.
	$effect(() => {
		normalizedMinCols;
		normalizedMaxCols;
		normalizedGapPx;
		measureSelector;
		void tick().then(recalculateColCount);
	});

	onMount(() => {
		if (!layoutEl) return;

		// Container resize changes available width, so the optimal column count may change.
		const resizeObserver = new ResizeObserver(() => {
			recalculateColCount();
		});
		resizeObserver.observe(layoutEl);

		// Content edits can change measured text width without resizing the container.
		const mutationObserver = new MutationObserver(() => {
			recalculateColCount();
		});
		mutationObserver.observe(layoutEl, {
			subtree: true,
			childList: true,
			characterData: true
		});

		void tick().then(recalculateColCount);

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	});
</script>

<div bind:this={layoutEl}>
	<GridContainer
		axis="cols"
		span="row"
		count={colCount}
		{parent}
		{child}
		{flow}
		{pad}
		{border}
		{classes}
	>
		{@render children?.()}
	</GridContainer>
</div>
