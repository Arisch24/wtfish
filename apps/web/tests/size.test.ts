import { describe, expect, it } from 'vitest';
import { CARD_TAPE_TICKS, HAND_CM, PERSON_CM, cardTapePosition, lengthLabel, sizeComparison } from '../src/lib/size';

describe('lengthLabel', () => {
	it.each([
		[0, '0'],
		[5, '5 cm'],
		[50, '50 cm'],
		[100, '1 m'],
		[150, '1.5 m'],
		[500, '5 m'],
	])('%i cm is labelled %s', (cm, label) => {
		expect(lengthLabel(cm)).toBe(label);
	});
});

describe('cardTapePosition (log scale, 1 cm to 5 m)', () => {
	it('puts 1 cm at the start and 5 m at the end', () => {
		expect(cardTapePosition(1)).toBe(0);
		expect(cardTapePosition(500)).toBe(1);
	});

	it('puts 10 cm about 37% along', () => {
		expect(cardTapePosition(10)).toBeCloseTo(0.3705, 3);
	});

	it('clamps sizes outside the tape', () => {
		expect(cardTapePosition(0.4)).toBe(0);
		expect(cardTapePosition(1800)).toBe(1);
	});
});

describe('CARD_TAPE_TICKS', () => {
	it('marks 1 cm, 10 cm, 1 m and 5 m at their log positions', () => {
		expect(CARD_TAPE_TICKS.map((tick) => tick.label)).toEqual(['1 cm', '10 cm', '1 m', '5 m']);
		for (const tick of CARD_TAPE_TICKS) expect(tick.position).toBe(cardTapePosition(tick.cm));
	});
});

describe('sizeComparison', () => {
	it.each([
		[2.5, 'hand', 20, 5],
		[11, 'hand', 20, 5],
		[45, 'hand', 50, 10],
		[50, 'person', 200, 50],
		[180, 'person', 200, 50],
		[350, 'person', 400, 100],
		// Larger than the table: a future whale shark must still get a scale.
		[1500, 'person', 1500, 500],
		[1800, 'person', 2000, 500],
	])('%s cm uses a %s on a %i cm scale in %i cm steps', (maxCm, reference, scaleMaxCm, stepCm) => {
		expect(sizeComparison(maxCm)).toMatchObject({ reference, scaleMaxCm, stepCm });
	});

	it('uses a 170 cm person and an 18 cm hand', () => {
		expect(PERSON_CM).toBe(170);
		expect(HAND_CM).toBe(18);
		expect(sizeComparison(350).referenceCm).toBe(PERSON_CM);
		expect(sizeComparison(11).referenceCm).toBe(HAND_CM);
	});

	it('labels ticks in cm below 1 m and in metres from 1 m', () => {
		expect(sizeComparison(180).ticks.map((tick) => tick.label)).toEqual(['0', '50 cm', '1 m', '1.5 m', '2 m']);
	});

	it('spaces ticks evenly from 0 to 1', () => {
		expect(sizeComparison(350).ticks.map((tick) => tick.position)).toEqual([0, 0.25, 0.5, 0.75, 1]);
	});
});
