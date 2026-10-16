<script lang="ts">
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import '../../../app.css';
	import { charsArray, emptyChar } from '$storage/store.js';
	import type { CharacterDocument5e2014 } from '../../../schema';
	import CharacterSheet from '$lib/systems/dnd5e-2014/pages/character-sheet.svelte';
	import type { SheetNavigationHost } from '$lib/systems/dnd5e-2014/pages/sheet-navigation-host';
	import {
		closeSheetReference,
		navigateSheetLandmark,
		openSheetReference
	} from '$lib/resources/sheetReferenceNavigation';

	const { data }: { data: { id: string | null } } = $props();
	const homeHref = resolve('/');
	const requestedCharacterId = $derived(data.id?.trim() ?? '');
	const charIdx = $derived(
		requestedCharacterId
			? $charsArray.findIndex((entry) => entry.meta.id === requestedCharacterId)
			: -1
	);
	const char = $derived(($charsArray[charIdx] ?? emptyChar) as CharacterDocument5e2014);
	const owner = {
		read: () => char,
		write: (next: CharacterDocument5e2014) => {
			charsArray.update((entries) =>
				entries.map((entry) =>
					entry.meta.id === requestedCharacterId && entry.system.id === 'dnd5e-2014' ? next : entry
				)
			);
		}
	};
	const navigation: SheetNavigationHost = {
		readFragment: () => window.location.hash.slice(1),
		pushFragment: navigateSheetLandmark,
		subscribe(onTraversal) {
			window.addEventListener('popstate', onTraversal);
			return () => window.removeEventListener('popstate', onTraversal);
		},
		get activeReferenceId() {
			return (
				page.state.referenceLocatorId ??
				(page.state.referenceDirectDismissed
					? undefined
					: (page.url.searchParams.get('reference') ?? undefined))
			);
		},
		get referenceReturnFocusId() {
			return page.state.referenceReturnFocusId;
		},
		openReference: openSheetReference,
		selectReference(locatorId) {
			const sheetUrl = `/charsheets/5e${page.url.search}${window.location.hash}`;
			replaceState(resolve(sheetUrl as '/charsheets/5e'), {
				...page.state,
				referenceLocatorId: locatorId
			});
		},
		closeReference: closeSheetReference
	};
</script>

{#if charIdx === -1}
	<div class="px-4 py-4 sm:px-6">
		<div
			class="theme-grid-layer mx-auto max-w-3xl rounded-lg border p-6"
			role="alert"
			aria-live="polite"
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<h1 class="text-2xl leading-none font-bold tracking-tight">
						{requestedCharacterId ? 'Character not found.' : 'No character selected.'}
					</h1>
					<p class="theme-text-muted">
						{requestedCharacterId
							? `No local character matches the id "${requestedCharacterId}". Open a character from the home view or create a new one there.`
							: 'This route needs a character id in the URL. Open a character from the home view or create one there.'}
					</p>
				</div>
				<div class="flex justify-start">
					<a class="theme-btn-light touch-target btn rounded-md border px-3 py-1" href={homeHref}
						>Back to Characters</a
					>
				</div>
			</div>
		</div>
	</div>
{:else}
	<CharacterSheet {owner} {navigation} />
{/if}
