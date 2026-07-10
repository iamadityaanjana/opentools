# Search operations handoff

Last reviewed: 2026-07-10

## Canonical host

Use the Domain property `opentools.fun` in Google Search Console, and treat `https://www.opentools.fun` as the canonical URL in page metadata and sitemaps. Keep the apex-to-`www` redirect permanent.

## Google Search Console

1. Verify the Domain property through DNS.
2. Submit `https://www.opentools.fun/sitemap.xml`.
3. Inspect `/`, `/convert`, `/tools/heic-to-jpg`, and one guide after deployment.
4. Confirm the fetched HTML contains the route title, canonical, H1, and JSON-LD.
5. Review indexing, Core Web Vitals, and query/page performance monthly.

## Bing Webmaster Tools and AI Performance

1. Import the verified Search Console property or verify through DNS.
2. Submit the same sitemap.
3. Review Indexing, SEO Reports, and AI Performance citations/grounding queries.
4. For IndexNow, generate a key, publish it at `https://www.opentools.fun/<key>.txt`, set `INDEXNOW_KEY`, and run `npm run indexnow` only after meaningful URL changes.

## Semrush

No Semrush connector or authenticated export was available during implementation. Import a real Keyword Magic/Keyword Gap export before adding volume, KD, CPC, or traffic numbers to `keyword-map.md`. Preserve the distinction between measured metrics and strategic inference.

## Content review

- Recheck social-platform dimensions at least quarterly.
- Recheck competitor limits before publishing comparisons.
- Update `updatedAt` only after substantive editorial or technical review.
- Do not create pair-format pages unless the route has a working dedicated flow, unique limitations, and useful non-duplicative content.
