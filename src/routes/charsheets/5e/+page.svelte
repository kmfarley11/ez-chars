<script lang="ts">
	import GridContent from '$lib/GridContent.svelte';
	import GridColumn from '$lib/GridColumn.svelte';
	import GridRow from '$lib/GridRow.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';
	import type { CharacterDocument5e2014 } from '../../../schema';
	import { displayOrPlaceholder } from '$lib/displayHelpers';

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

	type GridContentData = Record<
		string,
		{
			fieldName: string;
			fieldType: 'string' | 'number' | 'array' | 'object' | 'unknown';
			value: unknown;
		}
	>;

	const metaPrimaryData = $derived({
		name: char.identity.name,
		classLevels: char.systemData.classes
	});

	const ancestryDisplay = $derived(
		displayOrPlaceholder(char.identity.ancestryLineage ?? char.systemData.race?.name)
	);

	const backgroundDisplay = $derived(
		displayOrPlaceholder(char.systemData.background?.name ?? char.identity.background)
	);

	const alignmentDisplay = $derived(displayOrPlaceholder(char.identity.alignment));
	const appearanceDisplay = $derived(displayOrPlaceholder(char.identity.appearance));

	const quickRefPrimaryData = $derived({
		hp: {
			min: char.systemData.combat?.hitPoints?.current,
			max: char.systemData.combat?.hitPoints?.max
		},
		armorClass: char.systemData.combat?.armorClass,
		initiative: char.systemData.combat?.initiative,
		tempHp: char.systemData.combat?.hitPoints?.temp ?? 0
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
	const hitDiceRemainingDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.hitDice?.remaining, '__')
	);
	const hitDiceTotalDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.hitDice?.total, '__')
	);
	const deathSaveSuccessesDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.deathSaves?.successes ?? 0, '__')
	);
	const deathSaveFailuresDisplay = $derived(
		displayOrPlaceholder(char.systemData.combat?.deathSaves?.failures ?? 0, '__')
	);

	const handleEditMetaSave = (payload: GridContentData) => {
		const nextName = displayOrPlaceholder(payload.name?.value, '').trim();
		const nextClassLevels = displayOrPlaceholder(payload.classLevels?.value, '')
			.split(/[/,\n]/)
			.map((segment) => segment.trim())
			.filter((segment) => segment.length > 0)
			.map((segment) => {
				const match = segment.match(/^(.*?)(?:\s+(\d+))?$/);
				const className = match?.[1]?.trim() ?? segment;
				const parsedLevel = match?.[2] ? Number.parseInt(match[2], 10) : 1;
				return {
					name: className.length > 0 ? className : 'Unknown',
					level: Number.isFinite(parsedLevel) && parsedLevel > 0 ? parsedLevel : 1
				};
			});

		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== data.id) return entry;
				if (entry.system.id !== 'dnd5e-2014') return entry;
				const typedEntry = entry as CharacterDocument5e2014;
				return {
					...typedEntry,
					identity: {
						...typedEntry.identity,
						name: nextName.length > 0 ? nextName : typedEntry.identity.name
					},
					systemData: {
						...typedEntry.systemData,
						classes: nextClassLevels
					}
				};
			})
		);
	};

	const handleQuickRefPrimarySave = (payload: GridContentData) => {
		const hpRange = payload.hp?.value as { min?: unknown; max?: unknown } | undefined;
		const hpCurrent = Number.parseInt(displayOrPlaceholder(hpRange?.min, '0'), 10);
		const hpMax = Number.parseInt(displayOrPlaceholder(hpRange?.max, '0'), 10);
		const hpTemp = Number.parseInt(displayOrPlaceholder(payload.tempHp?.value, '0'), 10);
		const nextAc = Number.parseInt(displayOrPlaceholder(payload.armorClass?.value, '0'), 10);
		const nextInitiative = Number.parseInt(
			displayOrPlaceholder(payload.initiative?.value, '0'),
			10
		);

		charsArray.update((entries) =>
			entries.map((entry) => {
				if (entry.meta.id !== data.id) return entry;
				if (entry.system.id !== 'dnd5e-2014') return entry;
				const typedEntry = entry as CharacterDocument5e2014;
				return {
					...typedEntry,
					systemData: {
						...typedEntry.systemData,
						combat: {
							...typedEntry.systemData.combat,
							armorClass: Number.isFinite(nextAc)
								? nextAc
								: typedEntry.systemData.combat.armorClass,
							initiative: Number.isFinite(nextInitiative)
								? nextInitiative
								: typedEntry.systemData.combat.initiative,
							hitPoints: {
								...typedEntry.systemData.combat.hitPoints,
								current: Number.isFinite(hpCurrent)
									? hpCurrent
									: typedEntry.systemData.combat.hitPoints.current,
								max: Number.isFinite(hpMax) ? hpMax : typedEntry.systemData.combat.hitPoints.max,
								temp: Number.isFinite(hpTemp) ? hpTemp : typedEntry.systemData.combat.hitPoints.temp
							}
						}
					}
				};
			})
		);
	};
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
			<GridContent handleEditSave={handleEditMetaSave} dataObject={metaPrimaryData} />
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
			<GridContent handleEditSave={handleQuickRefPrimarySave} dataObject={quickRefPrimaryData} />
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
			<div class="space-y-2">
				<p>
					<span class="font-semibold">Hit Dice:</span>
					{hitDiceRemainingDisplay}/{hitDiceTotalDisplay}
				</p>
				<p>
					<span class="font-semibold">Death Saves:</span>
					{deathSaveSuccessesDisplay} ok /
					{deathSaveFailuresDisplay} rip
				</p>
			</div>
		</GridColumn>
	</GridRow>
</GridColumn>

TODO: all the rest of the info...
