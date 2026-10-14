import { describe, expect, it } from 'vitest';
import { STATUS_BADGE, STATUS_SHORT_LABEL, USE_SHORT_LABEL, useTagText } from '../src/lib/labels';

describe('use tags', () => {
	it('uses short labels', () => {
		expect(USE_SHORT_LABEL).toEqual({ sport: 'Sport', food: 'Food', aquarium: 'Aquarium' });
	});

	it('joins several uses with a middle dot', () => {
		expect(useTagText(['sport', 'food'])).toBe('Sport · Food');
		expect(useTagText(['aquarium'])).toBe('Aquarium');
	});
});

describe('status labels', () => {
	it('has badge and short text for every status', () => {
		expect(STATUS_BADGE).toEqual({
			native: 'Native to Malaysia',
			endemic: 'Endemic to Malaysia',
			introduced: 'Introduced to Malaysia',
			invasive: 'Invasive in Malaysia',
		});
		expect(STATUS_SHORT_LABEL).toEqual({
			native: 'Native',
			endemic: 'Endemic',
			introduced: 'Introduced',
			invasive: 'Invasive',
		});
	});
});
