<script lang="ts">
	import { resolve } from '$app/paths';
	import GridContent from '$components/GridContent.svelte';
	import GridContainer from '$components/GridContainer.svelte';
	import { applyGridPatches } from '$utils/characterGridHelpers';
	import type { GridContentPatch } from '$utils/gridContentTypes';
	import { immutableJSONPatch, type JSONPatchDocument } from 'immutable-json-patch';
	import '../../../app.css';
	import { charsArray, emptyChar } from '$storage/store.js';
	import { parse5e2014CharacterDocument, type CharacterDocument5e2014 } from '../../../schema';
	import { decode5eGridPatches } from './sheetEditDecoder';
	import { reduce5eSheetEditIntents, type SheetEditIssue } from './sheetEditIntents';
	import { project5eSheet } from './sheetProjections';

	interface Props {
		data: {
			id: string | null;
		};
	}

	const { data }: Props = $props();
	const homeHref = resolve('/');
	const requestedCharacterId = $derived(data.id?.trim() ?? '');
	const hasRequestedCharacterId = $derived(requestedCharacterId.length > 0);
	const charIdx = $derived(
		hasRequestedCharacterId
			? $charsArray.findIndex((entry) => entry.meta.id === requestedCharacterId)
			: -1
	);
	const hasMatchingCharacter = $derived(charIdx !== -1);
	const showMissingOrInvalidIdState = $derived(!hasRequestedCharacterId || !hasMatchingCharacter);
	const missingOrInvalidIdTitle = $derived(
		hasRequestedCharacterId ? 'Character not found.' : 'No character selected.'
	);
	const missingOrInvalidIdDescription = $derived(
		hasRequestedCharacterId
			? `No local character matches the id "${requestedCharacterId}". Open a character from the home view or create a new one there.`
			: 'This route needs a character id in the URL. Open a character from the home view or create one there.'
	);
	const char: CharacterDocument5e2014 = $derived(
		hasMatchingCharacter ? ($charsArray[charIdx] ?? emptyChar) : emptyChar
	) as CharacterDocument5e2014;

	let isOverviewRegionCollapsed = $state(false);
	let isRuntimeRegionCollapsed = $state(false);
	let isOrganizationalRegionCollapsed = $state(false);

	const {
		annotationEditorConfig,
		runtimeActionData,
		metaPrimaryData,
		metaSecondaryData,
		metaTertiaryData,
		quickRefPrimaryData,
		quickRefMovementData,
		quickRefSecondaryData,
		proficiencyBonusRuntimeData,
		abilityRuntimeColumns,
		traitRuntimeData,
		proficiencyLanguagesRuntimeData,
		proficiencyToolsRuntimeData,
		classFeaturesRuntimeData,
		inventoryCurrencyRuntimeData,
		inventoryRuntimeCards,
		organizationalBackgroundData,
		roleplayPrimaryData,
		roleplaySecondaryData,
		scratchpadNotesData,
		spellcastingRuntimeData,
		spellSlotRuntimeCards
	} = $derived(project5eSheet(char));
	const characterUpdaterSignature = (entry: CharacterDocument5e2014): CharacterDocument5e2014 =>
		entry;

	const updateCurrent5eCharacter = (updateFn: typeof characterUpdaterSignature) => {
		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== requestedCharacterId) return entry;
				if (entry.system.id !== 'dnd5e-2014') return entry;
				return updateFn(entry as CharacterDocument5e2014);
			})
		);
	};

	const applyCharacterJsonPatch = (
		entry: CharacterDocument5e2014,
		patch: JSONPatchDocument
	): CharacterDocument5e2014 => {
		if (patch.length === 0) return entry;

		const patchBase = patch.some((operation) =>
			operation.path.startsWith('/systemData/combat/deathSaves/')
		)
			? parse5e2014CharacterDocument(
					immutableJSONPatch(entry, [
						{
							op: 'add',
							path: '/systemData/combat/deathSaves',
							value: entry.systemData.combat.deathSaves ?? { successes: 0, failures: 0 }
						}
					])
				)
			: entry;

		return parse5e2014CharacterDocument(immutableJSONPatch(patchBase, patch));
	};

	const handleFieldPatchSave = (patch: JSONPatchDocument) => {
		updateCurrent5eCharacter((entry) => applyCharacterJsonPatch(entry, patch));
	};

	const reportStructuredEditIssues = (issues: ReadonlyArray<SheetEditIssue>) => {
		console.warn('Could not apply structured 5e sheet edit.', issues);
	};

	const handleGridPatchesSave = (patches: Array<GridContentPatch>) => {
		const decoded = decode5eGridPatches(patches);
		if (!decoded.ok) {
			reportStructuredEditIssues(decoded.issues);
			return;
		}

		updateCurrent5eCharacter((entry) => {
			const candidate = applyGridPatches(entry, decoded.edits.canonicalPatches);
			const result = reduce5eSheetEditIntents(candidate, decoded.edits.intents);
			if (!result.ok) {
				reportStructuredEditIssues(result.issues);
				return entry;
			}
			return result.character;
		});
	};
</script>

{#if showMissingOrInvalidIdState}
	<div class="px-4 py-4 sm:px-6">
		<div
			class="theme-grid-layer mx-auto max-w-3xl rounded-lg border p-6"
			role="alert"
			aria-live="polite"
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<h1 class="text-2xl leading-none font-bold tracking-tight">
						{missingOrInvalidIdTitle}
					</h1>
					<p class="theme-text-muted">{missingOrInvalidIdDescription}</p>
				</div>
				<div class="flex justify-start">
					<a class="theme-btn-light btn rounded-md border px-3 py-1" href={homeHref}>
						Back to Characters
					</a>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="sheet-page">
		<section class="sheet-region sheet-region-overview" aria-labelledby="sheet-overview-heading">
			<button
				id="sheet-overview-heading"
				type="button"
				class="sheet-region-toggle"
				aria-expanded={!isOverviewRegionCollapsed}
				onclick={() => {
					isOverviewRegionCollapsed = !isOverviewRegionCollapsed;
				}}
			>
				<span class="sheet-region-heading">Overview</span>
				<span aria-hidden="true" class="sheet-region-toggle-indicator">
					{isOverviewRegionCollapsed ? '+' : '-'}
				</span>
			</button>
			{#if !isOverviewRegionCollapsed}
				<GridContainer
					heading="Meta / Top-level Info"
					border={true}
					pad={true}
					flow="row"
					count={1}
					countMd={3}
					classes="gap-3"
				>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							data={metaPrimaryData}
						/>
					</GridContainer>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							data={metaSecondaryData}
						/>
					</GridContainer>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							data={metaTertiaryData}
						/>
					</GridContainer>
				</GridContainer>
			{/if}
		</section>

		<section class="sheet-region sheet-region-runtime" aria-labelledby="sheet-runtime-heading">
			<button
				id="sheet-runtime-heading"
				type="button"
				class="sheet-region-toggle"
				aria-expanded={!isRuntimeRegionCollapsed}
				onclick={() => {
					isRuntimeRegionCollapsed = !isRuntimeRegionCollapsed;
				}}
			>
				<span class="sheet-region-heading">Runtime</span>
				<span aria-hidden="true" class="sheet-region-toggle-indicator">
					{isRuntimeRegionCollapsed ? '+' : '-'}
				</span>
			</button>
			{#if !isRuntimeRegionCollapsed}
				<GridContainer
					heading="Quick Reference"
					border={true}
					pad={true}
					flow="row"
					count={1}
					countMd={3}
					classes="gap-3"
				>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleFieldSavePatch={handleFieldPatchSave}
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayMaxCols={2}
							data={quickRefPrimaryData}
						/>
					</GridContainer>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleFieldSavePatch={handleFieldPatchSave}
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							data={quickRefMovementData}
						/>
					</GridContainer>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleFieldSavePatch={handleFieldPatchSave}
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayMaxCols={1}
							data={quickRefSecondaryData}
						/>
					</GridContainer>
				</GridContainer>
				<GridContainer
					heading="Actions / Runtime Summary"
					border={true}
					pad={true}
					flow="row"
					count={1}
					classes="gap-3"
				>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayArrayMode="stack"
							displayMaxCols={1}
							data={runtimeActionData}
						/>
					</GridContainer>
				</GridContainer>
				<GridContainer
					heading="Abilities & Proficiencies, Features & Traits"
					border={true}
					pad={true}
					flow="row"
					count={1}
					classes="gap-3"
				>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayMaxCols={1}
							displayAlign="center"
							data={proficiencyBonusRuntimeData}
						/>
					</GridContainer>
					<GridContainer flow="row" count={1} countMd={3} countLg={6} classes="gap-3">
						{#each abilityRuntimeColumns as column (column.key)}
							<GridContainer border={true} pad={true} classes="rounded-md">
								<GridContent
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									displayMaxCols={1}
									data={column.data}
								/>
							</GridContainer>
						{/each}
					</GridContainer>
					<GridContainer flow="row" count={1} countMd={2} countLg={4} classes="gap-3">
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayArrayMode="stack"
								displayMaxCols={1}
								data={proficiencyLanguagesRuntimeData}
							/>
						</GridContainer>
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayArrayMode="stack"
								displayMaxCols={1}
								data={proficiencyToolsRuntimeData}
							/>
						</GridContainer>
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayArrayMode="stack"
								displayMaxCols={1}
								data={classFeaturesRuntimeData}
							/>
						</GridContainer>
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayArrayMode="stack"
								displayMaxCols={1}
								data={traitRuntimeData}
							/>
						</GridContainer>
					</GridContainer>
				</GridContainer>
				<GridContainer
					heading="Spells"
					border={true}
					pad={true}
					flow="row"
					count={1}
					classes="gap-3"
				>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayAlign="center"
							data={spellcastingRuntimeData}
						/>
					</GridContainer>
					<GridContainer flow="row" count={1} countMd={3} countLg={5} classes="gap-3">
						{#each spellSlotRuntimeCards as slotCard (slotCard.key)}
							<GridContainer border={true} pad={true} classes="rounded-md">
								<GridContent
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									displayArrayMode="stack"
									displayMaxCols={1}
									data={slotCard.data}
								/>
							</GridContainer>
						{/each}
					</GridContainer>
				</GridContainer>
				<GridContainer
					heading="Inventory / Equipment"
					border={true}
					pad={true}
					flow="row"
					count={1}
					classes="gap-3"
				>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayAlign="center"
							displayMaxCols={5}
							data={inventoryCurrencyRuntimeData}
						/>
					</GridContainer>
					<GridContainer flow="row" count={1} countMd={3} classes="gap-3">
						{#each inventoryRuntimeCards as inventoryCard (inventoryCard.key)}
							<GridContainer border={true} pad={true} classes="rounded-md">
								<GridContent
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									displayArrayMode="stack"
									displayMaxCols={1}
									data={inventoryCard.data}
								/>
							</GridContainer>
						{/each}
					</GridContainer>
				</GridContainer>
			{/if}
		</section>

		<section
			class="sheet-region sheet-region-organizational"
			aria-labelledby="sheet-organizational-heading"
		>
			<button
				id="sheet-organizational-heading"
				type="button"
				class="sheet-region-toggle"
				aria-expanded={!isOrganizationalRegionCollapsed}
				onclick={() => {
					isOrganizationalRegionCollapsed = !isOrganizationalRegionCollapsed;
				}}
			>
				<span class="sheet-region-heading">Organizational</span>
				<span aria-hidden="true" class="sheet-region-toggle-indicator">
					{isOrganizationalRegionCollapsed ? '+' : '-'}
				</span>
			</button>
			{#if !isOrganizationalRegionCollapsed}
				<GridContainer
					heading="Background, Roleplay, & Notes"
					border={true}
					pad={true}
					flow="row"
					count={1}
					classes="gap-3"
				>
					<GridContainer flow="row" count={1} countMd={3} classes="gap-3">
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayMaxCols={1}
								data={organizationalBackgroundData}
							/>
						</GridContainer>
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayMaxCols={1}
								data={roleplayPrimaryData}
							/>
						</GridContainer>
						<GridContainer border={true} pad={true} classes="rounded-md">
							<GridContent
								handleEditSavePatches={handleGridPatchesSave}
								{annotationEditorConfig}
								displayMaxCols={1}
								data={roleplaySecondaryData}
							/>
						</GridContainer>
					</GridContainer>
					<GridContainer border={true} pad={true} classes="rounded-md">
						<GridContent
							handleEditSavePatches={handleGridPatchesSave}
							{annotationEditorConfig}
							displayArrayMode="stack"
							displayMaxCols={1}
							data={scratchpadNotesData}
						/>
					</GridContainer>
				</GridContainer>
			{/if}
		</section>
	</div>
{/if}

<style>
	.sheet-page {
		display: grid;
		gap: 0.75rem;
		padding: 0.5rem;
	}

	.sheet-region {
		border: 1px solid var(--color-surface-border);
		border-radius: 0.5rem;
		padding: 0.75rem;
	}

	.sheet-region-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0 0 0.25rem;
		border-radius: 0.375rem;
		padding: 0.25rem 0.4rem;
		color: var(--color-surface-text);
		cursor: pointer;
	}

	.sheet-region-toggle:hover {
		background-color: color-mix(in oklab, var(--color-surface) 74%, var(--color-brand) 26%);
	}

	.sheet-region-toggle:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	.sheet-region-heading {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0;
		line-height: 1;
		text-transform: uppercase;
	}

	.sheet-region-toggle-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		border: 1px solid var(--color-surface-border);
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 800;
		line-height: 1;
	}

	.sheet-region-overview {
		background-color: color-mix(in oklab, var(--color-surface) 82%, var(--color-muted-surface) 18%);
	}

	.sheet-region-runtime {
		border-width: 2px;
		background-color: color-mix(in oklab, var(--color-surface) 88%, var(--color-brand) 12%);
	}

	.sheet-region-organizational {
		background-color: color-mix(in oklab, var(--color-surface) 72%, var(--color-muted-surface) 28%);
	}

	@supports not (color: color-mix(in oklab, black 50%, white 50%)) {
		.sheet-region {
			background-color: var(--color-surface);
		}
	}
</style>
