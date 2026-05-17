# The Silhouette Ballet: Procedural Symphony Engine

This document outlines the architecture and current musical configuration of the procedural audio system in **Silhouette Ballet**. It is designed for composers and sound designers to understand how the game synthesizes its soundtrack in real-time using the Web Audio API.

---

## 1. Musical Foundation
The engine operates on a deterministic grid synchronized by a `BeatClock`.

*   **Tempo:** 128 BPM (default).
*   **Scale:** **F-Minor Pentatonic**. (Notes: F, Ab, Bb, C, Eb). 
*   **Rhythmic Grid:** 16-step patterns (1 bar per pattern).
*   **Structure:** 4-bar phrases. The engine cycles through a `songProgression` array (e.g., `[0, 0, 1, 1, 2, 2, 1, 0]`) which selects from three pattern banks:
    *   `0`: Ambient/Indie Verse (Minimalist, low energy).
    *   `1`: Melodic Chorus (Harmonic, mid energy).
    *   `2`: Climax/Bridge (Aggressive, high energy).

---

## 2. The Instrument Rack
Everything is synthesized in real-time via `audio/MusicManager.js`. No pre-recorded loops are used.

### Percussion (Action Layer)
*   **Kick:** Pitch-swept sine wave (150Hz to 40Hz) with exponential gain decay.
*   **Snare:** High-pass filtered white noise combined with a 200Hz triangle oscillator "thump".
*   **Hi-Hat:** High-frequency white noise burst (5kHz+).

### Synthesizers
*   **Bass:** Filtered Sawtooth/Sine hybrid. Deep, pulsing sub-tones.
*   **Strings:** Triangle waves with long attack/release (0.15s attack) to simulate a "bowed" indie-synth feel.
*   **Melody:** Clean Sine/Triangle oscillators with slight pitch-glide (Portamento) between notes.
*   **Arp:** Bright Square waves with a "glitch" logic that occasionally jumps octaves.

---

## 3. Procedural Logic & Dynamics
The music is a living entity that reacts to the player's performance.

### The Mix Layers
1.  **Base:** Always active. Contains the Strings, Melody, and Bass.
2.  **Action:** Driven by the **Combo Multiplier**. As your combo rises, the Kick, Snare, Hats, and Arps fade in.
3.  **Ballet:** Triggered at high combos (8x+). Introduces high-pitched harmonic sparkles.

### Environmental Filtering
*   **The "Proximity Muffle":** When no enemies are nearby, a Global Lowpass Filter drops to 600Hz, creating a submerged, peaceful atmosphere.
*   **The "Battle Reveal":** As enemies approach or engage, the filter opens up to 20kHz, bringing the full brightness of the synth rack into play.

---

## 4. How to Tune the Symphony
To create a "Beautiful, Catchy Composition," one can modify the following in `audio/MusicManager.js`:

*   **Patterns:** Edit the 16-step arrays in `this.patterns`. `0` represents a rest, and a MIDI number (e.g., `29`) represents a note.
*   **Progression:** Change `this.songProgression` to alter the "narrative" of the loop.
*   **Harmonics:** Update the `pentatonic` array in `SFXManager.js` to change how "impact hits" harmonize with the background music.
*   **Synthesis:** Adjust `osc.type` (sine, square, sawtooth, triangle) and filter envelopes to change the "texture" of the world.

---

## 5. Vision
We are aiming for a soundscape that sits between the melancholic minimalism of **Clint Mansell** and the glitchy, structured chaos of **Aphex Twin**. The music should feel like a reward for movement—the more you dance (attack and combo), the more the world sings back to you.