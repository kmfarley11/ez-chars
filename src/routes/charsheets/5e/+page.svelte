<script lang="ts">
	import { pushState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import RuntimeActionsCard from './components/RuntimeActionsCard.svelte';
	import SupportingCollectionCard from './components/SupportingCollectionCard.svelte';
	import Dnd5e2014DenseCollectionCard from './components/Dnd5e2014DenseCollectionCard.svelte';
	import Dnd5e2014QuickReference from './components/Dnd5e2014QuickReference.svelte';
	import Dnd5e2014AbilitiesAndProficiencies from './components/Dnd5e2014AbilitiesAndProficiencies.svelte';
	import Dnd5e2014Spellcasting from './components/Dnd5e2014Spellcasting.svelte';
	import ResponsiveGrid from '$components/ResponsiveGrid.svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import IconBookOpen from '$components/IconBookOpen.svelte';
	import PanelSurface from '$components/PanelSurface.svelte';
	import SheetReferenceController from '$components/SheetReferenceController.svelte';
	import GridContentCard from '$components/GridContentCard.svelte';
	import { applyGridPatches } from '$utils/characterGridHelpers';
	import type { GridContentPatch } from '$utils/gridContentTypes';

	import { immutableJSONPatch, type JSONPatchDocument } from 'immutable-json-patch';
	import '../../../app.css';
	import { charsArray, emptyChar } from '$storage/store.js';
	import {
		parse5e2014CharacterDocument,
		type CharacterDocument5e2014,
		type RuntimeActionSource
	} from '../../../schema';
	import {
		resolve5eRuntimeActionSource,
		type RuntimeActionDraft
	} from '$lib/dnd5e2014/runtimeActionSources';
	import { decode5eGridPatches } from './sheetEditDecoder';
	import {
		reduce5eSheetEditIntents,
		type SheetEditIntent,
		type SheetEditIssue
	} from './sheetEditIntents';
	import type { InventoryGroup } from './sheetConstants';
	import {
		projectPrioritizedInventoryDenseCollectionRows,
		projectPrioritizedSpellDenseCollectionRows
	} from '$lib/dnd5e2014/denseCollectionRows';
	import { merge5e2014InventoryGroupPins } from '$lib/dnd5e2014/collectionPriority';
	import { project5eSheet } from './sheetProjections';
	import {
		projectPrioritizedSupportingCollectionRows,
		type SupportingCollectionKind
	} from './components/supportingCollectionRows';
	import type { CollectionPriorityKind5e2014 } from '../../../schema';
	import type { CollectionPrioritySaveResult } from '$components/collectionPriority';
	import {
		DND5E_2014_CLASS_LOCATOR_ID,
		DND5E_2014_EQUIPMENT_LOCATOR_ID,
		DND5E_2014_GENERAL_LOCATOR_ID,
		DND5E_2014_SPELLCASTING_LOCATOR_ID
	} from '$lib/resources/dnd5e2014ResourceCatalog';
	import { openSheetReference } from '$lib/resources/sheetReferenceNavigation';
	import Dnd5e2014NavigablePanel from './components/Dnd5e2014NavigablePanel.svelte';
	import Dnd5e2014NavigableRegion from './components/Dnd5e2014NavigableRegion.svelte';
	import Dnd5e2014SheetNavigation from './components/Dnd5e2014SheetNavigation.svelte';
	import {
		createDnd5e2014SheetLandmarkCoordinator,
		setDnd5e2014SheetLandmarkCoordinator
	} from './sheetLandmarkNavigation';
	import {
		dnd5e2014SheetLandmarks,
		resolveDnd5e2014SheetLandmarkPath,
		type Dnd5e2014SheetLandmark
	} from './sheetLandmarks';

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

	let currentHistoryFragment = '';
	const landmarkById = new Map(
		dnd5e2014SheetLandmarks.map((landmark) => [landmark.fragmentId, landmark])
	);
	const landmark = (fragmentId: string): Dnd5e2014SheetLandmark => {
		const result = landmarkById.get(fragmentId);
		if (!result) throw new Error(`Missing 2014 sheet landmark: ${fragmentId}`);
		return result;
	};
	const readFragment = () => window.location.hash.slice(1);
	const landmarkCoordinator = createDnd5e2014SheetLandmarkCoordinator({
		getCurrentFragment: readFragment,
		pushFragment: (fragmentId) => {
			currentHistoryFragment = fragmentId;
			const sheetUrl = `/charsheets/5e${page.url.search}#${fragmentId}`;
			pushState(resolve(sheetUrl as '/charsheets/5e'), page.state);
		}
	});
	setDnd5e2014SheetLandmarkCoordinator(landmarkCoordinator);

	const resolveCurrentFragment = async () => {
		const fragmentId = readFragment();
		currentHistoryFragment = fragmentId;
		if (!resolveDnd5e2014SheetLandmarkPath(fragmentId)) return;
		await landmarkCoordinator.navigate(fragmentId, { recordHistory: false });
	};

	const handleHistoryTraversal = () => {
		const fragmentId = readFragment();
		if (fragmentId === currentHistoryFragment) return;
		currentHistoryFragment = fragmentId;
		if (!resolveDnd5e2014SheetLandmarkPath(fragmentId)) return;
		void landmarkCoordinator.navigate(fragmentId, { recordHistory: false });
	};

	onMount(() => {
		void resolveCurrentFragment();
	});
	let inventoryCardElements = $state<Partial<Record<InventoryGroup, HTMLElement>>>({});
	let spellCardElements = $state<Partial<Record<string, HTMLElement>>>({});
	let inventoryCollectionQueries = $state<Record<InventoryGroup, string>>({
		weapons: '',
		armorShields: '',
		other: ''
	});
	let spellCollectionQuery = $state('');
	let supportingCollectionQueries = $state<Record<SupportingCollectionKind, string>>({
		features: '',
		traits: '',
		languages: '',
		tools: ''
	});
	let featuresCardElement = $state<HTMLElement>();
	let traitsCardElement = $state<HTMLElement>();
	const inventoryGroupLabels: Record<InventoryGroup, string> = {
		weapons: 'Weapons inventory',
		armorShields: 'Armor and shields inventory',
		other: 'Other inventory'
	};
	const inventoryCollectionTitles: Record<InventoryGroup, string> = {
		weapons: 'Weapons',
		armorShields: 'Armor & Shields',
		other: 'Other Gear'
	};
	const rulesTriggerId = 'sheet-rules-trigger';
	const classReferencesTriggerId = 'sheet-class-references-trigger';
	const equipmentReferencesTriggerId = 'sheet-equipment-references-trigger';
	const spellReferencesTriggerId = 'sheet-spell-references-trigger';

	const {
		annotationEditorConfig,
		metaPrimaryData,
		metaSecondaryData,
		metaTertiaryData,
		quickRefLiveData,
		quickRefReferenceData,
		proficiencyBonusRuntimeData,
		abilityRuntimeColumns,
		inventoryCurrencyRuntimeData,
		inventoryRuntimeCards,
		organizationalBackgroundData,
		roleplayPrimaryData,
		roleplaySecondaryData,
		scratchpadNotesData,
		spellcastingRuntimeData,
		spellSlotRuntimeData
	} = $derived(project5eSheet(char));
	const inventoryPins = $derived(new Set(char.systemData.collectionPins?.inventory ?? []));
	const spellPins = $derived(new Set(char.systemData.collectionPins?.spells ?? []));
	const inventoryDenseRows = $derived({
		weapons: projectPrioritizedInventoryDenseCollectionRows(
			char.inventory,
			'weapons',
			inventoryPins
		),
		armorShields: projectPrioritizedInventoryDenseCollectionRows(
			char.inventory,
			'armorShields',
			inventoryPins
		),
		other: projectPrioritizedInventoryDenseCollectionRows(char.inventory, 'other', inventoryPins)
	});
	const spellDenseRows = $derived(
		projectPrioritizedSpellDenseCollectionRows(
			char.systemData.spellcasting?.spells ?? [],
			spellPins
		)
	);
	const supportingCollectionRows = $derived({
		features: projectPrioritizedSupportingCollectionRows(char, 'features'),
		traits: projectPrioritizedSupportingCollectionRows(char, 'traits'),
		languages: projectPrioritizedSupportingCollectionRows(char, 'languages'),
		tools: projectPrioritizedSupportingCollectionRows(char, 'tools')
	});
	const updateCurrent5eCharacter = (
		// eslint-disable-next-line no-unused-vars
		updateFn: (entry: CharacterDocument5e2014) => CharacterDocument5e2014
	) => {
		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== requestedCharacterId) return entry;
				if (entry.system.id !== 'dnd5e-2014') return entry;
				return updateFn(entry as CharacterDocument5e2014);
			})
		);
	};

	const reportStructuredEditIssues = (issues: ReadonlyArray<SheetEditIssue>) => {
		console.warn('Could not apply structured 5e sheet edit.', issues);
	};

	const handleSheetIntents = (intents: ReadonlyArray<SheetEditIntent>) => {
		let saved = true;
		updateCurrent5eCharacter((entry) => {
			const result = reduce5eSheetEditIntents(entry, intents);
			if (!result.ok) {
				saved = false;
				reportStructuredEditIssues(result.issues);
				return entry;
			}
			return result.character;
		});
		return saved;
	};

	const commitPrioritySave = (
		collection: CollectionPriorityKind5e2014,
		// eslint-disable-next-line no-unused-vars
		resolveIdentities: (entry: CharacterDocument5e2014) => ReadonlyArray<string>
	): CollectionPrioritySaveResult => {
		let resultIssues: ReadonlyArray<SheetEditIssue> | undefined;
		updateCurrent5eCharacter((entry) => {
			const result = reduce5eSheetEditIntents(entry, [
				{
					type: 'replace-collection-pins',
					collection,
					identities: [...resolveIdentities(entry)]
				}
			]);
			if (!result.ok) {
				resultIssues = result.issues;
				console.warn('Priority save failed:', result.issues);
				return entry;
			}
			return result.character;
		});

		if (resultIssues) {
			reportStructuredEditIssues(resultIssues);
			return { ok: false, message: resultIssues[0]?.message ?? 'Failed to save pins.' };
		}
		return { ok: true };
	};

	const handlePrioritySave = (
		collection: CollectionPriorityKind5e2014,
		identities: ReadonlyArray<string>
	): CollectionPrioritySaveResult => commitPrioritySave(collection, () => identities);

	const handleInventoryPrioritySave = (
		group: InventoryGroup,
		draft: ReadonlyArray<string>
	): CollectionPrioritySaveResult =>
		commitPrioritySave('inventory', (entry) => merge5e2014InventoryGroupPins(entry, group, draft));

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

	const handleCreateRuntimeAction = (draft: RuntimeActionDraft) => {
		handleSheetIntents([{ type: 'create-runtime-action', draft }]);
	};

	const handleResyncRuntimeAction = (actionId: string) => {
		handleSheetIntents([{ type: 'resync-runtime-action', actionId }]);
	};

	const handleNavigateToSource = (source: RuntimeActionSource) => {
		const resolvedSource = resolve5eRuntimeActionSource(char, source);
		if (!resolvedSource) return;
		const destination = resolvedSource.destination;
		if (destination.kind === 'inventory') {
			inventoryCollectionQueries[destination.group] = '';
		} else if (destination.kind === 'spell') {
			spellCollectionQuery = '';
		} else if (destination.kind === 'features') {
			supportingCollectionQueries.features = '';
		} else {
			supportingCollectionQueries.traits = '';
		}
		const cardElement =
			destination.kind === 'inventory'
				? inventoryCardElements[destination.group]
				: destination.kind === 'spell'
					? spellCardElements[String(destination.level)]
					: destination.kind === 'features'
						? featuresCardElement
						: traitsCardElement;
		cardElement?.scrollIntoView({ block: 'center' });
		cardElement?.focus({ preventScroll: true });
	};

	const registerInventoryCard = (group: InventoryGroup) => (element: HTMLElement) => {
		inventoryCardElements[group] = element;

		return () => {
			if (inventoryCardElements[group] === element) delete inventoryCardElements[group];
		};
	};

	const registerSpellCollection = (element: HTMLElement) => {
		for (let level = 0; level <= 9; level += 1) {
			spellCardElements[String(level)] = element;
		}
		return () => {
			for (let level = 0; level <= 9; level += 1) {
				if (spellCardElements[String(level)] === element) {
					delete spellCardElements[String(level)];
				}
			}
		};
	};

	const registerFeaturesCard = (element: HTMLElement) => {
		featuresCardElement = element;
		return () => {
			if (featuresCardElement === element) featuresCardElement = undefined;
		};
	};

	const registerTraitsCard = (element: HTMLElement) => {
		traitsCardElement = element;
		return () => {
			if (traitsCardElement === element) traitsCardElement = undefined;
		};
	};

	const handleGridPatchesSave = (patches: Array<GridContentPatch>) => {
		const decoded = decode5eGridPatches(patches);
		if (!decoded.ok) {
			reportStructuredEditIssues(decoded.issues);
			return false;
		}

		let saved = true;
		updateCurrent5eCharacter((entry) => {
			const candidate = applyGridPatches(entry, decoded.edits.canonicalPatches);
			const result = reduce5eSheetEditIntents(candidate, decoded.edits.intents);
			if (!result.ok) {
				saved = false;
				reportStructuredEditIssues(result.issues);
				return entry;
			}
			return result.character;
		});
		return saved;
	};
</script>

<svelte:window onpopstate={handleHistoryTraversal} />

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
					<a class="theme-btn-light touch-target btn rounded-md border px-3 py-1" href={homeHref}>
						Back to Characters
					</a>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="sheet-page">
		<SheetReferenceController />
		<aside class="sheet-rules-utility" aria-label="Rules shortcut">
			<BaseButton
				id={rulesTriggerId}
				size="lg"
				iconOnly={true}
				ariaLabel="Rules"
				title="Open rules"
				classes="sheet-rules-trigger rounded-r-none"
				onclick={() => openSheetReference(DND5E_2014_GENERAL_LOCATOR_ID, rulesTriggerId)}
			>
				<IconBookOpen classes="h-5 w-5" />
			</BaseButton>
		</aside>
		<div class="sheet-layout">
			<Dnd5e2014SheetNavigation />
			<main class="sheet-content" aria-label="2014 character sheet">
				<Dnd5e2014NavigableRegion landmark={landmark('sheet-overview-heading')}>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-meta-heading')}>
						{#snippet headerActions()}
							<BaseButton
								id={classReferencesTriggerId}
								size="sm"
								iconOnly={true}
								ariaLabel="References: classes"
								title="Open class references"
								onclick={() =>
									openSheetReference(DND5E_2014_CLASS_LOCATOR_ID, classReferencesTriggerId)}
							>
								<IconBookOpen classes="h-4 w-4" />
							</BaseButton>
						{/snippet}
						<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
							<PanelSurface>
								<GridContentCard
									detailTitle="Character identity and classes"
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									data={metaPrimaryData}
								/>
							</PanelSurface>
							<PanelSurface>
								<GridContentCard
									detailTitle="Ancestry and background"
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									data={metaSecondaryData}
								/>
							</PanelSurface>
							<PanelSurface>
								<GridContentCard
									detailTitle="Alignment and appearance"
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									data={metaTertiaryData}
								/>
							</PanelSurface>
						</ResponsiveGrid>
					</Dnd5e2014NavigablePanel>
				</Dnd5e2014NavigableRegion>

				<Dnd5e2014NavigableRegion landmark={landmark('sheet-runtime-heading')}>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-quick-reference-heading')}>
						<Dnd5e2014QuickReference
							liveData={quickRefLiveData}
							referenceData={quickRefReferenceData}
							{annotationEditorConfig}
							onFieldSavePatch={handleFieldPatchSave}
							onSavePatches={handleGridPatchesSave}
						/>
					</Dnd5e2014NavigablePanel>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-actions-heading')}>
						<ResponsiveGrid cols={1} classes="gap-3">
							<PanelSurface>
								<RuntimeActionsCard
									character={char}
									{annotationEditorConfig}
									onIntents={handleSheetIntents}
									onCreateAction={handleCreateRuntimeAction}
									onResyncAction={handleResyncRuntimeAction}
									onNavigateToSource={handleNavigateToSource}
								/>
							</PanelSurface>
						</ResponsiveGrid>
					</Dnd5e2014NavigablePanel>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-abilities-proficiencies-heading')}>
						<Dnd5e2014AbilitiesAndProficiencies
							character={char}
							proficiencyBonusData={proficiencyBonusRuntimeData}
							abilityColumns={abilityRuntimeColumns}
							languageRows={supportingCollectionRows.languages}
							toolRows={supportingCollectionRows.tools}
							{annotationEditorConfig}
							bind:languageQuery={supportingCollectionQueries.languages}
							bind:toolQuery={supportingCollectionQueries.tools}
							onFieldSavePatch={handleFieldPatchSave}
							onSavePatches={handleGridPatchesSave}
							onIntents={handleSheetIntents}
							onSaveLanguagePins={(draft) => handlePrioritySave('languages', draft)}
							onSaveToolPins={(draft) => handlePrioritySave('tools', draft)}
						/>
					</Dnd5e2014NavigablePanel>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-features-traits-heading')}>
						<ResponsiveGrid cols={1} colsMd={2} classes="gap-3">
							<section
								{@attach registerFeaturesCard}
								tabindex="-1"
								aria-label="Features"
								class="grid rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
							>
								<PanelSurface>
									<SupportingCollectionCard
										title="Features"
										kind="features"
										rows={supportingCollectionRows.features}
										character={char}
										{annotationEditorConfig}
										onIntents={handleSheetIntents}
										bind:query={supportingCollectionQueries.features}
										onSavePins={(draft) => handlePrioritySave('features', draft)}
									/>
								</PanelSurface>
							</section>
							<section
								{@attach registerTraitsCard}
								tabindex="-1"
								aria-label="Traits"
								class="grid rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
							>
								<PanelSurface>
									<SupportingCollectionCard
										title="Traits"
										kind="traits"
										rows={supportingCollectionRows.traits}
										character={char}
										{annotationEditorConfig}
										onIntents={handleSheetIntents}
										bind:query={supportingCollectionQueries.traits}
										onSavePins={(draft) => handlePrioritySave('traits', draft)}
									/>
								</PanelSurface>
							</section>
						</ResponsiveGrid>
					</Dnd5e2014NavigablePanel>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-spells-heading')}>
						{#snippet headerActions()}
							<BaseButton
								id={spellReferencesTriggerId}
								size="sm"
								iconOnly={true}
								ariaLabel="References: spells"
								title="Open spell references"
								onclick={() =>
									openSheetReference(DND5E_2014_SPELLCASTING_LOCATOR_ID, spellReferencesTriggerId)}
							>
								<IconBookOpen classes="h-4 w-4" />
							</BaseButton>
						{/snippet}
						<section
							{@attach registerSpellCollection}
							tabindex="-1"
							aria-label="Spellcasting section"
							class="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
						>
							<Dnd5e2014Spellcasting
								character={char}
								summaryData={spellcastingRuntimeData}
								slotData={spellSlotRuntimeData}
								spellRows={spellDenseRows}
								{annotationEditorConfig}
								bind:query={spellCollectionQuery}
								onFieldSavePatch={handleFieldPatchSave}
								onSavePatches={handleGridPatchesSave}
								onIntents={handleSheetIntents}
								onSavePins={(draft) => handlePrioritySave('spells', draft)}
							/>
						</section>
					</Dnd5e2014NavigablePanel>
				</Dnd5e2014NavigableRegion>

				<Dnd5e2014NavigableRegion landmark={landmark('sheet-organizational-heading')}>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-inventory-heading')}>
						{#snippet headerActions()}
							<BaseButton
								id={equipmentReferencesTriggerId}
								size="sm"
								iconOnly={true}
								ariaLabel="References: equipment"
								title="Open equipment references"
								onclick={() =>
									openSheetReference(DND5E_2014_EQUIPMENT_LOCATOR_ID, equipmentReferencesTriggerId)}
							>
								<IconBookOpen classes="h-4 w-4" />
							</BaseButton>
						{/snippet}
						<ResponsiveGrid cols={1} classes="gap-3">
							<PanelSurface>
								<GridContentCard
									detailTitle="Treasure"
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									displayAlign="center"
									displayMaxCols={5}
									data={inventoryCurrencyRuntimeData}
								/>
							</PanelSurface>
							<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
								{#each inventoryRuntimeCards as inventoryCard (inventoryCard.key)}
									<section
										{@attach registerInventoryCard(inventoryCard.key)}
										tabindex="-1"
										aria-label={inventoryGroupLabels[inventoryCard.key]}
										data-inventory-group={inventoryCard.key}
										class="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
									>
										<PanelSurface>
											<Dnd5e2014DenseCollectionCard
												title={inventoryCollectionTitles[inventoryCard.key]}
												rows={inventoryDenseRows[inventoryCard.key]}
												character={char}
												collection={{ kind: 'item', group: inventoryCard.key }}
												bind:query={inventoryCollectionQueries[inventoryCard.key]}
												{annotationEditorConfig}
												emptyText={`No ${inventoryCollectionTitles[inventoryCard.key].toLocaleLowerCase()} yet.`}
												onIntents={handleSheetIntents}
												onSavePins={(draft) =>
													handleInventoryPrioritySave(inventoryCard.key, draft)}
											/>
										</PanelSurface>
									</section>
								{/each}
							</ResponsiveGrid>
						</ResponsiveGrid>
					</Dnd5e2014NavigablePanel>
					<Dnd5e2014NavigablePanel landmark={landmark('sheet-background-notes-heading')}>
						<ResponsiveGrid cols={1} classes="gap-3">
							<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
								<PanelSurface>
									<GridContentCard
										detailTitle="Background details"
										handleFieldSavePatch={handleFieldPatchSave}
										handleEditSavePatches={handleGridPatchesSave}
										{annotationEditorConfig}
										displayMaxCols={1}
										data={organizationalBackgroundData}
									/>
								</PanelSurface>
								<PanelSurface>
									<GridContentCard
										detailTitle="Roleplay"
										handleFieldSavePatch={handleFieldPatchSave}
										handleEditSavePatches={handleGridPatchesSave}
										{annotationEditorConfig}
										displayMaxCols={1}
										data={roleplayPrimaryData}
									/>
								</PanelSurface>
								<PanelSurface>
									<GridContentCard
										detailTitle="Additional character notes"
										handleFieldSavePatch={handleFieldPatchSave}
										handleEditSavePatches={handleGridPatchesSave}
										{annotationEditorConfig}
										displayMaxCols={1}
										data={roleplaySecondaryData}
									/>
								</PanelSurface>
							</ResponsiveGrid>
							<PanelSurface>
								<GridContentCard
									detailTitle="Scratchpad notes"
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									displayArrayMode="stack"
									displayMaxCols={1}
									data={scratchpadNotesData}
								/>
							</PanelSurface>
						</ResponsiveGrid>
					</Dnd5e2014NavigablePanel>
				</Dnd5e2014NavigableRegion>
			</main>
		</div>
	</div>
{/if}

<style>
	.sheet-page {
		display: grid;
		gap: 0.75rem;
		padding: 0.5rem 0.5rem 0.5rem 0;
	}

	.sheet-layout {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		min-width: 0;
	}

	.sheet-content {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sheet-rules-utility {
		position: fixed;
		top: max(5rem, 18dvh);
		right: 0;
		z-index: 30;
		pointer-events: none;
	}

	.sheet-rules-utility :global(.sheet-rules-trigger) {
		pointer-events: auto;
		box-shadow: -0.15rem 0.15rem 0.35rem rgb(0 0 0 / 0.18);
	}
</style>
