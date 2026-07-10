export const HOME_FAQS = [
  {
    question: 'Are image and PDF files uploaded?',
    answer: 'No. Supported tools process selected files in the browser. Ordinary requests for website assets and privacy-safe analytics can still occur, but they do not contain the selected file.',
  },
  {
    question: 'Do the tools work on mobile devices?',
    answer: 'Yes, in modern mobile browsers. Large images, animated GIFs, or long PDFs may exceed the memory available to a phone browser sooner than on a desktop computer.',
  },
  {
    question: 'Should I delete the original after conversion?',
    answer: 'Not immediately. Open the result, verify its dimensions, pages, quality, text, and metadata, then retain or remove the original according to your own backup and retention needs.',
  },
] as const;
