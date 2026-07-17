<script>
	const defaultClick = /** @type {(event: MouseEvent) => void} */ (() => {});
	/** @typedef {'dark' | 'light'} MenuItemVariant */
	/** @type {MenuItemVariant} */
	const defaultShadingVariant = 'light';
	let { children, onclick = defaultClick, shadingVariant = defaultShadingVariant } = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
</script>

<li role="none">
	<button
		type="button"
		class="btn {colors} block w-full rounded-md border px-2 py-2 text-left"
		role="menuitem"
		{onclick}
	>
		{@render children?.()}
	</button>
</li>
