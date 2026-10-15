import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { builtPage } from './helpers';

describe('photos', () => {
	it('does not publish the original photo files', () => {
		expect(existsSync(new URL('../../dist/photos/', import.meta.url))).toBe(false);
	});

	it('serves resized AVIF and WebP versions', () => {
		const html = builtPage('fish/indo-pacific-sailfish/index.html');
		expect(html).toMatch(/<source[^>]+type="image\/avif"/);
		expect(html).toMatch(/<source[^>]+type="image\/webp"/);
		expect(html).not.toContain('src="/photos/');
	});
});
