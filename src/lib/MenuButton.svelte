<script lang="ts">
	import { type Snippet } from 'svelte';
	import OpenCloseToggleButton from './OpenCloseToggleButton.svelte';
	import type { ButtonIconVariant, ButtonShadingVariant, ButtonSize } from '$lib/buttonTypes';

	type MenuAlign = 'left' | 'right';

	interface Props {
		children?: Snippet;
		text?: string;
		shadingVariant?: ButtonShadingVariant;
		align?: MenuAlign;
		iconVariant?: ButtonIconVariant;
		buttonSize?: ButtonSize;
		buttonIconOnly?: boolean;
		buttonClasses?: string;
		ariaLabel?: string;
		title?: string;
	}

	let {
		children = undefined,
		text = undefined,
		shadingVariant = 'light',
		align = 'right',
		iconVariant = 'hamburger',
		buttonSize = 'md',
		buttonIconOnly = false,
		buttonClasses = undefined,
		ariaLabel = undefined,
		title = undefined
	}: Props = $props();
	let isMenuOpen = $state(false);

	const handleMenuClick = () => {
		isMenuOpen = !isMenuOpen;
	};

	const handleMenuFocusLoss = (event: FocusEvent) => {
		const { relatedTarget, currentTarget } = event;
		if (
			relatedTarget instanceof HTMLElement &&
			currentTarget instanceof HTMLElement &&
			currentTarget.contains(relatedTarget)
		) {
			return;
		}
		isMenuOpen = false;
	};

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
</script>

<div class="flex {align === 'right' ? 'justify-end' : 'justify-start'} text-left">
	<div
		class="relative {isMenuOpen ? 'z-30' : 'z-0'}"
		role="menu"
		aria-orientation="vertical"
		aria-labelledby="menu-button"
		tabindex="-1"
		onfocusout={handleMenuFocusLoss}
	>
		<OpenCloseToggleButton
			{text}
			isOpen={isMenuOpen}
			{iconVariant}
			handleClick={handleMenuClick}
			{shadingVariant}
			size={buttonSize}
			iconOnly={buttonIconOnly}
			classes={buttonClasses}
			{ariaLabel}
			{title}
		/>
		{#if isMenuOpen}
			<div
				class="absolute {align === 'right'
					? 'right-0'
					: 'left-0'} z-30 mt-1 min-w-36 divide-y rounded-lg p-1 {colors} shadow-sm ring-1"
			>
				<ul class="w-full">
					{@render children?.()}
				</ul>
			</div>
		{/if}
	</div>
</div>
