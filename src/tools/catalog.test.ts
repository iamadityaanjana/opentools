import { describe, it, expect } from 'vitest';
import {
  TOOLS,
  TOOL_BY_ID,
  CATEGORIES,
  CATEGORY_BY_ID,
  GROUP_HOME,
  GROUP_LABEL,
  LIVE_COUNT,
  TOTAL_COUNT,
  type ToolGroup,
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

  // Derived from GROUP_HOME rather than hardcoded: it is a Record<ToolGroup, string>,
  // so adding a group to the union forces it to appear here too.
  it('uses valid groups for every category', () => {
    const groups = Object.keys(GROUP_HOME);
    for (const c of CATEGORIES) expect(groups).toContain(c.group);
  });

  it('gives every group a home route and a label', () => {
    for (const group of Object.keys(GROUP_HOME) as ToolGroup[]) {
      expect(GROUP_HOME[group], `${group} should have a home route`).toMatch(/^\//);
      expect(GROUP_LABEL[group], `${group} should have a label`).toBeTruthy();
    }
  });

  it('backs every group with at least one category', () => {
    for (const group of Object.keys(GROUP_HOME) as ToolGroup[]) {
      expect(
        CATEGORIES.some((c) => c.group === group),
        `${group} should have at least one category`,
      ).toBe(true);
    }
  });
});
