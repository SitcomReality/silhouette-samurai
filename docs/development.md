# Development

How to run, check, and deploy Silhouette Samurai.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer, **or** Python 3 (for the fallback server)
- A browser (Firefox/Chrome work)
- Internet access on first load, so the `tiny-sdf` import map entry on esm.sh can be fetched

## Run it locally

The game uses ES modules, so opening `index.html` directly from the filesystem (`file://`) will not work. Serve the project root instead:

```bash
npm run dev
```

Then open <http://127.0.0.1:8080/> in a browser. Options:

```bash
npm run dev -- --port 8081        # different port if 8080 is busy
npm run dev -- --host 0.0.0.0     # reachable on your LAN (e.g. for phone testing)
```

`scripts/dev-server.mjs` is a small zero-dependency Node static server: it serves the project root with correct JS MIME types, `index.html` for directory requests, and 404/405 handling. No install step is needed — `package.json` has no runtime dependencies.

Python fallback (equivalent, if Node isn't available):

```bash
python3 -m http.server 8080
```

## Smoke check

```bash
npm run check
```

`scripts/check.mjs` verifies that every `.js`/`.mjs` file in the repo parses as an ES module, that every relative import resolves to a real file, and that the local assets referenced by `index.html` exist. It is a static check only — it does not run the game. Manual browser testing plus the in-game Combat Tuner remain the real verification.

## Deployment

The game is a static site and is deployed in two ways:

- **GitHub Pages** — `.github/workflows/deploy-pages.yml` uploads the repo root as a Pages artifact on every push to `main`. Enable Pages in the repository settings with "GitHub Actions" as the source. The `.nojekyll` file prevents Jekyll from processing the repo.
- **Cloudflare Pages** — also serves the raw file tree with no build command (a Cloudflare analytics beacon is present in `index.html`, and is inert anywhere else).

There is no build step: the files in this repo are served as-is.

## Code conventions

Observed style (please match it in new code):

- **ES Modules** with named exports throughout
- **No semicolons** (ASII style), **2-space indentation**
- **Template literals** used heavily for HTML strings in the tuner
- **Arrow functions** preferred over `function` declarations
- **`camelCase`** for variables, methods, and file names; **`PascalCase`** for classes
- CSS custom properties for theming (`--theme-color`)
- `Math.min` / `Math.max` used directly for clamping (no helper function)
- Destructuring imports for clarity

File organization:

- One class or one logical module per file
- Modular subsystems under `controller/systems/` by domain
- Animation and SDF evaluation are separate from rendering
- Config data separated from logic (e.g., `combat/config/`, `controller/systems/fx/config.js`)

Naming conventions:

- Entities in the game world are called `entities` (array on controller)
- Visual particles are `particles` (separate from entities)
- Visual effects are `visualFx` (swooshes, sparks, flashes)
- The player is always `controller.player`
- Player-facing direction: `'right'` or `'left'` string
- State machine states: `'idle'`, `'run'`, `'jump'`, `'attack'`, `'block'`, `'hit'`, `'stagger'`, `'trip'`, `'dead'`

## .gitignore

`.gitignore` contains standard defaults: OS junk (`.DS_Store`, `Thumbs.db`), editor/IDE state (`.idea/`, `*.code-workspace`, personal `.vscode/*` except shareable config), Node artifacts, `.env` files, logs, caches, and typical build output directories (`dist/`, `build/`, `out/`, `coverage/`).

On `.code-workspace` files specifically: they are optional VS Code workspace shortcuts and are usually personal/local, so ignoring `*.code-workspace` is the common default. If the workspace file ever contains settings the whole team should share (extensions, recommended settings), commit it instead and remove that ignore rule.

Note: the game itself never loads a `.env` file — it's a fully static page. The `.env` ignore entries only keep accidental local files out of the repo.

## Security notes

- No user input is sent anywhere — entirely client-side game
- The Cloudflare analytics beacon is the only external request besides the `tiny-sdf` CDN import
- TinySDF is loaded from a CDN (esm.sh) at runtime via the import map in `index.html`
- No authentication, no API endpoints, no database
- No user-generated content is persisted
