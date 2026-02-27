<script>
	import OpenCloseToggleButton from './OpenCloseToggleButton.svelte';

	/** @typedef {'left' | 'right'} MenuAlign */
	let { children = undefined, text = undefined, variant = 'light', align = 'right' } = $props();
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
		variant === 'dark'
			? 'bg-slate-700 hover:bg-slate-900 text-white'
			: 'bg-white hover:bg-slate-100 text-black'
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
			useChevrons={false}
			handleClick={handleMenuClick}
			{variant}
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
