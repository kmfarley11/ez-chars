<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		children?: Snippet;
		classes?: string;
	}

	let { children = undefined, classes = undefined }: Props = $props();

	const GRID_LAYER_DEPTH_KEY = 'ez:grid-layer-depth';

	// Share current grid nesting depth so nested grid wrappers can render stronger elevation.
	const parentLayerDepth = getContext<number>(GRID_LAYER_DEPTH_KEY) ?? 0;
	const gridLayerDepth = parentLayerDepth + 1;
	setContext(GRID_LAYER_DEPTH_KEY, gridLayerDepth);
</script>

<div
	class={twMerge('theme-grid-layer m-2 rounded-md border p-2', classes)}
	style="--grid-layer-depth:{gridLayerDepth};"
>
	{@render children?.()}
</div>
