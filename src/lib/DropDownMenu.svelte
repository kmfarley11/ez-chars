<!-- https://svelte.dev/playground/4c5dfd34cc634774bd242725f0fc2dab?version=5.30.2 -->
<script>
	import OpenCloseToggleButton from './OpenCloseToggleButton.svelte';

	let { children = undefined, text = undefined, useChevrons = false, variant = "light" } = $props();

	let isDropdownOpen = $state(false); // default state (dropdown close)

	const handleDropdownClick = () => {
		isDropdownOpen = !isDropdownOpen; // togle state on click
	};

	/** @param {FocusEvent} event */
	const handleDropdownFocusLoss = (event) => {
		const { relatedTarget, currentTarget } = event;
		// use "focusout" event to ensure that we can close the dropdown when clicking outside or when we leave the dropdown with the "Tab" button
		if (
			relatedTarget instanceof HTMLElement &&
			currentTarget instanceof HTMLElement &&
			currentTarget.contains(relatedTarget)
		)
			return; // check if the new focus target doesn't present in the dropdown tree (exclude ul\li padding area because relatedTarget, in this case, will be null)
		isDropdownOpen = false;
	};

	let colors = $derived(variant === 'dark'
		? 'bg-slate-700 hover:bg-slate-900 text-white'
		: 'bg-white hover:bg-slate-100 text-black');
</script>

<div class="flex justify-start text-left">
	<div
		class="dropdown"
		role="menu"
		aria-orientation="vertical"
		aria-labelledby="menu-button"
		tabindex="-1"
		onfocusout={handleDropdownFocusLoss}
	>
		<OpenCloseToggleButton
			{text}
			isOpen={isDropdownOpen}
			{useChevrons}
			handleClick={handleDropdownClick}
			{variant}
		/>
		{#if isDropdownOpen}
			<div
				class="dropdown-content menu rounded-box fixed z-10 m-2 divide-y rounded-lg {colors} shadow-sm ring-1"
			>
				<!-- the following will reserve blank space even when hidden -->
				<!-- style:visibility={isDropdownOpen ? 'visible' : 'hidden'} -->
				{@render children?.()}
			</div>
		{/if}
	</div>
	<!-- <p class="text-slate-300">
		isDropdownOpen: {isDropdownOpen}
	</p> -->
</div>
