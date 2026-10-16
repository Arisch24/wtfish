import { describe, expect, it } from 'vitest';
import { CATEGORY_GROUPS, GROUPS, categoriesWithFish, groupLinks } from '../../src/lib/categories';
import { builtPage, fishFiles, visibleText } from './helpers';

const entries = fishFiles.map(({ id, raw }) => ({ id, data: raw }));
const html = builtPage('browse/index.html');
const main = html.match(/<main[\s\S]*<\/main>/)![0];

describe('browse page', () => {
	it('names the page', () => {
		expect(html).toContain('<title>Browse fish | wtfish</title>');
		expect(visibleText(main)).toContain('Browse fish');
		expect(visibleText(main)).toContain('Find fish by water, use, habitat, state or conservation status.');
	});

	it('has a section for each group, in order, with an id to link to', () => {
		const sections = [...main.matchAll(/<section[^>]*data-section="([a-z]+)"/g)].map((match) => match[1]);
		expect(sections).toEqual([...CATEGORY_GROUPS]);
		for (const group of CATEGORY_GROUPS) {
			expect(main).toMatch(new RegExp(`<h2 id="${group}"[^>]*>\\s*${GROUPS[group].heading}\\s*</h2>`));
		}
	});

	it('links every category page once, with its count', () => {
		for (const category of categoriesWithFish(entries)) {
			expect(main.split(`href="${category.path}"`).length - 1, category.path).toBe(1);
		}
		const text = visibleText(main);
		for (const group of CATEGORY_GROUPS) {
			for (const link of groupLinks(group, entries)) expect(text).toContain(`${link.name} · ${link.count} fish`);
		}
	});

	it('marks no chip as the current page', () => {
		expect(main).not.toContain('aria-current');
	});
});
