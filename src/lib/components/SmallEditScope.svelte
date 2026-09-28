<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		setSmallEditAccess,
		type SmallEditEntryStyle,
		type SmallEditRequest,
		type SmallGridRequest
	} from './smallEditContext';
	import SmallEditDialog from './SmallEditDialog.svelte';
	import type { SmallEditModel } from '$utils/smallEdit';
	import type { GridContentData } from '$utils/gridContentTypes';
	interface Props {
		enabled?: boolean;
		entryStyle?: SmallEditEntryStyle;
		// eslint-disable-next-line no-unused-vars
		canTarget?: (data: GridContentData) => boolean;
		// eslint-disable-next-line no-unused-vars
		buildGrid: (request: SmallGridRequest) => SmallEditModel | undefined;
		// eslint-disable-next-line no-unused-vars
		buildRecord: (key: string) => SmallEditModel | undefined;
		children: Snippet;
	}
	let {
		enabled = false,
		entryStyle = 'label',
		canTarget = () => false,
		buildGrid,
		buildRecord,
		children
	}: Props = $props();
	let request = $state.raw<SmallEditRequest>();
	const targeted = (data: GridContentData) => enabled && entryStyle !== 'group' && canTarget(data);
	setSmallEditAccess({
		get enabled() {
			return enabled;
		},
		get entryStyle() {
			return entryStyle;
		},
		targeted,
		openGrid: (input) => {
			if (!enabled) return false;
			const model = buildGrid(input);
			if (!model) return false;
			request = {
				model,
				selectedKey:
					model.fields.find(
						(field) => field.entryKey === input.selectedKey && input.selectedKey !== undefined
					)?.key ?? input.selectedKey,
				showNotes: input.showNotes,
				onClosed: input.onClosed
			};
			return true;
		},
		openRecord: (key, onClosed, onRemove, removeLabel) => {
			if (!enabled) return false;
			const model = buildRecord(key);
			if (!model) return false;
			request = { model, onClosed, onRemove, removeLabel };
			return true;
		}
	});
</script>

{@render children()}
{#if request}
	<SmallEditDialog
		{request}
		onClosed={() => {
			const callback = request?.onClosed;
			request = undefined;
			callback?.();
		}}
	/>
{/if}
