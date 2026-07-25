<script lang="ts">
	import DialogShell from './DialogShell.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		shadingVariant?: 'light' | 'dark';
		title?: string;
		ariaLabel?: string;
		closeText?: string;
		triggerVariant?: 'icon' | 'compact';
		children?: Snippet;
		dialogContent?: Snippet;
		actions?: Snippet<[() => void]>;
	}

	let {
		shadingVariant = 'light',
		title,
		ariaLabel,
		closeText = 'Close',
		triggerVariant = 'icon',
		children = undefined,
		dialogContent = undefined,
		actions = undefined
	}: Props = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
	let normalizedTriggerVariant = $derived(triggerVariant === 'compact' ? 'compact' : 'icon');
	let triggerWrapperClass = $derived(normalizedTriggerVariant === 'compact' ? '' : 'p-1');
	let triggerButtonClass = $derived(
		normalizedTriggerVariant === 'compact'
			? 'btn inline-flex px-2 py-1 text-sm items-center justify-center rounded-md border p-1 leading-none'
			: 'btn inline-flex h-10 w-10 items-center justify-center rounded-md border p-1 leading-none'
	);

	let open = $state(false);

	const openDialog = () => {
		open = true;
	};
</script>

<div class={triggerWrapperClass}>
	<button
		type="button"
		class="{triggerButtonClass} cursor-pointer {colors}"
		aria-label={ariaLabel ?? title}
		{title}
		onclick={openDialog}
	>
		{@render children?.()}
	</button>
</div>

<DialogShell bind:open {title} {closeText} {actions}>
	{@render dialogContent?.()}
</DialogShell>
