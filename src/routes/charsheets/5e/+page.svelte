<script lang="ts">
	import GridContent from '$lib/GridContent.svelte';
	import GridColumn from '$lib/GridColumn.svelte';
	import GridRow from '$lib/GridRow.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';
	import type { CharacterDocument5e2014 } from '../../../schema';
	import { applyGridPatches } from '$lib/characterGridHelpers';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import type { GridContentData, GridContentPatch } from '$lib/gridContentTypes';

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
			bindPath: ['identity', 'name'],
			value: char.identity.name
		},
		classLevels: {
			value: char.systemData.classes.map((entry, index) => ({
				fieldName: `Class ${index + 1}`,
				value: {
					name: {
						fieldName: `Class ${index + 1} Name`,
						bindPath: ['systemData', 'classes', index, 'name'],
						value: entry.name
					},
					level: {
						fieldName: `Class ${index + 1} Level`,
						bindPath: ['systemData', 'classes', index, 'level'],
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
					bindPath: ['systemData', 'combat', 'hitPoints', 'current'],
					value: char.systemData.combat?.hitPoints?.current ?? 0
				},
				max: {
					bindPath: ['systemData', 'combat', 'hitPoints', 'max'],
					value: char.systemData.combat?.hitPoints?.max ?? 0
				}
			}
		},
		armorClass: {
			bindPath: ['systemData', 'combat', 'armorClass'],
			value: char.systemData.combat?.armorClass
		},
		initiative: {
			bindPath: ['systemData', 'combat', 'initiative'],
			value: char.systemData.combat?.initiative ?? 0
		},
		tempHp: {
			bindPath: ['systemData', 'combat', 'hitPoints', 'temp'],
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
					bindPath: ['systemData', 'combat', 'hitDice', 'remaining'],
					value: char.systemData.combat?.hitDice?.remaining ?? ''
				},
				total: {
					bindPath: ['systemData', 'combat', 'hitDice', 'total'],
					value: char.systemData.combat?.hitDice?.total ?? ''
				}
			}
		},
		deathSaves: {
			fieldName: 'Death Saves',
			value: {
				successes: {
					bindPath: ['systemData', 'combat', 'deathSaves', 'successes'],
					value: char.systemData.combat?.deathSaves?.successes ?? 0,
					label: 'ok'
				},
				failures: {
					bindPath: ['systemData', 'combat', 'deathSaves', 'failures'],
					value: char.systemData.combat?.deathSaves?.failures ?? 0,
					label: 'rip'
				}
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

	const handleGridPatchesSave = (patches: Array<GridContentPatch>) => {
		updateCurrent5eCharacter((entry) => applyGridPatches(entry, patches));
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
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={metaPrimaryData} />
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
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={quickRefPrimaryData} />
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
			<GridContent handleEditSavePatches={handleGridPatchesSave} data={quickRefSecondaryData} />
		</GridColumn>
	</GridRow>
</GridColumn>

TODO: all the rest of the info...
