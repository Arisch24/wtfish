# wtfish monorepo scaffold — design

## Context

`wtfish` is a fish identification app. The repo is currently empty (no
git, no files). This spec covers the initial repo scaffold only: three
independent apps, each using its framework's standard tooling, with no
shared code and no cross-service wiring yet.

Stack: Astro (web), Flutter (mobile), FastAPI (backend).

## Layout

```
wtfish/
  apps/
    web/       # Astro — SEO/marketing/species pages
    mobile/    # Flutter
    api/       # FastAPI
  .gitignore
  .editorconfig
  README.md
```

No `packages/` directory and no JS workspace tooling (pnpm workspaces /
Turborepo). Only `apps/web` is JS/TS; Flutter and FastAPI are separate
runtimes with their own dependency managers, so there is nothing to
share via a JS workspace today. Each app is self-contained with its own
lockfile.

## Per-app scaffolding

- **apps/web**: scaffolded via `pnpm create astro@latest` — minimal
  template, TypeScript strict mode, pnpm as the package manager.
- **apps/mobile**: scaffolded via `flutter create .` (or equivalent) —
  standard default Flutter project, no customization.
- **apps/api**: hand-written minimal FastAPI skeleton using **uv** for
  dependency management (`pyproject.toml` + `uv.lock`). App instance
  (`app = FastAPI()`) with no routes — not even `/health`, since
  cross-service wiring is explicitly out of scope for this pass.

## Root files

- `.gitignore` — covers Node/pnpm artifacts (`node_modules`, `.astro`,
  `dist`), Python/uv artifacts (`.venv`, `__pycache__`, `*.pyc`), and
  Flutter/Dart artifacts (`.dart_tool`, `build/`, `.flutter-plugins*`).
- `.editorconfig` — consistent indentation/charset across the three
  languages.
- `README.md` — short root README pointing at each app's own README
  for how to run it.

## Explicitly out of scope for this pass

- `git init` / initial commit (user will handle git themselves).
- Any cross-service wiring or "hello world" integration (e.g. web or
  mobile calling a `/health` endpoint).
- OpenAPI-based type/client codegen for web (`openapi-typescript`) or
  mobile (Dart client generator) — worth doing once `apps/api` has
  real endpoints to generate from.
- CI/CD.
- Turborepo/pnpm workspace — revisit if a second JS app or shared JS
  package shows up.

## Testing

Not applicable — this is scaffolding with no application logic. The
plan's verification step is: each app builds/runs via its own
framework's standard dev command (`pnpm dev` for Astro, `flutter run`
or `flutter analyze` for Flutter, `uv run fastapi dev` or equivalent
for FastAPI).
