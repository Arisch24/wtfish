import { describe, expect, it } from 'vitest';
import { STATES } from '../src/lib/fish-schema';
import { MAP_COLUMNS, MAP_ROWS, STATE_TILES, stateOfSpot } from '../src/lib/state-tiles';

describe('STATE_TILES', () => {
	it('has exactly one tile per state and federal territory', () => {
		expect(STATE_TILES.map((tile) => tile.state).sort()).toEqual([...STATES].sort());
	});

	it('uses unique three-letter codes', () => {
		const codes = STATE_TILES.map((tile) => tile.code);
		expect(new Set(codes).size).toBe(codes.length);
		for (const code of codes) expect(code).toMatch(/^[A-Z]{3}$/);
	});

	it('keeps every tile inside the 8 × 5 grid with no overlaps', () => {
		const taken = new Map<string, string>();
		for (const tile of STATE_TILES) {
			for (let col = tile.col; col < tile.col + (tile.colSpan ?? 1); col++) {
				for (let row = tile.row; row < tile.row + (tile.rowSpan ?? 1); row++) {
					expect(col).toBeGreaterThanOrEqual(1);
					expect(col).toBeLessThanOrEqual(MAP_COLUMNS);
					expect(row).toBeGreaterThanOrEqual(1);
					expect(row).toBeLessThanOrEqual(MAP_ROWS);
					const cell = `${col},${row}`;
					expect(taken.get(cell), `${tile.state} overlaps ${taken.get(cell)}`).toBeUndefined();
					taken.set(cell, tile.state);
				}
			}
		}
	});
});

describe('stateOfSpot', () => {
	it.each([
		['Kuala Rompin, Pahang', 'Pahang'],
		['Johor Bahru, Johor', 'Johor'],
		['Off Pahang, landed in Johor', 'Johor'],
		['Pulau Pinang', 'Pulau Pinang'],
		['Kuala Lumpur', 'Kuala Lumpur'],
	])('"%s" is in %s', (spot, state) => {
		expect(stateOfSpot(spot)).toBe(state);
	});

	it('returns undefined when no state is named', () => {
		expect(stateOfSpot('Tasik Temenggor')).toBeUndefined();
	});

	it('matches whole words only', () => {
		expect(stateOfSpot('Perakan River')).toBeUndefined();
	});
});
