import { describe, it, expect } from 'vitest';
import {
  normalizeRgb,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  contrastText,
} from './color';

describe('normalizeRgb', () => {
  it('clamps and rounds channels into 0-255 integers', () => {
    expect(normalizeRgb({ r: -10, g: 300, b: 127.6 })).toEqual({ r: 0, g: 255, b: 128 });
  });
});

describe('rgbToHex / hexToRgb', () => {
  it('produces an uppercase 6-digit hex string', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 128 })).toBe('#FF0080');
  });

  it('round-trips hex -> rgb -> hex', () => {
    for (const hex of ['#000000', '#FFFFFF', '#123456', '#ABCDEF']) {
      const rgb = hexToRgb(hex)!;
      expect(rgbToHex(rgb)).toBe(hex);
    }
  });

  it('expands shorthand hex and ignores alpha', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#ff000080')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('returns null for invalid input', () => {
    expect(hexToRgb('nope')).toBeNull();
    expect(hexToRgb('#12')).toBeNull();
    expect(hexToRgb('#1234567')).toBeNull();
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('maps primary colors correctly', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('round-trips rgb -> hsl -> rgb within a rounding tolerance', () => {
    const samples = [
      { r: 12, g: 200, b: 90 },
      { r: 250, g: 40, b: 180 },
      { r: 33, g: 33, b: 33 },
    ];
    for (const rgb of samples) {
      const back = hslToRgb(rgbToHsl(rgb));
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
    }
  });

  it('hexToHsl returns null for invalid hex', () => {
    expect(hexToHsl('zzz')).toBeNull();
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#FF0000');
  });
});

describe('contrastText', () => {
  it('picks dark text on light backgrounds and vice versa', () => {
    expect(contrastText({ r: 255, g: 255, b: 255 })).toBe('#1a1a1a');
    expect(contrastText({ r: 0, g: 0, b: 0 })).toBe('#ffffff');
  });
});
