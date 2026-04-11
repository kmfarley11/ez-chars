<script lang="ts">
	import { resolve } from '$app/paths';
	import { charsArray, createNew5eCharacter, deleteCharacterById } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import type { CharacterWithSystemData } from '../schema/index.js';
	import { FULL_2014_SRD_HREF, OFFICIAL_2014_CHAR_SHEET_HREF } from '$lib/urlHelpers.js';

	const charsheetHref = resolve('/charsheets/5e');
	const openCharacterSheet = (charId: string) => {
		location.href = `${charsheetHref}?id=${encodeURIComponent(charId)}`;
	};

	const handleCharSelect = (char: CharacterWithSystemData) => {
		openCharacterSheet(char.meta.id);
	};

	const handleCreateNew5eCharacter = () => {
		const nextCharacter = createNew5eCharacter();
		openCharacterSheet(nextCharacter.meta.id);
	};

	const handleCharacterDelete = (char: CharacterWithSystemData) => {
		deleteCharacterById(char.meta.id);
	};
</script>

<div class="px-4 py-4 sm:px-6">
	<h1 class="mb-4 text-4xl leading-none font-extrabold tracking-tight md:text-5xl lg:text-6xl">
		Welcome to ez-chars!
	</h1>

	<div class="space-y-4 pb-4">
		<div class="pl-0">
			<p class="theme-text-muted text-base">
				Need the official 2014 D&D 5e form-fillable sheet? Grab it&nbsp;
				<a
					class="theme-link underline"
					href={OFFICIAL_2014_CHAR_SHEET_HREF}
					target="_blank"
					rel="external noreferrer">here</a
				>.
			</p>
			<p class="theme-text-muted text-base">
				Want the full 2014 5e SRD PDF with bookmarks? View it&nbsp;
				<a
					class="theme-link underline"
					href={FULL_2014_SRD_HREF}
					target="_blank"
					rel="external noreferrer">here</a
				>.
			</p>
		</div>
		<div class="-ml-1">
			<MenuButton text="Create Character" iconVariant="chevron" align="left">
				<MenuItemButton onclick={handleCreateNew5eCharacter}
					>Create New 2014 5e Character</MenuItemButton
				>
			</MenuButton>
		</div>
	</div>

	<Table tableData={$charsArray} onSelect={handleCharSelect} onDelete={handleCharacterDelete} />
</div>
