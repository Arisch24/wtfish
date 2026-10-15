import { matches, type FilterItem, type FilterQuery } from './filter';

/** A server-rendered fish card: anything with a `hidden` flag (an HTMLElement in the browser). */
export interface FilterCard {
	el: { hidden: boolean };
	item: FilterItem;
}

/** Hides cards that don't match `query`, shows the rest, and returns how many are shown. */
export function applyFilter(cards: FilterCard[], query: FilterQuery): number {
	let shown = 0;
	for (const card of cards) {
		const ok = matches(card.item, query);
		card.el.hidden = !ok;
		if (ok) shown++;
	}
	return shown;
}
