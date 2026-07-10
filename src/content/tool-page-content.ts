import { CATEGORY_BY_ID, TOOLS, type Tool } from '../tools/catalog';
import { getToolContent, type ToolContent } from './tool-content';

const REVIEWED_AT = '2026-07-10';

export function getToolPageContent(tool: Tool): ToolContent {
  const authored = getToolContent(tool.id);
  if (authored) return authored;

  const category = CATEGORY_BY_ID.get(tool.categoryId);
  const isPdf = category?.group === 'pdf';
  const fileType = isPdf ? 'PDF' : 'image';
  const categoryLabel = category?.label ?? `${fileType} tools`;
  const relatedToolIds = TOOLS
    .filter((candidate) => (
      candidate.id !== tool.id
      && candidate.status === 'live'
      && candidate.route
      && candidate.categoryId === tool.categoryId
    ))
    .slice(0, 4)
    .map((candidate) => candidate.id);

  const description = tool.blurb
    ?? `Use ${tool.name} directly in your browser with local ${fileType} processing and no file upload to opentools.`;

  return {
    title: tool.name,
    description,
    intro: [
      `${tool.name} is part of the ${categoryLabel} collection. It runs in the browser so you can complete the task without installing desktop software or sending the selected files to opentools for processing.`,
      `The interactive controls above operate on the files held by the current browser tab. The result is created as a new download; the original file on your device is not overwritten.`,
    ],
    steps: [
      {
        title: `Add your ${isPdf ? 'PDF' : 'image'}`,
        description: `Choose a supported ${fileType} file from your device or drag it into the tool.`,
      },
      {
        title: 'Review the settings',
        description: 'Adjust the available options and use the preview or page visualizer when the tool provides one.',
      },
      {
        title: 'Process and download',
        description: 'Run the action, inspect the result, and download the newly generated file.',
      },
    ],
    useCases: [
      `Complete a ${tool.name.toLowerCase()} task without installing a dedicated application.`,
      `Process sensitive ${fileType} files locally instead of uploading them to an online conversion queue.`,
      `Create a separate output while keeping the original source file unchanged.`,
    ],
    limitations: [
      `Available formats and features depend on the decoding, canvas, and file APIs supported by the current browser.`,
      `Very large files can exceed the memory available to a browser tab, particularly on mobile devices.`,
      `Always inspect an important output before deleting or archiving the original file.`,
    ],
    faqs: [
      {
        question: `Are files uploaded when I use ${tool.name}?`,
        answer: 'No. The file-processing path runs in the current browser tab. Normal website hosting and privacy-respecting analytics requests may still occur, but the selected files are not uploaded to opentools.',
      },
      {
        question: 'Does the tool modify my original file?',
        answer: 'No. Browsers cannot silently overwrite the source file. The tool creates a separate result for you to download.',
      },
      {
        question: 'Can I use it on a phone or tablet?',
        answer: 'Yes in a modern browser, although large files may be limited by the device memory available to the browser tab.',
      },
    ],
    relatedToolIds,
    reviewedAt: REVIEWED_AT,
  };
}
