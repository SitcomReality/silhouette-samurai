# Silhouette Samurai — Coherent Design

> Extrapolated from the 187-commit git history (v1–v183, plus the Nov 2026
> rename/local-dev commits) and the current codebase.
>
> **Caveat:** the WebSim exports truncated every commit message at ~200
> characters mid-sentence, so the full original prompts are unrecoverable.
> This document is extrapolated from commit *subjects*, their order, and the
> code they produced. Where a subject cuts off, that is noted rather than
> guessed at in detail.
>
> **Forced decision (2026-11-07):** Silhouette Samurai is a **PC game,
> designed primarily for controller**, with keyboard supported but not the
> main focus. Mobile/touch is out of scope (see §7).

---

## 1. The one-sentence pitch

**You are an anime parkour ninja performing an elegant dance with a sword,
carving a single glowing contour line through an endless world — the longer
you chain hits, blocks, parries and air attacks without whiffing, the more
the music, the visuals and the score swell, until a boss duels you.**

Every recurring phrase in the history points at this sentence:

| Version | What you actually said |
|---|---|
| v8 | combat should be *"rewardingly punishing"* — flow continues while moves are timed and chained, fails when a move misses |
| v11 / v16 | *"buttery continuous motion, sliding-between-enemies gamefeel built around inertia"* and *"fluid dance combat"* |
| v36 | fighting should feel *"smooth and floaty and filled with chained surges and flourishes"* |
| v52–v54 | punches → swords; *"the sword tip traces perfect arcs and the entire body is pulled along like it's on a string"* |
| v63 | *"fluid, acrobatic, and highly skillful swordfighting … rewards timing, spacing"* |
| v99 | *"our samurai waltz"* — *"everything can be a step in the blade dance"* |
| v167 / v183 | the goal is *"the player feeling like a ballet ninja anime superhero"* / *"an anime parkour ninja performing an elegant dance"* |

Names changed — Untitled Line Game → Silhouette Ballet → Silhouette Samurai —
but that feeling never did.

## 2. The invariant core (never flip-flopped)

These are the things every version, no matter how it contradicted itself
elsewhere, kept returning to. Treat them as non-negotiable:

1. **Single-contour SDF visuals.** Ground, characters, text and effects are
   one fused glowing outline (`sdf/extraction.js`, `renderer/sdf-pass.js`).
   Enemies share the player's outline (v102 reverted a separate enemy
   outline); distinction comes from small flat glow rings, not colour
   floods (v103–v104, v178).
2. **Inertia is the movement.** Attacks propel you only in a held direction;
   neutral attacks give no free forward movement (v146–v147). Attacks never
   steal momentum they shouldn't (v74: Up attack *adds* vertical impulse).
   Sliding preserves momentum (v17, v30).
3. **Whiffing is punished.** Failed hits break flow — this is the entire
   risk/reward engine (v8, and the combo decay in `combat/config/combo.js`).
4. **Juice is load-bearing, not decoration.** Swooshes, hitstop, screen
   shake, damage sparks, slicing deaths with randomised cut angles
   (v128–v129), and the sword leading the body (v54) — these *are* the game
   feel, and perf work (v134, v141, v152, v180) must never remove them,
   only render them cheaper (layered strokes over `shadowBlur`).
5. **Music reacts to play.** Hits are instruments (v39: *"amazing and feels
   great"*), percussion enters only as combo builds (v43), layers crossfade
   on a long gradient rather than jumping states (v100), and melody comes
   from motifs, not random pentatonic notes (v95).
6. **Endless rightward progression with boss punctuation.** Difficulty
   rises; a bigger, stronger boss demarcates it (v37; boss every 15
   enemies in `controller/systems/entities/spawner.js`).
7. **The Combat Tuner is the balance workflow.** Tune live, export JSON,
   apply to `combat/frame-data.js` / `combat/config/physics.js` /
   `audio/music/Config.js` (v77). Balance is done by numbers, not rewrites.

## 3. What flip-flopped — and the resolution

| Flip-flop (evidence) | Resolution adopted here |
|---|---|
| Discrete movelist → Blade Dance / rekka chains (v63–v71) → *"clunky and ineffectual"* (v71) → everything-is-a-dance (v99) → starter move removed as dance merged into combo (v108, v110) → **unified procedural attack** (v136) | **One unified charge attack + finishers.** No movelist to learn. Direction + charge + air/ground + combo state produce variety. The Blade Dance is dead as a mechanic; it survives only as the *feeling* and as internal finisher names (`dance_finisher_*`). |
| Punches, bulbous bodies (v52) → swords (v52) → body-primary → sword-tip-leads-body (v54) | **Sword tips trace perfect arcs; the body is pulled along.** Any new animation that reads as "body first, sword decoration" is wrong. |
| Random-note music → motifs (v95) → multi-verse progression (v44–v46) → layers harmonising with the current bar (v42) | **Motif-based generative music, 3 layers** (base / action / ballet-melodic), intensity = combo + enemy proximity, long crossfades. |
| *"Nail solo feel before enemy AI"* (v162) vs. immediately adding enemy AI (v168) | **v162 wins, retroactively.** Enemy AI in its current form (v168–v183) is a placeholder rhythm (run up, 1.2s charge-ring telegraph, swing, hit resets timer — v169–v176). Do not expand the roster until the solo feel-lock gate (§8) passes. |
| Touch/mouse `ActionButtons` (see `ui/ActionButtons.js`) beside a controller mapping added in v40 | **PC + controller first, keyboard second, touch removed** (§7). v40's mapping was never finished — jump still rides on "stick up", and `InputManager.js` hard-codes a single gamepad (`gamepads[0]`) with no remapping, no start/pause, and no deadzone tuning UI. |

## 4. Design pillars

1. **Flow or fall.** A 1.4s combo window (`combat/config/combo.js`) is the
   heartbeat. Everything — hitting, blocking, parrying, air attacks,
   finishing — feeds it. Whiffing starves it. The score, the music and the
   finisher unlock all read from it, so the player always knows what they
   are doing *for*.
2. **Melted butter, tight leash.** v162's exact tension: *"gracefully smooth
   like melted butter"* vs. *"intuitively responsive and tightly tied to
   input"*. Both. Smoothness lives in acceleration/friction curves
   (`combat/config/physics.js`); tightness lives in input buffering
   (0.4s attack/block buffers in `controller/input/InputManager.js`,
   jump buffering, v181's post-release charge window) and 2-frame attack
   startup (`combat/attacks/data/unified.js`).
3. **One button, many dances.** Hold/release timing (charge 0–1.2s, damage
   1.0×–2.5×) + stick direction (8-way grounded, full 360° airborne with
   body rotation, v155–v161) + game state (grounded/airborne, combo ≥ 5,
   blocking) generate the whole moveset procedurally. No two consecutive
   inputs should ever need to produce the same visual.
4. **Readable telegraphs, fair punishment.** Enemy charge rings (1.2s),
   archer projectiles, floater slam — the player is never hit by surprise
   and never hit because the game was unclear. Punishment comes from
   *their* whiff, not from obscurity.
5. **Spectacle at 60fps.** The SDF fill is CPU-bound
   (`docs/known-issues.md`). PC-first means: budget the SDF grid to the
   viewport, never reintroduce `shadowBlur` in loops, and keep FX flat and
   layered. Visual ambition is spent on *motion*, not on per-frame cost.

## 5. The loop

### Moment-to-moment (seconds)
Run → slide → air-dive → charge a directional slash mid-flight → land,
block the counter-swing (parry window = first 6 frames of block) →
combo crosses 5 → block becomes finisher button (neutral/up/down) →
slice kill with a fresh cut angle → music peaks → next enemy already in
motion. **The player should never stand still except to charge.**

### Run (minutes)
Endless rightward waves, spawn spacing enforced so enemies arrive as a
rhythm, not a clump (v151, v182), difficulty (enemy HP/speed/count)
scaling, boss every 15 → brief duel → escalation. Death → score +
max combo → instant restart. There is no meta-progression; the addiction
is the high score and the flow state. That is deliberate — adding unlocks,
currency or a campaign would dilute the one thing the history proves works.

### Why it's addictive (the extrapolated hook)
Combo simultaneously drives **score multiplier**, **music intensity** and
**finisher access**. Three reward channels, one input: play well and the
game literally gets louder, richer and stronger. That v39 moment — *"I'm
making the music"* — is the retention mechanic. Protect it.

## 6. Combat & controls — controller-first

### Canonical mapping (target)

| Action | Controller (primary) | Keyboard (supported) |
|---|---|---|
| Move / aim | Left stick (analog) or D-pad | A/D, arrows |
| Jump | **RB** (new) or left stick/D-pad up (legacy) | W / Space / ↑ |
| Crouch / slide | Left stick/D-pad down | S / ↓ |
| Attack (hold = charge, release = strike) | **RT** (new) or A/Y (legacy) | J / 1 |
| Block / parry | **LT** (new) or B/X (legacy) | K / 2 |
| Finisher (combo ≥ 5, direction = stick) | **LB** (dedicated) or Y (legacy) | **L** (dedicated) |
| Pause / restart | Start / Menu | Esc / R |

Rationale: triggers give analog charge on release, shoulders give a
dedicated jump that doesn't fight the aim stick, and the legacy A/Y + B/X
mapping (v40) keeps working as a fallback. Keyboard parity is maintained
through the existing `masterKeys` merge in `InputManager.js`, but **no new
feature is designed keyboard-first**, and key hints in UI show controller
glyphs first.

### Input requirements before any new content
- Support *any* connected gamepad, not just `gamepads[0]`.
- Remappable buttons, adjustable stick deadzone, and a pause button.
- Charge buffering across the release window (v181) and air-attack body
  rotation that only completes on release (v158–v161) are locked-in,
  regression-tested behaviours — do not regress them while refactoring input.
- **Remove or hide `ui/ActionButtons.js` touch/mouse buttons** on the PC
  build. They exist for the abandoned mobile paradigm; keep them only as a
  dev-mouse fallback if hiding them costs more than it saves.

### Combat spec (as built, now frozen as design)
- **Unified attack:** startup 2f, active 6f, recovery 8f, base damage 12,
  charge scales damage 1.0×–2.5× and knockback 1.0×–2.0× over 0–1.2s.
  A tap is a min-charge jab, not a separate move — so a flurry is
  press→release→press→release, and the player can hold *mid-flurry* to
  charge any single hit heavier. Input buffering must accept a new charge
  press during the previous attack's recovery (v181) — **charging during
  a flurry is a core rhythm verb, not an edge case.**
- **Finishers (dedicated button, decided 2026-11-08):** combo ≥ 5 unlocks
  a dedicated finisher button (LB / L) → neutral/up/down finishers
  (damage 28–30, 16f startup). Direction from stick at finisher input.
  Block no longer doubles as finisher entry — that overload was a mobile
  button-scarcity compromise, now obsolete.
- **"Ballet" language stays (decided 2026-11-08):** in-game text using
  "ballet" / elegant-dance framing is intentional flavour, not a leftover.
  The player's dancing skill and agile beauty are part of the fantasy, even
  though the title is *Silhouette Samurai*.
- **Parry:** first 6 frames of block; staggers attacker, +50% counter
  damage, flash + hitstop + shake.
- **Clash:** attack-vs-attack in active frames → both reset, spark +
  hitstop + shake.
- **Hitstop/shake:** additive, applied on hits, parries, clashes and
  sweetspots — never on whiffs (whiffs must feel *empty*).

### Enemy roster — roles, not types
Each enemy exists to force a specific player verb. No new enemy without one.

| Enemy | Role (verb forced) | Current behaviour |
|---|---|---|
| Melee | Ground rhythm, spacing | Runs in, 80px range, 1.2s telegraphed swing, hit resets its timer |
| Archer | Air game / block | Keeps ~300px, fires projectiles from 450px, 2.0s cooldown |
| Floater | Verticality | Hovers, sine bob, downward slam — punishes staying grounded |
| Boss | Exam | 300 HP × difficulty, every 15 enemies, larger scale |
| Crate | ⚠️ **Cut candidate** | Destructible blocker; adds clutter, forces no verb. Remove or repurpose as rare traversal texture. |

## 7. Platform decision: PC + controller

Consequences of the forced decision:

- **Layout:** design for 16:9 landscape, full-viewport canvas, no safe-area
  or portrait concerns. HUD (score/combo/theme) readable at TV distance.
- **Perf budget is a PC budget:** the CPU-bound SDF fill
  (`docs/known-issues.md`) targets discrete-GPU / modern-CPU desktops at
  60fps. Optimisation order: viewport-clamped SDF grid → lower grid
  resolution → reduced swoosh segments. Never touch the SDF *approach*.
- **No touch controls, no responsive reflow, no mobile QA.** `index.html`
  keeps its touch buttons only until removal is trivial.
- **Keyboard is a fallback, not a second design.** If a verb can't be done
  on keyboard, that's a bug in the keyboard layer, not a reason to redesign
  the verb around keys.

## 8. Development order (the way out of development hell)

> **Revised 2026-11-08 (owner decision):** enemies, bosses, crates and
> music/audio are **deferred distractions**. The entire audio system is on
> the backburner until much later — it was built too early and too
> integrally. Current focus: **movement, combat rhythm, and yeeting around
> the screen**, plus ways to test them. Enemies exist only as static
> attack targets (training dummies: no AI, no positioning logic); all
> enemy behaviour/positioning work is deferred.

1. **This document is the freeze.** New ideas go in an appendix here
   first; they do not enter code until they survive a week *or* prove the
   core loop is broken without them.
2. **Terrain testbed (§10).** Make the ground a shared heightfield so
   movement can be tested on slopes/ramps/cliffs, not just a flat line.
3. **Feel-lock gate (v162's rule, enforced).** Tune solo movement + unified
   attack with the Combat Tuner until: (a) holding a direction and tapping
   attack *feels* like a surge, not a step; (b) a charged air-dive covers
   ground *and* reads as one arc; (c) sliding into an attack never bleeds
   momentum; (d) charging mid-flurry feels continuous, never dropped.
   No enemy or audio changes until all four pass in a real browser.
4. **Input rebuild** (§6): multi-gamepad, remapping, triggers/shoulder
   primary mapping, dedicated finisher button, remove touch UI. Verify
   with `npm run check` plus a real controller in a real browser.
5. **Test tooling:** keep the Combat Tuner + dev-mode hitbox/skeleton
   view as the primary test surface; add a static dummy and a flat
   "test arena" toggle if feel-lock needs a repeatable baseline.
6. **Deferred, in this order, only after 2–5 pass:** enemy roles → run
   structure → music/audio rebuild → authored levels → hygiene
   (delete `audio/audio-assets.js`/`.mp3`, title-card scale cost).

## 9. Decisions (owner, 2026-11-08)

**Resolved:**
1. **Charge stays, tap = min-charge jab.** The player can charge any hit
   before, after or *during* a flurry of little jabs (§6). No separate
   tap move — charge time is the only variable.
2. **Finishers get a dedicated button** (LB / L, §6). Block no longer
   doubles as finisher entry.
3. **"Ballet" stays.** In-game "ballet" text and elegant-dance framing
   are intentional; the player's dancing skill and agile beauty are core
   to the fantasy. Title remains *Silhouette Samurai*.
4. **Enemies/bosses/crates/music deferred.** Focus is movement + combat
   rhythm + yeeting, with test tooling. Audio is on the backburner
   (revisit much later, likely as a rebuild, not an extension). Enemies
   are static dummies only until feel-lock passes (§8).

**Still open (deferred with the systems they belong to):**
5. **Boss cadence:** every 15 enemies is in code but untested in a long
   session (`docs/known-issues.md`). Decide when run structure returns.
6. **Crates:** cut, or keep as pacing bumps? Decide when enemies return.

## 10. Level design / terrain — yes, early, but in two layers

**Answer: implement terrain *early*, but split it.**

### Why early is right
Movement is the whole game (§4). A flat line hides entire classes of
feel bugs: does a slide hold speed downhill? Does a charged dive launch
off a ramp or die into it? Does an air attack's body rotation still read
on a slope? You cannot answer those on `y = 400`. Terrain is not content
here — it's a **test instrument**.

### What's already half-there (and the bug)
- Visual ground: `getGroundY(x, baseGroundY, shockwaves)` in
  `sdf/ground.js` already returns a wavy height (sin ±4, cos ±6) and the
  SDF contour renders it.
- **Physics ignores it:** `controller/systems/player/integration.js`
  hard-codes landing/grounding to flat `controller.baseGroundY`
  (`GameController.js`: 400). The player floats/sinks up to ~10px
  relative to the drawn line, and there is no slope physics at all.
- Spawning, camera and intro text also key off `baseGroundY`.

So the first terrain task is not "design levels" — it's **unifying the
ground**: one `groundY(x)` that the SDF pass, physics integration, enemy
spawning and camera all read. That is small, high-risk-adjacent (touches
the SDF pipeline's inputs, not its approach), and prerequisite to
everything below.

### Layer A — now: heightfield testbed (not levels)
- Replace `baseGroundY` constants with `groundY(x)` backed by a
  **control-point heightfield** (a list of `[x, y]` points, smoothly
  interpolated). Flat by default; dev/tuner can load a test course.
- Slope physics: project velocity onto the slope, add gravity's
  along-slope component, slope-aware slide friction. Cap slope angle so
  the marching-squares extraction stays clean — steep ramps fine,
  vertical cliffs **not** in Layer A.
- Test course features, in order: flat → gentle up/down slope → ramp
  (launch check) → cliff *edge* as a steep-but-finite drop (fall check,
  no wall collision yet). No gaps/pits yet — a pit needs fall-out rules
  and respawn, which is level design, not movement testing.
- Success criterion: yeeting down a slope, launching off the ramp, and
  air-attacking mid-flight all feel like the flat-line versions, only
  better. If they don't, the flat-line feel was an artefact.

### Layer B — later: authored levels
Handcrafted slopes/ramps/cliffs, overhangs, platforms, walls and pits.
This needs collision beyond "land on `groundY(x)`" (side/ceiling
collision, ledge grabbing or its deliberate absence, pit respawn) and
level authoring format/tooling. That is real level design and belongs
*after* feel-lock, with enemies. Do not build a level editor now — the
heightfield control points *are* the editor, for as long as levels are
just a line.

**Rule of thumb:** if it changes how the player *moves*, it belongs in
the testbed now. If it changes *where the player is allowed to go*, it
belongs in authored levels later.

---

*Next step on your word: Layer A terrain unification, or feel-lock tuning
on the flat line first. Either way, play it first — this document
extrapolates your intent, but only your hands can confirm it.*
