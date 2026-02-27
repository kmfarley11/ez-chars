<script>
	const defaultClick = /** @type {(event: MouseEvent) => void} */ (() => {});
	let { children, onclick = defaultClick, variant = "light" } = $props();

	let colors = $derived(
		variant === 'dark'
			? 'bg-slate-700 hover:bg-slate-900 text-white'
			: 'bg-white hover:bg-slate-100 text-black'
	);
</script>

<div class="border-1 rounded-md p-1 px-2 py-2 {colors}" role="none">
	<button
		class="btn text-left {colors}"
		role="menuitem"
		tabindex="-1"
		{onclick}
	>
		{@render children?.()}
	</button>
</div>
