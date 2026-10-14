---
name: wtfish wet market
description: A photo-led fish directory with the character of a wet-market stall
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
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
  label:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  marker:
    fontFamily: "Permanent Marker, cursive"
    fontSize: "20px"
    fontWeight: 400
rounded:
  control: "6px"
  field: "8px"
  panel: "10px"
spacing:
  tight: "6px"
  compact: "8px"
  control: "12px"
  section: "16px"
  panel: "20px"
  gutter-wide: "24px"
components:
  button-clear:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "8px 16px"
  filter-pill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 12px"
  filter-pill-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sign-yellow}"
    rounded: "{rounded.control}"
    padding: "4px 12px"
  search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
  cardboard-tag:
    backgroundColor: "{colors.cardboard}"
    textColor: "{colors.ink}"
    typography: "{typography.marker}"
    padding: "2px 14px"
  fish-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  notice:
    backgroundColor: "{colors.sign-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "16px 20px 20px"
---

# Design System: wtfish

## Overview

**Creative North Star: "The Wet-Market Stall"**

A wet-market stall: white tiles and grey grout, a red shop sign with yellow trim, and handwritten cardboard labels. Photographs establish the fish; heavy ink outlines, compact information and physical measuring tapes make the directory easy to scan.

The approved design spec supplies the visual authority. This is a light-only, English-only interface; names and search use English aliases and scientific names. Bricolage Grotesque carries readable information and controls, while Permanent Marker is reserved for cardboard tags, signs and the “Before you fish” heading.

**Key Characteristics:**

- Tiled background with ink-outlined white panels.
- Red shop sign, yellow trim and handwritten cardboard tags.
- Fish photography, measuring tapes and semantic water icons.
- Hard shadows, visible keyboard focus and reduced-motion support.

## Colors

### Primary

Shop-sign red anchors the header. Sign yellow supplies trim, the hook wordmark, selected-control text, threatened badges and the safety notice.

### Secondary

Cardboard is the warm handwritten-label surface. Freshwater green, brackish teal and saltwater blue are semantic water colors with white text; saltwater blue also fills recorded-state tiles. Alert red marks size-related emphasis, threatened IUCN codes and the unreviewed stamp.

### Neutral

Ink supplies text, outlines and structural shadows; muted supplies secondary text. Tile and grout form the page grid. White panels preserve legibility over it. Habitat and method chips additionally use the implemented pale blue-grey fill (`#eef3f5`) and border (`#c8d4d9`); these are local treatments rather than global theme tokens.

**The Water Label Rule.** Keep the icon and written water type alongside its semantic color.

## Typography

Bricolage Grotesque is self-hosted through Astro’s fonts API with weights 400–800; Permanent Marker is self-hosted at 400. CSS references `--astro-font-bricolage` and `--astro-font-marker` through `--font-sans` and `--font-marker`. Scientific names use a synthesized italic.

The home display grows from the frontmatter phone size to 52px at 640px. Profile names use 38px/0.98 on phones and 46px at 640px, with weight 800 and −0.04em tracking. Section headings use the headline role; cards use title. Profile summaries use 19px; scientific names are 19px on profiles and 14px on cards. Marker tags grow to 26px on profiles; the notice heading is also 26px. Stats use 22px bold values and 13px muted labels. Controls use compact 14px bold text, with 12px group labels and a 15px search field.

**The Marker Rule.** Use handwriting only for tags, signs and “Before you fish”; information and controls stay in the sans family.

## Layout

The directory is an Operate surface: finding a fish through search, single-choice water/use filters, Malaysia/status selectors and a threatened checkbox. Its container is 1152px maximum with 16px phone and 24px larger gutters. The headline and filters stack below 1024px; above that they occupy two columns, the filter column capped at 34rem. Filter pill rows scroll horizontally on phones. Cards use `repeat(auto-fill, minmax(16rem, 1fr))` and 16px gaps, ordered A–Z by English name.

Profiles are Read surfaces: a single stacked poster with a 760px maximum container, 16px phone and 20px larger gutters, and 16px vertical gaps. Sections appear only when data exists. The full-width hero is 4:3 on phones and 21:8 from 640px; the name card overlaps by 32px and 70px respectively. **Keep the hero credit chip 40px above the photo bottom on phones and 80px at 640px and above**, so the overlapping name card does not cover its links. A profile without a photo starts its name card with 24px top margin.

Stats use two columns on phones and auto-fitting columns of at least 8.5rem above 640px. More-photos galleries retain two columns. Long names wrap within their cards. The shop navigation stays on one line at the reviewed 390px width. Shared sections use 20px horizontal/bottom padding and 16px top padding.

## Elevation & Depth

Outlines and physical offsets create depth without ambient blur. The common ink panel has a 2px outline. The name card and yellow notice use `5px 5px 0 var(--color-ink)`; small clear-button and select-popup depth uses `3px 3px 0 var(--color-ink)`. Cardboard uses `2px 3px 0 rgb(0 0 0 / 0.2)`.

Directory cards have no resting shadow; hover lifts them 3px with `0 6px 0 var(--color-ink)` over 200ms. Their tags rotate from −4° to +3° over 400ms with `cubic-bezier(.3,1.6,.5,1)`.

## Shapes

Panels have rounded 10px corners and 2px ink borders; image tops use 8px corners. Search uses an 8px radius and 3px border. Filter pills and selects use 6px corners and 2px borders. Small semantic badges use 4px corners; habitat/method chips are fully rounded. Cardboard remains rectangular and tilted, rather than adopting the rounded panel shape.

## Components

- **Shop shell:** red header with 5px yellow bottom trim, hook-question-mark wordmark, Fish/Identify/About links and a yellow underline on the current route. The footer carries a small hook logo and photo/source attribution text.
- **Fish card:** one whole-card link, 4:3 photo or tiled “No photo yet” placeholder, top-left use tag, English/scientific names, logarithmic measuring tape when size exists, water chips and recorded-state count. Card thumbnail alt is empty because the linked name supplies its identity.
- **Filters:** the only React island, loaded with `client:load`, uses unstyled Base UI Input, ToggleGroup/Toggle, Select and Checkbox. Selected pills and checkboxes use ink/yellow. Select menus portal out of their container; highlighted options also use ink/yellow. The count is politely announced. Filtering hides server-rendered cards; without JavaScript every card remains visible. English aliases and scientific names are searchable. Empty results show the confused-fish mascot and Clear filters button.
- **Poster and photos:** eager hero image with high priority, visible photo-credit and licence links; gallery credits sit below each image. Astro Picture produces AVIF/WebP with a fallback. Other images are lazy-loaded. A missing hero does not create a blank photo slot.
- **Use tags:** Sport, Food and Aquarium joined with “ · ” on cardboard. Marker lettering and restrained tilt carry the stall-sign character.
- **Measurement and map:** cards share a logarithmic 1cm–5m tape. Profiles use a linear tape with a 170cm person for fish at least 50cm long, otherwise an 18cm hand. The Malaysia map has 16 state/territory tiles, blue recorded-state fills and numbered yellow spot pins, with textual equivalents.
- **Safety and status:** the yellow “Before you fish” board uses marker lettering and hard depth. Threatened badges use yellow; EW/EX use ink with white text. Profiles without review dates carry the alert-red stamp.
- **Icons and states:** inline SVG hook, wave, droplet, brackish droplet, fish, person, hand and confused-fish forms. Decorative SVGs are hidden from assistive technology. Identify, About and 404 use the confused mascot and concise copy.

Motion is CSS-only: sign sway (3.2s), bubbles (5s), swimming fish on home (16s), swimming-fish bob (1.6s), card lift and tag swing. Reduced-motion preferences disable every animation and transition. Keyboard focus uses a 3px ink outline at 2px offset plus a 2px yellow ring. Yellow selection and red input carets complete the shared interaction treatment.

## Do's and Don'ts

### Do:

- Do use Bricolage Grotesque for prose, names and controls.
- Do reserve Permanent Marker for cardboard and the safety notice heading.
- Do pair water colors with a word and icon.
- Do keep photo credits and licence links clear of the overlapping name card.
- Do preserve visible focus and disable animations and transitions for reduced motion.

### Don’t:

- Don’t add a dark theme to this implementation.
- Don’t render or search Malay fish names; retained data is for future multilingual work.
- Don’t replace ink outlines and hard shadows with blurred elevation.
- Don’t fill absent profile sections with invented facts.
- Don’t turn Identify or About placeholders into implemented features.
