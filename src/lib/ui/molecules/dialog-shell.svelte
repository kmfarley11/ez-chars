<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { createScrollAffordanceAttachment } from '$lib/ui/molecules/scroll-affordance';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		onOpened?: () => void;
		actions?: Snippet<[() => void]>;
		children?: Snippet;
		closeText?: string;
		fullHeightMobile?: boolean;
		wide?: boolean;
		scrollAffordance?: boolean;
		scrollTop?: number;
		// Embedded workspaces own their controls and scrolling (e.g. a PDF reader).
		contentFillsSpace?: boolean;
		workspace?: boolean;
		modal?: boolean;
		workspaceWidth?: number;

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
		onOpened,
		actions,
		children,
		closeText = 'Close',
		fullHeightMobile = false,
		wide = false,
		scrollAffordance = false,
		scrollTop = $bindable(0),
		contentFillsSpace = false,
		workspace = false,
		modal = true,
		workspaceWidth,
		title,
		showBack = false,
		onBack,
		onCancel
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();
	let headingEl: HTMLHeadingElement | undefined = $state();
	let scrollViewportEl: HTMLDivElement | undefined = $state();
	let canScrollUp = $state(false);
	let canScrollDown = $state(false);
	const trackScrollAffordance = createScrollAffordanceAttachment((state) => {
		canScrollUp = state.canScrollUp;
		canScrollDown = state.canScrollDown;
	});

	export const focusHeading = () => {
		headingEl?.focus();
	};

	// Step transitions retain one scroll owner; restore after the new content has rendered.
	export const restoreScroll = (top: number) => {
		if (scrollViewportEl) {
			scrollViewportEl.scrollTop = top;
			scrollTop = scrollViewportEl.scrollTop;
		}
	};

	$effect(() => {
		if (dialogEl?.open && dialogEl.matches(':modal') !== modal) {
			const focused = document.activeElement;
			dialogEl.close();
			if (modal) dialogEl.showModal();
			else dialogEl.show();
			if (focused instanceof HTMLElement && dialogEl.contains(focused))
				focused.focus({ preventScroll: true });
		}
		if (open && !dialogEl?.open) {
			if (modal) dialogEl?.showModal();
			else dialogEl?.show();
			void tick().then(() => {
				if (scrollViewportEl) scrollViewportEl.scrollTop = scrollTop;
				requestAnimationFrame(() => onOpened?.());
			});
		} else if (!open && dialogEl?.open) {
			dialogEl?.close();
		}
	});

	const handleCloseAction = () => {
		if (onCancel && onCancel() === false) return;
		dialogEl?.close();
	};

	const handleNativeClose = () => {
		if (dialogEl?.open) return; // A responsive modal/non-modal transition reopened this node.
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
		`${
			fullHeightMobile
				? 'dialog-shell-full-height-mobile max-sm:w-full max-sm:rounded-none max-sm:border-0'
				: ''
		} m-auto ${wide ? 'w-[min(96vw,72rem)]' : 'w-[min(92vw,34rem)]'} rounded-md border p-0`
	);

	const fitPhoneViewport = (element: HTMLDialogElement) => {
		const viewport = window.visualViewport;
		const measure = () => {
			element.style.setProperty(
				'--dialog-viewport-height',
				`${viewport?.height ?? window.innerHeight}px`
			);
			element.style.setProperty('--dialog-viewport-top', `${viewport?.offsetTop ?? 0}px`);
		};
		measure();
		viewport?.addEventListener('resize', measure);
		viewport?.addEventListener('scroll', measure);
		return () => {
			viewport?.removeEventListener('resize', measure);
			viewport?.removeEventListener('scroll', measure);
		};
	};
</script>

<dialog
	bind:this={dialogEl}
	class="dialog-shell theme-dialog theme-dialog-backdrop {mobileClasses}"
	class:dialog-shell-workspace={workspace}
	style:--workspace-width={workspaceWidth ? `${workspaceWidth}px` : undefined}
	{@attach workspace || contentFillsSpace ? fitPhoneViewport : () => {}}
	aria-label={title}
	onclick={handleBackdropClick}
	onclose={handleNativeClose}
	oncancel={handleNativeCancel}
>
	{#if workspace}
		{@render children?.()}
	{:else}
		<div
			class="dialog-shell-layout flex min-h-48 flex-col p-4"
			class:dialog-shell-scroll-layout={scrollAffordance}
			class:dialog-shell-fill-layout={contentFillsSpace}
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
					bind:this={scrollViewportEl}
					class="dialog-shell-scroll-viewport h-full overflow-y-auto pb-4 {scrollAffordance
						? 'scroll-affordance-viewport'
						: ''}"
					data-scroll-viewport={scrollAffordance ? 'dialog-content' : undefined}
					{@attach trackScrollAffordance}
					onscroll={(event) => {
						scrollTop = event.currentTarget.scrollTop;
					}}
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
	{/if}
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

	.dialog-shell-fill-layout {
		height: 80dvh;
	}
	.dialog-shell-fill-layout .dialog-shell-scroll-viewport {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding-bottom: 0;
	}
	.dialog-shell.dialog-shell-workspace {
		position: fixed;
		z-index: 40;
		inset: 0 0 0 auto;
		margin: 0;
		width: var(--workspace-width, 100%);
		max-width: 100%;
		height: 100dvh;
		max-height: 100dvh;
		border: 0;
		border-radius: 0;
	}

	@media (max-width: 639px) {
		.dialog-shell-full-height-mobile,
		.dialog-shell-full-height-mobile > .dialog-shell-layout {
			height: var(--dialog-viewport-height, 100dvh);
			max-height: var(--dialog-viewport-height, 100dvh);
		}
		.dialog-shell-full-height-mobile,
		.dialog-shell.dialog-shell-workspace {
			top: var(--dialog-viewport-top, 0px);
			bottom: auto;
			margin: 0;
			height: var(--dialog-viewport-height, 100dvh);
			max-height: var(--dialog-viewport-height, 100dvh);
		}
	}
</style>
