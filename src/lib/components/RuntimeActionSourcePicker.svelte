<script lang="ts">
	import Badge from '$components/Badge.svelte';
	import {
		filter5eRuntimeActionSourceCandidates,
		type RuntimeActionSourceCandidate,
		type RuntimeActionSourceCategoryFilter
	} from '$lib/dnd5e2014/runtimeActionSources';

	interface Props {
		candidates: ReadonlyArray<RuntimeActionSourceCandidate>;
		selectedKey?: string;
		searchQuery?: string;
		category?: RuntimeActionSourceCategoryFilter;
		equippedOnly?: boolean;
		// eslint-disable-next-line no-unused-vars
		onSelect?: (_key: string) => void;
	}

	let {
		candidates,
		selectedKey,
		searchQuery = $bindable(''),
		category = $bindable('all'),
		equippedOnly = $bindable(false),
		onSelect
	}: Props = $props();

	const categoryOptions: Array<{
		value: RuntimeActionSourceCategoryFilter;
		label: string;
	}> = [
		{ value: 'all', label: 'All' },
		{ value: 'inventory', label: 'Inventory' },
		{ value: 'spell', label: 'Spells' },
		{ value: 'feature', label: 'Features' },
		{ value: 'trait', label: 'Traits' }
	];

	const filteredCandidates = $derived(
		filter5eRuntimeActionSourceCandidates(candidates, {
			query: searchQuery,
			category,
			equippedOnly
		})
	);
	const selectedCandidate = $derived(candidates.find((candidate) => candidate.key === selectedKey));
	const selectedCandidateInView = $derived(
		filteredCandidates.some((candidate) => candidate.key === selectedKey)
	);
</script>

{#snippet candidateBadges(candidate: RuntimeActionSourceCandidate)}
	{#if candidate.badges.length > 0}
		<div class="flex shrink-0 flex-wrap justify-end gap-1">
			{#each candidate.badges as badge (badge)}
				<Badge label={badge} />
			{/each}
		</div>
	{/if}
{/snippet}

<div class="flex flex-col gap-4">
	<input
		type="search"
		placeholder="Search action sources..."
		class="theme-input rounded-md border px-3 py-1.5"
		bind:value={searchQuery}
		aria-label="Search action sources"
	/>

	<div class="flex flex-wrap gap-1" role="group" aria-label="Source category">
		{#each categoryOptions as option (option.value)}
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-2.5 py-1 text-sm"
				class:font-semibold={category === option.value}
				aria-pressed={category === option.value}
				onclick={() => (category = option.value)}
			>
				{option.label}
			</button>
		{/each}
	</div>

	{#if category === 'inventory'}
		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				class="theme-input h-4 w-4 rounded border"
				bind:checked={equippedOnly}
			/>
			<span class="text-sm">Equipped only</span>
		</label>
	{/if}

	<ul class="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-md border p-2">
		{#if selectedCandidate && !selectedCandidateInView}
			<li class="rounded-md border border-blue-500/30 bg-blue-500/5">
				<button
					type="button"
					class="w-full px-3 py-2 text-left"
					onclick={() => onSelect?.(selectedCandidate.key)}
					aria-pressed="true"
				>
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold">{selectedCandidate.label}</p>
							<p class="theme-text-muted truncate text-xs">
								{selectedCandidate.context}
							</p>
						</div>
						<div class="flex shrink-0 flex-col items-end gap-1">
							{@render candidateBadges(selectedCandidate)}
							<span class="text-sm text-blue-600 dark:text-blue-300">Selected (filtered)</span>
						</div>
					</div>
				</button>
			</li>
		{/if}

		{#each filteredCandidates as candidate (candidate.key)}
			{@const isSelected = candidate.key === selectedKey}
			<li
				class="rounded-md border {isSelected
					? 'border-blue-500 ring-1 ring-blue-500'
					: 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}"
			>
				<button
					type="button"
					class="w-full px-3 py-2 text-left"
					onclick={() => onSelect?.(candidate.key)}
					aria-pressed={isSelected}
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold">{candidate.label}</p>
							<p class="theme-text-muted truncate text-xs">{candidate.context}</p>
							{#if candidate.detail}
								<p class="theme-text-muted mt-1 truncate text-xs">{candidate.detail}</p>
							{/if}
						</div>
						{@render candidateBadges(candidate)}
					</div>
				</button>
			</li>
		{:else}
			<li class="px-3 py-4 text-center">
				<p class="theme-text-muted text-sm">No action sources match these filters.</p>
			</li>
		{/each}
	</ul>
</div>
