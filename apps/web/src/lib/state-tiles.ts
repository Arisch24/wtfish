import { STATES, type State } from './fish-schema';

export interface StateTile {
	state: State;
	code: string;
	col: number;
	row: number;
	colSpan?: number;
	rowSpan?: number;
}

export const MAP_COLUMNS = 8;
export const MAP_ROWS = 5;

/** A tile map of Malaysia: Peninsular states on the left, Borneo on the right. */
export const STATE_TILES: readonly StateTile[] = [
	{ state: 'Perlis', code: 'PLS', col: 1, row: 1 },
	{ state: 'Kedah', code: 'KDH', col: 2, row: 1 },
	{ state: 'Kelantan', code: 'KTN', col: 3, row: 1 },
	{ state: 'Terengganu', code: 'TRG', col: 4, row: 1 },
	{ state: 'Pulau Pinang', code: 'PNG', col: 1, row: 2 },
	{ state: 'Perak', code: 'PRK', col: 2, row: 2 },
	{ state: 'Pahang', code: 'PHG', col: 3, row: 2, rowSpan: 2 },
	{ state: 'Selangor', code: 'SGR', col: 1, row: 3 },
	{ state: 'Kuala Lumpur', code: 'KUL', col: 2, row: 3 },
	{ state: 'Putrajaya', code: 'PJY', col: 2, row: 4 },
	{ state: 'Negeri Sembilan', code: 'NSN', col: 3, row: 4 },
	{ state: 'Melaka', code: 'MLK', col: 3, row: 5 },
	{ state: 'Johor', code: 'JHR', col: 4, row: 4, rowSpan: 2 },
	{ state: 'Labuan', code: 'LBN', col: 6, row: 1 },
	{ state: 'Sabah', code: 'SBH', col: 7, row: 1, colSpan: 2 },
	{ state: 'Sarawak', code: 'SWK', col: 5, row: 2, colSpan: 2 },
];

/** The state named last in a spot's text ("Kuala Rompin, Pahang" → Pahang), if any. */
export function stateOfSpot(text: string): State | undefined {
	let found: State | undefined;
	let foundAt = -1;
	for (const state of STATES) {
		for (const match of text.matchAll(new RegExp(`\\b${state}\\b`, 'g'))) {
			if (match.index > foundAt) {
				found = state;
				foundAt = match.index;
			}
		}
	}
	return found;
}
