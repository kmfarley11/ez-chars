<script lang="ts">
	import { dnd5e2014ResourceCatalog } from '$lib/resources/dnd5e2014ResourceCatalog';
	import { resolveAssetUrl } from '$lib/resources/asset-url';
	import { create5eAnnotationReferenceProvider } from '../annotation-reference';
	import { setAnnotationReferenceProvider } from '$lib/resources/annotation-reference-context';
	setAnnotationReferenceProvider(
		create5eAnnotationReferenceProvider((path) => resolveAssetUrl(path))
	);
	import type { SheetNavigationHost } from '$lib/navigation/sheet-navigation-host';
	import type { SheetEditOwner } from '../editing/sheet-edit-session';
	import SmallEditScope from '$lib/ui/organisms/small-edit-scope.svelte';
	import {
		create5eSmallGridModel,
		create5eSmallRecordModel,
		shouldTarget5eSmallGrid
	} from '$lib/systems/dnd5e-2014/editing/small-edit-adapters';
	import { setupSheetNavigation } from '$lib/navigation/sheet-navigation-session';
	import SheetRulesShortcut from '$lib/ui/molecules/sheet-rules-shortcut.svelte';
	import RuntimeActionsCard from '$lib/systems/dnd5e-2014/components/runtime-actions-card.svelte';
	import SupportingCollectionCard from '$lib/systems/dnd5e-2014/components/supporting-collection-card.svelte';
	import ClassCollection from '../components/class-collection.svelte';
	import DenseCollectionCard from '$lib/systems/dnd5e-2014/components/dense-collection-card.svelte';
	import QuickReference from '$lib/ui/organisms/quick-reference.svelte';
	import AbilitiesAndProficiencies from '$lib/systems/dnd5e-2014/components/abilities-and-proficiencies.svelte';
	import Spellcasting from '$lib/systems/dnd5e-2014/components/spellcasting.svelte';
	import ResponsiveGrid from '$lib/ui/molecules/responsive-grid.svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import IconBookOpen from '$lib/ui/atoms/icon-book-open.svelte';
	import PanelSurface from '$lib/ui/molecules/panel-surface.svelte';
	import SheetReferenceController from '$lib/ui/organisms/sheet-reference-controller.svelte';
	import GridContentCard from '$lib/ui/organisms/grid-content-card.svelte';
	import type { GridContentPatch } from '$utils/gridContentTypes';
	import {
		create5eSheetEditSession,
		type SheetCommitResult
	} from '$lib/systems/dnd5e-2014/editing/sheet-edit-session';

	import type { JSONPatchDocument } from 'immutable-json-patch';
	import { type RuntimeActionSource } from '../../../../schema';
	import {
		resolve5eRuntimeActionSource,
		type RuntimeActionDraft
	} from '$lib/systems/dnd5e-2014/runtime-action-sources';
	import type { SheetEditIntent } from '$lib/systems/dnd5e-2014/editing/sheet-edit-intents';
	import type { InventoryGroup } from '$lib/systems/dnd5e-2014/sheet-constants';
	import {
		projectPrioritizedInventoryDenseCollectionRows,
		projectPrioritizedSpellDenseCollectionRows
	} from '$lib/systems/dnd5e-2014/dense-collection-rows';
	import { project5eSheet } from '$lib/systems/dnd5e-2014/sheet-projections';
	import {
		projectPrioritizedSupportingCollectionRows,
		type SupportingCollectionKind
	} from '$lib/systems/dnd5e-2014/components/supporting-collection-rows';
	import type { CollectionPriorityKind5e2014 } from '../../../../schema';
	import type { CollectionPrioritySaveResult } from '$lib/ui/molecules/collection-priority';
	import {
		DND5E_2014_CLASS_LOCATOR_ID,
		DND5E_2014_EQUIPMENT_LOCATOR_ID,
		DND5E_2014_GENERAL_LOCATOR_ID,
		DND5E_2014_SPELLCASTING_LOCATOR_ID
	} from '$lib/resources/dnd5e2014ResourceCatalog';
	import NavigablePanel from '$lib/ui/molecules/navigable-panel.svelte';
	import NavigableRegion from '$lib/ui/molecules/navigable-region.svelte';
	import SheetNavigation from '$lib/ui/organisms/sheet-navigation.svelte';

	import {
		dnd5e2014SheetLandmarks,
		type Dnd5e2014SheetLandmark
	} from '$lib/systems/dnd5e-2014/sheet-landmarks';

	interface Props {
		owner: SheetEditOwner;
		navigation: SheetNavigationHost;
	}

	const { owner, navigation }: Props = $props();
	const char = $derived(owner.read());
	const openSheetReference = (locatorId: string, returnFocusId: string) =>
		navigation.openReference(locatorId, returnFocusId);

	const landmarkById = new Map(
		dnd5e2014SheetLandmarks.map((landmark) => [landmark.fragmentId, landmark])
	);
	const landmark = (fragmentId: string): Dnd5e2014SheetLandmark => {
		const result = landmarkById.get(fragmentId);
		if (!result) throw new Error(`Missing 2014 sheet landmark: ${fragmentId}`);
		return result;
	};
	setupSheetNavigation(dnd5e2014SheetLandmarks, () => navigation);
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
			char.systemData.inventory,
			'weapons',
			inventoryPins
		),
		armorShields: projectPrioritizedInventoryDenseCollectionRows(
			char.systemData.inventory,
			'armorShields',
			inventoryPins
		),
		other: projectPrioritizedInventoryDenseCollectionRows(
			char.systemData.inventory,
			'other',
			inventoryPins
		)
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
	const smallEditOwner = {
		read: () => owner.read(),
		write: (next: ReturnType<SheetEditOwner['read']>) => owner.write(next),
		reject: () => owner.reject?.() ?? false
	};
	const edits = create5eSheetEditSession(smallEditOwner);
	const reportSave = (result: SheetCommitResult) => {
		if (!result.ok) console.warn('Could not apply structured 5e sheet edit.', result.message);
		return result.ok;
	};
	const handleSheetIntents = (intents: ReadonlyArray<SheetEditIntent>) =>
		reportSave(edits.intents(intents));

	const handlePrioritySave = (
		collection: CollectionPriorityKind5e2014,
		identities: ReadonlyArray<string>
	): CollectionPrioritySaveResult => edits.pins(collection, identities);

	const handleInventoryPrioritySave = (
		group: InventoryGroup,
		draft: ReadonlyArray<string>
	): CollectionPrioritySaveResult => edits.inventoryPins(group, draft);

	const handleFieldPatchSave = (patch: JSONPatchDocument) => {
		const result = edits.patch(patch);
		if (!result.ok) throw new Error(result.message);
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
		return reportSave(edits.grid(patches));
	};
</script>

<SmallEditScope
	enabled
	canTarget={shouldTarget5eSmallGrid}
	buildGrid={(input) =>
		create5eSmallGridModel(smallEditOwner, input.data, input.title, input.annotationEditorConfig)}
	buildRecord={(key) => create5eSmallRecordModel(smallEditOwner, key, annotationEditorConfig)}
>
	<div class="sheet-page">
		<SheetReferenceController
			{navigation}
			catalog={dnd5e2014ResourceCatalog}
			systemId="dnd5e-2014"
		/>
		<SheetRulesShortcut
			id={rulesTriggerId}
			onOpen={() => openSheetReference(DND5E_2014_GENERAL_LOCATOR_ID, rulesTriggerId)}
		/>
		<div class="sheet-layout">
			<SheetNavigation landmarks={dnd5e2014SheetLandmarks} />
			<main class="sheet-content" aria-label="2014 character sheet">
				<NavigableRegion landmark={landmark('sheet-overview-heading')}>
					<NavigablePanel landmark={landmark('sheet-meta-heading')}>
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
									detailTitle="Character identity"
									handleFieldSavePatch={handleFieldPatchSave}
									handleEditSavePatches={handleGridPatchesSave}
									{annotationEditorConfig}
									data={{ name: metaPrimaryData.name, playerName: metaPrimaryData.playerName }}
									displayMaxCols={1}
									inlineFieldControls={false}
								/>
								<div class="mt-2 border-t border-[var(--color-surface-border)] pt-2">
									<ClassCollection owner={smallEditOwner} {annotationEditorConfig} />
								</div>
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
					</NavigablePanel>
				</NavigableRegion>

				<NavigableRegion landmark={landmark('sheet-runtime-heading')}>
					<NavigablePanel landmark={landmark('sheet-quick-reference-heading')}>
						<QuickReference
							liveData={quickRefLiveData}
							referenceData={quickRefReferenceData}
							{annotationEditorConfig}
							onFieldSavePatch={handleFieldPatchSave}
							onSavePatches={handleGridPatchesSave}
						/>
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-actions-heading')}>
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
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-abilities-proficiencies-heading')}>
						<AbilitiesAndProficiencies
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
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-features-traits-heading')}>
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
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-spells-heading')}>
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
							<Spellcasting
								readFirstSlots
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
					</NavigablePanel>
				</NavigableRegion>

				<NavigableRegion landmark={landmark('sheet-organizational-heading')}>
					<NavigablePanel landmark={landmark('sheet-inventory-heading')}>
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
											<DenseCollectionCard
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
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-background-notes-heading')}>
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
					</NavigablePanel>
				</NavigableRegion>
			</main>
		</div>
	</div>
</SmallEditScope>

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
</style>
