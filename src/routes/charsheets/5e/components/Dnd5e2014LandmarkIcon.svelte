<script lang="ts">
	import type { Dnd5e2014SheetLandmarkIcon } from '../sheetLandmarks';

	interface Props {
		variant: Dnd5e2014SheetLandmarkIcon | 'outline';
		classes?: string;
	}

	let { variant, classes = 'h-5 w-5' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={classes}
	aria-hidden="true"
>
	{#if variant === 'identity'}
		<circle cx="12" cy="8" r="3" />
		<path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
	{:else if variant === 'quick-reference'}
		<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z" />
	{:else if variant === 'actions'}
		<path d="m13 2-8 12h7l-1 8 8-12h-7z" />
	{:else if variant === 'abilities'}
		<path d="m12 2 8 4.5v9L12 20l-8-4.5v-9z" />
		<circle cx="9" cy="9" r=".75" fill="currentColor" stroke="none" />
		<circle cx="15" cy="9" r=".75" fill="currentColor" stroke="none" />
		<circle cx="12" cy="14.5" r=".75" fill="currentColor" stroke="none" />
	{:else if variant === 'features'}
		<circle cx="12" cy="8" r="5" />
		<path d="m8.5 11.5-1 9L12 18l4.5 2.5-1-9" />
		<path d="m12 5.5.8 1.5 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" />
	{:else if variant === 'spells'}
		<path d="m12 3 1.1 3.4L16.5 7.5l-3.4 1.1L12 12l-1.1-3.4-3.4-1.1 3.4-1.1z" />
		<path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8z" />
		<path d="m6 13 .6 1.4L8 15l-1.4.6L6 17l-.6-1.4L4 15l1.4-.6z" />
	{:else if variant === 'inventory'}
		<path d="M8 7V6a4 4 0 0 1 8 0v1" />
		<rect x="5" y="7" width="14" height="14" rx="2" />
		<path d="M8 12h8v5H8zM5 11H3v6h2M19 11h2v6h-2" />
	{:else if variant === 'notes'}
		<path d="M4 3h12l4 4v14H4z" />
		<path d="M16 3v5h5" />
		<path d="M8 13h8M8 17h6" />
	{:else}
		<circle cx="12" cy="12" r="9" />
		<path d="m15.5 8.5-2 5-5 2 2-5z" />
	{/if}
</svg>
