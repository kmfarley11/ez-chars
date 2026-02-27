<script>
	import OpenCloseToggleButton from './OpenCloseToggleButton.svelte';

	/** @typedef {'left' | 'right'} MenuAlign */
	let {
		children = undefined,
		text = undefined,
		shadingVariant = 'light',
		align = 'right',
		iconVariant = 'stack'
	} = $props();
	let isMenuOpen = $state(false);

	const handleMenuClick = () => {
		isMenuOpen = !isMenuOpen;
	};

	/** @param {FocusEvent} event */
	const handleMenuFocusLoss = (event) => {
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

	let colors = $derived(
		shadingVariant === 'dark'
			? 'theme-btn-dark'
			: 'theme-btn-light'
	);
</script>

<div class="flex {align === 'right' ? 'justify-end' : 'justify-start'} text-left">
	<div
		class="relative"
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
		/>
		{#if isMenuOpen}
			<div
				class="absolute {align === 'right' ? 'right-0' : 'left-0'} z-20 mt-1 min-w-36 divide-y rounded-lg p-1 {colors} shadow-sm ring-1"
			>
				<ul class="w-full">
					{@render children?.()}
				</ul>
			</div>
		{/if}
	</div>
</div>
