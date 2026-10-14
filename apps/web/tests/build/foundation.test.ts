import { describe, expect, it } from 'vitest';
import { builtCss, builtPage } from './helpers';

describe('foundation', () => {
	it('serves both fonts from this site, not from Google', () => {
		const html = builtPage('index.html');
		expect(html).toContain('--astro-font-bricolage');
		expect(html).toContain('--astro-font-marker');
		expect(html).toMatch(/<link rel="preload" href="\/[^"]+\.woff2" as="font"/);
		expect(html).not.toContain('fonts.googleapis.com');
		expect(html).not.toContain('fonts.gstatic.com');
	});

	it('ships the design tokens and the reduced-motion rule', () => {
		const css = builtCss();
		expect(css).toContain('--color-ink:#1a1a1a');
		expect(css).toContain('--color-sign-red:#c8102e');
		expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
	});
});
