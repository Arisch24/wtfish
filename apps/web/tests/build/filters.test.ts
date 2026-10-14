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
});
