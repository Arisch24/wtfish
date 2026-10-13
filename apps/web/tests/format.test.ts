import { describe, expect, it } from 'vitest';
import { formatDate, formatRange, formatSize, listOf } from '../src/lib/format';

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
