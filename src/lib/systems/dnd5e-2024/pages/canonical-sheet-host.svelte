<script lang="ts">
	import StorySurface from '$lib/storybook/story-surface.svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import { createCanonicalSheetState } from '$lib/storybook/canonical-sheet-state';
	import type { SheetNavigationHost } from '$lib/navigation/sheet-navigation-host';
	import type { CharacterDocument5e2024 } from '../../../../schema/system-5e2024';
	import CharacterSheet from './character-sheet.svelte';
	let { fixture }: { fixture: CharacterDocument5e2024 } = $props();
	const sandbox = $derived(createCanonicalSheetState($state.snapshot(fixture)));
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
		write: (next: CharacterDocument5e2024) => {
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
		class="theme-muted-surface m-3 space-y-2 rounded-md border p-3 text-sm"
		aria-label="Canonical example guidance"
	>
		<h1 class="font-bold">Review these interactions</h1>
		<p>
			Isolated {fixture.systemData.identity.name}; changes here do not affect saved characters.
		</p>
		<p>Values are authored: class rules, bonuses and spell progression are not calculated.</p>
		<ul class="list-disc space-y-1 pl-5">
			<li>HP: cancel, save, then try a negative value. Errors must retain your draft.</li>
			<li>Species → notes: read/edit a note, inspect its source, then Back. Keep unsaved work.</li>
			<li>Inventory: add, pin, change Category, remove. Action filters + search must compose.</li>
			<li>
				Quarterstaff strike → View source: edit, then Back. The action stays unchanged until Refresh
				from source: cancel, then confirm. Add still offers source or custom. Delete the source: the
				action, notes and pin must remain.
			</li>
			<li>Rules: SRD 5.2.1. Repeat at phone width; test reload/browser Back in the app.</li>
			<li>Reject saves, try an edit, then Reset. The example and controls must reset.</li>
		</ul>
	</section>
	<div class="m-3 flex flex-wrap items-center gap-3" aria-label="Sandbox controls">
		<BaseButton onclick={reset}>Reset example</BaseButton>
		<label class="touch-target flex cursor-pointer items-center gap-2"
			><input type="checkbox" bind:checked={rejectSaves} />Reject character saves</label
		>
	</div>
	{#key sandbox}{#key generation}<CharacterSheet {owner} {navigation} />{/key}{/key}
</StorySurface>
