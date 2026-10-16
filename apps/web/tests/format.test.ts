import { describe, expect, it } from 'vitest';
import { formatDate, formatRange, formatSize, lastUpdated, licenseUrl, listOf, listParts } from '../src/lib/format';

describe('listOf', () => {
	it('returns a single item unchanged', () => {
		expect(listOf(['Freshwater'])).toBe('Freshwater');
	});

	it('joins two items with "and"', () => {
		expect(listOf(['Sport fishing', 'Food'])).toBe('Sport fishing and Food');
	});

	it('joins three items with commas and "and"', () => {
		expect(listOf(['Freshwater', 'Brackish', 'Saltwater'])).toBe('Freshwater, Brackish, and Saltwater');
	});
});

describe('listParts', () => {
	it('splits a list into its items and the words between them', () => {
		expect(listParts(['Perak', 'Sabah', 'Johor'])).toEqual([
			{ type: 'element', value: 'Perak' },
			{ type: 'literal', value: ', ' },
			{ type: 'element', value: 'Sabah' },
			{ type: 'literal', value: ', and ' },
			{ type: 'element', value: 'Johor' },
		]);
	});

	it('joins back into the same text as listOf', () => {
		for (const items of [['Perak'], ['Perak', 'Sabah'], ['Perak', 'Sabah', 'Johor', 'Kedah']]) {
			expect(listParts(items).map((part) => part.value).join(''), items.join()).toBe(listOf(items));
		}
	});
});

describe('formatSize', () => {
	it('shows only the maximum length', () => {
		expect(formatSize({ maxCm: 100 })).toBe('Up to 100 cm');
	});

	it('adds the maximum weight', () => {
		expect(formatSize({ maxCm: 100, maxKg: 20 })).toBe('Up to 100 cm and 20 kg');
	});

	it('leads with the common length', () => {
		expect(formatSize({ maxCm: 100, commonCm: 50, maxKg: 20 })).toBe('Usually 50 cm; up to 100 cm and 20 kg');
	});
});

describe('formatRange', () => {
	it('shows a range with a unit', () => {
		expect(formatRange([24, 28], '°C')).toBe('24–28°C');
	});

	it('collapses equal ends', () => {
		expect(formatRange([7, 7], '')).toBe('7');
	});
});

describe('formatDate', () => {
	it('formats an ISO date in British style', () => {
		expect(formatDate('2026-10-13')).toBe('13 October 2026');
	});
});

describe('lastUpdated', () => {
	it('returns the newest review date', () => {
		expect(
			lastUpdated([{ lastReviewed: '2026-10-01' }, { lastReviewed: '2026-10-13' }, { lastReviewed: '2026-09-30' }]),
		).toBe('2026-10-13');
	});

	it('ignores fish that have not been reviewed', () => {
		expect(lastUpdated([{}, { lastReviewed: '2026-10-02' }, {}])).toBe('2026-10-02');
	});

	it('returns undefined when no fish has been reviewed', () => {
		expect(lastUpdated([{}, {}])).toBeUndefined();
		expect(lastUpdated([])).toBeUndefined();
	});
});

describe('licenseUrl', () => {
	it('links CC0 to the public-domain dedication', () => {
		expect(licenseUrl('CC0')).toBe('https://creativecommons.org/publicdomain/zero/1.0/');
	});

	it('links BY and BY-SA to the licence overview, since no version is stored', () => {
		expect(licenseUrl('CC BY')).toBe('https://creativecommons.org/share-your-work/cclicenses/');
		expect(licenseUrl('CC BY-SA')).toBe('https://creativecommons.org/share-your-work/cclicenses/');
	});
});
