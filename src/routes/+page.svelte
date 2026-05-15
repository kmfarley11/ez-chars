<script lang="ts">
	import { resolve } from '$app/paths';
	import { charsArray, createNew5eCharacter, deleteCharacterById } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import {
		createCharacterExportEnvelope,
		safeParseCharacterExportEnvelope,
		type CharacterExportEnvelope,
		type CharacterWithSystemData
	} from '../schema/index.js';
	import { FULL_2014_SRD_HREF, OFFICIAL_2014_CHAR_SHEET_HREF } from '$lib/urlHelpers.js';

	type ImportValidationState = 'idle' | 'reading' | 'valid' | 'error' | 'applied';

	const charsheetHref = resolve('/charsheets/5e');
	const jsonMimeType = 'application/json';
	let importFileInput = $state<HTMLInputElement>();
	let selectedImportFileName = $state('');
	let importValidationState = $state<ImportValidationState>('idle');
	let importValidationMessage = $state('');
	let pendingImportEnvelope = $state<CharacterExportEnvelope>();

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
		selectedImportFileName = '';
		importValidationState = 'idle';
		importValidationMessage = '';
		pendingImportEnvelope = undefined;
		importFileInput.click();
	};

	const handleImportFileSelect = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFile = input.files?.[0];
		selectedImportFileName = selectedFile?.name ?? '';
		pendingImportEnvelope = undefined;

		if (!selectedFile) {
			importValidationState = 'idle';
			importValidationMessage = '';
			return;
		}

		importValidationState = 'reading';
		importValidationMessage = 'Checking import file...';

		let parsedJson: unknown;
		try {
			parsedJson = JSON.parse(await selectedFile.text());
		} catch {
			importValidationState = 'error';
			importValidationMessage = 'That file is not valid JSON.';
			return;
		}

		const parsedEnvelope = safeParseCharacterExportEnvelope(parsedJson);
		if (!parsedEnvelope.success) {
			importValidationState = 'error';
			importValidationMessage =
				'That JSON file is not a supported ez-chars character export, or one of its characters is invalid.';
			return;
		}

		pendingImportEnvelope = parsedEnvelope.data;
		importValidationState = 'valid';
		importValidationMessage = `Ready to import ${parsedEnvelope.data.characters.length} character${parsedEnvelope.data.characters.length === 1 ? '' : 's'}. Choose how to apply it in the next step.`;
	};

	const handleReplaceImportedCharacters = () => {
		if (!pendingImportEnvelope) return;
		const importedCount = pendingImportEnvelope.characters.length;
		charsArray.set(pendingImportEnvelope.characters);
		pendingImportEnvelope = undefined;
		importValidationState = 'applied';
		importValidationMessage = `Replaced local characters with ${importedCount} imported character${importedCount === 1 ? '' : 's'}.`;
	};

	const handleMergeImportedCharacters = () => {
		if (!pendingImportEnvelope) return;
		const importEnvelope = pendingImportEnvelope;

		let addedCount = 0;
		let skippedCount = 0;
		charsArray.update((currentCharacters) => {
			const existingIds = currentCharacters.map((character) => character.meta.id);
			const newCharacters = importEnvelope.characters.filter((character) => {
				if (existingIds.includes(character.meta.id)) {
					skippedCount += 1;
					return false;
				}
				addedCount += 1;
				existingIds.push(character.meta.id);
				return true;
			});

			return [...currentCharacters, ...newCharacters];
		});

		pendingImportEnvelope = undefined;
		importValidationState = 'applied';
		importValidationMessage = `Merged ${addedCount} new character${addedCount === 1 ? '' : 's'}${skippedCount > 0 ? ` and skipped ${skippedCount} duplicate ${skippedCount === 1 ? 'character' : 'characters'}` : ''}.`;
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
				{#if importValidationMessage}
					<p
						class="max-w-96 text-sm {importValidationState === 'error'
							? 'text-red-700 dark:text-red-300'
							: 'theme-text-muted'}"
						role={importValidationState === 'error' ? 'alert' : 'status'}
						aria-live="polite"
					>
						{importValidationMessage}
					</p>
				{/if}
				{#if pendingImportEnvelope}
					<div class="flex flex-wrap gap-2" aria-label="Apply imported characters">
						<button
							type="button"
							class="theme-btn-light btn rounded-md border px-3 py-2 text-sm font-semibold"
							onclick={handleMergeImportedCharacters}
						>
							Merge New
						</button>
						<button
							type="button"
							class="theme-btn-light btn rounded-md border px-3 py-2 text-sm font-semibold"
							onclick={handleReplaceImportedCharacters}
						>
							Replace All
						</button>
					</div>
					<p class="theme-text-muted max-w-96 text-xs">
						Merge skips characters with IDs already in your local list. Replace discards the current
						local list.
					</p>
				{/if}
			</div>
		</div>
	</div>

	<Table tableData={$charsArray} onSelect={handleCharSelect} onDelete={handleCharacterDelete} />
</div>
