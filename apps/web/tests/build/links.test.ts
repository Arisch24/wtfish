import { describe, expect, it } from 'vitest';
import { allBuiltPages, builtPage, cardsById, isBuilt } from './helpers';

const withCards = allBuiltPages().filter((path) => builtPage(path).includes('<li data-fish-card'));

describe('links', () => {
	it.each(allBuiltPages())('%s links only to pages and files that exist', (path) => {
		const hrefs = new Set([...builtPage(path).matchAll(/href="(\/[^"?]*)/g)].map((match) => match[1]));
		for (const href of hrefs) {
			const [address, id] = href.split('#');
			expect(isBuilt(address), href).toBe(true);
			// A link to a section, such as /browse/#habitat, must find that id on the page.
			if (id && address.endsWith('/')) expect(builtPage(`${address.slice(1)}index.html`), href).toContain(`id="${id}"`);
		}
	});

	it.each(withCards)('%s keeps each fish card a single link', (path) => {
		// A link inside the card's link is invalid HTML, so tags inside cards stay plain text.
		for (const [id, card] of cardsById(builtPage(path))) expect(card.match(/<a\b/g), id).toHaveLength(1);
	});
});
