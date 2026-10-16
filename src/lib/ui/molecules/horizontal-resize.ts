export type HorizontalResizeIncreaseDirection = 'left' | 'right';

export type ResizablePaneSnap = {
	collapsedSize: number;
	minimumExpandedSize: number;
};

export const clampResizablePaneSize = (value: number, min: number, max: number): number => {
	const normalizedMin = Math.min(min, max);
	const normalizedMax = Math.max(min, max);
	return Math.min(Math.max(value, normalizedMin), normalizedMax);
};

export const resizePaneForHorizontalMovement = (
	value: number,
	movement: number,
	min: number,
	max: number,
	increaseDirection: HorizontalResizeIncreaseDirection
): number =>
	clampResizablePaneSize(value + movement * (increaseDirection === 'right' ? 1 : -1), min, max);

export const snapResizablePaneSize = (
	value: number,
	startValue: number,
	min: number,
	max: number,
	snap: ResizablePaneSnap | undefined
): number => {
	const boundedValue = clampResizablePaneSize(value, min, max);
	if (!snap) return boundedValue;

	const collapsedSize = clampResizablePaneSize(snap.collapsedSize, min, max);
	const minimumExpandedSize = clampResizablePaneSize(snap.minimumExpandedSize, collapsedSize, max);
	const startedCollapsed = startValue <= collapsedSize;

	if (startedCollapsed) {
		return boundedValue <= collapsedSize
			? collapsedSize
			: Math.max(boundedValue, minimumExpandedSize);
	}
	return boundedValue < minimumExpandedSize ? collapsedSize : boundedValue;
};
