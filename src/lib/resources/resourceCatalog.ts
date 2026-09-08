import { z } from 'zod';

const stableCatalogIdSchema = z
	.string()
	.regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'Use a stable lowercase catalog ID');
const absoluteUrlSchema = z.string().url();

export const resourceDeliverySchema = z.enum(['self-hosted', 'link-only']);
export const resourceAccessSchema = z.enum(['included', 'free-external', 'ownership-required']);
export const resourceAvailabilitySchema = z.enum(['available', 'unavailable']);
export const locatorHealthSchema = z.enum(['verified', 'stale']);
export const locatorKindSchema = z.enum(['pdf-page', 'external-url']);

export const rulesResourceSchema = z
	.object({
		id: stableCatalogIdSchema,
		systemId: stableCatalogIdSchema,
		rulesVersion: z.string().min(1),
		title: z.string().min(1),
		publisher: z.string().min(1),
		delivery: resourceDeliverySchema,
		access: resourceAccessSchema,
		accessGuidance: z.string().min(1).optional(),
		authoritativeHref: absoluteUrlSchema,
		localAssetPath: z.string().startsWith('/').optional(),
		attributionReference: z.string().min(1),
		availability: resourceAvailabilitySchema.default('available'),
		pageBasis: z.literal('pdf-and-printed-one-based').optional()
	})
	.strict();

export const resourceTopicSchema = z
	.object({
		id: stableCatalogIdSchema,
		systemId: stableCatalogIdSchema,
		label: z.string().min(1),
		description: z.string().min(1),
		preferredLocatorId: stableCatalogIdSchema
	})
	.strict();

export const resourceLocatorSchema = z
	.object({
		id: stableCatalogIdSchema,
		resourceId: stableCatalogIdSchema,
		topicId: stableCatalogIdSchema,
		label: z.string().min(1),
		description: z.string().min(1),
		kind: locatorKindSchema,
		page: z.number().int().min(1).optional(),
		href: absoluteUrlSchema.optional(),
		health: locatorHealthSchema.default('verified')
	})
	.strict();

const resourceCatalogShapeSchema = z
	.object({
		version: z.literal(1),
		resources: z.array(rulesResourceSchema),
		topics: z.array(resourceTopicSchema),
		locators: z.array(resourceLocatorSchema)
	})
	.strict();

const addDuplicateIdIssues = (
	entries: ReadonlyArray<{ id: string }>,
	path: 'resources' | 'topics' | 'locators',
	context: z.core.$RefinementCtx
) => {
	const firstIndexById = new Map<string, number>();
	entries.forEach((entry, index) => {
		const firstIndex = firstIndexById.get(entry.id);
		if (firstIndex === undefined) {
			firstIndexById.set(entry.id, index);
			return;
		}
		context.addIssue({
			code: 'custom',
			message: `Duplicate ${path.slice(0, -1)} ID ${entry.id}; first declared at index ${firstIndex}`,
			path: [path, index, 'id']
		});
	});
};

export const resourceCatalogSchema = resourceCatalogShapeSchema.superRefine((catalog, context) => {
	addDuplicateIdIssues(catalog.resources, 'resources', context);
	addDuplicateIdIssues(catalog.topics, 'topics', context);
	addDuplicateIdIssues(catalog.locators, 'locators', context);

	const resourcesById = new Map(catalog.resources.map((resource) => [resource.id, resource]));
	const topicsById = new Map(catalog.topics.map((topic) => [topic.id, topic]));
	const locatorsById = new Map(catalog.locators.map((locator) => [locator.id, locator]));

	catalog.resources.forEach((resource, index) => {
		if (resource.delivery === 'self-hosted') {
			if (resource.access !== 'included') {
				context.addIssue({
					code: 'custom',
					message: 'A self-hosted resource must be classified as included',
					path: ['resources', index, 'access']
				});
			}
			if (!resource.localAssetPath) {
				context.addIssue({
					code: 'custom',
					message: 'A self-hosted resource requires a local asset path',
					path: ['resources', index, 'localAssetPath']
				});
			}
		} else {
			if (resource.access === 'included') {
				context.addIssue({
					code: 'custom',
					message: 'A link-only resource cannot be represented as included',
					path: ['resources', index, 'access']
				});
			}
			if (resource.localAssetPath) {
				context.addIssue({
					code: 'custom',
					message: 'A link-only resource cannot declare a local asset path',
					path: ['resources', index, 'localAssetPath']
				});
			}
		}
	});

	catalog.locators.forEach((locator, index) => {
		const resource = resourcesById.get(locator.resourceId);
		const topic = topicsById.get(locator.topicId);
		if (!resource) {
			context.addIssue({
				code: 'custom',
				message: `Unknown resource ID ${locator.resourceId}`,
				path: ['locators', index, 'resourceId']
			});
		}
		if (!topic) {
			context.addIssue({
				code: 'custom',
				message: `Unknown topic ID ${locator.topicId}`,
				path: ['locators', index, 'topicId']
			});
		}
		if (resource && topic && resource.systemId !== topic.systemId) {
			context.addIssue({
				code: 'custom',
				message: 'Locator resource and topic must belong to the same system',
				path: ['locators', index, 'topicId']
			});
		}
		if (locator.kind === 'pdf-page') {
			if (resource?.delivery !== 'self-hosted') {
				context.addIssue({
					code: 'custom',
					message: 'A PDF page locator requires a self-hosted resource',
					path: ['locators', index, 'kind']
				});
			}
			if (locator.page === undefined) {
				context.addIssue({
					code: 'custom',
					message: 'A PDF page locator requires a one-based page',
					path: ['locators', index, 'page']
				});
			}
			if (locator.href !== undefined) {
				context.addIssue({
					code: 'custom',
					message: 'A self-hosted PDF locator derives its URL from the registered resource',
					path: ['locators', index, 'href']
				});
			}
		} else if (resource?.delivery !== 'link-only') {
			context.addIssue({
				code: 'custom',
				message: 'An external URL locator requires a link-only resource',
				path: ['locators', index, 'kind']
			});
		}
	});

	catalog.topics.forEach((topic, index) => {
		const preferredLocator = locatorsById.get(topic.preferredLocatorId);
		if (!preferredLocator) {
			context.addIssue({
				code: 'custom',
				message: `Unknown preferred locator ID ${topic.preferredLocatorId}`,
				path: ['topics', index, 'preferredLocatorId']
			});
		} else if (preferredLocator.topicId !== topic.id) {
			context.addIssue({
				code: 'custom',
				message: 'Preferred locator must belong to the topic that names it',
				path: ['topics', index, 'preferredLocatorId']
			});
		}
	});
});

export type RulesResource = z.infer<typeof rulesResourceSchema>;
export type ResourceTopic = z.infer<typeof resourceTopicSchema>;
export type ResourceLocator = z.infer<typeof resourceLocatorSchema>;
export type ResourceCatalog = z.infer<typeof resourceCatalogSchema>;

export const createResourceCatalog = (input: unknown): ResourceCatalog =>
	resourceCatalogSchema.parse(input);

export type CatalogSource = {
	resource: RulesResource;
	locator: ResourceLocator;
	topic: ResourceTopic;
	isPreferred: boolean;
};

const compareCodePoints = (left: string, right: string): number =>
	left < right ? -1 : left > right ? 1 : 0;

const compareCatalogSources = (left: CatalogSource, right: CatalogSource): number => {
	if (left.isPreferred !== right.isPreferred) return left.isPreferred ? -1 : 1;
	return (
		compareCodePoints(left.resource.title.toLowerCase(), right.resource.title.toLowerCase()) ||
		compareCodePoints(
			left.resource.rulesVersion.toLowerCase(),
			right.resource.rulesVersion.toLowerCase()
		) ||
		compareCodePoints(left.locator.label.toLowerCase(), right.locator.label.toLowerCase()) ||
		compareCodePoints(left.locator.id, right.locator.id)
	);
};

export const resolveTopicSources = (
	catalog: ResourceCatalog,
	topicId: string
): { preferred: CatalogSource; alternates: Array<CatalogSource> } | undefined => {
	const topic = catalog.topics.find((entry) => entry.id === topicId);
	if (!topic) return undefined;
	const sources = catalog.locators
		.filter((locator) => locator.topicId === topic.id)
		.flatMap((locator): Array<CatalogSource> => {
			const resource = catalog.resources.find((entry) => entry.id === locator.resourceId);
			if (!resource) return [];
			return [{ resource, locator, topic, isPreferred: locator.id === topic.preferredLocatorId }];
		})
		.sort(compareCatalogSources);
	const preferred = sources.find((source) => source.isPreferred);
	if (!preferred) return undefined;
	return { preferred, alternates: sources.filter((source) => !source.isPreferred) };
};

export type ResolveResourceLocatorOptions = {
	runtimeAvailability?: 'available' | 'unavailable';
	resolveAssetHref?: (path: string) => string;
};

type ResourceDispositionBase = CatalogSource & {
	generalHref: string;
};

export type ResourceDisposition =
	| (ResourceDispositionBase & {
			kind: 'internal';
			exactHref: string;
			browserHref: string;
	  })
	| (ResourceDispositionBase & {
			kind: 'external';
			externalHref: string;
	  })
	| (ResourceDispositionBase & {
			kind: 'stale';
			safeOpenKind: 'internal';
			browserHref: string;
	  })
	| (ResourceDispositionBase & {
			kind: 'stale';
			safeOpenKind: 'external';
			externalHref: string;
	  })
	| (ResourceDispositionBase & {
			kind: 'unavailable';
			retryable: boolean;
	  });

export const resolveResourceLocator = (
	catalog: ResourceCatalog,
	locatorId: string,
	options: ResolveResourceLocatorOptions = {}
): ResourceDisposition | undefined => {
	const locator = catalog.locators.find((entry) => entry.id === locatorId);
	if (!locator) return undefined;
	const resource = catalog.resources.find((entry) => entry.id === locator.resourceId);
	const topic = catalog.topics.find((entry) => entry.id === locator.topicId);
	if (!resource || !topic) return undefined;
	const source: CatalogSource = {
		resource,
		locator,
		topic,
		isPreferred: topic.preferredLocatorId === locator.id
	};
	const resolveAssetHref = options.resolveAssetHref ?? ((path: string) => path);
	const generalHref =
		resource.delivery === 'self-hosted' && resource.localAssetPath
			? resolveAssetHref(resource.localAssetPath)
			: resource.authoritativeHref;

	if (resource.availability === 'unavailable' || options.runtimeAvailability === 'unavailable') {
		return {
			...source,
			kind: 'unavailable',
			generalHref,
			retryable: options.runtimeAvailability === 'unavailable'
		};
	}
	if (locator.health === 'stale') {
		return resource.delivery === 'self-hosted'
			? {
					...source,
					kind: 'stale',
					safeOpenKind: 'internal',
					generalHref,
					browserHref: generalHref
				}
			: {
					...source,
					kind: 'stale',
					safeOpenKind: 'external',
					generalHref,
					externalHref: generalHref
				};
	}
	if (resource.delivery === 'link-only') {
		const externalHref = locator.href ?? resource.authoritativeHref;
		return { ...source, kind: 'external', generalHref, externalHref };
	}
	if (locator.kind !== 'pdf-page' || locator.page === undefined) return undefined;
	const exactHref = `${generalHref}#page=${locator.page}`;
	return { ...source, kind: 'internal', generalHref, exactHref, browserHref: exactHref };
};

const normalizeSearchText = (value: string): string =>
	value
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();

export const searchResourceCatalog = (
	catalog: ResourceCatalog,
	query: string,
	options: { systemId?: string } = {}
): Array<CatalogSource> => {
	const tokens = normalizeSearchText(query).split(' ').filter(Boolean);
	return catalog.locators
		.flatMap((locator): Array<CatalogSource & { searchText: string }> => {
			const resource = catalog.resources.find((entry) => entry.id === locator.resourceId);
			const topic = catalog.topics.find((entry) => entry.id === locator.topicId);
			if (!resource || !topic || (options.systemId && topic.systemId !== options.systemId))
				return [];
			return [
				{
					resource,
					locator,
					topic,
					isPreferred: topic.preferredLocatorId === locator.id,
					searchText: normalizeSearchText(
						[
							resource.title,
							resource.rulesVersion,
							resource.publisher,
							topic.label,
							topic.description,
							locator.label,
							locator.description
						].join(' ')
					)
				}
			];
		})
		.filter((source) => tokens.every((token) => source.searchText.includes(token)))
		.sort((left, right) => {
			return (
				compareCodePoints(
					normalizeSearchText(left.topic.label),
					normalizeSearchText(right.topic.label)
				) || compareCatalogSources(left, right)
			);
		})
		.map(({ searchText: _searchText, ...source }) => source);
};
