# Malaysia fish profiles: implementation and verification

Implemented on `feat/malaysia-fish-profiles`, stacked on `refactor/fish-per-file`.
No merge, rebase, push or deployment was performed.

## Delivered

- 69 sourced profiles: the original 27 URLs retained, plus 42 new Malaysian fish.
- Shared strict schema, English/Malay/scientific/alias search, water/use/state/status/threatened filters, conditional profile sections, source lists and reviewed dates.
- GBIF/Wikidata importer and commercially licensed iNaturalist photo downloader. Invalid/non-exact/synonym matches write nothing; partial lookup failures preserve existing fields. Import provenance is appended without replacing researched source links.
- 143 visually inspected, unchanged photo files covering 68 profiles. Commons originals fill gaps for cardinal tetra, discus, Asian redtail catfish, neon tetra, goldfish, tinfoil barb and Pangasius nasutus. Exact Commons licence versions are included in credit strings and documented in the source pages.
- Node 22.23+ declared for direct TypeScript script execution. Vitest 5.0.2 is the only new project dependency.

## Verification

- `pnpm test`: 364 passing tests across six files. Covers schema requirements, unknown keys, ranges/dates, licence restrictions, record/link/file integrity, search/filter behavior and network-tool failure cases.
- `pnpm build`: 70 pages, including all 69 fish routes.
- Minimal and fully populated temporary profiles verified section rendering and hidden optional sections, then removed.
- Chromium checked all 69 routes at 390px: correct headings, reviewed labels, decoded images, no horizontal overflow, no JavaScript errors. Directory checks exercised reversed scientific-name tokens, whitespace, Malay search and the Malaysian-status filter. Earlier desktop/mobile checks also verified water/state filtering and full photo galleries.
- All published image files decode; every asset is referenced and every reference exists.
- Live import ran for every profile. A misspelled `Carassius auratuss` temporary fixture stayed byte-identical; the fixture was deleted. Re-importing barramundi and goldfish was byte-identical.
- `git diff --check` passed.

## Research limits and deliberate differences from the illustrative design

Names were corrected from sources: native Malaysian baung is represented by
`malayan-river-catfish` / Hemibagrus capitulum, rather than the planned Java
species Hemibagrus nemurus. Tapah uses Wallagonia leerii. Several Malay names
were corrected to DOF/LKIM names, with supported aliases retained for search.
The 2025 Betta research does not support a confident Malaysia-only endemic
claim for Betta persephone; its profile explains the uncertainty.

The live GBIF backbone disagrees with four researched names, so generated
fields were deliberately skipped: Osteogaster aenea, Micropterus nigricans,
Hemibagrus capitulum and Wallagonia leerii. Wikidata has no exact taxon-name
item for Barbonymus schwanenfeldii; no IUCN value was guessed. The complete
lookup output is in `2026-10-13-open-data-import.txt`.

Giant featherback has no published photo: available candidates could not be
confidently assigned to the revised species complex. Optional sections are
omitted wherever sufficient evidence was unavailable, including some
identification features, aquarium bundles and fishing/spot details needing
two independent sources. The review date certifies the populated facts, not
that all optional sections are complete. No unsupported blanket July 2024
ban was asserted for Hemibagrus wyckioides.

IUCN categories are obtained through Wikidata and may lag current assessments;
the pages explain this. State counts represent commercially usable GBIF
records with recognised state names, not fish abundance or a complete range.
Sources and their limits are documented in the companion research notes.
