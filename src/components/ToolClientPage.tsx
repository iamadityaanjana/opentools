'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import { DotsThinking } from './Thinking';

const loading = () => (
  <div className="page page--tool">
    <div className="loading-panel"><DotsThinking label="Loading tool" /></div>
  </div>
);

const ToolRunner = dynamic(() => import('../screens/ToolRunner'), { loading });
const ColorPickerPage = dynamic(() => import('../screens/ColorPickerPage'), { loading });
const RgbHexPage = dynamic(() => import('../screens/RgbHexPage'), { loading });
const RenameImagesPage = dynamic(() => import('../screens/RenameImagesPage'), { loading });
const BatchRenamePage = dynamic(() => import('../screens/BatchRenamePage'), { loading });
const LivePhotoPage = dynamic(() => import('../screens/LivePhotoPage'), { loading });
const ImageComparatorPage = dynamic(() => import('../screens/ImageComparatorPage'), { loading });

const CUSTOM_PAGES: Record<string, ComponentType<{ children?: ReactNode }>> = {
  'color-picker': ColorPickerPage,
  'rgb-hex-converter': RgbHexPage,
  'rename-images': RenameImagesPage,
  'batch-rename': BatchRenamePage,
  'live-photo-extractor': LivePhotoPage,
  'image-comparator': ImageComparatorPage,
};

export function ToolClientPage({ toolId, children }: { toolId: string; children?: ReactNode }) {
  const CustomPage = CUSTOM_PAGES[toolId];
  if (CustomPage) return <CustomPage>{children}</CustomPage>;
  return <ToolRunner toolId={toolId}>{children}</ToolRunner>;
}
