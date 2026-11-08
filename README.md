# Silhouette Samurai

A single-contour-line upper-envelope action platformer. The ground, characters, and effects are fused into one glowing outline with signed distance fields (SDFs) on Canvas 2D.

> Formerly developed as **Untitled Line Game** and **Silhouette Ballet**.

## Run locally

Requires [Node.js](https://nodejs.org/) 18 or newer. There is no install or build step.

```bash
npm run dev
```

Then open <http://127.0.0.1:8080/>. Use `npm run dev -- --port 8081` if the default port is busy. A Python fallback works too:

```bash
python3 -m http.server 8080
```

Do not open `index.html` directly with `file://` — the game uses ES modules and needs an HTTP server.

## Check

```bash
npm run check
```

This is a fast static check (JavaScript syntax, local imports, and `index.html` assets), not a replacement for playing the game.

The shared harness adds a second static pass and a real browser run:

```bash
npm run check:static  # imports, assets, external URLs, readiness; no browser
npm run smoke         # rendered canvas, HUD, tuner, input, console, visual diff
npm run runs          # dashboard of recent runs
```

`smoke` verifies the rendered canvas, HUD, theme buttons, Combat Tuner, keyboard input, console health, external-request freedom, and the committed visual baseline in `test/baselines/`. It writes screenshots plus `report.json` under `.artifacts/webgame/`. Use `npm run visual:update` only when the visual change is intentional, then commit the updated baseline.

## Controls

| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A/D or Arrow Left/Right | Left stick / D-pad |
| Jump | W / Space / Arrow Up | Left stick up / D-pad up |
| Crouch / slide | S / Arrow Down | Left stick down / D-pad down |
| Attack (hold to charge) | J / 1 | A or Y |
| Block | K / 2 | B or X |

## Documentation

- [AGENTS.md](AGENTS.md) — overview and working agreement for AI agents
- [docs/architecture.md](docs/architecture.md) — module map and runtime architecture
- [docs/development.md](docs/development.md) — local workflow, conventions, deployment
- [docs/gameplay.md](docs/gameplay.md) — controls and combat systems
- [docs/design.md](docs/design.md) — coherent design extrapolated from git history (PC + controller-first)
- [docs/known-issues.md](docs/known-issues.md) — known problems and limitations
