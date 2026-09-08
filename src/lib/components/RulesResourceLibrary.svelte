<script lang="ts">
	import { asset } from '$app/paths';
	import BaseButton from '$components/BaseButton.svelte';
	import PanelSurface from '$components/PanelSurface.svelte';
	import {
		projectResourceLibrary,
		type ResourceLibraryProjection
	} from '$lib/resources/resourceLibrary';
	import type { ResourceCatalog, ResourceDisposition } from '$lib/resources/resourceCatalog';

	interface Props {
		catalog: ResourceCatalog;
		systemId?: string;
		query?: string;
		searchInputEl?: HTMLInputElement;
		// eslint-disable-next-line no-unused-vars
		onOpenInternal?: (locatorId: string, invoker: HTMLElement) => void;
	}

	let {
		catalog,
		systemId = undefined,
		query = $bindable(''),
		searchInputEl = $bindable(),
		onOpenInternal = undefined
	}: Props = $props();

	const uid = $props.id();
	const projection: ResourceLibraryProjection = $derived(
		projectResourceLibrary(catalog, query, {
			systemId,
			resolveAssetHref: (path) => asset(path as Parameters<typeof asset>[0])
		})
	);
	const resultCountLabel = $derived(
		projection.hasQuery
			? `${projection.results.length} of ${projection.totalTopics} topics`
			: `${projection.results.length} ${projection.results.length === 1 ? 'topic' : 'topics'}`
	);

	const openInternal = (disposition: ResourceDisposition, event: MouseEvent) => {
		if (!onOpenInternal) return;
		onOpenInternal(disposition.locator.id, event.currentTarget as HTMLElement);
	};
	const accessLabel = (access: ResourceDisposition['resource']['access']): string =>
		access === 'included'
			? 'Included with app'
			: access === 'free-external'
				? 'Free external source'
				: 'Requires your copy';
	const deliveryLabel = (delivery: ResourceDisposition['resource']['delivery']): string =>
		delivery === 'self-hosted' ? 'In-app document' : 'External link only';
	const healthLabel = (health: ResourceDisposition['locator']['health']): string =>
		health === 'verified' ? 'Verified' : 'Needs review';
</script>

<section class="flex min-h-0 flex-1 flex-col gap-3" aria-labelledby={`${uid}-heading`}>
	<header class="space-y-1">
		<h2 id={`${uid}-heading`} class="text-base font-bold">Find rules resources</h2>
		<p class="theme-text-muted text-sm">
			Search source titles, rules versions, topics, and curated section descriptions.
		</p>
	</header>

	<div class="flex flex-wrap items-end gap-2" role="search">
		<label class="min-w-48 flex-1 space-y-1" for={`${uid}-search`}>
			<span class="sr-only">Search rules resources</span>
			<input
				bind:this={searchInputEl}
				id={`${uid}-search`}
				type="search"
				class="theme-input touch-target w-full rounded-md border px-3 py-1.5"
				placeholder="Search rules resources"
				bind:value={query}
			/>
		</label>
		{#if projection.hasQuery}
			<BaseButton size="sm" onclick={() => (query = '')}>Clear search</BaseButton>
		{/if}
	</div>

	<p class="theme-text-muted text-xs" role="status" aria-live="polite">{resultCountLabel}</p>

	{#if projection.catalogEmpty}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
			No rules resources are registered for this character system.
		</p>
	{:else if projection.results.length === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
			No rules resources match “{projection.query}”.
			<button
				type="button"
				class="theme-link cursor-pointer font-semibold underline underline-offset-2"
				onclick={() => (query = '')}>Clear</button
			>
			or revise the search.
		</p>
	{:else}
		<ul class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" aria-label="Rules resource results">
			{#each projection.results as result (result.topic.id)}
				<li>
					<PanelSurface classes="m-0 space-y-3 p-3">
						<div>
							<h3 class="font-semibold">{result.topic.label}</h3>
							<p class="theme-text-muted text-sm">{result.topic.description}</p>
						</div>
						{@render source(result.preferred, true)}
						{#if result.alternates.length > 0}
							<details>
								<summary class="touch-target cursor-pointer text-sm font-semibold underline">
									Other sources ({result.alternates.length})
								</summary>
								<ul class="mt-2 space-y-3 border-l pl-3">
									{#each result.alternates as alternate (alternate.locator.id)}
										<li>{@render source(alternate, false)}</li>
									{/each}
								</ul>
							</details>
						{/if}
					</PanelSurface>
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#snippet source(disposition: ResourceDisposition, preferred: boolean)}
	<div class="space-y-2">
		<div>
			<p class="text-sm font-semibold">{disposition.locator.label}</p>
			<p class="theme-text-muted text-xs">
				{disposition.resource.title} · {disposition.resource.rulesVersion}
			</p>
		</div>
		{#if disposition.kind === 'internal'}
			{#if onOpenInternal}
				<BaseButton
					id={`${uid}-${disposition.locator.id}-open`}
					size="sm"
					onclick={(event) => openInternal(disposition, event)}>Open</BaseButton
				>
			{:else}
				<a
					class="theme-link touch-target inline-flex items-center underline"
					href={disposition.browserHref}
					target="_blank"
					rel="external noopener noreferrer">Open in browser</a
				>
			{/if}
		{:else if disposition.kind === 'external'}
			<p class="text-sm">
				{disposition.resource.accessGuidance ?? 'Source not included; opens at the publisher.'}
			</p>
			<a
				class="theme-link touch-target inline-flex items-center underline"
				href={disposition.externalHref}
				target="_blank"
				rel="external noopener noreferrer">Open at publisher (external)</a
			>
		{:else if disposition.kind === 'stale'}
			<p class="text-sm" role="status">
				Exact location needs review; the app will not guess a replacement.
			</p>
			{#if disposition.safeOpenKind === 'internal' && onOpenInternal}
				<BaseButton
					id={`${uid}-${disposition.locator.id}-open`}
					size="sm"
					onclick={(event) => openInternal(disposition, event)}
				>
					Open document
				</BaseButton>
			{:else if disposition.safeOpenKind === 'external'}
				<a
					class="theme-link touch-target inline-flex items-center underline"
					href={disposition.externalHref}
					target="_blank"
					rel="external noopener noreferrer">Open source (external)</a
				>
			{/if}
		{:else}
			<p class="text-sm" role="status">
				Source unavailable. Its citation remains available for reference.
			</p>
			<span
				class="theme-muted-surface inline-flex rounded-full border px-2 py-1 text-xs font-semibold"
			>
				Unavailable
			</span>
		{/if}
		<details>
			<summary class="touch-target cursor-pointer text-sm underline">Source details</summary>
			<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
				<dt class="font-semibold">Source</dt>
				<dd>{disposition.resource.title}</dd>
				<dt class="font-semibold">Version</dt>
				<dd>{disposition.resource.rulesVersion}</dd>
				<dt class="font-semibold">Publisher</dt>
				<dd>{disposition.resource.publisher}</dd>
				<dt class="font-semibold">Access</dt>
				<dd>{accessLabel(disposition.resource.access)}</dd>
				<dt class="font-semibold">Delivery</dt>
				<dd>{deliveryLabel(disposition.resource.delivery)}</dd>
				<dt class="font-semibold">Locator</dt>
				<dd>{healthLabel(disposition.locator.health)}</dd>
				<dt class="font-semibold">Attribution</dt>
				<dd>{disposition.resource.attributionReference}</dd>
			</dl>
		</details>
		{#if preferred}
			<span class="sr-only">Preferred source</span>
		{/if}
	</div>
{/snippet}
