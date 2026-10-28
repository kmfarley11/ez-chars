<script lang="ts">
	import { onMount, type Snippet, untrack } from 'svelte';
	import { getSheetLandmarkCoordinator } from '$lib/navigation/sheet-landmark-navigation';
	import type { SheetLandmark } from '$lib/navigation/sheet-landmarks';

	interface Props {
		landmark: SheetLandmark;
		children?: Snippet;
		startsCollapsed?: boolean;
	}

	let { landmark, children = undefined, startsCollapsed = false }: Props = $props();
	let isCollapsed = $state(untrack(() => startsCollapsed));
	let headingEl = $state<HTMLButtonElement>();
	const coordinator = getSheetLandmarkCoordinator();

	onMount(() =>
		coordinator.register(landmark.fragmentId, {
			expand: () => {
				isCollapsed = false;
			},
			getHeading: () => headingEl
		})
	);
</script>

<section
	class="theme-grid-layer rounded-lg border p-2"
	aria-labelledby={landmark.fragmentId}
	style="--grid-layer-depth:1"
>
	<button
		bind:this={headingEl}
		id={landmark.fragmentId}
		type="button"
		class="theme-btn-dark touch-target btn flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-left font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
		aria-expanded={!isCollapsed}
		onclick={() => {
			isCollapsed = !isCollapsed;
		}}
	>
		<span>{landmark.label}</span>
		<span aria-hidden="true">{isCollapsed ? '+' : '−'}</span>
	</button>
	{#if !isCollapsed}
		<div class="pt-2">
			{@render children?.()}
		</div>
	{/if}
</section>
