# Movement & Combat Feel Design Document

## Current State Analysis

The game currently has a unified attack system with charge mechanics, directional air attacks, and rotation-based aerial combat. Movement is responsive with acceleration/friction physics, but there's a disconnect between the *intent* behind an action and the *satisfaction* of executing it.

The challenge: inputs feel "too responsive" in a way that lacks weight and commitment, yet animations don't quite sell the power fantasy of being a blade master.

## Core Design Pillars

### 1. Commitment & Consequence
Every meaningful action should have a slight wind-up that telegraphs intent, followed by explosive execution. This creates a rhythm where the player "loads" actions before releasing them.

**Ideas:**
- Micro-delays before movement direction changes (2-3 frames) that play a subtle dust kick animation
- Attack charges should have distinct visual/audio stages (light hum → resonant glow → crackling energy)
- Landing from air attacks should have a brief recovery pose that can be cancelled into movement, rewarding smooth transitions

### 2. Visual/Audio Juice
Impact is sold through layered feedback that reinforces the player's actions.

**Ideas:**
- Screen freeze frames on hit (already have hitstop, but could be tuned per attack charge level)
- Camera rotation tilt during air rotation attacks (slight roll in the direction of rotation)
- Dust/energy particles that trail meaningful movements (sprint starts, direction changes, jumps)
- Distinct sound layers: whoosh for movement, metallic ring for blade, bass thump for impact
- Character afterimages on fast movements (especially at high charge or during recovery cancels)

### 3. Flow State Through Cancels
The best action games create flow by allowing skilled players to cancel recovery frames into defensive options or movement.

**Ideas:**
- Jump cancels during late attack recovery (already partially implemented)
- Dash/slide cancels from grounded attacks if moving
- Air dodge that costs aerial power but allows repositioning without losing combo
- Block-cancel windows that reward precise timing with faster reset to neutral

### 4. Input Buffer Sophistication
Currently we have attack/jump buffers, but could go deeper.

**Ideas:**
- Directional attack buffering: hold a direction during an attack's startup, and it "remembers" that direction through the active frames
- Charge hold: allow players to hold attack after releasing to maintain charge state briefly (50-100ms) for precise timing
- Movement momentum preservation: quickly tapping movement twice in succession should trigger a short dash with preserved velocity
- Negative edge attacks: trigger attacks on button release rather than press for charge attacks (already doing this, but could enhance with visual feedback)

### 5. Contextual Movement Qualities
Different situations should *feel* different through movement properties.

**Ideas:**
- Ground movement has three modes: walk (half stick), jog (full stick held briefly), sprint (full stick held 0.3s+)
- Sprint should have slightly reduced friction and faster turning, creating a sense of momentum
- Air control should be directional: moving forward in the air feels tighter than reversing direction
- Crouching should reduce hitbox but also slightly increase crouch-walk speed for positioning
- Sliding from sprint should cover more distance and have lower friction than from jog

### 6. Attack Weight Distribution
Not all attacks at all charges should feel the same. Create distinct "archetypes" within the unified system.

**Ideas:**
- 0-30% charge: Quick flicks with short recovery, low damage, minimal movement
- 30-70% charge: Committed strikes with moderate windup, good damage, some movement
- 70-100% charge: Heavy slashes with long windup, high damage, significant movement/displacement
- Perfect charge (100%): Hold for 0.5s at full charge to trigger a "perfect release" with bonus effects (double hitstop, screen flash, etc.)

### 7. Micro-Animations That Sell Mastery
Small details that play during transitions sell the fantasy of fluid control.

**Ideas:**
- Sword flourish when landing from successful air combo (only if hit confirmed)
- Slight lean-in when starting to sprint from idle
- Head-turn anticipation when changing directions (head turns before body follows)
- Sheathing/drawing suggestions through sword positioning during idle → attack transitions
- Breathing rhythm in idle (slow expansion/contraction of chest/shoulders)

### 8. Rhythm & Tempo Systems
Create natural beats in combat that players can internalize.

**Ideas:**
- Attack recovery times aligned to musical beats (120 BPM = 0.5s per beat, attacks recover on beat boundaries)
- Combo decay timer pulses visually on beat, encouraging rhythmic play
- Charge stages snap to beat divisions (0.25s, 0.5s, 1.0s for stage transitions)
- Landing impacts trigger on-beat kicks in the music mix

### 9. Risk/Reward Movement Options
Give players high-risk, high-reward movement that *feels* incredible when executed correctly.

**Ideas:**
- Perfect dodge: tap block + direction during enemy attack startup for a long-distance repositioning dodge with brief invincibility
- Aerial wave-dash: double-tap jump at ground level to perform a low, fast horizontal dash (costs aerial power)
- Charge-step: release a charged attack while moving to convert charge energy into a explosive directional dash-attack
- Momentum hops: jump while sprinting to maintain horizontal velocity in the air (already partially implemented, but could be tuned)

### 10. Granular Polish Points

**Movement:**
- Add slight acceleration delay when changing directions (feels more grounded)
- Preserve more momentum when jumping from sprint (reward movement setup)
- Tighter air control when moving forward vs. backward (makes aerial positioning feel intentional)
- Reduce ground friction during attack recovery to allow slide-momentum (feels fluid)

**Attacking:**
- Variable hitstop based on charge level (more freeze on bigger hits)
- Attack trail VFX should persist longer on higher charges
- Sword should "hang" slightly at the end of swing arcs before recovering (weight)
- Hitbox should grow slightly with charge (not just damage, but area)

**Camera:**
- Subtle zoom-in during charge (returns to normal on release)
- Screen shake intensity tied to charge level, not just damage
- Camera leads player movement slightly when sprinting (feels faster)
- Vertical camera offset during aerial attacks (keeps action centered)

## Implementation Priority

1. **High Impact, Low Effort:**
   - Tune hitstop values per charge tier
   - Add attack trail persistence scaling
   - Implement charge stage visual/audio feedback
   - Add afterimages to high-movement actions

2. **Medium Impact, Medium Effort:**
   - Jump cancel windows tuning
   - Sprint state with momentum changes
   - Perfect charge system
   - Direction change micro-delays

3. **High Impact, High Effort:**
   - Aerial dodge system
   - Perfect dodge system
   - Rhythm alignment system
   - Contextual micro-animations

4. **Polish Pass:**
   - Camera effects (zoom, tilt, shake scaling)
   - Particle trail systems
   - Sound design layers
   - Breathing idle animations

## Testing Metrics

To know if we've hit the sweet spot:

- **Does it feel good to just move around?** Players should enjoy traversal itself
- **Do attacks feel powerful at all charge levels?** Each tier should be satisfying
- **Can skilled players maintain flow?** Cancels and buffers should enable continuous action
- **Is there clear feedback for every action?** No "dead" inputs or unclear responses
- **Does combat have rhythm?** Players should naturally find a tempo

## Closing Thoughts

The key is layering small improvements that compound into a cohesive feel. Start with high-impact, low-effort changes to establish the direction, then iterate based on feel. The goal isn't to implement everything at once, but to find the combination that creates that "lost limb" sensation - where controlling the character feels like a natural extension of the player's intent.

Remember: the best action games make players feel like gods, not through overpowered abilities, but through tight, responsive controls that reward skill and create moments of flow where everything just *clicks*.