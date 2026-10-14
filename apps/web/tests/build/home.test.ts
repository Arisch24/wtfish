import { describe, expect, it } from 'vitest';
import { builtPage, cardsById, fishFiles, visibleText } from './helpers';

const html = builtPage('index.html');
const cards = cardsById(html);

describe('home page', () => {
	it('shows one card per fish, A–Z by English name', () => {
		const expected = [...fishFiles]
			.sort((a, b) => a.raw.names.english.localeCompare(b.raw.names.english))
			.map((fish) => fish.id);
		expect([...cards.keys()]).toEqual(expected);
	});

	it('counts the fish on the hanging sign', () => {
		expect(visibleText(html)).toContain(`${fishFiles.length} fish & counting`);
	});

	it('shows "No photo yet" for a fish without photos', () => {
		const card = cards.get('giant-featherback')!;
		expect(card).toContain('data-no-photo');
		expect(visibleText(card)).toContain('No photo yet');
	});

	it('shows a measuring tape only for fish with a known size', () => {
		for (const { id, raw } of fishFiles) {
			expect(cards.get(id)!.includes('data-card-tape'), id).toBe(Boolean(raw.size));
		}
	});

	it('shows every water type of a fish that lives in several', () => {
		const card = cards.get('barramundi')!;
		for (const water of ['freshwater', 'brackish', 'marine']) expect(card).toContain(`data-water="${water}"`);
	});

	it('shows what each fish is for on its tag', () => {
		expect(visibleText(cards.get('striped-snakehead')!)).toContain('Sport · Food');
	});

	it('uses resized photos, not the originals', () => {
		expect(html).not.toContain('/photos/');
		expect(html).toMatch(/<source[^>]+type="image\/avif"/);
	});

	it('ships the "no fish match" message hidden', () => {
		expect(html).toMatch(/<div id="empty" hidden/);
		expect(visibleText(html)).toContain('No fish match that.');
	});
});
