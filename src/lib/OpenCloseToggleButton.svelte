<script lang="ts">
	import BaseButton from './BaseButton.svelte';

	type IconVariant = 'chevron' | 'hamburger' | 'kebab';
	type ButtonShadingVariant = 'dark' | 'light';

	interface Props {
		text?: string;
		iconVariant?: IconVariant;
		isOpen: boolean;
		handleClick: () => void;
		shadingVariant?: ButtonShadingVariant;
	}

	let {
		text,
		iconVariant = 'hamburger',
		isOpen,
		handleClick,
		shadingVariant = 'light'
	}: Props = $props();
</script>

<BaseButton onclick={handleClick} {shadingVariant} ariaExpanded={isOpen}>
	{#if text !== undefined}
		<span>{text}</span>
	{/if}
	<span class="inline-flex h-6 w-6 items-center justify-center" aria-hidden="true">
		{#if isOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="h-6 w-6 stroke-current"
			>
				<title>Close</title>
				{#if iconVariant === 'chevron'}
					<path
						d="M6 15L12 9L18 15"
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
				class="h-6 w-6 stroke-current"
			>
				<title>Open</title>
				{#if iconVariant === 'chevron'}
					<path
						d="M6 9L12 15L18 9"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else if iconVariant === 'hamburger'}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				{:else}
					<circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
					<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
					<circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"></circle>
				{/if}
			</svg>
		{/if}
	</span>
</BaseButton>
