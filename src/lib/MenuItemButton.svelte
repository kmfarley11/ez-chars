<script>
	const defaultClick = /** @type {(event: MouseEvent) => void} */ (() => {});
	/** @typedef {'dark' | 'light'} MenuItemVariant */
	/** @type {MenuItemVariant} */
	const defaultShadingVariant = 'light';
	let { children, onclick = defaultClick, shadingVariant = defaultShadingVariant } = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
</script>

<div class="border-1 w-full rounded-md p-1 px-2 py-2 {colors}" role="none">
	<button class="btn block w-full text-left {colors}" role="menuitem" tabindex="-1" {onclick}>
		{@render children?.()}
	</button>
</div>
