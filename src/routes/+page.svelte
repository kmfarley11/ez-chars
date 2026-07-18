<script lang="ts">
	import { resolve } from '$app/paths';
	import { charsArray, createNew5eCharacter, deleteCharacterById } from '$storage/store.js';

	import BaseButton from '$components/BaseButton.svelte';
	import Table from '$components/Table.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import {
		applyCharacterImport,
		createCharacterExportEnvelope,
		safeParseCharacterExportEnvelope,
		type CharacterExportEnvelope,
		type CharacterWithSystemData
	} from '../schema/index.js';
	import { FULL_2014_SRD_HREF, OFFICIAL_2014_CHAR_SHEET_HREF } from '$utils/urlHelpers.js';

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
		const importResult = applyCharacterImport($charsArray, pendingImportEnvelope, 'replace');
		charsArray.set(importResult.characters);
		pendingImportEnvelope = undefined;
		importValidationState = 'applied';
		importValidationMessage = `Replaced local characters with ${importResult.addedCount} imported character${importResult.addedCount === 1 ? '' : 's'}.`;
	};

	const handleMergeImportedCharacters = () => {
		if (!pendingImportEnvelope) return;
		const importEnvelope = pendingImportEnvelope;

		let importResult: ReturnType<typeof applyCharacterImport> | undefined;
		charsArray.update((currentCharacters) => {
			importResult = applyCharacterImport(currentCharacters, importEnvelope, 'merge-new');
			return importResult.characters;
		});

		pendingImportEnvelope = undefined;
		importValidationState = 'applied';
		importValidationMessage = `Merged ${importResult?.addedCount ?? 0} new character${importResult?.addedCount === 1 ? '' : 's'}${importResult && importResult.skippedDuplicateCount > 0 ? ` and skipped ${importResult.skippedDuplicateCount} duplicate ${importResult.skippedDuplicateCount === 1 ? 'character' : 'characters'}` : ''}.`;
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
		<div class="flex flex-wrap items-start justify-between gap-2">
			<div>
				<MenuButton text="Create Character" iconVariant="chevron" align="left">
					<MenuItemButton onclick={handleCreateNew5eCharacter}
						>Create New 2014 5e Character</MenuItemButton
					>
				</MenuButton>
			</div>
			<div class="ml-auto flex min-w-0 flex-wrap items-start justify-end gap-2">
				<div class="flex min-w-0 flex-col items-end gap-1">
					<input
						bind:this={importFileInput}
						class="sr-only"
						type="file"
						accept=".json,application/json"
						aria-label="Choose character import JSON file"
						onchange={handleImportFileSelect}
					/>
					<BaseButton onclick={handleChooseImportFile}>Import Characters</BaseButton>
					{#if selectedImportFileName}
						<p class="theme-text-muted max-w-72 truncate text-right text-sm">
							Selected: {selectedImportFileName}
						</p>
					{/if}
					{#if importValidationMessage}
						<p
							class="max-w-96 text-right text-sm {importValidationState === 'error'
								? 'text-red-700 dark:text-red-300'
								: 'theme-text-muted'}"
							role={importValidationState === 'error' ? 'alert' : 'status'}
							aria-live="polite"
						>
							{importValidationMessage}
						</p>
					{/if}
					{#if pendingImportEnvelope}
						<div class="flex flex-wrap justify-end gap-2" aria-label="Apply imported characters">
							<BaseButton size="sm" onclick={handleMergeImportedCharacters}>Merge New</BaseButton>
							<BaseButton size="sm" onclick={handleReplaceImportedCharacters}
								>Replace All</BaseButton
							>
						</div>
						<p class="theme-text-muted max-w-96 text-right text-xs">
							Merge skips characters with IDs already in your local list. Replace discards the
							current local list.
						</p>
					{/if}
				</div>
				<BaseButton onclick={handleExportCharacters}>Export Characters</BaseButton>
			</div>
		</div>
	</div>

	<Table tableData={$charsArray} onSelect={handleCharSelect} onDelete={handleCharacterDelete} />
</div>
