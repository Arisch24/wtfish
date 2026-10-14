import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

function token(name: string): string {
	const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6});`));
	if (!match) throw new Error(`--color-${name} is not defined in global.css`);
	return match[1];
}

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5]
		.map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

const white = '#ffffff';
// [where it is used, text colour, background colour, WCAG AA minimum]
const pairs: [string, string, string, number][] = [
	['body text on tiles', token('ink'), token('tile'), 4.5],
	['body text on cards', token('ink'), white, 4.5],
	['secondary text on cards', token('muted'), white, 4.5],
	['secondary text on tiles', token('muted'), token('tile'), 4.5],
	['tag text on cardboard', token('ink'), token('cardboard'), 4.5],
	['notice text on yellow', token('ink'), token('sign-yellow'), 4.5],
	['header links on red', white, token('sign-red'), 4.5],
	['logo "wt" on red (large text)', token('sign-yellow'), token('sign-red'), 3],
	['pressed pill text', token('sign-yellow'), token('ink'), 4.5],
	['freshwater label', white, token('fresh'), 4.5],
	['brackish label', white, token('brackish'), 4.5],
	['saltwater label and recorded states', white, token('salt'), 4.5],
	['links on cards', token('salt'), white, 4.5],
	['sizes and threatened codes on cards', token('alert'), white, 4.5],
	['sizes on tiles', token('alert'), token('tile'), 4.5],
];

describe('colour contrast (WCAG AA)', () => {
	it.each(pairs)('%s', (_where, text, background, minimum) => {
		expect(contrast(text, background)).toBeGreaterThanOrEqual(minimum);
	});
});
