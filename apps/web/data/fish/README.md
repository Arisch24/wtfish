# Fish data

One file per fish. The filename is the fish's id and URL:
`giant-snakehead.json` → `/fish/giant-snakehead/`.

- Filenames: the English name in lowercase, words joined by `-`. If the fish
  has no English name, or two fish would share one, use the scientific name
  (`betta-persephone.json`).
- Fields and allowed values are defined in `src/lib/fish-schema.ts`. The
  build and `pnpm test` fail on a missing required field, an unknown field
  or an invalid value.
- Required: `names.english`, `names.scientific`, `taxonomy.family`, `water`,
  `uses`, `summary`. Everything else is optional; empty sections are hidden.

## Filled by scripts — don't edit by hand

- `pnpm import-data <id…>` — `taxonomy` (family, order, gbifKey, wikidata),
  `iucn`, and `malaysia.states` (only if a `malaysia` section exists).
  Adds provenance links to `sources`, preserving existing researched links.
  Requires Node 22.23 or newer for direct TypeScript execution.
- `pnpm fetch-photos <id> [count]` — `photos` and the files in
  `public/photos/<id>/`.

## Research rules

1. Every fact must come from a source listed in `sources`. Spots, seasons,
   baits and methods need two independent sources.
2. Write in our own words. Never paste text from a source.
3. Never copy from FishBase (non-commercial licence) or the IUCN Red List
   website or API. Use them only to double-check.
4. The site is English-only. `names.malay` and `names.malayOther` are kept
   for a future multilingual version but are never shown or searched.
   `names.other` holds English (or English-language trade) names only; put
   Malay and regional names in `names.malayOther`. Never use a Malay fish
   name in prose fields; write the English name ("the striped snakehead",
   not "haruan"). `pnpm test` fails if one slips in. Prefer Department of
   Fisheries (DOF) and DBP lists over Wikidata for Malay names.
5. Check the scientific name against Catalog of Fishes. If `import-data`
   warns about a synonym, investigate before changing `names.scientific`.
   When a current source disagrees with the GBIF backbone, retain the sourced
   name and document the skipped import instead of forcing a match.
6. `malaysia.rules` must name the law or authority and come from a
   government page, or a news report quoting one.
7. Add a `malaysia` section only when the fish lives in Malaysian waters
   (native, endemic, introduced or invasive).
8. If a fact can't be sourced, leave the field out.
9. `identify.lookAlikes` may only point at fish that already have a file.
10. When done, set `lastReviewed` to today's date (`YYYY-MM-DD`).

## Photos

- Run `pnpm fetch-photos <id> 3` first (iNaturalist, research-grade,
  CC0 / CC BY / CC BY-SA only, Malaysian observations first).
- If it finds none, search Wikimedia Commons. Use only CC0, CC BY or
  CC BY-SA files. Save to `public/photos/<id>/commons-<short-name>.jpg` and
  add `{ "file", "credit": "<author> / Wikimedia Commons", "license",
  "url": "<Commons file page>" }`.
- Open every photo and confirm it shows the right species. If not, delete the
  file and its entry.
- Never edit a photo file (no overlays, colour changes or crops saved to the
  file). Display cropping in CSS is fine.
