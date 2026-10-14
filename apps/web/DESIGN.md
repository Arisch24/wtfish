---
name: wtfish quiet market
description: A compact, data-first fish directory that keeps a wet-market stall's personality in small touches
colors:
  ink: "#1a1a1a"
  muted: "#555555"
  sign-red: "#c8102e"
  sign-yellow: "#ffd23f"
  cardboard: "#e2c391"
  tile: "#f6f8f8"
  grout: "#dde5e8"
  fresh: "#1d7a4a"
  brackish: "#0e6b6b"
  salt: "#1559a0"
  alert: "#b00d28"
  white: "#ffffff"
  salt-soft: "#e8eef6"
  salt-ring: "#a1bdd9"
  fresh-soft: "#e8f2ed"
  brackish-soft: "#e7f0f0"
  threat-soft: "#ffe695"
  notice: "#fff8e2"
  notice-line: "#ffe079"
  control: "#888888"
  hover-line: "#bbbbbb"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  stat-label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.05em"
  stat-value:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
  marker:
    fontFamily: "Permanent Marker, cursive"
    fontSize: "16px"
    fontWeight: 400
rounded:
  tile: "4px"
  control: "6px"
  field: "8px"
  panel: "12px"
  chip: "9999px"
spacing:
  tight: "4px"
  compact: "8px"
  control: "12px"
  section: "24px"
  gutter: "16px"
  gutter-wide: "24px"
components:
  search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    borderColor: "{colors.control}"
    rounded: "{rounded.field}"
    padding: "8px 12px 8px 36px"
  filter-pill:
    textColor: "{colors.muted}"
    rounded: "{rounded.chip}"
    padding: "4px 10px"
  filter-pill-selected:
    backgroundColor: "{colors.salt-soft}"
    textColor: "{colors.salt}"
    borderColor: "{colors.salt-ring}"
    rounded: "{rounded.chip}"
    padding: "4px 10px"
  button-quiet:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    borderColor: "{colors.control}"
    rounded: "{rounded.control}"
    padding: "6px 14px"
  fish-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    borderColor: "{colors.grout}"
    rounded: "{rounded.panel}"
  cardboard-tag:
    backgroundColor: "{colors.cardboard}"
    textColor: "{colors.ink}"
    typography: "{typography.marker}"
    padding: "0 10px"
  water-chip-saltwater:
    backgroundColor: "{colors.salt-soft}"
    textColor: "{colors.salt}"
    rounded: "{rounded.chip}"
    padding: "2px 8px"
  notice:
    backgroundColor: "{colors.notice}"
    textColor: "{colors.ink}"
    borderColor: "{colors.notice-line}"
    rounded: "{rounded.panel}"
    padding: "14px 16px"
---

# Design System: wtfish

## Overview

**Creative North Star: "The Quiet Market"**

A fish reference that reads like a data portal: compact, calm and easy to scan. The wet-market stall survives as small touches, never as the main event. The tiled band at the top of each page, a cardboard tag on each fish, a sign swinging on a fishing line, a few bubbles and a small fish swimming past carry the personality. The data sits on white beneath them.

The layout follows OpenDOSM's patterns:
- small uppercase labels above values;
- "Last reviewed" notes;
- sections split by thin lines;
- pairs of charts side by side on wide screens.

The colours are wtfish's own. The spec for this design is `docs/superpowers/specs/2026-10-14-quiet-restyle-design.md`.

## Colors

- **Text.** Ink carries text. Muted carries secondary text. Grout draws every border and divider at 1 px.
- **Tile** is the neutral soft fill and the base of the tile pattern.
- **Salt blue is the one accent:**
  - links;
  - the small labels above titles;
  - the current nav item and selected pills;
  - hook bullets;
  - recorded map states.
- **Sign red appears only in the logo.**
- **Sign yellow:**
  - fills the measuring tapes and map pins;
  - tinted (`threat-soft`), it marks threatened IUCN chips;
  - lightly tinted (`notice`), it backs the "Before you fish" panel.
- **Water chips** use the 10% tints of fresh, brackish and salt, with the full colour as text.
- **Alert red** marks threatened IUCN codes and "Not yet fact-checked".

**Tints** are solid `color-mix(… , white)` tokens, so the tile pattern never shows through a chip.

**Form controls** use `control` (`#888888`) for their borders, which reach 3.5:1 against white. Grout is decoration only.

## Typography

**Inter** sets every word you read or tap:
- 15 px leads;
- 14 px body and controls;
- 13 px small text;
- 12 px labels and credits;
- 11 px uppercase stat labels.

Stat values are 19 px and weight 600, with evenly spaced digits.

**Bricolage Grotesque** sets only:
- the logo;
- page titles (30 px, 26 px on phones);
- section headings (19 px);
- fish names on cards (16 px, weight 600).

**Permanent Marker** is reserved for use tags, the hanging sign and the "Before you fish" heading.

Scientific names use Inter's true italic. No functional text is smaller than 11 px.

## Layout

- **Container.** One 1152 px container everywhere, with 16 px gutters on phones and 24 px from 640 px. Bands (the tiled top, the filter band, the stats strip) run edge to edge, but their content stays in the container.
- **Home page.**
  - A tiled top band with the swimming strip, the label, title, lead and "Last updated", and the sign hanging from the header. From 768 px the sign sits beside the title; below that, above it.
  - A white filter band holds a full-width search box and one wrapping row of pills, selects, the checkbox and the live count.
  - Cards sit on white in an `auto-fill, minmax(16rem, 1fr)` grid, A–Z.
- **Fish page.**
  - **Header band:** a tiled band with the text on the left and a 4:3 photo on the right from 768 px. On phones the photo comes first, but the name comes first in the HTML.
  - **Stats strip:** one row from 1024 px. Below that, two per row, with the family on its own row.
  - **Sections:** fixed rows separated by thin lines. From 1024 px, "How big?" sits beside "Where in Malaysia", and "How to identify" beside "Habitat". A section whose partner has no data takes the full row.

## Elevation & Depth

Flat. Cards, panels and the header have no shadow.
- Dropdown menus get one soft shadow (`0 8px 24px rgb(26 26 26 / 0.08)`).
- Cardboard tags and the hanging sign keep a small paper shadow (`1px 2px 0`), which is part of the paper look.

## Shapes

- Cards and panels: 12 px. Photos: 12 px.
- Search box: 8 px. Buttons and selects: 6 px. Map tiles: 4 px.
- Chips and pills are fully rounded.
- Cardboard stays rectangular and tilted (−3°).

## Components

- **Fish card.** White panel with a 16:10 photo or tiled "No photo yet" placeholder and a marker use tag inside the photo's corner. Below that:
  - the name and the italic scientific name;
  - a thin log-scale tape with "up to … cm";
  - tinted water chips, and "{n} states" on the right.

  On hover the card lifts 2 px and its border darkens.
- **Filters.** The only React island, built from unstyled Base UI parts:
  - a search box with an icon;
  - Water and Use pill rows that scroll sideways on phones, with 4 px of padding so focus outlines aren't clipped;
  - selects with inline labels;
  - the checkbox;
  - a politely announced count.

  Without JavaScript every card stays visible.
- **Stats strip.** A small uppercase label, a value and an optional note, with no boxes. Used for the quick stats and for aquarium care.
- **Sections.** A Bricolage heading, an optional note on the right and an optional one-line description, with no box.
- **Measurement and map.**
  - "How big?" draws the slim fish and a person (170 cm) or hand (18 cm) to scale, over faint dashed tick lines, with a thin yellow tape. The chart is never wider than 532 px, its width in a pair, so it doesn't grow when it has a row to itself.
  - The map has 16 tiles. Recorded states are filled salt, and pins are yellow.
- **Notice.** "Before you fish" is a pale-yellow panel with a marker heading.
- **Icons and states.** Inline SVG icons: hook, wave, droplet, brackish droplet, slim fish, person, hand and the confused fish. Decorative pieces are `aria-hidden`. Identify, About and 404 use the tiled band and the confused fish.

## Motion

Motion is CSS-only:
- the sign sways ±2° (3.2 s);
- bubbles rise (5 s);
- the fish swims across the home page (16 s) and bobs ±3 px;
- cards lift and tags swing on hover.

`prefers-reduced-motion: reduce` stops all of it. The swimming strip keeps its height, so the sign still meets the header.

Keyboard focus is a 2 px salt outline at 2 px offset.

## Do's and Don'ts

### Do:

- Do use Inter for anything read or tapped, and Bricolage only for the logo, titles, section headings and card names.
- Do keep the personality pieces small: one tag per fish, one sign, a few bubbles, one swimming fish.
- Do separate sections with thin lines, not boxes.
- Do use the tint tokens for soft fills, and `control` for the edges of form controls.
- Do pair every water colour with its word and icon.

### Don't:

- Don't bring back ink outlines, hard offset shadows or weight-800 headings.
- Don't use sign red anywhere but the logo.
- Don't use colours outside the palette; tints come from mixing ours with white.
- Don't put the tile pattern behind data: it belongs to the top bands and placeholders.
- Don't render or search Malay fish names, and don't add a dark theme in this implementation.
