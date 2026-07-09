// Central catalog of every tool the toolbox offers (built or planned).
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
  type Icon,
} from '@phosphor-icons/react';

export type ToolStatus = 'live' | 'soon';

export interface ToolCategory {
  id: string;
  label: string;
  emoji: string;
  icon: Icon;
}

export interface Tool {
  id: string;
  name: string;
  categoryId: string;
  status: ToolStatus;
  route?: string;
  blurb?: string;
}

export const CATEGORIES: ToolCategory[] = [
  { id: 'convert', label: 'Convert', emoji: '🔄', icon: ArrowsLeftRight },
  { id: 'resize', label: 'Resize & Crop', emoji: '📏', icon: Crop },
  { id: 'compress', label: 'Compression', emoji: '🗜️', icon: FileZip },
  { id: 'edit', label: 'Basic Editing', emoji: '🎨', icon: PaintBrush },
  { id: 'pdf', label: 'PDF Tools', emoji: '📄', icon: FilePdf },
  { id: 'organize', label: 'Organization', emoji: '🖼️', icon: SquaresFour },
  { id: 'web', label: 'Web & Design', emoji: '📐', icon: Browser },
  { id: 'metadata', label: 'Metadata', emoji: '🔍', icon: Info },
  { id: 'utilities', label: 'Utilities', emoji: '✂️', icon: Wrench },
  { id: 'mobile', label: 'Mobile Tasks', emoji: '📱', icon: DeviceMobile },
  { id: 'gif', label: 'GIF Tools', emoji: '🎞️', icon: Gif },
  { id: 'color', label: 'Color Tools', emoji: '🎨', icon: Palette },
  { id: 'misc', label: 'Miscellaneous', emoji: '🔧', icon: DotsThreeCircle },
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

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
    ['Remove Watermark (manual)'],
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

export const LIVE_COUNT = TOOLS.filter((t) => t.status === 'live').length;
export const TOTAL_COUNT = TOOLS.length;
