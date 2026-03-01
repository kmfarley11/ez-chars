<script>
	/** @typedef {'chevron' | 'hamburger' | 'kebab'} IconVariant */
	let { text, iconVariant = 'hamburger', isOpen, handleClick, shadingVariant = 'light' } = $props();

	let fill = $derived(
		shadingVariant === 'dark' ? 'var(--color-brand-text)' : 'var(--color-surface-text)'
	);

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
</script>

<button
	class="btn m-1 rounded-lg border {colors} p-2 shadow-lg ring-2 ring-black/5 focus:outline-hidden"
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
				{#if iconVariant === 'chevron'}
					<path
						d="M6 15L12 9L18 15"
						stroke={fill}
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
					/>
				{:else if iconVariant === 'hamburger'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				{:else}
					<g transform="rotate(90 12 12)">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</g>
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
				{#if iconVariant === 'chevron'}
					<path
						d="M6 9L12 15L18 9"
						stroke={fill}
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else if iconVariant === 'hamburger'}
					<path
						stroke={fill}
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				{:else}
					<circle cx="12" cy="6" r="1.5" {fill} stroke="none"></circle>
					<circle cx="12" cy="12" r="1.5" {fill} stroke="none"></circle>
					<circle cx="12" cy="18" r="1.5" {fill} stroke="none"></circle>
				{/if}
			</svg>
		{/if}
	</span>
</button>
