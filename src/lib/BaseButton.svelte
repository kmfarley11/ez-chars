<script lang="ts">
	import { type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import type { ButtonShadingVariant, ButtonSize } from '$lib/buttonTypes';

	interface Props {
		children?: Snippet;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
		shadingVariant?: ButtonShadingVariant;
		size?: ButtonSize;
		iconOnly?: boolean;
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
		iconOnly = false,
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
		iconOnly
			? size === 'sm'
				? 'h-7 w-7 p-0 text-sm'
				: size === 'lg'
					? 'h-11 w-11 p-0 text-lg'
					: 'h-9 w-9 p-0 text-base'
			: size === 'sm'
				? 'min-h-9 px-3 py-1.5 text-sm'
				: size === 'lg'
					? 'min-h-12 px-5 py-3 text-lg'
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
