<script lang="ts">
	import SmallEditScope from '$lib/ui/organisms/small-edit-scope.svelte';
	import StorySurface from '$lib/storybook/story-surface.svelte';
	import GridContentCard from '$lib/ui/organisms/grid-content-card.svelte';
	import { mergeSmallNoteChange, type SmallEditModel } from '$utils/smallEdit';
	import type { GridContentData } from '$utils/gridContentTypes';
	import type { Annotation } from '../../../schema';
	let name = $state('Travel pack');
	let quantity = $state(3);
	let capacity = $state(8);
	let range = $state(12);
	let ready = $state(true);
	let access = $state('Shared');
	let notes = $state.raw<Array<Annotation>>([]);
	let rejectSaves = $state(false);
	const rejected = () => ({
		ok: false as const,
		message: 'Example rejected this save. Your draft is still available.'
	});
	const model: SmallEditModel = {
		title: 'Supply details',
		fields: [
			{
				key: 'access',
				entryKey: '/access',
				label: 'Access',
				kind: 'select',
				options: ['Shared', 'Reserved', 'Private'],
				read: () => access,
				commit: (_before, after) => {
					if (rejectSaves) return rejected();
					if (typeof after !== 'string' || !['Shared', 'Reserved', 'Private'].includes(after))
						return { ok: false, message: 'Choose an access level.' };
					access = after;
					return { ok: true };
				}
			},
			{
				key: 'name',
				entryKey: '/name',
				label: 'Name',
				kind: 'text',
				read: () => name,
				commit: (_before, after) => {
					if (rejectSaves) return rejected();
					if (typeof after !== 'string' || !after.trim())
						return { ok: false, message: 'Enter a name.' };
					name = after;
					return { ok: true };
				},
				notes: {
					read: () => notes,
					commit: (change) => {
						if (rejectSaves) return rejected();
						const next = mergeSmallNoteChange(notes, change);
						if (!next) return { ok: false, message: 'Note changed; reopen it.' };
						notes = next;
						return { ok: true };
					}
				}
			},
			{
				key: 'quantity',
				entryKey: '/quantity',
				label: 'Quantity',
				kind: 'number',
				read: () => quantity,
				commit: (_before, after) => {
					if (rejectSaves) return rejected();
					if (
						typeof after !== 'number' ||
						!Number.isInteger(after) ||
						after < 0 ||
						after > capacity
					)
						return { ok: false, message: `Enter a whole number from 0 to ${capacity}.` };
					quantity = after;
					return { ok: true };
				}
			},
			{
				key: 'capacity',
				entryKey: '/capacity',
				label: 'Capacity',
				kind: 'number',
				read: () => capacity,
				commit: (_before, after) => {
					if (rejectSaves) return rejected();
					if (typeof after !== 'number' || !Number.isInteger(after) || after < quantity)
						return {
							ok: false,
							message: 'Capacity must be a whole number at least equal to Quantity.'
						};
					capacity = after;
					return { ok: true };
				}
			},
			{
				key: 'range',
				entryKey: '/range',
				label: 'Range',
				kind: 'number',
				read: () => range,
				commit: (_before, after) => {
					if (rejectSaves) return rejected();
					if (typeof after !== 'number' || !Number.isFinite(after) || after < 0)
						return { ok: false, message: 'Enter a non-negative distance.' };
					range = after;
					return { ok: true };
				}
			},
			{
				key: 'ready',
				entryKey: '/ready',
				label: 'Ready',
				kind: 'boolean',
				read: () => ready,
				commit: (_before, after) => {
					if (rejectSaves) return rejected();
					if (typeof after !== 'boolean')
						return { ok: false, message: 'Choose ready or not ready.' };
					ready = after;
					return { ok: true };
				}
			},
			{
				key: 'remaining',
				entryKey: '/remaining',
				label: 'Remaining capacity',
				kind: 'number',
				read: () => capacity - quantity,
				explanation: 'Capacity minus the current quantity; not directly editable.'
			}
		]
	};
	const data: GridContentData = $derived({
		access: {
			fieldName: 'Access',
			value: access,
			bindPath: ['access'],
			displayStatus: { mark: access.slice(0, 1), label: access }
		},
		name: {
			fieldName: 'Name',
			value: name,
			annotations: notes,
			bindPath: ['name'],
			capabilities: { canEditValue: true },
			interaction: { tier: 'read-first' }
		},
		load: {
			fieldName: 'Load',
			value: {
				quantity: {
					fieldName: 'Quantity',
					label: 'Quantity',
					value: quantity,
					bindPath: ['quantity']
				},
				capacity: {
					fieldName: 'Capacity',
					label: 'Capacity',
					value: capacity,
					bindPath: ['capacity']
				}
			}
		},
		range: {
			fieldName: 'Range',
			value: range,
			label: 'km; optional context',
			bindPath: ['range']
		},
		ready: {
			fieldName: 'Ready',
			value: {
				status: { fieldName: 'Ready', label: 'Ready', value: ready, bindPath: ['ready'] },
				quantity: {
					fieldName: 'Quantity',
					label: 'Quantity',
					value: quantity,
					bindPath: ['quantity']
				}
			}
		},
		remaining: {
			fieldName: 'Remaining capacity',
			value: capacity - quantity,
			bindPath: ['remaining'],
			capabilities: { isDerived: true },
			interaction: { tier: 'read-first' }
		}
	});
</script>

<StorySurface>
	<div class="mx-auto max-w-3xl space-y-4 p-4">
		<section
			class="theme-muted-surface space-y-2 rounded-md border p-3 text-sm"
			aria-label="Read-first example guidance"
		>
			<h1 class="font-bold">Read-first Detail (Tier 2 Field)</h1>
			<p>
				Production SmallEditScope, GridContentCard and SmallEditDialog; tiny illustrative supply
				data, not a game schema or a separate editing implementation.
			</p>
			<ul class="list-disc space-y-1 pl-5">
				<li>
					Access demonstrates a neutral compact status with a native select in Detail: S = Shared, R
					= Reserved, P = Private. Open Access, change it, Save or Cancel; no tooltip is required to
					interpret the status.
				</li>
				<li>
					Open Name by its label. Save a new name, then edit Quantity and Cancel. Only the name
					should change.
				</li>
				<li>
					Try Quantity above Capacity; recover from validation. Remaining capacity is derived and
					cannot be edited.
				</li>
				<li>
					Load places Quantity and Capacity on one line, but each label targets an independently
					saved field. Range demonstrates optional italicized context after a value. Ready shows a
					read-only checkbox paired with a number; click either leaf label to edit it independently
					in Detail.
				</li>
				<li>
					Add a note to Name and cancel a different note edit. Start an edit, then switch fields or
					close to inspect dirty-work protection.
				</li>
				<li>
					Enable rejection before opening detail; attempt a value or note save, retain the
					error/draft, then Cancel. Disable rejection and retry. Repeat at phone width with the same
					example.
				</li>
			</ul>
		</section>
		<label class="touch-target flex cursor-pointer items-center gap-2"
			><input type="checkbox" bind:checked={rejectSaves} />Reject example saves</label
		>
		<SmallEditScope
			enabled
			canTarget={() => true}
			buildGrid={() => model}
			buildRecord={() => undefined}
		>
			<GridContentCard {data} displayMaxCols={2} detailTitle="Supply details" />
		</SmallEditScope>
	</div>
</StorySurface>
