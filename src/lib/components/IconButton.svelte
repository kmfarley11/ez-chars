<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import IconPin from '$components/IconPin.svelte';
	import type { ButtonShadingVariant, ButtonSize, IconButtonVariant } from '$utils/buttonTypes';

	interface Props {
		variant: IconButtonVariant;
		ariaLabel: string;
		title?: string;
		type?: 'button' | 'submit' | 'reset';
		// eslint-disable-next-line no-unused-vars
		onclick?: (event: MouseEvent) => void;
		shadingVariant?: ButtonShadingVariant;
		size?: ButtonSize;
		classes?: string;
		ariaPressed?: boolean;
		ariaExpanded?: boolean;
		ariaControls?: string;
		ariaHaspopup?: 'menu' | boolean;
		id?: string;
		disabled?: boolean;
		buttonEl?: HTMLButtonElement;
	}

	let {
		variant,
		ariaLabel,
		title = undefined,
		type = 'button',
		onclick = undefined,
		shadingVariant = 'light',
		size = 'md',
		classes = undefined,
		ariaPressed = undefined,
		ariaExpanded = undefined,
		ariaControls = undefined,
		ariaHaspopup = undefined,
		id = undefined,
		disabled = false,
		buttonEl = $bindable<HTMLButtonElement>()
	}: Props = $props();

	const iconClasses = $derived(size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5');
</script>

<BaseButton
	bind:buttonEl
	{type}
	{onclick}
	{shadingVariant}
	{size}
	iconOnly
	{classes}
	{ariaLabel}
	title={title ?? ariaLabel}
	{ariaPressed}
	{ariaExpanded}
	{ariaControls}
	{ariaHaspopup}
	{id}
	{disabled}
>
	{#if variant === 'pin'}
		<IconPin classes={iconClasses} />
	{:else}
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			class={iconClasses}
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			{#if variant === 'add'}
				<path d="M12 5v14M5 12h14"></path>
			{:else if variant === 'cancel'}
				<path d="m6 6 12 12M18 6 6 18"></path>
			{:else if variant === 'confirm'}
				<path d="m5 12 4 4L19 6"></path>
			{:else if variant === 'detail'}
				<path d="m9 6 6 6-6 6"></path>
			{:else if variant === 'edit'}
				<path d="M12 20h9"></path>
				<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
			{/if}
		</svg>
	{/if}
</BaseButton>
