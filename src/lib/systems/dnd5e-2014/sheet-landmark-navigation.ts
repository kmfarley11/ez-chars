import { createSheetLandmarkCoordinator } from '$lib/navigation/sheet-landmark-navigation';
import { dnd5e2014SheetLandmarks } from './sheet-landmarks';
export {
	getSheetLandmarkCoordinator as getDnd5e2014SheetLandmarkCoordinator,
	setSheetLandmarkCoordinator as setDnd5e2014SheetLandmarkCoordinator
} from '$lib/navigation/sheet-landmark-navigation';
export type {
	SheetLandmarkHeading as Dnd5e2014SheetLandmarkHeading,
	SheetLandmarkController as Dnd5e2014SheetLandmarkController,
	SheetLandmarkCoordinator as Dnd5e2014SheetLandmarkCoordinator,
	SheetLandmarkNavigationOptions as Dnd5e2014SheetLandmarkNavigationOptions
} from '$lib/navigation/sheet-landmark-navigation';
export const createDnd5e2014SheetLandmarkCoordinator = (
	options: Partial<Parameters<typeof createSheetLandmarkCoordinator>[0]> = {}
) =>
	createSheetLandmarkCoordinator({
		...options,
		landmarks: options.landmarks ?? dnd5e2014SheetLandmarks
	});
