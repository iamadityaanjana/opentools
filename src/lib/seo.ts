export const SITE_URL = 'https://www.opentools.fun';
export const BRAND = 'opentools';

export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'opentools browser-based image, PDF and video tools',
};

export const DEFAULT_TWITTER_IMAGE = '/opengraph-image';

/**
 * Generate an SEO-optimised <title> for a tool page.
 *
 * Pattern competitors follow: front-load the primary action keyword, add
 * "Free Online" signal, a short privacy differentiator, then the brand.
 * All within 60 characters to avoid SERP truncation.
 *
 * Manual overrides take priority. The fallback builds from the tool name.
 */
export function toolTitle(toolName: string, override?: string): string {
  if (override) return override;
  // Strip any existing "Free" suffix the tool name might already have
  const base = toolName.replace(/\s+for\s+free$/i, '').trim();
  const candidate = `${base} Free Online – No Upload | ${BRAND}`;
  if (candidate.length <= 60) return candidate;
  // Tighten: drop the privacy clause
  const shorter = `${base} Free Online | ${BRAND}`;
  if (shorter.length <= 60) return shorter;
  // Last resort: just brand suffix
  return `${base} | ${BRAND}`;
}

const MAX_DESCRIPTION = 160;

/** Trim to a length limit on a word boundary, without leaving dangling punctuation. */
function trimToLength(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\u2014-]+$/, '')}…`;
}

/**
 * Generate an SEO-optimised meta description (target 140–160 chars).
 *
 * The tool blurb always leads, because it's the only per-tool copy that is
 * guaranteed unique — falling back to a shared template would give dozens of
 * pages identical meta descriptions. Differentiator clauses are appended one at
 * a time only until the description is long enough to be useful in the SERP.
 */
export function toolDescription(toolName: string, blurb: string, isPdf: boolean): string {
  const fileType = isPdf ? 'PDF' : 'file';
  const lead = (blurb || `Free ${toolName} tool.`).trim().replace(/\s+/g, ' ');
  const clauses = [
    'Runs entirely in your browser.',
    `No ${fileType} upload, no sign-up.`,
    'No watermark, always free.',
  ];

  let description = /[.!?…]$/.test(lead) ? lead : `${lead}.`;
  for (const clause of clauses) {
    if (description.length >= 140) break;
    const next = `${description} ${clause}`;
    if (next.length > MAX_DESCRIPTION) break;
    description = next;
  }

  return trimToLength(description, MAX_DESCRIPTION);
}
