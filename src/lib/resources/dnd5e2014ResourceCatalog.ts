import { FULL_2014_SRD_PATH } from '$utils/urlHelpers';
import { createResourceCatalog } from './resourceCatalog';

export const DND5E_2014_SRD_RESOURCE_ID = 'dnd5e-2014.srd-5-1';
export const DND5E_2014_GENERAL_TOPIC_ID = 'dnd5e-2014.general-rules';
export const DND5E_2014_CLASS_TOPIC_ID = 'dnd5e-2014.character-class';
export const DND5E_2014_EQUIPMENT_TOPIC_ID = 'dnd5e-2014.equipment';
export const DND5E_2014_SPELLCASTING_TOPIC_ID = 'dnd5e-2014.spellcasting';

export const DND5E_2014_GENERAL_LOCATOR_ID = 'dnd5e-2014.srd-5-1.general-rules';
export const DND5E_2014_CLASS_LOCATOR_ID = 'dnd5e-2014.srd-5-1.class-features';
export const DND5E_2014_EQUIPMENT_LOCATOR_ID = 'dnd5e-2014.srd-5-1.equipment';
export const DND5E_2014_SPELLCASTING_LOCATOR_ID = 'dnd5e-2014.srd-5-1.spellcasting';

const DND_BEYOND_RESOURCE_ID = 'dnd5e-2014.dnd-beyond-basic-rules';
const DND_BEYOND_HREF = 'https://www.dndbeyond.com/sources/dnd/basic-rules-2014';

export const dnd5e2014ResourceCatalog = createResourceCatalog({
	version: 1,
	resources: [
		{
			id: DND5E_2014_SRD_RESOURCE_ID,
			systemId: 'dnd5e-2014',
			rulesVersion: 'SRD 5.1 (2014 rules)',
			title: 'System Reference Document 5.1',
			publisher: 'Wizards of the Coast LLC',
			delivery: 'self-hosted',
			access: 'included',
			authoritativeHref: 'https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf',
			localAssetPath: FULL_2014_SRD_PATH,
			attributionReference: 'THIRD_PARTY_NOTICES.md#system-reference-document-51',
			availability: 'available',
			pageBasis: 'pdf-and-printed-one-based'
		},
		{
			id: DND_BEYOND_RESOURCE_ID,
			systemId: 'dnd5e-2014',
			rulesVersion: 'Basic Rules (2014)',
			title: 'D&D Beyond Basic Rules (2014)',
			publisher: 'Wizards of the Coast LLC',
			delivery: 'link-only',
			access: 'free-external',
			accessGuidance: 'Source not included; opens on D&D Beyond.',
			authoritativeHref: DND_BEYOND_HREF,
			attributionReference: 'THIRD_PARTY_NOTICES.md#external-links-not-redistributed-in-repo',
			availability: 'available'
		}
	],
	topics: [
		{
			id: DND5E_2014_GENERAL_TOPIC_ID,
			systemId: 'dnd5e-2014',
			label: 'General rules',
			description: 'Open the preferred rules source for broad lookup and document search.',
			preferredLocatorId: DND5E_2014_GENERAL_LOCATOR_ID
		},
		{
			id: DND5E_2014_CLASS_TOPIC_ID,
			systemId: 'dnd5e-2014',
			label: 'Character classes',
			description: 'Find the beginning of the SRD class-feature sections.',
			preferredLocatorId: DND5E_2014_CLASS_LOCATOR_ID
		},
		{
			id: DND5E_2014_EQUIPMENT_TOPIC_ID,
			systemId: 'dnd5e-2014',
			label: 'Equipment',
			description: 'Find equipment, armor, weapon, gear, and currency information.',
			preferredLocatorId: DND5E_2014_EQUIPMENT_LOCATOR_ID
		},
		{
			id: DND5E_2014_SPELLCASTING_TOPIC_ID,
			systemId: 'dnd5e-2014',
			label: 'Spellcasting',
			description: 'Find general spellcasting rules before the spell lists and descriptions.',
			preferredLocatorId: DND5E_2014_SPELLCASTING_LOCATOR_ID
		}
	],
	locators: [
		{
			id: DND5E_2014_GENERAL_LOCATOR_ID,
			resourceId: DND5E_2014_SRD_RESOURCE_ID,
			topicId: DND5E_2014_GENERAL_TOPIC_ID,
			label: 'General rules',
			description: 'Open the document at its beginning for general lookup.',
			kind: 'pdf-page',
			page: 1,
			health: 'verified'
		},
		{
			id: DND5E_2014_CLASS_LOCATOR_ID,
			resourceId: DND5E_2014_SRD_RESOURCE_ID,
			topicId: DND5E_2014_CLASS_TOPIC_ID,
			label: 'Class features',
			description: 'Begin with the first class-feature section.',
			kind: 'pdf-page',
			page: 8,
			health: 'verified'
		},
		{
			id: DND5E_2014_EQUIPMENT_LOCATOR_ID,
			resourceId: DND5E_2014_SRD_RESOURCE_ID,
			topicId: DND5E_2014_EQUIPMENT_TOPIC_ID,
			label: 'Equipment',
			description: 'Begin with the general equipment section.',
			kind: 'pdf-page',
			page: 62,
			health: 'verified'
		},
		{
			id: DND5E_2014_SPELLCASTING_LOCATOR_ID,
			resourceId: DND5E_2014_SRD_RESOURCE_ID,
			topicId: DND5E_2014_SPELLCASTING_TOPIC_ID,
			label: 'Spellcasting',
			description: 'Begin with the general rules for casting spells.',
			kind: 'pdf-page',
			page: 100,
			health: 'verified'
		},
		...[
			[DND5E_2014_GENERAL_TOPIC_ID, 'general'],
			[DND5E_2014_CLASS_TOPIC_ID, 'class'],
			[DND5E_2014_EQUIPMENT_TOPIC_ID, 'equipment'],
			[DND5E_2014_SPELLCASTING_TOPIC_ID, 'spellcasting']
		].map(([topicId, suffix]) => ({
			id: `dnd5e-2014.dnd-beyond-basic-rules.${suffix}`,
			resourceId: DND_BEYOND_RESOURCE_ID,
			topicId,
			label: 'D&D Beyond Basic Rules',
			description: 'Open the external 2014 Basic Rules source.',
			kind: 'external-url' as const,
			href: DND_BEYOND_HREF,
			health: 'verified' as const
		}))
	]
});
