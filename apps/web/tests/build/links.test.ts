import { describe, expect, it } from 'vitest';
import { allBuiltPages, builtPage, cardsById, isBuilt } from './helpers';

const withCards = allBuiltPages().filter(
	(path) => path === 'index.html' || /^(water|use|habitat|malaysia|threatened)\//.test(path),
);

describe('links', () => {
	it.each(allBuiltPages())('%s links only to pages and files that exist', (path) => {
		const hrefs = new Set([...builtPage(path).matchAll(/href="(\/[^"#?]*)/g)].map((match) => match[1]));
		for (const href of hrefs) expect(isBuilt(href), href).toBe(true);
	});

	it.each(withCards)('%s keeps each fish card a single link', (path) => {
		// A link inside the card's link is invalid HTML, so tags inside cards stay plain text.
		for (const [id, card] of cardsById(builtPage(path))) expect(card.match(/<a\b/g), id).toHaveLength(1);
	});
});
