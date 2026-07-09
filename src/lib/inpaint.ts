// Dependency-free, client-side inpainting used by the manual watermark remover.
// Both fills operate in place on an ImageData, replacing the RGB of every pixel
// flagged in `mask` (1 = fill this pixel) using only the surrounding image
// content. Work is restricted to the mask's bounding box for speed.

interface BBox { minx: number; miny: number; maxx: number; maxy: number; }

function maskBBox(mask: Uint8Array, W: number, H: number): BBox | null {
  let minx = W, miny = H, maxx = -1, maxy = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (mask[y * W + x]) {
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
    }
  }
  if (maxx < 0) return null;
  // Pad by 1px (clamped) so masked pixels always have in-region neighbours.
  return {
    minx: Math.max(0, minx - 1),
    miny: Math.max(0, miny - 1),
    maxx: Math.min(W - 1, maxx + 1),
    maxy: Math.min(H - 1, maxy + 1),
  };
}

/**
 * Content-aware fill via iterative diffusion (a discrete Laplace solve).
 * Masked pixels are relaxed toward the average of their neighbours using
 * Gauss–Seidel iterations, with unmasked pixels acting as fixed boundaries.
 * Produces smooth, seam-free fills — ideal for flat / gradient backgrounds.
 */
export function contentAwareFill(img: ImageData, mask: Uint8Array): void {
  const { width: W, height: H, data } = img;
  const box = maskBBox(mask, W, H);
  if (!box) return;

  const bw = box.maxx - box.minx + 1;
  const bh = box.maxy - box.miny + 1;
  const N = bw * bh;

  const r = new Float32Array(N);
  const g = new Float32Array(N);
  const b = new Float32Array(N);
  const mk = new Uint8Array(N);

  let sr = 0, sg = 0, sb = 0, known = 0;
  for (let j = 0; j < bh; j++) {
    for (let i = 0; i < bw; i++) {
      const gi = (box.miny + j) * W + (box.minx + i);
      const di = gi * 4;
      const li = j * bw + i;
      r[li] = data[di]; g[li] = data[di + 1]; b[li] = data[di + 2];
      if (mask[gi]) {
        mk[li] = 1;
      } else {
        sr += r[li]; sg += g[li]; sb += b[li]; known++;
      }
    }
  }
  if (known === 0) return; // nothing to sample from

  // Seed masked pixels with the region mean so iterations converge faster.
  const mr = sr / known, mg = sg / known, mb = sb / known;
  for (let li = 0; li < N; li++) {
    if (mk[li]) { r[li] = mr; g[li] = mg; b[li] = mb; }
  }

  const iters = Math.min(1500, Math.max(80, Math.round(Math.max(bw, bh) * 1.5)));
  for (let it = 0; it < iters; it++) {
    let maxDelta = 0;
    for (let j = 0; j < bh; j++) {
      for (let i = 0; i < bw; i++) {
        const li = j * bw + i;
        if (!mk[li]) continue;
        let n = 0, ar = 0, ag = 0, ab = 0;
        if (i > 0) { const k = li - 1; ar += r[k]; ag += g[k]; ab += b[k]; n++; }
        if (i < bw - 1) { const k = li + 1; ar += r[k]; ag += g[k]; ab += b[k]; n++; }
        if (j > 0) { const k = li - bw; ar += r[k]; ag += g[k]; ab += b[k]; n++; }
        if (j < bh - 1) { const k = li + bw; ar += r[k]; ag += g[k]; ab += b[k]; n++; }
        if (n === 0) continue;
        const nr = ar / n, ng = ag / n, nb = ab / n;
        const d = Math.abs(nr - r[li]);
        if (d > maxDelta) maxDelta = d;
        r[li] = nr; g[li] = ng; b[li] = nb; // in-place (Gauss–Seidel)
      }
    }
    if (maxDelta < 0.4) break;
  }

  for (let j = 0; j < bh; j++) {
    for (let i = 0; i < bw; i++) {
      const li = j * bw + i;
      if (!mk[li]) continue;
      const gi = (box.miny + j) * W + (box.minx + i);
      const di = gi * 4;
      data[di] = Math.round(r[li]);
      data[di + 1] = Math.round(g[li]);
      data[di + 2] = Math.round(b[li]);
      data[di + 3] = 255;
    }
  }
}

function median(vals: number[]): number {
  vals.sort((a, b) => a - b);
  const m = vals.length >> 1;
  return vals.length % 2 ? vals[m] : (vals[m - 1] + vals[m]) / 2;
}

/**
 * Median-of-neighbourhood fill: propagates known pixels inward, setting each
 * masked pixel to the median of its already-known 8-neighbours, layer by layer.
 * Preserves edges/texture better than diffusion on busy backgrounds.
 */
export function medianFill(img: ImageData, mask: Uint8Array): void {
  const { width: W, height: H, data } = img;
  const box = maskBBox(mask, W, H);
  if (!box) return;

  // known: 1 = pixel has a usable colour (original or already filled).
  const known = new Uint8Array(W * H);
  let remaining = 0;
  for (let y = box.miny; y <= box.maxy; y++) {
    for (let x = box.minx; x <= box.maxx; x++) {
      const gi = y * W + x;
      if (mask[gi]) remaining++;
      else known[gi] = 1;
    }
  }
  // Anything outside the bbox counts as known (boundary source).
  const inBox = (x: number, y: number) => x >= box.minx && x <= box.maxx && y >= box.miny && y <= box.maxy;

  const NEI = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1];
  let guard = W + H + 4; // safety cap on propagation layers
  while (remaining > 0 && guard-- > 0) {
    const toFill: number[] = [];
    for (let y = box.miny; y <= box.maxy; y++) {
      for (let x = box.minx; x <= box.maxx; x++) {
        const gi = y * W + x;
        if (known[gi]) continue;
        let hasKnown = false;
        for (let k = 0; k < NEI.length; k += 2) {
          const nx = x + NEI[k], ny = y + NEI[k + 1];
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const ni = ny * W + nx;
          if (known[ni] || !inBox(nx, ny)) { hasKnown = true; break; }
        }
        if (hasKnown) toFill.push(gi);
      }
    }
    if (toFill.length === 0) break;
    for (const gi of toFill) {
      const x = gi % W, y = (gi / W) | 0;
      const rs: number[] = [], gs: number[] = [], bs: number[] = [];
      for (let k = 0; k < NEI.length; k += 2) {
        const nx = x + NEI[k], ny = y + NEI[k + 1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = ny * W + nx;
        if (known[ni] || !inBox(nx, ny)) {
          const di = ni * 4;
          rs.push(data[di]); gs.push(data[di + 1]); bs.push(data[di + 2]);
        }
      }
      if (rs.length === 0) continue;
      const di = gi * 4;
      data[di] = Math.round(median(rs));
      data[di + 1] = Math.round(median(gs));
      data[di + 2] = Math.round(median(bs));
      data[di + 3] = 255;
    }
    for (const gi of toFill) { known[gi] = 1; remaining--; }
  }

  // Light averaging pass to soften propagation seams.
  const snapshot = new Uint8ClampedArray(data);
  for (let y = box.miny; y <= box.maxy; y++) {
    for (let x = box.minx; x <= box.maxx; x++) {
      const gi = y * W + x;
      if (!mask[gi]) continue;
      let n = 0, ar = 0, ag = 0, ab = 0;
      for (let k = 0; k < NEI.length; k += 2) {
        const nx = x + NEI[k], ny = y + NEI[k + 1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const di = (ny * W + nx) * 4;
        ar += snapshot[di]; ag += snapshot[di + 1]; ab += snapshot[di + 2]; n++;
      }
      if (n === 0) continue;
      const di = gi * 4;
      data[di] = Math.round((snapshot[di] + ar / n) / 2);
      data[di + 1] = Math.round((snapshot[di + 1] + ag / n) / 2);
      data[di + 2] = Math.round((snapshot[di + 2] + ab / n) / 2);
    }
  }
}
