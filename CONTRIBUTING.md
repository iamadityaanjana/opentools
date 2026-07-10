# Contributing to opentools

Thanks for your interest in improving opentools! This project is a suite of
**local-first, browser-based** image and PDF tools. The guiding principle is
simple: **files are processed in the browser and never uploaded for processing.**
Please keep that promise intact in every contribution.

## Ground rules

- **Local-first only.** Do not add features that upload user files to a server
  for processing. If a capability genuinely can't run in the browser, mark the
  tool `soon` rather than shipping a server round-trip.
- **Be honest about limits.** If a format is decode-only, an operation is lossy,
  or a codec is heavy, say so in the UI and in `src/formats/registry.ts`.
- **Keep the bundle lean.** Heavy codecs (AVIF WASM, HEIC, pdf.js, jspdf, etc.)
  must be dynamically imported so they stay out of the initial page load.

## Development setup

Requires **Node.js 20+**.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Before you open a PR

Run the same checks CI runs:

```bash
npm run check      # typecheck + lint + test + build
```

Or individually: `npm run typecheck`, `npm run lint`, `npm run test`,
`npm run build`.

## Adding a tool

1. Add the tool to the `SEED` map in `src/tools/catalog.ts`.
2. For a generic tool, add it to `IMPL` with an `op` defined in
   `src/tools/ops.ts`. For a bespoke UI, add it to `CUSTOM` with a route and a
   page under `src/app/tools/`.
3. Run `npm run test` — catalog integrity tests will catch duplicate ids or a
   live tool missing a route.

## Coding conventions

- **TypeScript**, strict mode. No `any` unless truly unavoidable.
- Prefer small, pure functions in `src/lib/` — they're easy to unit test.
- Comments should explain **why**, not narrate **what** the code does.
- Follow the existing formatting; `npm run lint` (oxlint) must pass with no new
  warnings.

## Tests

Add unit tests (`*.test.ts` next to the source) for any new pure logic —
especially in `src/lib/`, `src/formats/`, and `src/tools/`. Canvas/WASM-dependent
code is verified manually in the browser.

## Commit & PR guidelines

- Keep commits focused; write clear, imperative messages
  (e.g. `Add WebP→PNG pair page`).
- Describe **what** changed and **why** in the PR body, and include manual test
  notes for anything that touches canvas/PDF processing.
- Link any related issue.

## Reporting bugs

Open an issue with the tool name, browser + OS, steps to reproduce, and (if
relevant) a sample file description. Please **don't** attach sensitive files.

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
