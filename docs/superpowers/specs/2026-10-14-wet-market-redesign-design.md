# Wet-market redesign — design

## Context

`apps/web` (Astro 7.3, static) now holds 69 sourced fish profiles, 68 with
photos, built on branch `feat/malaysia-fish-profiles`. The user finds the site
"so plain". It uses the system font, white boxes and plain headings, and the
home page shows no photos even though almost every fish has one.

The design direction was chosen in a brainstorming session with browser
mockups. Those mockups are stored locally in `.superpowers/brainstorm/`, which is
gitignored. This work happens on branch `feat/wet-market-redesign`, which is
branched from `feat/malaysia-fish-profiles`. That branch is not yet merged into
`main`.

## Decisions

- **Look: "wet market".**
  - Background: white tiles with grey grout.
  - Header: a red shop-sign band with yellow trim.
  - Cards and panels: ink-outlined, with hard offset shadows.
  - Labels: written on cardboard tags in a hand-written marker font, like stall
    signs.
- **Fonts.** Bricolage Grotesque is used for everything. Permanent Marker is
  used only on cardboard tags, signs and the "Before you fish" heading.
- **Logo.** The wordmark "wtfish" ends in a "?" drawn as a fishing hook, and the
  hook's eye forms the dot. The hook on its own is the favicon.
- **Fish touches.**
  - A cardboard sign hangs on a fishing line from the header.
  - Bubbles rise behind the headline.
  - A fish swims past under the header (home page only).
  - Sizes are shown on a measuring tape.
  - Water types have icons.
  - A confused-fish mascot appears in empty states, the coming-soon pages and the
    404 page.
- **Fish page layout: "Poster".** A wide hero photo sits at the top, with the
  name card overlapping it. Below that, every section is stacked in one column.
- **Light theme only.** Dark mode is a possible later project, for example a
  "night market" theme.
- **English only.**
  - No Malay appears anywhere on the site: not in labels, not as fish names, and
    not in search.
  - Malay names stay in the data files for a possible future multilingual
    version.
- **Cardboard tags show what the fish is for**: Sport, Food or Aquarium, joined
  with " · ".
- **Header links.**
  - "Fish" goes to the home page.
  - "Identify" and "About" go to "coming soon" pages.
- **Stack.**
  - Tailwind v4.
  - React islands using Base UI, with no UI kit and no shadcn.
  - Photos are resized by sharp through Astro's `<Picture>` and lazy-loaded.

## Stack changes (`apps/web`)

| Package | Version | Why |
|---|---|---|
| `tailwindcss`, `@tailwindcss/vite` | 4.3.3 | Styling. Registered as a Vite plugin; the deprecated `@astrojs/tailwind` is not used |
| `@astrojs/react` | 7.0.1 | React islands |
| `react`, `react-dom` | 19.3.0 | Runtime for islands |
| `@types/react`, `@types/react-dom` | 19.3.0 | Types (dev) |
| `@base-ui/react` | 1.9.0 | Unstyled, accessible building blocks inside islands |
| `sharp` | 0.35.5 | Image processing. Listed directly so it is never skipped as an optional dependency |

- **Peer dependencies.** `@astrojs/react` and `@base-ui/react` list extra peers
  (`oxc-transform-react`, `date-fns`). The plan checks whether these are
  optional, and installs them only if pnpm warns.
- **Fonts.** Fonts use Astro's built-in fonts API (`fonts` in
  `astro.config.mjs`, `fontProviders.google()`). Font files are downloaded at
  build time and served from the site itself, so visitors never contact Google.
  Builds therefore need network access, which Cloudflare's builder has.
  - Bricolage Grotesque: weights `400 800` (variable), normal style, latin.
  - Permanent Marker: weight 400.
- **Old styles go.** All hand-written CSS in `Base.astro` and the pages is
  replaced by Tailwind.

## Design tokens

Tokens are defined once in `src/styles/global.css` (Tailwind `@theme`).

| Token | Value | Use |
|---|---|---|
| ink | `#1a1a1a` | Text, outlines, hard shadows |
| muted | `#555555` | Secondary text |
| sign-red | `#c8102e` | Header band |
| sign-yellow | `#ffd23f` | Header trim, logo "wt" and hook, highlights, notice board, threatened badges |
| cardboard | `#e2c391` | Tags and signs |
| tile / grout | `#f6f8f8` / `#dde5e8` | Page background: 30 px tile grid |
| fresh | `#1d7a4a` | Freshwater label |
| brackish | `#0e6b6b` | Brackish label |
| salt | `#1559a0` | Saltwater label, recorded states on the map |
| alert | `#b00d28` | Sizes, IUCN codes for threatened fish |

- **Outlines and corners.** Outlines are 2 px ink. Corners are rounded 8–10 px.
  The hard shadow is `5px 5px 0` ink, with no blur.
- **Contrast.** Every text/background pair meets WCAG AA, and the plan checks
  each pair.
- **Font variables.** Astro's font variables are named `--astro-font-bricolage`
  and `--astro-font-marker`. Tailwind's `--font-sans` and `--font-marker` point
  at them. Different names avoid a circular reference.
- **Scientific names** use a synthesised slant of Bricolage, which has no true
  italic. This is acceptable for a sans-serif typeface.
- **Water labels.** The labels keep the existing `WATER_LABEL` text: Freshwater,
  Brackish, Saltwater. The mockups said "Sea"; "Saltwater" is the user's own word
  and is already in the code.

## Shared elements

- **Icons.** Icons are inline SVG Astro components, `aria-hidden`.
  - Hook (bullet points)
  - Hook "?" (logo)
  - Wave (saltwater)
  - Droplet (freshwater)
  - Droplet with a wave inside (brackish)
  - Generic fish silhouette (left- and right-facing)
  - Person (170 cm reference)
  - Adult hand (18 cm reference)
  - Confused fish: a yellow fish with a raised eyebrow and bubbles
- **Use tag.** A cardboard label in Permanent Marker, tilted -4°. It swings to
  +3° on card hover. The text is the short use labels (`Sport`, `Food`,
  `Aquarium`) joined with " · ".
- **Water label.** A coloured chip with an icon and a word, for example
  "Saltwater". A fish with several water types shows one chip per type.
- **Motion.** All motion is CSS only:
  - tag swing;
  - card lift;
  - hanging-sign sway (3.2 s);
  - bubbles rising (5 s, staggered);
  - fish swimming across (about 16 s).

  `@media (prefers-reduced-motion: reduce)` turns off every animation and
  transition.
- **Focus.** Every focusable element shows a visible ring: a yellow outline
  inside an ink outline.

## Site shell (every page)

- **Header.**
  - A red band with a 5 px yellow bottom trim.
  - The logo, which links to `/`.
  - The links **Fish · Identify · About**. The link for the current page is
    underlined and has `aria-current="page"`.
  - Everything fits on one line at 390 px wide.
- **Footer.**
  - One line: "Every fact links to its source. Photos are by iNaturalist and
    Wikimedia Commons contributors, credited on each fish's page."
  - A small hook logo.
- **Favicon.**
  - `public/favicon.svg` becomes the hook "?".
  - `public/apple-touch-icon.png` (180×180) is generated once with sharp from
    that SVG.
  - `favicon.ico` and its `<link>` are removed.
- **Default meta description.** "A fish directory starting with Malaysia's fish:
  names, habitat, where they live and how to identify them."

## Home page (`/`)

Top to bottom:

1. **Swimming fish.** A strip under the header where a fish silhouette swims
   across now and then.
2. **Hero.**
   - Headline: "What the fish is that?"
   - Bubbles rise behind the headline.
   - A cardboard sign hangs from the header on a fishing line with a small hook,
     reading "**{count} fish & counting**". The count is the number of fish in
     the collection.
   - From 768 px, the headline and the sign share the top row, and the search
     and filters run full width beneath them. Below 768 px, the sign hangs
     above the headline. The headline stays first in the HTML.
   - The sign's line always starts at the header's bottom edge. Under reduced
     motion the swimming fish is hidden but its strip keeps its height.
3. **Search and filters.** These are one React island, `FilterBar.tsx`, loaded
   with `client:load` and built from Base UI.
   - **Search field.** Placeholder: "Search by name or scientific name…"
   - **Water.** A single-choice toggle group: All · Freshwater · Brackish ·
     Saltwater, with icons.
   - **Use.** A single-choice toggle group: All · Sport · Food · Aquarium.
   - **In Malaysia.** A select: Anywhere · Found in Malaysia · Native · Endemic ·
     Introduced · Invasive.
   - **State.** A select listing only the states that some fish has a record
     for. It is hidden if there are none.
   - **Threatened only.** A checkbox for VU, EN and CR.
   - **Live count.** For example "12 fish", announced with `aria-live="polite"`.
   - **Phones.** The pill rows scroll sideways.
   - **From 768 px.** When there is room, the Water and Use groups sit side by
     side, and the selects and checkbox follow on the next row.

   The island receives the recorded states and the total count as props. It
   does not render the cards. On every change, it builds a `FilterQuery` and
   calls `applyFilter`, which uses the existing `matches()`. `applyFilter` hides
   the server-rendered cards that do not match and returns the number shown.

   Without JavaScript, all fish stay visible.
4. **Fish cards.** These are Astro components, sorted A–Z by English name, in a
   grid with a minimum column width of 16 rem. Each card is one link to the fish
   page and contains:
   - **Photo.** The first photo, 4:3 (see Photos), with empty `alt` because the
     name is in the link text. Without a photo, the slot shows a tiled
     placeholder with a fish outline and "No photo yet".
   - **Use tag** over the photo's top-left corner.
   - **Names.** The English name in bold and the scientific name slanted.
   - **Measuring tape** (only if `size` exists). It uses a **log scale from 1 cm
     to 5 m**, the same on every card, with ticks at 1 cm, 10 cm, 1 m and 5 m.
     A fish marker sits at `maxCm`, and the text "up to {maxCm} cm" is shown
     beside it.
   - **Bottom row.** Water labels, and "{n} states" if states are recorded.
   - **Hover.** The card lifts with a hard shadow and the tag swings.
5. **Empty result.** This is static Astro markup that the island shows and
   hides. It contains:
   - the confused fish;
   - the text "No fish match that. Even the fish is confused.";
   - a **Clear filters** button. The island wires this button to reset its
     state.

## Fish page (`/fish/{id}/`)

There is one column, 760 px maximum width, on the tile background. Every block
appears only when its data exists.

1. **Hero photo.**
   - Full width, 21:8 aspect ratio (4:3 on phones).
   - Loaded eagerly with `fetchpriority="high"`.
   - `alt` is "Photo of {english}".
   - A credit chip in the bottom-right corner links the credit to the photo's
     page and the licence to the Creative Commons page.
   - With no photo, there is no hero and the name card sits at the top.
2. **Name card.** It overlaps the hero by 70 px (32 px on phones) and has a hard
   shadow. It contains:
   - an "← All fish" link;
   - the English name (`h1`);
   - the scientific name;
   - the use tag;
   - "Also called …", listing `names.other` (English only);
   - badges for:
     - water labels;
     - status in Malaysia;
     - IUCN status: yellow for VU, EN and CR; ink with white text for EW and EX;
       white otherwise;
   - a red "Not yet fact-checked" stamp when `lastReviewed` is missing.
3. **Summary.** The lead paragraph.
4. **Quick stats.** One tile for each value that exists:
   - max length, plus "usually {commonCm} cm" if known;
   - max weight;
   - IUCN code and label;
   - status in Malaysia;
   - family, plus order if known.

   When IUCN is shown, a note follows: the category comes from Wikidata and may
   lag the latest Red List assessment. If the fish has an `iucnNote`, it is
   added to that note.

   Phones show two tiles per row; from 640 px the tiles share one row. The
   family tile always takes a row of its own, so a long family name never
   breaks mid-word.
5. **How big?**
   - A fish silhouette drawn to scale next to a reference figure, with a linear
     measuring tape underneath.
   - The reference is a **person (170 cm)** when `maxCm ≥ 50`, otherwise an
     **adult hand (18 cm)**.
   - The scale is the first entry in this list whose maximum is at least
     `max(maxCm, reference)`:

     | Scale maximum (cm) | Tick step (cm) |
     |---|---|
     | 10 | 2 |
     | 20 | 5 |
     | 50 | 10 |
     | 100 | 20 |
     | 200 | 50 |
     | 300 | 100 |
     | 400 | 100 |
     | 500 | 100 |
     | 600 | 100 |
     | 800 | 200 |
     | 1000 | 200 |

   - Ticks below 100 cm are labelled in cm, from 100 cm up in metres ("1.5 m").
   - Caption: "Up to {maxCm} cm (and {maxKg} kg). The person is 170 cm tall."
     For the hand version, the second sentence is "The hand is 18 cm long."
6. **How to identify.**
   - The features, with hook bullets.
   - **Look-alikes** as small cards, each with:
     - the other fish's photo thumbnail, or an outline if it has no photo;
     - its English name, linked to its page;
     - the difference text.
7. **Habitat.**
   - Environment chips.
   - The description.
   - "Diet: …"
   - "Native range: …"
8. **Where in Malaysia.**
   - A **tile map** of all 16 states and federal territories (positions below).
     States with records are filled in the saltwater colour with an ink outline.
   - **Spot pins.** A spot gets a numbered yellow pin when its text names a state
     (`stateOfSpot`). The spots are also listed below the map with their numbers.
   - The sentence "Recorded in …", then the existing note: "Based on {n}
     open-licence records on GBIF. Few records can mean few surveys, not few
     fish." The sentence is the map's text equivalent.
9. **Catching it.**
   - Season.
   - Methods, as chips.
   - Baits.
   - Difficulty.
10. **Before you fish.**
    - A yellow notice board with a hard shadow.
    - The heading is in Permanent Marker.
    - It shows `malaysia.rules`, then: "Rules change and differ by state. Check
      with your state Fisheries Office before you fish. Last checked {date}."
11. **Eating.** A paragraph.
12. **Aquarium care.** Stat tiles for:
    - minimum tank (litres);
    - temperature;
    - pH;
    - temperament;
    - group size.
13. **More photos.**
    - A two-column gallery of the remaining photos.
    - Each photo has a credit and licence underneath.
    - `alt` is "{english}, photo {n}".
14. **Sources.**
    - A numbered list. Each item shows the host name without `www.`, plus a
      "PDF" label when the path ends in `.pdf`.
    - Each item links to the full URL, which is also in its `title`.
    - The list ends with "Last reviewed {date}." or "This profile has not been
      fact-checked yet."

**Page title.** "{english} ({scientific}) | wtfish". The description is the
summary.

### Tile map positions (8 columns × 5 rows; column, row, spans)

| State | Code | Col | Row | Span |
|---|---|---|---|---|
| Perlis | PLS | 1 | 1 | |
| Kedah | KDH | 2 | 1 | |
| Kelantan | KTN | 3 | 1 | |
| Terengganu | TRG | 4 | 1 | |
| Pulau Pinang | PNG | 1 | 2 | |
| Perak | PRK | 2 | 2 | |
| Pahang | PHG | 3 | 2 | 2 rows |
| Selangor | SGR | 1 | 3 | |
| Kuala Lumpur | KUL | 2 | 3 | |
| Putrajaya | PJY | 2 | 4 | |
| Negeri Sembilan | NSN | 3 | 4 | |
| Melaka | MLK | 3 | 5 | |
| Johor | JHR | 4 | 4 | 2 rows |
| Labuan | LBN | 6 | 1 | |
| Sabah | SBH | 7 | 1 | 2 cols |
| Sarawak | SWK | 5 | 2 | 2 cols |

- Each tile's `title` and accessible name is the full state name.
- **`stateOfSpot(text)`** returns the state whose name appears last in the text,
  for example "Kuala Rompin, Pahang" → Pahang. If no state is named, it returns
  `undefined`.

## Other pages

- **`/identify`.**
  - The confused fish.
  - "Identify is coming soon".
  - "Snap a photo of a fish and find out what it is. We're working on it."
- **`/about`.**
  - The confused fish.
  - "About is coming soon".
  - "Who we are, where the facts come from and how photos are licensed."
- **`404`.**
  - The confused fish.
  - "This page swam off."
  - A link to all fish.

## Photos

- **Location.** Photos move from `public/photos/{id}/` to `data/photos/{id}/`
  with `git mv`. The JSON `photos[].file` values do not change.
- **Lookup: `src/lib/photos.ts`.**
  - It loads every photo with
    `import.meta.glob('/data/photos/*/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })`.
  - It exports `photoFor(id, file): ImageMetadata`.
  - When a photo is missing, it throws an error naming the fish id and the file,
    which fails the build.
- **Rendering.** Photos use Astro `<Picture>` with formats `avif` and `webp` and
  a JPEG fallback. Images load lazily except the hero.

  | Where | Widths | `sizes` |
  |---|---|---|
  | Card | 320, 480, 640 | `(min-width: 1152px) 280px, (min-width: 640px) 45vw, 92vw` |
  | Hero | 640, 960, 1280, 1600 | `100vw` |
  | Gallery | 400, 800 | `(min-width: 760px) 370px, 46vw` |
  | Look-alike | 160, 320 | `160px` |

- **Scripts and tests.** `scripts/fetch-photos.ts` writes to `data/photos/{id}/`.
  `tests/data.test.ts` checks for photos there.
- **Credits.** Every photo shown large has its credit and licence beside it. Card
  thumbnails link to the fish page, which carries the credits. The footer says
  so.

## English-only content (data clean-up)

- **Schema.** Add an optional `names.malayOther: string[]` (non-empty strings).
  `names.malay` stays. Neither field is rendered or searched.
- **Other names.** In the 32 files that have `names.other`, move Malay variants
  (for example "Gerepoh", "Mamung") into `malayOther`. English names and English
  angler slang (for example "GT") stay in `other`.
- **Prose.** In the 24 files where a Malay fish name appears in prose, rewrite it
  to the English name without changing facts. For example, "Haruan is an
  adaptable…" becomes "The striped snakehead is an adaptable…".
  - Prose fields:
    - summary;
    - identify features and look-alike differences;
    - habitat description;
    - eating;
    - malaysia rules;
    - fishing season.
  - Place names in `spots` are left alone.
- **Search.** `searchText()` drops Malay and searches English, other (English)
  and scientific names. The filter tests are updated to match.
- **Guard test.** No prose field may contain any fish's `names.malay` or
  `malayOther` as a whole word, case-insensitive. An allowlist covers names that
  are also English words: `tilapia` and `pacu`.
- **Name case.** English names use sentence case: the first word and proper
  nouns only ("Atlantic blue marlin", "Indo-Pacific sailfish"). A data test
  enforces it.
- **IUCN note.** An optional, hand-written `iucnNote` explains a category that
  seems to clash with the page, such as the giant featherback: extinct on the
  Red List, but rediscovered since. It needs `iucn`.

## Code layout

- **`astro.config.mjs`.** Adds `react()`, the `tailwindcss()` Vite plugin and
  the two fonts.
- **`src/styles/global.css`.** Contains:
  - `@import "tailwindcss"`;
  - `@theme` tokens;
  - base styles: tile background, focus ring, reduced motion;
  - a few `@utility` classes for repeated pieces: ink card, hard shadow,
    cardboard.
- **`src/layouts/Base.astro`.**
  - `<head>` with `<Font>` tags, favicons and meta.
  - The header, the footer and a slot.
- **`src/components/`**, one job each:
  - **Site:** `SiteHeader`, `SiteFooter`, `Logo`, `icons/*`.
  - **Home:** `FishCard`, `UseTag`, `WaterLabel`, `CardTape`, `HangingSign`,
    `Bubbles`, `SwimmingFish`, `ConfusedFish`.
  - **Fish page:** `Photo` (Picture plus credit), `StatTiles`, `SizeCompare`,
    `StateTileMap`, `Notice`, `Section`, `LookAlikeCard`.
  - **Island:** `FilterBar.tsx` (React, Base UI), the only island.
- **`src/lib/`** holds pure, tested helpers:
  - **`size.ts`**
    - `cardTapePosition(cm)`: 0–1 on the log scale, clamped.
    - `sizeComparison(maxCm)`: returns the reference, the scale maximum, the
      step and labelled ticks.
  - **`state-tiles.ts`:** `STATE_TILES` and `stateOfSpot`.
  - **`sources.ts`:** `sourceLabel(url)` returns `{ host, pdf }`.
  - **`filter-dom.ts`:** `applyFilter(cards, query)` returns the number shown.
  - **`photos.ts`.**
  - **`labels.ts`:** adds `USE_SHORT_LABEL`.
- **Pages.** `index.astro`, `fish/[id].astro`, `identify.astro`, `about.astro`
  and `404.astro`.

## Accessibility

- Contrast meets WCAG AA for every token pair.
- Decorative SVGs, bubbles, the swimming fish and the hanging sign's line and
  hook are `aria-hidden`. The sign's text is real text.
- Base UI provides keyboard behaviour and ARIA for toggles, selects and the
  checkbox.
- The count is announced politely.
- Reduced motion turns off all animation.
- All interactive targets are at least 24×24 px.

## Testing

- **Unit tests (`pnpm test`, Vitest).**
  - **`size`**
    - Tape positions:
      - 1 cm → 0
      - 500 cm → 1
      - 10 cm → about 0.37
      - values outside the range are clamped
    - Comparisons:
      - 2.5 cm → hand, 20 cm scale, 5 cm step
      - 11 cm → hand, 20 cm scale
      - 45 cm → hand, 50 cm scale, 10 cm step
      - 50 cm → person, 200 cm scale, 50 cm step
      - 180 cm → person, 200 cm scale
      - 350 cm → person, 400 cm scale, 100 cm step
      - tick labels switch to metres at 100 cm
  - **`state-tiles`**
    - Every state has a tile.
    - Codes are unique.
    - No two tiles overlap.
    - `stateOfSpot` cases:
      - "Kuala Rompin, Pahang" → Pahang
      - "Johor Bahru, Johor" → Johor
      - no state named → `undefined`
  - **`sources`:** host without `www.`, PDF detection, and the path is ignored
    otherwise.
  - **`filter`:** Malay names are no longer searchable, and English and
    scientific names still are.
  - **`filter-dom`:** hides non-matching cards, shows matching ones and returns
    the count.
  - **`data`**
    - Photos exist in `data/photos/`.
    - `malayOther` passes the schema.
    - The no-Malay-in-prose guard passes.
- **Build check (`pnpm test:build`, run after `pnpm build`).** This is a
  separate Vitest include. It checks that:
  - every fish has a page;
  - `/`, `/identify/`, `/about/` and `404.html` exist;
  - the giant featherback page has no hero `<picture>`;
  - the sailfish page contains "Before you fish" and a fish without
    `malaysia.rules` does not;
  - no built HTML contains any `names.malay` or `malayOther` value (same
    allowlist);
  - the card count on `/` equals the number of fish.
- **Manual check.**
  - Widths: 390 px and 1280 px.
  - Pages:
    - home;
    - sailfish (richest);
    - giant featherback (no photo);
    - dwarf rasbora (smallest, hand scale);
    - identify, about and 404.
  - Keyboard-only use of every filter.
  - Reduced motion turned on.

## Out of scope

- Dark mode.
- A Malay or multilingual site.
- The Identify feature itself.
- About page content.
- Filters stored in the URL.
- Social preview images.
- Deployment.
