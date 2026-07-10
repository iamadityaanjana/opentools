export interface ArticleSection {
  heading?: string;
  paragraphs: readonly string[];
  bullets: readonly string[];
}

export interface ArticleSource {
  title: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  relatedToolIds: readonly string[];
  sources: readonly ArticleSource[];
  sections: readonly ArticleSection[];
}

export const ARTICLES: readonly Article[] = [
  {
    slug: 'heic-to-jpg-quality-metadata-privacy',
    title: 'HEIC to JPG: Quality, Metadata, and Privacy',
    description:
      'Convert HEIC photos to JPG while controlling visual quality, colour, metadata, file size, and privacy.',
    excerpt:
      'A careful HEIC-to-JPG workflow preserves the picture you need without accidentally sharing location data or repeatedly degrading the image.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'heic-to-jpg',
      'image-converter',
      'view-exif-data',
      'remove-exif-metadata',
    ],
    sources: [
      {
        title: 'Using HEIF or HEVC media on Apple devices',
        url: 'https://support.apple.com/en-us/116944',
      },
      {
        title: 'CIPA Exif standards',
        url: 'https://www.cipa.jp/std/documents/e/DC-008-Translation-2023-E.pdf',
      },
      {
        title: 'MDN image file type and format guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types',
      },
    ],
    sections: [
      {
        heading: 'What changes during conversion',
        paragraphs: [
          'HEIC is a container commonly used for HEIF images, often with HEVC compression. JPEG uses a different, older compression system. Converting therefore decodes the source and encodes a new image; it is not a lossless rename. Fine texture, gradients, text, and high-contrast edges are the places where new JPEG artefacts are most likely to appear.',
          'HEIC can also carry features that a plain JPEG cannot represent in the same way, including image sequences, auxiliary depth information, transparency, and high-dynamic-range data. A converter normally exports the primary rendered image. Keep the original HEIC whenever those extra assets or future editing latitude matter.',
        ],
        bullets: [
          'Use JPG when broad viewing, email, forms, or older software compatibility is the priority.',
          'Use PNG only when the rendered result needs transparency or lossless pixels; photographs may become much larger.',
          'Do not delete the HEIC archive until the JPG has been opened and checked in another viewer.',
        ],
      },
      {
        heading: 'Choose quality by looking, not by chasing a number',
        paragraphs: [
          'JPEG quality values are encoder-specific, so the same number in two tools can produce different files. Start with a high-quality export, inspect it at normal viewing size and at 100% around hair, foliage, fabric, text, and skies, then lower quality only if the smaller file is worth the visible change.',
          'Avoid repeated JPG-to-JPG saves. Every lossy generation can add damage, even when the quality control is set high. Return to the HEIC original whenever you need a new size or a different crop.',
        ],
        bullets: [
          'Compare colour and brightness as well as sharpness; colour-profile handling can change appearance.',
          'Resize to the final pixel dimensions before the final JPEG encode so discarded pixels are not stored.',
          'For a batch, test a few difficult photos before applying one setting to everything.',
          'Check the actual upload destination because some services recompress images after receiving them.',
        ],
      },
      {
        heading: 'Treat metadata as a deliberate choice',
        paragraphs: [
          'A photo may contain Exif, XMP, or other metadata such as capture time, camera and lens details, orientation, editing software, and GPS coordinates. Conversion may preserve, rewrite, or discard those fields. A smaller JPG is not proof that private metadata has gone.',
          'For a public or sensitive share, make a separate copy, remove metadata from that copy, and inspect the exported file. Preserve the private original if dates, camera settings, rights information, or location are useful to your archive.',
        ],
        bullets: [
          'Inspect before and after conversion instead of assuming the output is clean.',
          'Remove GPS and device-identifying fields at minimum when location or source identity is sensitive.',
          'Be cautious with “remove all” if copyright, creator, caption, or colour-profile data must remain.',
          'Verify orientation after stripping metadata because some workflows rely on an orientation tag.',
        ],
      },
      {
        heading: 'A dependable workflow',
        paragraphs: [
          'Work from a duplicate, decide the output dimensions, convert once, and verify the result before sharing. For confidential images, prefer a tool whose local-processing claim you can confirm, disconnect from the network if your risk model requires it, and check the output with a metadata viewer.',
        ],
        bullets: [
          'Keep the original HEIC as the archival master.',
          'Export one representative image and inspect detail, colour, dimensions, and metadata.',
          'Apply the tested settings to the batch.',
          'Open random outputs and confirm the receiving service accepts them.',
          'Remember that removing file metadata cannot remove visual clues such as faces, signs, reflections, or landmarks.',
        ],
      },
    ],
  },
  {
    slug: 'png-vs-jpg-vs-webp-vs-avif',
    title: 'PNG vs JPG vs WebP vs AVIF: Which Format Should You Use?',
    description:
      'Choose an image format based on content, transparency, compatibility, editing needs, and web delivery.',
    excerpt:
      'There is no universally best image format: photographs, interface graphics, archives, and web pages have different requirements.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'image-converter',
      'compress-jpg',
      'compress-png',
      'compress-webp',
      'batch-convert',
    ],
    sources: [
      {
        title: 'MDN image file type and format guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types',
      },
      {
        title: 'MDN picture element reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture',
      },
      {
        title: 'WebP container specification',
        url: 'https://developers.google.com/speed/webp/docs/riff_container',
      },
      {
        title: 'Alliance for Open Media AV1 Image File Format',
        url: 'https://aomediacodec.github.io/av1-avif/',
      },
    ],
    sections: [
      {
        heading: 'Match the format to the image',
        paragraphs: [
          'Format choice is a trade-off among visual fidelity, file size, transparency, animation, encoding time, software support, and whether the file will be edited again. Judge candidate outputs at the dimensions and background where people will actually see them.',
        ],
        bullets: [
          'JPG is a practical compatibility choice for photographs and other continuous-tone images, but it is lossy and has no alpha transparency.',
          'PNG is lossless and supports alpha transparency, making it useful for interface captures, diagrams, and graphics with sharp edges.',
          'WebP supports lossy and lossless coding, transparency, and animation, and is a flexible delivery format for modern web projects.',
          'AVIF supports efficient lossy and lossless coding plus features such as transparency and high bit depth, but encoding and workflow support should be tested.',
        ],
      },
      {
        heading: 'Use source and delivery formats differently',
        paragraphs: [
          'A delivery asset is optimised for a particular channel; a source asset should retain what future edits need. Repeatedly opening and saving a lossy delivery file is a poor archival workflow. Keep a high-quality original or editable project, then generate JPG, WebP, or AVIF derivatives from it.',
          'For logos and simple illustrations, SVG may be better than all four raster formats when a trustworthy vector source exists. For camera originals and print production, the best master may instead be a raw, TIFF, PSD, or another format outside this comparison.',
        ],
        bullets: [
          'Archive the best available source rather than the smallest web derivative.',
          'Do not convert a small JPG to PNG expecting lost detail to return.',
          'Test colour profiles, transparency, and metadata because support varies by encoder and destination.',
        ],
      },
      {
        heading: 'Deliver modern formats with a fallback',
        paragraphs: [
          'For websites, the HTML picture element can list AVIF and WebP sources while retaining an img fallback. The browser selects the first type it supports. Responsive srcset and sizes attributes solve a separate problem: they let the browser choose suitable pixel dimensions for the layout.',
          'Do not create extra formats blindly. Each derivative adds build time, storage, cache variants, and testing. Measure representative images and keep only variants that produce a worthwhile result in the browsers and channels you support.',
        ],
        bullets: [
          'Put newer preferred sources before fallback sources in a picture element.',
          'Always provide useful alternative text on the img element.',
          'Set intrinsic width and height to reserve layout space.',
          'Check email clients, social crawlers, content-management systems, and download workflows separately from browsers.',
        ],
      },
      {
        heading: 'A practical decision order',
        paragraphs: [
          'First ask whether transparency, animation, lossless pixels, or very broad compatibility is mandatory. Then compare visual quality and byte size using real assets. Finally, verify decoding, colour, metadata, and operational cost in the target environment.',
        ],
        bullets: [
          'Photo for broad distribution: start with JPG; add WebP or AVIF for controlled web delivery.',
          'Screenshot or diagram with crisp text: start with PNG, then compare lossless WebP or AVIF if supported.',
          'Transparent web graphic: compare PNG, WebP, and AVIF against the real page background.',
          'Animated content: consider video before animated image formats when the destination allows it.',
        ],
      },
    ],
  },
  {
    slug: 'compress-images-for-web-without-visible-quality-loss',
    title: 'How to Compress Images for the Web Without Visible Quality Loss',
    description:
      'Reduce web image weight with sensible dimensions, format selection, careful encoding, and visual testing.',
    excerpt:
      'The best web-image optimisation combines right-sized pixels with a suitable format and a quality setting tested on real content.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'compress-jpg',
      'compress-png',
      'compress-webp',
      'batch-compress-images',
      'resize-image',
      'image-converter',
    ],
    sources: [
      {
        title: 'web.dev image performance guidance',
        url: 'https://web.dev/learn/performance/image-performance',
      },
      {
        title: 'MDN responsive images guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images',
      },
      {
        title: 'web.dev choose the right image format',
        url: 'https://web.dev/articles/choose-the-right-image-format',
      },
    ],
    sections: [
      {
        heading: '“No visible loss” depends on context',
        paragraphs: [
          'Lossy compression always changes pixel data. The useful goal is perceptual: changes should not be objectionable at the intended display size, density, and viewing conditions. A quality setting that works for a soft photograph may damage text, line art, gradients, or synthetic graphics.',
          'Evaluate the actual asset rather than relying on a universal quality number. Encoder scales are not standardised, and a browser or content platform may perform another encode after upload.',
        ],
        bullets: [
          'Inspect at normal display size first, then use 100% zoom to diagnose artefacts.',
          'Look closely at edges, faces, fine texture, shadows, gradients, and saturated colours.',
          'Compare against the source on the same colour-managed display when colour is important.',
        ],
      },
      {
        heading: 'Remove unnecessary pixels before tuning quality',
        paragraphs: [
          'An image delivered much larger than its rendered slot wastes transfer bytes and decode work. Produce width variants that match real layout needs, then use srcset and sizes so the browser can choose. Keep a larger source outside the delivery folder for future layouts.',
          'High-density screens can benefit from more source pixels, but automatically sending the largest file to every device is not the answer. Test the point where extra pixels stop making a meaningful visual difference.',
        ],
        bullets: [
          'Measure rendered widths at representative breakpoints.',
          'Preserve aspect ratio unless a deliberate crop is part of the design.',
          'Set width and height attributes to reduce layout movement.',
          'Do not upscale a small source and call it optimised; interpolation cannot restore absent detail.',
        ],
      },
      {
        heading: 'Pick a format, then tune the encoder',
        paragraphs: [
          'Use JPG, WebP, or AVIF candidates for photographic material and compare them. For screenshots, flat graphics, and transparency, compare PNG with lossless or carefully tuned modern formats. Format conversion and compression should be judged together because the best setting depends on the codec.',
        ],
        bullets: [
          'Start from the original, not from an already compressed derivative.',
          'Make several candidates around a sensible quality range and choose the smallest acceptable result.',
          'Strip nonessential metadata for delivery, but preserve rights or colour information when required.',
          'Keep a compatible fallback when a target browser, crawler, editor, or email client cannot decode the preferred format.',
        ],
      },
      {
        heading: 'Validate in the page, not only in a file viewer',
        paragraphs: [
          'Place the candidate in the real component and test narrow and wide viewports, light and dark backgrounds, and high-density displays. Use browser developer tools to confirm which source was downloaded and whether a supposedly lazy image is still fetched early.',
          'Optimisation can harm experience when it makes an important image blurry, delays encoding in a request path, or breaks a crawler. Treat visual review, accessibility, compatibility, and performance measurements as one release check.',
        ],
        bullets: [
          'Prioritise the likely largest visible image; do not lazy-load an above-the-fold hero without testing the impact.',
          'Lazy-load suitable off-screen images and provide meaningful alt text.',
          'Cache immutable derivatives with versioned URLs.',
          'Re-test representative pages after changing a global image pipeline.',
        ],
      },
    ],
  },
  {
    slug: 'resize-images-without-distortion',
    title: 'How to Resize an Image Without Stretching or Distortion',
    description:
      'Resize, crop, contain, or pad an image while preserving proportions and avoiding unwanted distortion.',
    excerpt:
      'Prevent stretched images by respecting aspect ratio and choosing explicitly between cropping, empty space, and a different frame.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'resize-image',
      'crop-image',
      'change-canvas-size',
      'batch-resize',
      'generate-thumbnails',
    ],
    sources: [
      {
        title: 'MDN object-fit reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit',
      },
      {
        title: 'MDN responsive images guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images',
      },
      {
        title: 'W3C CSS Images object sizing',
        url: 'https://www.w3.org/TR/css-images-3/#sizing',
      },
    ],
    sections: [
      {
        heading: 'Start with aspect ratio',
        paragraphs: [
          'Aspect ratio is the relationship between width and height. If the source ratio and target ratio differ, changing both dimensions independently stretches or squashes the content. A proportional resize changes one dimension and derives the other from the original ratio.',
          'A fixed frame with another ratio requires a choice: crop some content, leave empty space, or redesign the frame. No resize algorithm can fill a mismatched rectangle while simultaneously preserving every pixel and its proportions.',
        ],
        bullets: [
          'Fit or contain: show the whole image and accept unused space in the frame.',
          'Fill or cover: fill the frame and crop overflow.',
          'Pad: add a chosen background around the whole image.',
          'Stretch: force both dimensions; reserve this for intentionally non-photographic effects.',
        ],
      },
      {
        heading: 'Choose crops around the subject',
        paragraphs: [
          'A centred crop is predictable but can remove faces, products, labels, or text near an edge. Choose a focal point for each important image, and preview crops at every ratio used by the design. Automated subject detection is a useful starting point, not a guarantee.',
        ],
        bullets: [
          'Keep critical content inside a safe central area when one asset serves several ratios.',
          'Avoid cutting through faces, hands, text, logos, and product edges.',
          'Create an art-directed alternative when portrait and landscape placements need different compositions.',
          'Check small thumbnails because a technically correct crop can still become unreadable.',
        ],
      },
      {
        heading: 'Resize once from the best source',
        paragraphs: [
          'Downscaling discards pixels; upscaling invents new pixel values by interpolation. Good resampling can make edges look smoother, but it cannot recover genuine detail. Repeated resizing and lossy saving compounds softness and compression artefacts.',
          'Apply orientation before calculating dimensions, crop intentionally, resize from the highest-quality source, sharpen only if needed at the final size, and perform the final encode once.',
        ],
        bullets: [
          'Keep an untouched master for future output sizes.',
          'Use a high-quality resampling method for final production assets.',
          'Inspect thin lines, text, eyes, hair, and high-contrast edges after resizing.',
          'Do not assume an AI upscaler reproduces facts; generated detail can be plausible but incorrect.',
        ],
      },
      {
        heading: 'Make dimensions work on the web',
        paragraphs: [
          'For responsive pages, generate a small set of useful widths rather than scaling one huge download with CSS. Supply intrinsic dimensions, srcset, and an accurate sizes value so layout and source selection agree. CSS object-fit controls presentation inside a box; it does not reduce the bytes already downloaded.',
        ],
        bullets: [
          'Match generated widths to the component’s real rendered sizes.',
          'Use object-fit: cover only when cropping is acceptable.',
          'Use object-fit: contain when the complete image must remain visible.',
          'Test at breakpoint boundaries and with unusually tall or wide sources.',
        ],
      },
    ],
  },
  {
    slug: 'remove-exif-gps-metadata-from-photos',
    title: 'How to Remove EXIF and GPS Metadata From Photos',
    description:
      'Inspect and remove embedded photo metadata before sharing while preserving a useful private original.',
    excerpt:
      'Metadata removal can reduce accidental disclosure, but it needs verification and does not hide information visible inside the picture.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'view-exif-data',
      'remove-exif-metadata',
      'image-converter',
      'batch-convert',
    ],
    sources: [
      {
        title: 'CIPA Exif standards',
        url: 'https://www.cipa.jp/e/std/std-sec.html',
      },
      {
        title: 'IPTC Photo Metadata Standard',
        url: 'https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata',
      },
      {
        title: 'Apple guide to managing photo location metadata',
        url: 'https://support.apple.com/guide/personal-safety/manage-location-metadata-in-photos-ips0d7a5df82/web',
      },
      {
        title: 'ExifTool metadata documentation',
        url: 'https://exiftool.org/',
      },
    ],
    sections: [
      {
        heading: 'Know what may be embedded',
        paragraphs: [
          'Exif is one metadata family used by image files. A photo can also contain IPTC fields, XMP data, colour profiles, thumbnails, and format-specific boxes. Possible fields include coordinates, capture time, camera and lens details, orientation, creator information, captions, keywords, editing history, and rights notices.',
          'The actual contents depend on the camera, editor, export settings, and format. A messaging or social service may remove some fields, retain others, or store the uploaded original. Do not rely on undocumented platform behaviour for sensitive material.',
        ],
        bullets: [
          'GPS latitude, longitude, altitude, and direction can reveal a capture location.',
          'Timestamps and time zones can reveal routines or travel.',
          'Device and software fields may help correlate files from the same workflow.',
          'Copyright and credit fields may be valuable and should not be discarded automatically.',
        ],
      },
      {
        heading: 'Create a sanitised sharing copy',
        paragraphs: [
          'Preserve the archival original, then remove metadata from a duplicate intended for sharing. Decide whether to remove only location fields or all optional metadata. Selective removal retains useful attribution and colour information but demands a tool that understands every relevant field.',
          'A full metadata strip is simpler conceptually, yet it can remove orientation, colour profiles, accessibility descriptions, captions, and rights information. The right policy depends on the audience and the purpose of the copy.',
        ],
        bullets: [
          'Inspect the source and record which fields must remain.',
          'Export to a new filename instead of overwriting the only original.',
          'Open the result visually to check orientation and colour.',
          'Inspect the result with a separate metadata reader when the risk is significant.',
        ],
      },
      {
        heading: 'Prevent new location data when appropriate',
        paragraphs: [
          'Device settings can stop a camera app from receiving location, reducing the chance that new photos contain GPS. This is a trade-off: location-based search, travel organisation, and evidence workflows may depend on accurate capture metadata.',
          'Operating systems may also offer a one-time option to omit location from a shared copy. Confirm whether that option changes the exported file, the library record, or only a particular sharing route; these are different outcomes.',
        ],
        bullets: [
          'Use per-share removal when private archives should keep location.',
          'Disable camera location when collection itself is unnecessary or too risky.',
          'Document metadata policy for teams handling journalism, healthcare, legal evidence, or safeguarding.',
        ],
      },
      {
        heading: 'Understand the privacy boundary',
        paragraphs: [
          'Removing metadata reduces one class of disclosure. It does not blur faces, licence plates, screens, reflections, documents, landmarks, weather, or other visual clues. Nor does it delete copies already uploaded or information a platform previously extracted.',
          'For highly sensitive sharing, review both the pixels and the file structure, use a processing environment appropriate to the threat model, and send through a channel whose retention and access rules are understood.',
        ],
        bullets: [
          'Metadata-free does not mean anonymous.',
          'A screenshot can remove many source fields but may add new metadata and can still expose visible information.',
          'Local processing is useful only when the implementation truly avoids uploads and other network transfer.',
          'Re-check the exact final file rather than an intermediate preview.',
        ],
      },
    ],
  },
  {
    slug: 'social-media-open-graph-image-sizes-2026',
    title: 'Social Media and Open Graph Image Sizes for 2026',
    description:
      'Prepare resilient social and Open Graph images with practical dimensions, safe composition, metadata, and testing.',
    excerpt:
      'A 1200 × 630 Open Graph image is a strong link-preview baseline, but feeds, stories, and platform crops still need dedicated checks.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'resize-for-social-media',
      'resize-image',
      'crop-image',
      'generate-thumbnails',
      'compress-jpg',
    ],
    sources: [
      {
        title: 'The Open Graph protocol',
        url: 'https://ogp.me/',
      },
      {
        title: 'Meta images in link shares',
        url: 'https://developers.facebook.com/docs/sharing/webmasters/images/',
      },
      {
        title: 'X summary card with large image',
        url: 'https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image',
      },
      {
        title: 'LinkedIn: making your website shareable',
        url: 'https://www.linkedin.com/help/linkedin/answer/a521928',
      },
    ],
    sections: [
      {
        heading: 'Use a dependable link-preview baseline',
        paragraphs: [
          'For a general Open Graph link preview in 2026, 1200 × 630 pixels at roughly 1.91:1 remains a practical baseline. Meta recommends at least that size for high-resolution link shares and advises keeping close to 1.91:1 to limit cropping. Other consumers may crop, downsample, or ignore the image.',
          'Open Graph defines metadata rather than one mandatory canvas size. Include an absolute HTTPS image URL and describe the asset with og:image, og:image:width, og:image:height, and og:image:alt. Keep title and essential branding away from the edges.',
        ],
        bullets: [
          'General link preview: 1200 × 630 is the first asset to produce.',
          'X large-card variant: consider a separate 1200 × 675, 16:9 composition when that channel is important.',
          'Use JPG for photographic artwork or PNG where sharp flat graphics and transparency support are required.',
          'Verify current file-type and file-size limits in each publisher before launch because platform rules change.',
        ],
      },
      {
        heading: 'Do not confuse link previews with native posts',
        paragraphs: [
          'An Open Graph image is fetched from a web page when its URL is shared. Native feed posts, profile images, ads, stories, reels, and video thumbnails use different placement rules. A common production set starts with square, portrait, landscape, and full-screen vertical canvases, then adapts them to the exact channels in the campaign.',
        ],
        bullets: [
          'Square working canvas: 1080 × 1080 for placements that accept 1:1.',
          'Portrait feed working canvas: 1080 × 1350 for placements that accept 4:5.',
          'Full-screen vertical working canvas: 1080 × 1920 for placements that accept 9:16.',
          'These are production starting points, not promises that every platform surface will display every pixel.',
        ],
      },
      {
        heading: 'Design for unpredictable crops',
        paragraphs: [
          'Interfaces can add rounded corners, overlays, badges, text, or responsive crops. Keep the subject, logo, and short headline inside a conservative central safe area. Avoid placing small text in the image when the page title can carry the message accessibly.',
          'Prepare art-directed variants instead of mechanically cropping one master when the subject moves off-centre or text becomes unreadable. Preview on a small phone as well as a desktop.',
        ],
        bullets: [
          'Leave breathing room on every edge.',
          'Use high contrast and a type size that survives thumbnail rendering.',
          'Keep text brief and repeat essential meaning in the page title or post copy.',
          'Check that the image still makes sense when cropped to square or shown as a small thumbnail.',
        ],
      },
      {
        heading: 'Publish and test the metadata',
        paragraphs: [
          'Social crawlers cache aggressively and may not run client-side code. Render metadata in the initial HTML, make the image publicly fetchable without authentication, return the correct content type, and avoid blocking known crawlers unintentionally.',
          'Use each platform’s preview or inspection tool before an important launch. After replacing an image, a new versioned URL is more dependable than relying on every cache to refresh immediately.',
        ],
        bullets: [
          'Use canonical, absolute URLs for both the page and image.',
          'Provide og:title, og:description, og:url, and og:type alongside image fields.',
          'Add the appropriate X card metadata when X presentation matters.',
          'Test the deployed URL; a local preview cannot prove crawler access.',
          'Re-check official platform documentation during each campaign cycle.',
        ],
      },
    ],
  },
  {
    slug: 'convert-images-to-pdf-privately',
    title: 'How to Convert Images to PDF Privately',
    description:
      'Build a readable PDF from images while controlling order, quality, metadata, uploads, and sensitive content.',
    excerpt:
      'Private image-to-PDF conversion begins with understanding where processing happens and ends with checking the final document.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'images-to-pdf',
      'resize-image',
      'image-converter',
      'remove-exif-metadata',
      'view-exif-data',
    ],
    sources: [
      {
        title: 'MDN File API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API',
      },
      {
        title: 'MDN Web Crypto API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API',
      },
      {
        title: 'PDF Association: PDF specification',
        url: 'https://pdfa.org/resource/pdf-specification-index/',
      },
      {
        title: 'OWASP file upload guidance',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
      },
    ],
    sections: [
      {
        heading: 'Confirm where the files are processed',
        paragraphs: [
          'A tool displayed in a browser can process files locally with browser APIs, upload them to a server, or combine both approaches. “Online,” “browser-based,” and a padlock in the address bar do not prove that files stay on the device. Read the product’s technical privacy statement and observe network activity if the material is sensitive.',
          'Local processing reduces exposure to an upload service, but it does not secure a compromised device, malicious extension, shared download folder, backup system, or later transfer. Match the workflow to the consequences of disclosure.',
        ],
        bullets: [
          'Use a trusted offline application or verified local-processing tool for confidential records.',
          'Avoid public or managed devices when their storage and monitoring policy is unknown.',
          'Close unneeded extensions and applications for high-risk work.',
          'Delete temporary input and output copies according to your retention policy.',
        ],
      },
      {
        heading: 'Prepare pages before assembly',
        paragraphs: [
          'Put images in the intended reading order, correct their rotation, and choose a consistent page size and margin. A PDF page and an image have independent dimensions; fitting preserves the whole image, while filling may crop it.',
          'Resize very large scans to the resolution the document actually needs, but keep enough detail for small text, signatures, diagrams, or later printing. Compression that looks acceptable on a photograph may make scanned text difficult to read.',
        ],
        bullets: [
          'Rename or sort files explicitly rather than trusting an upload order.',
          'Preview portrait and landscape pages separately.',
          'Use lossless or high-quality settings for line art and small text.',
          'Run optical character recognition only if searchable text is needed and the privacy implications are acceptable.',
        ],
      },
      {
        heading: 'Review metadata and document features',
        paragraphs: [
          'Source-image metadata may be copied, transformed, or omitted by the PDF generator. The PDF itself can also contain title, author, timestamps, software identifiers, attachments, comments, forms, or hidden layers. Inspect the final PDF rather than assuming image sanitisation covers the document container.',
          'Password encryption can reduce casual access, but it does not control a recipient who can open and copy the document. Use strong, standards-compatible encryption where required, share the password through a separate channel, and understand the recipient’s software support.',
        ],
        bullets: [
          'Remove unnecessary image metadata before assembly.',
          'Inspect PDF document properties after export.',
          'Flatten annotations or layers only when editability is not required.',
          'Do not treat permission flags such as “disable printing” as strong digital-rights enforcement.',
        ],
      },
      {
        heading: 'Verify the exact output',
        paragraphs: [
          'Open the completed PDF in a second viewer and check page count, order, orientation, margins, sharpness, colour, and file size. Zoom into the smallest important text. If the document will be printed, test a representative page at the target paper size.',
          'Finally, transfer the PDF through an approved channel and confirm the intended recipient. Privacy can be lost after perfect local conversion through a mistaken address, public link, broad sharing permission, or indefinite cloud retention.',
        ],
        bullets: [
          'Keep the original images until the PDF has passed review.',
          'Use a non-sensitive sample to test an unfamiliar tool.',
          'Check that no page is blank, duplicated, missing, or unexpectedly cropped.',
          'Remove local working copies only after delivery and backup obligations are satisfied.',
        ],
      },
    ],
  },
  {
    slug: 'optimize-animated-gif-size-and-quality',
    title: 'How to Optimize an Animated GIF for Size and Quality',
    description:
      'Make animated GIFs smaller by trimming content, resizing frames, reducing motion data, and choosing video when possible.',
    excerpt:
      'GIF optimisation works best when you simplify the animation before reducing colours or accepting visible artefacts.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'gif-optimizer',
      'gif-resizer',
      'gif-to-images',
      'images-to-gif',
      'crop-image',
    ],
    sources: [
      {
        title: 'web.dev: replace animated GIFs with video',
        url: 'https://web.dev/articles/replace-gifs-with-videos',
      },
      {
        title: 'Chrome Lighthouse animated-content guidance',
        url: 'https://developer.chrome.com/docs/lighthouse/performance/efficient-animated-content',
      },
      {
        title: 'W3C WAI understanding pause, stop, hide',
        url: 'https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html',
      },
      {
        title: 'MDN prefers-reduced-motion reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
      },
    ],
    sections: [
      {
        heading: 'Why GIF grows quickly',
        paragraphs: [
          'Animated GIF is widely recognised, but its limited colour model and frame-based animation are inefficient for many photographic or long clips. File size rises with canvas area, frame count, changing detail, and colour complexity. A noisy camera clip is much harder to compress than a small flat illustration.',
          'Optimisation is a trade: remove information viewers are least likely to miss before applying aggressive colour reduction or artefact-heavy processing.',
        ],
        bullets: [
          'Trim dead time at the beginning and end.',
          'Crop unused background and resize to the displayed dimensions.',
          'Remove duplicate frames or lower the frame rate while preserving readable motion.',
          'Shorten the loop or redesign it so fewer frames communicate the same idea.',
        ],
      },
      {
        heading: 'Reduce colours carefully',
        paragraphs: [
          'GIF frames use indexed palettes. Fewer colours can reduce size, but gradients, skin tones, shadows, and photographic detail may band or flicker. Dithering can make a limited palette appear smoother, although the added pattern can itself cost bytes.',
          'Compare several palette and dithering settings on the hardest frames. Watch the animation in motion and inspect the loop boundary; a good still frame does not guarantee a stable animation.',
        ],
        bullets: [
          'Use fewer colours for flat artwork with a controlled palette.',
          'Retain more colours where gradients or recognisable products matter.',
          'Check transparent edges against the real page background.',
          'Look for temporal flicker, not only per-frame artefacts.',
        ],
      },
      {
        heading: 'Optimise frames and disposal behaviour',
        paragraphs: [
          'A capable encoder can store only the regions that change between frames. Results depend on transparency and disposal rules, so an aggressive setting may leave trails or erase content. Test in more than one target viewer, especially if the GIF came from an editor with unusual timing.',
        ],
        bullets: [
          'Preserve frame delays; dropping frames without adjusting timing changes the animation speed.',
          'Check the first loop and later loops for different behaviour.',
          'Avoid resizing an already optimised GIF repeatedly; decode from the best source and export once.',
          'Keep a master video or image sequence for future variants.',
        ],
      },
      {
        heading: 'Prefer video for substantial web animation',
        paragraphs: [
          'For photographic, large, or long web animations, a muted looping video in WebM and MP4 is often a more efficient delivery choice. Use autoplay, loop, muted, and playsinline only when that behaviour is appropriate, provide a poster, and retain controls or alternatives where users need them.',
          'Compatibility requirements sometimes make GIF unavoidable, including particular messaging, documentation, or email workflows. Optimise for that exact destination and verify whether it recompresses, freezes, or rejects the animation.',
        ],
        bullets: [
          'Respect reduced-motion preferences and avoid essential information that exists only in motion.',
          'Provide a pause or stop mechanism for motion that falls under accessibility requirements.',
          'Do not place important animation as the largest page element without performance testing.',
          'Measure the final GIF and video candidates instead of assuming one fixed saving.',
        ],
      },
    ],
  },
  {
    slug: 'browser-vs-cloud-image-tools',
    title: 'Browser vs Cloud Image Tools: Privacy, Speed, and Trade-offs',
    description:
      'Evaluate local browser processing and cloud image services by data flow, capability, reliability, and risk.',
    excerpt:
      'The meaningful distinction is not the interface but where bytes are processed, stored, logged, and returned.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'image-converter',
      'batch-compress-images',
      'images-to-pdf',
      'view-exif-data',
      'remove-exif-metadata',
    ],
    sources: [
      {
        title: 'MDN File API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API',
      },
      {
        title: 'MDN Web Workers API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API',
      },
      {
        title: 'MDN WebAssembly concepts',
        url: 'https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts',
      },
      {
        title: 'OWASP privacy risks',
        url: 'https://owasp.org/www-project-top-10-privacy-risks/',
      },
    ],
    sections: [
      {
        heading: 'Map the data flow first',
        paragraphs: [
          'Both local and cloud tools can run inside a web page. A local tool reads and transforms bytes on the device, commonly through File APIs, Canvas, Web Workers, or WebAssembly. A cloud tool uploads input to remote infrastructure and returns a result. Some products use a hybrid design for different formats or file sizes.',
          'Marketing labels are insufficient evidence. Review the privacy policy and architecture notes, inspect network requests with a safe sample, and confirm whether analytics, error reporting, thumbnails, or unsupported-format fallbacks transfer file content.',
        ],
        bullets: [
          'Ask where input, output, previews, filenames, and metadata travel.',
          'Ask whether files are stored, for how long, in which region, and in backups.',
          'Ask who can access them and which subprocessors are involved.',
          'Repeat the check after major product updates because implementations change.',
        ],
      },
      {
        heading: 'Where browser-local tools are strong',
        paragraphs: [
          'Local processing avoids upload time and can keep content off an application server. It works well for common conversions, resizing, metadata inspection, compression, and document assembly when the browser has enough memory and codec support.',
          'Limits include device memory, battery use, thermal throttling, mobile tab eviction, inconsistent codec support, and slower processing on older hardware. A tab crash can lose an unfinished batch, and browser sandboxes restrict access to specialised system features.',
        ],
        bullets: [
          'Good fit: sensitive, moderate-size jobs on a trusted device.',
          'Good fit: offline or poor-connectivity workflows after the app has loaded.',
          'Test large images and batches on the weakest supported device.',
          'Use workers when possible so heavy processing does not freeze the interface.',
        ],
      },
      {
        heading: 'Where cloud tools are strong',
        paragraphs: [
          'Cloud services can offer powerful codecs, consistent output, large-memory machines, automation APIs, shared presets, and durable job queues. They may be better for huge batches, server-side publishing pipelines, specialist formats, or collaboration.',
          'The costs are upload latency, network dependence, service limits, account risk, retention questions, and possible compliance work. Transport encryption protects data in transit but does not mean the provider cannot process or store the file.',
        ],
        bullets: [
          'Good fit: repeatable team pipelines with reviewed contracts and controls.',
          'Good fit: workloads beyond typical browser memory or codec support.',
          'Confirm deletion, backup, breach-notification, and data-residency terms.',
          'Plan for outages, rate limits, failed multipart uploads, and vendor changes.',
        ],
      },
      {
        heading: 'Choose by risk and workload',
        paragraphs: [
          'Classify the data before selecting convenience. Family photos, unreleased product images, identity documents, medical records, and public marketing assets do not have the same impact if exposed. Then test representative file sizes and required formats.',
          'A defensible choice records the data flow, performance limits, output checks, and fallback. “Local is always safe” and “cloud is always faster” are both unreliable shortcuts.',
        ],
        bullets: [
          'Prefer verified local processing when upload exposure is the main concern and the device can handle the job.',
          'Prefer a vetted cloud pipeline when scale or capability justifies remote processing.',
          'Use non-sensitive samples when evaluating a new service.',
          'Regardless of architecture, patch software, limit access, verify outputs, and manage retained copies.',
        ],
      },
    ],
  },
  {
    slug: 'image-compression-vs-resizing-vs-conversion',
    title: 'Image Compression vs Resizing vs Conversion',
    description:
      'Understand how compression, resizing, and format conversion differ and when to combine them.',
    excerpt:
      'Compression changes representation, resizing changes pixel dimensions, and conversion changes the container or codec; each solves a different problem.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'image-converter',
      'resize-image',
      'compress-jpg',
      'compress-webp',
      'reduce-image-size-for-upload',
      'batch-resize',
    ],
    sources: [
      {
        title: 'MDN image file type and format guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types',
      },
      {
        title: 'MDN responsive images guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images',
      },
      {
        title: 'web.dev image performance guidance',
        url: 'https://web.dev/learn/performance/image-performance',
      },
    ],
    sections: [
      {
        heading: 'Compression changes how pixels are stored',
        paragraphs: [
          'Compression reduces the data needed to represent an image. Lossless compression reconstructs the encoded pixels exactly; lossy compression discards information to gain smaller files. Neither category guarantees a particular file size because image complexity and encoder behaviour matter.',
          'Recompress when a file uses inefficient settings or contains more fidelity than the destination needs. Repeated lossy recompression can accumulate ringing, blocking, banding, blur, or colour damage.',
        ],
        bullets: [
          'Useful for meeting transfer or storage goals without changing dimensions.',
          'Best results come from the original or a lossless master.',
          'Quality numbers are not directly comparable across encoders.',
          'Metadata removal can reduce bytes but is a separate privacy decision.',
        ],
      },
      {
        heading: 'Resizing changes the pixel grid',
        paragraphs: [
          'Resizing changes width and height. Downscaling can produce a large saving because there are fewer pixels to encode and decode. Upscaling creates additional samples but does not recover authentic detail. If aspect ratio changes unintentionally, the image becomes distorted.',
          'Resize when the source is larger than the display, upload, or print requirement. Crop or pad explicitly when the target ratio differs.',
        ],
        bullets: [
          'Use proportional dimensions to avoid stretching.',
          'Generate responsive widths for web layouts rather than one oversized asset.',
          'Keep a larger master for future uses.',
          'Inspect small text and fine edges after resampling.',
        ],
      },
      {
        heading: 'Conversion changes format',
        paragraphs: [
          'Conversion decodes one format and writes another. It may change available features, compression, transparency, animation, colour depth, metadata, and compatibility. Changing only the filename extension does not convert the file.',
          'Conversion is useful when software cannot open the source, when a delivery channel requires a format, or when another codec provides a better size-quality trade-off. It can be lossy even if the source looked lossless, depending on the output mode.',
        ],
        bullets: [
          'JPG cannot preserve alpha transparency.',
          'PNG output does not restore detail already lost in a JPG.',
          'An animated or layered source may become a single flattened image.',
          'Verify colour, orientation, metadata, and destination support after conversion.',
        ],
      },
      {
        heading: 'Use the operations in a deliberate order',
        paragraphs: [
          'For a typical delivery asset, start from the best source, apply orientation and crop, resize to useful dimensions, choose the output format, and perform one final encode. Metadata policy and visual validation belong in the workflow rather than being assumed side effects.',
          'When an upload says “file too large,” check whether the limit refers to bytes, pixel dimensions, format, or all three. Compressing repeatedly is the wrong fix for a dimension limit, and resizing cannot satisfy a format whitelist.',
        ],
        bullets: [
          'Wrong dimensions: resize or crop.',
          'Wrong file type: convert.',
          'Too many bytes at correct dimensions and format: tune compression or remove unnecessary metadata.',
          'All three constraints: resize first, convert if needed, then tune the final encode.',
          'Always inspect the final file and keep the original until it is accepted.',
        ],
      },
    ],
  },
];

export const ARTICLE_BY_SLUG: ReadonlyMap<string, Article> = new Map(
  ARTICLES.map((article) => [article.slug, article]),
);
