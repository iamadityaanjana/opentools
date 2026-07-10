# opentools global-English keyword and URL map

**Research date:** 2026-07-10  
**Market/language:** Global English  
**Companion analysis:** [Competitive analysis](./competitive-analysis.md)

## Method and guardrails

- Clusters group phrases with the same underlying job and expected result, not every wording variation.
- “Current SERP competitors” is a directional sample from English web searches on 2026-07-10 plus competitors with established matching landing pages. It is not a fixed rank order.
- **Semrush/Ahrefs search volume, keyword difficulty (KD), CPC, and traffic estimates were unavailable.** They are intentionally marked **Unavailable**, not guessed.
- Priority is qualitative:
  - **P0:** core product-market fit, live capability, and direct path to activation.
  - **P1:** valuable expansion that needs stronger content, UX, or a dedicated route.
  - **P2:** supporting/niche intent or a capability that needs validation before investment.
- Confidence is qualitative:
  - **High:** intent is clear, capability is live, and multiple matching competitors/pages were observed.
  - **Medium:** intent is clear but the route, output behaviour, or differentiation needs validation.
  - **Low:** ambiguous intent, uncertain capability, or likely mismatch with local-browser constraints.
- Proposed paths use the current `/tools/{slug}` convention. A proposed URL is not an instruction to publish a thin page; it should launch only when the tool and unique supporting content are ready.

## Core keyword map

| Intent cluster and representative queries | Search intent | Proposed URL | URL state | Funnel | Priority | Current SERP competitors observed/expected | Confidence | Volume / KD |
|---|---|---|---|---|---|---|---|---|
| **Private online image tools** — private image tools, browser image tools, image tools no upload | Find a trusted multi-tool suite | `/image` | Existing | Discovery | P0 | ZeroPNG, ImageMint, PhotoFormatLab, iLoveIMG | High | Unavailable |
| **Online image converter** — image converter online, convert image format, free image converter | Convert an image now | `/convert` | Existing | Action | P0 | Convertio, CloudConvert, FreeConvert, iLoveIMG, PhotoFormatLab | High | Unavailable |
| **Batch image converter** — batch convert images, bulk image converter, convert multiple images | Convert many files in one workflow | `/tools/batch-convert` | Existing | Action | P0 | PhotoFormatLab, FreeConvert, Convertio, BulkPicTools, CreatorFormat | High | Unavailable |
| **Image converter no upload** — convert image locally, private image converter, browser based image converter | Convert sensitive files without remote processing | `/convert` | Existing; strengthen section | Evaluation/action | P0 | PhotoFormatLab, ZeroPNG, LeanImg, BulkPicTools, ImagifyConvert | High | Unavailable |
| **PNG to JPG** — convert PNG to JPG, PNG to JPEG, batch PNG to JPG | Pair conversion | `/tools/png-to-jpg` | Proposed | Action | P0 | Convertio, CloudConvert, FreeConvert, iLoveIMG | High | Unavailable |
| **JPG to PNG** — convert JPG to PNG, JPEG to PNG transparent | Pair conversion with transparency expectations | `/tools/jpg-to-png` | Proposed | Action | P0 | Convertio, CloudConvert, FreeConvert, iLoveIMG | High | Unavailable |
| **PNG to WebP** — convert PNG to WebP, batch PNG to WebP, PNG WebP no upload | Web optimisation conversion | `/tools/png-to-webp` | Proposed | Action | P0 | Convertio, CloudConvert, FreeConvert, PhotoFormatLab, BulkPicTools | High | Unavailable |
| **JPG to WebP** — convert JPG to WebP, JPEG to WebP, batch JPG WebP | Web optimisation conversion | `/tools/jpg-to-webp` | Proposed | Action | P0 | Convertio, CloudConvert, FreeConvert, PhotoFormatLab | High | Unavailable |
| **WebP to JPG** — convert WebP to JPG, WebP JPEG converter | Compatibility conversion | `/tools/webp-to-jpg` | Proposed | Action | P0 | Convertio, CloudConvert, FreeConvert, iLoveIMG | High | Unavailable |
| **WebP to PNG** — convert WebP to PNG, WebP PNG transparent | Compatibility/alpha conversion | `/tools/webp-to-png` | Proposed | Action | P0 | Convertio, CloudConvert, FreeConvert, PhotoFormatLab | High | Unavailable |
| **JPG/PNG to AVIF** — JPG to AVIF, PNG to AVIF, AVIF converter no upload | Next-gen web optimisation | `/tools/convert-to-avif` | Proposed | Evaluation/action | P1 | CloudConvert, Convertio, FreeConvert, PhotoFormatLab, Squoosh | Medium | Unavailable |
| **AVIF to JPG/PNG** — AVIF to JPG, AVIF to PNG, open AVIF image | Compatibility conversion | `/tools/avif-converter` | Proposed | Action | P1 | CloudConvert, Convertio, FreeConvert, PhotoFormatLab | Medium | Unavailable |
| **HEIC to JPG** — HEIC JPG converter, convert iPhone photo to JPG, HEIC no upload | Make Apple photos broadly compatible | `/tools/heic-to-jpg` | Existing | Action | P0 | CloudConvert, Convertio, FreeConvert, iLoveIMG, PhotoFormatLab | High | Unavailable |
| **TIFF converter** — TIFF to JPG, TIFF to PNG, convert TIF online | Convert scan/print imagery | `/tools/tiff-converter` | Proposed | Action | P1 | CloudConvert, Convertio, FreeConvert, PhotoFormatLab | Medium | Unavailable |
| **Image resizer** — resize image online, change image dimensions, resize photo | Resize one image now | `/tools/resize-image` | Existing | Action | P0 | ImageResizer, iLoveIMG, FreeConvert, Adobe Express | High | Unavailable |
| **Bulk image resizer** — resize multiple images, batch resize photos, bulk image resize | Apply one resize rule to many files | `/tools/batch-resize` | Existing | Action | P0 | ImageResizer, iLoveIMG, Bulk Resize Photos, PixelBatch, BulkPicTools | High | Unavailable |
| **Resize by target file size** — resize image to 100 KB, reduce image below 2 MB, image size in KB | Meet an upload limit | `/tools/reduce-image-size-for-upload` | Existing | Action | P0 | ImageResizer, PixelBatch, PhotoResizer.in, WebToolTrix, UtiloKit | High | Unavailable |
| **Social media image resizer** — resize image for Instagram, YouTube thumbnail size, social image sizes | Meet platform dimensions | `/tools/resize-for-social-media` | Existing | Action | P1 | Adobe Express, Canva, iLoveIMG, ImageResizer | High | Unavailable |
| **Crop image online** — crop photo, crop image no upload, exact aspect-ratio crop | Crop one image | `/tools/crop-image` | Existing | Action | P0 | iLoveIMG, ImageResizer, Adobe Express, Canva | High | Unavailable |
| **Rotate/flip image** — rotate image online, mirror image, flip photo | Simple edit | `/tools/rotate-image` and `/tools/flip-image` | Existing | Action | P1 | iLoveIMG, Ezgif, ImageResizer | High | Unavailable |
| **Image compressor** — compress image online, reduce image file size, photo compressor | Reduce file weight | `/tools/batch-compress-images` | Existing but batch-oriented | Action | P0 | TinyPNG, iLoveIMG, FreeConvert, Squoosh, ZeroPNG | High | Unavailable |
| **Compress JPG** — JPG compressor, compress JPEG, reduce JPG size | Format-specific compression | `/tools/compress-jpg` | Existing | Action | P0 | TinyPNG, iLoveIMG, FreeConvert, Squoosh | High | Unavailable |
| **Compress PNG** — PNG compressor, reduce PNG size, compress transparent PNG | Format-specific compression | `/tools/compress-png` | Existing | Action | P0 | TinyPNG, iLoveIMG, FreeConvert, Squoosh | High | Unavailable |
| **Compress WebP** — WebP compressor, reduce WebP size | Format-specific compression | `/tools/compress-webp` | Existing | Action | P1 | TinyPNG, Squoosh, FreeConvert, ZeroPNG | High | Unavailable |
| **Batch image compressor** — compress multiple images, bulk photo compressor, ZIP compressed images | Compress many files together | `/tools/batch-compress-images` | Existing | Action | P0 | TinyPNG, iLoveIMG, FreeConvert, PixelBatch, CrushMachine | High | Unavailable |
| **Private image compressor** — compress image no upload, local image compressor, offline image compressor | Compress sensitive files locally | `/tools/batch-compress-images` | Existing; strengthen section | Evaluation/action | P0 | Squoosh, ZeroPNG, PixelBatch, CrushMachine, MiniPx | High | Unavailable |
| **Remove EXIF / GPS metadata** — remove EXIF data, strip photo location, metadata remover no upload | Protect privacy before sharing | `/tools/remove-exif-metadata` | Existing | Action | P0 | Picovert, ExifVoid, Ghoststrip, MiniWebTool, ZeroPNG | High | Unavailable |
| **View EXIF data** — EXIF viewer, check photo metadata, view GPS in image | Inspect hidden image data | `/tools/view-exif-data` | Existing | Evaluation/action | P1 | Jimpl, Metadata2Go, MiniWebTool, Exif.tools | High | Unavailable |
| **Change image DPI** — change DPI online, 300 DPI image converter, print DPI changer | Prepare output metadata/print settings | `/tools/change-dpi` | Existing | Action | P1 | Convert Town, Clideo, Pi7, ImageResizer-adjacent tools | Medium | Unavailable |
| **Remove image background metadata/privacy bundle** — clean photo before sharing, remove photo data | Solve a privacy outcome, not one operation | `/guides/share-photos-without-location-data` | Proposed guide | Discovery/evaluation | P1 | Privacy guides, EXIF-removal specialists | Medium | Unavailable |
| **Images to PDF** — JPG to PDF, combine images into PDF, photos to PDF no upload | Combine images into a document | `/tools/images-to-pdf` | Existing | Action | P0 | iLovePDF, Smallpdf, Adobe Acrobat, FreeConvert | High | Unavailable |
| **PDF to images** — PDF to JPG, PDF to PNG, turn PDF pages into images | Render document pages | `/tools/pdf-to-images` | Existing | Action | P1 | iLovePDF, Smallpdf, Adobe Acrobat, CloudConvert | High | Unavailable |
| **Extract images from PDF** — extract original images from PDF, save PDF pictures | Recover embedded assets | `/tools/extract-images-from-pdf` | Existing | Action | P1 | PDFCandy, iLovePDF-adjacent tools, Sejda, online extractors | Medium | Unavailable |
| **Merge images** — combine images side by side, merge photos vertically | Compose multiple images | `/tools/merge-images` | Existing | Action | P1 | PineTools, iLoveIMG, Canva, Adobe Express | High | Unavailable |
| **Create collage** — photo collage maker no signup, combine photos grid | Visual composition | `/tools/create-collage` | Existing | Action | P2 | Canva, Adobe Express, Fotor, iLoveIMG | Medium | Unavailable |
| **ZIP images** — put images in ZIP, download photos as ZIP, ZIP files no upload | Package files without transforming pixels | `/tools/zip-multiple-images` | Existing | Action | P1 | ezyZip, online archive tools, image-batch utilities | Medium | Unavailable |
| **Rename images in bulk** — batch rename photos, rename image sequence, add prefix to filenames | Organise a local collection | `/tools/batch-rename` | Existing | Action | P1 | desktop utilities, Bulk Rename Utility, smaller web tools | Medium | Unavailable |
| **Watermark images** — add watermark to photos, batch watermark images | Protect/brand assets | `/tools/add-watermark` | Existing | Action | P1 | iLoveIMG, Watermarkly, Canva, ZeroPNG | High | Unavailable |
| **Images to GIF** — GIF maker from images, create animated GIF, images GIF no upload | Build an animation | `/tools/images-to-gif` | Existing | Action | P1 | Ezgif, Canva, Adobe Express, Imgflip | High | Unavailable |
| **GIF to frames** — split GIF into images, extract GIF frames | Decompose an animation | `/tools/gif-to-images` | Existing | Action | P1 | Ezgif, Online-Convert, GIFGIFs | High | Unavailable |
| **GIF compressor/optimizer** — compress GIF, reduce animated GIF size | Reduce an animation | `/tools/gif-optimizer` | Existing | Action | P1 | Ezgif, iLoveIMG, FreeConvert, VEED | High | Unavailable |
| **GIF resizer** — resize animated GIF, change GIF dimensions | Resize while preserving animation | `/tools/gif-resizer` | Existing | Action | P1 | Ezgif, iLoveIMG, GIFGIFs | High if animation is preserved and tested; otherwise Low | Unavailable |
| **Image colour picker** — pick colour from image, image HEX picker, eyedropper online | Inspect a pixel colour | `/tools/color-picker` | Existing | Action | P1 | ImageColorPicker.com, PineTools, browser/design tools | High | Unavailable |
| **Extract colour palette** — palette from image, image colour extractor | Generate a palette | `/tools/extract-color-palette` | Existing | Action | P1 | Coolors, Canva, Adobe Color, ImageColorPicker.com | High | Unavailable |
| **RGB to HEX** — RGB HEX converter, HEX to RGB | Convert colour notation | `/tools/rgb-hex-converter` | Existing | Action | P2 | RapidTables, W3Schools, browser calculators | High | Unavailable |
| **Live Photo extractor** — extract photo from Live Photo, save Live Photo frame, Live Photo to image | Recover still/video content | `/tools/live-photo-extractor` | Existing | Action | P1 | desktop/mobile apps, niche online extractors | Medium | Unavailable |
| **Compare images** — before after image slider, pixel difference image, compare two images online | Visually inspect changes | `/tools/image-comparator` | Existing | Evaluation/action | P1 | Diffchecker, JuxtaposeJS tools, specialised visual diff sites | Medium | Unavailable |
| **Base64 image** — image to Base64, image data URI generator | Prepare a web asset/snippet | `/tools/convert-to-base64` | Existing | Action | P1 | Base64.guru, CodeBeautify, Browserling | High | Unavailable |
| **Favicon generator** — create favicon from image, PNG to ICO, favicon sizes | Prepare site icons | `/tools/generate-favicon` | Existing | Action | P1 | RealFaviconGenerator, favicon.io, CloudConvert | High | Unavailable |

## Supporting guide map

Guides should resolve a decision or risk that the working tool alone cannot. They should contain original diagrams, tested examples, or output evidence—not generic definitions.

| Intent cluster | Proposed URL | Funnel | Priority | Primary tool link | Current content competitors | Confidence |
|---|---|---|---|---|---|---|
| WebP vs AVIF | `/guides/webp-vs-avif` | Discovery/evaluation | P0 | `/convert` | Google/web.dev, MDN, ShortPixel, Cloudinary | High |
| PNG vs JPG vs WebP | `/guides/png-vs-jpg-vs-webp` | Discovery/evaluation | P0 | `/convert` | Adobe, Cloudinary, Shopify/blog publishers | High |
| Are online image converters safe? | `/guides/are-online-image-converters-safe` | Evaluation | P0 | `/convert` | Converter comparison blogs, privacy-first entrants | High |
| How browser-local image processing works | `/privacy/local-processing` | Evaluation/trust | P0 | All tools | Squoosh GitHub, ZeroPNG, PhotoFormatLab | High |
| Convert images without uploading | `/guides/convert-images-without-uploading` | Evaluation/action | P0 | `/convert` | PhotoFormatLab, ZeroPNG, BulkPicTools | High |
| Compress to an exact KB/MB limit | `/guides/compress-image-to-exact-file-size` | Discovery/action | P0 | `/tools/reduce-image-size-for-upload` | PhotoResizer.in, PixelBatch, UtiloKit | High |
| Remove GPS from a photo | `/guides/remove-gps-from-photo` | Discovery/action | P0 | `/tools/remove-exif-metadata` | Picovert, Ghoststrip, ExifVoid | High |
| What image conversion preserves | `/guides/image-conversion-quality-metadata-transparency` | Evaluation | P0 | `/convert` | Format guides and converter help centres | High |
| HEIC compatibility and local conversion | `/guides/heic-to-jpg-privacy-quality` | Evaluation/action | P1 | `/tools/heic-to-jpg` | Apple support, CloudConvert, Convertio, PhotoFormatLab | High |
| Image size for upload forms | `/guides/reduce-photo-size-for-upload` | Discovery/action | P1 | `/tools/reduce-image-size-for-upload` | Government-exam/photo-resizer sites, Adobe | Medium |
| Image dimensions for social platforms | `/guides/social-media-image-sizes` | Discovery | P1 | `/tools/resize-for-social-media` | Hootsuite, Sprout Social, Canva | Medium; freshness burden is high |
| Why AVIF encoding can be slow | `/guides/avif-browser-encoding-performance` | Evaluation | P2 | `/tools/convert-to-avif` | Codec/engineering docs | Medium |
| GIF vs animated WebP vs APNG | `/guides/gif-vs-animated-webp-vs-apng` | Discovery/evaluation | P1 | GIF tools | MDN, Cloudinary, Ezgif-adjacent guides | Medium |
| Browser processing limits | `/guides/local-image-processing-limits` | Evaluation/trust | P0 | All batch tools | Few direct competitors disclose this well | High |

**Metric note for all guide clusters:** Semrush volume/KD unavailable; no numerical estimates supplied.

## URL ownership and cannibalisation rules

1. **One canonical owner per job.** `/convert` owns generic “image converter” intent. Pair pages own only their exact input/output intent.
2. **Batch and single-file intent can share a page** when the same interface handles both well. Do not create `/batch-*` duplicates solely to repeat copy; retain existing batch URLs only where the workflow or UI is meaningfully distinct.
3. **Format-specific compression pages can coexist** with `/tools/batch-compress-images` because users expect format-specific settings and caveats. Link them bidirectionally.
4. **Privacy modifiers should usually enrich the primary tool page**, not generate duplicate `/private-*` doorway pages.
5. **Guide URLs answer “which/why/how”; tool URLs answer “do it now.”** Put the working interface above explanatory copy on action pages.
6. **Do not create every theoretical conversion pair.** A pair URL is justified only if:
   - the path is supported and tested in major browsers;
   - it has unique preservation/limitation guidance;
   - the UI is preconfigured for that pair;
   - internal links can reach it naturally;
   - it is not a soft-404 wrapper around `/convert`.

## Page requirements by template

### Tool page

Every P0/P1 action page should include:

1. exact task-focused title and H1;
2. the usable tool without requiring an account;
3. visible local-processing state;
4. accepted inputs, outputs, and browser requirements;
5. batch behaviour and practical device constraints;
6. what happens to dimensions, transparency, animation, metadata, ICC profiles, and filenames;
7. before/after output facts where relevant;
8. a short, truthful privacy explanation with a link to `/privacy/local-processing`;
9. task-specific FAQ based on real failure modes;
10. links to the parent hub, adjacent tools, relevant pair pages, and one decision guide.

### Pair-conversion page

In addition to the tool-page requirements:

- preselect input and output formats;
- explain when the target is appropriate;
- document alpha handling and lossy/lossless consequences;
- say whether animation is preserved;
- provide a tested sample input/output;
- avoid unsupported claims such as adding transparency to a JPEG source.

### Guide

- lead with the decision or outcome;
- cite primary specifications and browser-support sources;
- include original examples or test results;
- show limitations and counterexamples;
- link to the relevant tool only where it naturally solves the next step;
- include “last reviewed” because format/browser guidance changes.

## Content moat

### Privacy and architecture

- Publish a single source of truth for file flow: local file selection → browser memory → local worker/codec → object URL/download.
- Identify all requests unrelated to file bytes, including analytics, fonts, CDN assets, crash reports, and hosting logs.
- Offer a DevTools verification walkthrough.
- Use precise wording: “not uploaded for processing,” not “anonymous” or “zero data collection” unless those broader claims are verified.

### No-account workflows

- Let users save presets locally, without creating an account.
- Support importing/exporting presets for portability.
- Explain where presets live and how to clear them.
- Do not imply cloud history, sync, or recovery exists.

### Batch depth

- Device-aware concurrency and memory warnings.
- Per-file status, error detail, selective retry, and cancellation.
- Preserve relative filenames where possible; handle collisions predictably.
- One-click ZIP plus an output manifest with dimensions, bytes, format, and metadata result.
- Prefer “no artificial server quota” over “unlimited.”

### Honest limitations

- Make the repository’s capability matrix public-facing.
- Distinguish decode, static encode, animation-preserving encode, and unsupported paths.
- Disclose HEIC decode-only behaviour, browser-dependent JPEG 2000 decoding, rasterised SVG output, static-frame generic GIF output, and unsupported RAW/project formats.
- Warn when a transform strips EXIF, ICC profiles, alpha, or animation.
- Explain that local processing can be slower or fail on low-memory devices.

### Evidence-led quality

- Maintain a small downloadable test corpus covering photos, screenshots, transparency, gradients, metadata, colour profiles, animation, and corrupted input.
- Publish the codec/library version and test date.
- Compare output with reproducible settings, not blanket “best quality” claims.
- Record visual and structural outcomes as well as bytes saved.

## Rollout sequence

### P0: make the current product credible and findable

1. Strengthen `/image`, `/convert`, resize, compression, HEIC, EXIF removal, and Images-to-PDF pages.
2. Publish `/privacy/local-processing` and `/guides/local-image-processing-limits`.
3. Ensure crawlable titles, descriptions, canonical tags, page copy, and structured internal links are present in rendered HTML.
4. Add tested PNG↔JPG, PNG/JPG→WebP, WebP→PNG/JPG pair pages.
5. Create the WebP-vs-AVIF, safe-converter, exact-file-size, and GPS-removal guides.

### P1: build workflow differentiation

1. Improve batch conversion/compression/resize with queue, ZIP, naming, retries, and manifests.
2. Add AVIF and TIFF pages only after browser/output testing.
3. Deepen GIF, metadata, colour, and web-asset clusters.
4. Add original format-preservation examples and benchmarks.

### P2: expand carefully

1. Add niche utility pages only when product usage or Search Console queries support them.
2. Avoid trying to match CloudConvert/Convertio’s long tail of server-dependent formats.
3. Avoid broad creative-editor terms dominated by Canva/Adobe unless opentools offers a distinctly faster task flow.

## Validation plan

Use these sources before changing priority:

1. **Google Search Console:** impressions, queries, countries, page/query overlap, index coverage.
2. **Product analytics:** tool starts, successful exports, batch size, repeat use, and failure categories. Do not send filenames or file contents.
3. **Controlled SERP checks:** representative US/UK/India/global-English samples on mobile and desktop, recorded by date.
4. **Qualitative research:** why users chose local processing, what “private” means to them, and which limitations cause abandonment.
5. **Third-party SEO data:** add Semrush/Ahrefs volume and KD only when actually exported, with geography, database date, and match type documented.

## Sources used for competitor and intent mapping

Accessed or search-sampled on 2026-07-10:

- iLoveIMG: https://www.iloveimg.com/, https://www.iloveimg.com/compress-image, https://www.iloveimg.com/resize-image
- CloudConvert: https://cloudconvert.com/
- Convertio: https://convertio.co/
- FreeConvert: https://www.freeconvert.com/ and https://www.freeconvert.com/image-converter
- TinyPNG/Tinify: https://tinypng.com/ and https://tinypng.com/pricing/web/
- Squoosh: https://squoosh.app/ and https://github.com/GoogleChromeLabs/squoosh/
- Ezgif: https://ezgif.com/
- ImageResizer: https://imageresizer.com/ and https://imageresizer.com/bulk-resize
- ZeroPNG: https://zeropng.com/ and https://zeropng.com/tools
- PhotoFormatLab: https://www.photoformatlab.com/
- ImageMint: https://imagemint.app/en
- BulkPicTools: https://bulkpictools.com/tools/convert/image-converter and https://bulkpictools.com/tools/resize/image-resizer
- PixelBatch: https://pixelbatch.io/
- PhotoResizer.in: https://www.photoresizer.in/
- Picovert EXIF remover: https://www.picovert.com/en/remove-exif
- ExifVoid: https://exifvoid.com/
- Ghoststrip: https://ghoststrip.com/remove-exif-data/

