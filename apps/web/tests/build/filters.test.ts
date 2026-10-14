import { describe, expect, it } from 'vitest';
import { builtPage, fishFiles } from './helpers';

const html = builtPage('index.html');

describe('filter bar', () => {
	it('is a React island with the search box', () => {
		expect(html).toMatch(/<astro-island[^>]+component-url="[^"]*FilterBar[^"]*"/);
		expect(html).toContain('placeholder="Search by name or scientific name…"');
	});

	it('shows every fish and the full count before JavaScript runs', () => {
		expect(html).not.toMatch(/<li data-fish-card[^>]*\shidden/);
		expect(html).toContain(`>${fishFiles.length} fish</p>`);
		expect(html).toMatch(/<div id="empty" hidden/);
	});

	it('renders the quiet filter styles before JavaScript runs', () => {
		const start = html.indexOf('data-filter-bar');
		const bar = html.slice(start, html.indexOf('</astro-island>', start));
		expect(bar).not.toMatch(/border-ink|bg-ink|ink-card|shadow-hard|text-sign-yellow|font-bold/);
		expect(bar).toContain('border-control');
	});

	it('leaves room around the pills for the focus outline in the scrolling rows', () => {
		// A 2px outline at 2px offset needs 4px of padding inside an overflow-x-auto row, or it gets clipped.
		for (const group of ['Water', 'Use']) {
			expect(html, group).toMatch(new RegExp(`<div(?=[^>]*aria-label="${group}")(?=[^>]*class="[^"]*\\bp-1\\b)[^>]*>`));
		}
	});
});
