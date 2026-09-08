import { describe, expect, it } from 'vitest';
import {
	DND5E_2014_EQUIPMENT_LOCATOR_ID,
	DND5E_2014_EQUIPMENT_TOPIC_ID,
	DND5E_2014_GENERAL_LOCATOR_ID,
	dnd5e2014ResourceCatalog
} from '../dnd5e2014ResourceCatalog';
import { projectResourceLibrary } from '../resourceLibrary';
import {
	createResourceCatalog,
	resolveResourceLocator,
	resolveTopicSources,
	searchResourceCatalog
} from '../resourceCatalog';
import {
	emptyResourceCatalogFixture,
	mixedResourceCatalogFixture,
	resourceCatalogProofFixtures
} from '../resourceCatalogFixtures';

const cloneCatalogInput = () => structuredClone(dnd5e2014ResourceCatalog);

describe('resource catalog validation', () => {
	it('accepts the registered 2014 catalog and distinct empty fixture', () => {
		expect(dnd5e2014ResourceCatalog.resources).toHaveLength(2);
		expect(emptyResourceCatalogFixture).toEqual({
			version: 1,
			resources: [],
			topics: [],
			locators: []
		});
	});

	it('rejects duplicate and unknown authored identities', () => {
		const duplicate = cloneCatalogInput();
		duplicate.locators.push(structuredClone(duplicate.locators[0]));
		expect(() => createResourceCatalog(duplicate)).toThrow(/Duplicate locator ID/);

		const unknown = cloneCatalogInput();
		unknown.locators[0].resourceId = 'missing.resource';
		expect(() => createResourceCatalog(unknown)).toThrow(/Unknown resource ID/);
	});

	it('rejects local inclusion claims for link-only sources', () => {
		const invalid = cloneCatalogInput();
		const external = invalid.resources.find((resource) => resource.delivery === 'link-only');
		if (!external) throw new Error('Expected the registered external resource');
		external.localAssetPath = '/docs/ext/not-included.pdf';
		expect(() => createResourceCatalog(invalid)).toThrow(
			/A link-only resource cannot declare a local asset path/
		);
	});
});

describe('resource catalog projection', () => {
	it('projects one topic result with its preferred source and disclosed alternates', () => {
		const projection = projectResourceLibrary(dnd5e2014ResourceCatalog, 'equipment', {
			systemId: 'dnd5e-2014',
			resolveAssetHref: (path) => `/ez-chars${path}`
		});
		expect(projection.catalogEmpty).toBe(false);
		expect(projection.hasQuery).toBe(true);
		expect(projection.results).toHaveLength(1);
		expect(projection.results[0].preferred.locator.id).toBe(DND5E_2014_EQUIPMENT_LOCATOR_ID);
		expect(projection.results[0].preferred.kind).toBe('internal');
		expect(projection.results[0].alternates.map((source) => source.kind)).toEqual(['external']);
	});

	it('distinguishes the empty catalog, empty query, and no-match query', () => {
		const empty = projectResourceLibrary(emptyResourceCatalogFixture, '', {
			systemId: 'dnd5e-2014'
		});
		expect(empty.catalogEmpty).toBe(true);
		expect(empty.results).toEqual([]);

		const all = projectResourceLibrary(dnd5e2014ResourceCatalog, '', {
			systemId: 'dnd5e-2014'
		});
		expect(all.catalogEmpty).toBe(false);
		expect(all.hasQuery).toBe(false);
		expect(all.results[0].preferred.locator.id).toBe(DND5E_2014_GENERAL_LOCATOR_ID);

		const noMatch = projectResourceLibrary(
			dnd5e2014ResourceCatalog,
			resourceCatalogProofFixtures.noMatchQuery,
			{ systemId: 'dnd5e-2014' }
		);
		expect(noMatch.catalogEmpty).toBe(false);
		expect(noMatch.hasQuery).toBe(true);
		expect(noMatch.results).toEqual([]);
	});

	it('preserves ownership, stale, and unavailable dispositions in discovery', () => {
		const owned = projectResourceLibrary(mixedResourceCatalogFixture, 'ownership-required');
		expect(owned.results[0].preferred.kind).toBe('external');
		expect(owned.results[0].preferred.resource.access).toBe('ownership-required');

		const stale = projectResourceLibrary(mixedResourceCatalogFixture, 'stale locator');
		expect(stale.results[0].preferred.kind).toBe('stale');

		const unavailable = projectResourceLibrary(mixedResourceCatalogFixture, 'unavailable source');
		expect(unavailable.results[0].preferred.kind).toBe('unavailable');
	});

	it('resolves the preferred source and stable alternate order explicitly', () => {
		const sources = resolveTopicSources(dnd5e2014ResourceCatalog, DND5E_2014_EQUIPMENT_TOPIC_ID);
		expect(sources?.preferred.locator.id).toBe(DND5E_2014_EQUIPMENT_LOCATOR_ID);
		expect(sources?.preferred.resource.delivery).toBe('self-hosted');
		expect(sources?.alternates.map((source) => source.resource.delivery)).toEqual(['link-only']);
	});

	it('searches only registered metadata with deterministic preferred-first ordering', () => {
		const first = searchResourceCatalog(dnd5e2014ResourceCatalog, 'equipment', {
			systemId: 'dnd5e-2014'
		});
		const second = searchResourceCatalog(dnd5e2014ResourceCatalog, 'EQUIPMENT', {
			systemId: 'dnd5e-2014'
		});
		expect(first.map((hit) => hit.locator.id)).toEqual(second.map((hit) => hit.locator.id));
		expect(first[0].locator.id).toBe(DND5E_2014_EQUIPMENT_LOCATOR_ID);
		expect(first.map((hit) => hit.isPreferred)).toEqual([true, false]);
	});

	it('keeps source-text-only and explicit no-match queries out of catalog results', () => {
		expect(searchResourceCatalog(dnd5e2014ResourceCatalog, 'reckless attack')).toEqual([]);
		expect(
			searchResourceCatalog(dnd5e2014ResourceCatalog, resourceCatalogProofFixtures.noMatchQuery)
		).toEqual([]);
	});
});

describe('resource dispositions', () => {
	it('builds base-path-safe internal and browser-fallback URLs', () => {
		const disposition = resolveResourceLocator(
			dnd5e2014ResourceCatalog,
			DND5E_2014_EQUIPMENT_LOCATOR_ID,
			{ resolveAssetHref: (path) => `/ez-chars${path}` }
		);
		expect(disposition?.kind).toBe('internal');
		if (disposition?.kind !== 'internal') throw new Error('Expected internal disposition');
		expect(disposition.exactHref).toBe('/ez-chars/docs/ext/5e2014/SRD_CC_v5.1.pdf#page=62');
		expect(disposition.browserHref).toBe(disposition.exactHref);
	});

	it('keeps link-only navigation explicit and outside the local asset boundary', () => {
		const external = dnd5e2014ResourceCatalog.locators.find(
			(locator) => locator.kind === 'external-url'
		);
		if (!external) throw new Error('Expected an external locator');
		const disposition = resolveResourceLocator(dnd5e2014ResourceCatalog, external.id);
		expect(disposition?.kind).toBe('external');
		if (disposition?.kind !== 'external') throw new Error('Expected external disposition');
		expect(disposition.resource.localAssetPath).toBeUndefined();
		expect(disposition.resource.accessGuidance).toContain('Source not included');
		expect(disposition.externalHref).toBe('https://www.dndbeyond.com/sources/dnd/basic-rules-2014');
	});

	it('withholds stale exact pages and preserves unavailable citations', () => {
		const stale = resolveResourceLocator(mixedResourceCatalogFixture, 'fixture.stale-locator');
		expect(stale?.kind).toBe('stale');
		if (stale?.kind !== 'stale') throw new Error('Expected stale disposition');
		expect(stale.generalHref).not.toContain('#page=');
		expect(stale.safeOpenKind).toBe('internal');
		if (stale.safeOpenKind !== 'internal') throw new Error('Expected internal safe open');
		expect(stale.browserHref).toBe(stale.generalHref);
		expect('exactHref' in stale).toBe(false);

		const unavailable = resolveResourceLocator(
			mixedResourceCatalogFixture,
			'fixture.unavailable-locator'
		);
		expect(unavailable?.kind).toBe('unavailable');
		if (unavailable?.kind !== 'unavailable') throw new Error('Expected unavailable disposition');
		expect(unavailable.resource.title).toBe('Example Unavailable Source');
		expect(unavailable.retryable).toBe(false);
	});

	it('keeps a stale link-only source outside the in-app viewer', () => {
		const input = cloneCatalogInput();
		const external = input.locators.find((locator) => locator.kind === 'external-url');
		if (!external) throw new Error('Expected an external locator');
		external.health = 'stale';
		const disposition = resolveResourceLocator(createResourceCatalog(input), external.id);
		expect(disposition?.kind).toBe('stale');
		if (disposition?.kind !== 'stale') throw new Error('Expected stale disposition');
		expect(disposition.safeOpenKind).toBe('external');
		if (disposition.safeOpenKind !== 'external') throw new Error('Expected external safe open');
		expect(disposition.externalHref).toBe(disposition.resource.authoritativeHref);
	});

	it('represents a runtime load failure as retryable without mutating the catalog', () => {
		const before = structuredClone(dnd5e2014ResourceCatalog);
		const unavailable = resolveResourceLocator(
			dnd5e2014ResourceCatalog,
			DND5E_2014_EQUIPMENT_LOCATOR_ID,
			{ runtimeAvailability: 'unavailable' }
		);
		expect(unavailable?.kind).toBe('unavailable');
		if (unavailable?.kind !== 'unavailable') throw new Error('Expected unavailable disposition');
		expect(unavailable.retryable).toBe(true);
		expect(dnd5e2014ResourceCatalog).toEqual(before);
	});
});
