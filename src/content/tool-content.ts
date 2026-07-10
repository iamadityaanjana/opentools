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
    title: 'Remove EXIF Metadata',
    description:
      'Create a re-encoded image copy without carrying over the source file’s EXIF, IPTC, or XMP metadata blocks.',
    intro: [
      'The tool removes attached source metadata by decoding the image to pixels and creating a new output file. You can keep a supported original format or choose JPEG, PNG, WebP, or AVIF.',
      'This re-encoding takes place in the browser, so the source image is not uploaded for metadata removal. The decoded image still consumes device memory, and the operation changes the file bytes even when the pixels appear identical.',
    ],
    steps: [
      {
        title: 'Work from a copy',
        description:
          'Keep the original if capture date, camera settings, copyright fields, colour information, or location may be useful later.',
      },
      {
        title: 'Choose the clean output',
        description:
          'Add the image and select keep-original, JPEG, PNG, WebP, or AVIF according to the destination.',
      },
      {
        title: 'Process and verify',
        description:
          'Download the new file, check its orientation and appearance, and inspect it with View EXIF Data when metadata removal is important.',
      },
    ],
    useCases: [
      'Prepare a separate photo copy for public posting without attached GPS or camera fields.',
      'Remove authoring and editing metadata from an image before sharing it.',
      'Re-encode several images as part of a privacy-conscious publishing workflow.',
    ],
    limitations: [
      'The operation removes source metadata wholesale; it cannot selectively preserve copyright, captions, dates, or other chosen fields.',
      'Metadata removal does not hide visible information such as faces, signs, reflections, landmarks, or text inside the pixels.',
      'Re-encoding can change file size and, for lossy formats, image detail. “Keep original” falls back to JPEG for decodable formats outside JPEG, PNG, WebP, and AVIF.',
    ],
    faqs: [
      {
        question: 'Does this remove GPS coordinates?',
        answer:
          'The source metadata blocks, including EXIF GPS data, are not copied to the re-encoded output. Verify the result when location privacy is critical.',
      },
      {
        question: 'Is the original file modified?',
        answer:
          'No. The browser creates a new downloadable file; the source on your device remains unchanged.',
      },
      {
        question: 'Can metadata come back after sharing?',
        answer:
          'A later app or service can add its own metadata, but it cannot recover removed source fields from the cleaned file alone. Keep the private original separate.',
      },
    ],
    relatedToolIds: ['view-exif-data', 'image-converter', 'compress-jpg', 'compress-png'],
    reviewedAt: '2026-07-10',
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
} as const satisfies Record<string, ToolContent>;

export type ToolContentId = keyof typeof TOOL_CONTENT;

export function getToolContent(id: string): ToolContent | undefined {
  return TOOL_CONTENT[id as ToolContentId];
}
