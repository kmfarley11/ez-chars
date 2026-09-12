<script lang="ts">
	import { onMount, tick } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import { getDnd5e2014SheetLandmarkCoordinator } from '../sheetLandmarkNavigation';
	import {
		dnd5e2014SheetLandmarks,
		getDnd5e2014SheetLandmarkChildren,
		getDnd5e2014SheetLandmarkRegions,
		type Dnd5e2014SheetLandmark
	} from '../sheetLandmarks';
	import Dnd5e2014LandmarkIcon from './Dnd5e2014LandmarkIcon.svelte';

	type CompactPresentation = 'rail' | 'drawer';

	interface Props {
		compactPresentation?: CompactPresentation;
		wideBreakpoint?: number;
	}

	let { compactPresentation = 'rail', wideBreakpoint = 1280 }: Props = $props();
	let isWide = $state(false);
	let userExpanded = $state<boolean>();
	let isOutlineOpen = $state(false);
	let outlineTriggerEl = $state<HTMLButtonElement>();
	let dialogShell = $state<{ focusHeading: () => void }>();
	let restoreOutlineFocusOnClose = true;
	const coordinator = getDnd5e2014SheetLandmarkCoordinator();
	const regions = getDnd5e2014SheetLandmarkRegions();
	const destinationLandmarks = dnd5e2014SheetLandmarks.filter(
		(landmark) => landmark.kind === 'section'
	);
	const isExpanded = $derived(isWide && (userExpanded ?? true));
	const showsDestinationRail = $derived(isWide ? !isExpanded : compactPresentation === 'rail');

	onMount(() => {
		const query = window.matchMedia(`(min-width: ${wideBreakpoint}px)`);
		const syncWidth = () => {
			isWide = query.matches;
			userExpanded = undefined;
			if (isWide) isOutlineOpen = false;
		};
		syncWidth();
		query.addEventListener('change', syncWidth);
		return () => query.removeEventListener('change', syncWidth);
	});

	const openCompleteOutline = async () => {
		if (isWide) {
			userExpanded = true;
			return;
		}
		restoreOutlineFocusOnClose = true;
		isOutlineOpen = true;
		await tick();
		dialogShell?.focusHeading();
	};

	const handleOutlineClose = async () => {
		isOutlineOpen = false;
		if (restoreOutlineFocusOnClose) {
			await tick();
			outlineTriggerEl?.focus();
		}
		restoreOutlineFocusOnClose = true;
	};

	const selectLandmark = async (landmark: Dnd5e2014SheetLandmark, fromDialog = false) => {
		if (fromDialog) {
			restoreOutlineFocusOnClose = false;
			isOutlineOpen = false;
			await tick();
		}
		await coordinator.navigate(landmark.fragmentId);
	};
</script>

{#snippet chevronLeft()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-5 w-5"
		aria-hidden="true"
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
{/snippet}

{#snippet completeOutline(fromDialog = false)}
	<div class="flex flex-col gap-2">
		{#each regions as region (region.fragmentId)}
			<div>
				<button
					type="button"
					class="theme-btn-dark touch-target btn min-h-9 w-full cursor-pointer rounded-md border px-2 py-1 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
					onclick={() => void selectLandmark(region, fromDialog)}
				>
					{region.label}
				</button>
				<ul class="mt-0.5 flex flex-col gap-0.5 pl-2" aria-label={`${region.label} sections`}>
					{#each getDnd5e2014SheetLandmarkChildren(region.fragmentId) as child (child.fragmentId)}
						<li>
							<button
								type="button"
								class="theme-btn-light touch-target btn flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
								onclick={() => void selectLandmark(child, fromDialog)}
							>
								{#if child.icon}
									<Dnd5e2014LandmarkIcon variant={child.icon} classes="h-5 w-5 shrink-0" />
								{/if}
								<span>{child.label}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
{/snippet}

<nav
	aria-label="Character sheet navigation"
	class="theme-grid-layer sticky top-2 z-20 max-h-[calc(100dvh-1rem)] shrink-0 self-start overflow-y-auto rounded-r-lg border p-0.5"
	class:w-64={isExpanded}
	class:w-12={!isExpanded}
	style="--grid-layer-depth:1"
>
	{#if isExpanded}
		<div class="flex items-center justify-between gap-2 border-b p-1.5">
			<span class="text-sm font-semibold">Outline</span>
			<BaseButton
				size="md"
				iconOnly={true}
				ariaLabel="Minify sheet outline"
				title="Minify sheet outline"
				onclick={() => {
					userExpanded = false;
				}}
			>
				{@render chevronLeft()}
			</BaseButton>
		</div>
		<div class="p-1.5">
			{@render completeOutline(false)}
		</div>
	{:else}
		<div class="flex flex-col items-center gap-1 py-1">
			<BaseButton
				bind:buttonEl={outlineTriggerEl}
				size="lg"
				iconOnly={true}
				ariaLabel="Show labeled sheet outline"
				title="Show labeled sheet outline"
				onclick={() => void openCompleteOutline()}
			>
				<Dnd5e2014LandmarkIcon variant="outline" classes="h-5 w-5" />
			</BaseButton>
			{#if showsDestinationRail}
				<div class="my-1 h-px w-8 bg-[var(--color-surface-border)]" aria-hidden="true"></div>
				{#each destinationLandmarks as landmark (landmark.fragmentId)}
					<BaseButton
						size="lg"
						iconOnly={true}
						ariaLabel={landmark.label}
						title={landmark.label}
						onclick={() => void selectLandmark(landmark)}
					>
						{#if landmark.icon}
							<Dnd5e2014LandmarkIcon variant={landmark.icon} classes="h-5 w-5" />
						{/if}
					</BaseButton>
				{/each}
			{/if}
		</div>
	{/if}
</nav>

<DialogShell
	bind:this={dialogShell}
	bind:open={isOutlineOpen}
	title="Sheet outline"
	closeText="Return to sheet"
	fullHeightMobile={true}
	scrollAffordance={true}
	onClose={() => void handleOutlineClose()}
>
	{@render completeOutline(true)}
</DialogShell>
