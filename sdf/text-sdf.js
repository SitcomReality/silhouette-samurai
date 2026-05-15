import TinySDF from 'tiny-sdf';

export class TextSDFManager {
  constructor() {
    this.sdfEngine = new TinySDF({
      fontSize: 120,
      fontFamily: 'sans-serif',
      fontWeight: '900',
      buffer: 20,
      radius: 24,
      cutoff: 0.25
    });
    this.cache = new Map();
  }

  getTextLayout(text, x, y, scale = 1.0) {
    const key = `${text}_${scale}`;
    if (this.cache.has(key)) return this.cache.get(key);

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

    const totalWidth = currentX;
    const layout = {
      text,
      glyphs,
      x: x - (totalWidth * scale) / 2,
      y,
      scale,
      width: totalWidth * scale,
      height: 120 * scale // approximate
    };
    this.cache.set(key, layout);
    return layout;
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
        // In TinySDF, values > 127 are inside (if cutoff is 0.5, but here we use 0.25)
        // Distance = (alpha/255 - cutoff) * radius
        const d = (0.25 - alpha / 255) * 12; // 12 is radius
        minD = Math.min(minD, d * layout.scale);
      }
    }

    return minD;
  }
}

export const textSDFManager = new TextSDFManager();