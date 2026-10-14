import { describe, expect, it } from 'vitest';
import { ICONS } from '../src/lib/icons';

describe('ICONS', () => {
	it('draws the fish at least five times as long as it is tall', () => {
		// "How big?" scales the fish by length; a chunky outline makes big fish look like whales.
		const [, , width, height] = ICONS.fish.viewBox.split(' ').map(Number);
		expect(width / height).toBeGreaterThanOrEqual(5);
	});

	it.each(Object.entries(ICONS))('%s has a viewBox and a body', (_name, icon) => {
		expect(icon.viewBox).toMatch(/^0 0 \d+ \d+$/);
		expect(icon.body).toMatch(/^<(path|circle|g)/);
		expect(icon.body).not.toMatch(/<script|on\w+=/i);
	});
});
