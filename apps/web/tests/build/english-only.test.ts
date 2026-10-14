import { describe, expect, it } from 'vitest';
import { findMalayNames, type NameSet } from '../helpers/malay-names';
import { allBuiltPages, builtPage, fishFiles, visibleText } from './helpers';

const allNames: NameSet[] = fishFiles.map((fish) => fish.raw.names);

describe('English-only site', () => {
	it.each(allBuiltPages())('%s shows no Malay fish names', (path) => {
		expect(findMalayNames(visibleText(builtPage(path)), allNames)).toEqual([]);
	});

	it.each(allBuiltPages())('%s has no Malay UI words', (path) => {
		expect(visibleText(builtPage(path))).not.toMatch(/\b(air tawar|air payau|laut|ikan apa)\b/i);
	});
});
