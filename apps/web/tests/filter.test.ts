import { describe, expect, it } from 'vitest';
import { matches, searchText, type FilterItem, type FilterQuery } from '../src/lib/filter';

const toman: FilterItem = {
	search: searchText({
		english: 'Giant snakehead',
		scientific: 'Channa micropeltes',
		malay: 'Toman',
		other: ['Red snakehead'],
	}),
	water: ['freshwater'],
	uses: ['sport', 'food'],
	states: ['Perak', 'Negeri Sembilan'],
	status: 'native',
	iucn: 'LC',
};

const temoleh: FilterItem = {
	search: searchText({ english: "Jullien's golden carp", scientific: 'Probarbus jullieni', malay: 'Temoleh' }),
	water: ['freshwater'],
	uses: ['food'],
	states: ['Pahang'],
	status: 'native',
	iucn: 'CR',
};

const goldfish: FilterItem = {
	search: searchText({ english: 'Goldfish', scientific: 'Carassius auratus' }),
	water: ['freshwater'],
	uses: ['aquarium'],
	states: [],
	status: '',
	iucn: '',
};

const any: FilterQuery = { text: '', water: '', use: '', state: '', status: '', threatened: false };

describe('matches', () => {
	it('matches everything with an empty query', () => {
		expect([toman, temoleh, goldfish].every((fish) => matches(fish, any))).toBe(true);
	});

	it('finds a fish by its Malay name in any case', () => {
		expect(matches(toman, { ...any, text: 'TOMAN' })).toBe(true);
		expect(matches(goldfish, { ...any, text: 'TOMAN' })).toBe(false);
	});

	it('finds a fish by other names', () => {
		expect(matches(toman, { ...any, text: 'red snake' })).toBe(true);
	});

	it('ignores extra spaces and word order', () => {
		expect(matches(toman, { ...any, text: '  micropeltes   channa ' })).toBe(true);
	});

	it('requires every word to match', () => {
		expect(matches(toman, { ...any, text: 'toman goldfish' })).toBe(false);
	});

	it('filters by use', () => {
		expect(matches(goldfish, { ...any, use: 'aquarium' })).toBe(true);
		expect(matches(toman, { ...any, use: 'aquarium' })).toBe(false);
	});

	it('filters by water', () => {
		expect(matches(toman, { ...any, water: 'marine' })).toBe(false);
	});

	it('filters by state, including names with spaces', () => {
		expect(matches(toman, { ...any, state: 'Negeri Sembilan' })).toBe(true);
		expect(matches(temoleh, { ...any, state: 'Negeri Sembilan' })).toBe(false);
	});

	it('"any" status keeps only fish found in Malaysia', () => {
		expect(matches(toman, { ...any, status: 'any' })).toBe(true);
		expect(matches(goldfish, { ...any, status: 'any' })).toBe(false);
	});

	it('filters by an exact status', () => {
		expect(matches(toman, { ...any, status: 'introduced' })).toBe(false);
	});

	it('"threatened" keeps only VU, EN and CR fish', () => {
		expect(matches(temoleh, { ...any, threatened: true })).toBe(true);
		expect(matches(toman, { ...any, threatened: true })).toBe(false);
		expect(matches(goldfish, { ...any, threatened: true })).toBe(false);
	});
});
