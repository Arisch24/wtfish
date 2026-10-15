import { describe, expect, it } from 'vitest';
import { builtPage, visibleText } from './helpers';

const pages = [
	'index.html',
	'identify/index.html',
	'about/index.html',
	'404.html',
	'browse/index.html',
	'habitat/mangroves/index.html',
	'malaysia/sabah/index.html',
	'threatened/index.html',
];

describe('site shell', () => {
	it.each(pages)('%s has the header, links and footer', (path) => {
		const html = builtPage(path);
		expect(html).toContain('aria-label="wtfish home"');
		expect(html).toContain('href="/identify/"');
		expect(html).toContain('href="/about/"');
		expect(visibleText(html)).toContain('Every fact links to its source.');
	});

	it('marks the current page in the header', () => {
		expect(builtPage('identify/index.html')).toMatch(/<a href="\/identify\/"[^>]*aria-current="page"/);
		expect(builtPage('about/index.html')).toMatch(/<a href="\/about\/"[^>]*aria-current="page"/);
		expect(builtPage('index.html')).toMatch(/<a href="\/"[^>]*aria-current="page"/);
	});

	it('keeps the header and footer quiet, with red only in the logo', () => {
		const html = builtPage('index.html');
		const header = html.match(/<header[\s\S]*?<\/header>/)![0];
		const footer = html.match(/<footer[\s\S]*?<\/footer>/)![0];
		for (const part of [header, footer]) {
			expect(part).not.toContain('bg-sign-red');
			expect(part).not.toContain('border-ink');
			expect(part).toContain('text-sign-red');
		}
	});

	it('uses the hook favicon and no .ico', () => {
		const html = builtPage('index.html');
		expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
		expect(html).toContain('href="/apple-touch-icon.png"');
		expect(html).not.toContain('favicon.ico');
	});

	it('shows the coming-soon and not-found messages', () => {
		expect(visibleText(builtPage('identify/index.html'))).toContain('Identify is coming soon');
		expect(visibleText(builtPage('about/index.html'))).toContain('About is coming soon');
		expect(visibleText(builtPage('404.html'))).toContain('This page swam off.');
		expect(builtPage('404.html')).toContain('href="/"');
	});

	it('labels the coming-soon and not-found pages in the quiet style', () => {
		expect(visibleText(builtPage('identify/index.html'))).toContain('Coming soon');
		expect(visibleText(builtPage('about/index.html'))).toContain('Coming soon');
		expect(visibleText(builtPage('404.html'))).toContain('Not found');
		for (const path of ['identify/index.html', 'about/index.html', '404.html']) {
			expect(builtPage(path), path).not.toMatch(/ink-card|border-ink|shadow-hard|font-extrabold/);
		}
	});
});
