import {
  CATEGORY_BY_ID, TOOLS, type Tool, type ToolGroup,
} from '../tools/catalog';
import { getToolContent, type ToolContent } from './tool-content';

const REVIEWED_AT = '2026-08-15';

/**
 * Group-level copy. Auto-generated pages share a skeleton, so the wording that
 * fills it has to differ per group and category — otherwise every unauthored
 * tool page reads as near-duplicate content to a crawler.
 */
const GROUP_COPY: Record<ToolGroup, {
  fileType: string;
  engine: string;
  uploadNoun: string;
  firstStep: string;
  configureStep: string;
  runStep: string;
  limitation: string;
  offlineNote: string;
}> = {
  image: {
    fileType: 'image',
    engine: "the browser's canvas and codec APIs",
    uploadNoun: 'image',
    firstStep: 'Drag one or more images into the drop zone, or click to browse. HEIC, TIFF, AVIF, and SVG inputs decode through the browser where supported.',
    configureStep: 'Set the options that matter for this tool — dimensions, quality, colour, or output format. A live preview updates as you change values, so you can judge the result before exporting.',
    runStep: 'Run the tool, compare the preview against the original, then download a single file or every result at once.',
    limitation: 'Decoding depends on the browser. Unusual format variants — CMYK JPEGs, 16-bit PNGs, or exotic TIFF flavours — may not render identically in every browser.',
    offlineNote: 'Image processing uses APIs that ship with the browser, so after the page loads no further network access is needed.',
  },
  pdf: {
    fileType: 'PDF',
    engine: 'pdf-lib and pdf.js',
    uploadNoun: 'PDF',
    firstStep: 'Drop a PDF into the tool or click to browse. Page thumbnails render locally so you can confirm you picked the right document.',
    configureStep: 'Choose the pages and settings for this operation — page ranges, rotation, margins, passwords, or text options depending on the tool.',
    runStep: 'Apply the change, review the rendered output, then download the new PDF. Page structure, embedded fonts, and vector content are preserved unless the tool explicitly rasterises.',
    limitation: 'Encrypted PDFs must be unlocked first, and PDFs with damaged cross-reference tables may fail to parse.',
    offlineNote: 'PDF parsing runs in JavaScript and WebAssembly that is cached after the first visit, so repeat use works without a fast connection.',
  },
  video: {
    fileType: 'video',
    engine: 'FFmpeg compiled to WebAssembly',
    uploadNoun: 'video',
    firstStep: 'Drop a video into the tool or click to browse. MP4, WebM, MOV, AVI, and MKV containers are read directly in the browser.',
    configureStep: 'Set the parameters for this operation — trim points, speed, rotation, bitrate, or output container. Short clips give the fastest turnaround.',
    runStep: 'Start the render and watch the progress bar. FFmpeg writes the result inside the tab, then hands you the file to download.',
    limitation: 'Browser-based encoding is memory-bound. Clips under roughly 30 seconds are reliable; long or high-resolution footage can stall or run out of memory.',
    offlineNote: 'The FFmpeg WebAssembly engine (~31 MB) downloads once and is cached, so later sessions start much faster.',
  },
};

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
  'video-edit': 'cuts, retimes, and rearranges video without uploading the footage',
  'video-convert': 'transcodes between video containers and codecs on your own device',
  'video-optimize': 'shrinks video file size by re-encoding locally with FFmpeg',
  'video-extract': 'pulls audio and still frames out of a video in the browser',
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
  'video-edit': [
    'Cut a screen recording down to the segment you actually want to share.',
    'Speed up a long demo clip so it fits a social platform time limit.',
    'Drop the audio track from a clip before posting it publicly.',
  ],
  'video-convert': [
    'Convert a MOV from a phone into MP4 for wider playback support.',
    'Produce a WebM version of a clip for a lighter web embed.',
    'Turn a short clip into a GIF for a README or changelog entry.',
  ],
  'video-optimize': [
    'Get a clip under an upload size limit without a desktop encoder.',
    'Re-encode oversized screen captures before attaching them to a ticket.',
  ],
  'video-extract': [
    'Save the audio from a recorded talk or interview as an MP3.',
    'Pull a still frame out of a clip to use as a thumbnail.',
  ],
};

export function getToolPageContent(tool: Tool): ToolContent {
  const authored = getToolContent(tool.id);
  if (authored) return authored;

  const category = CATEGORY_BY_ID.get(tool.categoryId);
  const group: ToolGroup = category?.group ?? 'image';
  const copy = GROUP_COPY[group];
  const isPdf = group === 'pdf';
  const fileType = copy.fileType;
  const categoryLabel = category?.label ?? `${fileType} tools`;
  const toolVerb = CATEGORY_INTRO[tool.categoryId] ?? `processes ${fileType} files locally in your browser`;

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
    && CATEGORY_BY_ID.get(c.categoryId)?.group === group
    && !sameCat.includes(c.id),
  ).slice(0, 6 - sameCat.length).map((c) => c.id);

  const relatedToolIds = [...sameCat, ...crossCat];

  const description = tool.blurb
    ?? `${tool.name} for ${fileType} files, running locally in your browser with no upload, no sign-up, and no watermark.`;

  const extraUseCases = CATEGORY_USE_CASES[tool.categoryId] ?? [
    `Complete a ${tool.name.toLowerCase()} task without installing a desktop application.`,
  ];

  return {
    title: tool.name,
    description,
    intro: [
      `${tool.name} ${toolVerb}. It sits in the opentools ${categoryLabel} collection and is built on ${copy.engine}, so the work happens on your own device instead of on a server you have to trust with the file.`,
      `Everything runs inside the current browser tab. The ${copy.uploadNoun} on your device is read, never uploaded — the tool writes a separate output for you to inspect and download. No account, no queue, and no watermark on the result.`,
      `${copy.limitation} Use a recent desktop build of Chrome, Firefox, Safari, or Edge for the widest format support and the most headroom on large files.`,
    ],
    steps: [
      {
        title: `Add your ${copy.uploadNoun}`,
        description: copy.firstStep,
      },
      {
        title: `Set up the ${tool.name.toLowerCase()} options`,
        description: copy.configureStep,
      },
      {
        title: 'Run it and download',
        description: copy.runStep,
      },
    ],
    useCases: [
      ...extraUseCases,
      `Handle a confidential ${fileType} without sending it through a third-party upload form.`,
      `Do a quick one-off ${tool.name.toLowerCase()} job without installing ${isPdf ? 'Acrobat or a desktop PDF suite' : group === 'video' ? 'a video editing suite' : 'an image editor'}.`,
    ],
    limitations: [
      copy.limitation,
      `Large inputs are bounded by the memory a single browser tab can claim — roughly 50 MB for ${fileType} work on a typical laptop, and considerably less on phones.`,
      'Check the output before you discard the original, especially for lossy or rasterising operations where the change cannot be undone.',
    ],
    faqs: [
      {
        question: `Is ${tool.name} free to use?`,
        answer: 'Yes — no usage limits, no paywalled settings, no account, and no watermark on the output. opentools is funded as a free utility, not a freemium trial.',
      },
      {
        question: `Are my ${fileType} files uploaded when I use ${tool.name}?`,
        answer: `No. The processing pipeline is ${copy.engine} running inside your browser tab, so the ${copy.uploadNoun} never leaves your device. Anonymous page analytics still load, but they carry no file content.`,
      },
      {
        question: `Does ${tool.name} change my original file?`,
        answer: 'No. A web page cannot silently overwrite files on your disk. The tool reads your input and produces a new file that you choose to download, leaving the source untouched.',
      },
      {
        question: `Can I run ${tool.name} on a phone or tablet?`,
        answer: `Yes, in any modern mobile browser. Speed and the largest workable ${fileType} depend on the device's free memory, so keep mobile jobs small and expect desktop to handle the heavy cases.`,
      },
      {
        question: `Does ${tool.name} work offline?`,
        answer: `An internet connection is needed the first time so the page and its engine can load. ${copy.offlineNote}`,
      },
    ],
    relatedToolIds,
    reviewedAt: REVIEWED_AT,
  };
}
