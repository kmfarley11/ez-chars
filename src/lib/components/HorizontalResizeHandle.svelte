<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import {
		clampResizablePaneSize,
		resizePaneForHorizontalMovement,
		snapResizablePaneSize,
		type HorizontalResizeIncreaseDirection
	} from '$components/horizontalResize';

	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		// eslint-disable-next-line no-unused-vars
		onResize: (_value: number) => void;
		increaseDirection?: HorizontalResizeIncreaseDirection;
		step?: number;
		collapsedValue?: number;
		minimumExpandedValue?: number;
		classes?: string;
	}

	let {
		label,
		value,
		min,
		max,
		onResize,
		increaseDirection = 'right',
		step = 24,
		collapsedValue,
		minimumExpandedValue,
		classes
	}: Props = $props();

	let activePointerId: number | undefined;
	let pointerStartX = 0;
	let pointerStartValue = 0;
	type ResizePointerEvent = PointerEvent & { currentTarget: HTMLDivElement };

	const normalizedMin = $derived(Math.min(min, max));
	const normalizedMax = $derived(Math.max(min, max));
	const normalizedValue = $derived(clampResizablePaneSize(value, normalizedMin, normalizedMax));
	const snap = $derived.by(() => {
		if (collapsedValue === undefined || minimumExpandedValue === undefined) return undefined;
		return {
			collapsedSize: clampResizablePaneSize(collapsedValue, normalizedMin, normalizedMax),
			minimumExpandedSize: clampResizablePaneSize(
				minimumExpandedValue,
				normalizedMin,
				normalizedMax
			)
		};
	});
	const isCollapsed = $derived(snap !== undefined && normalizedValue <= snap.collapsedSize);

	const updateFromMovement = (movement: number, startValue = normalizedValue) => {
		const resizedValue = resizePaneForHorizontalMovement(
			startValue,
			movement,
			normalizedMin,
			normalizedMax,
			increaseDirection
		);
		onResize(snapResizablePaneSize(resizedValue, startValue, normalizedMin, normalizedMax, snap));
	};

	const handlePointerDown = (event: ResizePointerEvent) => {
		if (event.button !== 0) return;
		event.preventDefault();
		activePointerId = event.pointerId;
		pointerStartX = event.clientX;
		pointerStartValue = normalizedValue;
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: ResizePointerEvent) => {
		if (activePointerId !== event.pointerId) return;
		updateFromMovement(event.clientX - pointerStartX, pointerStartValue);
	};

	const finishPointerResize = (event: ResizePointerEvent) => {
		if (activePointerId !== event.pointerId) return;
		activePointerId = undefined;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Home') {
			event.preventDefault();
			onResize(snap?.collapsedSize ?? normalizedMin);
			return;
		}
		if (event.key === 'End') {
			event.preventDefault();
			onResize(normalizedMax);
			return;
		}
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		updateFromMovement(event.key === 'ArrowRight' ? step : -step);
	};
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (a focusable ARIA separator is the standard keyboard-operable resize control) -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions (the separator implements pointer and keyboard resizing) -->
<div
	class={twMerge(
		'touch-target group relative flex min-h-11 shrink-0 cursor-col-resize touch-none select-none items-center justify-center rounded-sm border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
		classes
	)}
	role="separator"
	aria-label={label}
	aria-orientation="vertical"
	aria-valuemin={Math.round(normalizedMin)}
	aria-valuemax={Math.round(normalizedMax)}
	aria-valuenow={Math.round(normalizedValue)}
	aria-valuetext={isCollapsed ? 'Minimized' : `${Math.round(normalizedValue)} pixels`}
	tabindex="0"
	title={`${label}. Drag, or use Left and Right Arrow keys.${snap ? ' Home minimizes; End fully expands.' : ''}`}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={finishPointerResize}
	onpointercancel={finishPointerResize}
	onlostpointercapture={() => {
		activePointerId = undefined;
	}}
	onkeydown={handleKeydown}
>
	<span
		class="h-full w-px bg-[var(--color-surface-border)] transition-[width,background-color] group-hover:w-1 group-hover:bg-[var(--color-brand)] group-focus-visible:w-1 group-focus-visible:bg-[var(--color-brand)]"
		aria-hidden="true"
	></span>
</div>
