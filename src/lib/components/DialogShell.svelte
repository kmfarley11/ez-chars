<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		actions?: Snippet<[() => void]>;
		children?: Snippet;
		closeText?: string;
		fullHeightMobile?: boolean;

		// Step navigation
		title?: string;
		showBack?: boolean;
		onBack?: () => void;
	}

	let {
		open = $bindable(false),
		onClose,
		actions,
		children,
		closeText = 'Close',
		fullHeightMobile = false,
		title,
		showBack = false,
		onBack
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (open && !dialogEl?.open) {
			dialogEl?.showModal();
		} else if (!open && dialogEl?.open) {
			dialogEl?.close();
		}
	});

	const handleClose = () => {
		if (!open) return; // Prevent double-firing
		open = false;
		onClose?.();
	};

	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			dialogEl?.close(); // Let the native onclose handler sync the state
		}
	};

	let mobileClasses = $derived(
		fullHeightMobile
			? 'max-sm:h-full max-sm:max-h-none max-sm:w-full max-sm:rounded-none max-sm:border-0 m-auto max-h-[80vh] w-[min(92vw,34rem)] rounded-md border p-0'
			: 'm-auto w-[min(92vw,34rem)] max-h-[80vh] rounded-md border p-0'
	);
</script>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop {mobileClasses}"
	aria-label={title}
	onclick={handleBackdropClick}
	onclose={handleClose}
>
	<div class="flex flex-col p-4 h-full min-h-48">
		{#if title || showBack}
			<div class="flex items-center gap-2 pb-3 mb-2 border-b">
				{#if showBack}
					<button
						type="button"
						class="theme-btn-light btn cursor-pointer rounded-md border px-2 py-1 text-sm flex items-center justify-center leading-none"
						onclick={onBack}
						aria-label="Back"
					>
						&larr;
					</button>
				{/if}
				{#if title}
					<h2 class="text-lg font-semibold m-0 flex-1">{title}</h2>
				{/if}
			</div>
		{/if}
		<div class="flex-1 pb-4 overflow-y-auto">
			{@render children?.()}
		</div>
		<div class="flex justify-end gap-2 shrink-0">
			<button
				type="button"
				class="theme-btn-light btn cursor-pointer rounded-md border px-3 py-1"
				onclick={handleClose}
			>
				{closeText}
			</button>
			{@render actions?.(handleClose)}
		</div>
	</div>
</dialog>
