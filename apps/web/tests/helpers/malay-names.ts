export interface NameSet {
	english: string;
	scientific: string;
	malay?: string;
	other?: string[];
	malayOther?: string[];
}

/** Malay fish names that are also ordinary English words. */
export const ENGLISH_WORD_ALLOWLIST: readonly string[] = ['tilapia', 'pacu'];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Malay fish names (any fish's `malay` or `malayOther`) found in `text` as whole
 * words. Parts of English or scientific names, such as "talang" in "Talang
 * queenfish", don't count.
 */
export function findMalayNames(text: string, all: NameSet[]): string[] {
	const english = all
		.flatMap((names) => [names.english, names.scientific, ...(names.other ?? [])])
		.map((name) => name.toLowerCase())
		.sort((a, b) => b.length - a.length);
	let rest = text.toLowerCase();
	for (const name of english) rest = rest.split(name).join(' ');

	const terms = new Set<string>();
	for (const names of all) {
		for (const term of [names.malay, ...(names.malayOther ?? [])]) {
			if (term && !ENGLISH_WORD_ALLOWLIST.includes(term.toLowerCase())) terms.add(term.toLowerCase());
		}
	}
	return [...terms].filter((term) => new RegExp(`(^|[^\\p{L}])${escape(term)}([^\\p{L}]|$)`, 'u').test(rest));
}
