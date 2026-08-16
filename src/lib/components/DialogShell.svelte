<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createScrollAffordanceAttachment } from '$components/scrollAffordance';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		actions?: Snippet<[() => void]>;
		children?: Snippet;
		closeText?: string;
		fullHeightMobile?: boolean;
		scrollAffordance?: boolean;

		// Step navigation
		title?: string;
		showBack?: boolean;
		onBack?: () => void;

		// Intercept cancellation (Escape, Backdrop, Cancel button)
		// Return false to prevent the dialog from closing
		onCancel?: () => boolean | void;
	}

	let {
		open = $bindable(false),
		onClose,
		actions,
		children,
		closeText = 'Close',
		fullHeightMobile = false,
		scrollAffordance = false,
		title,
		showBack = false,
		onBack,
		onCancel
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();
	let headingEl: HTMLHeadingElement | undefined = $state();
	let canScrollUp = $state(false);
	let canScrollDown = $state(false);
	const trackScrollAffordance = createScrollAffordanceAttachment((state) => {
		canScrollUp = state.canScrollUp;
		canScrollDown = state.canScrollDown;
	});

	export const focusHeading = () => {
		headingEl?.focus();
	};

	$effect(() => {
		if (open && !dialogEl?.open) {
			dialogEl?.showModal();
		} else if (!open && dialogEl?.open) {
			dialogEl?.close();
		}
	});

	const handleCloseAction = () => {
		if (onCancel && onCancel() === false) return;
		dialogEl?.close();
	};

	const handleNativeClose = () => {
		if (open) open = false; // Sync state if closed natively (e.g. Esc key)
		onClose?.(); // Call onClose after the modal is actually closed!
	};

	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			if (onCancel && onCancel() === false) return;
			dialogEl?.close(); // Let the native onclose handler sync the state
		}
	};

	const handleNativeCancel = (event: Event) => {
		if (onCancel && onCancel() === false) {
			event.preventDefault();
		}
	};

	let mobileClasses = $derived(
		fullHeightMobile
			? 'dialog-shell-full-height-mobile max-sm:w-full max-sm:rounded-none max-sm:border-0 m-auto w-[min(92vw,34rem)] rounded-md border p-0'
			: 'm-auto w-[min(92vw,34rem)] rounded-md border p-0'
	);
</script>

<dialog
	bind:this={dialogEl}
	class="dialog-shell theme-dialog theme-dialog-backdrop {mobileClasses}"
	aria-label={title}
	onclick={handleBackdropClick}
	onclose={handleNativeClose}
	oncancel={handleNativeCancel}
>
	<div
		class="dialog-shell-layout flex min-h-48 flex-col p-4"
		class:dialog-shell-scroll-layout={scrollAffordance}
	>
		{#if title || showBack}
			<div class="flex items-center gap-2 pb-3 mb-2 border-b">
				{#if showBack}
					<button
						type="button"
						class="theme-btn-light touch-target btn cursor-pointer rounded-md border px-2 py-1 text-sm flex items-center justify-center leading-none"
						onclick={onBack}
						aria-label="Back"
					>
						&larr;
					</button>
				{/if}
				{#if title}
					<h2
						bind:this={headingEl}
						tabindex="-1"
						class="text-lg font-semibold m-0 flex-1 focus:outline-none"
					>
						{title}
					</h2>
				{/if}
			</div>
		{/if}
		<div class="dialog-shell-scroll-region relative min-h-0 flex-1">
			<div
				class="dialog-shell-scroll-viewport h-full overflow-y-auto pb-4 {scrollAffordance
					? 'scroll-affordance-viewport'
					: ''}"
				data-scroll-viewport={scrollAffordance ? 'dialog-content' : undefined}
				{@attach trackScrollAffordance}
			>
				{@render children?.()}
			</div>
			{#if scrollAffordance && canScrollUp}
				<div
					class="scroll-affordance-fade scroll-affordance-fade-top absolute inset-x-0 top-0 h-8"
					data-scroll-affordance="more-above"
					aria-hidden="true"
				></div>
			{/if}
			{#if scrollAffordance && canScrollDown}
				<div
					class="scroll-affordance-fade scroll-affordance-fade-bottom absolute inset-x-0 bottom-0 h-8"
					data-scroll-affordance="more-below"
					aria-hidden="true"
				></div>
			{/if}
		</div>
		<div
			class="flex shrink-0 justify-end gap-2"
			class:dialog-shell-separated-footer={scrollAffordance}
		>
			<button
				type="button"
				class="theme-btn-light touch-target btn cursor-pointer rounded-md border px-3 py-1"
				onclick={handleCloseAction}
			>
				{closeText}
			</button>
			{@render actions?.(handleCloseAction)}
		</div>
	</div>
</dialog>

<style>
	.dialog-shell,
	.dialog-shell-layout {
		max-height: 80dvh;
	}

	.dialog-shell-layout {
		display: flex;
		flex-direction: column;
	}

	.dialog-shell {
		overflow: hidden;
	}

	.dialog-shell-scroll-layout {
		height: 80dvh;
	}

	.dialog-shell-scroll-region {
		position: relative;
		min-height: 0;
		flex: 1 1 0%;
	}

	.dialog-shell-scroll-viewport {
		height: 100%;
		overflow-y: auto;
		padding-bottom: 1rem;
	}

	.dialog-shell-separated-footer {
		margin-top: 0.5rem;
		border-top: 1px solid var(--color-surface-border);
		padding-top: 0.75rem;
	}

	@media (max-width: 639px) {
		.dialog-shell-full-height-mobile,
		.dialog-shell-full-height-mobile > .dialog-shell-layout {
			height: 100dvh;
			max-height: 100dvh;
		}
	}
</style>
