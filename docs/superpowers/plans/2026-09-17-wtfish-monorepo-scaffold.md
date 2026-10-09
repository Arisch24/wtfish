# wtfish Monorepo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the wtfish monorepo — three independent, framework-standard app skeletons (Astro, Flutter, FastAPI) plus root-level config files — with no shared code and no cross-service wiring.

**Architecture:** Each app lives under `apps/<name>` and is scaffolded with its own framework's official tooling, self-contained with its own lockfile. No JS workspace, no Turborepo, no shared packages. Root holds only cross-cutting non-code files (`.gitignore`, `.editorconfig`, `README.md`).

**Tech Stack:** Astro (TypeScript strict) + pnpm for `apps/web`; Flutter (default template) for `apps/mobile`; FastAPI + uv for `apps/api`.

**Spec:** `docs/superpowers/specs/2026-09-17-wtfish-monorepo-design.md`

## Global Constraints

- `apps/web` package manager is pnpm — do not use npm or yarn.
- `apps/api` dependency manager is uv — do not use poetry or plain pip/requirements.txt.
- No `git init`, no `git` commands anywhere in this plan — the repo has no git yet and the user asked to leave it that way for this pass.
- No `packages/` directory, no pnpm workspace file, no Turborepo config.
- No cross-service code: `apps/api` gets zero routes (not even `/health`); `apps/web` and `apps/mobile` do not call `apps/api`.
- No CI config.

---

### Task 1: Root files

**Files:**
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `README.md`

**Interfaces:** None — these are standalone repo-root files with no dependency on other tasks.

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Node / pnpm
node_modules/
dist/
.astro/
*.log
.pnpm-store/

# Python / uv
.venv/
__pycache__/
*.pyc
.pytest_cache/
.ruff_cache/

# Flutter / Dart
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
build/
*.iml
.idea/

# OS
.DS_Store
```

- [ ] **Step 2: Create `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 3: Create `README.md`**

```markdown
# wtfish

Fish identification app.

## Apps

- [`apps/web`](apps/web) — Astro web app (SEO/marketing/species pages). See its README for setup.
- [`apps/mobile`](apps/mobile) — Flutter mobile app. See its README for setup.
- [`apps/api`](apps/api) — FastAPI backend. See its README for setup.

Each app is self-contained with its own dependencies and lockfile.
```

- [ ] **Step 4: Verify all three files exist with correct content**

Run: `cat .gitignore .editorconfig README.md`
Expected: all three files print their content above, no errors.

---

### Task 2: apps/web (Astro)

**Files:**
- Create: `apps/web/` (entire directory, via `create-astro` scaffolding)

**Interfaces:** None — independent of other tasks.

- [ ] **Step 1: Scaffold the Astro project**

Run from the repo root:

```bash
pnpm create astro@latest apps/web -- --template minimal --install --no-git --typescript strict --yes
```

Expected: command completes without error, creates `apps/web/` containing at minimum `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, and `node_modules/` (from `--install`).

If the CLI prompts interactively instead of honoring the flags (can happen across `create-astro` versions), answer: template = `minimal`, TypeScript = `strict`, install dependencies = yes, initialize git repo = **no**.

- [ ] **Step 2: Verify the package.json is correct**

Run: `cat apps/web/package.json`
Expected: JSON containing `"astro"` under `dependencies` (or `devDependencies`), and no yarn/npm-specific lockfile artifacts alongside it.

- [ ] **Step 3: Verify no stray git repo was created**

Run: `test -d apps/web/.git && echo "FOUND git dir" || echo "no git dir"`
Expected: `no git dir`. If `FOUND git dir` prints, remove it: `rm -rf apps/web/.git`.

- [ ] **Step 4: Verify the app builds**

Run: `pnpm --dir apps/web build`
Expected: exits 0, creates `apps/web/dist/` with built output (e.g. `apps/web/dist/index.html`).

---

### Task 3: apps/mobile (Flutter)

**Files:**
- Create: `apps/mobile/` (entire directory, via `flutter create`)

**Interfaces:** None — independent of other tasks.

- [ ] **Step 1: Scaffold the Flutter project**

Run from the repo root:

```bash
flutter create apps/mobile
```

Expected: command completes without error, creates `apps/mobile/` containing `pubspec.yaml`, `lib/main.dart`, and platform directories (`android/`, `ios/`, etc., per the current Flutter default template).

- [ ] **Step 2: Verify pubspec.yaml exists**

Run: `cat apps/mobile/pubspec.yaml`
Expected: prints YAML with `name: mobile` (or similar, matching the directory name) and a `flutter` dependency section.

- [ ] **Step 3: Verify no stray git repo was created**

Run: `test -d apps/mobile/.git && echo "FOUND git dir" || echo "no git dir"`
Expected: `no git dir`. If `FOUND git dir` prints, remove it: `rm -rf apps/mobile/.git`.

- [ ] **Step 4: Verify the app analyzes cleanly**

Run: `cd apps/mobile && flutter analyze`
Expected: exits 0 with `No issues found!` (this checks the default template compiles/lints without needing a device or emulator).

---

### Task 4: apps/api (FastAPI + uv)

**Files:**
- Create: `apps/api/` (via `uv init`, then edited)
- Modify: `apps/api/main.py` (replace uv-generated content)
- Modify: `apps/api/README.md` (replace uv-generated content)

**Interfaces:** None — independent of other tasks.

- [ ] **Step 1: Scaffold the uv project**

Run from the repo root:

```bash
uv init apps/api
```

Expected: creates `apps/api/` containing `pyproject.toml`, `.python-version`, `README.md`, and `main.py` (uv's default generated `main.py`, which just prints a greeting).

- [ ] **Step 2: Add FastAPI as a dependency**

Run:

```bash
cd apps/api && uv add "fastapi[standard]"
```

Expected: exits 0, updates `apps/api/pyproject.toml` with a `fastapi` dependency, creates `apps/api/uv.lock`, creates `apps/api/.venv/`.

- [ ] **Step 3: Replace `apps/api/main.py` with the FastAPI skeleton**

Overwrite `apps/api/main.py` with exactly:

```python
from fastapi import FastAPI

app = FastAPI()
```

- [ ] **Step 4: Replace `apps/api/README.md` with real setup instructions**

Overwrite `apps/api/README.md` with:

```markdown
# api

FastAPI backend for wtfish.

## Setup

    uv sync

## Run

    uv run fastapi dev main.py
```

- [ ] **Step 5: Verify the app imports cleanly**

Run: `cd apps/api && uv run python -c "from main import app; print(app.title)"`
Expected: prints `FastAPI` (the default title) with no traceback.

- [ ] **Step 6: Verify the dev server starts and serves the default docs**

Run:

```bash
cd apps/api && uv run fastapi dev main.py --port 8000 &
sleep 3
curl -sf http://127.0.0.1:8000/openapi.json
kill %1
```

Expected: `curl` prints a JSON document containing `"openapi"` and an empty `"paths": {}` object (no routes defined yet); the background server process is then killed.

---

## Final verification (all tasks)

- [ ] Run `find apps -maxdepth 2 -mindepth 2 -type d` and confirm it lists exactly the expected top-level dirs for each app (e.g. `apps/web/src`, `apps/mobile/lib`, `apps/api` — no `.git` under any of them).
- [ ] Run `ls -la` at the repo root and confirm `.gitignore`, `.editorconfig`, `README.md`, and `apps/` are all present, and there is no `packages/` directory and no `turbo.json`/`pnpm-workspace.yaml`.
