import { describe, expect, it } from 'vitest';
import { CATEGORIES, GROUPS, categoriesWithFish, fishIn, groupLinks } from '../../src/lib/categories';
import type { Fish } from '../../src/lib/fish-schema';
import { builtPage, cardsById, fishFiles, isBuilt, visibleText } from './helpers';

const entries = fishFiles.map(({ id, raw }) => ({ id, data: raw }));
const pages = categoriesWithFish(entries);
const page = (path: string) => builtPage(`${path.slice(1)}index.html`);
/** The first match's text, decoded as a visitor reads it. */
const textOf = (html: string, pattern: RegExp) => visibleText(html.match(pattern)?.[1] ?? '');

describe('category pages', () => {
	it('builds a page for each category with fish, and none for the others', () => {
		for (const category of CATEGORIES) {
			expect(isBuilt(category.path), category.path).toBe(fishIn(category, entries).length > 0);
		}
	});

	it.each(pages)('$path names its category in the tab, heading and description', (category) => {
		const html = page(category.path);
		// Astro escapes characters such as the apostrophe in "Malaysia's", so compare decoded text.
		expect(textOf(html, /<title>([\s\S]*?)<\/title>/)).toBe(`${category.title} | wtfish`);
		expect(textOf(html, /<meta name="description" content="([^"]*)"/)).toBe(category.description);
		expect(textOf(html, /<h1[^>]*>([\s\S]*?)<\/h1>/)).toBe(category.title);
		expect(textOf(html, /<p[^>]*data-band-label[^>]*>([\s\S]*?)<\/p>/)).toBe(GROUPS[category.group].label);
		expect(visibleText(html)).toContain(category.description);
	});

	it.each(pages)('$path links its group label to its section on the Browse page', (category) => {
		expect(page(category.path)).toMatch(
			new RegExp(`data-band-label[^>]*>\\s*<a href="/browse/#${category.group}"[^>]*>\\s*${GROUPS[category.group].label}\\s*</a>`),
		);
	});

	it.each(pages)('$path shows its fish A–Z, with the count', (category) => {
		const html = page(category.path);
		const expected = fishIn(category, entries).map((entry) => entry.id);
		expect([...cardsById(html).keys()]).toEqual(expected);
		expect(textOf(html, /<p[^>]*data-fish-count[^>]*>([\s\S]*?)<\/p>/)).toBe(`${expected.length} fish`);
	});

	it.each(pages)('$path has no filters', (category) => {
		const html = page(category.path);
		expect(html).not.toContain('id="filters"');
		expect(html).not.toContain('<astro-island');
	});

	it.each(pages)('$path links to the other pages in its group, with their counts', (category) => {
		const nav = page(category.path).match(/<nav[^>]*data-group-links[\s\S]*?<\/nav>/)?.[0] ?? '';
		expect(textOf(nav, /<h2[^>]*>([\s\S]*?)<\/h2>/)).toBe(GROUPS[category.group].heading);
		for (const link of groupLinks(category.group, entries)) {
			expect(visibleText(nav)).toContain(`${link.name} · ${link.count} fish`);
			if (link.path === category.path) expect(nav).not.toContain(`href="${link.path}"`);
			else expect(nav).toContain(`href="${link.path}"`);
		}
		expect(nav.match(/aria-current="page"/g)).toHaveLength(1);
	});

	it('notes on state pages only that few records can mean few surveys', () => {
		for (const category of pages) {
			const text = visibleText(page(category.path));
			expect(text.includes(GROUPS.state.note!), category.path).toBe(category.group === 'state');
		}
	});

	it('shows the same fish as a recount from the data files', () => {
		// Counted here without categories.ts, so a wrong rule there can't pass by agreeing with itself.
		const recount = (keep: (fish: Fish) => boolean) =>
			fishFiles
				.filter(({ raw }) => keep(raw))
				.map(({ id }) => id)
				.sort();
		const shown = (path: string) => [...cardsById(page(path)).keys()].sort();
		expect(shown('/water/brackish/')).toEqual(recount((fish) => fish.water.includes('brackish')));
		expect(shown('/use/sport/')).toEqual(recount((fish) => fish.uses.includes('sport')));
		expect(shown('/habitat/mangroves/')).toEqual(recount((fish) => fish.habitat?.environments.includes('mangrove') ?? false));
		expect(shown('/malaysia/sabah/')).toEqual(recount((fish) => fish.malaysia?.states?.some(({ state }) => state === 'Sabah') ?? false));
		expect(shown('/threatened/')).toEqual(recount((fish) => ['VU', 'EN', 'CR'].includes(fish.iucn ?? '')));
		expect(shown('/malaysia/invasive/')).toEqual(
			recount((fish) => ['introduced', 'invasive'].includes(fish.malaysia?.status ?? '')),
		);
	});
});
