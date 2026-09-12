import { describe, expect, it, vi } from 'vitest';
import {
	dnd5e2014SheetLandmarks,
	getDnd5e2014SheetLandmarkChildren,
	getDnd5e2014SheetLandmarkRegions,
	resolveDnd5e2014SheetLandmarkPath,
	validateDnd5e2014SheetLandmarks,
	type Dnd5e2014SheetLandmark
} from '../sheetLandmarks';
import {
	createDnd5e2014SheetLandmarkCoordinator,
	type Dnd5e2014SheetLandmarkHeading
} from '../sheetLandmarkNavigation';

describe('2014 sheet landmarks', () => {
	it('defines the reviewed regions and child destinations in visible order', () => {
		expect(validateDnd5e2014SheetLandmarks()).toEqual([]);
		expect(getDnd5e2014SheetLandmarkRegions().map((landmark) => landmark.label)).toEqual([
			'Overview',
			'Runtime',
			'Organizational'
		]);
		expect(
			getDnd5e2014SheetLandmarkChildren('sheet-runtime-heading').map((landmark) => landmark.label)
		).toEqual([
			'Quick Reference',
			'Actions / Runtime Summary',
			'Abilities & Proficiencies',
			'Features & Traits',
			'Spells'
		]);
		expect(dnd5e2014SheetLandmarks.filter(({ kind }) => kind === 'section')).toHaveLength(8);
		expect(
			dnd5e2014SheetLandmarks.filter(({ kind }) => kind === 'section').every(({ icon }) => icon)
		).toBe(true);
	});

	it('resolves hidden destinations from descriptors without mounted elements', () => {
		expect(
			resolveDnd5e2014SheetLandmarkPath('sheet-features-traits-heading')?.map(
				(landmark) => landmark.fragmentId
			)
		).toEqual(['sheet-runtime-heading', 'sheet-features-traits-heading']);
	});

	it('reports duplicate fragments, sibling order, and invalid parents', () => {
		const invalid: Array<Dnd5e2014SheetLandmark> = [
			...dnd5e2014SheetLandmarks,
			{
				fragmentId: 'sheet-meta-heading',
				label: 'Duplicate meta',
				kind: 'section',
				order: 0,
				parentId: 'sheet-overview-heading'
			},
			{
				fragmentId: 'sheet-invalid-parent-heading',
				label: 'Invalid parent',
				kind: 'section',
				order: 0,
				parentId: 'missing-region'
			}
		];
		const codes = validateDnd5e2014SheetLandmarks(invalid).map(({ code }) => code);

		expect(codes).toContain('duplicate-fragment');
		expect(codes).toContain('duplicate-order');
		expect(codes).toContain('invalid-parent');
	});
});

describe('2014 sheet landmark coordinator', () => {
	it('expands ancestors before a newly mounted child, then scrolls and focuses it', async () => {
		const events: Array<string> = [];
		const scroll = vi.fn(() => events.push('scroll child'));
		const focus = vi.fn(() => events.push('focus child'));
		const childHeading = {} as Dnd5e2014SheetLandmarkHeading;
		let settleCount = 0;
		const coordinator = createDnd5e2014SheetLandmarkCoordinator({
			settle: async () => {
				settleCount += 1;
				if (settleCount === 1) {
					coordinator.register('sheet-features-traits-heading', {
						expand: () => events.push('expand child'),
						getHeading: () => childHeading
					});
				}
			},
			scroll,
			focus
		});
		coordinator.register('sheet-runtime-heading', {
			expand: () => events.push('expand parent'),
			getHeading: () => undefined
		});

		await expect(coordinator.navigate('sheet-features-traits-heading')).resolves.toBe(true);
		expect(events).toEqual(['expand parent', 'expand child', 'scroll child', 'focus child']);
		expect(scroll).toHaveBeenCalledWith(childHeading);
		expect(focus).toHaveBeenCalledWith(childHeading);
	});

	it('fails safely when a descriptor or mounted destination cannot resolve', async () => {
		const coordinator = createDnd5e2014SheetLandmarkCoordinator({ settle: async () => {} });

		await expect(coordinator.navigate('unknown-heading')).resolves.toBe(false);
		await expect(coordinator.navigate('sheet-meta-heading')).resolves.toBe(false);
	});

	it('unregisters only the controller that owns the current registration', async () => {
		const heading = {
			scrollIntoView: vi.fn(),
			focus: vi.fn()
		};
		const coordinator = createDnd5e2014SheetLandmarkCoordinator({ settle: async () => {} });
		const first = { expand: vi.fn(), getHeading: () => heading };
		const second = { expand: vi.fn(), getHeading: () => heading };
		const unregisterFirst = coordinator.register('sheet-overview-heading', first);
		coordinator.register('sheet-overview-heading', second);

		unregisterFirst();
		await expect(coordinator.navigate('sheet-overview-heading')).resolves.toBe(true);
		expect(first.expand).not.toHaveBeenCalled();
		expect(second.expand).toHaveBeenCalledOnce();
	});

	it('records only changed explicit fragments and never records history traversal', async () => {
		let currentFragment = '';
		const pushFragment = vi.fn((fragmentId: string) => {
			currentFragment = fragmentId;
		});
		const heading = {
			scrollIntoView: vi.fn(),
			focus: vi.fn()
		};
		const coordinator = createDnd5e2014SheetLandmarkCoordinator({
			settle: async () => {},
			getCurrentFragment: () => currentFragment,
			pushFragment
		});
		coordinator.register('sheet-overview-heading', {
			expand: vi.fn(),
			getHeading: () => heading
		});

		await coordinator.navigate('sheet-overview-heading');
		await coordinator.navigate('sheet-overview-heading');
		await coordinator.navigate('sheet-overview-heading', { recordHistory: false });

		expect(pushFragment).toHaveBeenCalledOnce();
		expect(pushFragment).toHaveBeenCalledWith('sheet-overview-heading');
		expect(heading.scrollIntoView).toHaveBeenCalledTimes(3);
		expect(heading.focus).toHaveBeenCalledTimes(3);
	});
});
