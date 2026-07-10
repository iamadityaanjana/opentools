// Central catalog of every tool opentools offers (built or planned).
// Adding a new tool = one entry here. `status: 'live'` tools link to their
// route; `status: 'soon'` tools render as clearly-marked upcoming cards.

import {
  ArrowsLeftRight,
  Crop,
  FileZip,
  PaintBrush,
  FilePdf,
  SquaresFour,
  Browser,
  Info,
  Wrench,
  DeviceMobile,
  Gif,
  Palette,
  DotsThreeCircle,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

export type ToolStatus = 'live' | 'soon';
export type ToolGroup = 'image' | 'pdf';

export interface ToolCategory {
  id: string;
  label: string;
  icon: Icon;
  group: ToolGroup;
}

export interface Tool {
  id: string;
  name: string;
  categoryId: string;
  status: ToolStatus;
  route?: string;
  blurb?: string;
  /** Operation id in the ops engine (for generic tool pages). */
  op?: string;
  /** Whether the tool combines many inputs into one output. */
  mode?: 'each' | 'combine';
}

export const CATEGORIES: ToolCategory[] = [
  { id: 'convert', label: 'Convert', icon: ArrowsLeftRight, group: 'image' },
  { id: 'resize', label: 'Resize & Crop', icon: Crop, group: 'image' },
  { id: 'compress', label: 'Compression', icon: FileZip, group: 'image' },
  { id: 'edit', label: 'Basic Editing', icon: PaintBrush, group: 'image' },
  { id: 'pdf-convert', label: 'Convert PDFs', icon: ArrowsLeftRight, group: 'pdf' },
  { id: 'pdf-edit', label: 'Edit PDFs', icon: Crop, group: 'pdf' },
  { id: 'pdf-optimize', label: 'Optimize PDFs', icon: FileZip, group: 'pdf' },
  { id: 'pdf-security', label: 'PDF Security', icon: FilePdf, group: 'pdf' },
  { id: 'pdf-annotations', label: 'Annotations', icon: PaintBrush, group: 'pdf' },
  { id: 'pdf-forms', label: 'PDF Forms', icon: SquaresFour, group: 'pdf' },
  { id: 'pdf-text', label: 'OCR & Text', icon: Browser, group: 'pdf' },
  { id: 'pdf-organize', label: 'Organize PDFs', icon: Wrench, group: 'pdf' },
  { id: 'pdf-images', label: 'PDF Images', icon: SquaresFour, group: 'pdf' },
  { id: 'pdf-metadata', label: 'PDF Metadata', icon: Info, group: 'pdf' },
  { id: 'pdf-printing', label: 'PDF Printing', icon: FilePdf, group: 'pdf' },
  { id: 'pdf-utilities', label: 'PDF Utilities', icon: DotsThreeCircle, group: 'pdf' },
  { id: 'organize', label: 'Organization', icon: SquaresFour, group: 'image' },
  { id: 'web', label: 'Web & Design', icon: Browser, group: 'image' },
  { id: 'metadata', label: 'Metadata', icon: Info, group: 'image' },
  { id: 'utilities', label: 'Utilities', icon: Wrench, group: 'image' },
  { id: 'mobile', label: 'Mobile Tasks', icon: DeviceMobile, group: 'image' },
  { id: 'gif', label: 'GIF Tools', icon: Gif, group: 'image' },
  { id: 'color', label: 'Color Tools', icon: Palette, group: 'image' },
  { id: 'misc', label: 'Miscellaneous', icon: DotsThreeCircle, group: 'image' },
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

// Group landing pages list their tools by category.
export const GROUP_HOME: Record<ToolGroup, string> = {
  image: '/image',
  pdf: '/pdf',
};
export const GROUP_LABEL: Record<ToolGroup, string> = {
  image: 'Image tools',
  pdf: 'PDF tools',
};

export function categoriesForGroup(group: ToolGroup): ToolCategory[] {
  return CATEGORIES.filter((c) => c.group === group);
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Compact declaration: [name, status?, route?, blurb?]
type ToolSeed = [string] | [string, ToolStatus] | [string, ToolStatus, string] | [string, ToolStatus, string, string];

const SEED: Record<string, ToolSeed[]> = {
  convert: [
    ['Image Converter', 'live', '/convert', 'Convert between 15+ formats — JPEG, PNG, WebP, AVIF, TIFF, PDF & more.'],
  ],
  resize: [
    ['Resize Image'],
    ['Crop Image'],
    ['Rotate Image'],
    ['Flip Image'],
    ['Change Canvas Size'],
  ],
  compress: [
    ['Compress JPG'],
    ['Compress PNG'],
    ['Compress WebP'],
    ['Batch Compress Images'],
  ],
  edit: [
    ['Add Text'],
    ['Add Watermark'],
    ['Blur Image'],
    ['Sharpen Image'],
    ['Adjust Brightness'],
    ['Adjust Contrast'],
    ['Adjust Saturation'],
    ['Convert to Grayscale'],
    ['Invert Colors'],
  ],
  'pdf-convert': [
    ['Images to PDF'],
    ['PDF to Word'],
    ['Word to PDF'],
    ['PDF to Excel'],
    ['Excel to PDF'],
    ['PDF to PowerPoint'],
    ['PowerPoint to PDF'],
    ['PDF to JPG'],
    ['JPG to PDF'],
    ['PNG to PDF'],
    ['PDF to HTML'],
    ['HTML to PDF'],
    ['PDF to Text'],
    ['PDF to EPUB'],
  ],
  'pdf-edit': [
    ['Merge PDFs'],
    ['Split PDF'],
    ['Delete Pages'],
    ['Extract Pages'],
    ['Rearrange Pages'],
    ['Rotate Pages'],
    ['Crop PDF'],
    ['Add Page Numbers'],
    ['Add Blank Pages'],
  ],
  'pdf-optimize': [
    ['Compress PDF'],
    ['Reduce PDF Size'],
    ['Optimize PDF for Web'],
    ['Flatten PDF'],
  ],
  'pdf-security': [
    ['Protect PDF with Password'],
    ['Unlock PDF'],
    ['Remove PDF Password'],
    ['Add Watermark to PDF'],
    ['Remove Watermark from PDF'],
    ['Add Digital Signature'],
    ['Verify PDF Signature'],
    ['Redact PDF'],
  ],
  'pdf-annotations': [
    ['Add Text to PDF'],
    ['Highlight PDF Text'],
    ['Underline PDF Text'],
    ['Strike Through PDF Text'],
    ['Draw on PDF'],
    ['Add Shapes to PDF'],
    ['Add PDF Comments'],
    ['Add Sticky Notes to PDF'],
  ],
  'pdf-forms': [
    ['Fill PDF Forms'],
    ['Create Fillable PDF'],
    ['Flatten PDF Forms'],
    ['Extract PDF Form Data'],
  ],
  'pdf-text': [
    ['OCR PDF'],
    ['Make PDF Searchable'],
    ['Extract Text from PDF'],
  ],
  'pdf-organize': [
    ['Combine PDFs'],
    ['Separate PDFs'],
    ['Rename PDF'],
    ['Batch Rename PDFs'],
    ['Batch Compress PDFs'],
    ['Batch Convert PDFs'],
  ],
  'pdf-images': [
    ['PDF to Images'],
    ['Extract Images from PDF'],
    ['Replace Images in PDF'],
    ['Add Images to PDF'],
    ['Remove Images from PDF'],
  ],
  'pdf-metadata': [
    ['View PDF Metadata'],
    ['Edit PDF Metadata'],
    ['Remove PDF Metadata'],
  ],
  'pdf-printing': [
    ['Booklet PDF'],
    ['N-up PDF Printing'],
    ['Print Selected PDF Pages'],
    ['Print Multiple PDFs'],
  ],
  'pdf-utilities': [
    ['Compare PDFs'],
    ['Repair PDF'],
    ['Scan to PDF'],
    ['PDF Viewer'],
    ['PDF Page Counter'],
    ['PDF Size Checker'],
    ['PDF Info'],
    ['Remove Blank Pages'],
  ],
  organize: [
    ['Merge Images'],
    ['Split Image'],
    ['Create Collage'],
    ['ZIP Multiple Images'],
  ],
  web: [
    ['Generate Favicon'],
    ['Resize for Social Media'],
    ['Generate Thumbnails'],
    ['Convert to Base64'],
    ['Image to Data URI'],
  ],
  metadata: [
    ['View EXIF Data'],
    ['Remove EXIF Metadata'],
    ['Change DPI'],
    ['Change Resolution'],
  ],
  utilities: [
    ['Rename Images'],
    ['Batch Rename'],
    ['Batch Resize'],
    ['Batch Convert'],
    ['Batch Rotate'],
  ],
  mobile: [
    ['HEIC to JPG'],
    ['Live Photo Extractor'],
    ['Screenshot Cropper'],
    ['Reduce Image Size for Upload'],
  ],
  gif: [
    ['Images to GIF'],
    ['GIF to Images'],
    ['GIF Optimizer'],
    ['GIF Resizer'],
  ],
  color: [
    ['Color Picker'],
    ['Extract Color Palette'],
    ['RGB ↔ HEX Converter'],
    ['Image Color Counter'],
  ],
  misc: [
    ['Add Border'],
    ['Round Corners'],
    ['Mirror Image'],
    ['Pixelate Image'],
    ['Mosaic Effect'],
    ['Convert Transparency'],
    ['Change Background Color'],
    ['Image Comparator'],
  ],
};

export const TOOLS: Tool[] = Object.entries(SEED).flatMap(([categoryId, seeds]) =>
  seeds.map(([name, status = 'soon', route, blurb]) => ({
    id: slug(name),
    name,
    categoryId,
    status,
    route,
    blurb,
  })),
);

// Feasible tools powered by the generic ops engine. One entry = a live tool.
const IMPL: Record<string, { op: string; mode?: 'each' | 'combine' }> = {
  // Resize & crop
  'resize-image': { op: 'resize' },
  'crop-image': { op: 'crop' },
  'rotate-image': { op: 'rotate' },
  'flip-image': { op: 'flip' },
  'change-canvas-size': { op: 'canvas-size' },
  // Compression
  'compress-jpg': { op: 'compress' },
  'compress-png': { op: 'compress' },
  'compress-webp': { op: 'compress' },
  'batch-compress-images': { op: 'compress' },
  // Basic editing
  'add-text': { op: 'text' },
  'add-watermark': { op: 'watermark' },
  'blur-image': { op: 'blur' },
  'sharpen-image': { op: 'sharpen' },
  'adjust-brightness': { op: 'brightness' },
  'adjust-contrast': { op: 'contrast' },
  'adjust-saturation': { op: 'saturation' },
  'convert-to-grayscale': { op: 'grayscale' },
  'invert-colors': { op: 'invert' },
  // PDF
  'images-to-pdf': { op: 'imagesToPdf', mode: 'combine' },
  'pdf-to-jpg': { op: 'pdfToJpg' },
  'jpg-to-pdf': { op: 'imagesToPdf', mode: 'combine' },
  'png-to-pdf': { op: 'imagesToPdf', mode: 'combine' },
  'pdf-to-text': { op: 'pdfToText' },
  'merge-pdfs': { op: 'mergePdf', mode: 'combine' },
  'split-pdf': { op: 'splitPdf' },
  'delete-pages': { op: 'deletePdfPages' },
  'extract-pages': { op: 'extractPdfPages' },
  'rearrange-pages': { op: 'reorderPdfPages' },
  'rotate-pages': { op: 'rotatePdfPages' },
  'crop-pdf': { op: 'cropPdf' },
  'add-page-numbers': { op: 'addPdfPageNumbers' },
  'add-blank-pages': { op: 'addBlankPdfPages' },
  'compress-pdf': { op: 'compressPdf' },
  'reduce-pdf-size': { op: 'compressPdf' },
  'optimize-pdf-for-web': { op: 'compressPdf' },
  'flatten-pdf': { op: 'flattenPdf' },
  'add-watermark-to-pdf': { op: 'watermarkPdf' },
  'add-text-to-pdf': { op: 'addPdfText' },
  'fill-pdf-forms': { op: 'fillPdfForms' },
  'flatten-pdf-forms': { op: 'flattenPdfForms' },
  'extract-pdf-form-data': { op: 'extractPdfFormData' },
  'extract-text-from-pdf': { op: 'pdfToText' },
  'combine-pdfs': { op: 'mergePdf', mode: 'combine' },
  'separate-pdfs': { op: 'splitPdf' },
  'rename-pdf': { op: 'renamePdf' },
  'batch-rename-pdfs': { op: 'renamePdf' },
  'batch-compress-pdfs': { op: 'compressPdf' },
  'batch-convert-pdfs': { op: 'pdfToImages' },
  'pdf-to-images': { op: 'pdfToImages' },
  'extract-images-from-pdf': { op: 'extractImagesFromPdf' },
  'view-pdf-metadata': { op: 'pdfInfo' },
  'edit-pdf-metadata': { op: 'editPdfMetadata' },
  'remove-pdf-metadata': { op: 'removePdfMetadata' },
  'print-selected-pdf-pages': { op: 'extractPdfPages' },
  'pdf-page-counter': { op: 'pdfInfo' },
  'pdf-size-checker': { op: 'pdfInfo' },
  'pdf-info': { op: 'pdfInfo' },
  'remove-blank-pages': { op: 'removeBlankPdfPages' },
  // Organization
  'merge-images': { op: 'merge', mode: 'combine' },
  'split-image': { op: 'splitImage' },
  'create-collage': { op: 'collage', mode: 'combine' },
  'zip-multiple-images': { op: 'zipImages', mode: 'combine' },
  // Web & design
  'generate-favicon': { op: 'favicon' },
  'resize-for-social-media': { op: 'social' },
  'generate-thumbnails': { op: 'thumbnail' },
  'convert-to-base64': { op: 'base64' },
  'image-to-data-uri': { op: 'datauri' },
  // Metadata
  'view-exif-data': { op: 'viewExif' },
  'remove-exif-metadata': { op: 'passthrough' },
  'change-dpi': { op: 'changeDpi' },
  'change-resolution': { op: 'resize' },
  // Utilities (batch = multi-file upload of the same op)
  'batch-resize': { op: 'resize' },
  'batch-convert': { op: 'passthrough' },
  'batch-rotate': { op: 'rotate' },
  // Mobile
  'heic-to-jpg': { op: 'convertJpeg' },
  'screenshot-cropper': { op: 'crop' },
  'reduce-image-size-for-upload': { op: 'reduce' },
  // GIF
  'images-to-gif': { op: 'imagesToGif', mode: 'combine' },
  'gif-to-images': { op: 'gifToImages' },
  'gif-optimizer': { op: 'gifOptimizer' },
  'gif-resizer': { op: 'gifResizer' },
  // Color
  'extract-color-palette': { op: 'colorPalette' },
  'image-color-counter': { op: 'colorCount' },
  // Miscellaneous
  'add-border': { op: 'border' },
  'round-corners': { op: 'round-corners' },
  'mirror-image': { op: 'flip' },
  'pixelate-image': { op: 'pixelate' },
  'mosaic-effect': { op: 'pixelate' },
  'convert-transparency': { op: 'transparency' },
  'change-background-color': { op: 'bgcolor' },
};

// Interactive tools that live on their own dedicated page (see App.tsx routes)
// rather than the generic ops-engine runner. They have no `op`; flipping them
// live just needs a `route` + `status`.
const CUSTOM: Record<string, { route: string }> = {
  'color-picker': { route: '/tools/color-picker' },
  'rgb-hex-converter': { route: '/tools/rgb-hex-converter' },
  'rename-images': { route: '/tools/rename-images' },
  'batch-rename': { route: '/tools/batch-rename' },
  'live-photo-extractor': { route: '/tools/live-photo-extractor' },
  'image-comparator': { route: '/tools/image-comparator' },
};

const PDF_LIVE_BLURBS: Record<string, string> = {
  'images-to-pdf': 'Combine images into a multi-page PDF locally in your browser.',
  'pdf-to-jpg': 'Render PDF pages as JPEG images at a chosen DPI and quality.',
  'pdf-to-images': 'Render PDF pages as PNG, JPEG, or WebP files.',
  'pdf-to-text': 'Extract selectable text from PDF pages without OCR or uploads.',
  'merge-pdfs': 'Combine complete PDFs in a drag-to-reorder workflow.',
  'split-pdf': 'Split a PDF into individual pages or equal page chunks.',
  'compress-pdf': 'Reduce PDF size by rebuilding pages as compressed raster images.',
  'flatten-pdf': 'Create a visually flattened, image-only PDF for predictable viewing.',
  'fill-pdf-forms': 'Fill basic AcroForm fields from a JSON field-value map.',
  'extract-images-from-pdf': 'Extract embedded raster images without rendering whole pages.',
  'remove-blank-pages': 'Detect nearly blank pages with an adjustable visual threshold.',
};

const PDF_SOON_REASON: Record<string, string> = {
  'pdf-convert': 'Upcoming: high-fidelity Office, HTML, or EPUB conversion needs an additional local conversion engine.',
  'pdf-security': 'Upcoming: password encryption, certificate signatures, and true redaction need audited security tooling.',
  'pdf-annotations': 'Upcoming: this needs a coordinate-aware page editor and annotation round-trip support.',
  'pdf-forms': 'Upcoming: creating robust AcroForms needs a dedicated visual form designer.',
  'pdf-text': 'Upcoming: OCR requires a large language model download and careful searchable-text alignment.',
  'pdf-images': 'Upcoming: object-level image replacement is unsafe without a full PDF content-stream editor.',
  'pdf-printing': 'Upcoming: booklet and N-up imposition need a dedicated print-layout preview.',
  'pdf-utilities': 'Upcoming: reliable repair, comparison, or viewing needs specialized parsing and visual UI.',
};

for (const t of TOOLS) {
  const impl = IMPL[t.id];
  if (impl) {
    t.status = 'live';
    t.op = impl.op;
    t.mode = impl.mode;
    t.route = `/tools/${t.id}`;
  } else {
    const custom = CUSTOM[t.id];
    if (custom) {
      t.status = 'live';
      t.route = custom.route;
    }
  }
  const category = CATEGORY_BY_ID.get(t.categoryId);
  if (category?.group === 'pdf' && !t.blurb) {
    t.blurb = t.status === 'live'
      ? PDF_LIVE_BLURBS[t.id] ?? `${t.name} with local browser processing and no file upload to opentools.`
      : PDF_SOON_REASON[t.categoryId] ?? 'Upcoming local-first PDF workflow.';
  }
}

export const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));
export const LIVE_COUNT = TOOLS.filter((t) => t.status === 'live').length;
export const TOTAL_COUNT = TOOLS.length;
