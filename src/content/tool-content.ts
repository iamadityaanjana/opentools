export interface ToolContentStep {
  readonly title: string;
  readonly description: string;
}

export interface ToolContentFaq {
  readonly question: string;
  readonly answer: string;
}

export interface ToolContent {
  readonly title: string;
  /** Optional override for the HTML <title> tag. Falls back to toolTitle(). */
  readonly seoTitle?: string;
  readonly description: string;
  readonly intro: readonly string[];
  readonly steps: readonly ToolContentStep[];
  readonly useCases: readonly string[];
  readonly limitations: readonly string[];
  readonly faqs: readonly ToolContentFaq[];
  readonly relatedToolIds: readonly string[];
  readonly reviewedAt: string;
  readonly supportedFormats?: readonly string[];
}

export const TOOL_CONTENT = {
  'image-converter': {
    title: 'Image Converter',
    description:
      'Convert one or more images to a practical raster, document, icon, or web format directly in your browser.',
    intro: [
      'The Image Converter decodes each source into pixels and creates a new file in the format you choose. It can handle everyday formats such as JPEG, PNG, WebP, GIF, BMP, and TIFF, plus HEIC and AVIF through browser-side codecs.',
      'Processing happens locally in the browser; the image files are not uploaded for conversion. Because decoded pixels and output buffers use device memory, very large photos, many simultaneous files, or codec-heavy formats can exceed the memory available to a browser tab.',
    ],
    steps: [
      {
        title: 'Add your images',
        description:
          'Drop files into the converter or choose them from your device. Unsupported or browser-dependent inputs are reported per file.',
      },
      {
        title: 'Choose an output',
        description:
          'Select the target format and, for lossy outputs, set a quality level appropriate for the image.',
      },
      {
        title: 'Convert and inspect',
        description:
          'Run the conversion, open a representative result to check colour and detail, then download individual files or all completed results.',
      },
    ],
    useCases: [
      'Create broadly compatible JPEG copies of HEIC photos.',
      'Prepare WebP or AVIF assets for a website while keeping the original dimensions.',
      'Turn a raster image into a single-page PDF or a PNG-backed SVG wrapper.',
    ],
    limitations: [
      'Conversion rasterizes the source. SVG output contains an embedded raster image, and GIF output is a single static frame rather than an animation.',
      'JPEG 2000 decoding depends on browser support; camera RAW, PSD, EPS, AI, and similar project formats are not decoded.',
      'A quality setting is encoder-specific and does not guarantee a target file size. Complex or already optimized images can become larger.',
    ],
    faqs: [
      {
        question: 'Does conversion change the image dimensions?',
        answer:
          'Normally no. The converter preserves the decoded pixel width and height, except ICO output is reduced when necessary to fit its 256-pixel maximum dimension.',
      },
      {
        question: 'Will transparency survive?',
        answer:
          'Only when the selected output supports it. PNG, WebP, AVIF, GIF, TIFF, and the raster image embedded in SVG can represent transparency; JPEG and PDF conversion do not preserve an alpha channel.',
      },
      {
        question: 'Are my files sent to a server?',
        answer:
          'No. Decoding and encoding run in the current browser tab. Normal website hosting and analytics traffic may still occur, but the conversion path does not upload the image files.',
      },
      {
        question: 'AVIF vs PNG — which should I use?',
        answer:
          'Use AVIF for web images where file size matters and browser compatibility is modern (Chrome, Firefox, Safari 16+). AVIF achieves 50–70% smaller files than PNG at similar visual quality. Use PNG when you need perfect lossless reproduction, wide software compatibility, or transparency support in older tools. For photographs on a website, AVIF or WebP are better choices; for icons, logos, or images that need to open in any application, PNG is safer.',
      },
      {
        question: 'AVIF vs WebP — what is the difference?',
        answer:
          'AVIF generally produces smaller files than WebP at the same visual quality, especially for complex photographs. WebP has slightly broader compatibility (supported since 2020 in all major browsers). Both support transparency and animation. Use AVIF for maximum compression; use WebP for better compatibility with slightly older browser versions.',
      },
    ],
    relatedToolIds: [
      'heic-to-jpg',
      'resize-image',
      'compress-jpg',
      'compress-png',
      'compress-webp',
    ],
    reviewedAt: '2026-07-10',
    supportedFormats: [
      'JPEG',
      'PNG',
      'WebP',
      'AVIF',
      'GIF',
      'BMP',
      'TIFF',
      'HEIC/HEIF (input only)',
      'SVG',
      'PDF (output only)',
      'ICO',
      'TGA (output only)',
      'PPM/PGM/PBM (output only)',
      'JPEG 2000 (browser-dependent input)',
    ],
  },

  'heic-to-jpg': {
    title: 'HEIC to JPG',
    description:
      'Create a compatible JPEG copy of an HEIC or HEIF photo with adjustable JPEG quality, without uploading the source.',
    intro: [
      'HEIC is efficient for storage but is not accepted by every form, editor, or older device. This tool decodes the primary image in the HEIC or HEIF file and encodes its rendered pixels as JPEG.',
      'The work is performed locally with a browser-side decoder. High-resolution phone photos can require much more working memory than their compressed file size suggests, so processing a smaller batch is safer on memory-constrained phones and tablets.',
    ],
    steps: [
      {
        title: 'Select the HEIC photo',
        description:
          'Add one or more .heic or .heif files from your device.',
      },
      {
        title: 'Set JPEG quality',
        description:
          'Choose a value from 10% to 100%. Start high, then lower it only when a smaller file matters more than fine detail.',
      },
      {
        title: 'Convert and verify',
        description:
          'Download the JPG and check detail, colour, orientation, and dimensions before deleting or archiving the original.',
      },
    ],
    useCases: [
      'Upload an iPhone photo to a service that accepts JPEG but not HEIC.',
      'Share a photo with software or devices that lack HEIC support.',
      'Create a convenient viewing copy while retaining the HEIC original as the master.',
    ],
    limitations: [
      'JPEG is lossy and cannot store transparency. It also cannot preserve every HEIC feature, such as depth data, auxiliary images, image sequences, or HDR behaviour.',
      'The output is a newly encoded rendered image, not a lossless container change, and source metadata is not copied through the pixel conversion.',
      'Some unusual or damaged HEIC variants may not decode. Large images may fail if the browser cannot allocate enough memory.',
    ],
    faqs: [
      {
        question: 'Does renaming .heic to .jpg work?',
        answer:
          'No. HEIC and JPEG use different encodings. A real conversion must decode the HEIC image and create new JPEG bytes.',
      },
      {
        question: 'What quality should I choose?',
        answer:
          'There is no universal best value. The default 90% is a sensible starting point; inspect fine textures, text, faces, and gradients, then adjust based on the intended use.',
      },
      {
        question: 'Should I keep the HEIC original?',
        answer:
          'Yes when image quality, metadata, HDR information, or future editing matters. The JPG is best treated as a compatibility copy.',
      },
    ],
    relatedToolIds: [
      'image-converter',
      'compress-jpg',
      'remove-exif-metadata',
      'resize-image',
    ],
    reviewedAt: '2026-07-10',
    supportedFormats: ['HEIC/HEIF input', 'JPEG output'],
  },

  'resize-image': {
    title: 'Resize Image',
    description:
      'Change image dimensions in pixels or by percentage, with an option to preserve the original aspect ratio.',
    intro: [
      'Resizing changes the number of pixels in an image. This tool can fit an image inside a width-and-height box or scale it by a percentage, and it uses high-quality browser canvas resampling.',
      'The full-resolution image is decoded and resized on your device. The browser blocks pathological outputs above 16,384 pixels on one side or roughly 100 megapixels, while lower-memory devices may reach their practical limit earlier.',
    ],
    steps: [
      {
        title: 'Add an image',
        description:
          'Choose a supported image and wait for its original dimensions to appear.',
      },
      {
        title: 'Enter the new size',
        description:
          'Resize by pixels or percentage. Keep aspect ratio enabled to avoid stretching.',
      },
      {
        title: 'Review and export',
        description:
          'Check the preview, resize the full-resolution source, and download the resulting PNG.',
      },
    ],
    useCases: [
      'Reduce camera photos to practical dimensions before email or upload.',
      'Create a smaller copy for documentation, a profile, or a presentation.',
      'Scale an asset proportionally without calculating the second dimension.',
    ],
    limitations: [
      'Upscaling creates more pixels but cannot restore detail that was not present in the source.',
      'With aspect ratio enabled, pixel dimensions define a bounding box; one resulting dimension may be smaller than the entered value.',
      'The current tool exports PNG, which may be larger than JPEG or WebP for photographs.',
    ],
    faqs: [
      {
        question: 'What does “keep aspect ratio” do?',
        answer:
          'It keeps the width-to-height proportion of the source, preventing geometric stretching. In pixel mode, the image is fitted inside the requested width and height.',
      },
      {
        question: 'Does resizing reduce file size?',
        answer:
          'Fewer pixels often help, but file size also depends on format and image content. Since this tool exports PNG, a resized photo is not guaranteed to be smaller than its JPEG source.',
      },
      {
        question: 'Why can a very large resize fail?',
        answer:
          'Browsers need memory for decoded RGBA pixels, canvases, previews, and encoded output. These allocations can be several times larger than the compressed source file.',
      },
    ],
    relatedToolIds: ['crop-image', 'image-converter', 'compress-jpg', 'compress-png'],
    reviewedAt: '2026-07-10',
    supportedFormats: [
      'JPEG',
      'PNG',
      'WebP',
      'AVIF',
      'GIF (static frame)',
      'BMP',
      'TIFF',
      'HEIC/HEIF',
      'SVG (rasterized)',
      'ICO',
      'JPEG 2000 (browser-dependent)',
    ],
  },

  'crop-image': {
    title: 'Crop Image',
    description:
      'Keep a selected rectangular area of an image using a visual crop box or exact pixel coordinates.',
    intro: [
      'Cropping removes pixels outside the selected rectangle without stretching the area that remains. You can drag the on-image selection or enter its left, top, width, and height values for a precise result.',
      'Selection, preview, and full-resolution export run in the browser. Very large source images still need to be decoded into memory even when the final crop is small, which can be demanding on mobile devices.',
    ],
    steps: [
      {
        title: 'Open the source',
        description:
          'Add an image and let the tool initialize a crop region inside its boundaries.',
      },
      {
        title: 'Define the rectangle',
        description:
          'Drag the crop handles or enter exact pixel values for the left edge, top edge, width, and height.',
      },
      {
        title: 'Crop and download',
        description:
          'Confirm the selected area in the preview, process the original-resolution image, and save the PNG result.',
      },
    ],
    useCases: [
      'Remove unwanted edges or empty space from a screenshot.',
      'Extract a rectangular detail from a larger photograph.',
      'Match a known pixel region for documentation or UI assets.',
    ],
    limitations: [
      'The crop is rectangular; it does not perform perspective correction, subject cutout, or freehand masking.',
      'Coordinates must remain inside the source image, and the crop width and height must each be at least one pixel.',
      'The result is exported as PNG rather than preserving the source encoding or metadata.',
    ],
    faqs: [
      {
        question: 'Does cropping lower quality?',
        answer:
          'The selected pixels are copied without scaling, but the result is newly encoded as PNG. It does not add JPEG loss, though source metadata is not retained.',
      },
      {
        question: 'Are the coordinates measured from the preview?',
        answer:
          'The displayed controls represent full-resolution source pixels. The visual editor maps the preview selection back to those original dimensions.',
      },
      {
        question: 'Can I crop to a circle?',
        answer:
          'No. This tool creates a rectangular crop. A circular appearance would require a separate mask or transparent-corner operation.',
      },
    ],
    relatedToolIds: ['resize-image', 'image-converter', 'screenshot-cropper'],
    reviewedAt: '2026-07-10',
    supportedFormats: [
      'JPEG',
      'PNG',
      'WebP',
      'AVIF',
      'GIF (static frame)',
      'BMP',
      'TIFF',
      'HEIC/HEIF',
      'SVG (rasterized)',
      'ICO',
      'JPEG 2000 (browser-dependent)',
    ],
  },

  'compress-jpg': {
    title: 'Compress JPG',
    description:
      'Re-encode JPEG images at a chosen quality, or select another web-friendly output format, using local browser processing.',
    intro: [
      'JPEG compression trades some image detail for a smaller representation. The quality control ranges from 10% to 100%, but its value is an encoder setting rather than a promise of a particular file size.',
      'Images are decoded and encoded in the current browser tab. Large batches can consume substantial memory because compressed JPEG bytes expand to full RGBA pixel buffers while being processed.',
    ],
    steps: [
      {
        title: 'Add the JPG files',
        description:
          'Choose one or more JPEG images. Other supported image inputs can also be processed if you intentionally want to change formats.',
      },
      {
        title: 'Choose format and quality',
        description:
          'Keep the original format to produce JPEG from a JPEG source, or choose JPEG, PNG, WebP, or AVIF explicitly. Set the quality for lossy output.',
      },
      {
        title: 'Compare the results',
        description:
          'Compress, inspect fine detail at normal size and 100%, and compare the output size before downloading.',
      },
    ],
    useCases: [
      'Reduce a photograph before attaching it to email or submitting a form.',
      'Create a lower-bandwidth copy of a large JPEG while retaining its pixel dimensions.',
      'Test JPEG against WebP or AVIF for a web image.',
    ],
    limitations: [
      'Repeated JPEG re-encoding accumulates loss; return to the best available original for each new export.',
      'A high quality value can produce a file close to or larger than an already optimized source.',
      'Compression does not resize dimensions, and source metadata is not copied into the re-encoded output.',
    ],
    faqs: [
      {
        question: 'Does 100% quality mean lossless JPEG?',
        answer:
          'No. Standard JPEG encoding remains lossy at the highest setting, and the number is not comparable across all encoders.',
      },
      {
        question: 'How do I hit an exact upload limit?',
        answer:
          'The tool does not target an exact byte size. Try a representative quality, check the resulting size, and adjust; resizing first may be more effective when dimensions are unnecessarily large.',
      },
      {
        question: 'Will compression remove EXIF information?',
        answer:
          'The implementation decodes the image to pixels and creates a new file without copying the source EXIF, IPTC, or XMP blocks. Use a metadata viewer if the absence of a specific field is important.',
      },
    ],
    relatedToolIds: [
      'resize-image',
      'image-converter',
      'compress-webp',
      'batch-compress-images',
      'remove-exif-metadata',
    ],
    reviewedAt: '2026-07-10',
    supportedFormats: ['JPEG', 'PNG', 'WebP', 'AVIF'],
  },

  'compress-png': {
    title: 'Compress PNG',
    description:
      'Re-encode PNG pixels locally, or convert them to a lossy format when a substantial size reduction matters more than lossless storage.',
    intro: [
      'PNG is lossless, so re-encoding the same pixels does not use the quality slider and may not make an already optimized PNG smaller. The meaningful choice is often whether the image must remain lossless and transparent or can be exported as JPEG, WebP, or AVIF.',
      'The tool performs the pixel round trip in your browser and does not upload the image for processing. Large transparent images can be memory-intensive because every decoded pixel uses four colour-channel bytes before canvas and output overhead.',
    ],
    steps: [
      {
        title: 'Add PNG images',
        description:
          'Choose the files and identify which ones require transparency or pixel-exact preservation.',
      },
      {
        title: 'Select the output',
        description:
          'Keep PNG for lossless pixels, or choose WebP, AVIF, or JPEG when their trade-offs suit the destination.',
      },
      {
        title: 'Check size and appearance',
        description:
          'Process the images and verify transparency, text edges, gradients, and output size before replacing any source file.',
      },
    ],
    useCases: [
      'Re-encode a PNG while discarding attached source metadata.',
      'Convert a photographic PNG to WebP, AVIF, or JPEG to reduce transfer size.',
      'Keep a screenshot lossless when crisp text and interface edges matter.',
    ],
    limitations: [
      'The quality control does not affect PNG output because the PNG encoder is lossless.',
      'JPEG output cannot preserve transparency; transparent areas may not produce the background appearance you expect.',
      'Re-encoding is not a specialized PNG palette optimizer and can produce little savings or even a larger file.',
    ],
    faqs: [
      {
        question: 'Why did my PNG not get smaller?',
        answer:
          'It may already be efficiently compressed, and this tool preserves full RGBA pixels rather than quantizing the image to a smaller indexed palette.',
      },
      {
        question: 'Which output keeps transparency?',
        answer:
          'PNG, WebP, and AVIF support alpha transparency. JPEG does not.',
      },
      {
        question: 'Should screenshots use PNG or JPEG?',
        answer:
          'PNG usually keeps text and sharp interface edges cleaner. JPEG can be useful for photo-heavy screenshots when a smaller file matters and some artefacts are acceptable.',
      },
    ],
    relatedToolIds: [
      'image-converter',
      'compress-webp',
      'batch-compress-images',
      'remove-exif-metadata',
    ],
    reviewedAt: '2026-07-10',
    supportedFormats: ['PNG', 'JPEG', 'WebP', 'AVIF'],
  },

  'compress-webp': {
    title: 'Compress WebP',
    description:
      'Re-encode WebP images with adjustable quality or convert them to JPEG, PNG, or AVIF in the browser.',
    intro: [
      'WebP can represent lossy images and transparency. This tool decodes the source to pixels, then uses the selected output format and quality setting to create a new file.',
      'All image processing stays on the device. Browser codec behaviour can differ slightly across platforms, and a large number of high-resolution images can exhaust the memory available to the tab.',
    ],
    steps: [
      {
        title: 'Add WebP files',
        description:
          'Select one or more images and keep the originals available for comparison.',
      },
      {
        title: 'Tune the output',
        description:
          'Keep WebP or select JPEG, PNG, or AVIF, then choose a quality level for a lossy target.',
      },
      {
        title: 'Inspect before saving',
        description:
          'Compare detail, transparency, colour, and file size, then download the preferred outputs.',
      },
    ],
    useCases: [
      'Lower the quality of an oversized WebP photograph for web delivery.',
      'Convert WebP to JPEG for a system that does not accept WebP.',
      'Compare a WebP asset with an AVIF version using the same source pixels.',
    ],
    limitations: [
      'Re-encoding an already compressed WebP can introduce additional artefacts without producing a smaller file.',
      'The quality value is not a direct measure of visual quality or output bytes and may vary with browser encoding behaviour.',
      'Animated WebP is not preserved as animation by this pixel-based workflow.',
    ],
    faqs: [
      {
        question: 'Will a lower quality always make a smaller file?',
        answer:
          'Usually for the same lossy format, but not as an absolute rule across different encoders or tiny files. Always check the generated result.',
      },
      {
        question: 'Can WebP preserve transparent pixels?',
        answer:
          'Yes. WebP supports alpha transparency, though you should inspect edge pixels after any lossy re-encode.',
      },
      {
        question: 'Does this change image dimensions?',
        answer:
          'No. This compression operation keeps the decoded width and height. Use Resize Image first when pixel dimensions can be reduced.',
      },
    ],
    relatedToolIds: [
      'resize-image',
      'image-converter',
      'compress-jpg',
      'compress-png',
      'batch-compress-images',
    ],
    reviewedAt: '2026-07-10',
    supportedFormats: ['WebP', 'JPEG', 'PNG', 'AVIF'],
  },

  'batch-compress-images': {
    title: 'Batch Compress Images',
    description:
      'Apply one output-format and quality workflow to multiple images while keeping each result as a separate file.',
    intro: [
      'Batch compression is useful when a group of images needs consistent handling. Each file is decoded, re-encoded, and reported independently, so one failed image does not erase completed results.',
      'The batch runs in the browser rather than on an upload server. Files and previews remain allocated while they are listed, so smaller batches are more reliable on phones or devices with limited memory.',
    ],
    steps: [
      {
        title: 'Build the batch',
        description:
          'Add the images you want to process and remove any file that should use different settings.',
      },
      {
        title: 'Choose shared settings',
        description:
          'Select keep-original, JPEG, PNG, WebP, or AVIF and set the quality used for lossy outputs.',
      },
      {
        title: 'Process and sample',
        description:
          'Run the batch, inspect several difficult images, and download completed results individually or with the All action.',
      },
    ],
    useCases: [
      'Prepare a set of product photographs with one consistent JPEG quality.',
      'Convert a folder-sized selection of web images to WebP or AVIF.',
      'Re-encode several share copies without sending the source files to a processing service.',
    ],
    limitations: [
      'The All action triggers separate file downloads; it does not package the results into a ZIP archive.',
      'One quality setting may not suit every image, especially a mixture of photographs, screenshots, transparency, and line art.',
      'The tool does not resize dimensions. Large batches can pressure browser memory even though files are processed one at a time.',
    ],
    faqs: [
      {
        question: 'What does “keep original format” mean?',
        answer:
          'JPEG, PNG, WebP, and AVIF inputs are re-encoded to the same format. Other decodable inputs fall back to JPEG because their original formats are not available through this compression output control.',
      },
      {
        question: 'Can I use a different quality for each image?',
        answer:
          'The runner stores controls per image for non-combine operations, so you can select a file and adjust it independently before processing. Test the workflow if strict batch consistency is required.',
      },
      {
        question: 'Why should I test a few images first?',
        answer:
          'Compression responds to content. Fine texture, gradients, text, and transparency can reveal different problems at the same setting.',
      },
    ],
    relatedToolIds: [
      'compress-jpg',
      'compress-png',
      'compress-webp',
      'resize-image',
      'image-converter',
    ],
    reviewedAt: '2026-07-10',
    supportedFormats: ['JPEG', 'PNG', 'WebP', 'AVIF'],
  },

  'images-to-pdf': {
    title: 'Images to PDF',
    description:
      'Combine multiple images into one PDF with one image per page, using image-sized pages or A4 portrait pages.',
    intro: [
      'This tool creates a single PDF in the order shown. Each image can define its own page dimensions, or it can be proportionally fitted and centred on an A4 portrait page.',
      'PDF assembly happens locally in the browser. Every source is decoded and converted to JPEG data for embedding, so many high-resolution pages can require substantial memory and produce a large output.',
    ],
    steps: [
      {
        title: 'Add and order images',
        description:
          'Choose the images, then arrange them in the sequence they should appear in the PDF.',
      },
      {
        title: 'Choose the page style',
        description:
          'Use one page sized to each image or place every image proportionally on an A4 portrait page.',
      },
      {
        title: 'Create the document',
        description:
          'Generate the PDF locally, download it, and review page order, orientation, margins, and readability.',
      },
    ],
    useCases: [
      'Combine scanned pages or photographed notes into one shareable document.',
      'Package a sequence of reference images in a fixed order.',
      'Place mixed-size images onto consistent A4 portrait pages.',
    ],
    limitations: [
      'The PDF contains raster images; it does not perform OCR, create searchable text, or preserve vector source data.',
      'Images are embedded as JPEG at a fixed high-quality setting, so transparency and lossless source pixels are not preserved.',
      'There are no controls for page margins, captions, passwords, PDF metadata, or compression quality.',
    ],
    faqs: [
      {
        question: 'Does each image become a separate page?',
        answer:
          'Yes. The tool creates one PDF page for each input image.',
      },
      {
        question: 'What is the difference between the page options?',
        answer:
          'Image-sized pages match each source image and its orientation. A4 uses portrait A4 pages and fits each image inside the page without changing its aspect ratio.',
      },
      {
        question: 'Are images uploaded while the PDF is built?',
        answer:
          'No. Decoding and PDF generation run in the browser. Device memory and browser limits therefore determine how large a document can be built reliably.',
      },
    ],
    relatedToolIds: ['pdf-to-images', 'image-converter', 'compress-jpg', 'resize-image'],
    reviewedAt: '2026-07-10',
    supportedFormats: [
      'JPEG',
      'PNG',
      'WebP',
      'AVIF',
      'GIF (static frame)',
      'BMP',
      'TIFF',
      'HEIC/HEIF',
      'SVG (rasterized)',
      'ICO',
      'JPEG 2000 (browser-dependent)',
      'PDF output',
    ],
  },

  'pdf-to-images': {
    title: 'PDF to Images',
    description:
      'Render selected PDF pages as PNG, JPEG, or WebP images at a chosen resolution.',
    intro: [
      'PDF pages can contain text, vectors, and images, but this tool renders each selected page into a flat raster image. You can choose a page range, an output format, and a resolution from 72 to 300 DPI.',
      'The PDF parser and renderer run locally with a bundled browser worker. Higher DPI, long documents, and image-heavy pages increase both processing time and memory use; a 300 DPI page can require several times the memory of the same page at 150 DPI.',
    ],
    steps: [
      {
        title: 'Choose a PDF',
        description:
          'Add the document from your device. Protected, damaged, or unsupported PDFs may fail to open.',
      },
      {
        title: 'Select pages and output',
        description:
          'Enter a range such as “1-3, 5”, then choose PNG, JPEG, or WebP, quality where applicable, and a DPI value.',
      },
      {
        title: 'Render and download',
        description:
          'Convert the pages. A single result downloads as an image; multiple pages are returned in a ZIP file with page-numbered names.',
      },
    ],
    useCases: [
      'Create PNG page images for slides, annotations, or previews.',
      'Export selected PDF pages as JPEG or WebP for a web workflow.',
      'Render a document at a specific DPI before using an image-only system.',
    ],
    limitations: [
      'Rendered pages are not editable text or vectors, and this tool does not perform OCR.',
      'Increasing DPI raises pixel dimensions and memory use; it cannot reveal detail beyond what the PDF content contains.',
      'Password-protected, malformed, or unusually complex PDFs may not render successfully in the browser.',
    ],
    faqs: [
      {
        question: 'How do page ranges work?',
        answer:
          'Use page numbers and inclusive ranges separated by commas, such as “1-3, 5”. Leave the field blank to render all pages.',
      },
      {
        question: 'Which format should I choose?',
        answer:
          'PNG is lossless and suits text or diagrams. JPEG and WebP can be smaller for photographic pages and use the selected quality setting.',
      },
      {
        question: 'Why does 300 DPI take much more memory?',
        answer:
          'Doubling both width and height creates about four times as many pixels. The renderer and encoder may hold multiple full RGBA buffers while producing the output.',
      },
    ],
    relatedToolIds: ['images-to-pdf', 'extract-images-from-pdf', 'compress-png', 'compress-jpg'],
    reviewedAt: '2026-07-10',
    supportedFormats: ['PDF input', 'PNG output', 'JPEG output', 'WebP output', 'ZIP for multiple pages'],
  },

  'remove-exif-metadata': {
    title: 'Remove Metadata from Pictures',
    seoTitle: 'Remove Metadata from Pictures Free Online – No Upload | opentools',
    description:
      'Remove EXIF, GPS, and all hidden metadata from pictures instantly in your browser. No upload, no account. Supports JPG, PNG, WebP, HEIC, and more.',
    intro: [
      'Every photo taken on a smartphone or camera carries hidden data inside the file — GPS coordinates, camera model, lens settings, shooting date, and sometimes the photographer\'s name. This tool strips all of that metadata from pictures entirely in your browser, producing a clean image with no attached location or device information.',
      'The removal works by decoding your image to raw pixels and encoding a fresh output file — no metadata fields survive that round-trip. The visual content is identical, but the output JPG, PNG, WebP, or AVIF contains no EXIF, IPTC, or XMP blocks. Use the View EXIF Data tool to verify the result.',
      'No file is uploaded. Re-encoding happens locally using native browser APIs, so your GPS location, face thumbnails, and camera fingerprint never leave your device.',
    ],
    steps: [
      {
        title: 'Back up the original',
        description: 'Save the original elsewhere first if capture date, camera settings, copyright, or GPS coordinates may be needed later.',
      },
      {
        title: 'Upload and choose output format',
        description: 'Drop the image into the tool. Select the output format — keep the original format, or choose JPEG, PNG, WebP, or AVIF.',
      },
      {
        title: 'Remove metadata and download',
        description: 'Click Remove Metadata. Download the clean file and verify with the View EXIF Data tool to confirm all fields are gone.',
      },
    ],
    useCases: [
      'Strip GPS coordinates before posting a photo publicly so your home or workplace location is not exposed.',
      'Remove camera model and serial number before submitting photos to a contest or publication.',
      'Clean metadata from pictures before sharing via email or messaging apps that do not strip it automatically.',
      'Remove editing-software signatures (Lightroom, Photoshop) from images before publishing.',
    ],
    limitations: [
      'Removes all metadata at once — you cannot selectively keep individual fields like copyright while removing GPS.',
      'Removing metadata does not remove visible information inside the pixels, such as faces, location names, or text visible in the photo.',
      'JPEG output re-encodes at the selected quality setting, which can marginally affect file size even though the visual result looks identical.',
    ],
    faqs: [
      {
        question: 'How do I remove metadata from pictures for free?',
        answer: 'Drop your image into this tool, choose an output format, and click Remove Metadata. The clean file downloads immediately — no account or upload required.',
      },
      {
        question: 'Does this remove GPS location from photos?',
        answer: 'Yes. GPS coordinates stored in EXIF are completely stripped from the output. Verify with the View EXIF Data tool if privacy is critical.',
      },
      {
        question: 'Are my pictures uploaded to remove metadata?',
        answer: 'No. All processing runs in your browser. Your images never leave your device — especially important when the metadata itself contains private location or identity data.',
      },
      {
        question: 'What metadata is removed?',
        answer: 'All EXIF, IPTC, and XMP blocks — including GPS coordinates, camera model, shooting date, lens data, colour profiles, copyright notices, and editing software signatures.',
      },
      {
        question: 'Does removing metadata change image quality?',
        answer: 'For PNG, WebP, and AVIF outputs the pixel data is losslessly preserved. For JPEG, the re-encoding applies the chosen quality setting, which is visually indistinguishable at 85% or above.',
      },
    ],
    relatedToolIds: ['view-exif-data', 'image-converter', 'compress-jpg', 'compress-png', 'resize-image', 'rotate-image'],
    reviewedAt: '2026-07-12',
    supportedFormats: [
      'JPEG',
      'PNG',
      'WebP',
      'AVIF',
      'GIF (static input)',
      'BMP',
      'TIFF',
      'HEIC/HEIF',
      'SVG (rasterized input)',
      'ICO',
      'JPEG 2000 (browser-dependent input)',
    ],
  },

  'gif-optimizer': {
    title: 'GIF Optimizer',
    description:
      'Re-encode an animated GIF with fewer colours, smaller dimensions, fewer frames, or optional dithering.',
    intro: [
      'Animated GIF size is influenced by dimensions, frame count, colour complexity, and frame content. This optimizer can cap the palette between 2 and 256 colours, scale dimensions from 20% to 100%, and keep every frame, every second frame, or every third frame.',
      'GIF decoding and encoding are local to the browser. The decoder holds full composited RGBA frames, so memory use grows with width × height × frame count and can greatly exceed the compressed GIF size.',
    ],
    steps: [
      {
        title: 'Add an animated GIF',
        description:
          'Choose the source and review the decoded frame strip and timing before changing settings.',
      },
      {
        title: 'Reduce carefully',
        description:
          'Lower the colour cap or scale first. Use frame reduction only when the animation still looks acceptable, and enable dithering if gradients band badly.',
      },
      {
        title: 'Optimize and replay',
        description:
          'Create the new GIF, compare motion, transparency, colour, dimensions, and file size, then download the result.',
      },
    ],
    useCases: [
      'Reduce the dimensions of a reaction GIF for a chat or forum limit.',
      'Lower palette complexity in a simple screen recording or pixel-art animation.',
      'Reduce frame density while preserving the overall animation duration.',
    ],
    limitations: [
      'Optimization is not guaranteed to reduce every GIF. A source that is already well optimized can become larger after re-encoding.',
      'Dropping frames preserves total timing by folding skipped delays into retained frames, but motion becomes less smooth.',
      'Large dimensions or many frames can exhaust browser memory, especially on mobile devices; process a smaller or shorter source when that happens.',
    ],
    faqs: [
      {
        question: 'Does frame reduction make the GIF play faster?',
        answer:
          'The implementation carries skipped-frame delays into retained frames, preserving the overall duration. The motion can still look more abrupt because fewer visual states remain.',
      },
      {
        question: 'What does dithering do?',
        answer:
          'Dithering uses pixel patterns to approximate colours outside the reduced palette. It can soften banding but may add visible grain and can affect file size.',
      },
      {
        question: 'Is the loop setting preserved?',
        answer:
          'Yes. The optimizer reads the GIF loop count and passes it to the new animated GIF encoder.',
      },
    ],
    relatedToolIds: ['gif-resizer', 'gif-to-images', 'images-to-gif', 'image-converter'],
    reviewedAt: '2026-07-10',
    supportedFormats: ['Animated or single-frame GIF input', 'Animated GIF output'],
  },
  // ─── GSC-query-targeted tool content ──────────────────────────────────────

  'add-text': {
    title: 'Add Text to Image',
    seoTitle: 'Add Text to Image Free Online – No Upload, Any Font | opentools',
    description:
      'Add text to photos and images in your browser. Choose font, size, color, and position. Drag to place anywhere. Free, no upload, works with JPG, PNG, WebP.',
    intro: [
      'Add Text to Image lets you type any caption, label, quote, or annotation directly onto a photo or graphic and position it exactly where you want by dragging it on the live canvas. There is no server involved — your image is loaded and rendered entirely inside the browser tab.',
      'Choose the font family, size, color, opacity, and alignment. The text is composited onto the image at full resolution when you click Apply, and you download the final image in JPG, PNG, or WebP format. The original file on your device is unchanged.',
      'Common uses include adding captions to social media photos, labelling product images, creating meme-style overlays, and adding copyright notices to photos before publishing online.',
    ],
    steps: [
      {
        title: 'Upload your image',
        description: 'Drop a JPG, PNG, or WebP image into the tool. A live preview canvas appears with your image.',
      },
      {
        title: 'Type and style your text',
        description: 'Enter the text, choose font, size, color, and opacity. Drag the text overlay to position it anywhere on the image — not just preset anchor points.',
      },
      {
        title: 'Apply and download',
        description: 'Click Apply Text to flatten the text into the image pixels at full resolution. Download the result in your preferred format.',
      },
    ],
    useCases: [
      'Add a caption or quote overlay to a photo for Instagram, Twitter, or Facebook.',
      'Label a product or diagram image with annotations before publishing to a website.',
      'Create a meme or reaction image with a text overlay.',
      'Add a "Photo by [name]" credit to a photo before sharing publicly.',
    ],
    limitations: [
      'Once applied and downloaded, the text is embedded in the pixel data and cannot be edited without the original image.',
      'Custom font uploads are not supported — choose from the available system and web font options.',
      'Very large images combined with complex text may be slow to render on mobile devices.',
    ],
    faqs: [
      {
        question: 'How do I add text to an image for free?',
        answer: 'Upload your image, type your text, drag it to the position you want, and click Apply. The download is free with no watermark and no account required.',
      },
      {
        question: 'Can I drag the text to any position?',
        answer: 'Yes. The text overlay is fully draggable on the preview canvas — click and drag it to place it exactly where you want on the image.',
      },
      {
        question: 'Is my image uploaded when I add text?',
        answer: 'No. The entire text compositing process runs in your browser using the Canvas API. Your image never leaves your device.',
      },
      {
        question: 'What font options are available?',
        answer: 'A selection of common system and Google Fonts is available. You can choose family, size, weight, color, and opacity.',
      },
    ],
    relatedToolIds: ['watermark-image', 'add-watermark', 'crop-image', 'resize-image', 'compress-jpg', 'image-converter'],
    reviewedAt: '2026-07-12',
    supportedFormats: ['JPEG', 'PNG', 'WebP'],
  },

  'rename-images': {
    title: 'Rename Images',
    seoTitle: 'Rename JPG Online Free – Batch Photo Rename Tool | opentools',
    description:
      'Rename JPG, PNG, and other image files online in bulk. Set a name pattern with auto-numbering. Free, browser-based, no upload, no software to install.',
    intro: [
      'Rename Images lets you rename a batch of photos online in seconds — no software, no upload. Set a filename template with a custom prefix, separator, and auto-incrementing number, and every image in your batch gets a clean, consistent filename. This is the fastest way to organise a folder of camera photos, screenshots, or downloads before uploading them anywhere.',
      'Processing is entirely local to your browser. The renamed files are packaged into a ZIP for a single download. The original files on your device are not modified.',
      'Common patterns: "vacation-001.jpg", "product-photo-1.png", "screenshot-2026-01-01.webp". The numbering starts at the value you specify and increments automatically.',
    ],
    steps: [
      {
        title: 'Add your images',
        description: 'Drop the image files you want to rename — any mix of JPG, PNG, WebP, or other formats. Drag to set the order before renaming.',
      },
      {
        title: 'Set the name pattern',
        description: 'Enter a base name (e.g. "product-photo"), choose a separator ("-", "_", or none), and set the starting number. A preview shows the first few output names.',
      },
      {
        title: 'Rename and download',
        description: 'Click Rename. The renamed files are bundled into a ZIP file that downloads instantly. Extract and review the filenames.',
      },
    ],
    useCases: [
      'Rename a batch of camera photos like "IMG_4521.jpg" into descriptive names like "paris-trip-001.jpg" before sharing.',
      'Standardise screenshot filenames before uploading to a project management tool or shared drive.',
      'Rename product photos with consistent numbering before uploading to an e-commerce platform.',
      'Organise a folder of downloaded images with a uniform naming convention.',
    ],
    limitations: [
      'All files in the batch receive the same base name — different prefixes per file are not supported in a single operation.',
      'The rename is applied to the filename only — EXIF data and image content are unchanged.',
      'Very large batches (hundreds of high-resolution images) may take a moment to ZIP in the browser.',
    ],
    faqs: [
      {
        question: 'How do I rename JPG files online for free?',
        answer: 'Add your JPGs, set the base name and starting number, and click Rename. All files are renamed according to the pattern and downloaded as a ZIP — no account required.',
      },
      {
        question: 'Can I rename multiple photos at once?',
        answer: 'Yes. The tool processes the entire batch at once. Each photo receives a sequential number appended to the base name you set.',
      },
      {
        question: 'Are my images uploaded to rename them?',
        answer: 'No. Renaming is handled entirely in your browser. The files are never sent to any server.',
      },
      {
        question: 'Does renaming change the image quality or EXIF data?',
        answer: 'No. Only the filename changes. The image pixels, format, and EXIF metadata are completely untouched.',
      },
    ],
    relatedToolIds: ['batch-rename', 'remove-exif-metadata', 'compress-jpg', 'image-converter', 'resize-image', 'rotate-image'],
    reviewedAt: '2026-07-12',
    supportedFormats: ['JPEG', 'PNG', 'WebP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'HEIC'],
  },

  'adjust-saturation': {
    title: 'Adjust Saturation',
    seoTitle: 'Change Saturation of Image Free Online – No Upload | opentools',
    description:
      'Change the saturation of an image online. Boost vivid colours or fade to greyscale. Free, no upload, browser-based. Works with JPG, PNG, and WebP.',
    intro: [
      'Adjust Saturation lets you change the colour intensity of an image — dragging the slider right makes colours more vivid and punchy, dragging left desaturates towards greyscale. It is the quickest way to correct a washed-out photo, give a faded image more life, or stylise a photo to a muted or black-and-white look without a full photo editor.',
      'The adjustment is applied in real time on the preview canvas using the HSL colour model. The saturation value of every pixel is multiplied by your chosen factor while hue and lightness are preserved, so colours shift in intensity without going off-hue.',
      'No image data is sent anywhere. Processing uses the browser\'s Canvas API and runs on your device.',
    ],
    steps: [
      {
        title: 'Upload your image',
        description: 'Drop a JPG, PNG, or WebP image. A live preview updates as you adjust the saturation slider.',
      },
      {
        title: 'Drag the saturation slider',
        description: 'Move the slider right (above 100%) to increase colour intensity, or left (below 100%) to desaturate. 0% produces a greyscale image.',
      },
      {
        title: 'Download the adjusted image',
        description: 'Click Apply to encode the result at full resolution, then download it in your chosen format.',
      },
    ],
    useCases: [
      'Boost the saturation of a washed-out landscape or travel photo to bring colours back to life.',
      'Desaturate a portrait photo to a muted or greyscale style for a editorial look.',
      'Increase the vividity of product images before listing them on an e-commerce site.',
      'Reduce oversaturated colours from a phone camera that applies heavy processing.',
    ],
    limitations: [
      'The tool adjusts global saturation uniformly — selective colour adjustments (e.g. only red channel) are not available.',
      'Extreme saturation boosts can push highly saturated pixels to pure colour with no detail, which is irreversible in the output image.',
      'For precise colour grading, use a dedicated image editor with LAB or HSL channel controls.',
    ],
    faqs: [
      {
        question: 'How do I change the saturation of an image online?',
        answer: 'Upload the image, drag the saturation slider to the level you want, and download the result. No account or upload to a server is required.',
      },
      {
        question: 'What does increasing saturation do to a photo?',
        answer: 'It intensifies all colours, making reds redder, blues bluer, and greens greener. Colours that were muted or grey are unaffected since greyscale pixels have no hue to boost.',
      },
      {
        question: 'How do I make an image greyscale using this tool?',
        answer: 'Set the saturation slider to 0%. This removes all colour information and produces a greyscale version of the image.',
      },
      {
        question: 'Is my image uploaded to adjust saturation?',
        answer: 'No. The saturation adjustment runs entirely in your browser using the Canvas API. Your image never leaves your device.',
      },
    ],
    relatedToolIds: ['image-converter', 'compress-jpg', 'resize-image', 'crop-image', 'rotate-image', 'flip-image'],
    reviewedAt: '2026-07-12',
    supportedFormats: ['JPEG', 'PNG', 'WebP'],
  },

  'pdf-to-text': {
    title: 'PDF to Text',
    seoTitle: 'Convert PDF to Text File Free Online – No Upload | opentools',
    description:
      'Extract text from a PDF and download it as a plain .txt file. No upload, browser-based using pdf.js. Works with selectable-text PDFs instantly.',
    intro: [
      'PDF to Text extracts all selectable text from a PDF and saves it as a plain .txt file, entirely in your browser. This is the fastest way to convert a PDF to a text file for copy-pasting into another document, running a word count, feeding content into an AI tool, or making the text searchable outside the PDF viewer.',
      'Text extraction uses pdf.js to read the PDF\'s text content layer — the same layer that appears when you highlight text in a PDF viewer. The tool collects all text from every page in reading order and concatenates it into a single .txt file separated by page breaks.',
      'This works for PDFs that contain selectable (embedded) text. Scanned documents stored as images require OCR, which this tool does not perform. For scanned PDFs, the output text will be empty or minimal.',
    ],
    steps: [
      {
        title: 'Upload your PDF',
        description: 'Drop the PDF into the tool. Processing is local — no file is uploaded.',
      },
      {
        title: 'Preview the extracted text',
        description: 'The extracted text appears in the preview panel. Scroll to check whether all pages were captured correctly.',
      },
      {
        title: 'Download the text file',
        description: 'Click Download to save the text as a .txt file. Open it in any text editor, word processor, or code editor.',
      },
    ],
    useCases: [
      'Convert a PDF report to a plain text file for editing in a word processor or Notion.',
      'Extract PDF content to feed into an AI writing or summarisation tool.',
      'Bulk-copy text from a long PDF without manually selecting and pasting page by page.',
      'Extract contract or legal document text to search with Ctrl+F in a text editor.',
    ],
    limitations: [
      'Only works with PDFs that have an embedded text layer (selectable text). Scanned image PDFs return empty or no text — use an OCR PDF tool for those.',
      'Complex layouts (multi-column, tables, footnotes) may produce text in a different reading order than the visual layout of the page.',
      'Password-protected PDFs must be unlocked first using the Unlock PDF tool.',
    ],
    faqs: [
      {
        question: 'How do I convert a PDF to a text file for free?',
        answer: 'Drop your PDF into this tool, check the text preview, and click Download to save a .txt file. No account or upload required.',
      },
      {
        question: 'Why is the extracted text empty?',
        answer: 'The PDF is likely a scanned document stored as images with no embedded text layer. This tool extracts the text layer only. Use an OCR tool to extract text from scanned PDFs.',
      },
      {
        question: 'Is my PDF uploaded to extract text?',
        answer: 'No. pdf.js reads and processes the PDF entirely within your browser tab. Your PDF file never leaves your device.',
      },
      {
        question: 'What is the difference between PDF to Text and PDF to Word?',
        answer: 'PDF to Text saves plain, unformatted .txt output — no fonts, tables, or layout. PDF to Word (a separate tool) attempts to preserve formatting in a .docx file.',
      },
      {
        question: 'Does this work with edit pdf with openoffice alternatives?',
        answer: 'If you want to edit PDF content in LibreOffice or OpenOffice, extract the text here first, paste it into a new document, and edit it freely — no need to open the PDF in OpenOffice directly.',
      },
    ],
    relatedToolIds: ['pdf-to-images', 'compress-pdf', 'split-pdf', 'merge-pdfs', 'extract-pages', 'add-text-to-pdf'],
    reviewedAt: '2026-07-12',
  },

  'add-text-to-pdf': {
    title: 'Add Text to PDF',
    seoTitle: 'Add Text to PDF Free Online – Edit PDF, No Upload | opentools',
    description:
      'Type text onto any PDF page in your browser. Click to place a text box anywhere. Free alternative to editing PDF with OpenOffice. No upload, no sign-up.',
    intro: [
      'Add Text to PDF lets you click anywhere on a PDF page and type — adding annotations, filling in fields that are not form fields, correcting typos in a document, or signing with a typed signature. No software installation needed; everything runs in your browser.',
      'The tool renders each page using pdf.js and overlays a draggable text box. When you click Apply, pdf-lib embeds the text as a real PDF text element at the position you set, preserving the original page content underneath.',
      'If you need a free alternative to editing a PDF with OpenOffice or LibreOffice, this tool covers the most common use case: placing typed text at specific positions on a PDF page without converting the document to another format first.',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. Pages are rendered for the editing interface in the browser — no upload occurs.',
      },
      {
        title: 'Click to place a text box',
        description: 'Click anywhere on the page preview to create a text box. Type your content. Drag the box to reposition it. Set font size and color.',
      },
      {
        title: 'Apply and download',
        description: 'Click Apply to embed the text layer into the PDF. Download the updated document and open it to verify the text appears correctly.',
      },
    ],
    useCases: [
      'Fill in a non-interactive PDF form by typing in the blank fields manually.',
      'Add a typed signature or date to a PDF contract without printing and scanning.',
      'Annotate a PDF with comments or corrections before returning it to a colleague.',
      'Add a reference number or title to a PDF that was generated without one.',
    ],
    limitations: [
      'Text is added as a new layer on top of the PDF — it does not edit or delete existing text in the original document.',
      'Available fonts are limited to those supported by pdf-lib (Helvetica, Times Roman, Courier, and variants). Custom fonts are not currently supported.',
      'Password-protected PDFs must be unlocked before adding text.',
    ],
    faqs: [
      {
        question: 'Is this a free alternative to editing PDF with OpenOffice?',
        answer: 'Yes. For the common task of typing text onto a PDF (filling forms, adding annotations, placing signatures), this tool does it entirely in the browser — no OpenOffice, LibreOffice, or installation required.',
      },
      {
        question: 'Can I add text to any position on the PDF?',
        answer: 'Yes. Click anywhere on the page to create a text box, then drag it to the exact position you want.',
      },
      {
        question: 'Is my PDF uploaded when I add text?',
        answer: 'No. The entire editing and PDF assembly runs in your browser using pdf.js and pdf-lib. Your file never leaves your device.',
      },
      {
        question: 'Can I add text to multiple pages?',
        answer: 'Yes. Navigate between pages in the editor and add text boxes to each page independently before applying.',
      },
      {
        question: 'Can I remove or edit text already in the PDF?',
        answer: 'No. This tool adds a new text layer on top — it cannot select or modify the original PDF text content. For content removal, use the Redact PDF tool.',
      },
    ],
    relatedToolIds: ['add-text', 'add-watermark-to-pdf', 'merge-pdfs', 'pdf-to-text', 'redact-pdf', 'compress-pdf'],
    reviewedAt: '2026-07-12',
  },

  // ─── High-traffic tools with fully authored content ───────────────────────

  'jpg-to-pdf': {
    title: 'JPG to PDF',
    seoTitle: 'JPG to PDF Free Online – No Upload, No Sign-up | opentools',
    description:
      'Convert JPG, PNG, or WebP images into a single PDF in seconds. Each image becomes a page. Runs entirely in your browser — no upload, no account.',
    intro: [
      'JPG to PDF is the most-searched image conversion on Google, with over six million monthly searches worldwide. This tool handles the entire conversion inside your browser tab — your photos are never sent to a server. Drop one image or twenty, arrange them in the order you need, pick a page size, and download a PDF in seconds.',
      'The tool uses pdf-lib, a pure-JavaScript PDF library, to assemble each image as a separate page. Images are read and decoded by the browser\'s native APIs, then written into the PDF structure locally. The finished file lands directly in your downloads folder.',
      'A common use case is sending scanned documents, receipts, or ID photos by email, since PDF is a universally accepted format and many submission portals require it. The output PDF is compatible with Adobe Acrobat, Preview, Google Drive, and every modern PDF viewer.',
    ],
    steps: [
      {
        title: 'Add your images',
        description: 'Drop JPG, JPEG, PNG, or WebP files into the upload area, or click to browse. You can add multiple images at once — each image will become one PDF page.',
      },
      {
        title: 'Set the page style',
        description: 'Choose between image-sized pages (each page matches the image dimensions exactly) or A4 portrait (every image is fitted and centred on a standard A4 page).',
      },
      {
        title: 'Convert and download',
        description: 'Click Convert, then download the finished PDF. Open it to confirm page order and quality before sharing or submitting.',
      },
    ],
    useCases: [
      'Bundle scanned receipts or invoices into a single PDF for accounting or reimbursement.',
      'Convert iPhone HEIC photos (via the Image Converter first) or JPEGs into a printable PDF document.',
      'Package ID photos, certificates, or signed forms into one PDF before uploading to an online portal.',
      'Turn a sequence of screenshots into a clean PDF report or presentation handout.',
    ],
    limitations: [
      'The PDF contains embedded raster images. It is not searchable — use an OCR tool if you need selectable text.',
      'Very large or numerous high-resolution images can exhaust browser memory, especially on mobile. Compress images first if the PDF is too large to email.',
      'Transparency in PNG images is not preserved — transparent pixels are composited against white before embedding.',
    ],
    faqs: [
      {
        question: 'Is JPG to PDF free?',
        answer: 'Yes, completely free with no usage limits. No account, no credit card, and no watermark is added to the output PDF.',
      },
      {
        question: 'Are my images uploaded when I convert JPG to PDF?',
        answer: 'No. All processing runs in your browser tab using the pdf-lib JavaScript library. Your image files never leave your device.',
      },
      {
        question: 'Can I convert multiple JPGs into one PDF?',
        answer: 'Yes. Add as many images as you need. Each image becomes a separate page in the PDF, in the order you arrange them.',
      },
      {
        question: 'What image formats are supported?',
        answer: 'JPG, JPEG, PNG, and WebP are all supported. For HEIC photos from an iPhone, use the HEIC to JPG converter first.',
      },
      {
        question: 'How do I reduce the PDF file size after converting?',
        answer: 'Use the Compress PDF tool on the output, or compress the images before converting using the Compress JPG or Compress PNG tool.',
      },
    ],
    relatedToolIds: ['images-to-pdf', 'png-to-pdf', 'compress-jpg', 'compress-pdf', 'pdf-to-jpg', 'heic-to-jpg'],
    reviewedAt: '2026-07-12',
    supportedFormats: ['JPEG / JPG', 'PNG', 'WebP'],
  },

  'png-to-pdf': {
    title: 'PNG to PDF',
    seoTitle: 'PNG to PDF Free Online – Browser-Based, No Upload | opentools',
    description:
      'Convert PNG images to PDF instantly in your browser. One image per page, no upload, no sign-up, no watermark. Works with screenshots and transparent PNGs.',
    intro: [
      'PNG to PDF converts one or more PNG images into a multi-page PDF directly inside your browser. PNG is the standard format for screenshots, diagrams, design exports, and graphics with transparency — and PDF is the document format accepted by email attachments, portals, and printers everywhere.',
      'The tool uses the same browser-based PDF assembly pipeline as JPG to PDF. Your PNG files are read locally, decoded by native browser APIs, composited against white (for transparent areas), and written into a PDF that downloads immediately. Nothing is uploaded.',
      'If you need to convert a mix of PNGs and JPEGs in one document, use the Images to PDF tool, which accepts any combination of image formats.',
    ],
    steps: [
      {
        title: 'Upload your PNG files',
        description: 'Drag PNG images into the upload area or click to browse. Add multiple files to combine them into a multi-page PDF.',
      },
      {
        title: 'Choose the page layout',
        description: 'Select image-sized pages to match each PNG\'s exact dimensions, or A4 portrait to fit every image proportionally on a standard page.',
      },
      {
        title: 'Download the PDF',
        description: 'Click Convert to generate the PDF locally, then download and review it.',
      },
    ],
    useCases: [
      'Convert a sequence of UI screenshots into a design review PDF to share with stakeholders.',
      'Package infographics or diagrams exported from Figma, Canva, or Photoshop into a PDF.',
      'Turn scanned PNG images of signed documents into a single PDF for submission.',
      'Bundle transparent-background icons or logos into a PDF asset sheet.',
    ],
    limitations: [
      'Transparent PNG areas are composited against white — the PDF format does not natively preserve alpha channels in raster images.',
      'The resulting PDF is image-only and not searchable. Add text using the Add Text to PDF tool after conversion if needed.',
      'Very large, high-resolution PNGs can exceed browser memory on mobile devices.',
    ],
    faqs: [
      {
        question: 'Is PNG to PDF completely free?',
        answer: 'Yes. Free with no usage caps, no sign-up, and no watermark. The output PDF is clean and unbranded.',
      },
      {
        question: 'Are my PNG files uploaded to a server?',
        answer: 'No. The conversion runs entirely in your browser. Your PNG files are never transmitted anywhere.',
      },
      {
        question: 'Does transparent background become white in the PDF?',
        answer: 'Yes. PDF raster images do not support transparency, so transparent pixels are filled with white during conversion.',
      },
      {
        question: 'Can I mix PNG and JPG in the same PDF?',
        answer: 'For mixed formats, use the Images to PDF tool, which accepts JPG, PNG, and WebP together.',
      },
    ],
    relatedToolIds: ['jpg-to-pdf', 'images-to-pdf', 'compress-png', 'compress-pdf', 'pdf-to-jpg', 'image-converter'],
    reviewedAt: '2026-07-12',
    supportedFormats: ['PNG'],
  },

  'merge-pdfs': {
    title: 'Merge PDFs',
    seoTitle: 'Merge PDF Free Online – Combine PDFs in Your Browser | opentools',
    description:
      'Merge multiple PDF files into one document instantly. Drag to reorder pages, combine any number of files, no upload, no sign-up, no size limit imposed by a server.',
    intro: [
      'Merge PDF is one of the most-searched PDF tasks globally, with tens of millions of monthly queries. This tool combines two or more PDF files into a single document in your browser, preserving the full content of each — text, images, links, bookmarks, and form fields remain intact because no rasterization is involved.',
      'The combination uses pdf-lib, which reads the PDF structure of each file and copies pages directly into a new document. The merge is lossless: vector content, selectable text, and embedded fonts survive the process. The resulting PDF downloads directly without passing through any server.',
      'Drag and drop to reorder files before merging. The page order in the output follows the order in which files appear in the list from top to bottom.',
    ],
    steps: [
      {
        title: 'Add your PDF files',
        description: 'Drop two or more PDFs into the upload area. Drag the items in the list to set the final page order before combining.',
      },
      {
        title: 'Review the order',
        description: 'Confirm the file sequence is correct. The merged PDF will contain the pages of each file in the order shown, from first to last.',
      },
      {
        title: 'Merge and download',
        description: 'Click Merge to generate the combined PDF locally. Download and open it to verify all pages are present and in the right order.',
      },
    ],
    useCases: [
      'Combine a cover letter and a CV into a single PDF before sending a job application.',
      'Merge monthly bank or invoice PDFs into one file for annual bookkeeping.',
      'Join scanned document pages that were saved as separate PDFs into one complete file.',
      'Combine a report body, appendix, and supporting data into a single deliverable PDF.',
    ],
    limitations: [
      'Password-protected PDFs must be unlocked first using the Unlock PDF tool before they can be merged.',
      'Merging many large PDFs can consume significant browser memory. For very large batches, merge in smaller groups.',
      'Bookmarks and named destinations are not currently carried across to the merged output.',
    ],
    faqs: [
      {
        question: 'Is Merge PDF free?',
        answer: 'Yes, completely free. No account, no watermark, and no limit on the number of files you can merge in a session.',
      },
      {
        question: 'Are my PDF files uploaded when I merge them?',
        answer: 'No. All processing happens in your browser using a JavaScript PDF library. Your files are never sent to any server.',
      },
      {
        question: 'Is the merged PDF lossless?',
        answer: 'Yes. The merge copies PDF page structures directly — text, images, links, and fonts are preserved without re-encoding or rasterization.',
      },
      {
        question: 'Can I merge password-protected PDFs?',
        answer: 'Not directly. Use the Unlock PDF tool first to remove the password, then merge the unlocked files.',
      },
      {
        question: 'How many PDFs can I combine at once?',
        answer: 'There is no hard limit. Practical limits depend on the total size and your device\'s available browser memory. Merge in smaller batches for very large files.',
      },
    ],
    relatedToolIds: ['split-pdf', 'compress-pdf', 'rearrange-pages', 'delete-pages', 'extract-pages', 'images-to-pdf'],
    reviewedAt: '2026-07-12',
  },

  'compress-pdf': {
    title: 'Compress PDF',
    seoTitle: 'Compress PDF Free Online – Reduce Size, No Upload | opentools',
    description:
      'Reduce PDF file size by re-encoding pages as compressed images. Choose resolution and quality. Runs in your browser — files are never uploaded to a server.',
    intro: [
      'Compress PDF reduces the size of a PDF document by rendering each page to a raster image at a chosen DPI and re-encoding it as JPEG. This approach shrinks files dramatically, especially PDFs that contain large embedded photos or high-DPI scanned pages, making them easier to email or upload to portals with attachment limits.',
      'Processing is entirely client-side using pdf.js for rendering and jsPDF for re-assembly. No content is sent to a server. The trade-off is that the output PDF contains raster images rather than vector text: the file will be smaller but the text will no longer be selectable or searchable unless you run OCR afterwards.',
      'Use a lower DPI (72–96) and quality (60–70%) for maximum size reduction. Use higher DPI (150–200) and quality (85–90%) to preserve readability for on-screen viewing or moderate-resolution printing.',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. The file is read entirely in your browser — no upload occurs.',
      },
      {
        title: 'Adjust compression settings',
        description: 'Set the output DPI (resolution) and JPEG quality. Lower values produce smaller files; higher values preserve more detail.',
      },
      {
        title: 'Compress and download',
        description: 'Click Compress to process the PDF locally. Review the file size reduction, then download the result.',
      },
    ],
    useCases: [
      'Shrink a large scanned PDF to fit an email attachment limit (typically 10–25 MB).',
      'Reduce a portfolio PDF for uploading to a job application portal with a size cap.',
      'Compress a multi-page document before sharing via messaging apps that cap file size.',
      'Create a lightweight screen-quality copy of a print-resolution report.',
    ],
    limitations: [
      'Compression rasterizes vector content — selectable text, clickable links, and vector graphics are converted to pixels.',
      'Very complex documents or those with many high-resolution pages may be slow to process or run out of browser memory on mobile devices.',
      'File size reduction is not guaranteed. PDFs already containing compressed images may not shrink significantly.',
    ],
    faqs: [
      {
        question: 'Is Compress PDF free to use?',
        answer: 'Yes, completely free. No account, no watermark, and no limit on how many times you compress a file.',
      },
      {
        question: 'Are my files uploaded when I compress a PDF?',
        answer: 'No. The entire compression pipeline runs in your browser tab using pdf.js and jsPDF. Your PDF is never sent to opentools or any third-party server.',
      },
      {
        question: 'Will the compressed PDF still be readable?',
        answer: 'Yes, for most screen-viewing purposes. At 108 DPI and 70% quality (the default), text remains legible on screen. For printing, use at least 150 DPI and 85% quality.',
      },
      {
        question: 'Why does the compressed PDF lose searchable text?',
        answer: 'The compression method rasterizes every page to an image. The output PDF contains pixel snapshots of each page, not the original vector text. Use an OCR tool if you need to restore text selection.',
      },
      {
        question: 'How much can I reduce the file size?',
        answer: 'A scanned PDF at 300 DPI can typically be reduced by 60–80% at 96 DPI / 70% quality with no visible difference on screen. PDFs already containing heavily compressed images will shrink less.',
      },
    ],
    relatedToolIds: ['merge-pdfs', 'split-pdf', 'flatten-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'compress-jpg'],
    reviewedAt: '2026-07-12',
  },

  'pdf-to-jpg': {
    title: 'PDF to JPG',
    seoTitle: 'PDF to JPG Free Online – Convert PDF Pages to Images | opentools',
    description:
      'Convert PDF pages to JPG images at a chosen DPI and quality. Runs entirely in your browser — no upload, no account required. Download all pages as a ZIP.',
    intro: [
      'PDF to JPG renders each page of a PDF into a JPEG image at the resolution and quality you choose. This is useful when you need to embed a PDF\'s visual content into an image editor, post a page as a social media image, or extract visual content from a PDF that does not allow copying.',
      'Rendering is powered by pdf.js, Mozilla\'s open-source PDF engine, running entirely in the browser. Each page is drawn to an off-screen canvas at your chosen DPI, then encoded as a JPEG. Multiple pages are packaged into a ZIP file for a single download.',
      'The output images are pixel-accurate representations of each page. They do not contain selectable text. For text extraction, use the PDF to Text tool instead.',
    ],
    steps: [
      {
        title: 'Upload your PDF',
        description: 'Drop the PDF file into the tool or click to browse. The file is processed locally — no upload occurs.',
      },
      {
        title: 'Choose resolution and quality',
        description: 'Set the DPI (72 for web use, 150 for standard print, 300 for high-quality print) and JPEG quality. A page range can be entered to convert only specific pages.',
      },
      {
        title: 'Convert and download',
        description: 'Click Convert. For a single page the JPEG downloads directly. For multiple pages a ZIP file containing all the JPEGs is downloaded.',
      },
    ],
    useCases: [
      'Extract individual pages from a PDF to use as images in a presentation or document.',
      'Capture a PDF page as a JPG thumbnail for a website or email preview.',
      'Convert a scanned PDF to JPEG images for uploading to an image gallery or CMS.',
      'Produce print-ready JPEG copies of PDF pages at 300 DPI for a print shop.',
    ],
    limitations: [
      'The output is a raster image — text in the JPEG is not selectable or searchable.',
      'Very large or complex PDFs may be slow to render in the browser, especially on mobile.',
      'Encrypted or password-protected PDFs must be unlocked first using the Unlock PDF tool.',
    ],
    faqs: [
      {
        question: 'Is PDF to JPG free?',
        answer: 'Yes, completely free with no usage limits, no account required, and no watermark on the output images.',
      },
      {
        question: 'Are my PDF files uploaded when converting to JPG?',
        answer: 'No. pdf.js renders each page directly in your browser. Your PDF file is never transmitted to any server.',
      },
      {
        question: 'What DPI should I use?',
        answer: '72 DPI is suitable for web or email previews. 150 DPI gives a good balance for on-screen and light printing. 300 DPI is suitable for commercial print quality.',
      },
      {
        question: 'Can I convert only specific pages?',
        answer: 'Yes. Enter a page range in the settings — for example "1-3, 5" to convert pages 1, 2, 3, and 5.',
      },
      {
        question: 'What is the difference between PDF to JPG and PDF to Images?',
        answer: 'PDF to JPG converts pages specifically to JPEG format. PDF to Images offers PNG, JPEG, and WebP as output options.',
      },
    ],
    relatedToolIds: ['pdf-to-images', 'jpg-to-pdf', 'compress-jpg', 'compress-pdf', 'merge-pdfs', 'split-pdf'],
    reviewedAt: '2026-07-12',
  },

  'split-pdf': {
    title: 'Split PDF',
    seoTitle: 'Split PDF Free Online – Extract Pages, No Upload | opentools',
    description:
      'Split a PDF into individual pages or equal chunks. Runs entirely in your browser — no upload, no sign-up. Download all pages as a ZIP or as a single PDF.',
    intro: [
      'Split PDF separates a multi-page PDF into individual page files or equally-sized chunks, entirely in the browser. This is useful when you need to extract a single chapter from a long document, isolate a specific page to send separately, or divide a merged PDF back into its source parts.',
      'The split is lossless: pdf-lib copies PDF page structures without re-encoding. Selectable text, links, fonts, and embedded images all survive intact in each output file. No rasterization occurs.',
      'For a single extracted page the download is a plain PDF. For multiple pages or chunks a ZIP file is downloaded, with each output named clearly (e.g. document-page-3.pdf or document-pages-5-10.pdf).',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. It is read and processed entirely in your browser.',
      },
      {
        title: 'Choose how to split',
        description: 'Select "One PDF per page" to produce one file per page, or "Equal page chunks" and enter the number of pages per chunk.',
      },
      {
        title: 'Split and download',
        description: 'Click Split. A ZIP of all output PDFs (or a single PDF for one page) downloads automatically. Inspect each file to confirm the split.',
      },
    ],
    useCases: [
      'Extract a single contract page to sign and return without the rest of the document.',
      'Break a multi-chapter report into individual chapter PDFs for separate distribution.',
      'Divide a merged bank statement PDF into monthly files.',
      'Isolate one page from a scanned booklet to share without revealing other pages.',
    ],
    limitations: [
      'Interactive form fields are split with the page they belong to but may not function correctly in isolation if they reference other pages.',
      'Password-protected PDFs must be unlocked first using the Unlock PDF tool.',
      'Very large PDFs may be slow to process in the browser. Consider splitting in smaller page-range batches.',
    ],
    faqs: [
      {
        question: 'Is Split PDF free?',
        answer: 'Yes, completely free. No account, no watermark, and no limit on file size imposed by a server.',
      },
      {
        question: 'Are my files uploaded when I split a PDF?',
        answer: 'No. The split runs entirely in your browser using pdf-lib. Your PDF file never leaves your device.',
      },
      {
        question: 'Is the split lossless?',
        answer: 'Yes. Page structures are copied without re-encoding, so text, links, and images are fully preserved in each output file.',
      },
      {
        question: 'Can I split into specific page ranges?',
        answer: 'For extracting specific page ranges, use the Extract Pages tool, which accepts a range like "1-3, 5, 8-12".',
      },
    ],
    relatedToolIds: ['merge-pdfs', 'extract-pages', 'delete-pages', 'rearrange-pages', 'compress-pdf', 'pdf-to-jpg'],
    reviewedAt: '2026-07-12',
  },

  'rotate-image': {
    title: 'Rotate Image',
    seoTitle: 'Rotate Image Free Online – 90°, 180°, 270° | opentools',
    description:
      'Rotate images 90°, 180°, or 270° clockwise or counter-clockwise. Free, instant, browser-based. No upload, works with JPG, PNG, WebP, HEIC, and more.',
    intro: [
      'Rotate Image corrects the orientation of a photo or graphic without re-uploading to any server. If a portrait shot from your phone is displaying sideways, or a scanned document came in upside-down, this tool fixes the orientation in a single click.',
      'The rotation is lossless for PNG, WebP, and AVIF outputs — pixel values are transposed without recompression. For JPEG output, the image is decoded and re-encoded, which applies the selected quality setting. Choose PNG output if you need a bit-perfect orientation correction with no quality loss.',
      'The tool can also rotate a batch of images at once, outputting each corrected file in the selected format.',
    ],
    steps: [
      {
        title: 'Upload your image',
        description: 'Drop a JPG, PNG, WebP, HEIC, or AVIF image into the tool, or click to browse. Multiple images can be added for batch rotation.',
      },
      {
        title: 'Choose the rotation angle',
        description: 'Select 90° clockwise, 180°, or 90° counter-clockwise (270°). Use the live preview to confirm the new orientation before converting.',
      },
      {
        title: 'Apply and download',
        description: 'Click Rotate to create the corrected image, then download it. The original file on your device is unchanged.',
      },
    ],
    useCases: [
      'Fix a portrait photo from a phone camera that is displaying sideways in an email or presentation.',
      'Correct a scanned document that was placed on the scanner in the wrong orientation.',
      'Rotate a map or diagram to a horizontal reading orientation.',
      'Batch-rotate a folder of misoriented photos before uploading to a gallery.',
    ],
    limitations: [
      'JPEG output re-encodes the image at the selected quality, which is not perfectly lossless. Use PNG output for lossless rotation.',
      'EXIF orientation metadata is applied at decode time and then cleared in the output — the visual rotation is embedded in the pixel data.',
      'Animated GIFs cannot be rotated by this tool; use the GIF tools for animated files.',
    ],
    faqs: [
      {
        question: 'Is Rotate Image free?',
        answer: 'Yes, completely free with no watermark and no account required.',
      },
      {
        question: 'Does rotating a JPG reduce quality?',
        answer: 'When you save as JPEG, the re-encoding applies the quality setting and may reduce quality slightly. To rotate without quality loss, save as PNG.',
      },
      {
        question: 'Why does my photo still look rotated on some devices?',
        answer: 'Some cameras store rotation in EXIF metadata rather than in the pixel data. This tool reads the EXIF orientation at decode time and applies it to the pixels, then clears the tag — so the output will display correctly everywhere.',
      },
      {
        question: 'Can I rotate multiple images at once?',
        answer: 'Yes. Add multiple images to the tool and they will all be rotated by the same angle in a single step.',
      },
    ],
    relatedToolIds: ['flip-image', 'crop-image', 'resize-image', 'remove-exif-metadata', 'image-converter', 'compress-jpg'],
    reviewedAt: '2026-07-12',
  },

  'flip-image': {
    title: 'Flip Image',
    seoTitle: 'Flip Image Free Online – Mirror Horizontally or Vertically | opentools',
    description:
      'Flip images horizontally or vertically (mirror effect) in your browser. Free, instant, no upload. Works with JPG, PNG, WebP, AVIF, and HEIC.',
    intro: [
      'Flip Image mirrors a photo or graphic horizontally (left-right) or vertically (top-bottom) entirely inside your browser. A horizontal flip creates a mirror image — useful for reversing text watermarks, matching a reference image to a mirrored layout, or creating symmetry effects. A vertical flip inverts top-to-bottom.',
      'Processing uses the browser\'s Canvas API. The source image is decoded, drawn to a mirrored canvas, and encoded in your chosen output format. No image data is uploaded.',
      'Both flip directions can be combined in sequence: flip horizontal, then flip vertical, to achieve a 180° rotation equivalent.',
    ],
    steps: [
      {
        title: 'Upload your image',
        description: 'Drop a JPG, PNG, WebP, or HEIC image into the tool, or click to browse.',
      },
      {
        title: 'Choose the flip direction',
        description: 'Select Flip Horizontal (left-right mirror) or Flip Vertical (upside-down). The live preview shows the result before you download.',
      },
      {
        title: 'Download the flipped image',
        description: 'Click the action button to produce the mirrored image, then download it.',
      },
    ],
    useCases: [
      'Mirror a product photo for a layout that requires left-right symmetry.',
      'Reverse a watermarked image to produce an unmarked visual reference.',
      'Create a vertical flip of a landscape photo for a reflection composite.',
      'Correct a selfie camera preview that was saved mirrored.',
    ],
    limitations: [
      'Text in the image will appear reversed after a horizontal flip — this is a feature of the mirror effect, not a bug.',
      'JPEG output re-encodes the pixels at the selected quality. Use PNG for lossless flipping.',
      'Animated images (GIFs) cannot be processed; only single-frame images are supported.',
    ],
    faqs: [
      {
        question: 'Is Flip Image free?',
        answer: 'Yes, completely free with no upload, no account, and no watermark.',
      },
      {
        question: 'What is the difference between flip horizontal and flip vertical?',
        answer: 'Flip horizontal mirrors the image left-to-right (as if reflected in a vertical mirror). Flip vertical inverts the image top-to-bottom (as if reflected in a horizontal mirror).',
      },
      {
        question: 'Can I flip a PNG without losing transparency?',
        answer: 'Yes. Choose PNG as the output format and transparency is preserved through the flip.',
      },
    ],
    relatedToolIds: ['rotate-image', 'crop-image', 'resize-image', 'image-converter', 'compress-jpg', 'compress-png'],
    reviewedAt: '2026-07-12',
  },

  'rearrange-pages': {
    title: 'Rearrange Pages',
    seoTitle: 'Rearrange PDF Pages Free Online – Drag to Reorder | opentools',
    description:
      'Reorder PDF pages visually by dragging thumbnails. Browser-based, no upload, no sign-up. Lossless — selectable text and links are fully preserved.',
    intro: [
      'Rearrange Pages lets you drag and drop page thumbnails to reorder a PDF without installing any desktop software and without uploading the file to a server. It is the fastest way to fix the page order of a scanned document, move a summary page to the front, or reorganise a report after merging several sources.',
      'The reordering is powered by pdf-lib and is fully lossless. Page content — text, fonts, links, images, and annotations — is copied into a new PDF in the order you set. Nothing is re-encoded or converted to a raster image.',
      'Thumbnails are rendered at low resolution for speed. The full-resolution PDF is assembled from the original data, not from the thumbnail images, so quality is unchanged.',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. Page thumbnails are rendered in the browser for the reorder interface.',
      },
      {
        title: 'Drag pages into the correct order',
        description: 'Click and drag any page thumbnail to move it. The number above each page reflects the new position in real time.',
      },
      {
        title: 'Save the reordered PDF',
        description: 'Click Rearrange to produce the new PDF with your custom page order. Download it and open to confirm.',
      },
    ],
    useCases: [
      'Move an executive summary or cover page to the front of a merged report.',
      'Fix the page order of a double-sided scan that came out interleaved.',
      'Reorganise a presentation PDF to match a revised slide deck order.',
      'Sort invoice pages by date before submitting to accounting.',
    ],
    limitations: [
      'Password-protected PDFs must be unlocked before they can be reordered.',
      'Bookmarks that reference specific page numbers by index may point to the wrong page after reordering.',
      'Only the page order changes — annotations, comments, and metadata are preserved but not reordered.',
    ],
    faqs: [
      {
        question: 'Is Rearrange Pages free?',
        answer: 'Yes, completely free. No account, no watermark, no limit on number of pages.',
      },
      {
        question: 'Are my files uploaded to rearrange pages?',
        answer: 'No. Page thumbnails are rendered and rearrangement is performed entirely in your browser using pdf-lib.',
      },
      {
        question: 'Is the output lossless?',
        answer: 'Yes. Page structures are copied without re-encoding, preserving selectable text, links, fonts, and embedded images.',
      },
    ],
    relatedToolIds: ['merge-pdfs', 'split-pdf', 'delete-pages', 'extract-pages', 'rotate-pages', 'compress-pdf'],
    reviewedAt: '2026-07-12',
  },

  'extract-pages': {
    title: 'Extract Pages',
    seoTitle: 'Extract PDF Pages Free Online – No Upload | opentools',
    description:
      'Extract specific pages from a PDF into a new document. Enter a page range like "1-3, 5". Browser-based, no upload, lossless — text and links stay intact.',
    intro: [
      'Extract Pages pulls selected pages out of a PDF and saves them as a new PDF document, entirely in your browser. Enter a page range — single pages, ranges, or a combination — and the tool creates a clean output containing only the pages you specified.',
      'The extraction is lossless. pdf-lib copies page structures directly: selectable text, vector graphics, embedded fonts, clickable links, and annotations all survive in the output. Nothing is rasterized.',
      'This is the right tool when you want a specific subset of pages from a document. To remove unwanted pages from the original instead, use the Delete Pages tool.',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. It is processed locally in your browser.',
      },
      {
        title: 'Enter the page range',
        description: 'Type the pages you want to keep — for example "1-3, 5, 8-12". Separate non-consecutive pages with commas.',
      },
      {
        title: 'Extract and download',
        description: 'Click Extract to create a new PDF containing only the selected pages. Download and review it.',
      },
    ],
    useCases: [
      'Extract a single contract clause page to review or share without the full document.',
      'Pull the appendix from a report to distribute separately.',
      'Extract signature pages from a multi-party agreement.',
      'Isolate a single page of a textbook or technical manual for reference.',
    ],
    limitations: [
      'Cross-page references (such as "see page 12") in the source document will still refer to the original page numbers, which may no longer match in the extracted output.',
      'Password-protected PDFs must be unlocked first.',
      'Interactive form fields that span multiple pages may not function correctly in isolation.',
    ],
    faqs: [
      {
        question: 'Is Extract Pages free?',
        answer: 'Yes, completely free with no upload and no watermark.',
      },
      {
        question: 'What page range format should I use?',
        answer: 'Use comma-separated values and hyphens for ranges. For example: "1, 3-5, 9" extracts pages 1, 3, 4, 5, and 9.',
      },
      {
        question: 'Is the extracted PDF lossless?',
        answer: 'Yes. Text, fonts, images, and links are preserved exactly — no rasterization occurs.',
      },
      {
        question: 'What is the difference between Extract Pages and Delete Pages?',
        answer: 'Extract Pages keeps only the pages you specify and discards the rest. Delete Pages removes the pages you specify and keeps everything else.',
      },
    ],
    relatedToolIds: ['delete-pages', 'split-pdf', 'merge-pdfs', 'rearrange-pages', 'compress-pdf', 'pdf-to-jpg'],
    reviewedAt: '2026-07-12',
  },

  'delete-pages': {
    title: 'Delete Pages',
    seoTitle: 'Delete PDF Pages Free Online – Remove Pages, No Upload | opentools',
    description:
      'Remove unwanted pages from a PDF by entering a page range. Browser-based, no upload, lossless. Keeps all remaining text, links, and images intact.',
    intro: [
      'Delete Pages removes one or more pages from a PDF and saves the remaining content as a new document, without uploading the file to any server. Enter the page numbers you want removed — single pages, ranges, or a mix — and the tool produces a clean output with those pages gone.',
      'Deletion is lossless. pdf-lib copies the surviving page structures directly, preserving selectable text, embedded fonts, links, annotations, and images in the remaining pages.',
      'To keep specific pages and discard everything else, use the Extract Pages tool instead.',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. Processing is local — the file is not uploaded.',
      },
      {
        title: 'Enter the pages to delete',
        description: 'Type the page numbers to remove — for example "1, 3-5" to delete pages 1, 3, 4, and 5. Ranges and individual pages can be mixed.',
      },
      {
        title: 'Delete and download',
        description: 'Click Delete pages to produce the updated PDF. Download it and confirm the unwanted pages are gone.',
      },
    ],
    useCases: [
      'Remove a cover page or confidentiality notice before sharing a document internally.',
      'Delete blank or filler pages from a scanned PDF.',
      'Remove duplicate pages that appeared when combining multiple PDFs.',
      'Strip a signature page from a template before re-using it.',
    ],
    limitations: [
      'You cannot delete all pages — at least one page must remain in the output.',
      'Password-protected PDFs must be unlocked first.',
      'Cross-references to deleted page numbers in the remaining text become stale.',
    ],
    faqs: [
      {
        question: 'Is Delete Pages free?',
        answer: 'Yes, completely free. No account, no watermark, no server upload.',
      },
      {
        question: 'Can I visually select pages to delete?',
        answer: 'Yes. Use the visual page selector — click pages to toggle them for deletion. You can also type a range directly.',
      },
      {
        question: 'Is the output lossless?',
        answer: 'Yes. Remaining pages are copied without re-encoding, so text, fonts, links, and images are fully preserved.',
      },
      {
        question: 'What is the difference between Delete Pages and Extract Pages?',
        answer: 'Delete Pages removes the pages you specify. Extract Pages keeps only the pages you specify. Use whichever is more convenient for your selection.',
      },
    ],
    relatedToolIds: ['extract-pages', 'split-pdf', 'merge-pdfs', 'rearrange-pages', 'compress-pdf', 'rotate-pages'],
    reviewedAt: '2026-07-12',
  },

  'add-watermark-to-pdf': {
    title: 'Add Watermark to PDF',
    seoTitle: 'Add Watermark to PDF Free Online – No Upload | opentools',
    description:
      'Stamp a text watermark on every page of a PDF. Choose font size, colour, opacity, and rotation. Runs in your browser — no upload, no sign-up needed.',
    intro: [
      'Add Watermark to PDF overlays a text stamp — such as "CONFIDENTIAL", "DRAFT", or your company name — on every page of a PDF document, entirely in the browser. The watermark is centred on each page and scaled so it stays on-page regardless of font size or rotation angle.',
      'The watermark is added by pdf-lib and is embedded as real PDF text on top of existing page content. It is vector-based, not a raster overlay, which means it scales cleanly at any zoom level and prints sharply.',
      'Use the opacity slider to set how visible the watermark is — from a subtle 10% hint to a fully opaque 100% stamp. Combine with the rotation control (horizontal, 45°, or -45°) to achieve the diagonal watermark look common in legal and financial documents.',
    ],
    steps: [
      {
        title: 'Upload the PDF',
        description: 'Drop your PDF into the tool. It is processed entirely in your browser.',
      },
      {
        title: 'Configure the watermark',
        description: 'Enter the watermark text. Adjust font size, colour, opacity, and rotation angle. The live preview shows page 1 with your settings applied in real time.',
      },
      {
        title: 'Apply and download',
        description: 'Click Add Watermark to stamp every page and download the result. Open it to confirm the watermark appears correctly.',
      },
    ],
    useCases: [
      'Mark a draft document with "DRAFT" before distributing for review.',
      'Stamp "CONFIDENTIAL" on sensitive reports before sharing externally.',
      'Add a company name watermark to PDFs before sending to clients.',
      'Mark approved documents with "APPROVED" and a date stamp.',
    ],
    limitations: [
      'The watermark is added as a PDF text layer. It can be removed by someone with PDF editing software — use the Redact PDF tool if you need tamper-proof marking.',
      'Watermark text is rendered in Helvetica. Custom fonts are not currently supported.',
      'The live preview shows only page 1. The same watermark is applied to all pages (or a specified range) in the output.',
    ],
    faqs: [
      {
        question: 'Is Add Watermark to PDF free?',
        answer: 'Yes, completely free. No account, no limit, and no watermark from opentools is added to your output.',
      },
      {
        question: 'Are my files uploaded to add a watermark?',
        answer: 'No. The watermark is applied using pdf-lib running in your browser. Your PDF is never sent to a server.',
      },
      {
        question: 'Can I watermark specific pages only?',
        answer: 'Yes. Leave the pages field blank to watermark all pages, or enter a range like "1-3, 5" to watermark only those pages.',
      },
      {
        question: 'Can someone remove the watermark?',
        answer: 'The watermark is a PDF text layer and can be removed by someone with PDF editing software. For permanent, tamper-proof redaction, use the Redact PDF tool instead.',
      },
    ],
    relatedToolIds: ['redact-pdf', 'protect-pdf-with-password', 'add-text-to-pdf', 'merge-pdfs', 'compress-pdf', 'add-watermark'],
    reviewedAt: '2026-07-12',
  },

  'add-watermark': {
    title: 'Watermark Image',
    seoTitle: 'Watermark Image Free Online – Add Text or Logo | opentools',
    description:
      'Add a text watermark to images instantly in your browser. Choose color, opacity, size, position, and style. Free, no upload, works with JPG, PNG, WebP.',
    intro: [
      'Watermark Image overlays a draggable text stamp on a photo or graphic entirely inside the browser. Choose from single-line, repeated tile, or diagonal stripe watermark styles. Position the text anywhere by dragging it on the live preview, or select a preset anchor position.',
      'The watermark is composited onto a canvas copy of your image using the Canvas 2D API. No file is uploaded. The original image on your device is not modified — the watermarked version is a new download.',
      'Common uses include protecting portfolio photographs from unauthorised use, branding product images before publishing, or adding a "SAMPLE" or "NOT FOR DISTRIBUTION" notice to draft graphics.',
    ],
    steps: [
      {
        title: 'Upload your image',
        description: 'Drop a JPG, PNG, or WebP image into the tool. A live preview with draggable watermark controls appears.',
      },
      {
        title: 'Set the watermark text and style',
        description: 'Enter the watermark text, choose a colour, opacity, font size, and style (single, tile, or diagonal). Drag the watermark on the preview to position it.',
      },
      {
        title: 'Apply and download',
        description: 'Click Apply Watermark to produce the final image with the watermark embedded in the pixels, then download it.',
      },
    ],
    useCases: [
      'Add a photographer\'s name or copyright notice to portfolio images before posting online.',
      'Brand product images with a company logo text before uploading to a marketplace.',
      'Add a "SAMPLE" watermark to design proofs sent to clients for approval.',
      'Tile a repeating copyright notice across a high-resolution image to deter cropping.',
    ],
    limitations: [
      'The watermark is composited into the pixel data. It cannot be removed cleanly without the original image.',
      'Only text watermarks are supported. Image or logo watermarks are not currently available.',
      'Very large images may be slow to process on mobile devices with limited memory.',
    ],
    faqs: [
      {
        question: 'Is Watermark Image free?',
        answer: 'Yes, completely free. No account, no usage limits, and opentools adds no watermark of its own.',
      },
      {
        question: 'Are my images uploaded when I add a watermark?',
        answer: 'No. Watermarking is performed in your browser using the Canvas API. Your image never leaves your device.',
      },
      {
        question: 'Can someone remove the watermark from the image?',
        answer: 'The watermark is embedded in the pixel data, making it difficult but not impossible to remove with image editing software. Tiling or diagonal watermarks are harder to remove cleanly than a single corner stamp.',
      },
      {
        question: 'What image formats are supported?',
        answer: 'JPG, PNG, and WebP are fully supported as both input and output.',
      },
    ],
    relatedToolIds: ['add-watermark-to-pdf', 'add-text-to-image', 'compress-jpg', 'resize-image', 'image-converter', 'remove-exif-metadata'],
    reviewedAt: '2026-07-12',
  },
} as const satisfies Record<string, ToolContent>;

export type ToolContentId = keyof typeof TOOL_CONTENT;

export function getToolContent(id: string): ToolContent | undefined {
  return TOOL_CONTENT[id as ToolContentId];
}
