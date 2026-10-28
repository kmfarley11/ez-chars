import { createContext, tick } from 'svelte';
import { resolveSheetLandmarkPath, type SheetLandmark } from '$lib/navigation/sheet-landmarks';

export interface SheetLandmarkHeading {
	scrollIntoView: (options?: ScrollIntoViewOptions) => void;
	focus: (options?: FocusOptions) => void;
}

export interface SheetLandmarkController {
	expand: () => void;
	getHeading: () => SheetLandmarkHeading | undefined;
}

export interface SheetLandmarkCoordinator {
	register: (fragmentId: string, controller: SheetLandmarkController) => () => void;
	navigate: (fragmentId: string, options?: SheetLandmarkNavigationOptions) => Promise<boolean>;
}

export interface SheetLandmarkNavigationOptions {
	recordHistory?: boolean;
}

interface CoordinatorOptions {
	landmarks: ReadonlyArray<SheetLandmark>;
	settle?: () => Promise<void>;
	scroll?: (heading: SheetLandmarkHeading) => void;
	focus?: (heading: SheetLandmarkHeading) => void;
	getCurrentFragment?: () => string;
	pushFragment?: (fragmentId: string) => void;
}

export const createSheetLandmarkCoordinator = ({
	landmarks,
	settle = tick,
	scroll = (heading) => heading.scrollIntoView({ block: 'start' }),
	focus = (heading) => heading.focus({ preventScroll: true }),
	getCurrentFragment = () => '',
	pushFragment = () => {}
}: CoordinatorOptions): SheetLandmarkCoordinator => {
	const controllers = new Map<string, SheetLandmarkController>();

	return {
		register(fragmentId, controller) {
			controllers.set(fragmentId, controller);
			return () => {
				if (controllers.get(fragmentId) === controller) controllers.delete(fragmentId);
			};
		},
		async navigate(fragmentId, { recordHistory = true } = {}) {
			const path = resolveSheetLandmarkPath(fragmentId, landmarks);
			if (!path) return false;

			for (const landmark of path) {
				let controller = controllers.get(landmark.fragmentId);
				if (!controller) {
					await settle();
					controller = controllers.get(landmark.fragmentId);
				}
				if (!controller) return false;
				controller.expand();
				await settle();
			}

			const heading = controllers.get(fragmentId)?.getHeading();
			if (!heading) return false;
			if (recordHistory && getCurrentFragment() !== fragmentId) pushFragment(fragmentId);
			scroll(heading);
			focus(heading);
			return true;
		}
	};
};

export const [getSheetLandmarkCoordinator, setSheetLandmarkCoordinator] =
	createContext<SheetLandmarkCoordinator>();
