# Silhouette Samurai — Project Guide for AI Agents

## Project overview

**Silhouette Samurai** is a 2D browser-based action game (formerly "Untitled Line Game" and "Silhouette Ballet"). It's described as a "Single Contour Line Upper-Envelope Platformer" where the ground, characters, and other entities are all fused into a single outline using **Signed Distance Fields (SDFs)** on a Canvas 2D surface. The visual result is a continuous, glowing contour line — the player and enemies appear as silhouette-like shapes merged with the ground contour.

The game is a side-scrolling action-fighter with procedural music, real-time combat (attacks, blocks, parries, combos, finishers), enemy AI, and a developer tuning panel for balancing.

## Technology stack

| Layer | Technology |
|---|---|
| Language | **Vanilla JavaScript (ES Modules)** — no TypeScript, no transpilers |
| Rendering | **Canvas 2D API** — 4 layered canvases (bg, sdf, fx, ui) |
| Audio | **Web Audio API** — all sounds are procedurally synthesized, no audio files |
| Text SDF | `@mapbox/tiny-sdf` (vendored locally in `vendor/tiny-sdf.js`, via importmap) |
| Build | **None** — static files served directly |
| Hosting | GitHub Pages (`.github/workflows/deploy-pages.yml`) and Cloudflare Pages |
| CSS | Plain CSS, no preprocessors |
| Testing | Project static check (`npm run check`) + shared harness checks (`check`/`smoke`/`visual`) via `../webgame-tools/`; visual baseline in `test/baselines/` |

### Key dependency (loaded at runtime via importmap)

```html
<script type="importmap">
{
  "imports": {
    "tiny-sdf": "./vendor/tiny-sdf.js"
  }
}
</script>
```

The game is fully self-contained: no CDN, analytics, or other external
requests at runtime. Keep it that way — vendor any future dependency
under `vendor/` instead of loading it from a URL.

## Quick start

```bash
npm run dev      # serve at http://127.0.0.1:8080/ (Node 18+)
npm run check         # project static check: JS syntax, local imports, index.html assets
npm run check:static  # harness static check: imports/assets/external/readiness
npm run smoke         # real browser smoke test + visual baseline comparison
npm run runs          # recent-run dashboard at .artifacts/webgame/index.html
```

Do **not** open `index.html` directly via `file://` — ES modules require HTTP.

## Documentation

| Document | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Full project tree (former "Project Structure" section), runtime architecture, game loop, update order, SDF pipeline, audio, key decisions, per-task file map, enemy types |
| [docs/development.md](docs/development.md) | Local dev server options, static checks, browser smoke + visual regression, deployment (GitHub/Cloudflare Pages), code conventions, `.gitignore` rationale, security notes |
| [docs/gameplay.md](docs/gameplay.md) | Controls (keyboard + actual gamepad mapping), combat systems (unified attack, finishers, parry, clash, combo), player state shape, tuning workflow |
| [docs/known-issues.md](docs/known-issues.md) | Known leftovers and limitations: internal "ballet" naming, unused audio files, title-card scale cost, CPU-bound SDF fill, runtime verification status, git history notes |
| [README.md](README.md) | Human-facing overview and quick start |

## Key facts for agents

- **No build step, no npm dependencies.** `package.json` exists only for local `dev`/`check`/harness scripts. Never add a bundler, framework, or runtime dependency without being asked.
- **All game state is plain objects** on `GameController` (`controller/player`, `controller/entities`, etc.). No ECS, no state library.
- **The SDF pipeline is the visual identity** — `sdf/extraction.js`, `renderer/sdf-pass.js`, `sdf/contour.js` are load-bearing; treat changes there as high-risk.
- **Update order matters** — `controller/update.js` documents the strict per-frame system order. Insert new systems at the right point, not at the end by default.
- **Audio is lazy** — `AudioEngine` only creates the `AudioContext` after first user interaction. Guard audio calls with `initialized` checks and handle `ctx === null` (initialization can fail).
- **Canvas save/restore must pair up** — especially the screen-shake `save()`/`restore()` in `renderer/GameCanvas.js`. Use the `shaking` flag, not offset values, to decide whether to restore.
- **The Combat Tuner is the balance workflow** — tune via the tuner UI, export to clipboard JSON, then apply to `combat/frame-data.js` / `combat/config/physics.js` / `audio/music/Config.js`.
- **Matchers for renames**: "Silhouette Ballet" / "Untitled Line Game" were cleared from all user-facing text; internal identifiers (`gainNodes.ballet`, `dance_finisher_*`) remain intentionally — see known-issues.md before renaming them.
- **No secrets**: the project has no `.env`, no API keys, no backend. Never add credential files; `.env*` is git-ignored.
- **History** (183+ commits) documents an iterative build: name changes, monolith refactors, enemy AI increments, perf work. Read `git log` before assuming a file's shape is accidental.

## Code style (brief)

ES modules, no semicolons, 2-space indent, arrow functions preferred, `camelCase` vars/files, `PascalCase` classes. Full conventions in [docs/development.md](docs/development.md).

## When stuck

1. `npm run check` and `npm run check:static` — project syntax/imports/assets, then the harness import/asset/external/readiness scan.
2. `npm run smoke` — real Firefox render, console/page errors, external requests, canvas content, input, screenshots, and the committed visual baseline. Read `.artifacts/webgame/<run>/report.json` and `summary.txt`; use `npm run visual:update` only for intentional visual changes.
3. `npm run dev` + browser console — the game logs there; verify in a real browser.
4. Combat Tuner + Dev Mode (bottom-left panel) — live-state debugging.
5. [docs/known-issues.md](docs/known-issues.md) — may already document the problem.
