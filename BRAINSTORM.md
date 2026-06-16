# 🎭 Silhouette Ballet: Enemy & Combat Brainstorming
**Goal:** Elevate the "Ballet Ninja Anime Superhero" fantasy through SDF mechanics, procedural animation, and rhythmic combat.

---

## 1. 🧬 Enemy Archetypes (The Ensemble)

### **The Gossamer Duelist (Standard Melee)**
*   **Behavior:** Uses "Slide" physics to skate across the SDF ground. They don't just walk; they pirouette into range.
*   **Attack:** A three-hit flurry that creates a triple-swoosh effect. 
*   **SDF Interaction:** When killed, their "body" dissolves into a lingering pool of viscous SDF fluid that slows the player but can be used as a temporary platform.

### **The Echo Archer (Ranged/Precision)**
*   **Behavior:** Stays on higher terrain or text-layouts. Shoots "SDF Bolts" (capsule-shaped particles).
*   **Mechanic:** The bolts can be **sliced in half** mid-air using a timed Unified Attack, splitting the projectile into two smaller debris pieces that can hit other enemies.
*   **Anime Flair:** When the player parries a bolt, it reflects back as a high-speed "Streak" effect.

### **The Resonant Goliath (Heavy/Boss)**
*   **Behavior:** Moves slowly, but every step is a `onShockwave` call that creates a massive hump in the ground SDF via `getGroundY`.
*   **Attack:** A "Slam" that ripples the terrain, forcing the player to jump or "Slide" through the wave to avoid being tripped.
*   **SDF Interaction:** The boss's armor is made of smaller SDF circles that "break off" (become debris) as health depletes, revealing a glowing core.

---

## 2. ⚔️ Advanced Combat Mechanics

### **The "Flow State" (Beat-Synced Combat)**
*   **Idea:** Incentivize attacking on the `BeatClock`. 
*   **Mechanic:** Releasing a Unified Attack exactly on a 1/4 note beat doubles the `damageScale` and creates a larger `arc_swoosh`.
*   **Visual:** The player's glow pulses white on the beat, and successful "On-Beat" hits trigger a unique high-pitch `playBell` sound.

### **SDF Grapple / Lunge**
*   **Idea:** Use the sword as a tether.
*   **Mechanic:** If a Unified Attack is released while pointing at a distant enemy, the player "zips" to them, leaving a long-lasting `streak` effect.
*   **Anime Flair:** Time slows down (`hitstop`) for 0.1s during the zip for a "teleport" feel.

### **Contour Manipulation**
*   **Idea:** The player can "sculpt" the world.
*   **Mechanic:** A Down-Finisher on the ground creates a permanent (or long-lasting) "SDF Peak" that the player can use for high-ground advantage.
*   **Implementation:** Add a `StaticObstacle` to the `controller.entities` list at the point of impact.

---

## 3. 🎬 Cinematic Visual Effects

*   **Impact Frames:** On a Boss-killing hit, invert the background/foreground colors for 2 frames using the `UI-Pass`.
*   **Blade Trails:** Change the `arc_swoosh` color based on the current `comboLevel`. (e.g., Combo 1-10: Theme Color; Combo 50+: Pure White with Rainbow Glow).
*   **Environmental Destruction:** Allow the "Unified Attack" to slice through `introTexts` (text-layouts), causing the letters to physically fall over as debris.

---

## 4. 🎹 Rhythmic Integration

*   **Adaptive Tempo:** As the `maxCombo` increases, slightly increase the `bpm` of the `BeatClock` (from 120 up to 140) to make the combat feel increasingly frantic and "superheroic."
*   **Kill-Squelch:** On a killing blow, trigger a brief low-pass filter sweep in the `MusicManager` to emphasize the "silence" of the cut before the music explodes back in.