# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this browser-based image toolbox app. PostHog is initialised in `src/main.tsx` with `PostHogProvider` and `PostHogErrorBoundary` wrapping the entire app, providing autocapture, session replay, and React error boundary tracking out of the box. Custom `capture()` calls have been added to the 12 most business-critical user actions across 7 files, and `captureException()` calls cover the tool processing failure paths.

| Event name | Description | File |
|---|---|---|
| `hero_cta_clicked` | User clicked an Image Tools or PDF Tools call-to-action button on the landing page. | `src/pages/Landing.tsx` |
| `tool_opened` | User navigated to a specific tool page, with the tool ID, name, and category as properties. | `src/pages/ToolRunner.tsx` |
| `images_added` | User added one or more files to the image converter drop zone. | `src/components/Converter.tsx` |
| `conversion_started` | User clicked Convert to start converting images in the main image converter. | `src/components/Converter.tsx` |
| `image_downloaded` | User downloaded a converted image file from the main image converter. | `src/components/Converter.tsx` |
| `tool_run` | User clicked the action button to process files in the generic tool runner. | `src/pages/ToolRunner.tsx` |
| `tool_output_downloaded` | User downloaded the result of a tool operation from the generic tool runner. | `src/pages/ToolRunner.tsx` |
| `color_swatch_saved` | User clicked the canvas in the Color Picker to save a color swatch. | `src/pages/ColorPickerPage.tsx` |
| `live_photo_still_downloaded` | User downloaded the extracted still image from a Live Photo. | `src/pages/LivePhotoPage.tsx` |
| `live_photo_frame_exported` | User exported a specific video frame from a Live Photo motion clip. | `src/pages/LivePhotoPage.tsx` |
| `images_renamed_downloaded` | User downloaded the ZIP of renamed images from the Rename Images tool. | `src/pages/RenameImagesPage.tsx` |
| `images_compared` | User loaded both images into the Image Comparator and triggered a pixel diff. | `src/pages/ImageComparatorPage.tsx` |
| `batch_renamed_downloaded` | User downloaded a ZIP of batch-renamed images from the Batch Rename page. | `src/pages/BatchRenamePage.tsx` |
| `tool_search_performed` | User searched for a tool in the Tools Directory search bar (debounced 600 ms). | `src/pages/ToolsDirectoryPage.tsx` |
| `tool_category_toggled` | User opened or closed a tool category accordion in the Tools Directory. | `src/pages/ToolsDirectoryPage.tsx` |
| `color_value_copied` | User copied a color value (HEX, RGB, or HSL) from the RGB-HEX Converter. | `src/pages/RgbHexPage.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/504831/dashboard/1824927)
- [Tool runs per day (wizard)](https://us.posthog.com/project/504831/insights/MQqYT5Vr) — daily `tool_run` trend over 30 days
- [Downloads by tool (wizard)](https://us.posthog.com/project/504831/insights/pfJixbL1) — `tool_output_downloaded` broken down by `tool_name`
- [Image conversion funnel (wizard)](https://us.posthog.com/project/504831/insights/GjTenXfx) — funnel: `images_added → conversion_started → image_downloaded`
- [Hero CTA clicks (wizard)](https://us.posthog.com/project/504831/insights/aNDFoGst) — landing page CTA clicks by type
- [Most opened tools (wizard)](https://us.posthog.com/project/504831/insights/23Fpv2ZA) — table ranking tools by `tool_opened` count

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names (`VITE_PUBLIC_POSTHOG_PROJECT_TOKEN`, `VITE_PUBLIC_POSTHOG_HOST`) to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
