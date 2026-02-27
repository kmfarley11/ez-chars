<script>
	let { text, useChevrons, isOpen, handleClick, variant = "light" } = $props();

	let fill = $derived(variant === 'dark' ? '#ffffff' : '#000000');

	let colors = $derived(
		variant === 'dark'
			? 'bg-slate-700 hover:bg-slate-900 text-white'
			: 'bg-white hover:bg-slate-100 text-black'
	);
</script>

<button
	class="btn m-2 rounded-lg {colors} p-2 shadow-lg ring-2 ring-black/5 focus:outline-hidden"
	onclick={handleClick}
>
	<span>
		{#if text !== undefined}
			{text}
		{/if}
		{#if isOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="inline-block h-6 w-6 stroke-current"
			>
				<title>Close</title>
				{#if useChevrons}
					<path
						d="M6 15L12 9L18 15"
						stroke={fill}
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				{/if}
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="inline-block h-6 w-6 stroke-current"
			>
				<title>Open</title>
				{#if useChevrons}
					<path
						d="M6 9L12 15L18 9"
						stroke="#000000"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				{/if}
			</svg>
		{/if}
	</span>
</button>
