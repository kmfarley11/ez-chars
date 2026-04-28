<script lang="ts">
	import { resolve } from '$app/paths';
	import GridContent from '$lib/GridContent.svelte';
	import GridContainer from '$lib/GridContainer.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';
	import { createId } from '../../../schema/helpers';
	import {
		DND_BEYOND_BASIC_RULES_REF_5E_2014,
		SRD_REF_5E_2014,
		annotationSchema,
		type AbilityKey,
		type Annotation,
		type CharacterDocument5e2014,
		type Dnd5eSkillName,
		type SpellLevel,
		type SpellRef
	} from '../../../schema';
	import { applyGridPatches } from '$lib/characterGridHelpers';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentBindPath,
		GridContentData,
		GridContentField,
		GridContentPatch
	} from '$lib/gridContentTypes';

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
			: 'This route needs a character id in the URL. Open a character from the home view or create a new one there.'
	);
	const char: CharacterDocument5e2014 = $derived(
		hasMatchingCharacter ? ($charsArray[charIdx] ?? emptyChar) : emptyChar
	) as CharacterDocument5e2014;

	type AnnotationEntries = Record<string, Annotation>;
	type PrimitiveGridValue = string | number | boolean;
	type SpellListLevel = SpellLevel;

	const abilityMetadata: Array<{ key: AbilityKey; label: string; shortLabel: string }> = [
		{ key: 'str', label: 'Strength', shortLabel: 'STR' },
		{ key: 'dex', label: 'Dexterity', shortLabel: 'DEX' },
		{ key: 'con', label: 'Constitution', shortLabel: 'CON' },
		{ key: 'wis', label: 'Wisdom', shortLabel: 'WIS' },
		{ key: 'int', label: 'Intelligence', shortLabel: 'INT' },
		{ key: 'cha', label: 'Charisma', shortLabel: 'CHA' }
	];

	const skillMetadata: Array<{ name: Dnd5eSkillName; abilityKey: AbilityKey }> = [
		{ name: 'Acrobatics', abilityKey: 'dex' },
		{ name: 'Animal Handling', abilityKey: 'wis' },
		{ name: 'Arcana', abilityKey: 'int' },
		{ name: 'Athletics', abilityKey: 'str' },
		{ name: 'Deception', abilityKey: 'cha' },
		{ name: 'History', abilityKey: 'int' },
		{ name: 'Insight', abilityKey: 'wis' },
		{ name: 'Intimidation', abilityKey: 'cha' },
		{ name: 'Investigation', abilityKey: 'int' },
		{ name: 'Medicine', abilityKey: 'wis' },
		{ name: 'Nature', abilityKey: 'int' },
		{ name: 'Perception', abilityKey: 'wis' },
		{ name: 'Performance', abilityKey: 'cha' },
		{ name: 'Persuasion', abilityKey: 'cha' },
		{ name: 'Religion', abilityKey: 'int' },
		{ name: 'Sleight of Hand', abilityKey: 'dex' },
		{ name: 'Stealth', abilityKey: 'dex' },
		{ name: 'Survival', abilityKey: 'wis' }
	];

	const spellSlotLevelMetadata: Array<{
		key: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
		label: string;
	}> = [
		{ key: '1', label: '1st' },
		{ key: '2', label: '2nd' },
		{ key: '3', label: '3rd' },
		{ key: '4', label: '4th' },
		{ key: '5', label: '5th' },
		{ key: '6', label: '6th' },
		{ key: '7', label: '7th' },
		{ key: '8', label: '8th' },
		{ key: '9', label: '9th' }
	];

	const spellListLevelPathPrefix = '__spellLevelList';

	const spellListLevelBindPath = (level: SpellListLevel): GridContentBindPath => [
		spellListLevelPathPrefix,
		level
	];

	const annotationEditorConfig: GridAnnotationEditorConfig = {
		defaultKind: 'note',
		defaultOrigin: 'user',
		referenceTemplates: [
			{
				key: 'srd-5e-2014',
				label: 'SRD 5.1 (local PDF)',
				reference: SRD_REF_5E_2014
			},
			{
				key: 'dnd-beyond-basic-rules-2014',
				label: 'D&D Beyond Basic Rules (2014)',
				reference: DND_BEYOND_BASIC_RULES_REF_5E_2014
			}
		]
	};

	const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null && !Array.isArray(value);

	const getValueAtPath = (source: unknown, path: GridContentBindPath): unknown => {
		let cursor: unknown = source;
		for (const segment of path) {
			if (typeof segment === 'number') {
				if (!Array.isArray(cursor)) return undefined;
				cursor = cursor[segment];
				continue;
			}

			if (!isObjectRecord(cursor)) return undefined;
			cursor = cursor[segment];
		}
		return cursor;
	};

	const toSystemDataAnnotationPath = (
		bindPath: GridContentBindPath
	): GridContentBindPath | undefined => {
		if (bindPath.length === 0) return undefined;
		if (bindPath[0] === 'systemData') {
			return ['systemData', 'annotations', ...bindPath.slice(1), '_annotations'];
		}
		if (bindPath[0] === 'identity') {
			return ['systemData', 'annotations', 'identity', ...bindPath.slice(1), '_annotations'];
		}
		return undefined;
	};

	const annotationsAtPath = (
		annotationBindPath: GridContentBindPath | undefined
	): Array<GridContentAnnotation> => {
		if (!annotationBindPath) return [];
		const value = getValueAtPath(char, annotationBindPath);
		if (!isObjectRecord(value)) return [];
		return Object.entries(value).flatMap(([key, entry]) => {
			const parsed = annotationSchema.safeParse(entry);
			if (!parsed.success) return [];
			return [
				{
					...parsed.data,
					id:
						typeof parsed.data.id === 'string' && parsed.data.id.trim().length > 0
							? parsed.data.id
							: key
				}
			];
		});
	};

	const withFieldAnnotations = (
		value: PrimitiveGridValue,
		bindPath: GridContentBindPath,
		options: Pick<GridContentField, 'fieldName' | 'label'> = {}
	): GridContentField => {
		const annotationBindPath = toSystemDataAnnotationPath(bindPath);
		if (!annotationBindPath) return { ...options, bindPath, value };
		return {
			...options,
			bindPath,
			annotationBindPath,
			annotations: annotationsAtPath(annotationBindPath),
			value
		};
	};

	const metaPrimaryData = $derived<GridContentData>({
		name: withFieldAnnotations(char.identity.name, ['identity', 'name']),
		classLevels: {
			addItemLabel: 'Add Class',
			addItemTemplate: {
				fieldName: 'Class',
				value: {
					name: {
						fieldName: 'Name',
						value: 'Class'
					},
					level: {
						fieldName: 'Level',
						value: 1
					}
				}
			},
			bindPath: ['systemData', 'classes'],
			value: char.systemData.classes.map((entry, index) => ({
				fieldName: `Class ${index + 1}`,
				value: {
					name: withFieldAnnotations(entry.name, ['systemData', 'classes', index, 'name'], {
						fieldName: `Class ${index + 1} Name`
					}),
					level: withFieldAnnotations(entry.level, ['systemData', 'classes', index, 'level'], {
						fieldName: `Class ${index + 1} Level`
					})
				}
			}))
		}
	});

	const metaSecondaryData = $derived<GridContentData>({
		ancestry: withFieldAnnotations(
			char.identity.ancestryLineage ?? char.systemData.race?.name ?? '',
			['identity', 'ancestryLineage']
		),
		background: withFieldAnnotations(
			char.identity.background ?? char.systemData.background?.name ?? '',
			['identity', 'background']
		)
	});

	const metaTertiaryData = $derived<GridContentData>({
		alignment: withFieldAnnotations(char.identity.alignment ?? '', ['identity', 'alignment']),
		appearance: withFieldAnnotations(char.identity.appearance ?? '', ['identity', 'appearance'])
	});

	const quickRefPrimaryData = $derived<GridContentData>({
		hp: {
			value: {
				current: withFieldAnnotations(char.systemData.combat?.hitPoints?.current ?? 0, [
					'systemData',
					'combat',
					'hitPoints',
					'current'
				]),
				max: withFieldAnnotations(char.systemData.combat?.hitPoints?.max ?? 0, [
					'systemData',
					'combat',
					'hitPoints',
					'max'
				])
			}
		},
		tempHp: withFieldAnnotations(char.systemData.combat?.hitPoints?.temp ?? 0, [
			'systemData',
			'combat',
			'hitPoints',
			'temp'
		]),
		initiative: withFieldAnnotations(char.systemData.combat?.initiative ?? 0, [
			'systemData',
			'combat',
			'initiative'
		]),
		armorClass: withFieldAnnotations(char.systemData.combat?.armorClass ?? 0, [
			'systemData',
			'combat',
			'armorClass'
		])
	});
	const quickRefMovementData = $derived<GridContentData>({
		speed: withFieldAnnotations(
			char.systemData.combat?.speed ?? char.systemData.race?.speed ?? '',
			['systemData', 'combat', 'speed'],
			{
				label: 'walking ft'
			}
		),
		climb: withFieldAnnotations(
			char.systemData.combat?.speedClimb ?? char.systemData.race?.speedClimb ?? '',
			['systemData', 'combat', 'speedClimb'],
			{
				fieldName: 'Climb',
				label: 'ft'
			}
		),
		swim: withFieldAnnotations(
			char.systemData.combat?.speedSwim ?? char.systemData.race?.speedSwim ?? '',
			['systemData', 'combat', 'speedSwim'],
			{
				fieldName: 'Swim',
				label: 'ft'
			}
		),
		fly: withFieldAnnotations(
			char.systemData.combat?.speedFly ?? char.systemData.race?.speedFly ?? '',
			['systemData', 'combat', 'speedFly'],
			{
				label: 'ft'
			}
		)
	});
	const quickRefSecondaryData = $derived<GridContentData>({
		hitDice: {
			fieldName: 'Hit Dice',
			value: {
				remaining: withFieldAnnotations(char.systemData.combat?.hitDice?.remaining ?? '', [
					'systemData',
					'combat',
					'hitDice',
					'remaining'
				]),
				total: withFieldAnnotations(char.systemData.combat?.hitDice?.total ?? '', [
					'systemData',
					'combat',
					'hitDice',
					'total'
				])
			}
		},
		deathSaves: {
			fieldName: 'Death Saves',
			value: {
				successes: withFieldAnnotations(
					char.systemData.combat?.deathSaves?.successes ?? 0,
					['systemData', 'combat', 'deathSaves', 'successes'],
					{
						label: 'ok'
					}
				),
				failures: withFieldAnnotations(
					char.systemData.combat?.deathSaves?.failures ?? 0,
					['systemData', 'combat', 'deathSaves', 'failures'],
					{
						label: 'rip'
					}
				)
			}
		}
	});

	const proficiencyBonusRuntimeData = $derived<GridContentData>({
		proficiencyBonus: withFieldAnnotations(
			char.systemData.proficiencyBonus,
			['systemData', 'proficiencyBonus'],
			{
				fieldName: 'Prof. Bonus'
			}
		)
	});

	const abilityRuntimeColumns = $derived<
		Array<{ key: AbilityKey; shortLabel: string; data: GridContentData }>
	>(
		abilityMetadata.map(({ key, shortLabel }) => {
			const abilityData = char.systemData.abilities[key];
			const saveData = char.systemData.saves[key];
			const skillsForAbility = skillMetadata.filter((entry) => entry.abilityKey === key);

			return {
				key,
				shortLabel,
				data: Object.fromEntries([
					[
						'ability',
						{
							fieldName: shortLabel,
							value: {
								score: withFieldAnnotations(
									abilityData.score,
									['systemData', 'abilities', key, 'score'],
									{
										fieldName: 'Score',
										label: 'score'
									}
								),
								mod: withFieldAnnotations(
									abilityData.mod ?? 0,
									['systemData', 'abilities', key, 'mod'],
									{
										fieldName: 'Modifier',
										label: 'mod'
									}
								)
							}
						}
					],
					[
						'save',
						withFieldAnnotations(
							saveData?.proficient ?? false,
							['systemData', 'saves', key, 'proficient'],
							{
								fieldName: 'Save'
							}
						)
					],
					...skillsForAbility.map(({ name }) => {
						return [
							name,
							withFieldAnnotations(
								char.systemData.skills[name]?.proficient ?? false,
								['systemData', 'skills', name, 'proficient'],
								{
									fieldName: name
								}
							) satisfies GridContentField
						] as const;
					})
				])
			};
		})
	);

	const defaultSpellcastingAbility = $derived<AbilityKey>(
		char.systemData.spellcasting?.ability ??
			char.systemData.classes.find((entry) => entry.spellcasting?.ability)?.spellcasting?.ability ??
			'int'
	);

	const spellcastingRuntimeData = $derived<GridContentData>({
		ability: withFieldAnnotations(
			char.systemData.spellcasting?.ability ?? defaultSpellcastingAbility,
			['systemData', 'spellcasting', 'ability'],
			{
				fieldName: 'Ability'
			}
		),
		spellSaveDC: withFieldAnnotations(
			char.systemData.spellcasting?.spellSaveDC ?? 0,
			['systemData', 'spellcasting', 'spellSaveDC'],
			{
				fieldName: 'Save DC'
			}
		),
		spellAttackBonus: withFieldAnnotations(
			char.systemData.spellcasting?.spellAttackBonus ?? 0,
			['systemData', 'spellcasting', 'spellAttackBonus'],
			{
				fieldName: 'Attack Bonus'
			}
		)
	});

	const spellSlotRuntimeCards = $derived<
		Array<{ key: string; label: string; data: GridContentData }>
	>(
		(() => {
			const currentSpells = char.systemData.spellcasting?.spells ?? [];

			const createSpellListField = (level: SpellListLevel): GridContentField => ({
				fieldName: level === 0 ? 'Cantrips' : 'Spells',
				addItemLabel: level === 0 ? 'Add Cantrip' : 'Add Spell',
				addItemTemplate: {
					fieldName: level === 0 ? 'Cantrip' : 'Spell',
					value: {
						name: {
							fieldName: 'Name',
							value: level === 0 ? 'Cantrip' : 'Spell'
						},
						prepared: {
							fieldName: 'Prepared',
							value: false,
							editOnly: true
						},
						notes: {
							fieldName: 'Notes',
							value: '',
							editOnly: true,
							multiline: true
						}
					}
				},
				bindPath: spellListLevelBindPath(level),
				value: currentSpells
					.filter((spell) => (spell.level ?? 0) === level)
					.map((spell) => ({
						fieldName: level === 0 ? 'Cantrip' : 'Spell',
						value: {
							name: {
								fieldName: 'Name',
								value: spell.name
							},
							prepared: {
								fieldName: 'Prepared',
								value: spell.prepared ?? false,
								editOnly: true
							},
							notes: {
								fieldName: 'Notes',
								value: spell.notes ?? '',
								editOnly: true,
								multiline: true
							}
						}
					}))
			});

			return [
				{
					key: 'cantrips',
					label: 'Cantrips',
					data: {
						spells: createSpellListField(0)
					}
				},
				...spellSlotLevelMetadata.map(({ key, label }) => ({
					key,
					label,
					data: {
						slots: {
							fieldName: label,
							value: {
								used: withFieldAnnotations(
									char.systemData.spellcasting?.slots?.[key]?.used ?? 0,
									['systemData', 'spellcasting', 'slots', key, 'used'],
									{
										fieldName: 'Used'
									}
								),
								max: withFieldAnnotations(
									char.systemData.spellcasting?.slots?.[key]?.max ?? 0,
									['systemData', 'spellcasting', 'slots', key, 'max'],
									{
										fieldName: 'Max'
									}
								)
							}
						},
						spells: createSpellListField(Number(key) as SpellListLevel)
					}
				}))
			];
		})()
	);

	const updateCurrent5eCharacter = (
		// eslint-disable-next-line no-unused-vars
		updateFn: (_entry: CharacterDocument5e2014) => CharacterDocument5e2014
	) => {
		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== requestedCharacterId) return entry;
				if (entry.system.id !== 'dnd5e-2014') return entry;
				return updateFn(entry as CharacterDocument5e2014);
			})
		);
	};

	const isSystemDataAnnotationPath = (path: GridContentBindPath): boolean =>
		path.length >= 3 &&
		path[0] === 'systemData' &&
		path[1] === 'annotations' &&
		path[path.length - 1] === '_annotations';

	const isValidAnnotationArray = (value: unknown): value is Array<GridContentAnnotation> =>
		Array.isArray(value) &&
		value.every((entry) => {
			const parsed = annotationSchema.safeParse(entry);
			return parsed.success;
		});

	const annotationEntriesFromArray = (
		annotations: Array<GridContentAnnotation>
	): Record<string, Annotation> => {
		const entries: Record<string, Annotation> = {};
		for (const candidate of annotations) {
			const parsed = annotationSchema.safeParse(candidate);
			if (!parsed.success) continue;
			const id =
				typeof parsed.data.id === 'string' && parsed.data.id.trim().length > 0
					? parsed.data.id
					: createId();
			if (id in entries) continue;
			entries[id] = { ...parsed.data, id };
		}
		return entries;
	};

	const pathsEqual = (left: GridContentBindPath, right: GridContentBindPath): boolean =>
		left.length === right.length && left.every((segment, idx) => segment === right[idx]);

	const pathStartsWith = (path: GridContentBindPath, prefix: GridContentBindPath): boolean =>
		prefix.every((segment, idx) => path[idx] === segment);

	const isSpellLevelListPath = (
		path: GridContentBindPath
	): path is [typeof spellListLevelPathPrefix, SpellListLevel] =>
		path.length === 2 && path[0] === spellListLevelPathPrefix && typeof path[1] === 'number';

	const normalizeSpellLevelValue = (level: SpellListLevel, value: unknown): Array<SpellRef> => {
		if (!Array.isArray(value)) return [];
		return value.flatMap((candidate) => {
			if (!isObjectRecord(candidate)) return [];
			const name =
				typeof candidate.name === 'string' ? candidate.name : level === 0 ? 'Cantrip' : 'Spell';
			const nextSpell: SpellRef = {
				name,
				level
			};
			if (typeof candidate.prepared === 'boolean') {
				nextSpell.prepared = candidate.prepared;
			}
			if (typeof candidate.notes === 'string') {
				nextSpell.notes = candidate.notes;
			}
			return [nextSpell];
		});
	};

	const mergeSpellLevelPatch = (level: SpellListLevel, value: unknown): GridContentPatch => {
		const currentSpells = char.systemData.spellcasting?.spells ?? [];
		const nextLevelSpells = normalizeSpellLevelValue(level, value);
		const mergedSpells = [
			...currentSpells.filter((spell) => (spell.level ?? 0) !== level),
			...nextLevelSpells
		].sort((left, right) => (left.level ?? 0) - (right.level ?? 0));
		return {
			path: ['systemData', 'spellcasting', 'spells'],
			value: mergedSpells
		};
	};

	const withSpellcastingDefaults = (patches: Array<GridContentPatch>): Array<GridContentPatch> => {
		const normalized = [...patches];
		const touchesSpellcasting = normalized.some((patch) =>
			pathStartsWith(patch.path, ['systemData', 'spellcasting'])
		);

		if (!touchesSpellcasting) return normalized;

		const abilityPath: GridContentBindPath = ['systemData', 'spellcasting', 'ability'];
		if (
			char.systemData.spellcasting?.ability === undefined &&
			!normalized.some((patch) => pathsEqual(patch.path, abilityPath))
		) {
			normalized.unshift({
				path: abilityPath,
				value: defaultSpellcastingAbility
			});
		}

		for (const { key } of spellSlotLevelMetadata) {
			const usedPath: GridContentBindPath = ['systemData', 'spellcasting', 'slots', key, 'used'];
			const maxPath: GridContentBindPath = ['systemData', 'spellcasting', 'slots', key, 'max'];
			const touchesUsed = normalized.some((patch) => pathsEqual(patch.path, usedPath));
			const touchesMax = normalized.some((patch) => pathsEqual(patch.path, maxPath));
			const currentSlot = char.systemData.spellcasting?.slots?.[key];

			if ((touchesUsed || touchesMax) && currentSlot?.used === undefined && !touchesUsed) {
				normalized.push({
					path: usedPath,
					value: 0
				});
			}

			if ((touchesUsed || touchesMax) && currentSlot?.max === undefined && !touchesMax) {
				normalized.push({
					path: maxPath,
					value: 0
				});
			}
		}

		return normalized;
	};

	const normalizeGridPatches = (patches: Array<GridContentPatch>): Array<GridContentPatch> =>
		withSpellcastingDefaults(
			patches.map((patch) =>
				isSpellLevelListPath(patch.path) ? mergeSpellLevelPatch(patch.path[1], patch.value) : patch
			)
		).flatMap((patch) => {
			if (!isSystemDataAnnotationPath(patch.path)) return [patch];
			if (!isValidAnnotationArray(patch.value)) return [];
			if (patch.value.length === 0) return [{ ...patch, value: undefined }];
			const entries = annotationEntriesFromArray(patch.value);
			return Object.keys(entries).length > 0
				? [{ ...patch, value: entries as AnnotationEntries }]
				: [];
		});

	const handleGridPatchesSave = (patches: Array<GridContentPatch>) => {
		updateCurrent5eCharacter((entry) => applyGridPatches(entry, normalizeGridPatches(patches)));
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
	<GridContainer pad={true} classes="rounded-lg" border={true}>
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
		<GridContainer
			heading="Quick Reference"
			border={true}
			pad={true}
			flow="row"
			count={1}
			countMd={3}
			classes="mt-2 gap-3"
		>
			<GridContainer border={true} pad={true} classes="rounded-md">
				<GridContent
					handleEditSavePatches={handleGridPatchesSave}
					{annotationEditorConfig}
					data={quickRefPrimaryData}
				/>
			</GridContainer>
			<GridContainer border={true} pad={true} classes="rounded-md">
				<GridContent
					handleEditSavePatches={handleGridPatchesSave}
					{annotationEditorConfig}
					data={quickRefMovementData}
				/>
			</GridContainer>
			<GridContainer border={true} pad={true} classes="rounded-md">
				<GridContent
					handleEditSavePatches={handleGridPatchesSave}
					{annotationEditorConfig}
					data={quickRefSecondaryData}
				/>
			</GridContainer>
		</GridContainer>
		<GridContainer
			heading="Abilities & Proficiencies"
			border={true}
			pad={true}
			flow="row"
			count={1}
			classes="mt-2 gap-3"
		>
			<GridContainer border={true} pad={true} classes="rounded-md">
				<GridContent
					handleEditSavePatches={handleGridPatchesSave}
					{annotationEditorConfig}
					displayAlign="center"
					displayMaxCols={1}
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
		</GridContainer>
		<GridContainer
			heading="Spells"
			border={true}
			pad={true}
			flow="row"
			count={1}
			classes="mt-2 gap-3"
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
	</GridContainer>

	TODO: all the rest of the info...
{/if}
