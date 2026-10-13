# Wet-Market Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `apps/web` fish directory into the agreed "wet market" design, with an English-only site, resized photos and a Base UI filter island.

**Architecture:** Styling moves to Tailwind v4, with design tokens in one `global.css`. Small single-purpose Astro components render the pages as static HTML. The only client-side code is one React island, `FilterBar.tsx`, built from Base UI. It shows and hides server-rendered fish cards using the existing `matches()` logic. Photos move to `data/photos/` and are resized by sharp through Astro's `<Picture>`. Pure helpers in `src/lib/` carry all logic worth testing. Built pages are checked by a second Vitest config that reads `dist/`.

**Tech Stack:** Astro 7.3 (static), Tailwind 4.3.3 via `@tailwindcss/vite`, `@astrojs/react` 7.0.1, React 19.3.0, `@base-ui/react` 1.9.0, sharp 0.35.5, the Astro fonts API (Google provider, self-hosted), Vitest 5.0.2, pnpm, Node ≥ 22.23.

**Spec:** `docs/superpowers/specs/2026-10-14-wet-market-redesign-design.md`. Read it before starting. The browser mockups it mentions are local-only (`.superpowers/`, gitignored); the spec is the source of truth.

## Global Constraints

- **Branch.** Work on branch `feat/wet-market-redesign`. It is stacked on `feat/malaysia-fish-profiles` (not yet in `main`). Never merge, rebase or push without the user's approval.
- **Tooling.** Use pnpm only. Run commands from `apps/web/` unless a step says "from the repo root".
- **Commits.**
  - Use Conventional Commits; the husky `commit-msg` hook enforces this. Never use `--no-verify`.
  - Add any attribution trailers your session requires.
- **Dependencies.**
  - Pin exact versions (`pnpm add -E`): `tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3, `@astrojs/react` 7.0.1, `react` 19.3.0, `react-dom` 19.3.0, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `@base-ui/react` 1.9.0, `sharp` 0.35.5.
  - Add no other dependencies.
  - Do not use the deprecated `@astrojs/tailwind`, shadcn, or any UI kit.
- **English only.**
  - No Malay text in the UI, labels or rendered pages.
  - `names.malay` and `names.malayOther` stay in the data but are never rendered or searched.
- **Theme and motion.**
  - Light theme only. No `dark:` variants and no `prefers-color-scheme` rules.
  - Every animation and transition must stop under `prefers-reduced-motion: reduce`.
  - Every text and background colour pair must meet WCAG AA (4.5:1, or 3:1 for large text).
- **Water labels.** Use the existing `WATER_LABEL` text: Freshwater, Brackish, Saltwater.
- **Styling.**
  - Style with Tailwind classes, using the tokens in `src/styles/global.css`.
  - By the end, no `.astro` file may contain a `<style>` block.
- **Data and photos.**
  - Never edit photo files.
  - Data edits are limited to the exact changes listed in Task 4. Do not change facts.
- **Copy.** Use the copy text exactly as the spec and this plan give it.

## Review Focus

These are the five inputs most likely to break the site for a real person. No task's main tests cover them, so each one has a test pinned in the task that owns it.

1. **Apostrophes in names.** Searching "julliens" or "johns" should find *Jullien's golden carp* and *John's snapper*. Pinned in Task 4, Step 1 (`filter.test.ts`) and checked by hand in Task 8, Step 8.
2. **A fish bigger than the size table.** A future 18 m whale shark (`maxCm: 1800`) must get a sensible scale, not a crash or `undefined`. Pinned in Task 2, Step 1 (`size.test.ts`, the 1500 and 1800 cases).
3. **A fish living in several waters.** Barramundi is freshwater, brackish and saltwater. Its card shows all three labels, and each water filter finds it. Pinned in Task 7, Step 1 (`home.test.ts`) and Task 8, Step 1 (`filter-dom.test.ts`).
4. **JavaScript off, or the island not yet loaded.** All fish must be visible, the count must show the total, and the "no fish match" message must be hidden. Pinned in Task 8, Step 1 (`filters.test.ts`).
5. **Long names on a 390 px phone.** For example *Narrow-barred Spanish mackerel* and *Brown-marbled grouper*. The title must wrap inside the card and nothing may cover it. Pinned in Task 7, Step 8 (manual check at 390 px).

---

### Task 1: Tailwind, React, Base UI, sharp and fonts

**Files:**
- Modify: `apps/web/package.json` (dependencies, `test:build` script)
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/web/astro.config.mjs`
- Create: `apps/web/src/styles/global.css`
- Modify: `apps/web/src/layouts/Base.astro` (import CSS, add `<Font>`)
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.build.config.ts`
- Create: `apps/web/tests/contrast.test.ts`
- Create: `apps/web/tests/build/helpers.ts`
- Create: `apps/web/tests/build/foundation.test.ts`

**Interfaces:**
- **Consumes:** nothing new.
- **Produces:**
  - **Tailwind theme tokens.** Used by every later task:
    - colours `ink`, `muted`, `sign-red`, `sign-yellow`, `cardboard`, `tile`, `grout`, `fresh`, `brackish`, `salt`, `alert`;
    - fonts `font-sans` (Bricolage) and `font-marker` (Permanent Marker);
    - shadows `shadow-hard`, `shadow-hard-sm`, `shadow-board`;
    - animations `animate-sway`, `animate-rise`, `animate-swim`, `animate-bob`;
    - utilities `ink-card` and `cardboard`.
  - **Scripts.** `pnpm test` runs the unit tests only. `pnpm test:build` builds the site, then runs `tests/build/**/*.test.ts`.
  - **`tests/build/helpers.ts`:**
    - `builtPage(path: string): string`
    - `builtCss(): string`
    - `visibleText(html: string): string`
    - `fishFiles: { id: string; raw: Fish }[]`
    - `allBuiltPages(): string[]` (paths relative to `dist/`)

- [ ] **Step 0: Check the branch and the baseline**

Run from the repo root:

```bash
git switch feat/wet-market-redesign
git status --short
git log --oneline -3
```

Expected:
- `git status` shows no modified tracked files. An untracked `.impeccable/` is fine.
- The log shows `docs: add wet-market redesign plan` on top of `af7b85d docs: add wet-market redesign design`.

If not, stop and ask the user.

Then run:

```bash
cd apps/web && pnpm test && pnpm build
```

Expected: all tests pass and the build succeeds. Note how long the build takes, because later builds also resize photos.

- [ ] **Step 1: Install the new packages**

```bash
pnpm add -E @astrojs/react@7.0.1 react@19.3.0 react-dom@19.3.0 @base-ui/react@1.9.0 sharp@0.35.5 tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
pnpm add -E -D @types/react@19.3.0 @types/react-dom@19.3.0
```

Expected:
- Both commands succeed.
- `@base-ui/react` lists `date-fns` and `@date-fns/tz` as optional peers, and `@astrojs/react` lists `oxc-transform-react` as optional. Do not install those.
- If pnpm reports a **missing required** peer dependency, stop and report it.

- [ ] **Step 2: Let TypeScript compile React components**

Replace `tsconfig.json` with:

```json
{
	"extends": "astro/tsconfigs/strict",
	"include": [".astro/types.d.ts", "**/*"],
	"exclude": ["dist"],
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "react"
	}
}
```

- [ ] **Step 3: Register React, Tailwind and the fonts**

Replace `astro.config.mjs` with:

```js
// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	vite: { plugins: [tailwindcss()] },
	// Downloaded at build time and served from this site; visitors never contact Google.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Bricolage Grotesque',
			cssVariable: '--astro-font-bricolage',
			weights: ['400 800'],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Permanent Marker',
			cssVariable: '--astro-font-marker',
			weights: [400],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['cursive'],
		},
	],
});
```

- [ ] **Step 4: Write the failing contrast test**

Create `tests/contrast.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

function token(name: string): string {
	const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6});`));
	if (!match) throw new Error(`--color-${name} is not defined in global.css`);
	return match[1];
}

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5]
		.map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

const white = '#ffffff';
// [where it is used, text colour, background colour, WCAG AA minimum]
const pairs: [string, string, string, number][] = [
	['body text on tiles', token('ink'), token('tile'), 4.5],
	['body text on cards', token('ink'), white, 4.5],
	['secondary text on cards', token('muted'), white, 4.5],
	['secondary text on tiles', token('muted'), token('tile'), 4.5],
	['tag text on cardboard', token('ink'), token('cardboard'), 4.5],
	['notice text on yellow', token('ink'), token('sign-yellow'), 4.5],
	['header links on red', white, token('sign-red'), 4.5],
	['logo "wt" on red (large text)', token('sign-yellow'), token('sign-red'), 3],
	['pressed pill text', token('sign-yellow'), token('ink'), 4.5],
	['freshwater label', white, token('fresh'), 4.5],
	['brackish label', white, token('brackish'), 4.5],
	['saltwater label and recorded states', white, token('salt'), 4.5],
	['links on cards', token('salt'), white, 4.5],
	['sizes and threatened codes on cards', token('alert'), white, 4.5],
	['sizes on tiles', token('alert'), token('tile'), 4.5],
];

describe('colour contrast (WCAG AA)', () => {
	it.each(pairs)('%s', (_where, text, background, minimum) => {
		expect(contrast(text, background)).toBeGreaterThanOrEqual(minimum);
	});
});
```

- [ ] **Step 5: Run it to see it fail**

Run: `pnpm vitest run tests/contrast.test.ts`

Expected: FAIL with `ENOENT` for `src/styles/global.css`.

- [ ] **Step 6: Create the design tokens and base styles**

Create `src/styles/global.css`:

```css
@import 'tailwindcss';

/* `static` emits every variable, including ones only used in style attributes. */
@theme static {
	--color-ink: #1a1a1a;
	--color-muted: #555555;
	--color-sign-red: #c8102e;
	--color-sign-yellow: #ffd23f;
	--color-cardboard: #e2c391;
	--color-tile: #f6f8f8;
	--color-grout: #dde5e8;
	--color-fresh: #1d7a4a;
	--color-brackish: #0e6b6b;
	--color-salt: #1559a0;
	--color-alert: #b00d28;

	/* Astro's <Font> defines the --astro-font-* variables. */
	--font-sans: var(--astro-font-bricolage), ui-sans-serif, system-ui, sans-serif;
	--font-marker: var(--astro-font-marker), cursive;

	--shadow-hard: 5px 5px 0 var(--color-ink);
	--shadow-hard-sm: 3px 3px 0 var(--color-ink);
	--shadow-board: 2px 3px 0 rgb(0 0 0 / 0.2);

	--animate-sway: sway 3.2s ease-in-out infinite alternate;
	--animate-rise: rise 5s ease-in infinite;
	--animate-swim: swim 16s linear infinite;
	--animate-bob: bob 1.6s ease-in-out infinite alternate;

	@keyframes sway {
		from {
			transform: rotate(-4deg);
		}
		to {
			transform: rotate(3deg);
		}
	}
	@keyframes rise {
		0% {
			transform: translate(0, 0);
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		100% {
			transform: translate(8px, -190px);
			opacity: 0;
		}
	}
	@keyframes swim {
		from {
			left: -80px;
		}
		to {
			left: 100%;
		}
	}
	@keyframes bob {
		from {
			transform: translateY(-4px);
		}
		to {
			transform: translateY(4px);
		}
	}
}

@layer base {
	body {
		background-color: var(--color-tile);
		background-image:
			linear-gradient(var(--color-grout) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-grout) 1px, transparent 1px);
		background-size: 30px 30px;
		color: var(--color-ink);
	}

	[hidden] {
		display: none !important;
	}

	/* A yellow ring inside an ink ring. */
	:focus-visible {
		outline: 3px solid var(--color-ink);
		outline-offset: 2px;
		box-shadow: 0 0 0 2px var(--color-sign-yellow);
	}

	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation: none !important;
			transition: none !important;
		}
	}
}

@utility ink-card {
	background-color: #fff;
	border: 2px solid var(--color-ink);
	border-radius: 10px;
}

@utility cardboard {
	background-color: var(--color-cardboard);
	color: var(--color-ink);
	font-family: var(--font-marker);
	box-shadow: var(--shadow-board);
}
```

- [ ] **Step 7: Run the contrast test to see it pass**

Run: `pnpm vitest run tests/contrast.test.ts`

Expected: PASS, 15 tests.

- [ ] **Step 8: Split unit tests from build tests**

Create `vitest.config.ts`:

```ts
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// Build checks read dist/ and run via `pnpm test:build`.
		exclude: [...configDefaults.exclude, 'tests/build/**'],
	},
});
```

Create `vitest.build.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/build/**/*.test.ts'],
	},
});
```

In `package.json` `scripts`, add after `"test": "vitest run",`:

```json
		"test:build": "astro build && vitest run --config vitest.build.config.ts",
```

- [ ] **Step 9: Write the build-test helpers**

Create `tests/build/helpers.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Fish } from '../../src/lib/fish-schema';

const dist = new URL('../../dist/', import.meta.url);

/** Raw HTML of a built page, e.g. builtPage('fish/barramundi/index.html'). */
export function builtPage(path: string): string {
	const url = new URL(path, dist);
	if (!existsSync(url)) throw new Error(`dist/${path} is missing. Run pnpm test:build, which builds first.`);
	return readFileSync(url, 'utf8');
}

/** Every stylesheet Astro emitted, plus styles inlined into the home page. */
export function builtCss(): string {
	const dir = new URL('_astro/', dist);
	const files = readdirSync(dir).filter((file) => file.endsWith('.css'));
	const inline = [...builtPage('index.html').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	return [...files.map((file) => readFileSync(new URL(file, dir), 'utf8')), ...inline].join('\n');
}

/** Every built .html file, as a path relative to dist/. */
export function allBuiltPages(): string[] {
	const pages: string[] = [];
	const walk = (dir: URL, prefix: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) walk(new URL(`${entry.name}/`, dir), `${prefix}${entry.name}/`);
			else if (entry.name.endsWith('.html')) pages.push(`${prefix}${entry.name}`);
		}
	};
	walk(dist, '');
	return pages;
}

/** Text a visitor can read: no tags, attributes, scripts or styles. */
export function visibleText(html: string): string {
	return html
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();
}

const dataDir = new URL('../../data/fish/', import.meta.url);

/** Every fish data file, parsed. */
export const fishFiles: { id: string; raw: Fish }[] = readdirSync(dataDir)
	.filter((file) => file.endsWith('.json'))
	.map((file) => ({ id: file.slice(0, -'.json'.length), raw: JSON.parse(readFileSync(new URL(file, dataDir), 'utf8')) }));
```

- [ ] **Step 10: Write the failing foundation build test**

Create `tests/build/foundation.test.ts`:

```ts
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
```

- [ ] **Step 11: Run it to see it fail**

Run: `pnpm test:build`

Expected: the build succeeds, then FAIL: `--astro-font-bricolage` is not in the HTML, because `Base.astro` doesn't load the fonts or CSS yet.

- [ ] **Step 12: Load the CSS and fonts in the base layout**

In `src/layouts/Base.astro`, change the frontmatter's first lines from:

```astro
---
interface Props {
```

to:

```astro
---
import { Font } from 'astro:assets';
import '../styles/global.css';

interface Props {
```

and add these two lines directly after `<meta name="generator" content={Astro.generator} />`:

```astro
		<Font cssVariable="--astro-font-bricolage" preload />
		<Font cssVariable="--astro-font-marker" />
```

Leave the rest of `Base.astro`, including its `<style is:global>`, untouched. Task 6 replaces it.

- [ ] **Step 13: Run all tests**

Run: `pnpm test:build && pnpm test`

Expected:
- `test:build` passes 2 tests.
- `pnpm test` passes every unit test, including `contrast.test.ts`.
- `pnpm test` does **not** list any `tests/build/` file.

- [ ] **Step 14: Commit**

Run from the repo root:

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml apps/web/tsconfig.json apps/web/astro.config.mjs apps/web/src/styles/global.css apps/web/src/layouts/Base.astro apps/web/vitest.config.ts apps/web/vitest.build.config.ts apps/web/tests/contrast.test.ts apps/web/tests/build
git commit -m "feat(web): add tailwind, react, base ui and self-hosted fonts"
```

---

### Task 2: Size scales

**Files:**
- Create: `apps/web/src/lib/size.ts`
- Test: `apps/web/tests/size.test.ts`

**Interfaces:**
- **Consumes:** nothing.
- **Produces:**

  ```ts
  export interface TapeTick { cm: number; label: string; /** 0–1 along the tape */ position: number }
  export const PERSON_CM = 170;
  export const HAND_CM = 18;
  export function lengthLabel(cm: number): string;            // 0 → '0', 50 → '50 cm', 150 → '1.5 m'
  export function cardTapePosition(cm: number): number;       // log scale 1 cm → 0, 500 cm → 1, clamped
  export const CARD_TAPE_TICKS: TapeTick[];                   // 1 cm, 10 cm, 1 m, 5 m
  export interface SizeComparison { reference: 'person' | 'hand'; referenceCm: number; scaleMaxCm: number; stepCm: number; ticks: TapeTick[] }
  export function sizeComparison(maxCm: number): SizeComparison;
  ```

- [ ] **Step 1: Write the failing tests**

Create `tests/size.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CARD_TAPE_TICKS, HAND_CM, PERSON_CM, cardTapePosition, lengthLabel, sizeComparison } from '../src/lib/size';

describe('lengthLabel', () => {
	it.each([
		[0, '0'],
		[5, '5 cm'],
		[50, '50 cm'],
		[100, '1 m'],
		[150, '1.5 m'],
		[500, '5 m'],
	])('%i cm is labelled %s', (cm, label) => {
		expect(lengthLabel(cm)).toBe(label);
	});
});

describe('cardTapePosition (log scale, 1 cm to 5 m)', () => {
	it('puts 1 cm at the start and 5 m at the end', () => {
		expect(cardTapePosition(1)).toBe(0);
		expect(cardTapePosition(500)).toBe(1);
	});

	it('puts 10 cm about 37% along', () => {
		expect(cardTapePosition(10)).toBeCloseTo(0.3705, 3);
	});

	it('clamps sizes outside the tape', () => {
		expect(cardTapePosition(0.4)).toBe(0);
		expect(cardTapePosition(1800)).toBe(1);
	});
});

describe('CARD_TAPE_TICKS', () => {
	it('marks 1 cm, 10 cm, 1 m and 5 m at their log positions', () => {
		expect(CARD_TAPE_TICKS.map((tick) => tick.label)).toEqual(['1 cm', '10 cm', '1 m', '5 m']);
		for (const tick of CARD_TAPE_TICKS) expect(tick.position).toBe(cardTapePosition(tick.cm));
	});
});

describe('sizeComparison', () => {
	it.each([
		[2.5, 'hand', 20, 5],
		[11, 'hand', 20, 5],
		[45, 'hand', 50, 10],
		[50, 'person', 200, 50],
		[180, 'person', 200, 50],
		[350, 'person', 400, 100],
		// Larger than the table: a future whale shark must still get a scale.
		[1500, 'person', 1500, 500],
		[1800, 'person', 2000, 500],
	])('%s cm uses a %s on a %i cm scale in %i cm steps', (maxCm, reference, scaleMaxCm, stepCm) => {
		expect(sizeComparison(maxCm)).toMatchObject({ reference, scaleMaxCm, stepCm });
	});

	it('uses a 170 cm person and an 18 cm hand', () => {
		expect(PERSON_CM).toBe(170);
		expect(HAND_CM).toBe(18);
		expect(sizeComparison(350).referenceCm).toBe(PERSON_CM);
		expect(sizeComparison(11).referenceCm).toBe(HAND_CM);
	});

	it('labels ticks in cm below 1 m and in metres from 1 m', () => {
		expect(sizeComparison(180).ticks.map((tick) => tick.label)).toEqual(['0', '50 cm', '1 m', '1.5 m', '2 m']);
	});

	it('spaces ticks evenly from 0 to 1', () => {
		expect(sizeComparison(350).ticks.map((tick) => tick.position)).toEqual([0, 0.25, 0.5, 0.75, 1]);
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run tests/size.test.ts`

Expected: FAIL. The module `../src/lib/size` cannot be resolved.

- [ ] **Step 3: Implement the helpers**

Create `src/lib/size.ts`:

```ts
export interface TapeTick {
	cm: number;
	label: string;
	/** 0–1 along the tape. */
	position: number;
}

export const PERSON_CM = 170;
export const HAND_CM = 18;

/** Below this length a fish is compared with a hand instead of a person. */
const PERSON_FROM_CM = 50;
const CARD_TAPE_MAX_CM = 500;

/** [scale maximum, tick step] in cm, smallest first. */
const SCALES: [number, number][] = [
	[10, 2],
	[20, 5],
	[50, 10],
	[100, 20],
	[200, 50],
	[300, 100],
	[400, 100],
	[500, 100],
	[600, 100],
	[800, 200],
	[1000, 200],
];

export function lengthLabel(cm: number): string {
	if (cm === 0) return '0';
	return cm < 100 ? `${cm} cm` : `${cm / 100} m`;
}

/** Where a length sits on the card tape: a log scale from 1 cm (0) to 5 m (1). */
export function cardTapePosition(cm: number): number {
	const position = Math.log10(cm) / Math.log10(CARD_TAPE_MAX_CM);
	return Math.min(1, Math.max(0, position));
}

export const CARD_TAPE_TICKS: TapeTick[] = [1, 10, 100, 500].map((cm) => ({
	cm,
	label: lengthLabel(cm),
	position: cardTapePosition(cm),
}));

export interface SizeComparison {
	reference: 'person' | 'hand';
	referenceCm: number;
	scaleMaxCm: number;
	stepCm: number;
	ticks: TapeTick[];
}

/** The linear scale and reference figure for a fish page's "How big?" section. */
export function sizeComparison(maxCm: number): SizeComparison {
	const reference = maxCm >= PERSON_FROM_CM ? 'person' : 'hand';
	const referenceCm = reference === 'person' ? PERSON_CM : HAND_CM;
	const needed = Math.max(maxCm, referenceCm);
	const [scaleMaxCm, stepCm] = SCALES.find(([max]) => max >= needed) ?? [Math.ceil(needed / 500) * 500, 500];
	const ticks: TapeTick[] = [];
	for (let cm = 0; cm <= scaleMaxCm; cm += stepCm) {
		ticks.push({ cm, label: lengthLabel(cm), position: cm / scaleMaxCm });
	}
	return { reference, referenceCm, scaleMaxCm, stepCm, ticks };
}
```

- [ ] **Step 4: Run them to see them pass**

Run: `pnpm vitest run tests/size.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/size.ts apps/web/tests/size.test.ts
git commit -m "feat(web): add size scale helpers"
```

---

### Task 3: Map, source and label helpers

**Files:**
- Create: `apps/web/src/lib/state-tiles.ts`
- Create: `apps/web/src/lib/sources.ts`
- Modify: `apps/web/src/lib/labels.ts` (append)
- Modify: `apps/web/src/lib/format.ts` (append `licenseUrl`)
- Test: `apps/web/tests/state-tiles.test.ts`, `apps/web/tests/sources.test.ts`, `apps/web/tests/labels.test.ts`, `apps/web/tests/format.test.ts`

**Interfaces:**
- **Consumes:** `STATES` and the types `State`, `Use`, `MalaysiaStatus`, `PhotoLicense` from `src/lib/fish-schema.ts`.
- **Produces:**

  ```ts
  // state-tiles.ts
  export interface StateTile { state: State; code: string; col: number; row: number; colSpan?: number; rowSpan?: number }
  export const MAP_COLUMNS = 8;
  export const MAP_ROWS = 5;
  export const STATE_TILES: readonly StateTile[];
  export function stateOfSpot(text: string): State | undefined;   // last whole-word state name in the text
  // sources.ts
  export function sourceLabel(url: string): { host: string; pdf: boolean };
  // labels.ts
  export const USE_SHORT_LABEL: Record<Use, string>;               // Sport, Food, Aquarium
  export function useTagText(uses: readonly Use[]): string;        // 'Sport · Food'
  export const STATUS_BADGE: Record<MalaysiaStatus, string>;       // 'Native to Malaysia', …
  export const STATUS_SHORT_LABEL: Record<MalaysiaStatus, string>; // 'Native', …
  // format.ts
  export function licenseUrl(license: PhotoLicense): string;
  ```

- [ ] **Step 1: Write the failing tests**

Create `tests/state-tiles.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { STATES } from '../src/lib/fish-schema';
import { MAP_COLUMNS, MAP_ROWS, STATE_TILES, stateOfSpot } from '../src/lib/state-tiles';

describe('STATE_TILES', () => {
	it('has exactly one tile per state and federal territory', () => {
		expect(STATE_TILES.map((tile) => tile.state).sort()).toEqual([...STATES].sort());
	});

	it('uses unique three-letter codes', () => {
		const codes = STATE_TILES.map((tile) => tile.code);
		expect(new Set(codes).size).toBe(codes.length);
		for (const code of codes) expect(code).toMatch(/^[A-Z]{3}$/);
	});

	it('keeps every tile inside the 8 × 5 grid with no overlaps', () => {
		const taken = new Map<string, string>();
		for (const tile of STATE_TILES) {
			for (let col = tile.col; col < tile.col + (tile.colSpan ?? 1); col++) {
				for (let row = tile.row; row < tile.row + (tile.rowSpan ?? 1); row++) {
					expect(col).toBeGreaterThanOrEqual(1);
					expect(col).toBeLessThanOrEqual(MAP_COLUMNS);
					expect(row).toBeGreaterThanOrEqual(1);
					expect(row).toBeLessThanOrEqual(MAP_ROWS);
					const cell = `${col},${row}`;
					expect(taken.get(cell), `${tile.state} overlaps ${taken.get(cell)}`).toBeUndefined();
					taken.set(cell, tile.state);
				}
			}
		}
	});
});

describe('stateOfSpot', () => {
	it.each([
		['Kuala Rompin, Pahang', 'Pahang'],
		['Johor Bahru, Johor', 'Johor'],
		['Off Pahang, landed in Johor', 'Johor'],
		['Pulau Pinang', 'Pulau Pinang'],
		['Kuala Lumpur', 'Kuala Lumpur'],
	])('"%s" is in %s', (spot, state) => {
		expect(stateOfSpot(spot)).toBe(state);
	});

	it('returns undefined when no state is named', () => {
		expect(stateOfSpot('Tasik Temenggor')).toBeUndefined();
	});

	it('matches whole words only', () => {
		expect(stateOfSpot('Perakan River')).toBeUndefined();
	});
});
```

Create `tests/sources.test.ts`:

```ts
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
```

Create `tests/labels.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { STATUS_BADGE, STATUS_SHORT_LABEL, USE_SHORT_LABEL, useTagText } from '../src/lib/labels';

describe('use tags', () => {
	it('uses short labels', () => {
		expect(USE_SHORT_LABEL).toEqual({ sport: 'Sport', food: 'Food', aquarium: 'Aquarium' });
	});

	it('joins several uses with a middle dot', () => {
		expect(useTagText(['sport', 'food'])).toBe('Sport · Food');
		expect(useTagText(['aquarium'])).toBe('Aquarium');
	});
});

describe('status labels', () => {
	it('has badge and short text for every status', () => {
		expect(STATUS_BADGE).toEqual({
			native: 'Native to Malaysia',
			endemic: 'Endemic to Malaysia',
			introduced: 'Introduced to Malaysia',
			invasive: 'Invasive in Malaysia',
		});
		expect(STATUS_SHORT_LABEL).toEqual({
			native: 'Native',
			endemic: 'Endemic',
			introduced: 'Introduced',
			invasive: 'Invasive',
		});
	});
});
```

In `tests/format.test.ts`, change the import line to:

```ts
import { formatDate, formatRange, formatSize, licenseUrl, listOf } from '../src/lib/format';
```

and append:

```ts
describe('licenseUrl', () => {
	it('links CC0 to the public-domain dedication', () => {
		expect(licenseUrl('CC0')).toBe('https://creativecommons.org/publicdomain/zero/1.0/');
	});

	it('links BY and BY-SA to the licence overview, since no version is stored', () => {
		expect(licenseUrl('CC BY')).toBe('https://creativecommons.org/share-your-work/cclicenses/');
		expect(licenseUrl('CC BY-SA')).toBe('https://creativecommons.org/share-your-work/cclicenses/');
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run tests/state-tiles.test.ts tests/sources.test.ts tests/labels.test.ts tests/format.test.ts`

Expected: FAIL. `state-tiles` and `sources` cannot be resolved, the `labels` exports are undefined, and `licenseUrl` is not a function.

- [ ] **Step 3: Implement the map tiles**

Create `src/lib/state-tiles.ts`:

```ts
import { STATES, type State } from './fish-schema';

export interface StateTile {
	state: State;
	code: string;
	col: number;
	row: number;
	colSpan?: number;
	rowSpan?: number;
}

export const MAP_COLUMNS = 8;
export const MAP_ROWS = 5;

/** A tile map of Malaysia: Peninsular states on the left, Borneo on the right. */
export const STATE_TILES: readonly StateTile[] = [
	{ state: 'Perlis', code: 'PLS', col: 1, row: 1 },
	{ state: 'Kedah', code: 'KDH', col: 2, row: 1 },
	{ state: 'Kelantan', code: 'KTN', col: 3, row: 1 },
	{ state: 'Terengganu', code: 'TRG', col: 4, row: 1 },
	{ state: 'Pulau Pinang', code: 'PNG', col: 1, row: 2 },
	{ state: 'Perak', code: 'PRK', col: 2, row: 2 },
	{ state: 'Pahang', code: 'PHG', col: 3, row: 2, rowSpan: 2 },
	{ state: 'Selangor', code: 'SGR', col: 1, row: 3 },
	{ state: 'Kuala Lumpur', code: 'KUL', col: 2, row: 3 },
	{ state: 'Putrajaya', code: 'PJY', col: 2, row: 4 },
	{ state: 'Negeri Sembilan', code: 'NSN', col: 3, row: 4 },
	{ state: 'Melaka', code: 'MLK', col: 3, row: 5 },
	{ state: 'Johor', code: 'JHR', col: 4, row: 4, rowSpan: 2 },
	{ state: 'Labuan', code: 'LBN', col: 6, row: 1 },
	{ state: 'Sabah', code: 'SBH', col: 7, row: 1, colSpan: 2 },
	{ state: 'Sarawak', code: 'SWK', col: 5, row: 2, colSpan: 2 },
];

/** The state named last in a spot's text ("Kuala Rompin, Pahang" → Pahang), if any. */
export function stateOfSpot(text: string): State | undefined {
	let found: State | undefined;
	let foundAt = -1;
	for (const state of STATES) {
		for (const match of text.matchAll(new RegExp(`\\b${state}\\b`, 'g'))) {
			if (match.index > foundAt) {
				found = state;
				foundAt = match.index;
			}
		}
	}
	return found;
}
```

- [ ] **Step 4: Implement source labels**

Create `src/lib/sources.ts`:

```ts
/** A short label for a source link: its host (without "www.") and whether it is a PDF. */
export function sourceLabel(url: string): { host: string; pdf: boolean } {
	const { hostname, pathname } = new URL(url);
	return { host: hostname.replace(/^www\./, ''), pdf: /\.pdf$/i.test(pathname) };
}
```

- [ ] **Step 5: Add the labels**

In `src/lib/labels.ts`, append:

```ts
export const USE_SHORT_LABEL: Record<Use, string> = {
	sport: 'Sport',
	food: 'Food',
	aquarium: 'Aquarium',
};

/** Text for a fish's cardboard tag, e.g. "Sport · Food". */
export function useTagText(uses: readonly Use[]): string {
	return uses.map((use) => USE_SHORT_LABEL[use]).join(' · ');
}

export const STATUS_BADGE: Record<MalaysiaStatus, string> = {
	native: 'Native to Malaysia',
	endemic: 'Endemic to Malaysia',
	introduced: 'Introduced to Malaysia',
	invasive: 'Invasive in Malaysia',
};

export const STATUS_SHORT_LABEL: Record<MalaysiaStatus, string> = {
	native: 'Native',
	endemic: 'Endemic',
	introduced: 'Introduced',
	invasive: 'Invasive',
};
```

- [ ] **Step 6: Add the licence link**

In `src/lib/format.ts`, add as the first line:

```ts
import type { PhotoLicense } from './fish-schema';
```

and append:

```ts
/**
 * Where a photo licence is explained. The stored category does not identify a
 * BY/BY-SA version, so those link to the overview; the credited source page
 * keeps the photo's exact licence.
 */
export function licenseUrl(license: PhotoLicense): string {
	return license === 'CC0'
		? 'https://creativecommons.org/publicdomain/zero/1.0/'
		: 'https://creativecommons.org/share-your-work/cclicenses/';
}
```

- [ ] **Step 7: Run them to see them pass**

Run: `pnpm test`

Expected: PASS, every unit test.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/state-tiles.ts apps/web/src/lib/sources.ts apps/web/src/lib/labels.ts apps/web/src/lib/format.ts apps/web/tests/state-tiles.test.ts apps/web/tests/sources.test.ts apps/web/tests/labels.test.ts apps/web/tests/format.test.ts
git commit -m "feat(web): add state map, source and label helpers"
```

---

### Task 4: English-only names and text

The data has 69 fish. Of those:
- 40 have `names.malay`;
- 32 have `names.other`, and 15 of those lists mix in Malay names;
- 23 files (27 text fields) use a Malay fish name in their prose. The spec says 24 files; one of those, `nile-tilapia`, was a false positive because "tilapia" is also English.

This task:
1. moves the Malay variants to a new hidden field;
2. rewrites the prose with English names, changing no facts;
3. drops Malay from search;
4. adds a guard test so Malay names can't creep back.

**Files:**
- Modify: `apps/web/src/lib/fish-schema.ts` (`names.malayOther`)
- Modify: `apps/web/src/lib/filter.ts` (`searchText`, `matches`)
- Create: `apps/web/tests/helpers/malay-names.ts`
- Create: `apps/web/tests/malay-names.test.ts`
- Modify: `apps/web/tests/data.test.ts`, `apps/web/tests/filter.test.ts`, `apps/web/tests/fish-schema.test.ts`
- Modify: 31 files in `apps/web/data/fish/`, using a one-off script that is not committed
- Modify: `apps/web/data/fish/README.md`

**Interfaces:**
- **Consumes:** `fishSchema` and `Fish` from `src/lib/fish-schema.ts`.
- **Produces:**
  - `names.malayOther?: string[]` in the schema. It is never rendered or searched.
  - `searchText(names)` searches English, other (English) and scientific names only, and ignores apostrophes.
  - `matches()` ignores apostrophes in the query.
  - `tests/helpers/malay-names.ts`, which Task 11 also uses:

    ```ts
    export interface NameSet { english: string; scientific: string; malay?: string; other?: string[]; malayOther?: string[] }
    export const ENGLISH_WORD_ALLOWLIST: readonly string[]; // ['tilapia', 'pacu']
    export function findMalayNames(text: string, all: NameSet[]): string[];
    ```

- [ ] **Step 1: Write the failing tests**

Create `tests/helpers/malay-names.ts`:

```ts
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
```

Create `tests/malay-names.test.ts`:

```ts
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
```

In `tests/data.test.ts`, change the import block to:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { fishSchema } from '../src/lib/fish-schema';
import { findMalayNames, type NameSet } from './helpers/malay-names';
```

add after the line `const ids = new Set(fish.map((f) => f.id));`:

```ts
const allNames: NameSet[] = fish.map((f) => f.raw.names);

/** Every free-text field a visitor can read. Place names in `malaysia.spots` are left out. */
function prose(raw: any): string[] {
	return [
		raw.summary,
		raw.nativeRange,
		raw.eating,
		raw.habitat?.description,
		raw.habitat?.diet,
		raw.malaysia?.rules,
		raw.fishing?.season,
		...(raw.fishing?.baits ?? []),
		...(raw.identify?.features ?? []),
		...(raw.identify?.lookAlikes ?? []).map((lookAlike: { difference: string }) => lookAlike.difference),
	].filter(Boolean);
}
```

and add inside the `describe('fish data files', …)` block, after the scientific-name test:

```ts
	it.each(fish)('$id text uses English names only', ({ raw }) => {
		for (const text of prose(raw)) {
			expect(findMalayNames(text, allNames), text).toEqual([]);
		}
	});
```

In `tests/fish-schema.test.ts`, add inside `describe('fishSchema', …)` after "accepts a fully filled fish":

```ts
	it('accepts Malay variants in names.malayOther', () => {
		expect(errorPaths({ ...minimal, names: { ...minimal.names, malayOther: ['Toman'] } })).toEqual([]);
	});

	it('rejects blank Malay variants', () => {
		expect(errorPaths({ ...minimal, names: { ...minimal.names, malayOther: [' '] } })).toContain('names.malayOther.0');
	});
```

In `tests/filter.test.ts`, change the `toman` fixture's `search:` value from the inline object to a variable, so it can still carry a Malay name:

```ts
const tomanNames = { english: 'Giant snakehead', scientific: 'Channa micropeltes', malay: 'Toman', other: ['Red snakehead'] };

const toman: FilterItem = {
	search: searchText(tomanNames),
```

keep the rest of the `toman` fixture unchanged, and change the `temoleh` fixture's `search:` line to:

```ts
	search: searchText({ english: "Jullien's golden carp", scientific: 'Probarbus jullieni' }),
```

Replace the test `'finds a fish by its Malay name in any case'` with:

```ts
	it('finds a fish by its English name in any case', () => {
		expect(matches(toman, { ...any, text: 'GIANT SNAKE' })).toBe(true);
		expect(matches(goldfish, { ...any, text: 'GIANT SNAKE' })).toBe(false);
	});

	it('does not search Malay names, because the site is English-only', () => {
		expect(matches(toman, { ...any, text: 'toman' })).toBe(false);
	});

	it('ignores apostrophes in names and searches', () => {
		expect(matches(temoleh, { ...any, text: 'julliens' })).toBe(true);
		expect(matches(temoleh, { ...any, text: "jullien's golden" })).toBe(true);
		expect(matches(temoleh, { ...any, text: 'jullien’s' })).toBe(true);
	});
```

In the test `'requires every word to match'`, change `text: 'toman goldfish'` to `text: 'giant goldfish'`.

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test`

Expected: FAIL in three files, while `malay-names.test.ts` passes:
- `data.test.ts` fails "text uses English names only" for 20 fish. It is not 23 yet, because names still in `names.other` count as English until Step 5 moves them;
- `fish-schema.test.ts` rejects `names.malayOther`;
- `filter.test.ts` still finds "toman" and does not find "julliens".

- [ ] **Step 3: Add `names.malayOther` to the schema**

In `src/lib/fish-schema.ts`, change the `names` object to:

```ts
		names: z.strictObject({
			english: text,
			scientific: text,
			malay: text.optional(),
			other: z.array(text).optional(),
			/** Malay and regional variants. Kept for a future multilingual site; never shown or searched. */
			malayOther: z.array(text).optional(),
		}),
```

- [ ] **Step 4: Drop Malay from search and ignore apostrophes**

In `src/lib/filter.ts`, replace the `searchText` function with:

```ts
/** Lower-case and drop apostrophes, so "John's", "john’s" and "johns" all match. */
function normalise(text: string): string {
	return text.toLowerCase().replace(/['’]/g, '');
}

/**
 * Text to search for one fish. The site is English-only, so Malay names
 * (`names.malay`, `names.malayOther`) are deliberately left out.
 */
export function searchText(names: { english: string; scientific: string; other?: string[] }): string {
	return normalise([names.english, names.scientific, ...(names.other ?? [])].join(' '));
}
```

and in `matches`, change its first line to:

```ts
	const words = normalise(query.text).split(/\s+/).filter(Boolean);
```

- [ ] **Step 5: Apply the data changes**

Create the one-off script `english-only.tmp.mjs` in `apps/web/`. Do not commit it.

```js
// One-off: make fish names and text English-only. Delete after running.
import { readFileSync, writeFileSync } from 'node:fs';

// Malay and regional names to move from names.other to names.malayOther.
const MOVES = {
	barramundi: ['Siakap putih', 'Kakap putih'],
	cobia: ['Haruan tasik', 'Jaman'],
	'fourfinger-threadfin': ['Senangin', 'Kurau janggut', 'Kurau pipih'],
	'giant-gourami': ['Kalui'],
	'giant-trevally': ['Gerepoh', 'Belukok mamong', 'Mamung', 'Repuh'],
	'hound-needlefish': ['Todak'],
	'indian-mackerel': ['Kembung borek', 'Temenung', 'Rumahan'],
	'indo-pacific-sailfish': ['Layaran Pasifik'],
	'johns-snapper': ['Jenahak', 'Tetanda', 'Barah-barahan'],
	'julliens-golden-carp': ['Temelian', 'Esok'],
	'malayan-river-catfish': ['Baung sungai'],
	'malaysian-mahseer': ['Kelah merah', 'Empurau'],
	'mangrove-jack': ['Kakap merah'],
	'talang-queenfish': ['Talang lima jari', 'Talang-talang', 'Seliat'],
	'yellowstripe-scad': ['Pelata kuning', 'Temanong'],
};

// Exact text replacements. `from` must match the current text exactly.
const EDITS = [
	{ id: 'asian-arowana', path: ['summary'],
		from: 'Kelisa is a native freshwater arowana with high ornamental value. Wild populations face pressure from collection, and international trade is regulated under CITES.',
		to: 'The Asian arowana is a native freshwater fish with high ornamental value. Wild populations face pressure from collection, and international trade is regulated under CITES.' },
	{ id: 'black-pomfret', path: ['eating'],
		from: 'A food fish recorded as bawal hitam in the Malaysian Ministry of Health food-composition database.',
		to: 'A food fish listed in the Malaysian Ministry of Health food-composition database.' },
	{ id: 'climbing-perch', path: ['summary'],
		from: 'Puyu is a hardy freshwater fish that can breathe atmospheric air. It inhabits shallow waters and can persist where many other fishes would struggle with low water levels.',
		to: 'The climbing perch is a hardy freshwater fish that can breathe atmospheric air. It inhabits shallow waters and can persist where many other fishes would struggle with low water levels.' },
	{ id: 'fourfinger-threadfin', path: ['summary'],
		from: 'A coastal threadfin recognised by four separate filaments below each pectoral fin. The DOF guide calls it Senangin rambut empat and also lists regional kurau names, which can refer to different threadfins.',
		to: 'A coastal threadfin recognised by four separate filaments below each pectoral fin. Its regional market names can also refer to other threadfins.' },
	{ id: 'giant-featherback', path: ['summary'],
		from: 'Belida belongs to a featherback group whose Malaysian identifications have changed as researchers resolve old taxonomic confusion. Chitala lopis was rediscovered in Indonesia after an extinct assessment; Malaysian Chitala records need careful species-level checking.',
		to: 'The giant featherback belongs to a group whose Malaysian identifications have changed as researchers resolve old taxonomic confusion. Chitala lopis was rediscovered in Indonesia after an extinct assessment; Malaysian Chitala records need careful species-level checking.' },
	{ id: 'giant-gourami', path: ['summary'],
		from: 'Kaloi is a large freshwater gourami used as a food and ornamental fish. The modern Kenyir checklist treats O. goramy as native and records specimens from the Saok River.',
		to: 'The giant gourami is a large freshwater fish used for food and as an ornamental fish. The modern Kenyir checklist treats O. goramy as native and records specimens from the Saok River.' },
	{ id: 'giant-snakehead', path: ['summary'],
		from: 'Toman is a large predatory snakehead native to Malaysian freshwaters. Its bright red striped juveniles change dramatically as they become darker, bulkier adults.',
		to: 'The giant snakehead is a large predator native to Malaysian freshwaters. Its bright red striped juveniles change dramatically as they become darker, bulkier adults.' },
	{ id: 'giant-snakehead', path: ['identify', 'lookAlikes', 0, 'difference'],
		from: 'Haruan has dark chevron markings; juvenile toman instead has red-orange colouring with black lengthwise stripes.',
		to: 'The striped snakehead has dark chevron markings; a juvenile giant snakehead instead has red-orange colouring with black lengthwise stripes.' },
	{ id: 'hampala-barb', path: ['summary'],
		from: 'Sebarau is a Southeast Asian river and lake barb recognised by a dark mark below its dorsal fin. Surveys record it in several streams feeding Kenyir Reservoir, where it is native.',
		to: 'The hampala barb is a Southeast Asian river and lake fish recognised by a dark mark below its dorsal fin. Surveys record it in several streams feeding Kenyir Reservoir, where it is native.' },
	{ id: 'hemibagrus-wyckioides', path: ['summary'],
		from: 'This introduced catfish is distinct from native Malaysian baung. Its red-orange tail is a useful field clue, and Malaysian research and fisheries authorities identify it as an invasive concern.',
		to: "This introduced catfish is distinct from Malaysia's native bagrid catfishes. Its red-orange tail is a useful field clue, and Malaysian research and fisheries authorities identify it as an invasive concern." },
	{ id: 'hemibagrus-wyckioides', path: ['malaysia', 'rules'],
		from: 'The Department of Fisheries identifies baung ekor merah as an invasive concern. Its published import-risk page describes controls for Hemibagrus wyckioides; do not assume that advice for Amazon redtail catfish covers this species. Rules change and differ by state — check with your state Fisheries Office before acquiring or moving it. Checked 13 October 2026.',
		to: 'The Department of Fisheries identifies this catfish as an invasive concern. Its published import-risk page describes controls for Hemibagrus wyckioides; do not assume that advice for Amazon redtail catfish covers this species. Rules change and differ by state — check with your state Fisheries Office before acquiring or moving it. Checked 13 October 2026.' },
	{ id: 'iridescent-shark', path: ['summary'],
		from: 'Patin sangkar is a catfish, despite the aquarium name iridescent shark. Introduced to Malaysia for aquaculture, it is different from native patin buah and is widely raised in freshwater systems.',
		to: 'The iridescent shark is a catfish, despite its aquarium name. Introduced to Malaysia for aquaculture, it is different from the native Pangasius nasutus and is widely raised in freshwater systems.' },
	{ id: 'johns-snapper', path: ['summary'],
		from: 'Jenahak is a commercially important Malaysian snapper with a golden or bronze sheen. The DOF naming guide uses Jenahak tanda for this species, although market names can overlap with other snappers.',
		to: "John's snapper is a commercially important Malaysian snapper with a golden or bronze sheen. Market names can overlap with other snappers." },
	{ id: 'julliens-golden-carp', path: ['summary'],
		from: 'Temoleh is a large river carp native to Peninsular Malaysia. Habitat change and heavy harvest have reduced wild populations; Malaysian programmes also breed and release it for conservation and fisheries.',
		to: "Jullien's golden carp is a large river carp native to Peninsular Malaysia. Habitat change and heavy harvest have reduced wild populations; Malaysian programmes also breed and release it for conservation and fisheries." },
	{ id: 'kawakawa', path: ['summary'],
		from: 'A neritic tuna recorded in Malaysian waters. Department of Fisheries lists it as aya kurik, distinct from skipjack (aya jalur) and longtail tuna (aya hitam).',
		to: 'A neritic tuna recorded in Malaysian waters. The Department of Fisheries lists it separately from skipjack and longtail tuna.' },
	{ id: 'malayan-river-catfish', path: ['summary'],
		from: 'This native Malaysian baung was frequently called Hemibagrus nemurus in older literature. Modern revisions separate H. capitulum of Malaysia and neighbouring islands from the Java species H. nemurus.',
		to: 'This native Malaysian catfish was frequently called Hemibagrus nemurus in older literature. Modern revisions separate H. capitulum of Malaysia and neighbouring islands from the Java species H. nemurus.' },
	{ id: 'malaysian-mahseer', path: ['summary'],
		from: 'A mahseer associated with clear forest rivers, known as kelah in Peninsular Malaysia and empurau in Sarawak. Malaysian Tor identification remains under study, so a local name or lip shape alone does not settle the species.',
		to: 'A mahseer associated with clear forest rivers, with different local names in Peninsular Malaysia and Sarawak. Malaysian Tor identification remains under study, so a local name or lip shape alone does not settle the species.' },
	{ id: 'malaysian-mahseer', path: ['eating'],
		from: 'Valued as a freshwater food fish, including the empurau sold in Sarawak.',
		to: 'Valued as a freshwater food fish, including in Sarawak, where it is sold.' },
	{ id: 'mangrove-jack', path: ['summary'],
		from: 'A predatory snapper that uses mangrove estuaries while young and moves to reefs as it grows. The name siakap merah refers to a snapper, whereas siakap usually refers to barramundi.',
		to: 'A predatory snapper that uses mangrove estuaries while young and moves to reefs as it grows.' },
	{ id: 'pangasius-nasutus', path: ['summary'],
		from: 'Patin buah is a native Malaysian pangasiid catfish valued in river fisheries. It is distinct from the introduced striped catfish widely farmed as patin sangkar, and aquaculture fish can be difficult to identify from appearance alone.',
		to: 'Pangasius nasutus is a native Malaysian pangasiid catfish valued in river fisheries. It is distinct from the introduced striped catfish that is widely farmed, and aquaculture fish can be difficult to identify from appearance alone.' },
	{ id: 'pirapitinga', path: ['summary'],
		from: 'Pacu is a South American fish introduced to Malaysian waters and culture systems. It is often mistaken for a piranha, but its crushing teeth and largely fruit-based diet tell a different story.',
		to: 'The pirapitinga is a South American fish introduced to Malaysian waters and culture systems. It is often mistaken for a piranha, but its crushing teeth and largely fruit-based diet tell a different story.' },
	{ id: 'soro-brook-carp', path: ['summary'],
		from: 'Tengas is associated with clear, flowing forest streams in Peninsular Malaysia. Its mouth shape varies within the species, so the presence of a fleshy lip alone is an unreliable way to distinguish it from kelah.',
		to: 'The soro brook carp is associated with clear, flowing forest streams in Peninsular Malaysia. Its mouth shape varies within the species, so the presence of a fleshy lip alone is an unreliable way to distinguish it from the Malaysian mahseer.' },
	{ id: 'striped-snakehead', path: ['summary'],
		from: 'Haruan is an adaptable freshwater predator that can live in low-oxygen water. It waits near vegetation or submerged cover and takes smaller aquatic animals.',
		to: 'The striped snakehead is an adaptable freshwater predator that can live in low-oxygen water. It waits near vegetation or submerged cover and takes smaller aquatic animals.' },
	{ id: 'striped-snakehead', path: ['identify', 'lookAlikes', 0, 'difference'],
		from: 'Adult toman is bulkier and has a broad horizontal stripe rather than the angled bands of haruan.',
		to: 'An adult giant snakehead is bulkier and has a broad horizontal stripe rather than the angled bands of the striped snakehead.' },
	{ id: 'sultan-fish', path: ['summary'],
		from: 'Jelawat is a valuable native river fish also bred in captivity in Malaysia. Wild stocks face pressures from fishing and changes to river ecosystems.',
		to: 'The sultan fish is a valuable native river fish also bred in captivity in Malaysia. Wild stocks face pressures from fishing and changes to river ecosystems.' },
	{ id: 'tinfoil-barb', path: ['summary'],
		from: 'Lampam sungai is a native Malaysian barb that is also traded as an ornamental fish. Field surveys record it in forest rivers entering Kenyir Reservoir.',
		to: 'The tinfoil barb is a native Malaysian barb that is also traded as an ornamental fish. Field surveys record it in forest rivers entering Kenyir Reservoir.' },
	{ id: 'wallago-catfish', path: ['summary'],
		from: 'Tapah is a large native Southeast Asian catfish. Its accepted scientific name is Wallagonia leerii; the older forms Wallago leerii and Wallago leeri still occur in fisheries literature.',
		to: 'The wallago catfish is a large native Southeast Asian catfish. Its accepted scientific name is Wallagonia leerii; the older forms Wallago leerii and Wallago leeri still occur in fisheries literature.' },
];

const dir = new URL('./data/fish/', import.meta.url);
const files = new Map();
const load = (id) => {
	if (!files.has(id)) files.set(id, JSON.parse(readFileSync(new URL(`${id}.json`, dir), 'utf8')));
	return files.get(id);
};

for (const [id, malayOther] of Object.entries(MOVES)) {
	const fish = load(id);
	const { english, scientific, malay, other = [] } = fish.names;
	for (const name of malayOther) if (!other.includes(name)) throw new Error(`${id}: "${name}" is not in names.other`);
	const keep = other.filter((name) => !malayOther.includes(name));
	fish.names = { english, scientific, ...(malay ? { malay } : {}), ...(keep.length ? { other: keep } : {}), malayOther };
}

for (const { id, path, from, to } of EDITS) {
	const fish = load(id);
	const parent = path.slice(0, -1).reduce((node, key) => node[key], fish);
	const key = path.at(-1);
	if (parent[key] !== from) throw new Error(`${id} ${path.join('.')}: the current text differs from the plan. Stop and ask.`);
	parent[key] = to;
}

for (const [id, fish] of files) writeFileSync(new URL(`${id}.json`, dir), `${JSON.stringify(fish, null, 2)}\n`);
console.log(`${files.size} files updated`);
```

Run it, then delete it:

```bash
node english-only.tmp.mjs && rm english-only.tmp.mjs
git diff --stat -- data/fish | tail -1
```

Expected:
- The script prints `31 files updated`.
- `git diff --stat` reports `31 files changed`.
- If the script throws "the current text differs", stop and ask the user. Do not edit the text by hand.

- [ ] **Step 6: Run the tests to see them pass**

Run: `pnpm test`

Expected: PASS, every unit test, including all 69 "text uses English names only" cases.

- [ ] **Step 7: Spot-check one changed file**

Run: `git diff -- data/fish/giant-trevally.json data/fish/striped-snakehead.json`

Expected:
- **giant-trevally:** `other` keeps only `"GT"`, and `malayOther` lists the four Malay names. No other fields change.
- **striped-snakehead:** only `summary` and the look-alike `difference` change. `lastReviewed` is unchanged.

- [ ] **Step 8: Update the data README**

In `data/fish/README.md`, replace rule 4 of "Research rules", the line starting `4. Malay names:` and its continuation lines, with:

```markdown
4. The site is English-only. `names.malay` and `names.malayOther` are kept
   for a future multilingual version but are never shown or searched.
   `names.other` holds English (or English-language trade) names only; put
   Malay and regional names in `names.malayOther`. Never use a Malay fish
   name in prose fields; write the English name ("the striped snakehead",
   not "haruan"). `pnpm test` fails if one slips in. Prefer Department of
   Fisheries (DOF) and DBP lists over Wikidata for Malay names.
```

- [ ] **Step 9: Commit**

Run from the repo root:

```bash
git add apps/web/src/lib/fish-schema.ts apps/web/src/lib/filter.ts apps/web/tests apps/web/data/fish
git status --short
git commit -m "feat(web): make fish names and text english-only"
```

Expected:
- `git status` shows 31 modified `data/fish/*.json` files, the modified `README.md`, the source and test files, and no `english-only.tmp.mjs`.
- The commit succeeds.

---

### Task 5: Resize photos with sharp

**Files:**
- Move: `apps/web/public/photos/` → `apps/web/data/photos/` (with `git mv`)
- Create: `apps/web/src/lib/photo-lookup.ts`
- Create: `apps/web/src/lib/photos.ts`
- Modify: `apps/web/scripts/fetch-photos.ts` (line 21)
- Modify: `apps/web/tests/data.test.ts` (photo path)
- Modify: `apps/web/data/fish/README.md` (photo paths)
- Modify: `apps/web/src/pages/fish/[id].astro` (render with `<Picture>`)
- Test: `apps/web/tests/photo-lookup.test.ts`, `apps/web/tests/build/photos.test.ts`

**Interfaces:**
- **Consumes:** nothing new.
- **Produces:**

  ```ts
  // photo-lookup.ts (pure)
  export function makePhotoLookup<T>(modules: Record<string, T>): (id: string, file: string) => T;
  // photos.ts (Astro only; uses import.meta.glob)
  export const photoFor: (id: string, file: string) => ImageMetadata;  // throws naming the fish and file if missing
  ```

- [ ] **Step 1: Write the failing tests**

Create `tests/photo-lookup.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { makePhotoLookup } from '../src/lib/photo-lookup';

const photoFor = makePhotoLookup({
	'/data/photos/guppy/inat-1.jpg': 'GUPPY-1',
	'/data/photos/betta/inat-2.png': 'BETTA-2',
});

describe('makePhotoLookup', () => {
	it('finds a photo by fish id and file name', () => {
		expect(photoFor('guppy', 'inat-1.jpg')).toBe('GUPPY-1');
		expect(photoFor('betta', 'inat-2.png')).toBe('BETTA-2');
	});

	it('fails loudly, naming the file, when a photo is missing', () => {
		expect(() => photoFor('guppy', 'inat-9.jpg')).toThrow('data/photos/guppy/inat-9.jpg');
	});

	it('does not mix up fish that share a file name', () => {
		expect(() => photoFor('betta', 'inat-1.jpg')).toThrow('data/fish/betta.json');
	});
});
```

In `tests/data.test.ts`, change the photo path line inside the `'$id photos exist on disk'` test to:

```ts
			const path = new URL(`../data/photos/${id}/${photo.file}`, import.meta.url);
			expect(existsSync(path), `missing data/photos/${id}/${photo.file}`).toBe(true);
```

(This replaces the two existing lines that build `path` from `../public/photos/` and assert it.)

Create `tests/build/photos.test.ts`:

```ts
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
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test`

Expected: FAIL. `photo-lookup` cannot be resolved, and `data.test.ts` reports 143 missing `data/photos/...` files.

- [ ] **Step 3: Move the photos**

```bash
git mv public/photos data/photos
ls data/photos | wc -l
```

Expected: `68`.

- [ ] **Step 4: Implement the lookup**

Create `src/lib/photo-lookup.ts`:

```ts
/** Builds `photoFor(id, file)` over a map keyed like "/data/photos/<id>/<file>". */
export function makePhotoLookup<T>(modules: Record<string, T>): (id: string, file: string) => T {
	return (id, file) => {
		const photo = modules[`/data/photos/${id}/${file}`];
		if (photo === undefined) {
			throw new Error(`Missing photo data/photos/${id}/${file}, listed in data/fish/${id}.json`);
		}
		return photo;
	};
}
```

Create `src/lib/photos.ts`:

```ts
import type { ImageMetadata } from 'astro';
import { makePhotoLookup } from './photo-lookup';

// Eager imports let Astro resize every photo with sharp at build time.
const modules = import.meta.glob<ImageMetadata>('/data/photos/*/*.{jpg,jpeg,png,webp}', {
	eager: true,
	import: 'default',
});

export const photoFor = makePhotoLookup(modules);
```

- [ ] **Step 5: Point the photo script and README at the new folder**

In `scripts/fetch-photos.ts`, change:

```ts
	const dir = new URL(`../public/photos/${id}/`, import.meta.url);
```

to:

```ts
	const dir = new URL(`../data/photos/${id}/`, import.meta.url);
```

In `data/fish/README.md`, replace both occurrences of `public/photos/<id>/` with `data/photos/<id>/`.

- [ ] **Step 6: Render the current fish page's photos with `<Picture>`**

In `src/pages/fish/[id].astro`:
1. Add these imports after the `getCollection` import:

   ```astro
   import { Picture } from 'astro:assets';
   import { photoFor } from '../../lib/photos';
   ```

2. Delete the line `const photoSrc = (file: string) => \`/photos/${entry.id}/${file}\`;`.
3. Replace the hero `<img … />` with:

   ```astro
   <Picture
   	src={photoFor(entry.id, hero.file)}
   	alt={`${f.names.english} (${f.names.scientific})`}
   	widths={[640, 960, 1280, 1600]}
   	sizes="100vw"
   	formats={['avif', 'webp']}
   	priority
   />
   ```

4. Replace the gallery `<img … loading="lazy" />` with:

   ```astro
   <Picture
   	src={photoFor(entry.id, photo.file)}
   	alt={`${f.names.english} (${f.names.scientific})`}
   	widths={[400, 800]}
   	sizes="(min-width: 760px) 370px, 46vw"
   	formats={['avif', 'webp']}
   />
   ```

Task 10 replaces this page entirely. This step only keeps it working.

- [ ] **Step 7: Run all tests**

Run: `pnpm test && pnpm test:build`

Expected:
- Both pass.
- The first build after the move takes longer while sharp creates the resized images. Later builds reuse Astro's cache.

- [ ] **Step 8: Commit**

Run from the repo root:

```bash
git add -A apps/web/public/photos apps/web/data/photos apps/web/src/lib/photo-lookup.ts apps/web/src/lib/photos.ts apps/web/scripts/fetch-photos.ts apps/web/tests apps/web/data/fish/README.md 'apps/web/src/pages/fish/[id].astro'
git commit -m "refactor(web): resize fish photos with sharp"
```

---

### Task 6: Site shell and simple pages

**Files:**
- Create: `apps/web/src/lib/icons.ts`, `apps/web/tests/icons.test.ts`
- Create: `apps/web/src/components/Icon.astro`, `Logo.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `ConfusedFish.astro`, `ConfusedMessage.astro`
- Rewrite: `apps/web/src/layouts/Base.astro`
- Create: `apps/web/src/pages/identify.astro`, `about.astro`, `404.astro`
- Rewrite: `apps/web/public/favicon.svg`
- Create: `apps/web/public/apple-touch-icon.png` (generated)
- Delete: `apps/web/public/favicon.ico`
- Test: `apps/web/tests/build/shell.test.ts`

**Interfaces:**
- **Consumes:** the Tailwind tokens from Task 1.
- **Produces:**

  ```ts
  // icons.ts
  export type IconName = 'hook' | 'hook-question' | 'wave' | 'drop' | 'brackish' | 'fish' | 'person' | 'hand';
  export const ICONS: Record<IconName, { viewBox: string; body: string }>;
  ```

  - The `fish` icon faces left. Add `-scale-x-100` to make it face right.
  - `person` and `hand` are drawn lying horizontally, so their width is their length.
  - **Astro components:**
    - `<Icon name class? style? />`
    - `<Logo class? />`: white text, so it needs a red background.
    - `<ConfusedFish class? />`
    - `<ConfusedMessage heading text>` with an optional slot.
  - **`Base.astro`:**
    - props `title` and `description?`;
    - a named slot `top`, rendered between the header and `<main>`;
    - the default slot inside `<main>`.

- [ ] **Step 1: Write the failing tests**

Create `tests/icons.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ICONS } from '../src/lib/icons';

describe('ICONS', () => {
	it.each(Object.entries(ICONS))('%s has a viewBox and a body', (_name, icon) => {
		expect(icon.viewBox).toMatch(/^0 0 \d+ \d+$/);
		expect(icon.body).toMatch(/^<(path|circle|g)/);
		expect(icon.body).not.toMatch(/<script|on\w+=/i);
	});
});
```

Create `tests/build/shell.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { builtPage, visibleText } from './helpers';

const pages = ['index.html', 'identify/index.html', 'about/index.html', '404.html'];

describe('site shell', () => {
	it.each(pages)('%s has the header, links and footer', (path) => {
		const html = builtPage(path);
		expect(html).toContain('aria-label="wtfish home"');
		expect(html).toContain('href="/identify/"');
		expect(html).toContain('href="/about/"');
		expect(visibleText(html)).toContain('Every fact links to its source.');
	});

	it('marks the current page in the header', () => {
		expect(builtPage('identify/index.html')).toMatch(/<a href="\/identify\/"[^>]*aria-current="page"/);
		expect(builtPage('about/index.html')).toMatch(/<a href="\/about\/"[^>]*aria-current="page"/);
		expect(builtPage('index.html')).toMatch(/<a href="\/"[^>]*aria-current="page"/);
	});

	it('uses the hook favicon and no .ico', () => {
		const html = builtPage('index.html');
		expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
		expect(html).toContain('href="/apple-touch-icon.png"');
		expect(html).not.toContain('favicon.ico');
	});

	it('shows the coming-soon and not-found messages', () => {
		expect(visibleText(builtPage('identify/index.html'))).toContain('Identify is coming soon');
		expect(visibleText(builtPage('about/index.html'))).toContain('About is coming soon');
		expect(visibleText(builtPage('404.html'))).toContain('This page swam off.');
		expect(builtPage('404.html')).toContain('href="/"');
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run tests/icons.test.ts; pnpm test:build`

Expected: FAIL. `icons` cannot be resolved, and `dist/identify/index.html` is missing.

- [ ] **Step 3: Add the icons**

Create `src/lib/icons.ts`:

```ts
export type IconName = 'hook' | 'hook-question' | 'wave' | 'drop' | 'brackish' | 'fish' | 'person' | 'hand';

/**
 * Inline SVG icons shared by Astro components and the React island. `fish` faces
 * left; `person` and `hand` lie horizontally so their width is their length.
 */
export const ICONS: Record<IconName, { viewBox: string; body: string }> = {
	hook: {
		viewBox: '0 0 14 22',
		body: '<path d="M7 1 L7 13 C7 19 2 19 2 14.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M2 14.5 L4.4 16.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
	},
	'hook-question': {
		viewBox: '0 0 26 46',
		body: '<path d="M6 15 C6 8 11 4 15.5 4 C20.5 4 23 8 23 12 C23 18 15.5 20 15.5 27 L15.5 31" fill="none" stroke="currentColor" stroke-width="5.6" stroke-linecap="round"/><path d="M6 16.5 L10 12.5" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round"/><circle cx="15.5" cy="39.5" r="3.6" fill="none" stroke="currentColor" stroke-width="4"/>',
	},
	wave: {
		viewBox: '0 0 16 16',
		body: '<path d="M1 6 q2.3 -3 4.6 0 t4.6 0 t4.6 0 M1 11 q2.3 -3 4.6 0 t4.6 0 t4.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
	},
	drop: {
		viewBox: '0 0 16 16',
		body: '<path d="M8 1.5 C8 1.5 3 7.5 3 10.5 a5 5 0 0 0 10 0 C13 7.5 8 1.5 8 1.5 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
	},
	brackish: {
		viewBox: '0 0 16 16',
		body: '<path d="M8 1.5 C8 1.5 3 7.5 3 10.5 a5 5 0 0 0 10 0 C13 7.5 8 1.5 8 1.5 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4.6 10.6 q1.7 -1.6 3.4 0 t3.4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
	},
	fish: {
		viewBox: '0 0 96 24',
		body: '<path d="M2 12 C14 3 50 1 74 10 L92 2 L88 12 L92 22 L74 14 C50 23 14 21 2 12 Z" fill="currentColor"/><circle cx="11" cy="10.5" r="1.6" fill="#fff"/>',
	},
	person: {
		viewBox: '0 0 100 22',
		body: '<circle cx="6" cy="11" r="5.5" fill="currentColor"/><path d="M13 6.5 Q16 5 20 5.5 L56 7 Q60 7.5 60 11 Q60 14.5 56 15 L20 16.5 Q16 17 13 15.5 Z" fill="currentColor"/><path d="M58 8.5 L97 7 M58 13.5 L97 15" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>',
	},
	hand: {
		viewBox: '0 0 100 40',
		body: '<g transform="translate(100 0) rotate(90)"><path d="M10 98 L10 52 Q6 47 4 41 L1 31 Q0 26 4 26 Q7 26 9 32 L12 40 L12 13 Q12 8 15.5 8 Q19 8 19 13 L19 37 L19 6 Q19 2 22.5 2 Q26 2 26 6 L26 37 L26 9 Q26 5 29.5 5 Q33 5 33 9 L33 39 L33 17 Q33 13 36 13 Q39 13 39 17 L39 62 Q39 80 32 88 L32 98 Z" fill="currentColor"/></g>',
	},
};
```

Create `src/components/Icon.astro`:

```astro
---
import { ICONS, type IconName } from '../lib/icons';

interface Props {
	name: IconName;
	class?: string;
	style?: string;
}

const { name, class: className, style } = Astro.props;
const icon = ICONS[name];
---

<svg viewBox={icon.viewBox} class={className} style={style} aria-hidden="true" focusable="false" set:html={icon.body} />
```

- [ ] **Step 4: Add the logo, header, footer and confused fish**

Create `src/components/Logo.astro`:

```astro
---
import Icon from './Icon.astro';

interface Props {
	/** Sets the size, e.g. "text-[28px]". The logo is white, so place it on red. */
	class?: string;
}

const { class: className = 'text-[28px]' } = Astro.props;
---

<span class:list={['inline-flex items-center font-extrabold leading-none tracking-[-0.045em] text-white', className]}>
	<span class="text-sign-yellow">wt</span>fish<Icon name="hook-question" class="ml-0.5 h-[0.98em] w-[0.56em] text-sign-yellow" />
</span>
```

Create `src/components/SiteHeader.astro`:

```astro
---
import Logo from './Logo.astro';

const links = [
	{ href: '/', label: 'Fish' },
	{ href: '/identify/', label: 'Identify' },
	{ href: '/about/', label: 'About' },
];
const trim = (path: string) => path.replace(/\/+$/, '') || '/';
const here = trim(Astro.url.pathname);
---

<header class="border-b-[5px] border-sign-yellow bg-sign-red">
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
		<a href="/" aria-label="wtfish home" class="rounded-sm"><Logo /></a>
		<nav aria-label="Main">
			<ul class="flex gap-4 text-[15px] font-semibold text-white sm:gap-5">
				{
					links.map(({ href, label }) => (
						<li>
							<a
								href={href}
								aria-current={trim(href) === here ? 'page' : undefined}
								class="underline-offset-4 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-sign-yellow aria-[current=page]:decoration-2"
							>
								{label}
							</a>
						</li>
					))
				}
			</ul>
		</nav>
	</div>
</header>
```

Create `src/components/SiteFooter.astro`:

```astro
---
import Logo from './Logo.astro';
---

<footer class="mt-16 border-t-2 border-ink bg-white">
	<div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
		<p class="max-w-prose">
			Every fact links to its source. Photos are by iNaturalist and Wikimedia Commons contributors, credited on each
			fish's page.
		</p>
		<span class="w-fit rounded-md bg-sign-red px-3 py-1.5"><Logo class="text-lg" /></span>
	</div>
</footer>
```

Create `src/components/ConfusedFish.astro`:

```astro
---
interface Props {
	class?: string;
}

const { class: className = 'w-24' } = Astro.props;
---

<svg viewBox="0 0 96 64" class={className} aria-hidden="true" focusable="false">
	<path d="M72 32 L92 18 L88 32 L92 46 Z" fill="#ffd23f" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"></path>
	<ellipse cx="42" cy="34" rx="34" ry="22" fill="#ffd23f" stroke="#1a1a1a" stroke-width="3"></ellipse>
	<path d="M44 34 q9 3 5 13" fill="none" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round"></path>
	<circle cx="25" cy="28" r="9" fill="#fff" stroke="#1a1a1a" stroke-width="2.6"></circle>
	<circle cx="27.5" cy="24.5" r="3.6" fill="#1a1a1a"></circle>
	<path d="M14 13 Q22 6 33 12" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"></path>
	<circle cx="11" cy="41" r="3" fill="none" stroke="#1a1a1a" stroke-width="2.4"></circle>
	<circle cx="4" cy="30" r="2.6" fill="none" stroke="#1a1a1a" stroke-width="1.8"></circle>
	<circle cx="6" cy="20" r="1.8" fill="none" stroke="#1a1a1a" stroke-width="1.6"></circle>
</svg>
```

Create `src/components/ConfusedMessage.astro`:

```astro
---
import ConfusedFish from './ConfusedFish.astro';

interface Props {
	heading: string;
	text: string;
}

const { heading, text } = Astro.props;
---

<section class="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
	<ConfusedFish class="w-32" />
	<h1 class="text-4xl font-extrabold tracking-[-0.04em]">{heading}</h1>
	<p class="text-lg text-muted">{text}</p>
	<slot />
</section>
```

- [ ] **Step 5: Rewrite the base layout**

Replace `src/layouts/Base.astro` with:

```astro
---
import { Font } from 'astro:assets';
import SiteFooter from '../components/SiteFooter.astro';
import SiteHeader from '../components/SiteHeader.astro';
import '../styles/global.css';

interface Props {
	title: string;
	description?: string;
}

const {
	title,
	description = "A fish directory starting with Malaysia's fish: names, habitat, where they live and how to identify them.",
} = Astro.props;
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="description" content={description} />
		<meta name="generator" content={Astro.generator} />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
		<Font cssVariable="--astro-font-bricolage" preload />
		<Font cssVariable="--astro-font-marker" />
		<title>{title}</title>
	</head>
	<body class="flex min-h-dvh flex-col font-sans leading-normal">
		<SiteHeader />
		<slot name="top" />
		<main class="w-full flex-1">
			<slot />
		</main>
		<SiteFooter />
	</body>
</html>
```

- [ ] **Step 6: Replace the favicon**

Replace `public/favicon.svg` with:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#c8102e"/><g transform="translate(19 9)"><path d="M6 15 C6 8 11 4 15.5 4 C20.5 4 23 8 23 12 C23 18 15.5 20 15.5 27 L15.5 31" fill="none" stroke="#ffd23f" stroke-width="5.6" stroke-linecap="round"/><path d="M6 16.5 L10 12.5" fill="none" stroke="#ffd23f" stroke-width="4.2" stroke-linecap="round"/><circle cx="15.5" cy="39.5" r="3.6" fill="none" stroke="#ffd23f" stroke-width="4"/></g></svg>
```

Then generate the home-screen icon and remove the old `.ico`:

```bash
node --input-type=module -e "import sharp from 'sharp'; await sharp('public/favicon.svg', { density: 300 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');"
git rm -q public/favicon.ico
file public/apple-touch-icon.png
```

Expected: `PNG image data, 180 x 180`.

- [ ] **Step 7: Add the coming-soon and 404 pages**

Create `src/pages/identify.astro`:

```astro
---
import ConfusedMessage from '../components/ConfusedMessage.astro';
import Base from '../layouts/Base.astro';
---

<Base title="Identify | wtfish">
	<ConfusedMessage
		heading="Identify is coming soon"
		text="Snap a photo of a fish and find out what it is. We're working on it."
	/>
</Base>
```

Create `src/pages/about.astro`:

```astro
---
import ConfusedMessage from '../components/ConfusedMessage.astro';
import Base from '../layouts/Base.astro';
---

<Base title="About | wtfish">
	<ConfusedMessage
		heading="About is coming soon"
		text="Who we are, where the facts come from and how photos are licensed."
	/>
</Base>
```

Create `src/pages/404.astro`:

```astro
---
import ConfusedMessage from '../components/ConfusedMessage.astro';
import Base from '../layouts/Base.astro';
---

<Base title="Page not found | wtfish">
	<ConfusedMessage heading="This page swam off." text="We couldn't find that page.">
		<a href="/" class="ink-card px-4 py-2 font-bold shadow-hard-sm">See all fish</a>
	</ConfusedMessage>
</Base>
```

- [ ] **Step 8: Run all tests**

Run: `pnpm test && pnpm test:build`

Expected: PASS. The old home and fish pages still build. They look unstyled until Tasks 7 and 10 replace them; that is expected.

- [ ] **Step 9: Commit**

Run from the repo root:

```bash
git add -A apps/web/src apps/web/public apps/web/tests
git commit -m "feat(web): add wet-market site shell and coming-soon pages"
```

---

### Task 7: Home page cards and hero

**Files:**
- Create: `apps/web/src/components/Tape.astro`, `CardTape.astro`, `WaterLabel.astro`, `UseTag.astro`, `FishCard.astro`, `HangingSign.astro`, `Bubbles.astro`, `SwimmingFish.astro`
- Rewrite: `apps/web/src/pages/index.astro`
- Modify: `apps/web/tests/build/helpers.ts` (add `cardsById`)
- Test: `apps/web/tests/build/home.test.ts`

**Interfaces:**
- **Consumes:**
  - `Icon` and `ConfusedFish` from Task 6;
  - `TapeTick`, `CARD_TAPE_TICKS` and `cardTapePosition` from Task 2;
  - `useTagText` from Task 3;
  - `photoFor` from Task 5;
  - `searchText` and `FilterItem` from `src/lib/filter.ts`.
- **Produces:**
  - **Components:**
    - `<Tape ticks fill? class? />`: yellow when there is no `fill`; otherwise white with a yellow fill and a fish at its end.
    - `<WaterLabel water size?: 'sm' | 'md' />`
    - `<UseTag uses size?: 'card' | 'page' class? />`
    - `<FishCard fish />`
  - **Markup that Task 8 relies on:**
    - each card is `<li data-fish-card data-filter="<FilterItem JSON>">`;
    - the grid has `id="fish-grid"`;
    - an empty `<div id="filters">` is where Task 8 mounts the island;
    - `<div id="empty" hidden>` contains `<button id="clear-filters">`.
  - **Test helper:** `cardsById(html: string): Map<string, string>`.

- [ ] **Step 1: Write the failing build tests**

Append to `tests/build/helpers.ts`:

```ts
/** Each fish card's HTML on the home page, keyed by fish id, in page order. */
export function cardsById(html: string): Map<string, string> {
	const cards = new Map<string, string>();
	for (const chunk of html.split('<li data-fish-card').slice(1)) {
		const id = chunk.match(/href="\/fish\/([a-z0-9-]+)\/"/)?.[1];
		if (id) cards.set(id, chunk.slice(0, chunk.indexOf('</li>')));
	}
	return cards;
}
```

Create `tests/build/home.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { builtPage, cardsById, fishFiles, visibleText } from './helpers';

const html = builtPage('index.html');
const cards = cardsById(html);

describe('home page', () => {
	it('shows one card per fish, A–Z by English name', () => {
		const expected = [...fishFiles]
			.sort((a, b) => a.raw.names.english.localeCompare(b.raw.names.english))
			.map((fish) => fish.id);
		expect([...cards.keys()]).toEqual(expected);
	});

	it('counts the fish on the hanging sign', () => {
		expect(visibleText(html)).toContain(`${fishFiles.length} fish & counting`);
	});

	it('shows "No photo yet" for a fish without photos', () => {
		const card = cards.get('giant-featherback')!;
		expect(card).toContain('data-no-photo');
		expect(visibleText(card)).toContain('No photo yet');
	});

	it('shows a measuring tape only for fish with a known size', () => {
		for (const { id, raw } of fishFiles) {
			expect(cards.get(id)!.includes('data-card-tape'), id).toBe(Boolean(raw.size));
		}
	});

	it('shows every water type of a fish that lives in several', () => {
		const card = cards.get('barramundi')!;
		for (const water of ['freshwater', 'brackish', 'marine']) expect(card).toContain(`data-water="${water}"`);
	});

	it('shows what each fish is for on its tag', () => {
		expect(visibleText(cards.get('striped-snakehead')!)).toContain('Sport · Food');
	});

	it('uses resized photos, not the originals', () => {
		expect(html).not.toContain('/photos/');
		expect(html).toMatch(/<source[^>]+type="image\/avif"/);
	});

	it('ships the "no fish match" message hidden', () => {
		expect(html).toMatch(/<div id="empty" hidden/);
		expect(visibleText(html)).toContain('No fish match that.');
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test:build`

Expected: FAIL in `home.test.ts`. There are no `data-fish-card` elements yet.

- [ ] **Step 3: Add the tape, labels and tag**

Create `src/components/Tape.astro`:

```astro
---
import type { TapeTick } from '../lib/size';
import Icon from './Icon.astro';

interface Props {
	ticks: TapeTick[];
	/** 0–1: fill the tape this far, with a fish at the end. Omit for a plain yellow tape. */
	fill?: number;
	class?: string;
}

const { ticks, fill, class: className } = Astro.props;
const last = ticks.length - 1;
---

<div class:list={['select-none', className]} aria-hidden="true">
	<div class:list={['relative h-5 rounded border-2 border-ink', fill === undefined ? 'bg-sign-yellow' : 'bg-white']}>
		{
			fill !== undefined && (
				<>
					<span
						class="absolute inset-y-0 left-0 bg-sign-yellow/80 shadow-[2px_0_0_var(--color-ink)]"
						style={`width: ${fill * 100}%`}
					/>
					<Icon
						name="fish"
						class="absolute top-1/2 h-2.5 w-8 -translate-y-1/2 -scale-x-100 text-ink"
						style={`left: max(0px, calc(${fill * 100}% - 2.25rem))`}
					/>
				</>
			)
		}
		{
			ticks.map((tick, i) => (
				<span
					class:list={['absolute top-0 h-2 w-[1.5px] bg-ink', i === last && '-translate-x-full']}
					style={`left: ${tick.position * 100}%`}
				/>
			))
		}
	</div>
	<div class="relative mt-0.5 h-4 text-xs text-muted">
		{
			ticks.map((tick, i) => (
				<span
					class:list={[
						'absolute top-0 whitespace-nowrap',
						i === 0 ? '' : i === last ? '-translate-x-full' : '-translate-x-1/2',
					]}
					style={`left: ${tick.position * 100}%`}
				>
					{tick.label}
				</span>
			))
		}
	</div>
</div>
```

Create `src/components/CardTape.astro`:

```astro
---
import { CARD_TAPE_TICKS, cardTapePosition } from '../lib/size';
import Tape from './Tape.astro';

interface Props {
	maxCm: number;
}

const { maxCm } = Astro.props;
---

<div class="mt-2.5" data-card-tape>
	<p class="flex justify-between text-xs font-bold">
		<span class="text-muted">Size</span>
		<span class="text-alert">up to {maxCm} cm</span>
	</p>
	<Tape ticks={CARD_TAPE_TICKS} fill={cardTapePosition(maxCm)} class="mt-1" />
</div>
```

Create `src/components/WaterLabel.astro`:

```astro
---
import type { Water } from '../lib/fish-schema';
import type { IconName } from '../lib/icons';
import { WATER_LABEL } from '../lib/labels';
import Icon from './Icon.astro';

interface Props {
	water: Water;
	size?: 'sm' | 'md';
}

const { water, size = 'sm' } = Astro.props;
const look: Record<Water, { background: string; icon: IconName }> = {
	freshwater: { background: 'bg-fresh', icon: 'drop' },
	brackish: { background: 'bg-brackish', icon: 'brackish' },
	marine: { background: 'bg-salt', icon: 'wave' },
};
const { background, icon } = look[water];
---

<span
	class:list={[
		'inline-flex items-center gap-1.5 rounded border-2 border-ink font-bold text-white',
		background,
		size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]',
	]}
	data-water={water}
>
	<Icon name={icon} class="size-4" />{WATER_LABEL[water]}
</span>
```

Create `src/components/UseTag.astro`:

```astro
---
import type { Use } from '../lib/fish-schema';
import { useTagText } from '../lib/labels';

interface Props {
	uses: readonly Use[];
	size?: 'card' | 'page';
	class?: string;
}

const { uses, size = 'card', class: className } = Astro.props;
---

<span
	class:list={[
		'cardboard inline-block -rotate-[4deg] px-3.5 py-0.5 transition-transform duration-[400ms] ease-[cubic-bezier(.3,1.6,.5,1)]',
		size === 'card' ? 'text-xl' : 'text-[26px]',
		className,
	]}
>
	{useTagText(uses)}
</span>
```

- [ ] **Step 4: Add the fish card**

Create `src/components/FishCard.astro`:

```astro
---
import { Picture } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { searchText, type FilterItem } from '../lib/filter';
import { photoFor } from '../lib/photos';
import CardTape from './CardTape.astro';
import Icon from './Icon.astro';
import UseTag from './UseTag.astro';
import WaterLabel from './WaterLabel.astro';

interface Props {
	fish: CollectionEntry<'fish'>;
}

const { id, data } = Astro.props.fish;
const photo = data.photos?.[0];
const stateCount = data.malaysia?.states?.length ?? 0;
const filter: FilterItem = {
	search: searchText(data.names),
	water: data.water,
	uses: data.uses,
	states: data.malaysia?.states?.map((s) => s.state) ?? [],
	status: data.malaysia?.status ?? '',
	iucn: data.iucn ?? '',
};
---

<li data-fish-card data-filter={JSON.stringify(filter)} class="h-full">
	<a
		href={`/fish/${id}/`}
		class="group ink-card flex h-full flex-col transition-[translate,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_6px_0_var(--color-ink)]"
	>
		<div class="relative">
			{
				photo ? (
					<Picture
						src={photoFor(id, photo.file)}
						alt=""
						widths={[320, 480, 640]}
						sizes="(min-width: 1152px) 280px, (min-width: 640px) 45vw, 92vw"
						formats={['avif', 'webp']}
						class="aspect-[4/3] w-full rounded-t-[8px] object-cover"
					/>
				) : (
					<div
						class="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-t-[8px] border-b-2 border-ink text-muted"
						data-no-photo
					>
						<Icon name="fish" class="w-24 text-grout" />
						<span class="text-sm font-semibold">No photo yet</span>
					</div>
				)
			}
			<UseTag uses={data.uses} class="absolute -left-1.5 top-3 origin-left group-hover:rotate-[3deg]" />
		</div>
		<div class="flex flex-1 flex-col px-3 pb-3 pt-2.5">
			<h2 class="break-words text-[21px] font-extrabold leading-[1.05] tracking-[-0.02em]">{data.names.english}</h2>
			<p class="text-sm italic text-muted">{data.names.scientific}</p>
			{data.size && <CardTape maxCm={data.size.maxCm} />}
			<div class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
				<span class="flex flex-wrap gap-1.5">{data.water.map((water) => <WaterLabel water={water} />)}</span>
				{
					stateCount > 0 && (
						<span class="text-[13px] font-bold text-alert">
							{stateCount} {stateCount === 1 ? 'state' : 'states'}
						</span>
					)
				}
			</div>
		</div>
	</a>
</li>
```

- [ ] **Step 5: Add the hero decorations**

Create `src/components/HangingSign.astro`:

```astro
---
import Icon from './Icon.astro';

interface Props {
	text: string;
	class?: string;
}

const { text, class: className } = Astro.props;
---

<div class:list={['flex w-fit origin-top animate-sway flex-col items-center', className]}>
	<span class="h-14 w-[1.5px] bg-ink" aria-hidden="true"></span>
	<Icon name="hook" class="-mt-0.5 h-[22px] w-3.5 text-[#4a4a4a]" />
	<p class="cardboard -mt-1.5 px-3.5 py-0.5 text-2xl">{text}</p>
</div>
```

Create `src/components/Bubbles.astro`:

```astro
---
const bubbles = [
	{ left: '40%', size: 8, delay: '2.3s' },
	{ left: '62%', size: 11, delay: '0s' },
	{ left: '72%', size: 7, delay: '1.7s' },
	{ left: '80%', size: 9, delay: '3.1s' },
];
---

<div class="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
	{
		bubbles.map((bubble) => (
			<span
				class="absolute -bottom-3.5 animate-rise rounded-full border-2 border-salt/50"
				style={`left: ${bubble.left}; width: ${bubble.size}px; height: ${bubble.size}px; animation-delay: ${bubble.delay}`}
			/>
		))
	}
</div>
```

Create `src/components/SwimmingFish.astro`:

```astro
---
import Icon from './Icon.astro';
---

<div class="pointer-events-none relative h-9 overflow-hidden motion-reduce:hidden" aria-hidden="true">
	<div class="absolute top-1 animate-swim">
		<div class="animate-bob"><Icon name="fish" class="h-[13px] w-[52px] -scale-x-100 text-salt opacity-55" /></div>
	</div>
</div>
```

- [ ] **Step 6: Rewrite the home page**

Replace `src/pages/index.astro` with:

```astro
---
import { getCollection } from 'astro:content';
import Bubbles from '../components/Bubbles.astro';
import ConfusedFish from '../components/ConfusedFish.astro';
import FishCard from '../components/FishCard.astro';
import HangingSign from '../components/HangingSign.astro';
import SwimmingFish from '../components/SwimmingFish.astro';
import Base from '../layouts/Base.astro';

const fish = (await getCollection('fish')).sort((a, b) => a.data.names.english.localeCompare(b.data.names.english));
---

<Base title="wtfish: what the fish is that?">
	<SwimmingFish slot="top" />
	<div class="mx-auto max-w-6xl px-4 sm:px-6">
		<section class="grid gap-6 pb-8 pt-4 lg:grid-cols-[1fr_minmax(0,34rem)]">
			<div class="relative self-start">
				<Bubbles />
				<h1 class="relative text-[44px] font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-[52px]">
					What the fish<br />is that?
				</h1>
			</div>
			<div class="grid gap-4">
				<!-- The line reaches up to the header on wide screens: 36px fish strip + 16px padding. -->
				<HangingSign text={`${fish.length} fish & counting`} class="justify-self-end lg:-mt-[52px]" />
				<div id="filters"></div>
			</div>
		</section>
		<ul id="fish-grid" class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
			{fish.map((entry) => <FishCard fish={entry} />)}
		</ul>
		<div id="empty" hidden class="flex flex-col items-center gap-3 py-16 text-center">
			<ConfusedFish class="w-28" />
			<p class="text-xl font-extrabold tracking-[-0.02em]">No fish match that.</p>
			<p class="text-muted">Even the fish is confused. Try fewer filters.</p>
			<button id="clear-filters" type="button" class="ink-card mt-2 px-4 py-2 font-bold shadow-hard-sm">
				Clear filters
			</button>
		</div>
	</div>
</Base>
```

The old search and filters are gone at this point. Task 8 brings them back as the island.

- [ ] **Step 7: Run all tests**

Run: `pnpm test && pnpm test:build`

Expected: PASS.

- [ ] **Step 8: Check the home page on a phone and a desktop**

Start the dev server with `pnpm astro dev --background` and open `http://localhost:4321/`. Use your browser's device toolbar.

**At 390 px wide:**
- The headline, the hanging sign and the empty filter slot stack vertically.
- The cards form one column.
- *Narrow-barred Spanish mackerel* and *Brown-marbled grouper* wrap inside their cards.
- The cardboard tag never covers a name.
- There is no sideways scrolling.

**At 1280 px wide:**
- The sign's line reaches the red header.
- The sign sits right of the headline and does not overlap it.
- The cards form four columns.
- The tag swings and the card lifts on hover.
- The fish swims across under the header.

**With reduced motion on** (DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce"):
- the bubbles and the swimming fish are gone;
- the sign hangs still.

Stop the server with `pnpm astro dev stop`. Fix any failure before committing.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src apps/web/tests/build
git commit -m "feat(web): redesign home page with fish cards"
```

---

### Task 8: Base UI filter bar island

**Files:**
- Create: `apps/web/src/lib/filter-dom.ts`
- Create: `apps/web/src/components/FilterBar.tsx`
- Modify: `apps/web/src/pages/index.astro` (mount the island)
- Test: `apps/web/tests/filter-dom.test.ts`, `apps/web/tests/build/filters.test.ts`

**Interfaces:**
- **Consumes:**
  - `matches`, `FilterItem` and `FilterQuery` from `src/lib/filter.ts`;
  - `ICONS` and `IconName` from Task 6;
  - `USE_SHORT_LABEL` from Task 3 and `WATER_LABEL`, which also supply the option lists;
  - only the types `State`, `Use` and `Water` from the schema. Never import runtime values from `fish-schema.ts` into the island, because that ships zod to the browser;
  - the markup from Task 7: `[data-fish-card][data-filter]`, `#filters`, `#empty` and `#clear-filters`.
- **Produces:**

  ```ts
  export interface FilterCard { el: { hidden: boolean }; item: FilterItem }
  export function applyFilter(cards: FilterCard[], query: FilterQuery): number; // returns how many are shown
  ```

  The `FilterBar.tsx` default export takes props `{ states: State[]; total: number }`.

- [ ] **Step 1: Write the failing tests**

Create `tests/filter-dom.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { FilterItem, FilterQuery } from '../src/lib/filter';
import { applyFilter, type FilterCard } from '../src/lib/filter-dom';

const item = (overrides: Partial<FilterItem>): FilterItem => ({
	search: '',
	water: ['freshwater'],
	uses: ['food'],
	states: [],
	status: '',
	iucn: '',
	...overrides,
});
const card = (overrides: Partial<FilterItem>): FilterCard => ({ el: { hidden: false }, item: item(overrides) });
const any: FilterQuery = { text: '', water: '', use: '', state: '', status: '', threatened: false };

describe('applyFilter', () => {
	it('hides cards that do not match and returns how many are shown', () => {
		const cards = [card({ search: 'giant snakehead' }), card({ search: 'goldfish' })];
		expect(applyFilter(cards, { ...any, text: 'snakehead' })).toBe(1);
		expect(cards.map((c) => c.el.hidden)).toEqual([false, true]);
	});

	it('shows hidden cards again when the query is cleared', () => {
		const cards = [card({ search: 'goldfish' })];
		applyFilter(cards, { ...any, text: 'snakehead' });
		expect(applyFilter(cards, any)).toBe(1);
		expect(cards[0].el.hidden).toBe(false);
	});

	it('finds a fish that lives in several waters under each of them', () => {
		const barramundi = card({ water: ['freshwater', 'brackish', 'marine'] });
		for (const water of ['freshwater', 'brackish', 'marine']) {
			expect(applyFilter([barramundi], { ...any, water })).toBe(1);
		}
	});

	it('returns 0 when nothing matches', () => {
		expect(applyFilter([card({}), card({})], { ...any, use: 'aquarium' })).toBe(0);
	});
});
```

Create `tests/build/filters.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { builtPage, fishFiles } from './helpers';

const html = builtPage('index.html');

describe('filter bar', () => {
	it('is a React island with the search box', () => {
		expect(html).toMatch(/<astro-island[^>]+component-url="[^"]*FilterBar[^"]*"/);
		expect(html).toContain('placeholder="Search by name or scientific name…"');
	});

	it('shows every fish and the full count before JavaScript runs', () => {
		expect(html).not.toMatch(/<li data-fish-card[^>]*\shidden/);
		expect(html).toContain(`>${fishFiles.length} fish</p>`);
		expect(html).toMatch(/<div id="empty" hidden/);
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run tests/filter-dom.test.ts; pnpm test:build`

Expected: FAIL. `filter-dom` cannot be resolved, and there is no `<astro-island>`.

- [ ] **Step 3: Implement `applyFilter`**

Create `src/lib/filter-dom.ts`:

```ts
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
```

- [ ] **Step 4: Run the unit tests to see them pass**

Run: `pnpm vitest run tests/filter-dom.test.ts`

Expected: PASS.

- [ ] **Step 5: Build the island**

Create `src/components/FilterBar.tsx`:

```tsx
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
					<Select.Icon aria-hidden="true">▾</Select.Icon>
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
			<p aria-live="polite" className="text-sm font-bold text-muted">{`${shown} fish`}</p>
		</div>
	);
}
```

- [ ] **Step 6: Mount the island on the home page**

In `src/pages/index.astro`:
1. Add these imports after the `FishCard` import:

   ```astro
   import FilterBar from '../components/FilterBar.tsx';
   ```

   and after the `Base` import:

   ```astro
   import { STATES } from '../lib/fish-schema';
   ```

2. Add after the `const fish = …` line:

   ```astro
   const recordedStates = STATES.filter((state) => fish.some((f) => f.data.malaysia?.states?.some((s) => s.state === state)));
   ```

3. Replace `<div id="filters"></div>` with:

   ```astro
   <div id="filters"><FilterBar client:load states={recordedStates} total={fish.length} /></div>
   ```

- [ ] **Step 7: Run all tests**

Run: `pnpm test && pnpm test:build`

Expected: PASS.

- [ ] **Step 8: Check the filters by hand**

Start the dev server with `pnpm astro dev --background` and open `http://localhost:4321/`.

**Filtering:**
1. Typing "johns" leaves *John's snapper*, and the count reads "1 fish".
2. Clicking **Brackish** shows barramundi among the results. Clicking **Brackish** again returns to **All**.
3. **In Malaysia → Native**, then **State → Pahang**, narrows the list. Choosing **Anywhere** and **Any state** restores it.
4. **Threatened only** leaves only VU, EN and CR fish.
5. Searching "zzz" shows the confused fish. **Clear filters** brings every fish back and resets every control.

**Keyboard only:**
- Tab reaches the search box, each pill group (arrow keys move inside a group), both selects (Enter or Space opens them, arrows choose, Enter confirms) and the checkbox (Space toggles).
- Every focused control shows the yellow-and-ink focus ring.

**JavaScript off** (DevTools → Settings → Debugger → Disable JavaScript), then reload:
- all fish show;
- the count reads the full total;
- no "No fish match" message appears.

**At 390 px wide:** the pill rows scroll sideways and there is no page-wide sideways scroll.

Stop the server with `pnpm astro dev stop`. Fix any failure before committing.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src apps/web/tests
git commit -m "feat(web): add base ui filter bar island"
```

---

### Task 9: Fish page building blocks

**Files:**
- Create: `apps/web/src/lib/fish-page.ts`
- Create: `apps/web/src/components/Photo.astro`, `StatTiles.astro`, `SizeCompare.astro`, `Section.astro`, `Notice.astro`, `LookAlikeCard.astro`, `StateTileMap.astro`
- Test: `apps/web/tests/fish-page.test.ts`

**Interfaces:**
- **Consumes:**
  - `Fish`, `State` and `PhotoLicense` from the schema;
  - `THREATENED` from `filter.ts`;
  - `IUCN_LABEL`, `STATUS_SHORT_LABEL` and `TEMPERAMENT_LABEL` from `labels.ts`;
  - `formatRange` and `licenseUrl` from `format.ts`;
  - `sizeComparison` and `TapeTick` from Task 2;
  - `STATE_TILES` and `stateOfSpot` from Task 3;
  - `photoFor` from Task 5;
  - `Icon` from Task 6;
  - `Tape` from Task 7.
- **Produces:**

  ```ts
  export interface StatTile { value: string; label: string; alert?: true }
  export function quickStats(fish: Fish): StatTile[];
  export function aquariumStats(aquarium: NonNullable<Fish['aquarium']>): StatTile[];
  ```

  **Astro components:**
  - `<Photo fishId photo alt variant: 'hero' | 'gallery' />`. The hero has `data-hero` and `priority`.
  - `<StatTiles tiles />`
  - `<SizeCompare maxCm maxKg? />`, with `data-size-reference`.
  - `<Section title id>`, with `data-section={id}`.
  - `<Notice title>`, with `data-section="before-you-fish"`.
  - `<LookAlikeCard id difference />`
  - `<StateTileMap recorded spots />`. The map has `data-tile-map`, each tile has `data-state`, and recorded tiles have `data-recorded`.

- [ ] **Step 1: Write the failing tests**

Create `tests/fish-page.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Fish } from '../src/lib/fish-schema';
import { aquariumStats, quickStats } from '../src/lib/fish-page';

const base: Fish = {
	names: { english: 'Indo-Pacific sailfish', scientific: 'Istiophorus platypterus' },
	taxonomy: { family: 'Istiophoridae' },
	water: ['marine'],
	uses: ['sport'],
	summary: 'A billfish.',
};

describe('quickStats', () => {
	it('lists length, weight, IUCN, status and family in that order', () => {
		const sailfish: Fish = {
			...base,
			taxonomy: { family: 'Istiophoridae', order: 'Perciformes' },
			iucn: 'VU',
			size: { maxCm: 350, maxKg: 100 },
			malaysia: { status: 'native' },
		};
		expect(quickStats(sailfish)).toEqual([
			{ value: '350 cm', label: 'max length' },
			{ value: '100 kg', label: 'max weight' },
			{ value: 'VU', label: 'Vulnerable', alert: true },
			{ value: 'Native', label: 'in Malaysia' },
			{ value: 'Istiophoridae', label: 'family · order Perciformes' },
		]);
	});

	it('adds the usual length to the length label', () => {
		expect(quickStats({ ...base, size: { maxCm: 100, commonCm: 60 } })[0]).toEqual({
			value: '100 cm',
			label: 'max length · usually 60 cm',
		});
	});

	it('only marks threatened categories', () => {
		const tiles = quickStats({ ...base, iucn: 'LC' });
		expect(tiles[0]).toEqual({ value: 'LC', label: 'Least Concern' });
	});

	it('shows just the family for a minimal fish', () => {
		expect(quickStats(base)).toEqual([{ value: 'Istiophoridae', label: 'family' }]);
	});
});

describe('aquariumStats', () => {
	it('lists tank, temperature, pH, temperament and group size', () => {
		expect(
			aquariumStats({ minTankLitres: 60, tempC: [24, 28], ph: [6, 7.5], temperament: 'peaceful', groupSize: 6 }),
		).toEqual([
			{ value: '60 L', label: 'minimum tank' },
			{ value: '24–28°C', label: 'temperature' },
			{ value: '6–7.5', label: 'pH' },
			{ value: 'Peaceful', label: 'temperament' },
			{ value: '6+', label: 'group size' },
		]);
	});

	it('leaves out the group size when unknown', () => {
		expect(aquariumStats({ minTankLitres: 200, tempC: [26, 26], ph: [7, 7], temperament: 'aggressive' })).toHaveLength(4);
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run tests/fish-page.test.ts`

Expected: FAIL. `fish-page` cannot be resolved.

- [ ] **Step 3: Implement the stat helpers**

Create `src/lib/fish-page.ts`:

```ts
import { THREATENED } from './filter';
import type { Fish } from './fish-schema';
import { formatRange } from './format';
import { IUCN_LABEL, STATUS_SHORT_LABEL, TEMPERAMENT_LABEL } from './labels';

export interface StatTile {
	value: string;
	label: string;
	/** Shown in the alert colour, e.g. a threatened IUCN category. */
	alert?: true;
}

/** The quick-stats row under a fish's summary, in page order. */
export function quickStats(fish: Fish): StatTile[] {
	const tiles: StatTile[] = [];
	if (fish.size) {
		const usually = fish.size.commonCm ? ` · usually ${fish.size.commonCm} cm` : '';
		tiles.push({ value: `${fish.size.maxCm} cm`, label: `max length${usually}` });
		if (fish.size.maxKg) tiles.push({ value: `${fish.size.maxKg} kg`, label: 'max weight' });
	}
	if (fish.iucn) {
		tiles.push({
			value: fish.iucn,
			label: IUCN_LABEL[fish.iucn],
			...(THREATENED.includes(fish.iucn) ? { alert: true as const } : {}),
		});
	}
	if (fish.malaysia) tiles.push({ value: STATUS_SHORT_LABEL[fish.malaysia.status], label: 'in Malaysia' });
	const order = fish.taxonomy.order ? ` · order ${fish.taxonomy.order}` : '';
	tiles.push({ value: fish.taxonomy.family, label: `family${order}` });
	return tiles;
}

export function aquariumStats(aquarium: NonNullable<Fish['aquarium']>): StatTile[] {
	const tiles: StatTile[] = [
		{ value: `${aquarium.minTankLitres} L`, label: 'minimum tank' },
		{ value: formatRange(aquarium.tempC, '°C'), label: 'temperature' },
		{ value: formatRange(aquarium.ph, ''), label: 'pH' },
		{ value: TEMPERAMENT_LABEL[aquarium.temperament], label: 'temperament' },
	];
	if (aquarium.groupSize) tiles.push({ value: `${aquarium.groupSize}+`, label: 'group size' });
	return tiles;
}
```

- [ ] **Step 4: Run them to see them pass**

Run: `pnpm vitest run tests/fish-page.test.ts`

Expected: PASS.

- [ ] **Step 5: Add the photo, stat and size components**

Create `src/components/Photo.astro`:

```astro
---
import { Picture } from 'astro:assets';
import type { Fish } from '../lib/fish-schema';
import { licenseUrl } from '../lib/format';
import { photoFor } from '../lib/photos';

type FishPhoto = NonNullable<Fish['photos']>[number];

interface Props {
	fishId: string;
	photo: FishPhoto;
	alt: string;
	variant: 'hero' | 'gallery';
}

const { fishId, photo, alt, variant } = Astro.props;
const image = photoFor(fishId, photo.file);
---

{
	variant === 'hero' ? (
		<figure class="relative" data-hero>
			<Picture
				src={image}
				alt={alt}
				widths={[640, 960, 1280, 1600]}
				sizes="100vw"
				formats={['avif', 'webp']}
				priority
				class="aspect-[4/3] w-full border-b-2 border-ink object-cover sm:aspect-[21/8]"
			/>
			<figcaption class="absolute bottom-2 right-2 max-w-[90%] rounded bg-white/90 px-2 py-0.5 text-xs">
				<a href={photo.url} class="underline">
					{photo.credit}
				</a>{' '}
				·{' '}
				<a href={licenseUrl(photo.license)} class="underline">
					{photo.license}
				</a>
			</figcaption>
		</figure>
	) : (
		<figure data-gallery-photo>
			<Picture
				src={image}
				alt={alt}
				widths={[400, 800]}
				sizes="(min-width: 760px) 370px, 46vw"
				formats={['avif', 'webp']}
				class="aspect-[4/3] w-full rounded-md border-2 border-ink object-cover"
			/>
			<figcaption class="mt-1 text-[13px] text-muted">
				<a href={photo.url} class="underline">
					{photo.credit}
				</a>{' '}
				·{' '}
				<a href={licenseUrl(photo.license)} class="underline">
					{photo.license}
				</a>
			</figcaption>
		</figure>
	)
}
```

Create `src/components/StatTiles.astro`:

```astro
---
import type { StatTile } from '../lib/fish-page';

interface Props {
	tiles: StatTile[];
}

const { tiles } = Astro.props;
---

<dl class="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))]" data-stat-tiles>
	{
		tiles.map((tile) => (
			<div class="flex flex-col-reverse rounded-lg border-2 border-ink bg-white px-2.5 py-2">
				<dt class="text-[13px] text-muted">{tile.label}</dt>
				<dd class:list={['break-words text-[22px] font-extrabold leading-tight tracking-[-0.02em]', tile.alert && 'text-alert']}>
					{tile.value}
				</dd>
			</div>
		))
	}
</dl>
```

Create `src/components/SizeCompare.astro`:

```astro
---
import { sizeComparison } from '../lib/size';
import Icon from './Icon.astro';
import Tape from './Tape.astro';

interface Props {
	maxCm: number;
	maxKg?: number;
}

const { maxCm, maxKg } = Astro.props;
const comparison = sizeComparison(maxCm);
const width = (cm: number) => `width: ${(cm / comparison.scaleMaxCm) * 100}%`;
const reference =
	comparison.reference === 'person'
		? `The person is ${comparison.referenceCm} cm tall.`
		: `The hand is ${comparison.referenceCm} cm long.`;
---

<figure data-size-reference={comparison.reference}>
	<div class="space-y-2" aria-hidden="true">
		<Icon name="fish" class="block h-auto text-salt" style={width(maxCm)} />
		<Icon name={comparison.reference} class="block h-auto text-ink" style={width(comparison.referenceCm)} />
	</div>
	<Tape ticks={comparison.ticks} class="mt-2" />
	<figcaption class="mt-2 text-sm text-muted">
		Up to {maxCm} cm{maxKg ? ` and ${maxKg} kg` : ''}. {reference}
	</figcaption>
</figure>
```

- [ ] **Step 6: Add the section, notice and look-alike components**

Create `src/components/Section.astro`:

```astro
---
interface Props {
	title: string;
	/** Used for the heading id and data-section. */
	id: string;
}

const { title, id } = Astro.props;
---

<section class="ink-card px-5 pb-5 pt-4" aria-labelledby={id} data-section={id}>
	<h2 id={id} class="mb-2.5 text-[25px] font-extrabold leading-[1.1] tracking-[-0.03em]">{title}</h2>
	<slot />
</section>
```

Create `src/components/Notice.astro`:

```astro
---
interface Props {
	title: string;
}

const { title } = Astro.props;
---

<section
	class="rounded-[10px] border-2 border-ink bg-sign-yellow px-5 pb-5 pt-4 shadow-hard"
	aria-labelledby="before-you-fish"
	data-section="before-you-fish"
>
	<h2 id="before-you-fish" class="mb-1.5 font-marker text-[26px]">{title}</h2>
	<slot />
</section>
```

Create `src/components/LookAlikeCard.astro`:

```astro
---
import { Picture } from 'astro:assets';
import { getEntry } from 'astro:content';
import { photoFor } from '../lib/photos';
import Icon from './Icon.astro';

interface Props {
	id: string;
	difference: string;
}

const { id, difference } = Astro.props;
const other = await getEntry('fish', id);
if (!other) throw new Error(`Look-alike "${id}" has no data file`);
const photo = other.data.photos?.[0];
---

<li class="flex gap-3 rounded-lg border-2 border-ink bg-white p-2">
	{
		photo ? (
			<Picture
				src={photoFor(id, photo.file)}
				alt=""
				widths={[160, 320]}
				sizes="160px"
				formats={['avif', 'webp']}
				class="aspect-[4/3] w-28 shrink-0 rounded border-2 border-ink object-cover sm:w-40"
			/>
		) : (
			<div class="flex aspect-[4/3] w-28 shrink-0 items-center justify-center rounded border-2 border-ink sm:w-40">
				<Icon name="fish" class="w-16 text-grout" />
			</div>
		)
	}
	<div>
		<a href={`/fish/${id}/`} class="font-extrabold underline decoration-2 underline-offset-2">{other.data.names.english}</a>
		<p class="text-[15px]">{difference}</p>
	</div>
</li>
```

- [ ] **Step 7: Add the tile map**

Create `src/components/StateTileMap.astro`:

```astro
---
import type { State } from '../lib/fish-schema';
import { STATE_TILES, stateOfSpot } from '../lib/state-tiles';

interface Props {
	recorded: State[];
	spots: string[];
}

const { recorded, spots } = Astro.props;
const pins = new Map<State, number>();
spots.forEach((spot, i) => {
	const state = stateOfSpot(spot);
	if (state && !pins.has(state)) pins.set(state, i + 1);
});
---

<div class="flex flex-wrap items-start gap-x-6 gap-y-3">
	<div class="grid grid-cols-[repeat(8,minmax(0,2.75rem))] grid-rows-[repeat(5,2.5rem)] gap-1" data-tile-map>
		{
			STATE_TILES.map((tile) => {
				const isRecorded = recorded.includes(tile.state);
				const pin = pins.get(tile.state);
				return (
					<span
						role="img"
						title={tile.state}
						aria-label={`${tile.state}${isRecorded ? ', recorded' : ''}${pin ? `, spot ${pin}` : ''}`}
						data-state={tile.state}
						data-recorded={isRecorded ? '' : undefined}
						class:list={[
							'relative flex items-center justify-center rounded-md text-xs font-bold',
							isRecorded ? 'border-2 border-ink bg-salt text-white' : 'border-[1.5px] border-[#c8d4d9] bg-white text-muted',
						]}
						style={`grid-column: ${tile.col} / span ${tile.colSpan ?? 1}; grid-row: ${tile.row} / span ${tile.rowSpan ?? 1}`}
					>
						{tile.code}
						{pin && (
							<span class="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full border-2 border-ink bg-sign-yellow text-xs text-ink">
								{pin}
							</span>
						)}
					</span>
				);
			})
		}
	</div>
	<div class="text-sm">
		<ul class="space-y-1.5">
			<li>
				<span class="mr-1.5 inline-block size-3.5 rounded-sm border-2 border-ink bg-salt align-[-2px]"></span>Recorded (open
				records)
			</li>
			{
				spots.length > 0 && (
					<li>
						<span class="mr-1.5 inline-block size-3.5 rounded-full border-2 border-ink bg-sign-yellow align-[-2px]" />
						Well-known fishing spot
					</li>
				)
			}
		</ul>
		{
			spots.length > 0 && (
				<ol class="mt-2 space-y-1 font-bold" data-spots>
					{spots.map((spot, i) => (
						<li class="flex items-center gap-1.5">
							<span class="flex size-5 items-center justify-center rounded-full border-2 border-ink bg-sign-yellow text-xs">
								{i + 1}
							</span>
							{spot}
						</li>
					))}
				</ol>
			)
		}
	</div>
</div>
```

- [ ] **Step 8: Run all tests**

Run: `pnpm test`

Expected: PASS. The components are not used yet; Task 10 renders them.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/lib/fish-page.ts apps/web/src/components apps/web/tests/fish-page.test.ts
git commit -m "feat(web): add fish page building blocks"
```

---

### Task 10: Fish page

**Files:**
- Rewrite: `apps/web/src/pages/fish/[id].astro`
- Test: `apps/web/tests/build/fish-page.test.ts`

**Interfaces:**
- **Consumes:**
  - every component from Tasks 6, 7 and 9;
  - `quickStats` and `aquariumStats` from Task 9;
  - `sourceLabel` and `STATUS_BADGE` from Task 3;
  - `THREATENED` from `filter.ts`;
  - `formatDate` and `listOf` from `format.ts`;
  - `DIFFICULTY_LABEL`, `ENVIRONMENT_LABEL`, `IUCN_LABEL` and `METHOD_LABEL` from `labels.ts`.
- **Produces:** the final fish page.

- [ ] **Step 1: Write the failing build tests**

Create `tests/build/fish-page.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { builtPage, fishFiles, visibleText } from './helpers';

const page = (id: string) => builtPage(`fish/${id}/index.html`);

describe('fish pages', () => {
	it('builds a page for every fish', () => {
		for (const { id } of fishFiles) expect(() => page(id), id).not.toThrow();
	});

	it('titles the page with the English and scientific names', () => {
		expect(page('indo-pacific-sailfish')).toContain('<title>Indo-Pacific sailfish (Istiophorus platypterus) | wtfish</title>');
	});

	it('loads the hero photo first, and skips it for a fish without photos', () => {
		expect(page('indo-pacific-sailfish')).toMatch(/data-hero[\s\S]*?fetchpriority="high"/);
		expect(page('giant-featherback')).not.toContain('data-hero');
		expect(page('giant-featherback')).toContain('data-name-card');
	});

	it('shows "Before you fish" only when there are rules', () => {
		expect(page('indo-pacific-sailfish')).toContain('data-section="before-you-fish"');
		for (const { id, raw } of fishFiles) {
			expect(page(id).includes('data-section="before-you-fish"'), id).toBe(Boolean(raw.malaysia?.rules));
		}
	});

	it('compares big fish with a person and small fish with a hand', () => {
		expect(page('indo-pacific-sailfish')).toContain('data-size-reference="person"');
		expect(page('dwarf-rasbora')).toContain('data-size-reference="hand"');
		expect(visibleText(page('dwarf-rasbora'))).toContain('The hand is 18 cm long.');
	});

	it('maps all 16 states and marks recorded ones and spots', () => {
		const html = page('indo-pacific-sailfish');
		expect(html.match(/data-state="/g)).toHaveLength(16);
		expect(html).toMatch(/data-state="Sabah"[^>]*data-recorded/);
		expect(visibleText(html)).toContain('Kuala Rompin, Pahang');
		expect(visibleText(html)).toContain('Few records can mean few surveys, not few fish.');
	});

	it('links look-alikes to their pages', () => {
		expect(page('striped-snakehead')).toMatch(/data-section="identify"[\s\S]*href="\/fish\/giant-snakehead\/"/);
	});

	it('shows aquarium care only for aquarium fish', () => {
		for (const { id, raw } of fishFiles) {
			expect(page(id).includes('data-section="aquarium"'), id).toBe(Boolean(raw.aquarium));
		}
	});

	it('lists sources by host, with a PDF label', () => {
		const text = visibleText(page('indo-pacific-sailfish'));
		expect(text).toContain('gbif.org');
		expect(text).toContain('repository.seafdec.org.my PDF');
		expect(text).toContain('Last reviewed 13 October 2026.');
	});

	it('shows the remaining photos in the gallery with credits', () => {
		const html = page('indo-pacific-sailfish');
		expect(html.match(/data-gallery-photo/g)).toHaveLength(2);
		expect(visibleText(html)).toContain('Jiro Iguchi');
	});

	it('uses only the new layout', () => {
		const html = page('striped-snakehead');
		for (const oldClass of ['class="pairs', 'class="chips', 'class="summary', 'class="badge']) {
			expect(html).not.toContain(oldClass);
		}
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test:build`

Expected: FAIL in `fish-page.test.ts`. The old page has no `data-name-card`, `data-section`, `data-size-reference` or `data-state`.

- [ ] **Step 3: Rewrite the fish page**

Replace `src/pages/fish/[id].astro` with:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Icon from '../../components/Icon.astro';
import LookAlikeCard from '../../components/LookAlikeCard.astro';
import Notice from '../../components/Notice.astro';
import Photo from '../../components/Photo.astro';
import Section from '../../components/Section.astro';
import SizeCompare from '../../components/SizeCompare.astro';
import StatTiles from '../../components/StatTiles.astro';
import StateTileMap from '../../components/StateTileMap.astro';
import UseTag from '../../components/UseTag.astro';
import WaterLabel from '../../components/WaterLabel.astro';
import Base from '../../layouts/Base.astro';
import { THREATENED } from '../../lib/filter';
import { aquariumStats, quickStats } from '../../lib/fish-page';
import { formatDate, listOf } from '../../lib/format';
import { DIFFICULTY_LABEL, ENVIRONMENT_LABEL, IUCN_LABEL, METHOD_LABEL, STATUS_BADGE } from '../../lib/labels';
import { sourceLabel } from '../../lib/sources';

export async function getStaticPaths() {
	const fish = await getCollection('fish');
	return fish.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}

interface Props {
	entry: CollectionEntry<'fish'>;
}

const { entry } = Astro.props;
const f = entry.data;
const [hero, ...morePhotos] = f.photos ?? [];
const states = f.malaysia?.states ?? [];
const spots = f.malaysia?.spots ?? [];
const gbifRecords = states.reduce((sum, s) => sum + s.records, 0);
const fishing = f.fishing;
const hasFishing = Boolean(
	fishing && (fishing.season || fishing.methods?.length || fishing.baits?.length || fishing.difficulty),
);
const iucnTone = !f.iucn
	? ''
	: THREATENED.includes(f.iucn)
		? 'bg-sign-yellow'
		: f.iucn === 'EW' || f.iucn === 'EX'
			? 'bg-ink text-white'
			: 'bg-white';
const chip = 'rounded-full border-[1.5px] border-[#c8d4d9] bg-[#eef3f5] px-2.5 py-0.5 text-sm font-bold';
const term = 'font-extrabold';
---

<Base title={`${f.names.english} (${f.names.scientific}) | wtfish`} description={f.summary}>
	{hero && <Photo fishId={entry.id} photo={hero} alt={`Photo of ${f.names.english}`} variant="hero" />}
	<div class="mx-auto grid max-w-[760px] gap-4 px-4 sm:px-5">
		<header
			class:list={['ink-card relative px-5 pb-5 pt-4 shadow-hard', hero ? '-mt-8 sm:-mt-[70px]' : 'mt-6']}
			data-name-card
		>
			<a href="/" class="inline-block border-b-2 border-ink text-[15px] font-bold">← All fish</a>
			<h1 class="mt-2.5 break-words text-[38px] font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-[46px]">
				{f.names.english}
			</h1>
			<p class="mt-1 text-[19px] italic text-muted">{f.names.scientific}</p>
			<UseTag uses={f.uses} size="page" class="mt-2.5" />
			{f.names.other?.length ? <p class="mt-1.5 text-[15px] text-muted">Also called {listOf(f.names.other)}</p> : null}
			<div class="mt-3 flex flex-wrap gap-1.5">
				{f.water.map((water) => <WaterLabel water={water} size="md" />)}
				{
					f.malaysia && (
						<span class="rounded border-2 border-ink bg-white px-2.5 py-1 text-[13px] font-bold">
							{STATUS_BADGE[f.malaysia.status]}
						</span>
					)
				}
				{
					f.iucn && (
						<span class:list={['rounded border-2 border-ink px-2.5 py-1 text-[13px] font-bold', iucnTone]}>
							{IUCN_LABEL[f.iucn]} (IUCN)
						</span>
					)
				}
			</div>
			{
				!f.lastReviewed && (
					<p class="mt-3 inline-block -rotate-2 rounded border-2 border-alert px-2 py-0.5 text-sm font-extrabold uppercase tracking-wide text-alert">
						Not yet fact-checked
					</p>
				)
			}
		</header>

		<p class="text-[19px] leading-normal">{f.summary}</p>

		<StatTiles tiles={quickStats(f)} />
		{
			f.iucn && (
				<p class="-mt-2 text-sm text-muted">
					IUCN category from{' '}
					{f.taxonomy.wikidata ? (
						<a class="underline" href={`https://www.wikidata.org/wiki/${f.taxonomy.wikidata}`}>
							Wikidata
						</a>
					) : (
						'Wikidata'
					)}
					; it may lag the latest Red List assessment.
				</p>
			)
		}

		{
			f.size && (
				<Section title="How big?" id="how-big">
					<SizeCompare maxCm={f.size.maxCm} maxKg={f.size.maxKg} />
				</Section>
			)
		}

		{
			f.identify && (
				<Section title="How to identify" id="identify">
					<ul class="grid gap-1.5">
						{f.identify.features.map((feature) => (
							<li class="flex items-start gap-2.5">
								<Icon name="hook" class="mt-0.5 h-5 w-3 shrink-0 text-sign-red" />
								{feature}
							</li>
						))}
					</ul>
					{f.identify.lookAlikes?.length ? (
						<>
							<h3 class="mb-1.5 mt-4 text-[17px] font-extrabold">Look-alikes</h3>
							<ul class="grid gap-2">
								{f.identify.lookAlikes.map((lookAlike) => (
									<LookAlikeCard id={lookAlike.id} difference={lookAlike.difference} />
								))}
							</ul>
						</>
					) : null}
				</Section>
			)
		}

		{
			(f.habitat || f.nativeRange) && (
				<Section title="Habitat" id="habitat">
					{f.habitat && (
						<p class="mb-2.5 flex flex-wrap gap-1.5">
							{f.habitat.environments.map((environment) => (
								<span class={chip}>{ENVIRONMENT_LABEL[environment]}</span>
							))}
						</p>
					)}
					{f.habitat?.description && <p class="mb-2">{f.habitat.description}</p>}
					{f.habitat?.diet && (
						<p class="mb-2">
							<b>Diet:</b> {f.habitat.diet}
						</p>
					)}
					{f.nativeRange && (
						<p>
							<b>Native range:</b> {f.nativeRange}
						</p>
					)}
				</Section>
			)
		}

		{
			(states.length > 0 || spots.length > 0) && (
				<Section title="Where in Malaysia" id="where">
					<StateTileMap recorded={states.map((s) => s.state)} spots={spots} />
					{states.length > 0 && (
						<p class="mt-3 text-sm text-muted">
							Recorded in {listOf(states.map((s) => s.state))}. Based on {gbifRecords} open-licence{' '}
							{gbifRecords === 1 ? 'record' : 'records'} on{' '}
							{f.taxonomy.gbifKey ? (
								<a class="underline" href={`https://www.gbif.org/species/${f.taxonomy.gbifKey}`}>
									GBIF
								</a>
							) : (
								'GBIF'
							)}
							. Few records can mean few surveys, not few fish.
						</p>
					)}
				</Section>
			)
		}

		{
			hasFishing && fishing && (
				<Section title="Catching it" id="catching">
					<dl class="grid gap-x-4 gap-y-2 sm:grid-cols-[max-content_1fr]">
						{fishing.season && (
							<>
								<dt class={term}>Season</dt>
								<dd>{fishing.season}</dd>
							</>
						)}
						{fishing.methods?.length ? (
							<>
								<dt class={term}>Methods</dt>
								<dd class="flex flex-wrap gap-1.5">
									{fishing.methods.map((method) => (
										<span class={chip}>{METHOD_LABEL[method]}</span>
									))}
								</dd>
							</>
						) : null}
						{fishing.baits?.length ? (
							<>
								<dt class={term}>Baits and lures</dt>
								<dd class="flex flex-wrap gap-1.5">
									{fishing.baits.map((bait) => (
										<span class={chip}>{bait}</span>
									))}
								</dd>
							</>
						) : null}
						{fishing.difficulty && (
							<>
								<dt class={term}>Difficulty</dt>
								<dd>{DIFFICULTY_LABEL[fishing.difficulty]}</dd>
							</>
						)}
					</dl>
				</Section>
			)
		}

		{
			f.malaysia?.rules && (
				<Notice title="Before you fish">
					<p class="mb-2">{f.malaysia.rules}</p>
					<p class="text-[15px]">
						Rules change and differ by state. Check with your state Fisheries Office before you fish.
						{f.lastReviewed && ` Last checked ${formatDate(f.lastReviewed)}.`}
					</p>
				</Notice>
			)
		}

		{
			f.eating && (
				<Section title="Eating" id="eating">
					<p>{f.eating}</p>
				</Section>
			)
		}

		{
			f.aquarium && (
				<Section title="Aquarium care" id="aquarium">
					<StatTiles tiles={aquariumStats(f.aquarium)} />
				</Section>
			)
		}

		{
			morePhotos.length > 0 && (
				<Section title="More photos" id="photos">
					<div class="grid grid-cols-2 gap-3">
						{morePhotos.map((photo, i) => (
							<Photo fishId={entry.id} photo={photo} alt={`${f.names.english}, photo ${i + 2}`} variant="gallery" />
						))}
					</div>
				</Section>
			)
		}

		{
			f.sources?.length ? (
				<Section title="Sources" id="sources">
					<ol class="list-decimal space-y-0.5 pl-6">
						{f.sources.map((url) => {
							const { host, pdf } = sourceLabel(url);
							return (
								<li>
									<a href={url} title={url} class="font-semibold text-salt underline">
										{host}
									</a>
									{pdf && <span class="ml-1.5 text-xs text-muted">PDF</span>}
								</li>
							);
						})}
					</ol>
					<p class="mt-2.5 text-sm text-muted">
						{f.lastReviewed ? `Last reviewed ${formatDate(f.lastReviewed)}.` : 'This profile has not been fact-checked yet.'}
					</p>
				</Section>
			) : (
				<p class="text-sm text-muted">This profile has not been fact-checked yet.</p>
			)
		}
	</div>
</Base>
```

- [ ] **Step 4: Run all tests**

Run: `pnpm test && pnpm test:build`

Expected: PASS.

- [ ] **Step 5: Check fish pages by hand**

Start the dev server with `pnpm astro dev --background`.

**At 390 px and 1280 px wide**, open these pages:

- `/fish/indo-pacific-sailfish/` (the richest page):
  - the hero photo is wide, and the name card overlaps it;
  - the sailfish line on "How big?" is about twice the person's length;
  - the map shows Sabah filled and a yellow "1" pin on Pahang;
  - the yellow notice board stands out;
  - the gallery has two photos with credits.
- `/fish/giant-featherback/`: there is no hero, the name card sits at the top, and no section is empty.
- `/fish/dwarf-rasbora/`: "How big?" shows a hand, and the fish is about one seventh of the hand.
- `/fish/barramundi/`: three water labels wrap neatly.
- `/fish/cardinal-tetra/`: the aquarium stat tiles show.

**At 390 px:** the stat tiles go two per row, the 16-tile map fits without sideways scrolling, and long family names wrap.

**Keyboard:** tab through a page. Links, credits and sources show the focus ring.

Stop the server with `pnpm astro dev stop`. Fix any failure before committing.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/fish apps/web/tests/build/fish-page.test.ts
git commit -m "feat(web): redesign fish page"
```

---

### Task 11: English-only check and final review

**Files:**
- Test: `apps/web/tests/build/english-only.test.ts`
- Modify: `apps/web/README.md` (replace the Astro starter text)

**Interfaces:**
- **Consumes:**
  - `findMalayNames` and `NameSet` from `tests/helpers/malay-names.ts` (Task 4);
  - `allBuiltPages`, `builtPage`, `visibleText` and `fishFiles` from `tests/build/helpers.ts`.
- **Produces:** the final, verified branch.

- [ ] **Step 1: Write the English-only build test**

Create `tests/build/english-only.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it**

Run: `pnpm test:build`

Expected: PASS for every page: home, 69 fish pages, identify, about and 404.

If a page fails, the message names the Malay word. Trace it to its data file and stop: data text may only change as listed in Task 4, so ask the user.

- [ ] **Step 3: Confirm no scoped styles or Malay labels remain in the source**

```bash
grep -rln '<style' src || echo "no <style> blocks"
grep -rniE 'air tawar|air payau|ikan apa|\blaut\b' src || echo "no Malay labels"
```

Expected: `no <style> blocks` and `no Malay labels`.

- [ ] **Step 4: Replace the starter README**

Replace `apps/web/README.md` with:

```markdown
# wtfish web

Static Astro site: the fish directory and fish pages.

## Commands

Run from `apps/web/`:

| Command | What it does |
| :-- | :-- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server at `http://localhost:4321` |
| `pnpm build` | Build to `dist/` (resizes photos with sharp, downloads fonts) |
| `pnpm test` | Unit tests |
| `pnpm test:build` | Build, then check the built pages |
| `pnpm import-data <id…>` / `pnpm fetch-photos <id>` | Fill fish data — see `data/fish/README.md` |

## Where things live

- `data/fish/<id>.json` — one file per fish; `data/photos/<id>/` — its photos.
- `src/styles/global.css` — Tailwind design tokens (colours, fonts, shadows, motion).
- `src/components/` — Astro components; `FilterBar.tsx` is the only React island (Base UI).
- `src/lib/` — pure helpers, unit-tested in `tests/`.
- `tests/build/` — checks that read `dist/` after a build.
```

- [ ] **Step 5: Full manual review**

Start the dev server with `pnpm astro dev --background`.

At **390 px** and **1280 px** wide, walk through:
- home, using every filter;
- the sailfish, the giant featherback and the dwarf rasbora pages;
- `/identify/`, `/about/`, and a missing page such as `/nope/`, which should show the 404.

For each page, check:
1. It matches the spec's description of that page.
2. Nothing scrolls sideways at 390 px.
3. Every interactive element is reachable by keyboard and shows the focus ring.
4. With reduced motion emulated, nothing moves.
5. The browser tab shows the red hook icon.

Stop the server with `pnpm astro dev stop`. Note anything that differs from the spec, fix it, and re-run `pnpm test && pnpm test:build`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/tests/build/english-only.test.ts apps/web/README.md
git commit -m "test(web): check built pages stay english-only"
```

- [ ] **Step 7: Report**

Report to the user:
- each task's commit hash (`git log --oneline af7b85d..HEAD`);
- the final test counts for `pnpm test` and `pnpm test:build`;
- anything from the manual checks that still differs from the spec.

Do not merge or push.
