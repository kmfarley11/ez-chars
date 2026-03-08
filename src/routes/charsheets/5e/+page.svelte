<script lang="ts">
	import GridContent from '$lib/GridContent.svelte';
	import GridContainer from '$lib/GridContainer.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';
	import { createId } from '../../../schema/helpers';
	import { annotationSchema, type Annotation, type CharacterDocument5e2014 } from '../../../schema';
	import { applyGridPatches } from '$lib/characterGridHelpers';
	import type {
		GridContentAnnotation,
		GridContentBindPath,
		GridContentData,
		GridContentField,
		GridContentPatch
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

	type AnnotationEntries = Record<string, Annotation>;
	type PrimitiveGridValue = string | number;

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

	const updateCurrent5eCharacter = (
		// eslint-disable-next-line no-unused-vars
		updateFn: (_entry: CharacterDocument5e2014) => CharacterDocument5e2014
	) => {
		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== data.id) return entry;
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

	const normalizeGridPatches = (patches: Array<GridContentPatch>): Array<GridContentPatch> =>
		patches.flatMap((patch) => {
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
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={metaPrimaryData} />
		</GridContainer>
		<GridContainer border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={metaSecondaryData} />
		</GridContainer>
		<GridContainer border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={metaTertiaryData} />
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
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={quickRefPrimaryData} />
		</GridContainer>
		<GridContainer border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={quickRefMovementData} />
		</GridContainer>
		<GridContainer border={true} pad={true} classes="rounded-md">
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={quickRefSecondaryData} />
		</GridContainer>
	</GridContainer>
</GridContainer>

TODO: all the rest of the info...
