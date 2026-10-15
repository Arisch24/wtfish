import { describe, expect, it } from 'vitest';
import { builtPage, fishFiles, visibleText } from './helpers';
import {
	INTRODUCED_PATH,
	THREATENED_PATH,
	habitatPath,
	iucnPath,
	statePath,
	statusPath,
	usePath,
	waterPath,
} from '../../src/lib/categories';
import { formatDate, listOf } from '../../src/lib/format';
import { ENVIRONMENT_LABEL, USE_SHORT_LABEL, WATER_LABEL } from '../../src/lib/labels';

const page = (id: string) => builtPage(`fish/${id}/index.html`);

describe('fish pages', () => {
	it('draws fish pages in the quiet style', () => {
		for (const id of ['indo-pacific-sailfish', 'striped-snakehead', 'giant-featherback', 'dwarf-rasbora']) {
			expect(page(id), id).not.toMatch(/ink-card|border-ink|shadow-hard|font-extrabold/);
		}
	});

	it('gives the size once above the chart and names the reference in its caption', () => {
		const text = visibleText(page('indo-pacific-sailfish'));
		expect(text).toContain('Up to 350 cm and 100 kg.');
		expect(text).toContain('The person is 170 cm tall.');
		expect(text.split('Up to 350 cm').length - 1).toBe(1);
	});

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

	it('reminds readers once to check with the Fisheries Office, with one date', () => {
		for (const id of ['asian-arowana', 'hemibagrus-wyckioides', 'julliens-golden-carp']) {
			const text = visibleText(page(id));
			expect(text.match(/Fisheries Office/g), id).toHaveLength(1);
			expect(text.match(/checked \d/gi), id).toHaveLength(1);
		}
	});

	it('compares big fish with a person and small fish with a hand', () => {
		expect(page('indo-pacific-sailfish')).toContain('data-size-reference="person"');
		expect(page('dwarf-rasbora')).toContain('data-size-reference="hand"');
		expect(visibleText(page('dwarf-rasbora'))).toContain('The hand is 18 cm long.');
	});

	it('keeps the size chart at its paired width, even alone in its row', () => {
		// 532px is one column of a pair: the 1104px content width minus the 40px gap, halved.
		// The neon tetra has no Malaysian records, so "How big?" has its row to itself.
		expect(page('neon-tetra')).toContain('data-row="how-big"');
		for (const id of ['neon-tetra', 'indo-pacific-sailfish']) {
			expect(page(id), id).toMatch(/<figure class="max-w-\[532px\]" data-size-reference=/);
		}
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

	it('writes the pH label as "pH", not in capitals', () => {
		const html = page('cardinal-tetra');
		expect(html).toMatch(/<dt class="(?![^"]*uppercase)[^"]*">\s*pH\s*<\/dt>/);
		// The other stat labels stay in capitals.
		expect(html).toMatch(/<dt class="[^"]*uppercase[^"]*">\s*Temperature\s*<\/dt>/);
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

	it.each(fishFiles)('$id links each water, use, habitat and state to its own page', ({ id, raw }) => {
		const html = page(id);
		const links: [href: string, text: string][] = [
			...raw.water.map((water): [string, string] => [waterPath(water), WATER_LABEL[water]]),
			...raw.uses.map((use): [string, string] => [usePath(use), USE_SHORT_LABEL[use]]),
			...(raw.habitat?.environments ?? []).map((environment): [string, string] => [
				habitatPath(environment),
				ENVIRONMENT_LABEL[environment],
			]),
			...(raw.malaysia?.states ?? []).map(({ state }): [string, string] => [statePath(state), state]),
		];
		for (const [href, text] of links) {
			// The link's own text must name the page it leads to, so a tag can't point at the wrong page.
			const texts = [...html.matchAll(new RegExp(`<a href="${href}"[^>]*>([\\s\\S]*?)</a>`, 'g'))].map((match) =>
				visibleText(match[1]),
			);
			expect(texts, href).toContain(text);
		}
	});

	it.each(fishFiles)('$id links its status and IUCN badges only when they have a page', ({ id, raw }) => {
		const html = page(id);
		expect(html.includes(`href="${INTRODUCED_PATH}"`)).toBe(Boolean(raw.malaysia && statusPath(raw.malaysia.status)));
		expect(html.includes(`href="${THREATENED_PATH}"`)).toBe(Boolean(raw.iucn && iucnPath(raw.iucn)));
	});

	it('turns tags with a page into links, and leaves the rest as plain text', () => {
		const html = page('barramundi');
		expect(html).toMatch(/<a href="\/water\/saltwater\/"[^>]*data-water="marine"/);
		expect(html).toMatch(/<a href="\/habitat\/mangroves\/"[^>]*>\s*Mangroves\s*<\/a>/);
		expect(visibleText(html)).toContain('Sport · Food');
		// "Native to Malaysia" and "Least Concern" have no page, so they stay plain text.
		expect(html).toMatch(/<span[^>]*>\s*Native to Malaysia\s*<\/span>/);
		expect(html).toMatch(/<span[^>]*>\s*Least Concern \(IUCN\)\s*<\/span>/);
	});

	it('links the threatened and invasive badges', () => {
		expect(page('asian-arowana')).toMatch(/<a href="\/threatened\/"[^>]*>\s*Endangered \(IUCN\)\s*<\/a>/);
		expect(page('butterfly-peacock-bass')).toMatch(/<a href="\/malaysia\/invasive\/"[^>]*>\s*Invasive in Malaysia\s*<\/a>/);
	});

	it('links each state name in "Recorded in", keeping the sentence', () => {
		const pomfret = fishFiles.find((fish) => fish.id === 'black-pomfret')!.raw;
		const states = pomfret.malaysia!.states!.map((record) => record.state);
		const sentence = page('black-pomfret').match(/Recorded in[\s\S]*?\. Based on/)![0];
		for (const state of states) {
			expect(sentence).toMatch(new RegExp(`<a href="${statePath(state)}"[^>]*>${state}</a>`));
		}
		expect(sentence.replace(/<[^>]+>/g, '')).toBe(`Recorded in ${listOf(states)}. Based on`);
	});
});
