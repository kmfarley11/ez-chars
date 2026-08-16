<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import PanelSurface from './PanelSurface.svelte';

	interface Props {
		heading: string;
		children?: Snippet;
		startsCollapsed?: boolean;
		classes?: string;
	}

	let {
		heading,
		children = undefined,
		startsCollapsed = false,
		classes = undefined
	}: Props = $props();

	let isCollapsed = $state(untrack(() => startsCollapsed));

	const onToggleCollapse = () => {
		isCollapsed = !isCollapsed;
	};
</script>

<PanelSurface classes={twMerge('flex flex-col', classes)}>
	<div class="mb-2 flex justify-center">
		<button
			type="button"
			class="theme-btn-light touch-target btn inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-center text-lg font-semibold"
			aria-expanded={!isCollapsed}
			aria-label={isCollapsed ? `Expand ${heading}` : `Collapse ${heading}`}
			onclick={onToggleCollapse}
		>
			<span>{heading}</span>
			<span
				aria-hidden="true"
				class="inline-flex h-5 w-5 items-center justify-center rounded-sm border text-sm font-semibold leading-none"
			>
				{isCollapsed ? '+' : '-'}
			</span>
		</button>
	</div>
	{#if !isCollapsed}
		<div>
			{@render children?.()}
		</div>
	{/if}
</PanelSurface>
