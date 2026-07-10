import { describe, it, expect } from 'vitest';
import {
  TOOLS,
  TOOL_BY_ID,
  CATEGORIES,
  CATEGORY_BY_ID,
  LIVE_COUNT,
  TOTAL_COUNT,
} from './catalog';

describe('tool catalog integrity', () => {
  it('has at least one tool and one category', () => {
    expect(TOOLS.length).toBeGreaterThan(0);
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it('has unique tool ids', () => {
    const ids = TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every tool a slug-formatted id', () => {
    for (const t of TOOLS) expect(t.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('points every tool at a known category', () => {
    for (const t of TOOLS) expect(CATEGORY_BY_ID.has(t.categoryId)).toBe(true);
  });

  it('indexes every tool by id', () => {
    for (const t of TOOLS) expect(TOOL_BY_ID.get(t.id)).toBe(t);
  });

  it('gives every live tool a route and keeps routes off soon tools', () => {
    for (const t of TOOLS) {
      if (t.status === 'live') expect(t.route, `${t.id} should have a route`).toBeTruthy();
      else expect(t.route, `${t.id} should not have a route`).toBeUndefined();
    }
  });

  it('keeps LIVE_COUNT and TOTAL_COUNT consistent with the catalog', () => {
    expect(TOTAL_COUNT).toBe(TOOLS.length);
    expect(LIVE_COUNT).toBe(TOOLS.filter((t) => t.status === 'live').length);
    expect(LIVE_COUNT).toBeLessThanOrEqual(TOTAL_COUNT);
  });

  it('uses valid groups for every category', () => {
    for (const c of CATEGORIES) expect(['image', 'pdf']).toContain(c.group);
  });
});
