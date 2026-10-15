import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Fish } from '../../src/lib/fish-schema';

const dist = new URL('../../dist/', import.meta.url);

/** Raw HTML of a built page, e.g. builtPage('fish/barramundi/index.html'). */
export function builtPage(path: string): string {
	const url = new URL(path, dist);
	if (!existsSync(url)) throw new Error(`dist/${path} is missing. Run pnpm test:build, which builds first.`);
	return readFileSync(url, 'utf8');
}

/** Every stylesheet Astro emitted, plus styles inlined into the home page. */
export function builtCss(): string {
	const dir = new URL('_astro/', dist);
	const files = readdirSync(dir).filter((file) => file.endsWith('.css'));
	const inline = [...builtPage('index.html').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	return [...files.map((file) => readFileSync(new URL(file, dir), 'utf8')), ...inline].join('\n');
}

/** Every built .html file, as a path relative to dist/. */
export function allBuiltPages(): string[] {
	const pages: string[] = [];
	const walk = (dir: URL, prefix: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) walk(new URL(`${entry.name}/`, dir), `${prefix}${entry.name}/`);
			else if (entry.name.endsWith('.html')) pages.push(`${prefix}${entry.name}`);
		}
	};
	walk(dist, '');
	return pages;
}

/** Whether a site address, such as "/habitat/reefs/" or "/favicon.svg", was built. */
export function isBuilt(href: string): boolean {
	return existsSync(new URL(`.${href.endsWith('/') ? `${href}index.html` : href}`, dist));
}

/** Text a visitor can read: no tags, attributes, scripts or styles. */
export function visibleText(html: string): string {
	return html
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();
}

const dataDir = new URL('../../data/fish/', import.meta.url);

/** Every fish data file, parsed. */
export const fishFiles: { id: string; raw: Fish }[] = readdirSync(dataDir)
	.filter((file) => file.endsWith('.json'))
	.map((file) => ({ id: file.slice(0, -'.json'.length), raw: JSON.parse(readFileSync(new URL(file, dataDir), 'utf8')) }));

/** Each fish card's HTML on the home page, keyed by fish id, in page order. */
export function cardsById(html: string): Map<string, string> {
	const cards = new Map<string, string>();
	for (const chunk of html.split('<li data-fish-card').slice(1)) {
		const id = chunk.match(/href="\/fish\/([a-z0-9-]+)\/"/)?.[1];
		if (id) cards.set(id, chunk.slice(0, chunk.indexOf('</li>')));
	}
	return cards;
}
