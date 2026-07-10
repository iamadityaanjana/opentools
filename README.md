# opentools

[![CI](https://github.com/iamadityaanjana/opentools/actions/workflows/ci.yml/badge.svg)](https://github.com/iamadityaanjana/opentools/actions/workflows/ci.yml)

**Private, browser-based image & PDF tools.** Convert, resize, compress, edit,
and organize files without an account. Every file is processed **locally in your
browser** — nothing is uploaded to a server.

Live at **[opentools.fun](https://www.opentools.fun)**.

## Why opentools

- **Local-first & private** — decoding, encoding, and PDF manipulation all run
  client-side via Canvas, WebAssembly codecs, and Web APIs. Your files never
  leave your device for processing.
- **No account, no quota** — open a tool and go.
- **Honest about limits** — the format capability matrix explicitly marks what
  is decode-only, encode-only, or not feasible in a browser (see
  [`src/formats/registry.ts`](src/formats/registry.ts)).
- **One catalog, many tools** — 70+ image and PDF tools defined in a single
  catalog; unfinished ones render as clearly-marked "soon" cards.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, mostly static export) |
| UI | React 19, TypeScript, [Framer Motion](https://www.framer.com/motion/) |
| Icons / fonts | [Phosphor Icons](https://phosphoricons.com/), self-hosted Instrument Sans/Serif via Fontsource |
| Image codecs | [`@jsquash`](https://github.com/jamsinclair/jSquash) (AVIF/WebP/JPEG/PNG), `utif2` (TIFF), `heic-to` (HEIC decode), hand-rolled BMP/ICO/GIF encoders |
| PDF | [`pdf-lib`](https://pdf-lib.js.org/) (structure), [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) (render), `jspdf` (create) |
| Misc | `gifuct-js` (GIF decode), `exifr` (EXIF), `jszip` (archives) |
| Lint / test | [oxlint](https://oxc.rs/), [Vitest](https://vitest.dev/) |
| Analytics | PostHog (self-proxied) |

## Getting started

Requires **Node.js 20+** and npm.

```bash
git clone https://github.com/iamadityaanjana/opentools.git
cd opentools
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> The `predev`/`prebuild` step copies the `pdf.js` worker into `public/`. It runs
> automatically — no manual setup needed.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (static + SSG pages) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` type checking |
| `npm run lint` | Lint with oxlint |
| `npm run test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run check` | Typecheck + lint + test + build (what CI runs) |

## Project structure

```
src/
  app/            Next.js App Router routes, metadata, sitemap, robots, llms.txt
  screens/        Page-level UI (ToolRunner, ConvertPage, ToolsDirectory, ...)
  components/     Reusable UI (TopNav, CropStage, MergeCanvas, PdfPageEditor, ...)
  tools/
    catalog.ts    Single source of truth for every tool (live/soon, route, op)
    ops.ts        Generic operation engine (resize, crop, compress, PDF ops, ...)
  formats/
    registry.ts   Format capability matrix (canDecode/canEncode + notes)
  lib/            Pure logic: decode, encode, color, rename, pdf, gif, exif, ...
  content/        SEO/editorial content and generated tool copy
scripts/          Build helpers (pdf worker copy, IndexNow submit)
docs/seo/         Keyword map and competitive analysis
```

## Adding a new tool

1. Add an entry (name + category) to the `SEED` map in
   [`src/tools/catalog.ts`](src/tools/catalog.ts).
2. Wire it up:
   - **Generic tool** — add it to `IMPL` with an `op` from
     [`src/tools/ops.ts`](src/tools/ops.ts). It's rendered by `ToolRunner`.
   - **Custom UI** — add it to `CUSTOM` with a `route` and build a page under
     `src/app/tools/`.
3. `status` flips to `live` automatically once it's in `IMPL` or `CUSTOM`.

The catalog integrity tests will fail if ids collide or a live tool lacks a
route, so run `npm run test` before opening a PR.

## Testing

Unit tests cover the pure, browser-free logic — color math, filename helpers,
the format registry, and catalog integrity. Canvas/WASM codec paths are verified
manually in the browser rather than in Node.

```bash
npm run test
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow, coding conventions, and how CI validates your PR.

## License

[MIT](LICENSE) © opentools contributors.
