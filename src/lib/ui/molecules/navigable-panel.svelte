<script lang="ts">
	import { onMount, type Snippet, untrack } from 'svelte';
	import CollapsiblePanel from '$lib/ui/molecules/collapsible-panel.svelte';
	import { getSheetLandmarkCoordinator } from '$lib/navigation/sheet-landmark-navigation';
	import type { SheetLandmark } from '$lib/navigation/sheet-landmarks';
	import LandmarkIcon from '$lib/ui/atoms/landmark-icon.svelte';

	interface Props {
		landmark: SheetLandmark;
		children?: Snippet;
		headerActions?: Snippet;
		startsCollapsed?: boolean;
		classes?: string;
	}

	let {
		landmark,
		children = undefined,
		headerActions = undefined,
		startsCollapsed = false,
		classes = undefined
	}: Props = $props();
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

{#snippet headingIcon()}
	{#if landmark.icon}
		<LandmarkIcon variant={landmark.icon} classes="h-5 w-5" />
	{/if}
{/snippet}

<CollapsiblePanel
	heading={landmark.label}
	headingId={landmark.fragmentId}
	{headingIcon}
	bind:isCollapsed
	bind:headingEl
	{headerActions}
	{classes}
>
	{@render children?.()}
</CollapsiblePanel>
