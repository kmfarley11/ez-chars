import {
	resolveResourceLocator,
	resolveTopicSources,
	searchResourceCatalog,
	type ResourceCatalog,
	type ResourceDisposition,
	type ResourceTopic
} from './resourceCatalog';

export type ResourceLibraryResult = {
	topic: ResourceTopic;
	preferred: ResourceDisposition;
	alternates: Array<ResourceDisposition>;
};

export type ResourceLibraryProjection = {
	catalogEmpty: boolean;
	hasQuery: boolean;
	query: string;
	results: Array<ResourceLibraryResult>;
	totalTopics: number;
};

export const projectResourceLibrary = (
	catalog: ResourceCatalog,
	query: string,
	options: { systemId?: string; resolveAssetHref?: (path: string) => string } = {}
): ResourceLibraryProjection => {
	const normalizedQuery = query.trim();
	const topics = catalog.topics.filter(
		(topic) => !options.systemId || topic.systemId === options.systemId
	);
	const matchingTopicIds = normalizedQuery
		? new Set(
				searchResourceCatalog(catalog, normalizedQuery, { systemId: options.systemId }).map(
					(source) => source.topic.id
				)
			)
		: new Set(topics.map((topic) => topic.id));
	const results = topics.flatMap((topic): Array<ResourceLibraryResult> => {
		if (!matchingTopicIds.has(topic.id)) return [];
		const sources = resolveTopicSources(catalog, topic.id);
		if (!sources) return [];
		const preferred = resolveResourceLocator(catalog, sources.preferred.locator.id, options);
		if (!preferred) return [];
		const alternates = sources.alternates.flatMap((source) => {
			const disposition = resolveResourceLocator(catalog, source.locator.id, options);
			return disposition ? [disposition] : [];
		});
		return [{ topic, preferred, alternates }];
	});

	return {
		catalogEmpty: topics.length === 0,
		hasQuery: normalizedQuery.length > 0,
		query: normalizedQuery,
		results,
		totalTopics: topics.length
	};
};
