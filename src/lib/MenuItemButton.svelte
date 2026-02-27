<script>
	const defaultClick = /** @type {(event: MouseEvent) => void} */ (() => {});
	/** @typedef {'dark' | 'light'} MenuItemVariant */
	/** @type {MenuItemVariant} */
	const defaultVariant = 'light';
	let { children, onclick = defaultClick, variant = defaultVariant } = $props();

	let colors = $derived(
		variant === 'dark'
			? 'bg-slate-700 hover:bg-slate-900 text-white'
			: 'bg-white hover:bg-slate-100 text-black'
	);
</script>

<div class="border-1 w-full rounded-md p-1 px-2 py-2 {colors}" role="none">
	<button
		class="btn block w-full text-left {colors}"
		role="menuitem"
		tabindex="-1"
		{onclick}
	>
		{@render children?.()}
	</button>
</div>
