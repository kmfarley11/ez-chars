<script lang="ts">
	import { tick } from 'svelte';
	import IconButton from '$components/IconButton.svelte';

	interface Props {
		label: string;
		value: number;
		// eslint-disable-next-line no-unused-vars
		onChange: (value: number) => void;
	}

	let { label, value, onChange }: Props = $props();
	let editing = $state(false);
	let draft = $state('');
	let inputEl: HTMLInputElement | undefined = $state();
	let editButtonEl: HTMLButtonElement | undefined = $state();
	const captureInput = (element: HTMLInputElement) => {
		inputEl = element;
		return () => {
			if (inputEl === element) inputEl = undefined;
		};
	};

	const beginEdit = async () => {
		draft = String(value);
		editing = true;
		await tick();
		inputEl?.focus();
	};

	const finish = async (save: boolean) => {
		if (save) {
			const next = Number(draft);
			if (!Number.isInteger(next) || next < 0) return;
			onChange(next);
		}
		editing = false;
		await tick();
		editButtonEl?.focus();
	};
</script>

<div
	class="theme-panel grid min-h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2"
>
	<div class="min-w-0 self-stretch">
		<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">{label}</p>
		{#if editing}
			<input
				{@attach captureInput}
				bind:value={draft}
				type="number"
				min="0"
				step="1"
				aria-label={`Edit ${label}`}
				class="theme-input touch-target mt-1 h-9 w-full max-w-24 rounded-md border px-2 py-1 text-base font-bold"
				onkeydown={(event) => {
					if (event.key === 'Enter') void finish(true);
					if (event.key === 'Escape') void finish(false);
				}}
			/>
		{:else}
			<p class="mt-1 flex h-9 items-center text-2xl font-bold tabular-nums">{value}</p>
		{/if}
	</div>

	<div
		class="flex min-w-[3.75rem] items-center justify-end gap-1"
		aria-label={`${label} editing controls`}
		aria-live="polite"
	>
		{#if editing}
			<IconButton
				variant="confirm"
				size="sm"
				ariaLabel={`Confirm ${label}`}
				title={`Save ${label}`}
				onclick={() => void finish(true)}
			/>
			<IconButton
				variant="cancel"
				size="sm"
				ariaLabel={`Cancel editing ${label}`}
				title={`Cancel editing ${label}`}
				onclick={() => void finish(false)}
			/>
		{:else}
			<IconButton
				bind:buttonEl={editButtonEl}
				variant="edit"
				size="sm"
				ariaLabel={`Edit ${label}`}
				title={`Edit ${label}`}
				onclick={() => void beginEdit()}
			/>
		{/if}
	</div>
</div>
