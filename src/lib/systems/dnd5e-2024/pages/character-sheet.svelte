<script lang="ts">
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import GridContentCard from '$lib/ui/organisms/grid-content-card.svelte';
	import PanelSurface from '$lib/ui/molecules/panel-surface.svelte';
	import ResponsiveGrid from '$lib/ui/molecules/responsive-grid.svelte';
	import QuickReference from '$lib/ui/organisms/quick-reference.svelte';
	import { projectSheet } from '../sheet-projections';
	import { inventoryCategories } from '../sheet-fields';
	import SmallEditScope from '$lib/ui/organisms/small-edit-scope.svelte';
	import { resolveAssetUrl } from '$lib/resources/asset-url';
	import NavigablePanel from '$lib/ui/molecules/navigable-panel.svelte';
	import NavigableRegion from '$lib/ui/molecules/navigable-region.svelte';
	import SheetNavigation from '$lib/ui/organisms/sheet-navigation.svelte';
	import SheetReferenceController from '$lib/ui/organisms/sheet-reference-controller.svelte';
	import SheetRulesShortcut from '$lib/ui/molecules/sheet-rules-shortcut.svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import IconBookOpen from '$lib/ui/atoms/icon-book-open.svelte';
	import { setupSheetNavigation } from '$lib/navigation/sheet-navigation-session';
	import type { SheetNavigationHost } from '$lib/navigation/sheet-navigation-host';
	import { setAnnotationReferenceProvider } from '$lib/resources/annotation-reference-context';
	import { createCatalogAnnotationReferenceProvider } from '$lib/resources/catalog-annotation-reference';
	import { authoredReferenceCatalog } from '$lib/resources/authored-reference-catalog';
	import {
		dnd5e2024ResourceCatalog,
		FULL_2024_SRD_PATH,
		DND5E_2024_GENERAL_LOCATOR_ID,
		DND5E_2024_ORIGIN_LOCATOR_ID,
		DND5E_2024_ACTIONS_LOCATOR_ID,
		DND5E_2024_CLASSES_LOCATOR_ID,
		DND5E_2024_CREATION_LOCATOR_ID,
		DND5E_2024_SPELLS_LOCATOR_ID,
		DND5E_2024_EQUIPMENT_LOCATOR_ID
	} from '$lib/resources/dnd5e2024-resource-catalog';
	import { sheetLandmarks, landmark } from '../sheet-landmarks';
	import RecordCollection from '../components/record-collection.svelte';
	import { createSheetEditSession, type SheetEditOwner } from '../editing/sheet-edit-session';
	let { owner, navigation }: { owner: SheetEditOwner; navigation: SheetNavigationHost } = $props();
	setupSheetNavigation(sheetLandmarks, () => navigation);
	setAnnotationReferenceProvider(
		createCatalogAnnotationReferenceProvider(authoredReferenceCatalog, (path) =>
			resolveAssetUrl(path)
		)
	);
	const annotationEditorConfig = {
		referenceTemplates: dnd5e2024ResourceCatalog.locators.map((locator) => ({
			key: locator.id,
			label: `SRD 5.2.1: ${locator.label}`,
			reference: {
				sourceId: locator.resourceId,
				kind: 'pdf' as const,
				locator: { page: locator.page, url: FULL_2024_SRD_PATH }
			}
		}))
	};
	const session = createSheetEditSession({
		read: () => owner.read(),
		write: (character) => owner.write(character),
		reject: () => owner.reject?.() ?? false
	});
	const character = $derived(owner.read());
	const featurePanels = ['features', 'traits', 'masteries'] as const;
	const data = $derived(projectSheet(session));
	const saveRuntime = (patch: JSONPatchDocument) => {
		const result = session.patch(patch);
		if (!result.ok) throw new Error(result.message);
	};
</script>

<div class="min-w-0 space-y-3 py-2">
	<header>
		<h1 class="text-2xl font-bold">
			{character.systemData.identity.name || 'Unnamed character'}
			<span class="theme-text-muted text-base">D&D 5e (2024)</span>
		</h1>
	</header>
	<SmallEditScope
		enabled
		canTarget={session.canTarget}
		buildGrid={(request) => session.buildGrid({ ...request, annotationEditorConfig })}
		buildRecord={(key) => session.buildRecord(key, annotationEditorConfig)}
	>
		<SheetReferenceController
			{navigation}
			catalog={dnd5e2024ResourceCatalog}
			systemId="dnd5e-2024"
		/>
		<SheetRulesShortcut
			id="sheet-rules-trigger"
			onOpen={() => navigation.openReference(DND5E_2024_GENERAL_LOCATOR_ID, 'sheet-rules-trigger')}
		/>
		<div class="flex min-w-0 items-start gap-2 pr-2">
			<SheetNavigation landmarks={sheetLandmarks} />
			<main class="flex min-w-0 flex-1 flex-col gap-3" aria-label="2024 character sheet">
				<NavigableRegion landmark={landmark('sheet-overview-heading')}>
					<NavigablePanel landmark={landmark('sheet-origin-heading')}>
						{#snippet headerActions()}{@render referenceButton(
								'origin',
								DND5E_2024_ORIGIN_LOCATOR_ID
							)}{/snippet}
						<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
							<PanelSurface>
								<GridContentCard
									data={data.identity}
									detailTitle="Identity"
									displayMaxCols={1}
									inlineFieldControls={false}
								/>
								<div class="mt-2 border-t border-[var(--color-surface-border)] pt-2">
									<RecordCollection
										{character}
										{session}
										kind="classes"
										title="Classes"
										presentation="compact"
										pinning={false}
									/>
								</div>
							</PanelSurface>
							<PanelSurface
								><GridContentCard
									data={data.origin}
									detailTitle="Identity & Origin"
									displayMaxCols={1}
									inlineFieldControls={false}
								/></PanelSurface
							>
							<PanelSurface
								><GridContentCard
									data={data.appearance}
									detailTitle="Alignment & Appearance"
									displayMaxCols={1}
									inlineFieldControls={false}
								/></PanelSurface
							>
						</ResponsiveGrid>
					</NavigablePanel>
				</NavigableRegion>
				<NavigableRegion landmark={landmark('sheet-runtime-heading')}>
					<NavigablePanel landmark={landmark('sheet-quick-reference-heading')}>
						<QuickReference
							liveData={data.live}
							referenceData={data.reference}
							sectionBreakBefore="movement.walk"
							{annotationEditorConfig}
							onFieldSavePatch={saveRuntime}
						/>
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-actions-heading')}>
						{#snippet headerActions()}{@render referenceButton(
								'actions',
								DND5E_2024_ACTIONS_LOCATOR_ID
							)}{/snippet}
						<PanelSurface
							><RecordCollection
								{character}
								{session}
								kind="runtimeActions"
								title="Runtime Actions"
							/></PanelSurface
						>
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-abilities-heading')}>
						{#snippet headerActions()}{@render referenceButton(
								'character-creation',
								DND5E_2024_CREATION_LOCATOR_ID
							)}{/snippet}
						<div class="space-y-3">
							<PanelSurface
								><GridContentCard
									data={data.proficiency}
									detailTitle="Proficiency bonus"
									displayAlign="center"
									displayMaxCols={1}
									inlineFieldControls={false}
								/>
								<p class="theme-text-muted mt-2 text-center text-xs" aria-label="Proficiency key">
									<strong>P</strong> = Proficient (×1 bonus) · <strong>E</strong> = Expertise (×2, skills
									only)
								</p></PanelSurface
							>
							<ResponsiveGrid cols={1} colsMd={2} colsLg={3} classes="gap-3">
								{#each data.abilities as ability (ability.key)}
									<PanelSurface
										><GridContentCard
											data={ability.data}
											detailTitle={ability.title}
											displayMaxCols={1}
											inlineFieldControls={false}
										/></PanelSurface
									>
								{/each}
							</ResponsiveGrid>
							<PanelSurface
								><GridContentCard
									data={data.training}
									detailTitle="Equipment training"
									displayMaxCols={2}
									inlineFieldControls={false}
								/></PanelSurface
							>
							<ResponsiveGrid cols={1} colsMd={2} classes="gap-3">
								<PanelSurface
									><RecordCollection
										{character}
										{session}
										kind="languages"
										title="Languages"
									/></PanelSurface
								>
								<PanelSurface
									><RecordCollection
										{character}
										{session}
										kind="tools"
										title="Tools"
									/></PanelSurface
								>
							</ResponsiveGrid>
						</div>
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-features-heading')}>
						{#snippet headerActions()}{@render referenceButton(
								'classes',
								DND5E_2024_CLASSES_LOCATOR_ID
							)}{/snippet}
						<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
							{#each featurePanels as kind (kind)}
								<PanelSurface
									><RecordCollection
										{character}
										{session}
										{kind}
										additionalKinds={kind === 'features' ? ['feats'] : []}
										title={kind === 'masteries'
											? 'Weapon Mastery'
											: kind === 'features'
												? 'Features & Feats'
												: 'Traits'}
									/></PanelSurface
								>
							{/each}
						</ResponsiveGrid>
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-spells-heading')}>
						{#snippet headerActions()}{@render referenceButton(
								'spells',
								DND5E_2024_SPELLS_LOCATOR_ID
							)}{/snippet}
						<div class="space-y-3">
							<PanelSurface
								><GridContentCard
									data={data.casting}
									detailTitle="Spellcasting summary"
									displayAlign="center"
									displayMaxCols={3}
									inlineFieldControls={false}
								/></PanelSurface
							>
							<PanelSurface>
								<ResponsiveGrid cols={1} colsMd={2} colsLg={3} classes="gap-2">
									{#each data.slots as slot (slot.level)}
										<section
											class="theme-panel min-w-0 rounded-md border p-2"
											aria-label={`Level ${slot.level} spell slots`}
										>
											<GridContentCard
												data={slot.data}
												detailTitle={`Level ${slot.level} spell slots`}
												displayAlign="center"
												displayMaxCols={1}
												inlineFieldControls={false}
											/>
										</section>
									{/each}
								</ResponsiveGrid>
							</PanelSurface>
							<PanelSurface
								><RecordCollection
									{character}
									{session}
									kind="spells"
									title="Spells"
								/></PanelSurface
							>
						</div>
					</NavigablePanel>
				</NavigableRegion>
				<NavigableRegion landmark={landmark('sheet-organizational-heading')}>
					<NavigablePanel landmark={landmark('sheet-inventory-heading')}>
						{#snippet headerActions()}{@render referenceButton(
								'equipment',
								DND5E_2024_EQUIPMENT_LOCATOR_ID
							)}{/snippet}
						<div class="space-y-3">
							<PanelSurface
								><GridContentCard
									data={data.currency}
									detailTitle="Treasure"
									displayAlign="center"
									displayMaxCols={5}
									handleFieldSavePatch={saveRuntime}
								/></PanelSurface
							>
							<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
								{#each Object.entries(inventoryCategories) as [category, title] (category)}
									<PanelSurface
										><RecordCollection
											{character}
											{session}
											kind="inventory"
											{title}
											category={category as keyof typeof inventoryCategories}
										/></PanelSurface
									>
								{/each}
							</ResponsiveGrid>
						</div>
					</NavigablePanel>
					<NavigablePanel landmark={landmark('sheet-notes-heading')}>
						<div class="space-y-3">
							<ResponsiveGrid cols={1} colsMd={3} classes="gap-3">
								{#each data.roleplay as fields, index (index)}
									<PanelSurface
										><GridContentCard
											data={fields}
											detailTitle="Roleplay & Notes"
											displayMaxCols={1}
											inlineFieldControls={false}
										/></PanelSurface
									>
								{/each}
							</ResponsiveGrid>
							<PanelSurface
								><RecordCollection
									{character}
									{session}
									kind="notes"
									title="Quick Notes"
								/></PanelSurface
							>
						</div>
					</NavigablePanel>
				</NavigableRegion>
			</main>
		</div>
	</SmallEditScope>
</div>

{#snippet referenceButton(topic: string, locatorId: string)}
	<BaseButton
		id={`sheet-${topic}-references-trigger`}
		iconOnly
		size="sm"
		ariaLabel={`References: ${topic}`}
		title={`References: ${topic}`}
		onclick={() => navigation.openReference(locatorId, `sheet-${topic}-references-trigger`)}
		><IconBookOpen classes="h-4 w-4" /></BaseButton
	>
{/snippet}
