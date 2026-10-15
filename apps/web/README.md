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
