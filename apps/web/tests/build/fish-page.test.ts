import { describe, expect, it } from 'vitest';
import { builtPage, fishFiles, visibleText } from './helpers';
import { formatDate } from '../../src/lib/format';

const page = (id: string) => builtPage(`fish/${id}/index.html`);

describe('fish pages', () => {
	it('pairs "How big?" with "Where in Malaysia" in one row', () => {
		expect(page('indo-pacific-sailfish')).toContain('data-row="how-big where"');
	});

	it('lets a section without its partner take the whole row', () => {
		// The giant featherback has a map but no size, and a habitat but nothing to identify it by.
		const html = page('giant-featherback');
		expect(html).toContain('data-row="where"');
		expect(html).toContain('data-row="habitat"');
	});

	it('explains an IUCN category that seems to clash with the page', () => {
		expect(visibleText(page('giant-featherback'))).toContain(
			'it may lag the latest Red List assessment. IUCN lists this fish as extinct, but it has since been rediscovered in Indonesia.',
		);
		const sailfish = visibleText(page('indo-pacific-sailfish'));
		expect(sailfish).toContain('it may lag the latest Red List assessment.');
		expect(sailfish).not.toContain('IUCN lists this fish');
	});

	it('gives the family its own row of quick stats', () => {
		const html = page('indo-pacific-sailfish');
		expect(html).toMatch(/data-wide[^>]*>\s*<dt[^>]*>Family/);
		expect(html.match(/data-wide/g)).toHaveLength(1);
	});

	it('shows each stat as a label, a value and a note', () => {
		const text = visibleText(page('indo-pacific-sailfish'));
		expect(text).toContain('Max length 350 cm');
		expect(text).toContain('IUCN VU Vulnerable');
		expect(text).toContain('Family Istiophoridae order Perciformes');
	});

	it('builds a page for every fish', () => {
		for (const { id } of fishFiles) expect(() => page(id), id).not.toThrow();
	});

	it('titles the page with the English and scientific names', () => {
		expect(page('indo-pacific-sailfish')).toContain('<title>Indo-Pacific sailfish (Istiophorus platypterus) | wtfish</title>');
	});

	it('loads the hero photo first, and skips it for a fish without photos', () => {
		expect(page('indo-pacific-sailfish')).toMatch(/data-hero[\s\S]*?fetchpriority="high"/);
		expect(page('giant-featherback')).not.toContain('data-hero');
		expect(page('giant-featherback')).toContain('data-name-card');
	});

	it('reads the name before the photo', () => {
		const html = page('indo-pacific-sailfish');
		expect(html.indexOf('data-name-card')).toBeGreaterThan(-1);
		expect(html.indexOf('data-name-card')).toBeLessThan(html.indexOf('data-hero'));
	});

	it('shows when the profile was last reviewed and how many sources it has', () => {
		const sailfish = fishFiles.find((fish) => fish.id === 'indo-pacific-sailfish')!.raw;
		expect(visibleText(page('indo-pacific-sailfish'))).toContain(
			`Last reviewed ${formatDate(sailfish.lastReviewed!)} · ${sailfish.sources!.length} sources`,
		);
	});

	it('labels the profile with its family', () => {
		expect(visibleText(page('indo-pacific-sailfish'))).toContain('Fish profile · Istiophoridae');
	});

	it('shows "Before you fish" only when there are rules', () => {
		expect(page('indo-pacific-sailfish')).toContain('data-section="before-you-fish"');
		for (const { id, raw } of fishFiles) {
			expect(page(id).includes('data-section="before-you-fish"'), id).toBe(Boolean(raw.malaysia?.rules));
		}
	});

	it('compares big fish with a person and small fish with a hand', () => {
		expect(page('indo-pacific-sailfish')).toContain('data-size-reference="person"');
		expect(page('dwarf-rasbora')).toContain('data-size-reference="hand"');
		expect(visibleText(page('dwarf-rasbora'))).toContain('The hand is 18 cm long.');
	});

	it('maps all 16 states and marks recorded ones and spots', () => {
		const html = page('indo-pacific-sailfish');
		expect(html.match(/data-state="/g)).toHaveLength(16);
		expect(html).toMatch(/data-state="Sabah"[^>]*data-recorded/);
		expect(visibleText(html)).toContain('Kuala Rompin, Pahang');
		expect(visibleText(html)).toContain('Few records can mean few surveys, not few fish.');
	});

	it('links look-alikes to their pages', () => {
		expect(page('striped-snakehead')).toMatch(/data-section="identify"[\s\S]*href="\/fish\/giant-snakehead\/"/);
	});

	it('shows aquarium care only for aquarium fish', () => {
		for (const { id, raw } of fishFiles) {
			expect(page(id).includes('data-section="aquarium"'), id).toBe(Boolean(raw.aquarium));
		}
	});

	it('lists sources by host, with a PDF label', () => {
		const text = visibleText(page('indo-pacific-sailfish'));
		expect(text).toContain('gbif.org');
		expect(text).toContain('repository.seafdec.org.my PDF');
		expect(text).toContain('Last reviewed 13 October 2026');
	});

	it('shows the remaining photos in the gallery with credits', () => {
		const html = page('indo-pacific-sailfish');
		expect(html.match(/data-gallery-photo/g)).toHaveLength(2);
		expect(visibleText(html)).toContain('Jiro Iguchi');
	});

	it('uses only the new layout', () => {
		const html = page('striped-snakehead');
		for (const oldClass of ['class="pairs', 'class="chips', 'class="summary', 'class="badge']) {
			expect(html).not.toContain(oldClass);
		}
	});
});
