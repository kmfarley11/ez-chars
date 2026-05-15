<script lang="ts">
	import { resolve } from '$app/paths';
	import { charsArray, createNew5eCharacter, deleteCharacterById } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import { createCharacterExportEnvelope, type CharacterWithSystemData } from '../schema/index.js';
	import { FULL_2014_SRD_HREF, OFFICIAL_2014_CHAR_SHEET_HREF } from '$lib/urlHelpers.js';

	const charsheetHref = resolve('/charsheets/5e');
	const jsonMimeType = 'application/json';
	let importFileInput = $state<HTMLInputElement>();
	let selectedImportFileName = $state('');

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

	const toExportFileName = (exportedAt: string): string => {
		const timestamp = exportedAt.replace(/[:.]/g, '-');
		return `ez-chars-${timestamp}.json`;
	};

	const handleExportCharacters = () => {
		const envelope = createCharacterExportEnvelope($charsArray);
		const blob = new Blob([JSON.stringify(envelope, null, 2)], {
			type: jsonMimeType
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = toExportFileName(envelope.exportedAt);
		link.rel = 'noopener';
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	};

	const handleChooseImportFile = () => {
		if (!importFileInput) return;
		importFileInput.value = '';
		importFileInput.click();
	};

	const handleImportFileSelect = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		selectedImportFileName = input.files?.[0]?.name ?? '';
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
		<div class="flex flex-wrap items-start gap-2">
			<div class="-ml-1">
				<MenuButton text="Create Character" iconVariant="chevron" align="left">
					<MenuItemButton onclick={handleCreateNew5eCharacter}
						>Create New 2014 5e Character</MenuItemButton
					>
				</MenuButton>
			</div>
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-2 font-semibold"
				onclick={handleExportCharacters}
			>
				Export Characters
			</button>
			<div class="flex min-w-0 flex-col gap-1">
				<input
					bind:this={importFileInput}
					class="sr-only"
					type="file"
					accept=".json,application/json"
					aria-label="Choose character import JSON file"
					onchange={handleImportFileSelect}
				/>
				<button
					type="button"
					class="theme-btn-light btn rounded-md border px-3 py-2 font-semibold"
					onclick={handleChooseImportFile}
				>
					Choose Import File
				</button>
				{#if selectedImportFileName}
					<p class="theme-text-muted max-w-72 truncate text-sm">
						Selected: {selectedImportFileName}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<Table tableData={$charsArray} onSelect={handleCharSelect} onDelete={handleCharacterDelete} />
</div>
