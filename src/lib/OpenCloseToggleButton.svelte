<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	import type { ButtonIconVariant, ButtonShadingVariant, ButtonSize } from '$lib/buttonTypes';

	interface Props {
		text?: string;
		iconVariant?: ButtonIconVariant;
		isOpen: boolean;
		handleClick?: () => void;
		shadingVariant?: ButtonShadingVariant;
		size?: ButtonSize;
		iconOnly?: boolean;
		classes?: string;
		ariaLabel?: string;
		title?: string;
		id?: string;
		ariaControls?: string;
		ariaHaspopup?: 'menu' | boolean;
		popoverTarget?: string;
		anchorName?: string;
		buttonEl?: HTMLButtonElement;
	}

	let {
		text,
		iconVariant = 'hamburger',
		isOpen,
		handleClick = undefined,
		shadingVariant = 'light',
		size = 'md',
		iconOnly = false,
		classes = undefined,
		ariaLabel = undefined,
		title = undefined,
		id = undefined,
		ariaControls = undefined,
		ariaHaspopup = undefined,
		popoverTarget = undefined,
		anchorName = undefined,
		buttonEl = $bindable<HTMLButtonElement>()
	}: Props = $props();

	const iconClasses = $derived(size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5');
</script>

<BaseButton
	bind:buttonEl
	{id}
	onclick={handleClick}
	{shadingVariant}
	ariaExpanded={isOpen}
	{ariaControls}
	{ariaHaspopup}
	{popoverTarget}
	{anchorName}
	{size}
	{iconOnly}
	{classes}
	{ariaLabel}
	{title}
>
	{#if text !== undefined}
		<span>{text}</span>
	{/if}
	<span class="inline-flex items-center justify-center {iconClasses}" aria-hidden="true">
		{#if isOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="{iconClasses} stroke-current"
			>
				<title>Close</title>
				{#if iconVariant === 'chevron'}
					<path
						d="M6 15L12 9L18 15"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
					/>
				{:else if iconVariant === 'hamburger'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				{:else}
					<g transform="rotate(90 12 12)">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</g>
				{/if}
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="{iconClasses} stroke-current"
			>
				<title>Open</title>
				{#if iconVariant === 'chevron'}
					<path
						d="M6 9L12 15L18 9"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else if iconVariant === 'hamburger'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				{:else if iconVariant === 'kebab'}
					<circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
					<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
					<circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"></circle>
				{:else}
					<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
					<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
					<circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
				{/if}
			</svg>
		{/if}
	</span>
</BaseButton>
