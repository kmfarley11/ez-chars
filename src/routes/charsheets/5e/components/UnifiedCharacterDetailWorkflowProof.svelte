<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';
	import type { Annotation, Item } from '../../../../schema';
	import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
	import Badge from '$components/Badge.svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import IconButton from '$components/IconButton.svelte';
	import {
		getInventoryGroupForItem,
		withInventoryGroupTags,
		type InventoryGroup
	} from '$lib/dnd5e2014/inventory';
	import BoundedCollectionRegion from '$components/BoundedCollectionRegion.svelte';
	import StableRuntimeFieldProof from './StableRuntimeFieldProof.svelte';
	import {
		cloneFeatureDraft,
		cloneInventoryDraft,
		cloneProfileDraft,
		cloneSpellDraft,
		commitFeatureDraft,
		commitInventoryDraft,
		commitProfileDraft,
		commitSpellDraft,
		removeAnnotationForDraft,
		restoreRemovedAnnotation,
		type AnnotationRemoval,
		type ProofFeatureRecord,
		type ProofInventoryRecord,
		type ProofProfileField,
		type ProofSpellRecord
	} from './unifiedDetailProofState';

	type Screen =
		| 'closed'
		| 'profile-detail'
		| 'profile-edit'
		| 'inventory-detail'
		| 'inventory-edit'
		| 'inventory-add'
		| 'inventory-browse'
		| 'features-browse'
		| 'feature-detail'
		| 'feature-edit'
		| 'feature-add'
		| 'spells-browse'
		| 'spell-detail'
		| 'spell-edit'
		| 'spell-add';

	type DraftDomain = 'profile' | 'inventory' | 'feature' | 'spell';
	type ProfileKind = 'ancestry' | 'background' | 'maximum-hp';

	const rock = saturatedCharacter5e2014.inventory?.find((item) => item.name === 'Random rock');
	if (!rock) throw new Error('BL-077 proof fixture requires Random rock.');
	const inventoryGroupLabels: Record<InventoryGroup, string> = {
		weapons: 'Weapons',
		armorShields: 'Armor & Shields',
		other: 'Other Gear'
	};
	const inventoryGroups: Array<InventoryGroup> = ['weapons', 'armorShields', 'other'];
	const inventoryFixture = saturatedCharacter5e2014.inventory ?? [];
	const inventoryPreviewItems = inventoryGroups.flatMap((group) => {
		const matches = inventoryFixture.filter((item) => getInventoryGroupForItem(item) === group);
		if (group !== 'other') return matches.slice(0, 2);
		return [rock, ...matches.filter((item) => item.id !== rock.id).slice(0, 1)];
	});
	const inventoryRecordFromItem = (item: Item): ProofInventoryRecord => ({
		item: {
			...item,
			tags: item.tags ? [...item.tags] : undefined,
			annotations: (item.annotations ?? []).map((annotation) => ({ ...annotation }))
		},
		pinned:
			saturatedCharacter5e2014.systemData.collectionPins?.inventory?.includes(item.id) ?? false,
		provenance: `Player-authored inventory · ${inventoryGroupLabels[getInventoryGroupForItem(item)]}`,
		references:
			item.id === rock.id ? ['Campaign notebook · flooded lower halls'] : ['Character inventory']
	});

	let currentHp = $state(saturatedCharacter5e2014.systemData.combat.hitPoints.current);
	let temporaryHp = $state(saturatedCharacter5e2014.systemData.combat.hitPoints.temp ?? 0);
	let maximumHpProfile = $state<ProofProfileField>({
		body: String(saturatedCharacter5e2014.systemData.combat.hitPoints.max),
		annotations: []
	});
	const traits = ['Darkvision', 'Fey Ancestry', 'Trance'];
	let ancestryProfile = $state<ProofProfileField>({
		body: saturatedCharacter5e2014.identity.ancestryLineage ?? 'Elf',
		annotations: []
	});
	let profile = $state<ProofProfileField>({
		body: saturatedCharacter5e2014.identity.background ?? 'Sage',
		annotations: [
			{
				id: 'proof-background-note',
				origin: 'user',
				kind: 'reference',
				name: 'Researcher feature',
				text: 'Review the background feature before the expedition reaches a new archive.',
				ref: {
					sourceId: 'srd-5.1-2023',
					kind: 'pdf',
					locator: { page: 7, label: 'Character background' }
				}
			}
		]
	});
	let inventoryRecords = $state<Array<ProofInventoryRecord>>(
		inventoryPreviewItems.map(inventoryRecordFromItem)
	);
	let features = $state<Array<ProofFeatureRecord>>([
		...(saturatedCharacter5e2014.features ?? []).map((feature, index) => ({
			id: feature.id,
			name: feature.name,
			detail: feature.summary ?? feature.description ?? '',
			owner: 'General' as const,
			annotations:
				index === 1
					? [
							{
								id: 'proof-general-feature-note',
								origin: 'user' as const,
								kind: 'note' as const,
								text: 'Remember the once-per-rest limit.'
							}
						]
					: []
		})),
		...(saturatedCharacter5e2014.systemData.classes[0]?.features ?? []).map((feature, index) => ({
			id: feature.featureId,
			name: feature.name ?? `Class feature ${index + 1}`,
			detail: `Wizard feature detail ${index + 1}.`,
			owner: 'Wizard' as const,
			annotations:
				index === 2
					? [
							{
								id: 'proof-class-feature-note',
								origin: 'user' as const,
								kind: 'reference' as const,
								text: 'Confirm the duration before the next session.'
							}
						]
					: []
		}))
	]);
	let featurePins = $state<Array<string>>([
		...(saturatedCharacter5e2014.systemData.collectionPins?.features ?? [])
	]);
	let spells = $state<Array<ProofSpellRecord>>(
		(saturatedCharacter5e2014.systemData.spellcasting?.spells ?? []).map((spell) => ({
			id: spell.spellId,
			name: spell.name,
			level: spell.level ?? 0,
			prepared: spell.prepared ?? false,
			pinned:
				saturatedCharacter5e2014.systemData.collectionPins?.spells?.includes(spell.spellId) ??
				false,
			detail: spell.notes ?? '',
			annotations: (spell.annotations ?? []).map((annotation) => ({ ...annotation })),
			source: 'SRD-linked spell with player-authored reminder'
		}))
	);

	let screen = $state<Screen>('closed');
	let open = $derived(screen !== 'closed');
	let invoker = $state<HTMLElement | undefined>();
	let detailReturn = $state<'inventory-browse' | 'features-browse' | 'spells-browse' | undefined>();
	let selectedInventoryId = $state(rock.id);
	let inventoryBrowseGroup = $state<InventoryGroup>('other');
	let inventoryQueries = $state<Record<InventoryGroup, string>>({
		weapons: '',
		armorShields: '',
		other: ''
	});
	let selectedFeatureId = $state<string | undefined>();
	let selectedSpellId = $state<string | undefined>();
	let featureQuery = $state('');
	let spellQuery = $state('');
	let profileDraft = $state<ProofProfileField | undefined>();
	let inventoryDraft = $state<ProofInventoryRecord | undefined>();
	let featureDraft = $state<ProofFeatureRecord | undefined>();
	let spellDraft = $state<ProofSpellRecord | undefined>();
	let saveError = $state('');
	let pendingRemoval = $state<{ domain: DraftDomain; removal: AnnotationRemoval } | undefined>();
	let confirmingRecordRemoval = $state(false);
	let profileKind = $state<ProfileKind>('background');
	let addName = $state('');
	let addDetail = $state('');
	let addInventoryGroup = $state<InventoryGroup>('other');
	let addSpellLevel = $state(1);
	let proofRecordSequence = 0;
	const prefersReducedMotion = new MediaQuery('prefers-reduced-motion: reduce', true);
	const inventoryPreviewLimit = 5;

	const activeProfile = $derived(
		profileKind === 'background'
			? profile
			: profileKind === 'ancestry'
				? ancestryProfile
				: maximumHpProfile
	);
	const activeProfileLabel = $derived(
		profileKind === 'background'
			? 'Background'
			: profileKind === 'ancestry'
				? 'Ancestry'
				: 'Maximum HP'
	);

	const normalizedFeatureQuery = $derived(featureQuery.trim().toLocaleLowerCase());
	const visibleFeatures = $derived(
		features.filter((feature) => feature.name.toLocaleLowerCase().includes(normalizedFeatureQuery))
	);
	const prioritizedVisibleFeatures = $derived(
		visibleFeatures.toSorted(
			(left, right) =>
				Number(featurePins.includes(right.id)) - Number(featurePins.includes(left.id)) ||
				left.name.localeCompare(right.name)
		)
	);
	const normalizedSpellQuery = $derived(spellQuery.trim().toLocaleLowerCase());
	const visibleSpells = $derived(
		spells.filter((spell) => spell.name.toLocaleLowerCase().includes(normalizedSpellQuery))
	);
	const selectedFeature = $derived(features.find((feature) => feature.id === selectedFeatureId));
	const selectedSpell = $derived(spells.find((spell) => spell.id === selectedSpellId));
	const selectedInventory = $derived(
		inventoryRecords.find((record) => record.item.id === selectedInventoryId)
	);
	const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	const levelLabel = (level: number): string => {
		if (level === 0) return 'Cantrips';
		const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
		return `${level}${suffix} level`;
	};

	const noteLabel = (count: number): string => `${count} ${count === 1 ? 'note' : 'notes'}`;

	const setScreen = async (next: Screen) => {
		screen = next;
		await tick();
	};

	const openProfile = (element: HTMLElement, kind: ProfileKind, editing = false) => {
		invoker = element;
		profileKind = kind;
		detailReturn = undefined;
		if (editing) beginProfileEdit();
		else screen = 'profile-detail';
	};

	const openInventory = (id: string, element: HTMLElement, editing = false) => {
		if (screen !== 'inventory-browse') invoker = element;
		selectedInventoryId = id;
		detailReturn = screen === 'inventory-browse' ? 'inventory-browse' : undefined;
		if (editing) beginInventoryEdit();
		else screen = 'inventory-detail';
	};

	const openInventoryBrowse = (group: InventoryGroup, element: HTMLElement) => {
		invoker = element;
		inventoryBrowseGroup = group;
		detailReturn = undefined;
		screen = 'inventory-browse';
	};

	const openFeatures = (element: HTMLElement) => {
		invoker = element;
		detailReturn = undefined;
		screen = 'features-browse';
	};

	const openSpells = (element: HTMLElement) => {
		invoker = element;
		detailReturn = undefined;
		screen = 'spells-browse';
	};

	const openFeature = (id: string, element: HTMLElement, editing = false) => {
		if (screen !== 'features-browse') invoker = element;
		selectedFeatureId = id;
		detailReturn = screen === 'features-browse' ? screen : undefined;
		if (editing) beginFeatureEdit();
		else screen = 'feature-detail';
	};

	const openSpell = (id: string, element: HTMLElement, editing = false) => {
		if (screen !== 'spells-browse') invoker = element;
		selectedSpellId = id;
		detailReturn = screen === 'spells-browse' ? screen : undefined;
		if (editing) beginSpellEdit();
		else screen = 'spell-detail';
	};

	const resetDraftStatus = () => {
		saveError = '';
		pendingRemoval = undefined;
		confirmingRecordRemoval = false;
	};

	function beginProfileEdit() {
		profileDraft = cloneProfileDraft(activeProfile);
		resetDraftStatus();
		screen = 'profile-edit';
	}

	function beginInventoryEdit() {
		if (!selectedInventory) return;
		inventoryDraft = cloneInventoryDraft(selectedInventory);
		resetDraftStatus();
		screen = 'inventory-edit';
	}

	function beginFeatureEdit() {
		if (!selectedFeature) return;
		featureDraft = cloneFeatureDraft(selectedFeature);
		resetDraftStatus();
		screen = 'feature-edit';
	}

	function beginSpellEdit() {
		if (!selectedSpell) return;
		spellDraft = cloneSpellDraft(selectedSpell);
		resetDraftStatus();
		screen = 'spell-edit';
	}

	const resetAddDraft = () => {
		addName = '';
		addDetail = '';
		addSpellLevel = 1;
		saveError = '';
	};

	const beginInventoryAdd = (group: InventoryGroup, element: HTMLElement) => {
		invoker = element;
		addInventoryGroup = group;
		resetAddDraft();
		screen = 'inventory-add';
	};

	const beginFeatureAdd = (element: HTMLElement) => {
		invoker = element;
		resetAddDraft();
		screen = 'feature-add';
	};

	const beginSpellAdd = (element: HTMLElement) => {
		invoker = element;
		resetAddDraft();
		screen = 'spell-add';
	};

	const closeWorkflow = async () => {
		screen = 'closed';
		resetDraftStatus();
		await tick();
		invoker?.focus();
	};

	const handleBack = async () => {
		resetDraftStatus();
		if (screen === 'profile-edit') return setScreen('profile-detail');
		if (screen === 'inventory-edit') return setScreen('inventory-detail');
		if (screen === 'feature-edit') return setScreen('feature-detail');
		if (screen === 'spell-edit') return setScreen('spell-detail');
		if (screen === 'inventory-detail' && detailReturn === 'inventory-browse') {
			screen = detailReturn;
			await tick();
			document.getElementById(`proof-focused-inventory-detail-${selectedInventoryId}`)?.focus();
			return;
		}
		if (screen === 'feature-detail' && detailReturn) {
			screen = detailReturn;
			await tick();
			document.getElementById(`proof-feature-detail-${selectedFeatureId}`)?.focus();
			return;
		}
		if (screen === 'spell-detail' && detailReturn) {
			screen = detailReturn;
			await tick();
			document.getElementById(`proof-spell-detail-${selectedSpellId}`)?.focus();
			return;
		}
	};

	const recordRemoval = (
		domain: DraftDomain,
		previous: ReadonlyArray<Annotation>,
		next: Array<Annotation>
	) => {
		if (next.length >= previous.length) return;
		const removed = previous.find(
			(annotation) => !next.some((candidate) => candidate.id === annotation.id)
		);
		if (!removed?.id) return;
		const result = removeAnnotationForDraft(previous, removed.id);
		if (result.removal) pendingRemoval = { domain, removal: result.removal };
	};

	const updateProfileAnnotations = (next: Array<Annotation>) => {
		if (!profileDraft) return;
		recordRemoval('profile', profileDraft.annotations, next);
		profileDraft = { ...profileDraft, annotations: next };
		saveError = '';
	};

	const updateInventoryAnnotations = (next: Array<Annotation>) => {
		if (!inventoryDraft) return;
		const previous = inventoryDraft.item.annotations ?? [];
		recordRemoval('inventory', previous, next);
		inventoryDraft = {
			...inventoryDraft,
			item: { ...inventoryDraft.item, annotations: next }
		};
		saveError = '';
	};

	const updateFeatureAnnotations = (next: Array<Annotation>) => {
		if (!featureDraft) return;
		recordRemoval('feature', featureDraft.annotations, next);
		featureDraft = { ...featureDraft, annotations: next };
		saveError = '';
	};

	const updateSpellAnnotations = (next: Array<Annotation>) => {
		if (!spellDraft) return;
		recordRemoval('spell', spellDraft.annotations, next);
		spellDraft = { ...spellDraft, annotations: next };
		saveError = '';
	};

	const undoRemoval = () => {
		if (!pendingRemoval) return;
		const { domain, removal } = pendingRemoval;
		if (domain === 'profile' && profileDraft) {
			profileDraft = {
				...profileDraft,
				annotations: restoreRemovedAnnotation(profileDraft.annotations, removal)
			};
		}
		if (domain === 'inventory' && inventoryDraft) {
			inventoryDraft = {
				...inventoryDraft,
				item: {
					...inventoryDraft.item,
					annotations: restoreRemovedAnnotation(inventoryDraft.item.annotations ?? [], removal)
				}
			};
		}
		if (domain === 'feature' && featureDraft) {
			featureDraft = {
				...featureDraft,
				annotations: restoreRemovedAnnotation(featureDraft.annotations, removal)
			};
		}
		if (domain === 'spell' && spellDraft) {
			spellDraft = {
				...spellDraft,
				annotations: restoreRemovedAnnotation(spellDraft.annotations, removal)
			};
		}
		pendingRemoval = undefined;
	};

	const saveDraft = async () => {
		if (screen === 'profile-edit' && profileDraft) {
			if (profileKind === 'maximum-hp') {
				const value = Number(profileDraft.body);
				if (!Number.isInteger(value) || value < 0) {
					return (saveError = 'Maximum HP must be a whole number of zero or greater.');
				}
			}
			const result = commitProfileDraft(activeProfile, profileDraft, activeProfileLabel);
			if (!result.ok) return (saveError = result.message);
			if (profileKind === 'background') profile = result.value;
			else if (profileKind === 'ancestry') ancestryProfile = result.value;
			else maximumHpProfile = result.value;
			return setScreen('profile-detail');
		}
		if (screen === 'inventory-edit' && inventoryDraft) {
			if (!selectedInventory) return;
			const result = commitInventoryDraft(selectedInventory, inventoryDraft);
			if (!result.ok) return (saveError = result.message);
			inventoryRecords = inventoryRecords.map((record) =>
				record.item.id === result.value.item.id ? result.value : record
			);
			return setScreen('inventory-detail');
		}
		if (screen === 'feature-edit' && featureDraft && selectedFeature) {
			const result = commitFeatureDraft(selectedFeature, featureDraft);
			if (!result.ok) return (saveError = result.message);
			features = features.map((feature) =>
				feature.id === result.value.id ? result.value : feature
			);
			return setScreen('feature-detail');
		}
		if (screen === 'spell-edit' && spellDraft && selectedSpell) {
			const result = commitSpellDraft(selectedSpell, spellDraft);
			if (!result.ok) return (saveError = result.message);
			spells = spells.map((spell) => (spell.id === result.value.id ? result.value : spell));
			return setScreen('spell-detail');
		}
	};

	const saveAddedRecord = async () => {
		const name = addName.trim();
		if (!name) return (saveError = 'Name is required.');
		proofRecordSequence += 1;
		const identity = `proof-added-${proofRecordSequence}`;

		if (screen === 'inventory-add') {
			const record: ProofInventoryRecord = {
				item: {
					id: `inventory-${identity}`,
					name,
					quantity: 1,
					notes: addDetail.trim(),
					tags: withInventoryGroupTags(undefined, addInventoryGroup),
					annotations: []
				},
				pinned: false,
				provenance: `Player-authored inventory · ${inventoryGroupLabels[addInventoryGroup]}`,
				references: []
			};
			inventoryRecords = [record, ...inventoryRecords];
			return closeWorkflow();
		}

		if (screen === 'feature-add') {
			const record: ProofFeatureRecord = {
				id: `feature-${identity}`,
				name,
				detail: addDetail.trim(),
				owner: 'General',
				annotations: []
			};
			features = [...features, record];
			return closeWorkflow();
		}

		if (screen === 'spell-add') {
			const record: ProofSpellRecord = {
				id: `spell-${identity}`,
				name,
				level: addSpellLevel,
				prepared: false,
				pinned: false,
				detail: addDetail.trim(),
				annotations: [],
				source: 'Player-authored spell'
			};
			spells = [...spells, record];
			return closeWorkflow();
		}
	};

	const removeSelectedRecord = async () => {
		let fallbackId = '';
		const returnScreen = detailReturn;
		if (screen === 'inventory-detail' && selectedInventory) {
			fallbackId = `proof-add-inventory-${getInventoryGroupForItem(selectedInventory.item)}`;
			inventoryRecords = inventoryRecords.filter(
				(record) => record.item.id !== selectedInventory.item.id
			);
		}
		if (screen === 'feature-detail' && selectedFeature?.owner === 'General') {
			const selectedId = selectedFeature.id;
			fallbackId = 'proof-add-feature';
			features = features.filter((feature) => feature.id !== selectedId);
			featurePins = featurePins.filter((id) => id !== selectedId);
		}
		if (screen === 'spell-detail' && selectedSpell) {
			const selectedId = selectedSpell.id;
			fallbackId = 'proof-add-spell';
			spells = spells.filter((spell) => spell.id !== selectedId);
		}
		if (returnScreen) {
			detailReturn = undefined;
			screen = returnScreen;
			await tick();
			document
				.getElementById(
					returnScreen === 'features-browse'
						? 'proof-focused-feature-search'
						: 'proof-focused-spell-search'
				)
				?.focus();
			return;
		}
		invoker = fallbackId ? (document.getElementById(fallbackId) ?? invoker) : invoker;
		await closeWorkflow();
	};

	const toggleSpellPrepared = (id: string) => {
		spells = spells.map((spell) =>
			spell.id === id ? { ...spell, prepared: !spell.prepared } : spell
		);
	};

	const restoreToggleFocus = async (element: HTMLElement) => {
		const id = element.id;
		await tick();
		if (element.isConnected) element.focus();
		else if (id) document.getElementById(id)?.focus();
	};

	const toggleFeaturePinned = (id: string, element: HTMLElement) => {
		featurePins = featurePins.includes(id)
			? featurePins.filter((identity) => identity !== id)
			: [...featurePins, id];
		void restoreToggleFocus(element);
	};

	const toggleInventoryPinned = (id: string, element: HTMLElement) => {
		inventoryRecords = inventoryRecords.map((record) =>
			record.item.id === id ? { ...record, pinned: !record.pinned } : record
		);
		void restoreToggleFocus(element);
	};

	const toggleSpellPinned = (id: string, element?: HTMLElement) => {
		spells = spells.map((spell) => (spell.id === id ? { ...spell, pinned: !spell.pinned } : spell));
		if (element) void restoreToggleFocus(element);
	};

	const isEditing = $derived(
		screen === 'profile-edit' ||
			screen === 'inventory-edit' ||
			screen === 'feature-edit' ||
			screen === 'spell-edit'
	);
	const isAdding = $derived(
		screen === 'inventory-add' || screen === 'feature-add' || screen === 'spell-add'
	);
	const showBack = $derived(
		isEditing ||
			(screen === 'inventory-detail' && detailReturn === 'inventory-browse') ||
			(screen === 'feature-detail' && detailReturn !== undefined) ||
			(screen === 'spell-detail' && detailReturn !== undefined)
	);
	const dialogTitle = $derived(
		screen === 'inventory-add'
			? `Add ${inventoryGroupLabels[addInventoryGroup]} item`
			: screen === 'feature-add'
				? 'Add Feature'
				: screen === 'spell-add'
					? 'Add Spell'
					: screen === 'inventory-browse'
						? inventoryGroupLabels[inventoryBrowseGroup]
						: screen.startsWith('profile')
							? activeProfileLabel
							: screen.startsWith('inventory')
								? (selectedInventory?.item.name ?? 'Inventory item')
								: screen.startsWith('feature')
									? screen === 'features-browse'
										? 'Features'
										: (selectedFeature?.name ?? 'Feature')
									: screen === 'spells-browse'
										? 'Spells'
										: (selectedSpell?.name ?? 'Spell')
	);
</script>

{#snippet inventoryRows(
	records: ReadonlyArray<ProofInventoryRecord>,
	group: InventoryGroup,
	focused = false
)}
	<ul class="space-y-1.5" aria-label={`${inventoryGroupLabels[group]} records`}>
		{#each records as record (record.item.id)}
			<li class="theme-panel flex items-center gap-2 rounded-md border px-2 py-1">
				<div class="min-w-0 flex-1">
					<div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
						<p class="truncate text-sm font-semibold">{record.item.name}</p>
						{#if (record.item.annotations?.length ?? 0) > 0}
							<Badge label={noteLabel(record.item.annotations?.length ?? 0)} />
						{/if}
					</div>
					<p class="theme-text-muted mt-1 line-clamp-2 text-xs">
						{record.item.notes || 'No authored detail.'}
					</p>
				</div>
				<div class="flex shrink-0 items-center gap-1">
					<IconButton
						id={`${focused ? 'proof-focused' : 'proof-inline'}-inventory-pin-${record.item.id}`}
						variant="pin"
						size="sm"
						shadingVariant={record.pinned ? 'dark' : 'light'}
						ariaLabel={`${record.pinned ? 'Unpin' : 'Pin'} ${record.item.name}`}
						ariaPressed={record.pinned}
						onclick={(event) =>
							toggleInventoryPinned(record.item.id, event.currentTarget as HTMLElement)}
					/>
					<IconButton
						id={`${focused ? 'proof-focused' : 'proof-inline'}-inventory-detail-${record.item.id}`}
						variant="detail"
						size="sm"
						ariaLabel={`View ${record.item.name} details`}
						onclick={(event) => openInventory(record.item.id, event.currentTarget as HTMLElement)}
					/>
				</div>
			</li>
		{/each}
	</ul>
{/snippet}

<div class="mx-auto max-w-6xl space-y-6 p-4">
	<header class="space-y-2">
		<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">BL-077 proof</p>
		<h1 class="text-2xl font-bold">Three-tier read-first interaction comparison</h1>
		<p class="theme-text-muted max-w-3xl text-sm">
			This isolated proof does not change the character sheet. Use it to judge stable runtime
			editing, focused authored-plus-annotation drafts, and scan-first collection navigation before
			rollout. Batch organization is preserved separately as a deferred concept.
		</p>
	</header>

	<section aria-labelledby="runtime-proof-heading" class="space-y-3">
		<h2 id="runtime-proof-heading" class="text-lg font-semibold">
			Tier 1 · Quick Reference context
		</h2>
		<div class="theme-panel space-y-3 rounded-xl border p-3">
			<div>
				<h3 class="font-semibold">Hit Points</h3>
				<p class="theme-text-muted text-sm">
					Runtime and read-first fields shown together to expose likely rollout density.
				</p>
			</div>
			<div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
				<StableRuntimeFieldProof
					label="Current HP"
					value={currentHp}
					onChange={(value) => (currentHp = value)}
				/>
				<StableRuntimeFieldProof
					label="Temporary HP"
					value={temporaryHp}
					onChange={(value) => (temporaryHp = value)}
				/>
				<article
					class="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2"
				>
					<div class="min-w-0">
						<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">Maximum HP</p>
						<p class="mt-1 flex h-8 items-center text-2xl font-bold tabular-nums">
							{maximumHpProfile.body}
						</p>
					</div>
					<IconButton
						variant="detail"
						size="sm"
						ariaLabel="View Maximum HP details"
						title="View Maximum HP details"
						onclick={(event) => openProfile(event.currentTarget as HTMLElement, 'maximum-hp')}
					/>
				</article>
			</div>
		</div>
	</section>

	<section aria-labelledby="detail-proof-heading" class="space-y-3">
		<h2 id="detail-proof-heading" class="text-lg font-semibold">
			Tier 2 · Character details and equipment context
		</h2>
		<div class="space-y-4">
			<div class="theme-panel space-y-3 rounded-xl border p-3">
				<div>
					<h3 class="font-semibold">Character Details</h3>
					<p class="theme-text-muted text-sm">Neighboring read-first identity fields.</p>
				</div>
				<div class="grid gap-2 md:grid-cols-2">
					<article
						class="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2"
					>
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
								<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">
									Ancestry
								</p>
								{#if ancestryProfile.annotations.length > 0}
									<Badge label={noteLabel(ancestryProfile.annotations.length)} />
								{/if}
							</div>
							<p class="mt-1 truncate font-semibold">{ancestryProfile.body}</p>
						</div>
						<div class="flex items-center gap-1">
							<IconButton
								variant="detail"
								size="sm"
								ariaLabel="View Ancestry details"
								title="View Ancestry details"
								onclick={(event) => openProfile(event.currentTarget as HTMLElement, 'ancestry')}
							/>
						</div>
					</article>

					<article
						class="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2"
					>
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
								<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">
									Background
								</p>
								<Badge label={noteLabel(profile.annotations.length)} />
							</div>
							<p class="mt-1 truncate font-semibold">{profile.body}</p>
						</div>
						<div class="flex items-center gap-1">
							<IconButton
								variant="detail"
								size="sm"
								ariaLabel="View Background details"
								title="View Background details"
								onclick={(event) => openProfile(event.currentTarget as HTMLElement, 'background')}
							/>
						</div>
					</article>
				</div>
			</div>

			<div class="theme-panel space-y-3 rounded-xl border p-3">
				<div>
					<h3 class="font-semibold">Inventory / Equipment</h3>
					<p class="theme-text-muted text-sm">Three collection groups using one row grammar.</p>
				</div>
				<div class="grid gap-2 lg:grid-cols-3">
					{#each inventoryGroups as group (group)}
						{@const groupRecords = inventoryRecords.filter(
							(record) => getInventoryGroupForItem(record.item) === group
						)}
						{@const normalizedGroupQuery = inventoryQueries[group].trim().toLocaleLowerCase()}
						{@const visibleGroupRecords = groupRecords.filter((record) =>
							`${record.item.name} ${record.item.notes ?? ''}`
								.toLocaleLowerCase()
								.includes(normalizedGroupQuery)
						)}
						{@const isDenseGroup = groupRecords.length > inventoryPreviewLimit}
						<article class="space-y-2 rounded-lg border p-2">
							<div class="flex items-center justify-between gap-2">
								<div class="min-w-0">
									<h4 class="text-sm font-semibold">{inventoryGroupLabels[group]}</h4>
									<p class="theme-text-muted text-xs">{groupRecords.length} records</p>
								</div>
								<IconButton
									id={`proof-add-inventory-${group}`}
									variant="add"
									size="sm"
									ariaLabel={`Add ${inventoryGroupLabels[group]} item`}
									onclick={(event) => beginInventoryAdd(group, event.currentTarget as HTMLElement)}
								/>
							</div>
							{#if isDenseGroup}
								<label class="block">
									<span class="sr-only">Search {inventoryGroupLabels[group]}</span>
									<input
										class="theme-input touch-target w-full rounded-md border px-2 py-1 text-base md:text-sm"
										type="search"
										placeholder={`Search ${inventoryGroupLabels[group].toLocaleLowerCase()}`}
										bind:value={inventoryQueries[group]}
									/>
								</label>
								{#if visibleGroupRecords.length > 0}
									<BoundedCollectionRegion
										ariaLabel={`${inventoryGroupLabels[group]} scrollable results`}
										viewportId={`proof-inventory-${group}`}
									>
										{@render inventoryRows(visibleGroupRecords, group)}
									</BoundedCollectionRegion>
								{:else}
									<p class="theme-text-muted rounded-md border px-2 py-2 text-xs" role="status">
										No {inventoryGroupLabels[group].toLocaleLowerCase()} match this search.
									</p>
								{/if}
								<BaseButton
									size="sm"
									classes="w-full"
									onclick={(event) =>
										openInventoryBrowse(group, event.currentTarget as HTMLElement)}
								>
									Browse all {groupRecords.length} items
								</BaseButton>
							{:else}
								{@render inventoryRows(groupRecords, group)}
							{/if}
						</article>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section aria-labelledby="collection-proof-heading" class="space-y-3">
		<h2 id="collection-proof-heading" class="text-lg font-semibold">Tier 3 · Collection context</h2>
		<div class="space-y-4">
			<div class="theme-panel space-y-3 rounded-xl border p-3">
				<div>
					<h3 class="font-semibold">Features &amp; Traits</h3>
					<p class="theme-text-muted text-sm">A saturated collection beside a short collection.</p>
				</div>
				<div class="grid gap-2 md:grid-cols-2">
					<article class="space-y-2 rounded-lg border p-2">
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0">
								<h4 class="font-semibold">Features</h4>
								<p class="theme-text-muted text-sm">
									{features.length} general and class-owned records
								</p>
							</div>
							<div class="flex shrink-0 items-center gap-1">
								<IconButton
									id="proof-add-feature"
									variant="add"
									size="sm"
									ariaLabel="Add Feature"
									onclick={(event) => beginFeatureAdd(event.currentTarget as HTMLElement)}
								/>
								<IconButton
									variant="detail"
									size="sm"
									ariaLabel="Open Features focused view"
									title="Open Features focused view"
									onclick={(event) => openFeatures(event.currentTarget as HTMLElement)}
								/>
							</div>
						</div>
						<label class="block">
							<span class="sr-only">Find a feature in sheet</span>
							<input
								class="theme-input touch-target w-full rounded-md border px-2 py-1 text-base md:text-sm"
								type="search"
								placeholder="Find a feature"
								bind:value={featureQuery}
							/>
						</label>
						<BoundedCollectionRegion
							ariaLabel="Features scrollable results"
							viewportId="proof-features"
						>
							<ul class="space-y-1" aria-label="Features in sheet">
								{#each prioritizedVisibleFeatures as feature (feature.id)}
									<li
										class="theme-panel flex items-center gap-2 rounded-md border px-2 py-1"
										animate:flip={{ duration: prefersReducedMotion.current ? 0 : 160 }}
									>
										<div class="min-w-0 flex-1">
											<div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
												<p class="truncate text-sm font-semibold">{feature.name}</p>
												<Badge label={feature.owner} />
												{#if feature.annotations.length}
													<Badge label={noteLabel(feature.annotations.length)} />
												{/if}
											</div>
											<p class="theme-text-muted mt-1 truncate text-xs">{feature.detail}</p>
										</div>
										<IconButton
											id={`proof-inline-feature-pin-${feature.id}`}
											variant="pin"
											size="sm"
											shadingVariant={featurePins.includes(feature.id) ? 'dark' : 'light'}
											ariaLabel={`${featurePins.includes(feature.id) ? 'Unpin' : 'Pin'} ${feature.name}`}
											ariaPressed={featurePins.includes(feature.id)}
											title={`${featurePins.includes(feature.id) ? 'Unpin' : 'Pin'} ${feature.name}`}
											onclick={(event) =>
												toggleFeaturePinned(feature.id, event.currentTarget as HTMLElement)}
										/>
										<IconButton
											variant="detail"
											size="sm"
											ariaLabel={`View ${feature.name} details`}
											title={`View ${feature.name} details`}
											onclick={(event) =>
												openFeature(feature.id, event.currentTarget as HTMLElement)}
										/>
									</li>
								{/each}
							</ul>
						</BoundedCollectionRegion>
					</article>

					<article class="rounded-lg border p-2">
						<div class="flex items-center justify-between gap-3">
							<div>
								<h4 class="font-semibold">Traits</h4>
								<p class="theme-text-muted text-sm">{traits.length} ancestry traits</p>
							</div>
						</div>
						<ul class="mt-3 space-y-1 text-sm">
							{#each traits as trait (trait)}<li>• {trait}</li>{/each}
						</ul>
						<p class="theme-text-muted mt-3 text-xs">Layout context · below saturation limit</p>
					</article>
				</div>
			</div>

			<article class="theme-panel space-y-2 rounded-xl border p-3">
				<div class="flex items-center justify-between gap-3">
					<div class="min-w-0">
						<h3 class="font-semibold">Spells</h3>
						<p class="theme-text-muted text-sm">
							{spells.length} grouped spells with duplicate names
						</p>
					</div>
					<div class="flex shrink-0 items-center gap-1">
						<IconButton
							id="proof-add-spell"
							variant="add"
							size="sm"
							ariaLabel="Add Spell"
							onclick={(event) => beginSpellAdd(event.currentTarget as HTMLElement)}
						/>
						<IconButton
							variant="detail"
							size="sm"
							ariaLabel="Open Spells focused view"
							title="Open Spells focused view"
							onclick={(event) => openSpells(event.currentTarget as HTMLElement)}
						/>
					</div>
				</div>
				<label class="block">
					<span class="sr-only">Find a spell in sheet</span>
					<input
						class="theme-input touch-target w-full rounded-md border px-2 py-1 text-base md:text-sm"
						type="search"
						placeholder="Find a spell"
						bind:value={spellQuery}
					/>
				</label>
				<BoundedCollectionRegion
					ariaLabel="Spells scrollable results"
					viewportId="proof-spells"
					maxHeight="14rem"
				>
					<ul class="space-y-1" aria-label="Spells in sheet">
						{#each visibleSpells.toSorted((a, b) => Number(b.pinned) - Number(a.pinned) || a.level - b.level || a.name.localeCompare(b.name)) as spell (spell.id)}
							<li
								class="theme-panel flex items-center gap-2 rounded-md border px-2 py-1"
								animate:flip={{ duration: prefersReducedMotion.current ? 0 : 160 }}
							>
								<div class="min-w-0 flex-1">
									<div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
										<p class="truncate text-sm font-semibold">{spell.name}</p>
										<Badge label={levelLabel(spell.level)} />
										{#if spell.prepared}<Badge label="Prepared" />{/if}
										{#if spell.annotations.length}
											<Badge label={noteLabel(spell.annotations.length)} />
										{/if}
									</div>
									<p class="theme-text-muted mt-1 truncate text-xs">{spell.detail}</p>
								</div>
								<IconButton
									id={`proof-inline-spell-pin-${spell.id}`}
									variant="pin"
									size="sm"
									shadingVariant={spell.pinned ? 'dark' : 'light'}
									ariaLabel={`${spell.pinned ? 'Unpin' : 'Pin'} ${spell.name} ${spell.id}`}
									ariaPressed={spell.pinned}
									title={`${spell.pinned ? 'Unpin' : 'Pin'} ${spell.name}`}
									onclick={(event) =>
										toggleSpellPinned(spell.id, event.currentTarget as HTMLElement)}
								/>
								<IconButton
									variant="detail"
									size="sm"
									ariaLabel={`View ${spell.name} ${spell.id} details`}
									title={`View ${spell.name} details`}
									onclick={(event) => openSpell(spell.id, event.currentTarget as HTMLElement)}
								/>
							</li>
						{/each}
					</ul>
				</BoundedCollectionRegion>
			</article>
		</div>
	</section>

	<aside
		aria-labelledby="alternatives-heading"
		class="rounded-lg border border-dashed bg-black/5 p-4 dark:bg-white/5"
	>
		<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">
			Reviewer context · not proposed sheet UI
		</p>
		<h2 id="alternatives-heading" class="mt-1 text-base font-semibold">Bounded alternatives</h2>
		<dl class="mt-3 space-y-3 text-sm">
			<div>
				<dt class="font-semibold">Leading · Three tiers</dt>
				<dd class="theme-text-muted">
					Runtime stays fast, rich detail stays read-first, and organization stays structural.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">Rejected candidate · Global Edit mode</dt>
				<dd class="theme-text-muted">
					A large mode switch exposes unrelated controls and hides whether a tap reads or edits.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">Rejected candidate · General section Edit</dt>
				<dd class="theme-text-muted">
					A smaller bulk form still combines unrelated rich records and annotations.
				</dd>
			</div>
		</dl>
	</aside>
</div>

<DialogShell
	bind:open
	title={dialogTitle}
	fullHeightMobile
	wide={screen === 'inventory-browse' || screen.startsWith('feature') || screen.startsWith('spell')}
	scrollAffordance
	{showBack}
	onBack={() => void handleBack()}
	onClose={() => void closeWorkflow()}
	onCancel={() => {
		if (isEditing) {
			void handleBack();
			return false;
		}
		resetDraftStatus();
		return true;
	}}
	closeText={isEditing || isAdding ? 'Cancel' : 'Close'}
>
	{#snippet actions()}
		{#if isEditing}
			<BaseButton onclick={() => void saveDraft()}>Save</BaseButton>
		{:else if isAdding}
			<BaseButton onclick={() => void saveAddedRecord()}>Add record</BaseButton>
		{:else if screen === 'profile-detail'}
			<BaseButton onclick={beginProfileEdit}>Edit</BaseButton>
		{:else if screen === 'inventory-detail'}
			{#if confirmingRecordRemoval}
				<BaseButton onclick={() => (confirmingRecordRemoval = false)}>Keep item</BaseButton>
				<BaseButton
					classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
					onclick={() => void removeSelectedRecord()}>Confirm remove</BaseButton
				>
			{:else}
				<BaseButton
					classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
					onclick={() => (confirmingRecordRemoval = true)}>Remove item</BaseButton
				>
				<BaseButton onclick={beginInventoryEdit}>Edit</BaseButton>
			{/if}
		{:else if screen === 'feature-detail'}
			{#if selectedFeature?.owner === 'General'}
				{#if confirmingRecordRemoval}
					<BaseButton onclick={() => (confirmingRecordRemoval = false)}>Keep feature</BaseButton>
					<BaseButton
						classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
						onclick={() => void removeSelectedRecord()}>Confirm remove</BaseButton
					>
				{:else}
					<BaseButton
						classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
						onclick={() => (confirmingRecordRemoval = true)}>Remove feature</BaseButton
					>
					<BaseButton onclick={beginFeatureEdit}>Edit</BaseButton>
				{/if}
			{:else}
				<BaseButton onclick={beginFeatureEdit}>Edit</BaseButton>
			{/if}
		{:else if screen === 'spell-detail'}
			{#if confirmingRecordRemoval}
				<BaseButton onclick={() => (confirmingRecordRemoval = false)}>Keep spell</BaseButton>
				<BaseButton
					classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
					onclick={() => void removeSelectedRecord()}>Confirm remove</BaseButton
				>
			{:else}
				<BaseButton
					classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
					onclick={() => (confirmingRecordRemoval = true)}>Remove spell</BaseButton
				>
				<BaseButton onclick={beginSpellEdit}>Edit</BaseButton>
			{/if}
		{/if}
	{/snippet}
	{#if confirmingRecordRemoval}
		<p role="alert" class="mb-4 rounded-md border border-red-700 p-2 text-sm dark:border-red-300">
			Confirm removal of only this selected record. Other collection records and their notes remain
			unchanged.
		</p>
	{/if}

	{#if isAdding}
		<div class="space-y-4">
			<p class="theme-text-muted text-sm">
				Add collects only enough authored information to create one record. Later detail and notes
				stay in that record's focused workflow.
			</p>
			<label class="block space-y-1">
				<span class="text-sm font-semibold">Name</span>
				<input
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					bind:value={addName}
					oninput={() => (saveError = '')}
				/>
			</label>
			{#if screen === 'spell-add'}
				<label class="block space-y-1">
					<span class="text-sm font-semibold">Level</span>
					<select
						class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
						bind:value={addSpellLevel}
					>
						{#each spellLevels as level (level)}
							<option value={level}>{levelLabel(level)}</option>
						{/each}
					</select>
				</label>
			{:else if screen === 'feature-add'}
				<p class="theme-text-muted text-sm">
					New records begin as General features; class-owned records remain source-controlled.
				</p>
			{:else if screen === 'inventory-add'}
				<p class="theme-text-muted text-sm">
					Collection: {inventoryGroupLabels[addInventoryGroup]}
				</p>
			{/if}
			<label class="block space-y-1">
				<span class="text-sm font-semibold"
					>Initial detail <span class="font-normal">(optional)</span></span
				>
				<textarea
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					rows="3"
					bind:value={addDetail}
				></textarea>
			</label>
			{#if saveError}
				<p role="alert" class="text-sm font-semibold text-red-700 dark:text-red-300">
					{saveError}
				</p>
			{/if}
		</div>
	{:else if screen === 'profile-detail'}
		<div class="space-y-5">
			<section>
				<h3 class="text-sm font-semibold">Authored information</h3>
				<p class="mt-1 whitespace-pre-wrap">{activeProfile.body}</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Provenance</h3>
				<p class="theme-text-muted mt-1 text-sm">
					Player-authored {activeProfileLabel.toLocaleLowerCase()} field
				</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Notes</h3>
				<div class="mt-1">
					<GridContentAnnotationsDisplay annotations={activeProfile.annotations} />
				</div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">References</h3>
				<p class="theme-text-muted mt-1 text-sm">
					References remain attached to the annotations above.
				</p>
			</section>
		</div>
	{:else if screen === 'profile-edit' && profileDraft}
		<div class="space-y-4">
			<label class="block space-y-1">
				<span class="text-sm font-semibold">Authored {activeProfileLabel.toLocaleLowerCase()}</span>
				{#if profileKind === 'maximum-hp'}
					<input
						class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
						type="number"
						min="0"
						step="1"
						value={profileDraft.body}
						oninput={(event) => {
							if (!profileDraft) return;
							profileDraft = { ...profileDraft, body: event.currentTarget.value };
							saveError = '';
						}}
					/>
				{:else}
					<textarea
						class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
						rows="5"
						bind:value={profileDraft.body}
					></textarea>
				{/if}
			</label>
			<GridContentAnnotationsEditor
				annotations={profileDraft.annotations}
				onChange={updateProfileAnnotations}
			/>
			{#if pendingRemoval?.domain === 'profile'}
				<BaseButton size="sm" onclick={undoRemoval}>Undo annotation removal</BaseButton>
			{/if}
			{#if saveError}<p role="alert" class="text-sm font-semibold text-red-700 dark:text-red-300">
					{saveError}
				</p>{/if}
		</div>
	{:else if screen === 'inventory-detail' && selectedInventory}
		<div class="space-y-5">
			<section>
				<h3 class="text-sm font-semibold">Authored information</h3>
				<p class="mt-1 whitespace-pre-wrap">{selectedInventory.item.notes}</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Provenance</h3>
				<p class="theme-text-muted mt-1 text-sm">
					{selectedInventory.provenance} · Identity {selectedInventory.item.id}
				</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Notes</h3>
				<div class="mt-1">
					<GridContentAnnotationsDisplay annotations={selectedInventory.item.annotations ?? []} />
				</div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">References</h3>
				<ul class="theme-text-muted mt-1 list-disc pl-5 text-sm">
					{#each selectedInventory.references as reference (reference)}<li>{reference}</li>{/each}
				</ul>
			</section>
		</div>
	{:else if screen === 'inventory-edit' && inventoryDraft}
		<div class="space-y-4">
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Name</span><input
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					bind:value={inventoryDraft.item.name}
				/></label
			>
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Authored detail</span><textarea
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					rows="6"
					bind:value={inventoryDraft.item.notes}
				></textarea></label
			>
			<GridContentAnnotationsEditor
				annotations={inventoryDraft.item.annotations ?? []}
				onChange={updateInventoryAnnotations}
			/>
			{#if pendingRemoval?.domain === 'inventory'}<BaseButton size="sm" onclick={undoRemoval}
					>Undo annotation removal</BaseButton
				>{/if}
			{#if saveError}<p role="alert" class="text-sm font-semibold text-red-700 dark:text-red-300">
					{saveError}
				</p>{/if}
		</div>
	{:else if screen === 'inventory-browse'}
		{@const browseRecords = inventoryRecords.filter(
			(record) => getInventoryGroupForItem(record.item) === inventoryBrowseGroup
		)}
		{@const normalizedBrowseQuery = inventoryQueries[inventoryBrowseGroup]
			.trim()
			.toLocaleLowerCase()}
		{@const visibleBrowseRecords = browseRecords.filter((record) =>
			`${record.item.name} ${record.item.notes ?? ''}`
				.toLocaleLowerCase()
				.includes(normalizedBrowseQuery)
		)}
		<div class="space-y-4">
			<label class="block space-y-1">
				<span class="text-sm font-semibold"
					>Search {inventoryGroupLabels[inventoryBrowseGroup]}</span
				>
				<input
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					type="search"
					bind:value={inventoryQueries[inventoryBrowseGroup]}
				/>
			</label>
			<p class="theme-text-muted text-xs" role="status">
				{visibleBrowseRecords.length} of {browseRecords.length} items
			</p>
			{#if visibleBrowseRecords.length > 0}
				{@render inventoryRows(visibleBrowseRecords, inventoryBrowseGroup, true)}
			{:else}
				<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
					No {inventoryGroupLabels[inventoryBrowseGroup].toLocaleLowerCase()} match this search.
				</p>
			{/if}
		</div>
	{:else if screen === 'features-browse'}
		<div class="space-y-4">
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Find a feature</span><input
					id="proof-focused-feature-search"
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					type="search"
					bind:value={featureQuery}
				/></label
			>
			<ul class="space-y-2" aria-label="Features">
				{#each prioritizedVisibleFeatures as feature (feature.id)}
					<li
						class="theme-panel flex items-center justify-between gap-3 rounded-md border p-2"
						animate:flip={{ duration: prefersReducedMotion.current ? 0 : 160 }}
					>
						<div class="min-w-0">
							<div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
								<p class="truncate font-semibold">{feature.name}</p>
								<Badge label={feature.owner} />
								{#if feature.annotations.length}
									<Badge label={noteLabel(feature.annotations.length)} />
								{/if}
							</div>
							<p class="theme-text-muted mt-1 text-xs">{feature.detail}</p>
						</div>
						<div class="flex shrink-0 items-center gap-2">
							<IconButton
								id={`proof-focused-feature-pin-${feature.id}`}
								variant="pin"
								size="sm"
								shadingVariant={featurePins.includes(feature.id) ? 'dark' : 'light'}
								ariaLabel={`${featurePins.includes(feature.id) ? 'Unpin' : 'Pin'} ${feature.name}`}
								ariaPressed={featurePins.includes(feature.id)}
								title={`${featurePins.includes(feature.id) ? 'Unpin' : 'Pin'} ${feature.name}`}
								onclick={(event) =>
									toggleFeaturePinned(feature.id, event.currentTarget as HTMLElement)}
							/>
							<IconButton
								id={`proof-feature-detail-${feature.id}`}
								variant="detail"
								size="sm"
								ariaLabel={`View ${feature.name} details`}
								title={`View ${feature.name} details`}
								onclick={(event) => openFeature(feature.id, event.currentTarget as HTMLElement)}
							/>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{:else if screen === 'feature-detail' && selectedFeature}
		<div class="space-y-5">
			<section>
				<h3 class="text-sm font-semibold">Authored information</h3>
				<p class="mt-1 whitespace-pre-wrap">{selectedFeature.detail || 'No authored detail.'}</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Provenance</h3>
				<p class="theme-text-muted mt-1 text-sm">
					{selectedFeature.owner} feature · Identity {selectedFeature.id}
				</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Notes</h3>
				<div class="mt-1">
					<GridContentAnnotationsDisplay annotations={selectedFeature.annotations} />
				</div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">References</h3>
				<p class="theme-text-muted mt-1 text-sm">
					No separate source reference for this proof record.
				</p>
			</section>
		</div>
	{:else if screen === 'feature-edit' && featureDraft}
		<div class="space-y-4">
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Name</span><input
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					bind:value={featureDraft.name}
				/></label
			>
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Authored detail</span><textarea
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					rows="5"
					bind:value={featureDraft.detail}
				></textarea></label
			>
			<p class="theme-text-muted text-sm">
				Ownership remains {featureDraft.owner}; organization does not rewrite provenance.
			</p>
			<GridContentAnnotationsEditor
				annotations={featureDraft.annotations}
				onChange={updateFeatureAnnotations}
			/>
			{#if pendingRemoval?.domain === 'feature'}<BaseButton size="sm" onclick={undoRemoval}
					>Undo annotation removal</BaseButton
				>{/if}
			{#if saveError}<p role="alert" class="text-sm font-semibold text-red-700 dark:text-red-300">
					{saveError}
				</p>{/if}
		</div>
	{:else if screen === 'spells-browse'}
		<div class="space-y-4">
			<div class="flex flex-wrap items-center gap-2">
				<p class="theme-text-muted text-xs">
					Prepared is intentionally available here and in focused Edit for owner comparison.
				</p>
			</div>
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Find a spell</span><input
					id="proof-focused-spell-search"
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					type="search"
					bind:value={spellQuery}
				/></label
			>
			{#if visibleSpells.some((spell) => spell.pinned)}
				<section class="space-y-2">
					<h3 class="text-sm font-semibold">Pinned spells</h3>
					<ul class="space-y-2">
						{#each visibleSpells
							.filter((spell) => spell.pinned)
							.toSorted((a, b) => a.name.localeCompare(b.name)) as spell (spell.id)}<li
								class="theme-panel flex items-center gap-2 rounded-md border p-2"
							>
								<div class="min-w-0 flex-1">
									<div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
										<p class="truncate font-semibold">{spell.name}</p>
										<Badge label={levelLabel(spell.level)} />
										{#if spell.prepared}<Badge label="Prepared" />{/if}
										{#if spell.annotations.length}
											<Badge label={noteLabel(spell.annotations.length)} />
										{/if}
									</div>
									<p class="theme-text-muted mt-1 text-xs">{spell.id}</p>
								</div>
								<BaseButton size="sm" onclick={() => toggleSpellPrepared(spell.id)}
									>{spell.prepared ? 'Prepared' : 'Prepare'}</BaseButton
								><IconButton
									id={`proof-focused-spell-pin-${spell.id}`}
									variant="pin"
									size="sm"
									shadingVariant="dark"
									ariaLabel={`Unpin ${spell.name} ${spell.id}`}
									ariaPressed={true}
									title={`Unpin ${spell.name}`}
									onclick={(event) =>
										toggleSpellPinned(spell.id, event.currentTarget as HTMLElement)}
								/>
								<IconButton
									id={`proof-spell-detail-${spell.id}`}
									variant="detail"
									size="sm"
									ariaLabel={`View ${spell.name} ${spell.id} details`}
									title={`View ${spell.name} details`}
									onclick={(event) => openSpell(spell.id, event.currentTarget as HTMLElement)}
								/>
							</li>{/each}
					</ul>
				</section>
			{/if}
			{#each spellLevels as level (level)}
				{@const levelSpells = visibleSpells
					.filter((spell) => !spell.pinned && spell.level === level)
					.toSorted((a, b) => a.name.localeCompare(b.name))}
				{#if levelSpells.length}<section class="space-y-2">
						<h3 class="text-sm font-semibold">{levelLabel(level)}</h3>
						<ul class="space-y-2">
							{#each levelSpells as spell (spell.id)}<li
									class="theme-panel flex items-center gap-2 rounded-md border p-2"
								>
									<div class="min-w-0 flex-1">
										<div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
											<p class="truncate font-semibold">{spell.name}</p>
											<Badge label={levelLabel(spell.level)} />
											{#if spell.prepared}<Badge label="Prepared" />{/if}
											{#if spell.annotations.length}
												<Badge label={noteLabel(spell.annotations.length)} />
											{/if}
										</div>
										<p class="theme-text-muted mt-1 text-xs">{spell.id}</p>
									</div>
									<BaseButton size="sm" onclick={() => toggleSpellPrepared(spell.id)}
										>{spell.prepared ? 'Prepared' : 'Prepare'}</BaseButton
									><IconButton
										id={`proof-focused-spell-pin-${spell.id}`}
										variant="pin"
										size="sm"
										ariaLabel={`Pin ${spell.name} ${spell.id}`}
										ariaPressed={false}
										title={`Pin ${spell.name}`}
										onclick={(event) =>
											toggleSpellPinned(spell.id, event.currentTarget as HTMLElement)}
									/>
									<IconButton
										id={`proof-spell-detail-${spell.id}`}
										variant="detail"
										size="sm"
										ariaLabel={`View ${spell.name} ${spell.id} details`}
										title={`View ${spell.name} details`}
										onclick={(event) => openSpell(spell.id, event.currentTarget as HTMLElement)}
									/>
								</li>{/each}
						</ul>
					</section>{/if}
			{/each}
		</div>
	{:else if screen === 'spell-detail' && selectedSpell}
		<div class="space-y-5">
			<div class="flex flex-wrap items-center gap-2">
				<Badge label={levelLabel(selectedSpell.level)} /><Badge
					label={selectedSpell.prepared ? 'Prepared' : 'Not prepared'}
				/><Badge label={selectedSpell.pinned ? 'Pinned' : 'Not pinned'} /><IconButton
					variant="pin"
					size="sm"
					shadingVariant={selectedSpell.pinned ? 'dark' : 'light'}
					ariaPressed={selectedSpell.pinned}
					ariaLabel={selectedSpell.pinned ? 'Unpin spell' : 'Pin spell'}
					title={selectedSpell.pinned ? 'Unpin spell' : 'Pin spell'}
					onclick={() => toggleSpellPinned(selectedSpell.id)}
				/>
			</div>
			<section>
				<h3 class="text-sm font-semibold">Authored information</h3>
				<p class="mt-1 whitespace-pre-wrap">{selectedSpell.detail}</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Provenance</h3>
				<p class="theme-text-muted mt-1 text-sm">
					{selectedSpell.source} · Identity {selectedSpell.id}
				</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Notes</h3>
				<div class="mt-1">
					<GridContentAnnotationsDisplay annotations={selectedSpell.annotations} />
				</div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">References</h3>
				<p class="theme-text-muted mt-1 text-sm">
					Source context remains distinct from player-authored annotations.
				</p>
			</section>
		</div>
	{:else if screen === 'spell-edit' && spellDraft}
		<div class="space-y-4">
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Name</span><input
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					bind:value={spellDraft.name}
				/></label
			>
			<label class="block space-y-1"
				><span class="text-sm font-semibold">Authored reminder</span><textarea
					class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
					rows="5"
					bind:value={spellDraft.detail}
				></textarea></label
			>
			<label class="touch-target flex items-center gap-2"
				><input type="checkbox" bind:checked={spellDraft.prepared} /><span>Prepared</span></label
			>
			<GridContentAnnotationsEditor
				annotations={spellDraft.annotations}
				onChange={updateSpellAnnotations}
			/>
			{#if pendingRemoval?.domain === 'spell'}<BaseButton size="sm" onclick={undoRemoval}
					>Undo annotation removal</BaseButton
				>{/if}
			{#if saveError}<p role="alert" class="text-sm font-semibold text-red-700 dark:text-red-300">
					{saveError}
				</p>{/if}
		</div>
	{/if}
</DialogShell>
