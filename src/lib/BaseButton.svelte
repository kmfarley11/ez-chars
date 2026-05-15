<script lang="ts">
	import { type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type ButtonShadingVariant = 'dark' | 'light';
	type ButtonSize = 'sm' | 'md' | 'icon';

	interface Props {
		children?: Snippet;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
		shadingVariant?: ButtonShadingVariant;
		size?: ButtonSize;
		classes?: string;
		ariaLabel?: string;
		ariaExpanded?: boolean;
		title?: string;
		disabled?: boolean;
		role?: string;
		tabindex?: number;
	}

	let {
		children = undefined,
		type = 'button',
		onclick = undefined,
		shadingVariant = 'light',
		size = 'md',
		classes = undefined,
		ariaLabel = undefined,
		ariaExpanded = undefined,
		title = undefined,
		disabled = false,
		role = undefined,
		tabindex = undefined
	}: Props = $props();

	const colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
	const sizeClasses = $derived(
		size === 'icon'
			? 'h-8 w-8 p-0'
			: size === 'sm'
				? 'min-h-9 px-3 py-1.5 text-sm'
				: 'min-h-11 px-4 py-2 text-base'
	);
</script>

<button
	{type}
	class={twMerge(
		'btn inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border font-semibold leading-none shadow-sm ring-1 ring-black/5 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60',
		colors,
		sizeClasses,
		classes
	)}
	aria-label={ariaLabel}
	aria-expanded={ariaExpanded}
	{title}
	{disabled}
	{role}
	{tabindex}
	{onclick}
>
	{@render children?.()}
</button>
