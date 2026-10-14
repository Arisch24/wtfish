# Quiet restyle — design

## Context

The wet-market redesign (`2026-10-14-wet-market-redesign-design.md`) is built on
branch `feat/wet-market-redesign`. The review fixes are also applied, in
commits `699c588..33e802d`. The user likes its personality but finds the styling
"too bold for an informational site".

The reference is OpenDOSM (https://open.dosm.gov.my/). The user likes its
compact layout, its fonts and its data-first feel, and wants to copy its
**styling, not its colours**. Every colour here comes from our existing palette.

The choices below were made in a brainstorming session with browser mockups.
The mockups are stored locally in `.superpowers/brainstorm/`, which is
gitignored.

This spec replaces the **visual** parts of the wet-market spec. The parts listed
under "Still valid" below stay in force unchanged.

## Decisions

- **Keep every personality piece; quiet the styling.** These stay, smaller and
  calmer:
  - the marker font;
  - the cardboard tags and the hanging sign;
  - the bubbles and the swimming fish;
  - the tiled background;
  - the measuring tapes, the silhouettes and the state tile map;
  - the confused fish.
- **Styling modelled on OpenDOSM.**
  - Thin 1 px borders instead of 2–3 px ink outlines.
  - No hard ink shadows.
  - Smaller headings and 14–15 px text.
  - Small uppercase labels above values.
  - Short notes beside section headings.
  - Sections separated by thin lines instead of boxes.
- **Fonts.** Bricolage Grotesque for headings, Inter for text and data.
  Permanent Marker for tags and signs only.
- **Header.** White, with a thin line underneath. Red appears only in the logo.
  The accent colour is salt blue.
- **Fish page: dashboard layout.** Text on the left and the photo on the right,
  then a stats strip, then sections in rows. Content sits in a fixed-width
  container, never full width.
- **Our colours only.** Soft fills are light tints of our own colours. No
  colours are borrowed from OpenDOSM.
- **Branch.** The work continues on `feat/wet-market-redesign`. It's a restyle
  of that branch's unmerged work, so it needs no branch of its own.

## Still valid from the wet-market spec

These sections and rules stay unchanged:
- the stack: Tailwind v4, React islands with Base UI, sharp and `<Picture>`;
- the header links and the coming-soon pages;
- English only, and the whole "English-only content" section, including name
  case and `iucnNote`;
- Photos: location, lookup, credits;
- the size scales and the tick labels;
- the tile map positions and `stateOfSpot`;
- filter behaviour: `applyFilter`, and everything stays visible without
  JavaScript;
- the light theme only;
- the "Out of scope" list.

Where the wet-market spec describes how something **looks**, this spec wins.

## Fonts

All three fonts load through Astro's fonts API (`fontProviders.google()`) and
are served from the site itself.

| Font | Weights | Styles | CSS variable | Used for |
|---|---|---|---|---|
| Inter | 400–600 (variable) | normal, italic | `--astro-font-inter` | All text, data and controls (Tailwind `--font-sans`) |
| Bricolage Grotesque | 600–700 (variable) | normal | `--astro-font-bricolage` | Logo, page titles, section headings, fish names on cards (Tailwind `--font-display`) |
| Permanent Marker | 400 | normal | `--astro-font-marker` | Use tags, the hanging sign, the "Before you fish" heading |

- **Scientific names** use Inter's true italic. They no longer use a synthesised
  slant.
- **Type scale:**

  | Role | Font | Size and weight | Notes |
  |---|---|---|---|
  | Page title | Bricolage | 30 px (26 px on phones), 700 | letter-spacing −0.035em |
  | Section heading | Bricolage | 19 px, 700 | letter-spacing −0.02em |
  | Card fish name | Bricolage | 16 px, 600 | |
  | Lead text | Inter | 15 px | |
  | Body and UI | Inter | 14 px | |
  | Small text | Inter | 13 px | |
  | Labels, meta, credits | Inter | 12 px | |
  | Stat label | Inter | 11 px, 500, uppercase | letter-spacing 0.05em |
  | Stat value | Inter | 19 px, 600 | tabular numbers |

- **Minimum size.** No functional text is smaller than 11 px.

## Colours

The token values in `src/styles/global.css` do not change. Only their roles
change.

| Token | Value | Role now |
|---|---|---|
| ink | `#1a1a1a` | Text |
| muted | `#555555` | Secondary text; mixed with white for `control` and `hover-line` (below) |
| grout | `#dde5e8` | Borders and dividers (1 px); grid lines of the tile pattern |
| tile | `#f6f8f8` | Neutral soft fill (neutral chips, the footer, the no-photo placeholder); base of the tile pattern |
| salt | `#1559a0` | The accent: links, the small labels above titles, the current nav item, selected pills, the hook bullets; also the saltwater colour and recorded map states |
| sign-red | `#c8102e` | The logo only ("wt" and the hook) |
| sign-yellow | `#ffd23f` | Measuring tapes and map spot pins; tinted for threatened IUCN chips and the "Before you fish" panel |
| cardboard | `#e2c391` | Use tags and the hanging sign |
| fresh | `#1d7a4a` | Freshwater chip text |
| brackish | `#0e6b6b` | Brackish chip text |
| alert | `#b00d28` | Threatened IUCN codes; "Not yet fact-checked" |

**Tints** are solid colours: a token mixed with white. Each is defined once as a
token in `@theme` with `color-mix(in srgb, <token> <n>%, white)`. They are not
made with Tailwind opacity modifiers, because chips sit on the tile pattern and
a see-through fill would show the grid lines through them.

| New token | Mix | Used for |
|---|---|---|
| `salt-soft` | salt 10% | Saltwater chips, the current nav item, the selected pill |
| `salt-ring` | salt 40% | The ring of the selected pill |
| `fresh-soft` | fresh 10% | Freshwater chips |
| `brackish-soft` | brackish 10% | Brackish chips |
| `threat-soft` | sign-yellow 55% | Threatened IUCN chip (VU, EN, CR) |
| `notice` | sign-yellow 15% | "Before you fish" background |
| `notice-line` | sign-yellow 70% | "Before you fish" border |
| `control` | muted 70% (about `#888`) | Borders of the search box, selects, checkbox and the "Clear filters" button |
| `hover-line` | muted 40% | Card border on hover |

| Element | Background | Text or border |
|---|---|---|
| Water chips | `fresh-soft`, `brackish-soft`, `salt-soft` | the matching full token |
| Current nav item, selected pill | `salt-soft` | `salt` text, `salt-ring` ring |
| Threatened IUCN chip (VU, EN, CR) | `threat-soft` | `ink` text |
| Extinct IUCN chip (EW, EX) | `ink` | white text |
| Other IUCN and status chips | `tile` | `ink` text, `grout` ring |
| "Before you fish" panel | `notice` | `notice-line` border |

**Contrast.**
- Every text pair meets WCAG AA: 4.5:1, or 3:1 for large text. The checked
  values are:

  | Pair | Contrast |
  |---|---|
  | salt on `salt-soft` | 6.06 |
  | fresh on `fresh-soft` | 4.66 (the tightest; don't lighten `fresh`) |
  | brackish on `brackish-soft` | 5.43 |
  | ink on `threat-soft` | 14.09 |
  | ink on `notice` | 16.39 |
  | muted on tile | 6.99 |
- Form-control borders must reach 3:1 against white. That's why they use
  `control`, not grout: `control` gives 3.54.
- Grout lines are decoration only. They are never the only sign of a control's
  edge.

## Shape, depth and motion

- **Corners.**
  - Cards and panels: 12 px.
  - Photos inside cards: 12 px at the top. Standalone photos: 12 px.
  - Search box: 8 px.
  - Buttons and selects: 6 px.
  - Pills and chips: fully rounded.
  - Map tiles: 4 px.
- **Borders.** 1 px grout, except form controls and buttons (1 px `control`).
- **Shadows.**
  - None on cards, panels or the name block.
  - Dropdown menus get one soft shadow: `0 8px 24px rgb(26 26 26 / 0.08)`.
  - Cardboard tags and the hanging sign keep a small offset paper shadow:
    `1px 2px 0 rgb(0 0 0 / 0.12)`.
- **Focus.** A 2 px salt outline at 2 px offset. It replaces the yellow-in-ink
  ring.
- **Motion.** The same set as before, all CSS only:
  - The sign sways (3.2 s) within ±2°.
  - Bubbles rise (5 s): four bubbles of 6–9 px with `salt/30` outlines.
  - The swimming fish crosses (16 s) at 35% opacity, 32 px long.
  - On card hover, the card lifts 2 px, its border turns `hover-line` and the
    tag swings.
  - `prefers-reduced-motion: reduce` stops every animation and transition. The
    swimming strip keeps its height.

## Site shell

- **Container.** One width everywhere: 1152 px maximum, with 16 px side gutters
  on phones and 24 px from 640 px. Background bands and dividers may run edge to
  edge; their content stays in the container.
- **Header.**
  - White, with a 1 px grout line underneath, about 56 px tall.
  - The logo is Bricolage 700, 21 px: "wt" in sign-red, "fish" in ink, and the
    hook "?" in sign-red.
  - The links Fish · Identify · About are Inter 14 px, weight 500, with 6 px
    corners. The current page has `aria-current="page"`, `salt` text and a
    `salt-soft` background.
  - Everything fits on one line at 360 px.
- **Footer.**
  - Tile background with a 1 px grout line on top.
  - The same text as now ("Every fact links to its source. Photos are by
    iNaturalist and Wikimedia Commons contributors, credited on each fish's
    page."), in 13 px muted.
  - A small logo. The red badge behind it goes.
- **Favicon.** Unchanged.

## Home page (`/`)

1. **Top band** (tile pattern, edge to edge).
   - **Swimming strip.** A 36 px strip at the top of the band, where the fish
      swims across.
   - **Left column:**
     - a small uppercase label in salt, "Fish directory · Malaysia first";
     - "What the fish is that?" as the page title;
     - a 15 px muted lead, "Names, sizes, habitat and where each fish lives in
       Malaysia. Every fact links to its source.";
     - a 12 px muted meta line, "Last updated {date}". The date is the newest
       `lastReviewed` of all fish, formatted with the existing `formatDate`
       (for example "13 October 2026"). The line is left out if no fish has
       been reviewed.
   - **Right column.** The cardboard sign "{count} fish & counting" in marker,
     16 px, hangs on a 1 px line with a small hook. The line starts at the
     header's bottom edge.
   - **Bubbles** rise behind the title.
   - **Placement.** From 768 px, the title and the sign share the row. Below
     768 px, the sign hangs above the title. The title stays first in the HTML.
2. **Filter bar.** A white band with 1 px grout lines above and below, holding
   the `FilterBar` island.
   - A full-width search box with a search icon. The placeholder stays "Search
     by name or scientific name…".
   - One wrapping row of controls:
     - Water pills (All · Freshwater · Brackish · Saltwater, with icons);
     - Use pills (All · Sport · Food · Aquarium);
     - the "In Malaysia" and "State" selects;
     - the "Threatened only" checkbox;
     - the live count ("{n} fish", `aria-live="polite"`), pushed to the right.
   - **Group labels.** Each pill group has a small muted label beside it.
   - **Pills.** Unselected pills are muted text with no fill. The selected pill
     has `salt` text, `salt-soft` fill, a `salt-ring` ring and weight 600.
   - **Phones.** The controls stack and the pill rows scroll sideways.
   - **Behaviour** is unchanged.
3. **Cards.** On white, in the same grid as now (minimum column 16 rem, 16 px
   gaps, A–Z).
   - **Card.** White, 1 px grout border, 12 px corners.
   - **Photo.** 16:10, cropped by CSS.
   - **No photo.** A tiled placeholder with the fish outline in grout and "No
     photo yet".
   - **Use tag.** A cardboard tag, 14 px marker, on the photo's top-left corner,
     tilted −3°. It sits inside the card, not over its edge.
   - **Names.** The English name in Bricolage 16 px/600. The scientific name in
     Inter 13 px italic, muted.
   - **Size row** (only if `size` exists): "Size" on the left and "up to
     {maxCm} cm" on the right, in 12 px. Below it, a 6 px tape on the same log
     scale as now, with a `sign-yellow` fill on a `tile` track.
   - **Bottom row.** Water chips on the left, "{n} states" (12 px muted) on the
     right.
4. **No results.** Static markup that the island shows and hides:
   - the confused fish at 96 px;
   - "No fish match that." in Bricolage 18 px;
   - "Even the fish is confused. Try fewer filters." in muted text;
   - a "Clear filters" button: white, with a `control` border and 6 px corners.

## Fish page (`/fish/{id}/`)

Everything sits in the 1152 px container. Every block appears only when its data
exists.

1. **Header band** (tile pattern, edge to edge). From 768 px it has two columns:
   text (about 7/12) and photo (about 5/12). Below 768 px, the photo comes
   first, then the text.
   - **Text column:**
     - "← All fish": salt, 13 px, weight 500.
     - A small uppercase label in salt: "Fish profile · {family}".
     - The English name (`h1`) and the scientific name (15 px italic, muted).
     - One wrapping row of chips: the use tag (marker), the water chips, the
       Malaysia status chip (for example "Native to Malaysia") and the IUCN chip
       ("{label} (IUCN)", tinted as in Colours).
     - "Also called {names}" in 13 px muted, when `names.other` exists.
     - The summary, 15 px, at most 40 rem wide.
     - **Meta line**, 12 px muted: "Last reviewed {date} · {n} sources", with
       the date from `formatDate`. An unreviewed fish shows a red-outlined "Not
       yet fact-checked" chip instead.
   - **Photo column.**
     - The first photo, 4:3, with 12 px corners and a 1 px grout border.
     - It loads eagerly with `fetchpriority="high"`, and its `alt` is "Photo of
       {english}".
     - The credit and licence links sit underneath, right-aligned, 12 px.
     - With no photo, the column is left out and the text takes the full width.
2. **Stats strip.** A white band with 1 px grout lines above and below. It holds
   one item for each value that exists:
   - max length, with "usually {commonCm} cm" as a note underneath;
   - max weight;
   - IUCN: the code (alert red when threatened) with the label in small muted
     text;
   - in Malaysia;
   - family, with "order {order}" as a note underneath.

   Each item has a stat label above its value; there are no boxes.
   - **Columns.** From 1024 px, all items share one row. Below 1024 px, they go
     two per row and the family takes a row of its own; the family keeps
     `wide: true`. At 1024 px, each of five items is about 180 px wide, enough
     for the longest family name ("Rachycentridae", 145 px in Inter 600 at 19 px).
     Below that, a narrower row would break it mid-word.
   - **Note.** Under the strip, 12 px muted: "IUCN category from Wikidata; it
     may lag the latest Red List assessment." followed by `iucnNote` when the
     fish has one.
3. **Sections.** On white, each separated by a 1 px grout line. Each section has:
   - a heading (Bricolage 19 px);
   - optionally, a short 12 px muted note on the right of the heading;
   - optionally, a one-line 13 px muted description.

   There are no boxes. **Rows:** from 1024 px, sections sit in fixed rows of one
   or two. If only one section of a pair exists, it takes the full width. Below
   1024 px, every section is full width, in the same order.

   | Row | Sections | Heading note |
   |---|---|---|
   | 1 | How big? · Where in Malaysia | "Linear scale · person 170 cm" or "Linear scale · hand 18 cm" · "{n} open-licence record(s) · GBIF" |
   | 2 | How to identify · Habitat | — |
   | 3 | Before you fish | — |
   | 4 | Catching it · Eating | — |
   | 5 | Aquarium care | — |
   | 6 | More photos | — |
   | 7 | Sources | "Last reviewed {date}" |

   - **How big?**
     - The slim fish (salt) and the reference figure (ink), drawn to scale as
       now.
     - Faint dashed grout lines at each tick.
     - A 6 px sign-yellow linear tape with 12 px tick labels.
     - The description is "Up to {maxCm} cm (and {maxKg} kg)."
   - **Where in Malaysia.**
     - The tile map in the same positions. Recorded states have a `salt` fill
       and white text. Other states are white, with a grout border and muted
       11 px text.
     - Spot pins are sign-yellow with ink numbers.
     - A legend, then the existing text "Recorded in …" and "Few records can
       mean few surveys, not few fish."
   - **How to identify.**
     - The features, with salt hook bullets.
     - **Look-alikes.** Compact rows separated by grout lines. Each row has a
       96 px 4:3 thumbnail (or an outline), the linked English name and the
       difference text.
   - **Habitat.**
     - Environment chips (tile fill, grout ring) and the description.
     - Then label/value rows: "Diet" and "Native range". Labels are 12 px muted,
       values 14 px.
   - **Catching it.** Label/value rows: Season, Methods (chips), Baits (chips),
     Difficulty.
   - **Before you fish.**
     - A full-width panel: `sign-yellow/15` background, a 1 px `sign-yellow/70`
       border, 12 px corners.
     - The heading is Permanent Marker, 17 px.
     - It contains `malaysia.rules` in 14 px, then the existing "Rules change…
       Last checked {date}." in 13 px.
   - **Eating.** A paragraph.
   - **Aquarium care.** The same stat-label/value strip as the stats strip, not
     boxed tiles.
   - **More photos.**
     - Three per row (two on phones), 4:3, with 12 px corners.
     - The credit and licence sit under each photo.
     - `alt` stays "{english}, photo {n}".
   - **Sources.**
     - A numbered list in two columns from 768 px. Each item shows the host
       name, with a "PDF" label for PDF files, and links to the full URL.
     - When there are no sources, the section shows "This profile has not been
       fact-checked yet."

**Page title and description** are unchanged.

## Other pages

`/identify`, `/about` and `404`:
- A tiled top band with a small salt label ("Coming soon", or "Not found" on the
  404 page), the existing heading and the existing one-line text.
- Below it, the confused fish at 120 px and, on 404, the "All fish" link.
- The copy doesn't change.

## Photos

The location, lookup and credit rules are unchanged. Only the rendering sizes
change:

| Where | Aspect | Widths | `sizes` |
|---|---|---|---|
| Card | 16:10 | 320, 480, 640 | `(min-width: 1152px) 280px, (min-width: 640px) 45vw, 92vw` |
| Fish header | 4:3 | 480, 720, 960 | `(min-width: 1152px) 460px, (min-width: 768px) 40vw, 92vw` |
| Gallery | 4:3 | 400, 800 | `(min-width: 1152px) 370px, (min-width: 640px) 31vw, 46vw` |
| Look-alike | 4:3 | 160, 320 | `96px` |

## Code changes (`apps/web`)

- **`astro.config.mjs`.** Add Inter (weights `400 600`, styles normal and
  italic). Change Bricolage to weights `600 700`.
- **`src/layouts/Base.astro`.** Add `<Font cssVariable="--astro-font-inter"
  preload />`. The `<body>` uses `font-sans` (Inter) on a white background.
- **`src/styles/global.css`.**
  - `--font-sans` points at Inter. A new `--font-display` points at Bricolage.
    `--font-marker` is unchanged.
  - Remove the `--shadow-hard*` tokens. Add `--shadow-menu` and `--shadow-paper`.
  - Add the tint tokens from the Colours section.
  - Replace the `ink-card` utility with `panel` (white, 1 px grout, 12 px
    corners).
  - Keep `tile-surface` and `cardboard` (with the paper shadow), and use
    `tile-surface` only on top bands and placeholders.
  - Change the focus ring as in "Shape, depth and motion".
- **Restyled components (structure kept):**
  - `SiteHeader`, `Logo`, `SiteFooter`;
  - `HangingSign`, `Bubbles`, `SwimmingFish`;
  - `FishCard`, `UseTag`, `WaterLabel` (now a tinted chip), `CardTape`, `Tape`;
  - `ConfusedMessage`;
  - `LookAlikeCard` (now a compact row), `StateTileMap`, `SizeCompare` (with
    the grid lines);
  - `Notice` (the light-yellow panel);
  - the classes inside `FilterBar.tsx`.
- **Restructured for the fish page:**
  - **`Photo`.** The `hero` variant becomes a `header` variant for the right
    column.
  - **`StatTiles` → `StatStrip`.** Label above value with no boxes. It keeps
    `data-stat-tiles` and `data-wide`.
  - **`Section`.** No box. New optional props `note` and `description`. It keeps
    `data-section`.
  - **`fish/[id].astro`.** Header band, stats strip and section rows. Each row
    is a wrapper with a `data-row` attribute.
- **New helpers (pure and tested):**
  - **`sectionRows(fish): SectionId[][]` in `src/lib/fish-page.ts`.** It returns
    the rows in the table above. It leaves out sections without data and drops
    empty rows. `SectionId` is one of `how-big`, `where`, `identify`, `habitat`,
    `before-you-fish`, `catching`, `eating`, `aquarium`, `photos`, `sources`.
  - **`lastUpdated(fish: Fish[]): string | undefined` in `src/lib/format.ts`.**
    It returns the newest `lastReviewed`, or `undefined` if there is none.
- **Kept build hooks.** Keep these attributes, because tests and the layout
  check rely on them:
  - `data-hero` (now on the header photo);
  - `data-name-card` (now on the header text column);
  - `data-section`, `data-stat-tiles`, `data-wide`, `data-size-reference`,
    `data-state`, `data-recorded`, `data-gallery-photo`;
  - `data-fish-card`, `data-no-photo`, `data-card-tape`, `data-water`;
  - `data-hanging-sign`, `data-swim-strip`, `data-filter-bar`.
- **Docs.** Rewrite `apps/web/DESIGN.md` to match this spec.

## Accessibility

- Text contrast meets AA for every pair in the Colours tables. Form-control
  borders reach 3:1.
- Decorative pieces stay `aria-hidden`: the bubbles, the swimming fish, the
  sign's line and hook, the silhouettes and the tape. The sign's text is real
  text.
- The page title stays first in the HTML on every layout.
- Interactive targets are at least 24×24 px, and functional text is at least
  11 px.
- Base UI still provides keyboard behaviour and ARIA for the filters. The count
  is still announced politely.

## Testing

- **Unit tests (`pnpm test`):**
  - **`sectionRows`:**
    - a full fish gives all seven rows, with pairs in order;
    - a fish without `size` gives row 1 as `['where']` only;
    - a fish without `malaysia` drops "Where in Malaysia" and "Before you fish";
    - a minimal fish gives only the rows that exist;
    - no row is ever empty.
  - **`lastUpdated`:** the newest date of several, `undefined` for none, and
    unreviewed fish are ignored.
  - **`quickStats`:** unchanged, including `wide` on the family.
  - **Contrast (`tests/contrast.test.ts`).** The test resolves each
    `color-mix(…, white)` token from `global.css`, then adds these pairs:
    - ink on `threat-soft`;
    - salt on `salt-soft`;
    - fresh on `fresh-soft`;
    - brackish on `brackish-soft`;
    - ink on `notice`;
    - muted on tile;
    - `control` against white, which must be at least 3:1.
- **Build tests (`pnpm test:build`):**
  - Update the tests tied to the old look.
  - Keep the structural checks:
    - a page for every fish;
    - cards A–Z;
    - the sign count;
    - "Before you fish" only with rules;
    - person or hand;
    - 16 map tiles;
    - the gallery count;
    - sources;
    - English only;
    - the headline before the sign;
    - the swimming strip's height under reduced motion.
  - Add:
    - the home page shows "Last updated" with the newest review date;
    - the sailfish page puts "How big?" and "Where in Malaysia" in one row
      (`data-row` containing both `data-section` values);
    - no built page uses `shadow-hard` or `border-ink` classes.
- **Layout check.** The throwaway Playwright script from the review-fixes plan,
  adapted to the new layout. It checks:
  - no sideways scrolling at 360, 390, 768, 1024 and 1280 px;
  - no stat value breaking mid-word on any fish page;
  - the sign's line starting at the header's bottom edge, with motion on and
    off;
  - the content never wider than 1152 px.
- **Manual check.**
  - Widths: 390 and 1280 px.
  - Pages:
    - home;
    - sailfish (richest);
    - giant featherback (no photo, `iucnNote`);
    - dwarf rasbora (hand scale);
    - an aquarium fish (aquarium strip);
    - identify, about and 404.
  - Every filter, using only the keyboard.
  - Reduced motion turned on.

## Out of scope

- Dark mode.
- New charts or new data.
- The Identify feature and the About page's content.
- Changes to the filtering behaviour, the URL or the data schema.
