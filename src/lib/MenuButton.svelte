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
		triggerEl?: HTMLButtonElement;
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
		title = undefined,
		triggerEl = $bindable<HTMLButtonElement>()
	}: Props = $props();
	let isMenuOpen = $state(false);
	const componentId = $props.id();
	const menuButtonId = `menu-button-${componentId}`;
	const menuId = `menu-${componentId}`;
	const anchorName = `--menu-anchor-${componentId}`;

	const handlePopoverToggle = (event: ToggleEvent) => {
		isMenuOpen = (event.currentTarget as HTMLElement).matches(':popover-open');
	};

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
</script>

<div class="flex {align === 'right' ? 'justify-end' : 'justify-start'} text-left">
	<OpenCloseToggleButton
		bind:buttonEl={triggerEl}
		id={menuButtonId}
		{text}
		isOpen={isMenuOpen}
		{iconVariant}
		{shadingVariant}
		size={buttonSize}
		iconOnly={buttonIconOnly}
		classes={buttonClasses}
		{ariaLabel}
		{title}
		ariaControls={menuId}
		ariaHaspopup="menu"
		popoverTarget={menuId}
		{anchorName}
	/>
	<div
		id={menuId}
		popover="auto"
		class="menu-popover {align === 'right'
			? 'menu-popover-right'
			: ''} min-w-36 divide-y rounded-lg p-1 {colors} shadow-sm ring-1"
		style={`--menu-anchor: ${anchorName}`}
		ontoggle={handlePopoverToggle}
	>
		<ul class="w-full" role="menu" aria-orientation="vertical" aria-labelledby={menuButtonId}>
			{@render children?.()}
		</ul>
	</div>
</div>

<style>
	.menu-popover {
		position: fixed;
		position-anchor: var(--menu-anchor);
		inset: auto;
		inset-block-start: anchor(bottom);
		inset-inline-start: anchor(left);
		margin: 0.25rem 0 0;
		border: 0;
		background: transparent;
	}

	.menu-popover-right {
		inset-inline-start: auto;
		inset-inline-end: anchor(right);
	}

	@supports not (position-anchor: --menu-anchor) {
		.menu-popover {
			inset: auto 1rem 1rem auto;
		}

		.menu-popover:not(.menu-popover-right) {
			inset: auto auto 1rem 1rem;
		}
	}
</style>
