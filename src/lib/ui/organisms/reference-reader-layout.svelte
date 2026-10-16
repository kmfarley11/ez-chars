<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import HorizontalResizeHandle from '$lib/ui/molecules/horizontal-resize-handle.svelte';
	import IconMap from '$lib/ui/atoms/icon-map.svelte';
	import MenuButton from '$lib/ui/molecules/menu-button.svelte';
	import MenuItemButton from '$lib/ui/molecules/menu-item-button.svelte';
	import { createScrollAffordanceAttachment } from '$lib/ui/molecules/scroll-affordance';

	interface Props {
		tool?: 'document' | 'find' | 'outline' | 'page';
		currentPage: number;
		totalPages: number;
		browserHref: string;
		find: Snippet;
		outline: Snippet;
		pages: Snippet;
		children: Snippet;
		onBrowseResources?: () => void;
		onOpenOutline?: () => void;
	}
	let {
		tool = $bindable('document'),
		currentPage,
		totalPages,
		browserHref,
		find,
		outline,
		pages,
		children,
		onBrowseResources,
		onOpenOutline
	}: Props = $props();
	let width = $state(0);
	let root = $state<HTMLDivElement>();
	let collapsed = $state(false);
	let navigationWidth = $state(240);
	let viewport = $state<HTMLDivElement>();
	let invoker: HTMLButtonElement | undefined;
	let canScrollUp = $state(false);
	let canScrollDown = $state(false);
	const compact = $derived(width < 768);
	const toolsVisible = $derived(compact ? tool !== 'document' : !collapsed);
	const positions = { find: 0, outline: 0, page: 0, document: 0 };
	const trackScroll = createScrollAffordanceAttachment((state) => {
		canScrollUp = state.canScrollUp;
		canScrollDown = state.canScrollDown;
	});
	const openTool = async (next: 'find' | 'outline' | 'page', event: MouseEvent) => {
		if (next === 'page' && !compact) {
			root?.querySelector<HTMLElement>('[data-tool="page"] input')?.focus({ preventScroll: true });
			return;
		}
		if (viewport) positions[tool] = viewport.scrollTop;
		invoker = event.currentTarget as HTMLButtonElement;
		tool = next;
		collapsed = false;
		if (next === 'outline') onOpenOutline?.();
		await tick();
		if (viewport) {
			viewport.scrollTop = positions[next];
			const target = root?.querySelector<HTMLElement>(`[data-tool="${next}"]`);
			if (!compact && target) {
				viewport.scrollTop +=
					target.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
			}
			(
				target?.querySelector<HTMLElement>(next === 'outline' ? 'summary' : 'input') ?? target
			)?.focus({ preventScroll: true });
		}
	};
	const returnToDocument = async () => {
		if (viewport) positions[tool] = viewport.scrollTop;
		tool = 'document';
		await tick();
		invoker?.focus({ preventScroll: true });
	};
	const resizeLayout = (nextWidth: number | null | undefined) => {
		if (!nextWidth) return;
		const focused = document.activeElement;
		const switchesMode = width < 768 !== nextWidth < 768;
		width = nextWidth;
		if (!switchesMode || !(focused instanceof HTMLElement) || !root?.contains(focused)) return;
		void tick().then(() => {
			if (
				!focused.isConnected ||
				focused.closest('[inert]') ||
				focused.getClientRects().length === 0
			) {
				root?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
			}
		});
	};
</script>

<div
	class="reader-layout flex min-h-0 min-w-0 flex-1 flex-col gap-2"
	bind:this={root}
	bind:clientWidth={null, resizeLayout}
>
	<div class="flex shrink-0 flex-wrap items-center gap-2" aria-label="Document tools">
		<BaseButton
			size="sm"
			ariaExpanded={toolsVisible && (!compact || tool === 'find')}
			onclick={(event) => void openTool('find', event)}>Find</BaseButton
		>
		<BaseButton
			size="sm"
			ariaExpanded={toolsVisible && (!compact || tool === 'outline')}
			onclick={(event) => void openTool('outline', event)}>Outline</BaseButton
		>
		<BaseButton
			size="sm"
			ariaLabel="Page tools"
			ariaExpanded={compact ? toolsVisible && tool === 'page' : undefined}
			onclick={(event) => void openTool('page', event)}
			>{currentPage} / {totalPages || '…'}</BaseButton
		>
		<div class="ml-auto shrink-0">
			<MenuButton
				iconVariant="ellipsis"
				buttonSize="sm"
				buttonIconOnly
				buttonClasses="rounded-md"
				ariaLabel="More reference actions"
				title="More reference actions"
			>
				{#if onBrowseResources}<MenuItemButton onclick={onBrowseResources}
						>Browse resources</MenuItemButton
					>{/if}
				<MenuItemButton href={browserHref} target="_blank" rel="external noopener noreferrer"
					>Open in browser</MenuItemButton
				>
			</MenuButton>
		</div>
	</div>
	<div
		class="reader-workspace min-h-0 flex-1"
		class:compact
		style={`--navigation-width: ${collapsed ? 52 : navigationWidth}px`}
	>
		<aside
			class="reader-tools relative flex min-h-0 min-w-0 max-h-full flex-col rounded-md border"
			class:hidden={compact && !toolsVisible}
			aria-label="PDF navigation details"
		>
			<div class="shrink-0 p-1">
				{#if compact}
					<BaseButton size="sm" onclick={() => void returnToDocument()}>Back to document</BaseButton
					>
				{:else}
					<BaseButton
						size="sm"
						classes={collapsed ? 'w-full px-1' : 'w-full'}
						ariaLabel={collapsed ? 'Expand document navigation' : 'Collapse document navigation'}
						onclick={() => (collapsed = !collapsed)}
						><IconMap classes="h-5 w-5 shrink-0" />{#if !collapsed}<span>‹ Outline &amp; find</span
							>{/if}</BaseButton
					>
				{/if}
			</div>
			<div class="relative flex min-h-0 flex-1 flex-col" hidden={!toolsVisible}>
				<div
					class="scroll-affordance-viewport min-h-0 flex-1 overflow-y-auto p-3"
					bind:this={viewport}
					{@attach trackScroll}
				>
					<section
						data-tool="find"
						tabindex="-1"
						aria-label="Find tools"
						hidden={compact && tool !== 'find'}
						class="mb-4 space-y-2"
					>
						{@render find()}
					</section>
					<section
						data-tool="outline"
						tabindex="-1"
						aria-label="Outline tools"
						hidden={compact && tool !== 'outline'}
						class="mb-4"
					>
						{@render outline()}
					</section>
					{#if compact}<section
							data-tool="page"
							tabindex="-1"
							aria-label="Page tools"
							hidden={compact && tool !== 'page'}
						>
							{@render pages()}
						</section>{/if}
				</div>
				{#if canScrollUp}<div
						class="scroll-affordance-fade scroll-affordance-fade-top pointer-events-none absolute inset-x-0 top-0 h-6"
						aria-hidden="true"
					></div>{/if}
				{#if canScrollDown}<div
						class="scroll-affordance-fade scroll-affordance-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-6"
						aria-hidden="true"
					></div>{/if}
			</div>
		</aside>
		{#if !compact}
			<HorizontalResizeHandle
				label="Resize document navigation"
				value={collapsed ? 52 : navigationWidth}
				min={52}
				max={Math.min(384, width - 320)}
				collapsedValue={52}
				minimumExpandedValue={192}
				classes="h-full w-full"
				onResize={(value) => {
					collapsed = value <= 52;
					if (!collapsed) navigationWidth = value;
				}}
			/>
		{/if}
		<div
			class="reader-document flex min-h-0 min-w-0 flex-col gap-2"
			class:obscured={compact && toolsVisible}
			inert={compact && toolsVisible}
			aria-hidden={compact && toolsVisible ? true : undefined}
		>
			{#if !compact}
				<section data-tool="page" aria-label="Page tools" tabindex="-1" class="shrink-0">
					{@render pages()}
				</section>
			{/if}
			{@render children()}
		</div>
	</div>
</div>

<style>
	.reader-workspace {
		display: grid;
		grid-template-columns: var(--navigation-width) 1rem minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}
	.reader-workspace.compact {
		grid-template-columns: minmax(0, 1fr);
	}
	.compact > .reader-tools,
	.compact > .reader-document {
		grid-area: 1 / 1;
	}
	.compact > .reader-tools {
		align-self: start;
	}
	.obscured {
		visibility: hidden;
	}
	.hidden {
		display: none;
	}
</style>
