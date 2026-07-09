// Tiny, dependency-free color math. All conversions are round-trip stable:
// hex -> rgb -> hex and rgb -> hsl -> rgb (with rounding) reproduce the input.

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Clamp + round an RGB triple into valid 0-255 integers. */
export function normalizeRgb({ r, g, b }: RGB): RGB {
  return {
    r: clamp(Math.round(r), 0, 255),
    g: clamp(Math.round(g), 0, 255),
    b: clamp(Math.round(b), 0, 255),
  };
}

/** Convert an RGB triple to an uppercase `#RRGGBB` hex string. */
export function rgbToHex(rgb: RGB): string {
  const { r, g, b } = normalizeRgb(rgb);
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/**
 * Parse a hex color into RGB. Accepts `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
 * with or without the leading `#`. Alpha is ignored. Returns null if invalid.
 */
export function hexToRgb(input: string): RGB | null {
  let hex = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex) || /^[0-9a-fA-F]{4}$/.test(hex)) {
    hex = hex
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  } else if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)) {
    hex = hex.slice(0, 6);
  } else {
    return null;
  }
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Convert RGB (0-255) to HSL (h:0-360, s/l:0-100). */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Convert HSL (h:0-360, s/l:0-100) to RGB (0-255). */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hn < 60) [r, g, b] = [c, x, 0];
  else if (hn < 120) [r, g, b] = [x, c, 0];
  else if (hn < 180) [r, g, b] = [0, c, x];
  else if (hn < 240) [r, g, b] = [0, x, c];
  else if (hn < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return normalizeRgb({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}

export const hexToHsl = (hex: string): HSL | null => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
};

export const hslToHex = (hsl: HSL): string => rgbToHex(hslToRgb(hsl));

/** Format helpers for display / copy. */
export const rgbToString = ({ r, g, b }: RGB): string => `rgb(${r}, ${g}, ${b})`;
export const hslToString = ({ h, s, l }: HSL): string => `hsl(${h}, ${s}%, ${l}%)`;

/** Pick readable text color (black/white) for a given background. */
export function contrastText({ r, g, b }: RGB): string {
  // Perceived luminance (ITU-R BT.601).
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff';
}
