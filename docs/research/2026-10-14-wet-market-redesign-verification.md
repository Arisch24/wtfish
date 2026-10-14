# Wet-market redesign verification — 14 October 2026

Implemented all 11 tasks on `feat/wet-market-redesign`, stacked on
`feat/malaysia-fish-profiles`. No merge, rebase, push or deployment was performed.

## Task commits

| Task | Commit | Change |
| :-- | :-- | :-- |
| 1 | `2646096` | feat(web): add tailwind, react, base ui and self-hosted fonts |
| 2 | `dc3ee8f` | feat(web): add size scale helpers |
| 3 | `715ad6e` | feat(web): add map, source and label helpers |
| 4 | `39aa73b` | feat(web): make fish names and text english-only |
| 5 | `a572785` | refactor(web): resize fish photos with sharp |
| 6 | `eb7acca` | feat(web): add wet-market site shell and coming-soon pages |
| 7 | `c71e380` | feat(web): redesign home page with fish cards |
| 8 | `cc1049c` | feat(web): add base ui filter bar island |
| 9 | `bec083e` | feat(web): add fish page building blocks |
| 10 | `9db9561` | feat(web): redesign fish page |
| 11 | `4c6f860` | test(web): check built pages stay english-only |

## Verification

- `pnpm test`: **518 passing unit tests across 16 files**.
- `pnpm test:build`: **178 passing built-page tests across seven files**;
  Astro builds **73 pages** (69 fish, home, Identify, About and 404).
- All 73 pages pass English-only name/UI checks. Search ignores straight and
  curly apostrophes and excludes stored Malay names.
- Production Chromium checks at **390px and 1280px** cover home, sailfish,
  giant featherback, dwarf rasbora, barramundi, cardinal tetra, Identify,
  About and an actual missing route. Images decode, fonts load locally,
  expected pages return 200 and the missing route returns 404. No document
  overflow or JavaScript errors in the sampled routes.
- A further **all-69-profile phone check** confirms zero horizontal overflow,
  zero blocked hero credit/licence links and zero JavaScript errors. Wrapped
  credit links were checked against actual text rectangles.
- Filter interactions verify `johns`, `julliens`, Brackish (including
  barramundi), Native plus Pahang, threatened categories, empty results and
  Clear filters. JavaScript disabled leaves all 69 cards and the total visible,
  with the empty message hidden.
- Keyboard checks verify toggle-group arrows, Enter/Space and arrows in
  selects, Space on the checkbox, and the 3px ink outline with yellow inner
  ring. Reduced motion disables animations and transitions.
- All **143 source photos remain byte-identical** to commit `af7b85d`;
  only their directory changed. Generated images are in `dist/_astro/`.
- `git diff --check` passes. There are no source `<style>` blocks,
  `dark:` variants, dark color-scheme rules or Malay UI labels.

## Reviewed implementation adjustments

The overlapping name card obscured hero photo credits on phones. Credits now
sit 40px above the hero bottom on phones and 80px on larger screens, preserving
linked attribution and the licence. Heading/wordmark tracking is -0.04em.
An independent design reviewer scored both findings **resolved**, disposition
**ship**, after the same screenshot matrix was recaptured.

The no-photo slot shares the page's tile utility. The select caret is SVG;
selection and caret colours use the site's tokens. These complete the supplied
visual direction without changing fish facts or copy.

The design detector's three findings concern the prescribed tile background,
cardboard swing easing and placeholder separator; all are intentional features
of the approved wet-market design. No detector exemptions were added.

pnpm required approval for esbuild's install script. The local
`pnpm-workspace.yaml` records only `allowBuilds: { esbuild: true }`. Optional
React/Base UI peers were not added. All new packages use the exact planned
versions.

## Evidence

Local, uncommitted browser evidence lives under `.impeccable/review/`:
18 desktop/phone screenshots, `browser-report.json`, and
`all-profiles-report.json`. Test results verify rendered structure and content;
visual checks cover the listed route/viewport matrix, not every desktop profile.
