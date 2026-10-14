import { describe, expect, it } from 'vitest';
import { sourceLabel } from '../src/lib/sources';

describe('sourceLabel', () => {
	it('shows the host without "www."', () => {
		expect(sourceLabel('https://www.gbif.org/species/5211984')).toEqual({ host: 'gbif.org', pdf: false });
	});

	it('keeps other subdomains', () => {
		expect(sourceLabel('https://repository.seafdec.org.my/bitstream/x.pdf')).toEqual({
			host: 'repository.seafdec.org.my',
			pdf: true,
		});
	});

	it('detects a PDF even with a query string or capitals', () => {
		expect(sourceLabel('https://example.org/Guide.PDF?isAllowed=y&sequence=1').pdf).toBe(true);
	});

	it('does not call a page a PDF because "pdf" appears elsewhere', () => {
		expect(sourceLabel('https://example.org/pdf-guides/page').pdf).toBe(false);
	});
});
