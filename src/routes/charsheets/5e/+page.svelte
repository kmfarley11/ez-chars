<script lang="ts">
	import GridContent from '$lib/GridContent.svelte';
	import GridColumn from '$lib/GridColumn.svelte';
	import GridRow from '$lib/GridRow.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';
	import type { CharacterDocument5e2014 } from '../../../schema';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import type {
		GridContentData,
		GridContentField,
		GridContentFieldValue
	} from '$lib/gridContentTypes';

	interface Props {
		data: {
			id: string;
		};
	}

	const { data }: Props = $props();
	const charIdx = $derived($charsArray.findIndex((char) => char.meta.id == data.id));
	const char: CharacterDocument5e2014 = $derived(
		charIdx === -1 ? emptyChar : ($charsArray[charIdx] ?? emptyChar)
	) as CharacterDocument5e2014;

	const metaPrimaryData = $derived<GridContentData>({
		name: {
			value: char.identity.name
		},
		classLevels: {
			value: char.systemData.classes.map((entry, index) => ({
				fieldName: `Class ${index + 1}`,
				value: {
					name: {
						fieldName: `Class ${index + 1} Name`,
						value: entry.name
					},
					level: {
						fieldName: `Class ${index + 1} Level`,
						value: entry.level
					}
				}
			}))
		}
	});

	const ancestryDisplay = $derived(
		displayOrPlaceholder(char.identity.ancestryLineage ?? char.systemData.race?.name)
	);

	const backgroundDisplay = $derived(
		displayOrPlaceholder(char.systemData.background?.name ?? char.identity.background)
	);

	const alignmentDisplay = $derived(displayOrPlaceholder(char.identity.alignment));
	const appearanceDisplay = $derived(displayOrPlaceholder(char.identity.appearance));

	const quickRefPrimaryData = $derived<GridContentData>({
		hp: {
			value: {
				current: {
					value: char.systemData.combat?.hitPoints?.current ?? 0
				},
				max: {
					value: char.systemData.combat?.hitPoints?.max ?? 0
				}
			}
		},
		armorClass: {
			value: char.systemData.combat?.armorClass
		},
		initiative: {
			value: char.systemData.combat?.initiative ?? 0
		},
		tempHp: {
			value: char.systemData.combat?.hitPoints?.temp ?? 0
		}
	});
	const speedWalkDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.speed ?? char.systemData.race?.speed, '__')
	);
	const speedFlyDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.speedFly ?? char.systemData.race?.speedFly, '__')
	);
	const speedSwimDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.speedSwim ?? char.systemData.race?.speedSwim, '__')
	);
	const speedClimbDisplay = $derived(
		displayOrPlaceholder(
			char.systemData.combat?.speedClimb ?? char.systemData.race?.speedClimb,
			'__'
		)
	);
	const quickRefSecondaryData = $derived<GridContentData>({
		hitDice: {
			fieldName: 'Hit Dice',
			value: {
				remaining: {
					value: char.systemData.combat?.hitDice?.remaining ?? ''
				},
				total: {
					value: char.systemData.combat?.hitDice?.total ?? ''
				}
			}
		},
		deathSaves: {
			fieldName: 'Death Saves',
			value: {
				successes: {
					value: char.systemData.combat?.deathSaves?.successes ?? 0,
					label: 'ok'
				},
				failures: {
					value: char.systemData.combat?.deathSaves?.failures ?? 0,
					label: 'rip'
				}
			}
		}
	});

	type GridPathSegment = string | number;

	const isGridFieldArray = (value: GridContentFieldValue): value is Array<GridContentField> =>
		Array.isArray(value);

	const isGridNestedFields = (
		value: GridContentFieldValue
	): value is Record<string, GridContentField> =>
		typeof value === 'object' && value !== null && !Array.isArray(value);

	const readFieldFromField = (
		field: GridContentField | undefined,
		path: Array<GridPathSegment>
	): GridContentField | undefined => {
		if (!field) return undefined;
		let cursor: GridContentField | undefined = field;
		for (const segment of path) {
			if (!cursor) return undefined;
			if (typeof segment === 'number') {
				if (!isGridFieldArray(cursor.value)) return undefined;
				cursor = cursor.value[segment];
				continue;
			}
			if (!isGridNestedFields(cursor.value)) return undefined;
			cursor = cursor.value[segment];
		}
		return cursor;
	};

	const readFieldFromData = (
		payload: GridContentData,
		path: Array<GridPathSegment>
	): GridContentField | undefined => {
		const [head, ...rest] = path;
		if (typeof head !== 'string') return undefined;
		return readFieldFromField(payload[head], rest);
	};

	const readStringValue = (field: GridContentField | undefined, fallback = '') =>
		displayOrPlaceholder(field?.value, fallback).trim();

	const readIntValue = (field: GridContentField | undefined, fallback = 0) => {
		const parsed = Number.parseInt(displayOrPlaceholder(field?.value, `${fallback}`), 10);
		return Number.isFinite(parsed) ? parsed : fallback;
	};

	const readStringFromData = (
		payload: GridContentData,
		path: Array<GridPathSegment>,
		fallback = ''
	) => readStringValue(readFieldFromData(payload, path), fallback);

	const readIntFromData = (payload: GridContentData, path: Array<GridPathSegment>, fallback = 0) =>
		readIntValue(readFieldFromData(payload, path), fallback);

	const readStringFromField = (
		field: GridContentField,
		path: Array<GridPathSegment>,
		fallback = ''
	) => readStringValue(readFieldFromField(field, path), fallback);

	const readIntFromField = (field: GridContentField, path: Array<GridPathSegment>, fallback = 0) =>
		readIntValue(readFieldFromField(field, path), fallback);

	const readArrayFromData = (payload: GridContentData, path: Array<GridPathSegment>) => {
		const field = readFieldFromData(payload, path);
		if (!field || !isGridFieldArray(field.value)) return [];
		return field.value;
	};

	/* eslint-disable no-unused-vars */
	type CharacterUpdater = (entry: CharacterDocument5e2014) => CharacterDocument5e2014;
	type GridPayloadUpdater = (
		payload: GridContentData,
		entry: CharacterDocument5e2014
	) => CharacterDocument5e2014;
	/* eslint-enable no-unused-vars */

	const updateCurrent5eCharacter = (updateFn: CharacterUpdater) => {
		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== data.id) return entry;
				if (entry.system.id !== 'dnd5e-2014') return entry;
				return updateFn(entry as CharacterDocument5e2014);
			})
		);
	};

	const createGridSaveHandler = (applyPayload: GridPayloadUpdater) => (payload: GridContentData) =>
		updateCurrent5eCharacter((entry) => applyPayload(payload, entry));

	const handleEditMetaSave = createGridSaveHandler((payload, entry) => {
		const nextName = readStringFromData(payload, ['name'], entry.identity.name);
		const nextClassLevels = readArrayFromData(payload, ['classLevels'])
			.map((classField) => {
				const className = readStringFromField(classField, ['name'], 'Unknown');
				const classLevel = readIntFromField(classField, ['level'], 1);
				return {
					name: className.length > 0 ? className : 'Unknown',
					level: classLevel > 0 ? classLevel : 1
				};
			})
			.filter((classLevel) => classLevel.name.length > 0);

		return {
			...entry,
			identity: {
				...entry.identity,
				name: nextName.length > 0 ? nextName : entry.identity.name
			},
			systemData: {
				...entry.systemData,
				classes: nextClassLevels
			}
		};
	});

	const handleQuickRefPrimarySave = createGridSaveHandler((payload, entry) => {
		const hpCurrent = readIntFromData(
			payload,
			['hp', 'current'],
			entry.systemData.combat.hitPoints.current
		);
		const hpMax = readIntFromData(payload, ['hp', 'max'], entry.systemData.combat.hitPoints.max);
		const hpTemp = readIntFromData(payload, ['tempHp'], entry.systemData.combat.hitPoints.temp);
		const nextAc = readIntFromData(payload, ['armorClass'], entry.systemData.combat.armorClass);
		const nextInitiative = readIntFromData(
			payload,
			['initiative'],
			entry.systemData.combat.initiative
		);

		return {
			...entry,
			systemData: {
				...entry.systemData,
				combat: {
					...entry.systemData.combat,
					armorClass: nextAc,
					initiative: nextInitiative,
					hitPoints: {
						...entry.systemData.combat.hitPoints,
						current: hpCurrent,
						max: hpMax,
						temp: hpTemp
					}
				}
			}
		};
	});

	const handleQuickRefSecondarySave = createGridSaveHandler((payload, entry) => {
		const nextHitDiceRemaining = readStringFromData(
			payload,
			['hitDice', 'remaining'],
			entry.systemData.combat.hitDice?.remaining ?? ''
		);
		const nextHitDiceTotal = readStringFromData(
			payload,
			['hitDice', 'total'],
			entry.systemData.combat.hitDice?.total ?? ''
		);
		const nextDeathSaveSuccesses = readIntFromData(
			payload,
			['deathSaves', 'successes'],
			entry.systemData.combat?.deathSaves?.successes ?? 0
		);
		const nextDeathSaveFailures = readIntFromData(
			payload,
			['deathSaves', 'failures'],
			entry.systemData.combat?.deathSaves?.failures ?? 0
		);

		return {
			...entry,
			systemData: {
				...entry.systemData,
				combat: {
					...entry.systemData.combat,
					hitDice: {
						...(entry.systemData.combat.hitDice ?? {}),
						total: nextHitDiceTotal.length > 0 ? nextHitDiceTotal : '',
						remaining: nextHitDiceRemaining.length > 0 ? nextHitDiceRemaining : ''
					},
					deathSaves: {
						...(entry.systemData.combat.deathSaves ?? {}),
						successes: nextDeathSaveSuccesses,
						failures: nextDeathSaveFailures
					}
				}
			}
		};
	});
</script>

<!-- TODO update this per the latest form factors, prove the concept and refine -->
<p>Test page 5e...</p>

<GridColumn parent={true} pad={true} classes="rounded-lg" border={true}>
	<GridRow classes="text-center text-lg font-semibold">Meta / Top-level Info</GridRow>
	<GridRow
		border={true}
		pad={true}
		parent={true}
		child={true}
		flow="row"
		colCount={1}
		colCountMd={3}
		classes="gap-3"
	>
		<GridColumn border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSave={handleEditMetaSave} data={metaPrimaryData} />
		</GridColumn>
		<GridColumn border={true} pad={true} classes="rounded-md">
			<div class="space-y-2">
				<p><span class="font-semibold">Ancestry:</span> {ancestryDisplay}</p>
				<p><span class="font-semibold">Background:</span> {backgroundDisplay}</p>
			</div>
		</GridColumn>
		<GridColumn border={true} pad={true} classes="rounded-md">
			<div class="space-y-2">
				<p><span class="font-semibold">Alignment:</span> {alignmentDisplay}</p>
				<p><span class="font-semibold">Appearance:</span> {appearanceDisplay}</p>
			</div>
		</GridColumn>
	</GridRow>
	<GridRow classes="pt-2 text-center text-lg font-semibold">Quick Reference</GridRow>
	<GridRow
		border={true}
		pad={true}
		parent={true}
		child={true}
		flow="row"
		colCount={1}
		colCountMd={3}
		classes="gap-3"
	>
		<GridColumn border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSave={handleQuickRefPrimarySave} data={quickRefPrimaryData} />
		</GridColumn>
		<GridColumn border={true} pad={true} classes="rounded-md">
			<div class="space-y-2">
				<p><span class="font-semibold">Speed:</span> {speedWalkDisplay} ft walking</p>
				<p><span class="font-semibold">Fly:</span> {speedFlyDisplay} ft</p>
				<p><span class="font-semibold">Swim:</span> {speedSwimDisplay} ft</p>
				<p><span class="font-semibold">Climb:</span> {speedClimbDisplay} ft</p>
			</div>
		</GridColumn>
		<GridColumn border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSave={handleQuickRefSecondarySave} data={quickRefSecondaryData} />
		</GridColumn>
	</GridRow>
</GridColumn>

TODO: all the rest of the info...
