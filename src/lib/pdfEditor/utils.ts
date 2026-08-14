export function uid(prefix = 'pdf'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
