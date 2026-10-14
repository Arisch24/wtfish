import { describe, expect, it } from 'vitest';
import { ICONS } from '../src/lib/icons';

describe('ICONS', () => {
	it.each(Object.entries(ICONS))('%s has a viewBox and a body', (_name, icon) => {
		expect(icon.viewBox).toMatch(/^0 0 \d+ \d+$/);
		expect(icon.body).toMatch(/^<(path|circle|g)/);
		expect(icon.body).not.toMatch(/<script|on\w+=/i);
	});
});
