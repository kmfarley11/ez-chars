import { describe, expect, it } from 'vitest';
import {
	clampResizablePaneSize,
	resizePaneForHorizontalMovement,
	snapResizablePaneSize
} from '../horizontalResize';

describe('horizontal pane resizing', () => {
	it('clamps pane sizes within normalized bounds', () => {
		expect(clampResizablePaneSize(100, 200, 400)).toBe(200);
		expect(clampResizablePaneSize(500, 200, 400)).toBe(400);
		expect(clampResizablePaneSize(300, 400, 200)).toBe(300);
	});

	it('maps physical movement to either pane-growth direction', () => {
		expect(resizePaneForHorizontalMovement(300, 24, 200, 400, 'right')).toBe(324);
		expect(resizePaneForHorizontalMovement(300, -24, 200, 400, 'right')).toBe(276);
		expect(resizePaneForHorizontalMovement(300, 24, 200, 400, 'left')).toBe(276);
		expect(resizePaneForHorizontalMovement(300, -24, 200, 400, 'left')).toBe(324);
	});

	it('snaps between a minimized rail and the minimum usable expanded size', () => {
		const snap = { collapsedSize: 52, minimumExpandedSize: 192 };
		expect(snapResizablePaneSize(168, 192, 52, 384, snap)).toBe(52);
		expect(snapResizablePaneSize(76, 52, 52, 384, snap)).toBe(192);
		expect(snapResizablePaneSize(240, 224, 52, 384, snap)).toBe(240);
		expect(snapResizablePaneSize(40, 52, 52, 384, snap)).toBe(52);
	});
});
