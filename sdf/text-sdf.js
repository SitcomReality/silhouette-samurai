import TinySDF from 'tiny-sdf';

export class TextSDFManager {
  constructor() {
    this.sdfEngine = new TinySDF({
      fontSize: 200,
      fontFamily: 'sans-serif',
      fontWeight: '900',
      buffer: 24,
      radius: 32,
      cutoff: 0.25
    });
    this.cache = new Map();
  }

  getTextLayout(text, x, y, scale = 1.0) {
    const glyphKey = text;
    let glyphData;
    
    if (this.cache.has(glyphKey)) {
      glyphData = this.cache.get(glyphKey);
    } else {
      let currentX = 0;
      const glyphs = [];
      for (const char of text) {
        const glyph = this.sdfEngine.draw(char);
        glyphs.push({
          char,
          data: glyph.data,
          width: glyph.width,
          height: glyph.height,
          offsetX: currentX,
          offsetY: -glyph.glyphTop,
          advance: glyph.glyphAdvance,
          glyphWidth: glyph.glyphWidth,
          glyphHeight: glyph.glyphHeight
        });
        currentX += glyph.glyphAdvance;
      }
      glyphData = { glyphs, totalWidth: currentX };
      this.cache.set(glyphKey, glyphData);
    }

    return {
      text,
      glyphs: glyphData.glyphs,
      x: x - (glyphData.totalWidth * scale) / 2,
      y,
      scale,
      width: glyphData.totalWidth * scale,
      height: 200 * scale
    };
  }

  getDistance(layout, wx, wy) {
    // Transform world to local space
    const lx = (wx - layout.x) / layout.scale;
    const ly = (wy - layout.y) / layout.scale;

    let minD = 999;
    
    // Quick bounding box check for the whole string
    if (lx < -20 || lx > (layout.width / layout.scale) + 20 || ly < -100 || ly > 40) {
      return 999;
    }

    for (const g of layout.glyphs) {
      const gx = lx - g.offsetX;
      const gy = ly - g.offsetY;

      // Check if inside glyph buffer
      if (gx >= 0 && gx < g.width && gy >= 0 && gy < g.height) {
        const ix = Math.floor(gx);
        const iy = Math.floor(gy);
        const alpha = g.data[iy * g.width + ix];
        
        // Convert 0-255 alpha to distance
        // Values > 127 (cutoff 0.25) are "inside"
        const d = (0.25 - alpha / 255) * 18; // Using radius 18 from constructor
        minD = Math.min(minD, d * layout.scale);
      }
    }

    return minD;
  }
}

export const textSDFManager = new TextSDFManager();