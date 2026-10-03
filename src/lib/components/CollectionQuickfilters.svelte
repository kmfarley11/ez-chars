<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChipButton from './ChipButton.svelte';
	let {
		title,
		label,
		heading = label,
		options,
		selected = $bindable([]),
		query = $bindable(''),
		extra
	}: {
		title: string;
		label: string;
		heading?: string;
		options: ReadonlyArray<{ key: string; label: string }>;
		selected?: string[];
		query?: string;
		extra?: Snippet;
	} = $props();
	const uid = $props.id();
	const toggle = (key: string) => {
		selected = selected.includes(key)
			? selected.filter((value) => value !== key)
			: [...selected, key];
	};
</script>

{#snippet choices()}
	<div
		id={`${uid}-choices`}
		role="group"
		aria-label={`Quick filters: ${heading}`}
		class="flex min-w-0 flex-wrap items-center gap-1"
	>
		{#each options as option (option.key)}
			<ChipButton
				label={option.label}
				selected={selected.includes(option.key)}
				onclick={() => toggle(option.key)}
			/>
		{/each}
		{@render extra?.()}
		<ChipButton
			label={`Reset ${label.toLowerCase()}`}
			disabled={selected.length === 0}
			onclick={() => (selected = [])}
		/>
	</div>
{/snippet}

<div class="space-y-2">
	<div class="flex flex-wrap items-center gap-2">
		<label for={`${uid}-query`} class="min-w-0 flex-1">
			<span class="sr-only">Search {title}</span>
			<input
				id={`${uid}-query`}
				type="search"
				class="theme-input touch-target w-full rounded-md border px-3 py-1.5 text-base md:text-sm"
				placeholder={`Search ${title.toLowerCase()}`}
				bind:value={query}
			/>
		</label>
		<ChipButton label="Clear search" disabled={!query.trim()} onclick={() => (query = '')} />
	</div>
	<p class="theme-text-muted text-xs font-semibold">Quick filters: {heading}</p>
	{@render choices()}
</div>
