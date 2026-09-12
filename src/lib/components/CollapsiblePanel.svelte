<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import PanelSurface from './PanelSurface.svelte';

	interface Props {
		heading: string;
		children?: Snippet;
		headerActions?: Snippet;
		headingIcon?: Snippet;
		headingId?: string;
		startsCollapsed?: boolean;
		isCollapsed?: boolean;
		headingEl?: HTMLButtonElement;
		classes?: string;
	}

	const generatedId = $props.id();
	let {
		heading,
		children = undefined,
		headerActions = undefined,
		headingIcon = undefined,
		headingId = undefined,
		startsCollapsed = false,
		isCollapsed = $bindable(untrack(() => startsCollapsed)),
		headingEl = $bindable<HTMLButtonElement>(),
		classes = undefined
	}: Props = $props();

	const resolvedHeadingId = $derived(headingId ?? `${generatedId}-heading`);
	const contentId = $derived(`${resolvedHeadingId}-content`);

	const onToggleCollapse = () => {
		isCollapsed = !isCollapsed;
	};
</script>

<PanelSurface classes={twMerge('flex flex-col', classes)}>
	<div
		data-expanded={!isCollapsed}
		class={[
			'collapsible-panel-header flex w-full items-center justify-center gap-2 rounded-md border px-2 py-1',
			!isCollapsed && 'mb-2'
		]}
	>
		<button
			bind:this={headingEl}
			id={resolvedHeadingId}
			type="button"
			class="collapsible-panel-heading touch-target btn inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-center text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
			aria-expanded={!isCollapsed}
			aria-controls={contentId}
			aria-label={isCollapsed ? `Expand ${heading}` : `Collapse ${heading}`}
			onclick={onToggleCollapse}
		>
			{@render headingIcon?.()}
			<span>{heading}</span>
			<span
				aria-hidden="true"
				class="inline-flex h-5 w-5 items-center justify-center rounded-sm border text-sm font-semibold leading-none"
			>
				{isCollapsed ? '+' : '-'}
			</span>
		</button>
		{@render headerActions?.()}
	</div>
	{#if !isCollapsed}
		<div id={contentId}>
			{@render children?.()}
		</div>
	{/if}
</PanelSurface>

<style>
	.collapsible-panel-header {
		border-color: color-mix(in oklab, var(--color-surface-border) 82%, var(--color-brand) 18%);
		background-color: color-mix(in oklab, var(--color-surface) 76%, var(--color-muted-surface) 24%);
	}

	.collapsible-panel-header[data-expanded='true'] {
		border-bottom-width: 2px;
		border-bottom-color: color-mix(
			in oklab,
			var(--color-surface-border) 72%,
			var(--color-brand) 28%
		);
	}

	.collapsible-panel-heading {
		border-color: transparent;
		background-color: transparent;
		color: var(--color-surface-text);
	}

	.collapsible-panel-heading:hover {
		background-color: color-mix(in oklab, var(--color-surface) 70%, var(--color-muted-surface) 30%);
	}

	@supports not (color: color-mix(in oklab, black 50%, white 50%)) {
		.collapsible-panel-header {
			border-color: var(--color-surface-border);
			background-color: var(--color-muted-surface);
		}

		.collapsible-panel-header[data-expanded='true'] {
			border-bottom-color: var(--color-brand-border);
		}

		.collapsible-panel-heading:hover {
			background-color: var(--color-surface-hover);
		}
	}
</style>
