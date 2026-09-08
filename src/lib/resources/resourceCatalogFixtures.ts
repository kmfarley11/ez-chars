import { dnd5e2014ResourceCatalog } from './dnd5e2014ResourceCatalog';
import { createResourceCatalog } from './resourceCatalog';

export const emptyResourceCatalogFixture = createResourceCatalog({
	version: 1,
	resources: [],
	topics: [],
	locators: []
});

export const mixedResourceCatalogFixture = createResourceCatalog({
	...dnd5e2014ResourceCatalog,
	resources: [
		...dnd5e2014ResourceCatalog.resources,
		{
			id: 'fixture.user-owned-source',
			systemId: 'dnd5e-2014',
			rulesVersion: 'Example edition',
			title: 'Example User-Owned Source',
			publisher: 'Example Publisher',
			delivery: 'link-only',
			access: 'ownership-required',
			accessGuidance: 'Source not included; use a copy you lawfully own.',
			authoritativeHref: 'https://example.com/user-owned-source',
			attributionReference: 'Storybook fixture only',
			availability: 'available'
		},
		{
			id: 'fixture.unavailable-source',
			systemId: 'dnd5e-2014',
			rulesVersion: 'Example unavailable edition',
			title: 'Example Unavailable Source',
			publisher: 'Example Publisher',
			delivery: 'link-only',
			access: 'free-external',
			accessGuidance: 'Source not included.',
			authoritativeHref: 'https://example.com/unavailable-source',
			attributionReference: 'Storybook fixture only',
			availability: 'unavailable'
		}
	],
	topics: [
		...dnd5e2014ResourceCatalog.topics,
		{
			id: 'dnd5e-2014.fixture-owned-topic',
			systemId: 'dnd5e-2014',
			label: 'Ownership-required example',
			description: 'Exercise user-owned source language without a document upload.',
			preferredLocatorId: 'fixture.user-owned-locator'
		},
		{
			id: 'dnd5e-2014.fixture-stale-topic',
			systemId: 'dnd5e-2014',
			label: 'Stale locator example',
			description: 'Exercise fail-closed exact-page language.',
			preferredLocatorId: 'fixture.stale-locator'
		},
		{
			id: 'dnd5e-2014.fixture-unavailable-topic',
			systemId: 'dnd5e-2014',
			label: 'Unavailable source example',
			description: 'Exercise unavailable-source guidance.',
			preferredLocatorId: 'fixture.unavailable-locator'
		}
	],
	locators: [
		...dnd5e2014ResourceCatalog.locators,
		{
			id: 'fixture.user-owned-locator',
			resourceId: 'fixture.user-owned-source',
			topicId: 'dnd5e-2014.fixture-owned-topic',
			label: 'Example owned rules',
			description: 'Open source details at the publisher.',
			kind: 'external-url',
			href: 'https://example.com/user-owned-source',
			health: 'verified'
		},
		{
			id: 'fixture.stale-locator',
			resourceId: 'dnd5e-2014.srd-5-1',
			topicId: 'dnd5e-2014.fixture-stale-topic',
			label: 'Example exact page needing review',
			description: 'Keep section context while withholding the exact jump.',
			kind: 'pdf-page',
			page: 8,
			health: 'stale'
		},
		{
			id: 'fixture.unavailable-locator',
			resourceId: 'fixture.unavailable-source',
			topicId: 'dnd5e-2014.fixture-unavailable-topic',
			label: 'Example unavailable destination',
			description: 'Keep citation context while the source cannot open.',
			kind: 'external-url',
			href: 'https://example.com/unavailable-source',
			health: 'verified'
		}
	]
});

export const resourceCatalogProofFixtures = Object.freeze({
	empty: emptyResourceCatalogFixture,
	mixed: mixedResourceCatalogFixture,
	noMatchQuery: 'unregistered-example-query'
});
