import { dnd5e2014ResourceCatalog } from './dnd5e2014ResourceCatalog';
import { dnd5e2024ResourceCatalog } from './dnd5e2024-resource-catalog';
import { createResourceCatalog } from './resourceCatalog';

// Explicit annotations may name any known source, independently of their sheet's
// edition. Automatic Rules/contextual lookup must still use its edition's catalog.
const catalogs = [dnd5e2014ResourceCatalog, dnd5e2024ResourceCatalog];
export const authoredReferenceCatalog = createResourceCatalog({
	version: 1,
	resources: catalogs.flatMap((catalog) => catalog.resources),
	topics: catalogs.flatMap((catalog) => catalog.topics),
	locators: catalogs.flatMap((catalog) => catalog.locators)
});
