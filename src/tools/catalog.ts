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
  emoji: string;
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
  { id: 'convert', label: 'Convert', emoji: '🔄', icon: ArrowsLeftRight, group: 'image' },
  { id: 'resize', label: 'Resize & Crop', emoji: '📏', icon: Crop, group: 'image' },
  { id: 'compress', label: 'Compression', emoji: '🗜️', icon: FileZip, group: 'image' },
  { id: 'edit', label: 'Basic Editing', emoji: '🎨', icon: PaintBrush, group: 'image' },
  { id: 'pdf', label: 'PDF Tools', emoji: '📄', icon: FilePdf, group: 'pdf' },
  { id: 'organize', label: 'Organization', emoji: '🖼️', icon: SquaresFour, group: 'image' },
  { id: 'web', label: 'Web & Design', emoji: '📐', icon: Browser, group: 'image' },
  { id: 'metadata', label: 'Metadata', emoji: '🔍', icon: Info, group: 'image' },
  { id: 'utilities', label: 'Utilities', emoji: '✂️', icon: Wrench, group: 'image' },
  { id: 'mobile', label: 'Mobile Tasks', emoji: '📱', icon: DeviceMobile, group: 'image' },
  { id: 'gif', label: 'GIF Tools', emoji: '🎞️', icon: Gif, group: 'image' },
  { id: 'color', label: 'Color Tools', emoji: '🎨', icon: Palette, group: 'image' },
  { id: 'misc', label: 'Miscellaneous', emoji: '🔧', icon: DotsThreeCircle, group: 'image' },
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

// Commonly-used image categories surfaced directly in the nav.
export const PRIMARY_NAV_CATEGORIES = ['convert', 'resize', 'compress', 'edit'];
// Everything else in the image group lives under the "Other tools" menu.
export const OTHER_NAV_CATEGORIES = CATEGORIES.filter(
  (c) => c.group === 'image' && !PRIMARY_NAV_CATEGORIES.includes(c.id),
).map((c) => c.id);

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
  pdf: [
    ['Images to PDF'],
    ['PDF to Images'],
    ['Extract Images from PDF'],
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
  'pdf-to-images': { op: 'pdfToImages' },
  'extract-images-from-pdf': { op: 'extractImagesFromPdf' },
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

for (const t of TOOLS) {
  const impl = IMPL[t.id];
  if (impl) {
    t.status = 'live';
    t.op = impl.op;
    t.mode = impl.mode;
    t.route = `/tools/${t.id}`;
    continue;
  }
  const custom = CUSTOM[t.id];
  if (custom) {
    t.status = 'live';
    t.route = custom.route;
  }
}

export const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));
export const LIVE_COUNT = TOOLS.filter((t) => t.status === 'live').length;
export const TOTAL_COUNT = TOOLS.length;
