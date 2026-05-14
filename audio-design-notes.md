# Audio Design Strategy: Silhouette Ballet

The "Silhouette Ballet" aesthetic—high-contrast, fluid, and brutal—demands a soundscape that mirrors its "Upper-Envelope" visual logic. Since the world is a single fused contour, the audio should feel like a single cohesive texture that pulses with the game's rhythm.

## 1. Musical Structure: Layered Intensity
Instead of a simple looping track, we should use **Vertical Layering (Stems)**.
- **Base Layer (Ambient):** A low-thumping industrial synth pad that plays constantly.
- **Action Layer (Drums/Lead):** High-energy percussion and "shredding" leads that fade in as the `combo` meter rises.
- **Ballet State:** If the combo exceeds 10x, introduce a melodic, "operatic" or high-pitched synth layer to represent the "Ballet" aspect of the brutality.

## 2. Contextual Battle Music
Since the game is a continuous battle, the music shouldn't "stop and start." Instead, use the **SDF proximity** or **Enemy Count** to drive the low-pass filter (LPF) and volume of the action layers. 
- No enemies nearby? The music is muffled (LPF at 500Hz).
- Enemy in reach? The filter opens up, revealing the high-end transients.

## 3. Rhythmic SFX Synchronization (The "Ideal" Feel)
To prevent SFX from feeling like "noise" over the music, we can implement **Action Quantization**:
- **The BPM Clock:** Maintain a global `BeatClock` based on the music's BPM (e.g., 120 BPM).
- **Sub-tick Snapping:** When a player triggers a "Slam" or "Roundhouse," we don't play the sound *instantly*. We delay it by a tiny margin (0–50ms) to snap it to the nearest 16th note of the music. This makes every hit feel like a drum fill.
- **Pitch-Shifting:** Tie the pitch of "Hit" sounds to the current combo. Each hit in a combo increases the pitch by a semitone, resetting when the combo breaks.

## 4. SDF-Specific Sound Textures
- **The "Fusion" Hum:** As entities merge into the ground (SDF blending), we can play a low-frequency "molecular" hum or a liquid-squelch sound that is volume-mapped to the `globalBlendK` value.
- **Shockwave Audio:** The shockwaves should use a "Whoosh" with a Doppler effect, panned based on their `x` position relative to the `cameraX`.

## 5. Implementation in WebAudio API
- Use a `DynamicsCompressorNode` on the main output to "duck" the music slightly whenever a "Slam" SFX plays (Side-chaining).
- Use `AudioWorklet` for precise rhythmic timing if we decide to go full "rhythm-game" with the mechanics.