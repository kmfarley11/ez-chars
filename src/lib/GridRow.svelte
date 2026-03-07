<script lang="ts">
	import type { Snippet } from 'svelte';
	import GridContainer from '$lib/GridContainer.svelte';

	type GridFlow = 'col' | 'row' | 'auto';

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
</script>

<GridContainer
	axis="cols"
	span="row"
	count={colCount}
	countSm={colCountSm}
	countMd={colCountMd}
	countLg={colCountLg}
	{child}
	{parent}
	{flow}
	{pad}
	{border}
	{classes}
	{collapsible}
	{defaultCollapsed}
	{collapseLabel}
>
	{@render children?.()}
</GridContainer>
