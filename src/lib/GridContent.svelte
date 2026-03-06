<script lang="ts">
	import type { Snippet } from 'svelte';

	interface EditPayload {
		name: string;
		classLevels: string;
	}

	interface Props {
		children?: Snippet;
		// eslint-disable-next-line no-unused-vars
		handleEditSave: (_payload: EditPayload) => void;
		handleEditCancel?: () => void;
		initialName?: string;
		initialClassLevels?: string;
	}

	let {
		children,
		handleEditSave,
		handleEditCancel = undefined,
		initialName = '',
		initialClassLevels = ''
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let nameDraft = $state('');
	let classLevelsDraft = $state('');

	const closeDialog = () => {
		dialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onOpen = () => {
		nameDraft = initialName;
		classLevelsDraft = initialClassLevels;
		dialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleEditSave({
			name: nameDraft,
			classLevels: classLevelsDraft
		});
		closeDialog();
	};
</script>

<div class="group relative">
	<button
		type="button"
		class="theme-btn-light btn absolute top-2 right-2 z-10 rounded-md border p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
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
	{@render children?.()}
</div>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onCancel}
	onclick={onBackdropClick}
>
	<form class="flex flex-col gap-3 p-4" onsubmit={onSubmit}>
		<h3 class="text-lg leading-none font-semibold">Edit Meta Fields</h3>
		<label class="space-y-1">
			<span class="font-semibold">Name</span>
			<input
				class="theme-input w-full rounded-md border px-2 py-1"
				type="text"
				bind:value={nameDraft}
			/>
		</label>
		<label class="space-y-1">
			<span class="font-semibold">Class Levels</span>
			<input
				class="theme-input w-full rounded-md border px-2 py-1"
				type="text"
				bind:value={classLevelsDraft}
				placeholder="Fighter 1 / Wizard 1"
			/>
		</label>
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
