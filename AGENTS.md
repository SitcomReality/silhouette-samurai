# Silhouette Ballet — Project Guide for AI Agents

## Project Overview

**Silhouette Ballet** (also called "Untitled Line Game") is a 2D browser-based action game. It's described as a "Single Contour Line Upper-Envelope Platformer" where the ground, characters, and other entities are all fused into a single outline using **Signed Distance Fields (SDFs)** on a Canvas 2D surface. The visual result is a continuous, glowing contour line — the player and enemies appear as silhouette-like shapes merged with the ground contour.

The game is a side-scrolling action-fighter with procedural music, real-time combat (attacks, blocks, parries, combos, finishers), enemy AI, and a developer tuning panel for balancing.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Language | **Vanilla JavaScript (ES Modules)** — no TypeScript, no transpilers |
| Rendering | **Canvas 2D API** — 4 layered canvases (bg, sdf, fx, ui) |
| Audio | **Web Audio API** — all sounds are procedurally synthesized, no audio files |
| Text SDF | `@mapbox/tiny-sdf` (loaded via importmap from esm.sh) |
| Build | **None** — static files served directly |
| Hosting | Cloudflare Pages (Cloudflare analytics beacon present) |
| CSS | Plain CSS, no preprocessors |
| Testing | **None** — no test framework or test files exist |

### Key dependency (loaded at runtime via importmap)

```html
<script type="importmap">
{
  "imports": {
    "tiny-sdf": "https://esm.sh/@mapbox/tiny-sdf@2.0.6"
  }
}
</script>
```

---

## Project Structure

```
├── index.html              ← Single HTML entry point, declares 4 canvases + UI overlay
├── app.js                  ← Entry point: creates GameEngine and starts the loop
├── main.css                ← All styling (259 lines, global theme variables, animations)
├── ui-overlay.js           ← UIOverlay class: coordinates ThemeManager, ActionButtons, StatsManager, CombatTuner
│
├── engine/
│   └── GameEngine.js       ← Orchestrator: creates controller, canvas, audio, and the render loop
│
├── controller/
│   ├── GameController.js   ← Central game state hub, initializes subsystems
│   ├── spawner.js          ← Entity factory functions (enemy, archer, floater, boss, crates)
│   ├── update.js           ← Master update tick: orders all system updates
│   ├── input/
│   │   └── InputManager.js ← Keyboard + gamepad handling, buffered attack/block input
│   ├── state/
│   │   ├── ResetHandler.js ← Resets all game state on restart/death
│   │   └── PlayerFactory.js← Creates the player entity with full state shape
│   └── systems/            ← Per-frame update systems called in order
│       ├── player/
│       │   ├── state.js    ← Timer updates, resource regen, jump buffering, block state
│       │   ├── physics.js  ← Movement, friction, sliding, jumping, air physics
│       │   └── integration.js ← Position integration, gravity, ground collision
│       ├── combat/
│       │   ├── attacks.js  ← Player attack state machine, charge/timing/buffer
│       │   ├── clashes.js  ← Checks for attack-against-attack clash events
│       │   └── enemy-attacks.js ← Enemy hit resolution, projectile collision
│       ├── entities/
│       │   ├── update.js   ← Entity physics, lifetime, state transitions
│       │   ├── ai.js       ← Enemy AI: melee, archer, floater behaviors
│       │   ├── collision.js← Entity-entity push-apart collisions
│       │   └── spawner.js  ← Procedural level generation (waves of enemies)
│       ├── camera/
│       │   └── update.js   ← Smooth camera follow (5 lines)
│       ├── animation/
│       │   └── update.js   ← Drives character animation per entity, handles sliced debris rotation
│       └── fx/
│           ├── config.js   ← Visual effect configuration constants
│           └── update.js   ← Particle/shockwave/visualFX/floatingText lifecycle
│
├── character/
│   ├── representation.js   ← createCharacter(): builds the shape object (body capsule, head, sword)
│   ├── animator.js         ← animateCharacter(): blends target pose → current with lerp, applies rotation
│   ├── sdf-eval.js         ← evalCharacterSDF(): evaluates SDF distance for a character at (x,y)
│   └── animation/
│       ├── easing.js       ← Easing functions (easeOutCubic, easeInCubic, easeInOutCubic)
│       ├── states/
│       │   ├── locomotion.js ← Idle, run, jump, crouch, slide poses
│       │   └── reactions.js  ← Dead, hit, block, stagger, trip poses
│       └── attacks/
│           ├── basic.js    ← Unified attack procedural pose
│           └── dance.js    ← Finisher attack poses (neutral, up, down)
│
├── combat/
│   ├── AttackFrameData.js  ← Frame data class (startup/active/recovery, damage, knockback, etc.)
│   ├── frame-data.js       ← Exports PHYSICS_DATA, COMBO_CONFIG, ATTACK_FRAME_DATA, UNIFIED_ATTACK, CHARGE_CONFIG
│   ├── hitbox.js           ← Re-exports from attacks/logic/hitbox.js
│   ├── parry.js            ← ParrySystem: parry window, clash detection, stagger/counter logic
│   ├── config/
│   │   ├── physics.js      ← Gravity, jump, acceleration, friction constants
│   │   └── combo.js        ← Decay time, finisher threshold
│   └── attacks/
│       ├── trigger.js      ← triggerUnifiedAttack(): creates attack with charge scaling, procedural swoosh
│       ├── resolve.js      ← resolveAttackHits(): hit detection, damage application, counter/parry/sweetspot
│       ├── logic/
│       │   └── hitbox.js   ← getHitbox(), checkHitboxCollision()
│       ├── data/
│       │   ├── unified.js  ← Unified attack definition + charge config
│       │   └── finishers.js← Three finisher attack definitions (neutral, up, down)
│       └── fx/
│           ├── impact.js   ← Hit particles, floating damage text
│           └── slicing.js  ← Debris spawning (sliced character halves with rotation)
│
├── renderer/
│   ├── GameCanvas.js       ← Creates 4 canvases, manages resize, drives the render loop
│   ├── sdf-pass.js         ← SDF evaluation → fill + outline rendering (the core visual style)
│   ├── ui-pass.js          ← Health bars, floating texts, dev overlay
│   ├── fx-pass.js          ← Orchestrates glow, combat FX, motion FX rendering
│   ├── debug-pass.js       ← Dev-mode hitbox/skeleton visualization
│   └── fx/
│       ├── GlowRenderer.js     ← Enemy/player charging glow rings, projectile rendering, attack telegraphs
│       ├── CombatFXRenderer.js ← Parry flash, clash spark, damage spark
│       └── MotionFXRenderer.js ← Motion streaks, arc swooshes
│
├── sdf/
│   ├── primitives.js       ← smin(), sdCircle(), sdBox(), sdCapsule()
│   ├── contour.js          ← computeContourY(): binary search for top-of-SDF at a given x
│   ├── extraction.js       ← extractSDFSegments(): full SDF grid evaluation + marching-squares contour extraction
│   ├── ground.js           ← getGroundY(): base ground with sin/cos waves + shockwave deformation
│   └── text-sdf.js         ← TextSDFManager: TinySDF wrapper for text layout + distance queries
│
├── audio/
│   ├── AudioEngine.js     ← Main audio orchestrator, user-interaction gate, delegates to subsystems
│   ├── BeatClock.js       ← BPM-based beat timing, 16th-note snap
│   ├── MusicManager.js    ← Procedural music sequencer, dynamic layering by combo/enemy proximity
│   ├── SFXManager.js      ← SFX dispatcher with compressor chain
│   ├── audio-assets.js    ← Placeholder asset paths (unused — all audio is procedural)
│   ├── music/
│   │   ├── Config.js      ← Pentatonic scales, motifs, drum patterns, song progression
│   │   ├── Sequencer.js   ← Procedural melody/bass/counterphrase generation from motifs
│   │   ├── Synthesizer.js← Dispatches to instrument modules
│   │   └── instruments/
│   │       ├── Drums.js   ← Kick, snare, hi-hat synthesis
│   │       ├── Bass.js    ← Acid bass synthesis
│   │       ├── Melodic.js ← Piano, pluck, bell synthesis
│   │       └── Leads.js   ← Synth lead, saw lead, string synthesis
│   └── sfx/
│       ├── ImpactSFX.js   ← Hit, slam, land, impact sounds
│       ├── CombatSFX.js   ← Parry, clash sounds
│       ├── MovementSFX.js ← Attack swoosh, whoosh, slide, jump sounds
│       └── AmbientSFX.js  ← Fusion hum (particle-ground contact)
│
└── ui/
    ├── ThemeManager.js    ← Theme color picker (Cyan, Green, Crimson, Violet, Gold), dev-mode toggle
    ├── ActionButtons.js   ← On-screen attack/block buttons for touch/mouse
    ├── StatsManager.js    ← HUD: score, max combo, enemies, bosses, combo splash
    └── tuner/
        ├── CombatTuner.js ← Developer tuning panel (attack/physics/audio tabs)
        ├── TunerUI.js     ← HTML template strings for the tuner panels
        ├── TunerHelpers.js← createSectionHeader(), createSlider() utility functions
        └── panels/
            ├── AttackPanel.js  ← Sliders for frame data, damage, hitbox, animation params
            ├── PhysicsPanel.js ← Sliders for gravity, jump, friction, acceleration
            └── AudioPanel.js   ← Sliders for BPM, volume, filter, instrument selection
```

---

## Build and Run

### No build step

This is a static JS project. There is no bundler, no transpiler, no npm scripts. To run it:

```bash
# Serve the project root with any static file server:
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` in a browser. The game starts on page load.

### Deployment

The project is hosted on **Cloudflare Pages**. Push to the repository and Cloudflare builds/serves the static files automatically. There is no build command configured — Cloudflare Pages serves the raw file tree.

---

## Runtime Architecture

### Entry and Initialization

1. **index.html** loads as static page with 4 `<canvas>` elements layered via CSS:
   - `#bg-canvas` (background fill, no pointer events)
   - `#sdf-canvas` (main SDF contour rendering)
   - `#fx-canvas` (visual effects composited with `lighter` blend mode)
   - `#ui-canvas` (health bars, floating text, debug overlay)
   - An HTML overlay `#ui-overlay` handles score/HUD/controls/tuner

2. **app.js** — creates `GameEngine` on `DOMContentLoaded`, calls `engine.start()`.

3. **GameEngine** wires up:
   - `GameController` (game state + subsystems)
   - `GameCanvas` (4-canvas renderer)
   - `AudioEngine` (WebAudio procedural sound)
   - `UIOverlay` (theme, stats, action buttons, combat tuner)

### Game Loop

The game loop runs via `requestAnimationFrame` inside `GameCanvas.render()`:

```
render(time):
  dt = (time - lastTime) / 1000
  controller.update(dt)           ← game logic tick
  clear canvases
  apply screen-shake transform
  renderSDF()                     ← fill + outline contour
  renderFX()                      ← glows, combat FX, motion FX
  renderDebug() (if devMode)      ← hitboxes, skeletons
  renderUI()                      ← health bars, floating text, status overlay
  restore transform
  requestAnimationFrame(render)
```

### Update Order (controller/update.js)

Each frame, `updateEngine()` calls systems in strict order:

1. **hitstop** — if hitstop > 0, skip everything else that frame
2. **intro layouts** — generate text SDF layouts once
3. **screen shake** — decay shake value
4. **player timers + regen** — state time, power regen, jump buffer, block state
5. **player physics** — movement input, friction, sliding, jumping, air physics
6. **player attacks** — charge timing, frame advancement, buffered attack execution
7. **player integration** — position += velocity, gravity, ground collision
8. **camera** — smooth follow player
9. **spawner** — procedural wave-based enemy spawning
10. **enemy AI** — per-enemy behavior (melee, archer, floater, boss)
11. **entity physics** — movement, gravity, dead cleanup
12. **clashes** — attack-vs-attack clash detection
13. **enemy attacks** — projectile collision, enemy hitbox → player damage
14. **collisions** — entity-entity push-apart
15. **animations** — per-entity pose calculation, sliced debris rotation
16. **FX update** — particle physics, shockwave expansion, visual FX lifetime

A separate `setInterval` at ~60ms ticks the UI overlay and audio engine for non-critical updates.

### Audio

- **Web Audio API** only — no pre-recorded audio files
- Audio context is created lazily after first user interaction (click/keypress) due to browser autoplay policy
- Music is procedurally generated in real-time using pentatonic scales, motifs, drum patterns
  - `MusicSequencer` generates 64-step phrases using call/response motifs
  - `MusicManager` adapts layers dynamically based on combo count and enemy proximity
  - Three mix layers: `base` (ambient), `action` (drums/bass), `ballet` (melodic leads)
- SFX uses synthesized oscillators, noise buffers, filters, distortion, and compressors
- Audio routing: instrument → gainNodes → biquad filter → masterGain → compressor → destination

### Rendering Pipeline (SDF)

The core visual technique:

1. **extractSDFSegments()** evaluates a 2D SDF grid at screen resolution:
   - For each column, compute the signed distance to ground, entities, particles, and text
   - Uses `smin()` (polynomial smooth minimum) to blend shapes together
   - Character SDF is computed from capsule body + circle head + bulge limbs + capsule sword
2. **Marching squares** extracts contour segments from the SDF grid
3. **Segment chaining** connects adjacent contour segments into continuous polylines
4. **Rendering** draws layered strokes on the polylines to create a glow effect (outer glow → medium glow → core colored line → inner white highlight)
5. **Fills** are rendered with per-column scanline spans for correct overhang handling

---

## Key Architecture Decisions

### No testing framework
There are no tests in the project. Verification is done by running the game in a browser and using the built-in **Combat Tuner** (dev feature).

### No state management library
All game state lives in `GameController` as plain JS objects. The `player` and `entities` arrays hold the full state of every game object. There is no ECS — each entity is a plain object with optional fields checked at runtime.

### SDF-based rendering as core visual identity
The entire visual style revolves around the signed distance field. Characters are represented as SDF primitives (capsules and circles) rather than sprites. This allows the distinctive "fused silhouette" look where ground, characters, and effects all blend into one continuous contour line.

### Procedural everything
All art, music, and sound effects are procedurally generated at runtime. There are no image assets, sprite sheets, or audio files.

### Modular refactoring history
The project has been actively refactored from monolithic files. Key splits visible from git history:
- `controller/GameController.js` → `controller/systems/*`
- `renderer/fx-pass.js` → `renderer/fx/*`
- `audio/SFXManager.js` → `audio/sfx/*`
- `audio/music/Synthesizer.js` → `audio/music/instruments/*`

---

## Development Conventions

### Code style (observed)
- **ES Modules** with named exports throughout
- **No semicolons** (ASII style)
- **2-space indentation**
- **Template literals** used heavily for HTML strings in the tuner
- **Arrow functions** preferred over `function` declarations
- **`camelCase`** for variables, methods, and file names
- **`PascalCase`** for classes
- CSS custom properties used for theming (`--theme-color`)
- Judicious use of `Math.min` / `Math.max` for clamping (no helper function)
- Destructuring imports for clarity

### File organization
- One class or one logical module per file
- Modular subsystems under `controller/systems/` by domain
- Animation and SDF evaluation are separate from rendering
- Config data separated from logic (e.g., `combat/config/`, `controller/systems/fx/config.js`)

### Naming conventions
- Entities in the game world are called `entities` (array on controller)
- Visual particles are `particles` (separate from entities)
- Visual effects are `visualFx` (swooshes, sparks, flashes)
- The player is always `controller.player`
- Player-facing direction: `'right'` or `'left'` string
- State machine states: `'idle'`, `'run'`, `'jump'`, `'attack'`, `'block'`, `'hit'`, `'stagger'`, `'trip'`, `'dead'`

---

## Key File Locations for Common Tasks

| Task | File(s) |
|---|---|
| Player physics tuning | `combat/config/physics.js`, `controller/systems/player/physics.js` |
| Attack frame data | `combat/attacks/data/unified.js`, `combat/attacks/data/finishers.js` |
| Add new attack type | `combat/attacks/data/`, `character/animation/attacks/`, `combat/frame-data.js` |
| Add new enemy type | `controller/spawner.js`, `controller/systems/entities/ai.js` |
| Adjust SDF rendering | `renderer/sdf-pass.js`, `sdf/extraction.js`, `sdf/contour.js` |
| Adjust character appearance | `character/representation.js`, `character/animator.js` |
| Adjust music | `audio/music/Config.js`, `audio/music/Sequencer.js` |
| Tune game balance | Use the in-game **Combat Tuner** (dev mode) then export to clipboard |
| UI/HUD changes | `ui-overlay.js`, `ui/StatsManager.js`, `ui/ThemeManager.js`, `renderer/ui-pass.js` |
| Game restart logic | `controller/state/ResetHandler.js` |

---

## Enemy Types

| Enemy | Behavior | Defined in |
|---|---|---|
| **Melee** | Runs toward player, attacks when in range (80px), 1.2s cooldown | `controller/systems/entities/ai.js` (`triggerEnemyAttack`) |
| **Archer** | Maintains 300px distance, fires projectiles at 450px range, 2.0s cooldown | `controller/systems/entities/ai.js` (`updateArcherAI`) |
| **Floater** | Hovers above ground (sine wave bob), downward slam attack | `controller/systems/entities/ai.js` (`updateFloaterAI`) |
| **Boss** | Large health pool (300 * difficulty), scales with difficulty, appears every 15 enemies | `controller/spawner.js` (`spawnBoss`) |
| **Crate** | Destructible obstacle (40 HP), no AI, blocks movement | `controller/spawner.js` (`spawnCratesSquareWave`) |

---

## Controls

| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A/D or Arrow Left/Right | Left stick / D-pad |
| Jump | W / Space / Arrow Up | A button |
| Crouch/Slide | S / Arrow Down | D-pad down |
| Attack (hold to charge) | J / 1 | X or Y button |
| Block | K / 2 | B button |
| Directional attack | Attack + movement direction | Attack + left stick |

---

## Security Considerations

- No user input is sent anywhere — entirely client-side game
- The Cloudflare analytics beacon is the only external request
- TinySDF is loaded from a CDN (esm.sh) at runtime
- No authentication, no API endpoints, no database
- No user-generated content is persisted

---

## Combat System

### Unified Attack (charge-based)
- Hold attack button to charge (0-1.2 seconds)
- Damage scales 1.0x–2.5x with charge
- Knockback scales 1.0x–2.0x with charge
- Direction based on movement input (8-direction)
- Air attacks allow full 360-degree aiming with body rotation
- Procedural arc swoosh visual follows the swing arc

### Finisher Attacks
- Triggered from block when combo >= 5
- Three directional variants: neutral (forward), up, down
- Higher damage (28-30), longer startup (16f startup, 6f active)
- Distinct animation poses per direction

### Parry System
- Perfect block window: first 6 frames of blocking
- On parry: attacker is staggered, defender gets counter bonus (+50% damage)
- Visual parry flash + screen shake + hitstop

### Clash System
- When two attacks make contact during active frames
- Both parties are pushed back and reset to idle
- Visual clash spark + screen shake + hitstop

### Combo System
- Combo counter increments on each hit
- Decays after 1.4 seconds of no hits
- At 5+ combo: block transitions into finisher attacks
- Score multiplier scales with combo (100 * (1 + combo * 0.1))
- Music intensity scales with combo

### Hitstop and Screen Shake
- Hitstop freezes all game logic for N frames on hit
- Screen shake applies random offset to all canvases
- Both are applied additively from various sources (parries, clashes, sweetspots, heavy hits)

---

## Game State (controller/state/PlayerFactory.js)

The player entity has ~40 state fields covering:
- Position, velocity, facing, grounded state
- Health (100), max health
- State machine: idle/run/attack/block/hit/stagger/trip/dead
- Attack system: type, frame data, frame time, charge, angle, aim
- Resource meters: slidePower (100), aerialPower (100)
- Buffers: jumpBuffer, attackBuffer, blockBuffer
- Parry/counter state flags
- Combo counter and timers

---

## Git History Notes

The project's git history (183+ commits) documents an iterative development process:
- The game started as "Untitled Line Game" and was later named "Silhouette Ballet"
- Major refactoring phases moved monolithic files into modular structures
- The combat tuner was added for balance iteration
- Enemy AI was introduced incrementally (melee → archer → floater → boss)
- Performance optimization history: shadowBlur → layered strokes, reduced segment counts
- No CI/CD configuration — just static hosting deployments
