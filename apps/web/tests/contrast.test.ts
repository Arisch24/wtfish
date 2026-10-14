import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

function hexToRgb(hex: string): number[] {
	return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function rgbToHex(rgb: number[]): string {
	return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** A colour token from global.css: a hex value, or `color-mix(in srgb, var(--color-x) N%, white)`. */
function token(name: string): string {
	const value = css.match(new RegExp(`--color-${name}:\\s*([^;]+);`))?.[1].trim();
	if (!value) throw new Error(`--color-${name} is not defined in global.css`);
	if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
	const mix = value.match(/^color-mix\(in srgb, var\(--color-([a-z-]+)\) (\d+)%, white\)$/);
	if (!mix) throw new Error(`--color-${name} has an unsupported value: ${value}`);
	const share = Number(mix[2]) / 100;
	return rgbToHex(hexToRgb(token(mix[1])).map((c) => c * share + 255 * (1 - share)));
}

function luminance(hex: string): number {
	const [r, g, b] = hexToRgb(hex)
		.map((c) => c / 255)
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

const white = '#ffffff';
// [where it is used, foreground, background, WCAG minimum]
const pairs: [string, string, string, number][] = [
	['body text on white', token('ink'), white, 4.5],
	['body text on the tile band', token('ink'), token('tile'), 4.5],
	['secondary text on white', token('muted'), white, 4.5],
	['secondary text on the tile band', token('muted'), token('tile'), 4.5],
	['tag and sign text on cardboard', token('ink'), token('cardboard'), 4.5],
	['logo "wt" on white (large text)', token('sign-red'), white, 3],
	['links, labels and recorded states on white', token('salt'), white, 4.5],
	['links and labels on the tile band', token('salt'), token('tile'), 4.5],
	['current nav item and selected pill', token('salt'), token('salt-soft'), 4.5],
	['freshwater chip', token('fresh'), token('fresh-soft'), 4.5],
	['brackish chip', token('brackish'), token('brackish-soft'), 4.5],
	['saltwater chip', token('salt'), token('salt-soft'), 4.5],
	['threatened IUCN chip', token('ink'), token('threat-soft'), 4.5],
	['extinct IUCN chip', white, token('ink'), 4.5],
	['"Before you fish" text', token('ink'), token('notice'), 4.5],
	['recorded state code', white, token('salt'), 4.5],
	['threatened codes and "Not yet fact-checked"', token('alert'), white, 4.5],
	['"Not yet fact-checked" on the tile band', token('alert'), token('tile'), 4.5],
	['map spot number', token('ink'), token('sign-yellow'), 4.5],
	['form-control border (non-text, 3:1)', token('control'), white, 3],
	['focus ring on the selected pill (non-text, 3:1)', token('salt'), token('salt-soft'), 3],
];

describe('colour contrast (WCAG AA)', () => {
	it.each(pairs)('%s', (_where, foreground, background, minimum) => {
		expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
	});

	it('resolves a tint the way the browser mixes it', () => {
		// salt #1559a0 at 10% with white: 0.1 × 21 + 0.9 × 255 = 231.6 → e8, and so on.
		expect(token('salt-soft')).toBe('#e8eef6');
	});
});
