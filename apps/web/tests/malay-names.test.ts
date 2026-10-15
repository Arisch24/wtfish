import { describe, expect, it } from 'vitest';
import { findMalayNames, type NameSet } from './helpers/malay-names';

const names: NameSet[] = [
	{ english: 'Striped snakehead', scientific: 'Channa striata', malay: 'Haruan' },
	{ english: 'Giant snakehead', scientific: 'Channa micropeltes', malay: 'Toman' },
	{ english: 'Talang queenfish', scientific: 'Scomberoides commersonnianus', malay: 'Talang', malayOther: ['Seliat'] },
	{ english: 'Nile tilapia', scientific: 'Oreochromis niloticus', malay: 'Tilapia' },
];

describe('findMalayNames', () => {
	it('finds Malay names in any case', () => {
		expect(findMalayNames('Haruan is an adaptable predator. Adult TOMAN is bulkier.', names)).toEqual(['haruan', 'toman']);
	});

	it('finds names from malayOther', () => {
		expect(findMalayNames('Also sold as seliat.', names)).toEqual(['seliat']);
	});

	it('ignores Malay words inside English names', () => {
		expect(findMalayNames('The Talang queenfish hunts near reefs.', names)).toEqual([]);
	});

	it('ignores Malay names that are also English words', () => {
		expect(findMalayNames('Tilapia farms are common.', names)).toEqual([]);
	});

	it('matches whole words only', () => {
		expect(findMalayNames('Romantic shorelines.', names)).toEqual([]);
	});
});
