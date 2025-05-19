<script>
	let { children, onclick = () => {}, variant = "light" } = $props();

	let bgColor = $state("bg-white")
	let hoverBgColor = $state("hover:bg-slate-100")
	let textColor = $state("text-black")

	if (variant === "dark") {
		bgColor = "bg-slate-700"
		hoverBgColor = "hover:bg-slate-900"
		textColor = "text-white"
	}
</script>

<div class="border-b-1 p-1 px-2 py-2 {bgColor} {hoverBgColor}" role="none">
	<button
		class="btn text-left {textColor} dark:text-white"
		role="menuitem"
		tabindex="-1"
		{onclick}
	>
		{@render children?.()}
	</button>
</div>
