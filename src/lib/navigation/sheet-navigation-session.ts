import { onMount } from 'svelte';
import {
	createSheetLandmarkCoordinator,
	setSheetLandmarkCoordinator
} from './sheet-landmark-navigation';
import { resolveSheetLandmarkPath, type SheetLandmark } from './sheet-landmarks';
import type { SheetNavigationHost } from './sheet-navigation-host';

// Called during component initialization; history ownership stays with the host.
export const setupSheetNavigation = (
	landmarks: ReadonlyArray<SheetLandmark>,
	host: () => SheetNavigationHost
) => {
	let currentFragment = '';
	const coordinator = createSheetLandmarkCoordinator({
		landmarks,
		getCurrentFragment: () => host().readFragment(),
		pushFragment(fragment) {
			currentFragment = fragment;
			host().pushFragment(fragment);
		}
	});
	setSheetLandmarkCoordinator(coordinator);
	const restore = (initial = false) => {
		const fragment = host().readFragment();
		if (!initial && fragment === currentFragment) return;
		currentFragment = fragment;
		if (resolveSheetLandmarkPath(fragment, landmarks))
			void coordinator.navigate(fragment, { recordHistory: false });
	};
	onMount(() => {
		restore(true);
		return host().subscribe(() => restore());
	});
	return coordinator;
};
