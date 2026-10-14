import { Checkbox } from '@base-ui/react/checkbox';
import { Input } from '@base-ui/react/input';
import { Select } from '@base-ui/react/select';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { useEffect, useRef, useState } from 'react';
import type { FilterItem, FilterQuery } from '../lib/filter';
import { applyFilter, type FilterCard } from '../lib/filter-dom';
import type { State, Use, Water } from '../lib/fish-schema';
import { ICONS, type IconName } from '../lib/icons';
import { USE_SHORT_LABEL, WATER_LABEL } from '../lib/labels';

// Take the option lists from labels.ts. Importing values from fish-schema.ts would
// pull zod into the browser bundle.
const WATERS = Object.keys(WATER_LABEL) as Water[];
const USE_OPTIONS = Object.keys(USE_SHORT_LABEL) as Use[];

interface Props {
	/** States that at least one fish has a record for, in display order. */
	states: State[];
	/** Number of fish cards on the page. */
	total: number;
}

interface Option {
	value: string | null;
	label: string;
}

const EMPTY: FilterQuery = { text: '', water: '', use: '', state: '', status: '', threatened: false };
const ALL = 'all';
const WATER_ICON: Record<Water, IconName> = { freshwater: 'drop', brackish: 'brackish', marine: 'wave' };
const STATUS_OPTIONS: Option[] = [
	{ value: null, label: 'Anywhere' },
	{ value: 'any', label: 'Found in Malaysia' },
	{ value: 'native', label: 'Native' },
	{ value: 'endemic', label: 'Endemic' },
	{ value: 'introduced', label: 'Introduced' },
	{ value: 'invasive', label: 'Invasive' },
];

const pill =
	'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border-2 border-ink bg-white px-3 py-1 text-sm font-bold data-pressed:bg-ink data-pressed:text-sign-yellow';
const groupLabel = 'text-xs font-bold text-muted';

function Icon({ name, className }: { name: IconName; className?: string }) {
	const icon = ICONS[name];
	return (
		<svg
			viewBox={icon.viewBox}
			className={className}
			aria-hidden="true"
			focusable="false"
			dangerouslySetInnerHTML={{ __html: icon.body }}
		/>
	);
}

function CheckMark() {
	return (
		<svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
			<path d="m2.5 8.5 4 4 7-9" />
		</svg>
	);
}

function FilterSelect({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: Option[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Select.Root
			items={options}
			value={value === '' ? null : value}
			onValueChange={(next) => onChange(typeof next === 'string' ? next : '')}
		>
			<div className="flex flex-col gap-1">
				<Select.Label className={groupLabel}>{label}</Select.Label>
				<Select.Trigger className="inline-flex min-w-44 items-center justify-between gap-2 rounded-md border-2 border-ink bg-white px-3 py-1.5 text-sm font-bold">
					<Select.Value />
					<Select.Icon aria-hidden="true">
						<svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="m4 6 4 4 4-4" />
						</svg>
					</Select.Icon>
				</Select.Trigger>
			</div>
			<Select.Portal>
				<Select.Positioner sideOffset={4} className="z-20 outline-none">
					<Select.Popup className="ink-card max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto py-1 shadow-hard-sm outline-none">
						<Select.List>
							{options.map((option) => (
								<Select.Item
									key={option.label}
									value={option.value}
									className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 px-3 py-1.5 text-sm outline-none select-none data-highlighted:bg-ink data-highlighted:text-sign-yellow"
								>
									<Select.ItemIndicator className="col-start-1">
										<CheckMark />
									</Select.ItemIndicator>
									<Select.ItemText className="col-start-2">{option.label}</Select.ItemText>
								</Select.Item>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}

/** Search and filters for the server-rendered fish cards. Without JavaScript, every card stays visible. */
export default function FilterBar({ states, total }: Props) {
	const [query, setQuery] = useState<FilterQuery>(EMPTY);
	const [shown, setShown] = useState(total);
	const cards = useRef<FilterCard[]>([]);

	useEffect(() => {
		cards.current = [...document.querySelectorAll<HTMLElement>('[data-fish-card]')].map((el) => ({
			el,
			item: JSON.parse(el.dataset.filter ?? '{}') as FilterItem,
		}));
		const clear = document.getElementById('clear-filters');
		const reset = () => setQuery(EMPTY);
		clear?.addEventListener('click', reset);
		return () => clear?.removeEventListener('click', reset);
	}, []);

	useEffect(() => {
		const count = applyFilter(cards.current, query);
		setShown(count);
		const empty = document.getElementById('empty');
		if (empty) empty.hidden = count > 0;
	}, [query]);

	const set = <K extends keyof FilterQuery>(key: K, value: FilterQuery[K]) =>
		setQuery((current) => ({ ...current, [key]: value }));
	const stateOptions: Option[] = [{ value: null, label: 'Any state' }, ...states.map((state) => ({ value: state, label: state }))];

	return (
		<div className="grid gap-3" data-filter-bar>
			<Input
				type="search"
				value={query.text}
				onValueChange={(text) => set('text', text)}
				placeholder="Search by name or scientific name…"
				aria-label="Search fish"
				className="w-full rounded-lg border-[3px] border-ink bg-white px-3.5 py-2.5 text-[15px] placeholder:text-muted"
			/>
			{/* Stacked on phones; from 768px the groups wrap side by side. */}
			<div className="grid gap-3 md:flex md:flex-wrap md:items-end md:gap-x-6">
				<div className="grid gap-1">
					<span className={groupLabel} aria-hidden="true">
						Water
					</span>
					<ToggleGroup
						aria-label="Water"
						value={[query.water || ALL]}
						onValueChange={(next) => set('water', next[0] && next[0] !== ALL ? next[0] : '')}
						className="flex gap-1.5 overflow-x-auto pb-1"
					>
						<Toggle value={ALL} className={pill}>
							All
						</Toggle>
						{WATERS.map((water) => (
							<Toggle key={water} value={water} className={pill}>
								<Icon name={WATER_ICON[water]} className="size-4" />
								{WATER_LABEL[water]}
							</Toggle>
						))}
					</ToggleGroup>
				</div>
				<div className="grid gap-1">
					<span className={groupLabel} aria-hidden="true">
						Use
					</span>
					<ToggleGroup
						aria-label="Use"
						value={[query.use || ALL]}
						onValueChange={(next) => set('use', next[0] && next[0] !== ALL ? next[0] : '')}
						className="flex gap-1.5 overflow-x-auto pb-1"
					>
						<Toggle value={ALL} className={pill}>
							All
						</Toggle>
						{USE_OPTIONS.map((use) => (
							<Toggle key={use} value={use} className={pill}>
								{USE_SHORT_LABEL[use]}
							</Toggle>
						))}
					</ToggleGroup>
				</div>
				<div className="flex flex-wrap items-end gap-3">
					<FilterSelect label="In Malaysia" options={STATUS_OPTIONS} value={query.status} onChange={(v) => set('status', v)} />
					{states.length > 0 && (
						<FilterSelect label="State" options={stateOptions} value={query.state} onChange={(v) => set('state', v)} />
					)}
					<label className="flex min-h-9 items-center gap-2 text-sm font-bold">
						<Checkbox.Root
							checked={query.threatened}
							onCheckedChange={(checked) => set('threatened', checked)}
							className="flex size-5 items-center justify-center rounded border-2 border-ink bg-white data-checked:bg-ink data-checked:text-sign-yellow"
						>
							<Checkbox.Indicator className="flex data-unchecked:hidden">
								<CheckMark />
							</Checkbox.Indicator>
						</Checkbox.Root>
						Threatened only
					</label>
				</div>
			</div>
			<p aria-live="polite" className="text-sm font-bold text-muted">{`${shown} fish`}</p>
		</div>
	);
}
