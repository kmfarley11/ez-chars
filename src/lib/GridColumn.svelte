<script lang="ts">
	import type { Snippet } from 'svelte';
	import GridContainer from '$lib/GridContainer.svelte';

	type GridFlow = 'col' | 'row' | 'auto';

	interface Props {
		children?: Snippet;
		child?: boolean;
		parent?: boolean;
		rowCount?: number;
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
		rowCount = 1,
		flow = 'row',
		pad = false,
		border = false,
		classes = undefined,
		collapsible = undefined,
		defaultCollapsed = false,
		collapseLabel = undefined
	}: Props = $props();
</script>

<GridContainer
	axis="rows"
	span="col"
	count={rowCount}
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
