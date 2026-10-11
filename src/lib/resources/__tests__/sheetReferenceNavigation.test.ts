import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installBrowserTestWindow } from '../../../test-utils/browser';

const { routePage, pushState, replaceState } = vi.hoisted(() => ({
	routePage: {
		url: new URL('http://localhost/ez-chars/charsheets/5e?id=test'),
		state: {} as App.PageState
	},
	pushState: vi.fn(),
	replaceState: vi.fn()
}));
vi.mock('$app/navigation', () => ({ pushState, replaceState }));
vi.mock('$app/state', () => ({ page: routePage }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => `/ez-chars${path}` }));

import {
	closeSheetReference,
	navigateSheetLandmark,
	openSheetReference
} from '../sheetReferenceNavigation';

beforeEach(() => {
	vi.clearAllMocks();
	installBrowserTestWindow();
	window.location.hash = '';
	routePage.url = new URL('http://localhost/ez-chars/charsheets/5e?id=test');
	routePage.state = {};
	const navigate = (url: string, state: App.PageState) => {
		routePage.url = new URL(url, routePage.url);
		routePage.state = state;
		window.location.hash = routePage.url.hash;
	};
	pushState.mockImplementation(navigate);
	replaceState.mockImplementation(navigate);
});

describe('sheet reference history ownership', () => {
	it('closes in place after a sheet jump without leaving open-reader state behind', () => {
		navigateSheetLandmark('sheet-quick-reference-heading');
		openSheetReference('classes', 'rules');
		navigateSheetLandmark('sheet-inventory-heading');
		const currentUrl = routePage.url.href;
		closeSheetReference();
		expect(replaceState).toHaveBeenLastCalledWith(
			'/ez-chars/charsheets/5e?id=test#sheet-inventory-heading',
			{ referenceDirectDismissed: true }
		);
		expect(routePage.url.href).toBe(currentUrl);
		expect(pushState).toHaveBeenCalledTimes(2);
		navigateSheetLandmark('sheet-spells-heading');
		expect(pushState).toHaveBeenCalledTimes(3);
	});

	it('dismisses a direct locator in place and allows a fresh reader invocation', () => {
		routePage.url.searchParams.set('reference', 'classes');
		routePage.url.hash = '#sheet-inventory-heading';
		window.location.hash = routePage.url.hash;
		const currentUrl = routePage.url.href;
		closeSheetReference();
		expect(routePage.url.href).toBe(currentUrl);
		expect(routePage.state).toEqual({ referenceDirectDismissed: true });
		expect(pushState).not.toHaveBeenCalled();
		openSheetReference('equipment', 'rules');
		expect(pushState).toHaveBeenCalledTimes(1);
		expect(routePage.state.referenceDirectDismissed).toBe(false);
	});

	it('pushes the first reader entry, then replaces sources without changing the invoker', () => {
		openSheetReference('classes', 'original-trigger');
		openSheetReference('equipment', 'later-trigger');
		expect(pushState).toHaveBeenCalledTimes(1);
		expect(replaceState).toHaveBeenCalledTimes(1);
		expect(routePage.state).toMatchObject({
			referenceLocatorId: 'equipment',
			referenceOrigin: 'sheet',
			referenceReturnFocusId: 'original-trigger'
		});
	});

	it('keeps ordinary sheet history but coalesces jumps while the reader is open', () => {
		navigateSheetLandmark('sheet-quick-reference-heading');
		openSheetReference('classes', 'rules');
		navigateSheetLandmark('sheet-features-traits-heading');
		navigateSheetLandmark('sheet-spells-heading');
		expect(pushState).toHaveBeenCalledTimes(2);
		expect(replaceState).toHaveBeenLastCalledWith(
			'/ez-chars/charsheets/5e?id=test#sheet-spells-heading',
			expect.objectContaining({ referenceLocatorId: 'classes', referenceReturnFocusId: 'rules' })
		);
		routePage.state = {};
		navigateSheetLandmark('sheet-inventory-heading');
		expect(pushState).toHaveBeenCalledTimes(3);
	});

	it('does not invent a Back entry when switching a directly linked reader', () => {
		routePage.url.searchParams.set('reference', 'classes');
		navigateSheetLandmark('sheet-spells-heading');
		openSheetReference('equipment', 'equipment-trigger');
		expect(pushState).not.toHaveBeenCalled();
		expect(replaceState).toHaveBeenCalledTimes(2);
		expect(routePage.state.referenceOrigin).toBeUndefined();
		expect(routePage.state.referenceReturnFocusId).toBeUndefined();
	});

	it('treats a dismissed direct locator as closed for sheet jumps and new reader entry', () => {
		routePage.url.searchParams.set('reference', 'classes');
		routePage.state = { referenceDirectDismissed: true };
		navigateSheetLandmark('sheet-spells-heading');
		openSheetReference('equipment', 'rules');
		expect(pushState).toHaveBeenCalledTimes(2);
		expect(replaceState).not.toHaveBeenCalled();
		expect(routePage.state.referenceOrigin).toBe('sheet');
		expect(routePage.state.referenceDirectDismissed).toBe(false);
	});
});
