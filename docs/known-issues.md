# Known issues

Problems, leftovers, and limitations that are known but not yet fixed. Add entries here as they're discovered; remove them when fixed.

## Internal "ballet" naming leftover

The game was renamed from **Silhouette Ballet** to **Silhouette Samurai**, and all user-facing instances (page title, HUD header, intro title card) were updated. One intentional leftover remains:

- The procedural music layer in `audio/MusicManager.js` (`gainNodes.ballet`), the matching "Ballet Layer" slider label in `ui/tuner/panels/AudioPanel.js`, and the placeholder key in `audio/audio-assets.js` still use the word "ballet".

These are internal identifiers, not user-facing text, so renaming them is a low-priority refactor. `BALLET OF BRUTALITY` in `index.html` is an intentional in-game flavour string (the combo-splash subtitle), not a name reference.

## Unused audio files

- `audio/audio-assets.js` — placeholder asset paths that are never imported or used; all audio is procedural.
- `audio/audio-assets.mp3` — an 80KB audio file that is never referenced anywhere.

Both are dead weight but harmless (the `.mp3` is simply served to anyone who requests it). Delete them once confirmed unnecessary.

## In-game title card scale depends on world position

The intro text ("SILHOUETTE SAMURAI") is rendered as an SDF field in world space at `x: 800` with a large glyph scale. Because the title is anchored in world coordinates, it appears very large on screen (the camera starts at `x: 0`) and can be expensive to rasterise — in headless software rendering it timed out Firefox's slow-script watchdog, even though it runs fine in a real browser. If it becomes a problem, shrink the glyph scale in `sdf/text-sdf.js` usage (`controller/GameController.js` → `introTexts`) or move the title card closer to the camera start (`x: 400`).

## SDF fill pass is CPU-bound

The per-frame SDF extraction runs on the CPU at canvas resolution. In software-rendered environments (headless browsers, weak devices) this is noticeably slow. The original project already replaced `shadowBlur` loops with layered strokes for performance; any further work should start by reducing grid resolution or restricting the SDF to the visible viewport rather than changing the approach.

## Runtime verification status

The game now has a repeatable browser smoke test: `webgame.config.json`, run by the shared harness in `../webgame-tools/`. It loads the game in headless Firefox via WebDriver BiDi and checks the title, HUD highlight, all 5 theme buttons, a theme change, the Combat Tuner (3 tabs, at least 3 attack options, at least 5 sliders), audio initialization after a trusted click, keyboard input, and that `#sdf-canvas` painted content. It fails on page errors, unexpected external requests, or a blank canvas, and it compares the settled frame with the committed baseline in `test/baselines/`. See `docs/development.md` for the commands.

A long play session (combos, clashes, boss fights) has **not** been exhaustively tested in a real browser — the smoke test proves the frame and core UI, not full gameplay balance.

## Git history notes

The project's git history (183+ commits) documents an iterative development process:

- The game started as "Untitled Line Game", was later called "Silhouette Ballet", and is now **Silhouette Samurai**
- Major refactoring phases moved monolithic files into modular structures
- The combat tuner was added for balance iteration
- Enemy AI was introduced incrementally (melee → archer → floater → boss)
- Performance optimization history: shadowBlur → layered strokes, reduced segment counts
- No CI/CD configuration beyond static hosting deployments (GitHub Pages workflow added recently; see development.md)
