export const MAJOR_PENTATONIC = [53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91, 93, 96, 98];
export const MINOR_PENTATONIC = [53, 56, 58, 60, 63, 65, 68, 70, 72, 75, 77, 80, 82, 84, 87, 89, 92, 94, 96, 99];

export const MOTIFS = {
  'hop': [0, 3, 4, 3],
  'skip': [0, 4, 0, 1],
  'arc': [0, 1, 0, 4],
  'walk': [0, 1, 2, 3, 4, 3, 2, 1],
  'drop': [3, 2, 1, 0]
};

export const DRUM_PATTERNS = {
  // Consistent 4-on-the-floor kick for steady pulse
  kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
  // Simple backbeat snare
  snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  // Progressive hi-hat complexity
  hat: [
    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],  // Sparse
    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],  // Standard
    [1,1,1,0, 1,1,1,1, 1,0,1,1, 1,1,1,1]   // Intense
  ]
};

export const SONG_PROGRESSION = [0, 0, 1, 1, 2, 2, 1, 0];