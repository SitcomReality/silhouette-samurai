# Gameplay

Controls and combat systems for Silhouette Samurai.

## Controls

| Action | Keyboard | Gamepad (actual mapping) |
|---|---|---|
| Move | A/D or Arrow Left/Right | Left stick / D-pad |
| Jump | W / Space / Arrow Up | Left stick up / D-pad up |
| Crouch / slide | S / Arrow Down | Left stick down / D-pad down |
| Attack (hold to charge) | J / 1 | A or Y |
| Block | K / 2 | B or X |
| Directional attack | Attack + movement direction | Attack + left stick |

On-screen Attack/Block buttons are provided for touch/mouse players.

## Combat system

### Unified attack (charge-based)
- Hold attack button to charge (0–1.2 seconds)
- Damage scales 1.0x–2.5x with charge
- Knockback scales 1.0x–2.0x with charge
- Direction based on movement input (8-direction)
- Air attacks allow full 360-degree aiming with body rotation
- Procedural arc swoosh visual follows the swing arc

### Finisher attacks
- Triggered from block when combo >= 5
- Three directional variants: neutral (forward), up, down
- Higher damage (28–30), longer startup (16f startup, 6f active)
- Distinct animation poses per direction

### Parry system
- Perfect block window: first 6 frames of blocking
- On parry: attacker is staggered, defender gets counter bonus (+50% damage)
- Visual parry flash + screen shake + hitstop

### Clash system
- When two attacks make contact during active frames
- Both parties are pushed back and reset to idle
- Visual clash spark + screen shake + hitstop

### Combo system
- Combo counter increments on each hit
- Decays after 1.4 seconds of no hits
- At 5+ combo: block transitions into finisher attacks
- Score multiplier scales with combo (100 * (1 + combo * 0.1))
- Music intensity scales with combo

### Hitstop and screen shake
- Hitstop freezes all game logic for N frames on hit
- Screen shake applies random offset to all canvases
- Both are applied additively from various sources (parries, clashes, sweetspots, heavy hits)

## Game state

The player entity is built by `controller/state/PlayerFactory.js` and has ~40 state fields covering:

- Position, velocity, facing, grounded state
- Health (100), max health
- State machine: idle/run/attack/block/hit/stagger/trip/dead
- Attack system: type, frame data, frame time, charge, angle, aim
- Resource meters: slidePower (100), aerialPower (100)
- Buffers: jumpBuffer, attackBuffer, blockBuffer
- Parry/counter state flags
- Combo counter and timers

## Tuning

The in-game **Combat Tuner** (bottom-left "Open Combat Tuner" button) exposes attack frame data, physics constants, and audio settings as sliders. "Export to Clipboard" produces JSON of the changed values, which can then be applied to `combat/frame-data.js`, `combat/config/physics.js`, and `audio/music/Config.js`.
