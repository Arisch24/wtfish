export type IconName = 'hook' | 'hook-question' | 'wave' | 'drop' | 'brackish' | 'fish' | 'person' | 'hand';

/**
 * Inline SVG icons shared by Astro components and the React island. `fish` faces
 * left; `person` and `hand` lie horizontally so their width is their length.
 */
export const ICONS: Record<IconName, { viewBox: string; body: string }> = {
	hook: {
		viewBox: '0 0 14 22',
		body: '<path d="M7 1 L7 13 C7 19 2 19 2 14.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M2 14.5 L4.4 16.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
	},
	'hook-question': {
		viewBox: '0 0 26 46',
		body: '<path d="M6 15 C6 8 11 4 15.5 4 C20.5 4 23 8 23 12 C23 18 15.5 20 15.5 27 L15.5 31" fill="none" stroke="currentColor" stroke-width="5.6" stroke-linecap="round"/><path d="M6 16.5 L10 12.5" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round"/><circle cx="15.5" cy="39.5" r="3.6" fill="none" stroke="currentColor" stroke-width="4"/>',
	},
	wave: {
		viewBox: '0 0 16 16',
		body: '<path d="M1 6 q2.3 -3 4.6 0 t4.6 0 t4.6 0 M1 11 q2.3 -3 4.6 0 t4.6 0 t4.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
	},
	drop: {
		viewBox: '0 0 16 16',
		body: '<path d="M8 1.5 C8 1.5 3 7.5 3 10.5 a5 5 0 0 0 10 0 C13 7.5 8 1.5 8 1.5 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
	},
	brackish: {
		viewBox: '0 0 16 16',
		body: '<path d="M8 1.5 C8 1.5 3 7.5 3 10.5 a5 5 0 0 0 10 0 C13 7.5 8 1.5 8 1.5 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4.6 10.6 q1.7 -1.6 3.4 0 t3.4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
	},
	fish: {
		viewBox: '0 0 96 24',
		body: '<path d="M2 12 C14 3 50 1 74 10 L92 2 L88 12 L92 22 L74 14 C50 23 14 21 2 12 Z" fill="currentColor"/><circle cx="11" cy="10.5" r="1.6" fill="#fff"/>',
	},
	person: {
		viewBox: '0 0 100 22',
		body: '<circle cx="6" cy="11" r="5.5" fill="currentColor"/><path d="M13 6.5 Q16 5 20 5.5 L56 7 Q60 7.5 60 11 Q60 14.5 56 15 L20 16.5 Q16 17 13 15.5 Z" fill="currentColor"/><path d="M58 8.5 L97 7 M58 13.5 L97 15" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>',
	},
	hand: {
		viewBox: '0 0 100 40',
		body: '<g transform="translate(100 0) rotate(90)"><path d="M10 98 L10 52 Q6 47 4 41 L1 31 Q0 26 4 26 Q7 26 9 32 L12 40 L12 13 Q12 8 15.5 8 Q19 8 19 13 L19 37 L19 6 Q19 2 22.5 2 Q26 2 26 6 L26 37 L26 9 Q26 5 29.5 5 Q33 5 33 9 L33 39 L33 17 Q33 13 36 13 Q39 13 39 17 L39 62 Q39 80 32 88 L32 98 Z" fill="currentColor"/></g>',
	},
};
