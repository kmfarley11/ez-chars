<script lang="ts">
	import CharacterSheet from './character-sheet.svelte';
	import StorySurface from '$lib/storybook/story-surface.svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import type { SheetNavigationHost } from '$lib/navigation/sheet-navigation-host';
	import { createCanonicalSheetState } from '$lib/storybook/canonical-sheet-state';
	let { fixture }: { fixture: CharacterDocument5e2014 } = $props();
	const sandbox = $derived(
		createCanonicalSheetState<CharacterDocument5e2014>($state.snapshot(fixture))
	);
	let revision = $state(0);
	let generation = $state(0);
	let rejectSaves = $state(false);
	let referenceId = $state<string>();
	let returnFocusId = $state<string>();
	let fragment = '';
	const owner = {
		read: () => {
			revision;
			return sandbox.read();
		},
		write: (next: CharacterDocument5e2014) => {
			sandbox.write(next);
			revision += 1;
		},
		reject: () => rejectSaves
	};
	const navigation: SheetNavigationHost = {
		readFragment: () => fragment,
		pushFragment: (id) => {
			fragment = id;
		},
		// There is no browser traversal in the sandbox; explicit jumps still work.
		subscribe: () => () => {},
		get activeReferenceId() {
			return referenceId;
		},
		get referenceReturnFocusId() {
			return returnFocusId;
		},
		openReference: (id, focusId) => {
			if (!referenceId) returnFocusId = focusId;
			referenceId = id;
		},
		selectReference: (id) => {
			referenceId = id;
		},
		closeReference: () => {
			referenceId = undefined;
		}
	};
	const reset = () => {
		sandbox.reset();
		rejectSaves = false;
		referenceId = undefined;
		returnFocusId = undefined;
		fragment = '';
		revision += 1;
		generation += 1;
	};
</script>

<StorySurface>
	<section
		aria-label="Canonical example guidance"
		class="theme-muted-surface m-3 space-y-2 rounded-md border p-3 text-sm"
	>
		<h1 class="font-bold">Production-backed 2014 character sheet</h1>
		<p>
			This is the app's actual sheet composition with an isolated copy of {fixture.systemData
				.identity.name}. No saved characters or localStorage are used. App navigation chrome and
			storage recovery are not included.
		</p>
		<p>
			Section jumps and Rules work inside this preview. Browser Back/Forward and persistence must be
			checked in the app; this sandbox does not change the Storybook URL.
		</p>
		<p>
			Accessibility scans are on-demand here to keep this large example responsive. Open the
			Accessibility panel and run its test when wanted; automated catalog tests still audit this
			entire sheet.
		</p>
		<ul class="list-disc space-y-1 pl-5">
			<li>
				Edit Current HP, open a read-first field by label, add a note, and pin an item. Compare the
				same sections in the app at desktop and phone widths.
			</li>
			<li>
				Enable rejected saves and try those edits plus collection Add/Remove. Draft-aware controls
				retain their existing error/recovery behavior. Reset, switch stories, and return to check
				isolation.
			</li>
			<li>
				All character writes are rejected when enabled, including runtime patches, structured edits,
				focused values/notes, Add/Remove, and pins. Legacy Runtime Action creation/resync callbacks
				do not show a recoverable save error; creation can close without adding. This is simulated
				rejection, not a storage-failure test.
			</li>
			<li>
				On desktop, Reset while the non-modal reader is open. With a modal detail open, switch
				stories and return instead (Reset is intentionally outside that modal). The new instance
				should have no stale dialog, query, or reference.
			</li>
		</ul>
	</section>
	<div class="m-3 flex flex-wrap items-center gap-3" aria-label="Sandbox controls">
		<BaseButton onclick={reset}>Reset example</BaseButton>
		<label class="touch-target flex cursor-pointer items-center gap-2"
			><input type="checkbox" bind:checked={rejectSaves} />Reject character saves</label
		>
	</div>
	{#key sandbox}
		{#key generation}
			<CharacterSheet {owner} {navigation} />
		{/key}
	{/key}
</StorySurface>
