import { createContext, tick } from 'svelte';
import {
	dnd5e2014SheetLandmarks,
	resolveDnd5e2014SheetLandmarkPath,
	type Dnd5e2014SheetLandmark
} from './sheetLandmarks';

export interface Dnd5e2014SheetLandmarkHeading {
	scrollIntoView: (options?: ScrollIntoViewOptions) => void;
	focus: (options?: FocusOptions) => void;
}

export interface Dnd5e2014SheetLandmarkController {
	expand: () => void;
	getHeading: () => Dnd5e2014SheetLandmarkHeading | undefined;
}

export interface Dnd5e2014SheetLandmarkCoordinator {
	register: (fragmentId: string, controller: Dnd5e2014SheetLandmarkController) => () => void;
	navigate: (
		fragmentId: string,
		options?: Dnd5e2014SheetLandmarkNavigationOptions
	) => Promise<boolean>;
}

export interface Dnd5e2014SheetLandmarkNavigationOptions {
	recordHistory?: boolean;
}

interface CoordinatorOptions {
	landmarks?: ReadonlyArray<Dnd5e2014SheetLandmark>;
	settle?: () => Promise<void>;
	scroll?: (heading: Dnd5e2014SheetLandmarkHeading) => void;
	focus?: (heading: Dnd5e2014SheetLandmarkHeading) => void;
	getCurrentFragment?: () => string;
	pushFragment?: (fragmentId: string) => void;
}

export const createDnd5e2014SheetLandmarkCoordinator = ({
	landmarks = dnd5e2014SheetLandmarks,
	settle = tick,
	scroll = (heading) => heading.scrollIntoView({ block: 'start' }),
	focus = (heading) => heading.focus({ preventScroll: true }),
	getCurrentFragment = () => '',
	pushFragment = () => {}
}: CoordinatorOptions = {}): Dnd5e2014SheetLandmarkCoordinator => {
	const controllers = new Map<string, Dnd5e2014SheetLandmarkController>();

	return {
		register(fragmentId, controller) {
			controllers.set(fragmentId, controller);
			return () => {
				if (controllers.get(fragmentId) === controller) controllers.delete(fragmentId);
			};
		},
		async navigate(fragmentId, { recordHistory = true } = {}) {
			const path = resolveDnd5e2014SheetLandmarkPath(fragmentId, landmarks);
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

export const [getDnd5e2014SheetLandmarkCoordinator, setDnd5e2014SheetLandmarkCoordinator] =
	createContext<Dnd5e2014SheetLandmarkCoordinator>();
