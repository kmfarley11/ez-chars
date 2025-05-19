import { writable } from 'svelte/store';

// TODO: use typescript or fix the jsdoc setup here...
/**
 * @typedef CharData
 * @property {Number} id
 * @property {String} name
 * @property {Object} metadata
 * @property {Array<String>} classLevels
 * @property {Object} ancestry
 * @property {String} alignment
 * @property {String} appearance
 */
export let charsArray = writable([
	{
		id: 1,
		name: 'bryltin brewhammer',
		metadata: {
			system: '2014-5e',
			sources: ['2014-5e-srd', '2014-5e-ua-sidekick']
		},
		classLevels: ['warrior 8'],
		ancestry: {
			race: 'hill dwarf',
			background: '???'
		},
		alignment: 'NG',
		appearance: '???'
	},
	{
		id: 2,
		name: 'zindra winterbow',
		metadata: {
			system: '2014-5e',
			sources: ['2014-5e-srd', '2014-5e-ua-sidekick']
		},
		classLevels: ['expert 8'],
		ancestry: {
			race: 'wood elf',
			background: '???'
		},
		alignment: 'NG',
		appearance: '???'
	}
]);
