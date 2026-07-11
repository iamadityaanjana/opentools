export const SITE_URL = 'https://www.opentools.fun';
export const BRAND = 'opentools';

export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'opentools browser-based image and PDF tools',
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

/**
 * Generate an SEO-optimised meta description (target 145–160 chars).
 * Front-load the primary keyword and privacy/free differentiators.
 */
export function toolDescription(toolName: string, blurb: string, isPdf: boolean): string {
  const fileType = isPdf ? 'PDF' : 'image';
  const action = blurb.length >= 80 ? blurb : `${blurb} Runs entirely in your browser — no uploads, no account.`;
  if (action.length >= 130 && action.length <= 165) return action;
  // Fallback generic but keyword-rich
  return `Free ${toolName} tool. Works entirely in your browser — no ${fileType} upload needed, no sign-up, no watermark. Fast, private, and always free.`;
}
