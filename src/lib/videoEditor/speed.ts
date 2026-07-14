/** Speed easing presets — maps to CSS cubic-bezier control points. */
export type SpeedEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'smooth';

export const EASING_PRESETS: Record<SpeedEasing, { label: string; bezier: [number, number, number, number] }> = {
  linear: { label: 'Linear', bezier: [0, 0, 1, 1] },
  'ease-in': { label: 'Ease in', bezier: [0.42, 0, 1, 1] },
  'ease-out': { label: 'Ease out', bezier: [0, 0, 0.58, 1] },
  'ease-in-out': { label: 'Ease in-out', bezier: [0.42, 0, 0.58, 1] },
  smooth: { label: 'Smooth', bezier: [0.4, 0, 0.2, 1] },
};

/** Cubic-bezier easing — t in [0,1]. */
export function cubicBezier(t: number, [x1, y1, x2, y2]: [number, number, number, number]): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const cx = 3 * x1 * (1 - u) ** 2 * u + 3 * x2 * (1 - u) * u ** 2 + u ** 3;
    const dx = 3 * x1 * (1 - u) ** 2 - 6 * x1 * (1 - u) * u + 3 * x2 * 2 * (1 - u) * u - 3 * x2 * u ** 2 + 3 * u ** 2;
    if (Math.abs(dx) < 1e-6) break;
    u -= (cx - t) / dx;
    u = Math.max(0, Math.min(1, u));
  }
  return 3 * y1 * (1 - u) ** 2 * u + 3 * y2 * (1 - u) * u ** 2 + u ** 3;
}

/** Interpolated playback speed at normalized position u ∈ [0,1] within a clip. */
export function speedAt(
  u: number,
  speedStart: number,
  speedEnd: number,
  easing: SpeedEasing,
): number {
  const e = cubicBezier(Math.max(0, Math.min(1, u)), EASING_PRESETS[easing].bezier);
  return speedStart + (speedEnd - speedStart) * e;
}

/** Sample speed curve for SVG path (y = speed multiplier). */
export function speedCurvePath(
  speedStart: number,
  speedEnd: number,
  easing: SpeedEasing,
  w = 120,
  h = 48,
): string {
  const pts: string[] = [];
  const minS = Math.min(speedStart, speedEnd, 0.25);
  const maxS = Math.max(speedStart, speedEnd, 2);
  const range = maxS - minS || 1;
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const s = speedAt(u, speedStart, speedEnd, easing);
    const x = u * w;
    const y = h - ((s - minS) / range) * (h - 4) - 2;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Map timeline position within a clip to source media time. */
export function sourceTimeAt(
  clip: { start: number; duration: number; trimIn: number; trimOut: number; speedStart: number; speedEnd: number; easing: SpeedEasing },
  timelineTime: number,
): number {
  if (timelineTime <= clip.start) return clip.trimIn;
  if (timelineTime >= clip.start + clip.duration) return clip.trimOut;
  const u = (timelineTime - clip.start) / clip.duration;
  const srcLen = clip.trimOut - clip.trimIn;
  return clip.trimIn + integratedProgress(u, clip.speedStart, clip.speedEnd, clip.easing) * srcLen;
}

function integratedProgress(u: number, speedStart: number, speedEnd: number, easing: SpeedEasing): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const steps = 32;
  let partial = 0;
  for (let i = 0; i < Math.floor(steps * u); i++) {
    partial += speedAt((i + 0.5) / steps, speedStart, speedEnd, easing);
  }
  const rem = steps * u - Math.floor(steps * u);
  if (rem > 0) partial += speedAt((Math.floor(steps * u) + rem / 2) / steps, speedStart, speedEnd, easing) * rem;
  let total = 0;
  for (let i = 0; i < steps; i++) {
    total += speedAt((i + 0.5) / steps, speedStart, speedEnd, easing);
  }
  return partial / total;
}

/** Average speed factor for export (output duration vs source duration). */
export function avgSpeedFactor(speedStart: number, speedEnd: number, easing: SpeedEasing): number {
  let sum = 0;
  const n = 16;
  for (let i = 0; i < n; i++) {
    sum += speedAt((i + 0.5) / n, speedStart, speedEnd, easing);
  }
  return sum / n;
}
