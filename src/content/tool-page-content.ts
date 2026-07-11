import { CATEGORY_BY_ID, TOOLS, type Tool } from '../tools/catalog';
import { getToolContent, type ToolContent } from './tool-content';

const REVIEWED_AT = '2026-07-11';

// Category-specific value propositions used in the intro copy.
const CATEGORY_INTRO: Record<string, string> = {
  convert: 'converts between formats without sending your image to a server',
  basic: 'edits image dimensions and orientation locally with zero upload',
  adjust: 'adjusts colour and exposure entirely inside your browser',
  transform: 'applies geometric and pixel-level transforms on the client',
  watermark: 'overlays text or images locally so your original stays private',
  annotate: 'draws and stamps directly on a canvas copy of your image',
  'pdf-convert': 'converts between PDF and other formats using browser-side rendering',
  'pdf-edit': 'manipulates PDF page structure without uploading to a cloud service',
  'pdf-optimize': 'reduces PDF file size by re-encoding content locally',
  'pdf-security': 'encrypts, decrypts, or redacts PDFs using client-side cryptography',
  'pdf-annotations': 'adds annotations and markup using browser PDF rendering',
  'pdf-forms': 'reads and fills AcroForm fields without a dedicated application',
  'pdf-text': 'extracts text and image content from PDFs locally',
  'pdf-metadata': 'reads and edits PDF metadata fields without cloud processing',
  organize: 'merges or splits images entirely inside the browser',
  gif: 'encodes and decodes GIF animations using browser-side libraries',
  color: 'analyses and converts colours from pixels without server requests',
  metadata: 'reads and strips EXIF and other metadata locally',
  misc: 'applies a visual effect or composite operation client-side',
};

// Category-specific extra use-cases.
const CATEGORY_USE_CASES: Record<string, string[]> = {
  'pdf-security': [
    'Encrypt confidential reports before sharing by email.',
    'Remove a forgotten password from a PDF you own and can open.',
    'Permanently redact personal data before publishing a document.',
  ],
  'pdf-edit': [
    'Rearrange pages in a scanned report without a desktop application.',
    'Remove a cover page or blank filler pages from a downloaded PDF.',
    'Extract a single chapter from a multi-section document.',
  ],
  convert: [
    'Turn HEIC photos from an iPhone into JPEG for broader compatibility.',
    'Prepare WebP or AVIF assets for a website while keeping originals.',
    'Create a PDF copy of a raster image for archiving or printing.',
  ],
  gif: [
    'Bundle a sequence of screenshots into a GIF for documentation.',
    'Extract individual frames from an animated GIF for editing.',
    'Shrink an animated GIF without losing acceptable playback quality.',
  ],
};

export function getToolPageContent(tool: Tool): ToolContent {
  const authored = getToolContent(tool.id);
  if (authored) return authored;

  const category = CATEGORY_BY_ID.get(tool.categoryId);
  const isPdf = category?.group === 'pdf';
  const fileType = isPdf ? 'PDF' : 'image';
  const categoryLabel = category?.label ?? `${fileType} tools`;
  const toolVerb = CATEGORY_INTRO[tool.categoryId] ?? `processes ${fileType}s locally in your browser`;

  // Same-category siblings (live only, up to 4)
  const sameCat = TOOLS.filter((c) =>
    c.id !== tool.id && c.status === 'live' && c.route && c.categoryId === tool.categoryId,
  ).slice(0, 4).map((c) => c.id);

  // Cross-category siblings from the same group (fills up to 6 total)
  const crossCat = TOOLS.filter((c) =>
    c.id !== tool.id
    && c.status === 'live'
    && c.route
    && c.categoryId !== tool.categoryId
    && CATEGORY_BY_ID.get(c.categoryId)?.group === (category?.group ?? 'image')
    && !sameCat.includes(c.id),
  ).slice(0, 6 - sameCat.length).map((c) => c.id);

  const relatedToolIds = [...sameCat, ...crossCat];

  const description = tool.blurb
    ?? `Free ${tool.name} tool. Runs entirely in your browser — no ${fileType} upload, no sign-up, no watermark. Fast and private.`;

  const extraUseCases = CATEGORY_USE_CASES[tool.categoryId] ?? [
    `Complete a ${tool.name.toLowerCase()} task without installing a desktop application.`,
  ];

  return {
    title: tool.name,
    description,
    intro: [
      `${tool.name} ${toolVerb}. It is part of the opentools ${categoryLabel} collection — a suite of free, local-first tools that handle image and PDF work without sending your files to a remote server.`,
      `Everything runs inside your current browser tab. The original file on your device stays untouched; the tool creates a separate output ready for you to inspect and download. No account is required and no watermark is applied to the result.`,
      `For best results use a modern desktop browser (Chrome, Firefox, Safari, Edge). Very large files may be slow or fail on low-memory devices, because the processing pipeline keeps decoded pixels in browser memory.`,
    ],
    steps: [
      {
        title: `Upload your ${isPdf ? 'PDF' : 'image'}`,
        description: `Drag a ${fileType} file directly into the tool or click to browse. Supported formats are listed in the tool header. Multiple files can be added where the tool supports batch operation.`,
      },
      {
        title: 'Configure the settings',
        description: `Adjust the available options — quality, dimensions, range, password, or other parameters depending on the tool. A live preview or page visualizer appears automatically where available.`,
      },
      {
        title: `Convert and download`,
        description: `Click the action button to process your ${fileType}. Inspect the result in the preview, then download the output file. The original is never modified.`,
      },
    ],
    useCases: [
      ...extraUseCases,
      `Process sensitive ${fileType} files locally instead of uploading them to an online service.`,
      `Use it on any device with a modern browser — no installation or sign-in required.`,
    ],
    limitations: [
      `Processing depends on the browser's canvas, file, and codec APIs. Some exotic format variants may not decode correctly in every browser.`,
      `Very large files (typically above 50 MB) can exhaust the memory available to a browser tab, especially on mobile devices with limited RAM.`,
      `Always inspect the output carefully before discarding the original file, particularly for lossily compressed or rasterised results.`,
    ],
    faqs: [
      {
        question: `Is ${tool.name} free to use?`,
        answer: `Yes, completely free with no usage limits or paywalled features. No account or credit card is required. opentools does not apply watermarks to any output.`,
      },
      {
        question: `Are my files uploaded when I use ${tool.name}?`,
        answer: `No. The file-processing pipeline runs entirely inside your browser tab. Your ${fileType} files are never sent to opentools or any third-party server. Standard website analytics requests may still occur, but they do not include your file content.`,
      },
      {
        question: `Does ${tool.name} modify my original file?`,
        answer: `No. Browsers do not have permission to silently overwrite files on your device. The tool produces a separate result file for you to download; the source stays exactly as it was.`,
      },
      {
        question: `Can I use ${tool.name} on a phone or tablet?`,
        answer: `Yes, in a modern mobile browser. Performance and maximum file size depend on the device's available memory. Smaller files work reliably; very large files may be slow or produce an out-of-memory error.`,
      },
      {
        question: `Does ${tool.name} work offline?`,
        answer: `The tool logic runs in the browser, but an internet connection is needed on first load to fetch the page and any WebAssembly codecs. Once loaded, processing itself does not require network access.`,
      },
    ],
    relatedToolIds,
    reviewedAt: REVIEWED_AT,
  };
}
