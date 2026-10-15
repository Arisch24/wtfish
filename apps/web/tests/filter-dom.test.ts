import { describe, expect, it } from 'vitest';
import type { FilterItem, FilterQuery } from '../src/lib/filter';
import { applyFilter, type FilterCard } from '../src/lib/filter-dom';

const item = (overrides: Partial<FilterItem>): FilterItem => ({
	search: '',
	water: ['freshwater'],
	uses: ['food'],
	states: [],
	status: '',
	iucn: '',
	...overrides,
});
const card = (overrides: Partial<FilterItem>): FilterCard => ({ el: { hidden: false }, item: item(overrides) });
const any: FilterQuery = { text: '', water: '', use: '', state: '', status: '', threatened: false };

describe('applyFilter', () => {
	it('hides cards that do not match and returns how many are shown', () => {
		const cards = [card({ search: 'giant snakehead' }), card({ search: 'goldfish' })];
		expect(applyFilter(cards, { ...any, text: 'snakehead' })).toBe(1);
		expect(cards.map((c) => c.el.hidden)).toEqual([false, true]);
	});

	it('shows hidden cards again when the query is cleared', () => {
		const cards = [card({ search: 'goldfish' })];
		applyFilter(cards, { ...any, text: 'snakehead' });
		expect(applyFilter(cards, any)).toBe(1);
		expect(cards[0].el.hidden).toBe(false);
	});

	it('finds a fish that lives in several waters under each of them', () => {
		const barramundi = card({ water: ['freshwater', 'brackish', 'marine'] });
		for (const water of ['freshwater', 'brackish', 'marine']) {
			expect(applyFilter([barramundi], { ...any, water })).toBe(1);
		}
	});

	it('returns 0 when nothing matches', () => {
		expect(applyFilter([card({}), card({})], { ...any, use: 'aquarium' })).toBe(0);
	});
});
