<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { tick } from 'svelte';
	import { charsArray, createNew5eCharacter, deleteCharacterById } from '$storage/store.js';

	import BaseButton from '$components/BaseButton.svelte';
	import Table from '$components/Table.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import CharacterImportDialog from './components/CharacterImportDialog.svelte';
	import CharacterExportDialog from './components/CharacterExportDialog.svelte';
	import {
		applyCharacterImport,
		createCharacterExportEnvelope,
		safeParseCharacterExportEnvelope,
		type CharacterExportEnvelope,
		type CharacterWithSystemData
	} from '../schema/index.js';
	import { FULL_2014_SRD_PATH, OFFICIAL_2014_CHAR_SHEET_HREF } from '$utils/urlHelpers.js';

	const charsheetHref = resolve('/charsheets/5e');
	const jsonMimeType = 'application/json';
	let importFileInput = $state<HTMLInputElement>();
	let importButtonEl = $state<HTMLButtonElement>();
	let exportButtonEl = $state<HTMLButtonElement>();

	// Import State
	let importDialogOpen = $state(false);
	let importState = $state<'reading' | 'error' | 'ready' | 'success'>('reading');
	let importErrorMessage = $state('');
	let importCharacterCount = $state(0);
	let importSuccessMessage = $state('');
	let pendingImportEnvelope = $state<CharacterExportEnvelope>();
	let importAttemptToken = $state(0);

	// Export State
	let exportDialogOpen = $state(false);

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

	const handleExportConfirm = async () => {
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

		exportDialogOpen = false;
		await tick();
		exportButtonEl?.focus();
	};

	const handleExportClose = async () => {
		exportDialogOpen = false;
		await tick();
		exportButtonEl?.focus();
	};

	const handleChooseImportFile = () => {
		if (!importFileInput) return;
		importFileInput.value = '';
		pendingImportEnvelope = undefined;
		importFileInput.click();
	};

	const handleImportFileSelect = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFile = input.files?.[0];
		pendingImportEnvelope = undefined;

		if (!selectedFile) {
			return;
		}

		importDialogOpen = true;
		importState = 'reading';

		importAttemptToken++;
		const currentToken = importAttemptToken;

		let parsedJson: unknown;
		try {
			parsedJson = JSON.parse(await selectedFile.text());
		} catch {
			if (importAttemptToken !== currentToken) return;
			importState = 'error';
			importErrorMessage = 'That file is not valid JSON.';
			return;
		}

		if (importAttemptToken !== currentToken) return;

		const parsedEnvelope = safeParseCharacterExportEnvelope(parsedJson);
		if (!parsedEnvelope.success) {
			importState = 'error';
			importErrorMessage =
				'That JSON file is not a supported ez-chars character export, or one of its characters is invalid.';
			return;
		}

		pendingImportEnvelope = parsedEnvelope.data;
		importCharacterCount = parsedEnvelope.data.characters.length;
		importState = 'ready';
	};

	const handleReplaceImportedCharacters = () => {
		if (!pendingImportEnvelope) return;
		const importResult = applyCharacterImport($charsArray, pendingImportEnvelope, 'replace');
		charsArray.set(importResult.characters);
		pendingImportEnvelope = undefined;

		importState = 'success';
		importSuccessMessage = `Replaced local characters with ${importResult.addedCount} imported character${importResult.addedCount === 1 ? '' : 's'}.`;
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

		importState = 'success';
		importSuccessMessage = `Merged ${importResult?.addedCount ?? 0} new character${importResult?.addedCount === 1 ? '' : 's'}${importResult && importResult.skippedDuplicateCount > 0 ? ` and skipped ${importResult.skippedDuplicateCount} duplicate ${importResult.skippedDuplicateCount === 1 ? 'character' : 'characters'}` : ''}.`;
	};

	const handleImportClose = async () => {
		importDialogOpen = false;
		importAttemptToken++; // invalidate any pending reads
		await tick();
		importButtonEl?.focus();
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
				Want the official 2014 5e SRD PDF?&nbsp;
				<a
					class="theme-link underline"
					href={asset(FULL_2014_SRD_PATH)}
					target="_blank"
					rel="noreferrer">View SRD 5.1</a
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
					<BaseButton bind:buttonEl={importButtonEl} onclick={handleChooseImportFile}
						>Import Characters</BaseButton
					>
				</div>
				<BaseButton bind:buttonEl={exportButtonEl} onclick={() => (exportDialogOpen = true)}
					>Export Characters</BaseButton
				>
			</div>
		</div>
	</div>

	<Table tableData={$charsArray} onSelect={handleCharSelect} onDelete={handleCharacterDelete} />
</div>

<CharacterImportDialog
	bind:open={importDialogOpen}
	state={importState}
	characterCount={importCharacterCount}
	errorMessage={importErrorMessage}
	successMessage={importSuccessMessage}
	onmerge={handleMergeImportedCharacters}
	onreplace={handleReplaceImportedCharacters}
	onclose={handleImportClose}
/>

<CharacterExportDialog
	bind:open={exportDialogOpen}
	characterCount={$charsArray.length}
	onconfirm={handleExportConfirm}
	onclose={handleExportClose}
/>
