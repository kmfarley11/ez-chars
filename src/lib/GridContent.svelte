<script lang="ts">
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	type GridFieldType = 'string' | 'number' | 'array' | 'object' | 'unknown';

	type GridContentField = {
		fieldName: string;
		fieldType: GridFieldType;
		value: unknown;
	};

	type GridContentData = Record<string, GridContentField>;

	interface Props {
		data: GridContentData;
		// eslint-disable-next-line no-unused-vars
		handleEditSave: (_payload: GridContentData) => void;
		handleEditCancel?: () => void;
	}

	let { data, handleEditSave, handleEditCancel = undefined }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let draftData = $state<GridContentData>({});

	const closeDialog = () => {
		dialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onOpen = () => {
		draftData = Object.fromEntries(
			Object.entries(data).map(([fieldKey, field]) => [
				fieldKey,
				{
					...field,
					value: displayOrPlaceholder(field.value, '')
				}
			])
		);
		dialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleEditSave(draftData);
		closeDialog();
	};
</script>

<div class="group relative">
	<button
		type="button"
		class="theme-btn-light btn absolute top-0 right-0 z-10 rounded-md border p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
		aria-label="Edit"
		title="Edit"
		onclick={onOpen}
	>
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			class="h-4 w-4 stroke-current"
			aria-hidden="true"
		>
			<path d="M12 20h9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
			<path
				d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
		</svg>
	</button>
	<div class="space-y-2 pr-12">
		{#each Object.entries(data) as [fieldKey, field] (fieldKey)}
			<p>
				<span class="font-semibold">{field.fieldName}:</span>
				{displayOrPlaceholder(field.value)}
			</p>
		{/each}
	</div>
</div>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onCancel}
	onclick={onBackdropClick}
>
	<form class="flex flex-col gap-3 p-4" onsubmit={onSubmit}>
		<h3 class="text-lg leading-none font-semibold">Edit Meta Fields</h3>
		{#each Object.entries(draftData) as [fieldKey, field] (fieldKey)}
			<label class="space-y-1">
				<span class="font-semibold">{field.fieldName}</span>
				<input
					class="theme-input w-full rounded-md border px-2 py-1"
					type="text"
					value={displayOrPlaceholder(field.value, '')}
					oninput={(event) => {
						const target = event.currentTarget as HTMLInputElement;
						draftData = {
							...draftData,
							[fieldKey]: {
								...field,
								value: target.value
							}
						};
					}}
				/>
			</label>
		{/each}
		<div class="mt-1 flex justify-end gap-2">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-1"
				onclick={onCancel}
			>
				Cancel
			</button>
			<button type="submit" class="theme-btn-dark btn rounded-md border px-3 py-1">Save</button>
		</div>
	</form>
</dialog>
