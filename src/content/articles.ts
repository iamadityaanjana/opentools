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
    title: 'How to Convert PNG and JPG Images to PDF Privately',
    description:
      'Convert PNG to PDF or JPG to PDF in your browser while controlling page order, image quality, metadata, and sensitive content.',
    excerpt:
      'A careful PNG-to-PDF or JPG-to-PDF workflow keeps page images on your device, preserves their intended order, and ends with a check of the finished document.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'images-to-pdf',
      'png-to-pdf',
      'jpg-to-pdf',
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
  {
    slug: 'compress-pdf-without-uploading',
    title: 'How to Compress a PDF Without Uploading It',
    description:
      'Learn how to reduce PDF file size locally, choose sensible raster settings, and understand what an image-based compression pass removes.',
    excerpt:
      'A browser-local PDF size reducer can decrease PDF size without an upload, but this workflow rasterizes pages and may remove selectable text, links, forms, and document structure.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 7,
    relatedToolIds: [
      'compress-pdf',
      'reduce-pdf-size',
      'optimize-pdf-for-web',
      'pdf-size-checker',
      'flatten-pdf',
    ],
    sources: [
      {
        title: 'PDF Association: PDF specification',
        url: 'https://pdfa.org/resource/pdf-specification-index/',
      },
      {
        title: 'PDF.js project documentation',
        url: 'https://mozilla.github.io/pdf.js/',
      },
      {
        title: 'MDN Canvas API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
      },
      {
        title: 'MDN File API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API',
      },
    ],
    sections: [
      {
        heading: 'Understand what this compressor changes',
        paragraphs: [
          'This browser workflow renders each selected PDF page to pixels, encodes that rendered page as JPEG, and builds a new PDF from those images. Lower raster resolution and JPEG quality can reduce bytes substantially when the source contains large scans or inefficient images, but the result is a visual copy rather than a structure-preserving optimization.',
          'Rasterization may remove selectable text, searchability, hyperlinks, form fields, annotations, bookmarks, tags, layers, signatures, and other interactive or accessibility features. If those features matter, keep the original and use a structure-aware desktop or server workflow that explicitly preserves them.',
        ],
        bullets: [
          'Use this method for visual reading copies, scans, or documents whose page appearance matters more than internal structure.',
          'Do not use the compressed copy as the only archival, accessible, signed, or legally significant version.',
          'Test text selection, links, forms, and assistive-technology requirements before distributing the result.',
        ],
      },
      {
        heading: 'Choose resolution before lowering JPEG quality',
        paragraphs: [
          'Raster resolution controls how many pixels represent each page. Reducing it usually has a larger and more predictable effect than repeatedly lowering JPEG quality, but small type, thin rules, diagrams, and signatures can become difficult to read when too few pixels remain.',
          'JPEG quality controls compression artefacts inside that pixel grid. Start with a representative page at a moderate resolution and quality, inspect it at normal size and at 100%, then adjust one setting at a time so you can identify the cause of blur, ringing, or blockiness.',
        ],
        bullets: [
          'Use a higher DPI for small print, detailed diagrams, or documents intended for printing.',
          'Use a lower DPI for screen-only copies with large, simple text.',
          'Inspect coloured text, gradients, stamps, and screenshots because JPEG artefacts are not limited to photographs.',
          'Compress from the original once rather than recompressing an already rasterized copy.',
        ],
      },
      {
        heading: 'Measure the result instead of assuming a saving',
        paragraphs: [
          'A raster rebuild is not guaranteed to make every PDF smaller. A compact born-digital document containing efficient text and vector graphics can grow when every page becomes a full-page image. Conversely, an oversized scanned PDF may shrink considerably.',
          'Compare file size and usefulness, not file size alone. Open the output in a second viewer, search for a known phrase, zoom into the hardest page, and print a sample if printing is part of the destination.',
        ],
        bullets: [
          'Record the original byte size and page count before processing.',
          'Confirm every requested page is present and in the correct orientation.',
          'Check that the output meets the actual email, portal, or storage limit.',
          'Reject a smaller result if essential text or marks are no longer legible.',
        ],
      },
      {
        heading: 'Keep the local workflow private and recoverable',
        paragraphs: [
          'Local browser processing avoids sending the PDF file to the application server, but it does not make the device, browser extensions, downloads folder, backups, or later sharing channel private. Use a trusted device and treat the downloaded result according to the document’s sensitivity.',
          'Large PDFs can consume much more memory while pages are rendered than their compressed file size suggests. Process a limited page range or a smaller document first on memory-constrained phones, and keep the source until the new file has passed review.',
        ],
        bullets: [
          'Test unfamiliar settings with a non-sensitive copy.',
          'Close unnecessary tabs before processing a long or image-heavy document.',
          'Use an approved transfer channel after local compression.',
          'Retain the original wherever searchability, accessibility, evidence, or future editing may matter.',
        ],
      },
    ],
  },
  {
    slug: 'pdf-to-jpg-save-pages-as-images',
    title: 'PDF to JPG: How to Save PDF Pages as Images',
    description:
      'Convert PDF pages to JPG locally with a deliberate page range, resolution, JPEG quality, and verification workflow.',
    excerpt:
      'PDF-to-JPG conversion renders each selected page as a flat image, which is useful for previews and sharing but does not preserve selectable text or PDF interactivity.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'pdf-to-jpg',
      'pdf-to-images',
      'compress-jpg',
      'resize-image',
      'crop-image',
    ],
    sources: [
      {
        title: 'PDF.js project documentation',
        url: 'https://mozilla.github.io/pdf.js/',
      },
      {
        title: 'PDF.js examples',
        url: 'https://mozilla.github.io/pdf.js/examples/',
      },
      {
        title: 'MDN HTMLCanvasElement.toBlob()',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob',
      },
      {
        title: 'PDF Association: PDF specification',
        url: 'https://pdfa.org/resource/pdf-specification-index/',
      },
    ],
    sections: [
      {
        heading: 'Know what PDF to JPG conversion produces',
        paragraphs: [
          'A PDF page can contain text, vector paths, images, transparency, annotations, and other objects. Converting PDF to JPG renders their visible appearance into one rectangular pixel image per page. The JPG no longer contains the page’s selectable text, links, fields, vectors, or document navigation.',
          'That flattening is useful for thumbnails, slide previews, social posts, and systems that accept images but not PDFs. It is a poor substitute for the original when recipients need search, copy and paste, accessibility structure, zoom-independent line art, or forms.',
        ],
        bullets: [
          'Keep the PDF as the source of record.',
          'Use JPG for a compact visual page copy with broad compatibility.',
          'Choose PNG instead when sharp line art, screenshots, or lossless output matters more than file size.',
        ],
      },
      {
        heading: 'Select pages and resolution deliberately',
        paragraphs: [
          'Choose only the pages you need before rendering. A page-range export reduces processing time, download clutter, and the chance that confidential pages are included accidentally. Review page numbering carefully because printed labels and PDF page indices can differ.',
          'DPI determines the raster dimensions calculated from the PDF page size. More DPI improves fine detail up to the limits of the source, but increases memory, encoding time, and file size. It cannot recover detail that was absent from a low-resolution scan.',
        ],
        bullets: [
          'Use a moderate DPI for messaging, previews, or on-screen reference.',
          'Raise DPI for small type or print use, then inspect the actual output.',
          'Export a difficult page first before processing the whole document.',
          'Check portrait and landscape pages because their pixel dimensions will differ.',
        ],
      },
      {
        heading: 'Set JPEG quality around the page content',
        paragraphs: [
          'JPEG is lossy. Photographs often tolerate a moderate quality setting, while fine text, signatures, barcodes, and thin coloured lines can develop halos or blur. A single setting may not suit a document that mixes photo-heavy and text-heavy pages.',
          'Open representative files at normal viewing size and 100% zoom. If text edges are damaged, increase quality or resolution, or use PDF-to-images with PNG for the affected pages. Repeatedly saving the JPG will add another lossy generation.',
        ],
        bullets: [
          'Inspect the smallest text and highest-contrast edges.',
          'Check gradients and pale backgrounds for banding.',
          'Avoid converting the JPG back to PDF and expecting the original structure to return.',
          'Resize only after deciding the final use and keep the first export as the working master.',
        ],
      },
      {
        heading: 'Convert on desktop or iPhone without an upload',
        paragraphs: [
          'A browser-local tool can perform PDF to JPG on an iPhone as well as a desktop when the browser has enough memory. Select the PDF from Files, process a short range first, and save or share the downloaded images through the intended app. Mobile download handling varies, so verify where the files were stored.',
          'Local conversion keeps page content out of the application’s upload path, but the files may still enter device backups or a cloud-synced Files location. Review the final image sequence before sending it and remove working copies according to your retention needs.',
        ],
        bullets: [
          'On a phone, process fewer high-DPI pages at once to reduce tab reloads.',
          'Confirm filenames preserve page order before attaching multiple images.',
          'Check that no hidden or unintended page was exported.',
          'Use the original PDF when the recipient can accept it and needs document features.',
        ],
      },
    ],
  },
  {
    slug: 'pdf-to-text-without-ocr',
    title: 'PDF to Text: Extract Selectable Text Without OCR',
    description:
      'Extract an existing PDF text layer into a plain-text file locally, and recognize when a scanned document actually needs OCR.',
    excerpt:
      'PDF-to-text extraction reads characters already encoded in the document; it does not inspect page images or perform optical character recognition.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'pdf-to-text',
      'extract-text-from-pdf',
      'view-pdf-metadata',
      'pdf-info',
      'extract-pages',
    ],
    sources: [
      {
        title: 'PDF.js PDFPageProxy API',
        url: 'https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html',
      },
      {
        title: 'PDF.js API documentation',
        url: 'https://mozilla.github.io/pdf.js/api/',
      },
      {
        title: 'PDF Association: Why copied PDF text can be incorrect',
        url: 'https://pdfa.org/error-the-text-copied-from-the-pdf-could-not-be-pasted-correctly/',
      },
      {
        title: 'PDF Association FAQ: AI and PDF',
        url: 'https://pdfa.org/faq-ai-and-pdf/',
      },
    ],
    sections: [
      {
        heading: 'Check whether the PDF already contains text',
        paragraphs: [
          'Try selecting a sentence in a PDF viewer and searching for a visible word. If both work, the document probably contains text objects that a PDF-to-text tool can read. Born-digital reports, invoices, and exported documents commonly do, even when their visual layout is elaborate.',
          'A scanned PDF may contain only page images. In that case there are no encoded characters to extract, so this tool can return little or nothing. It does not perform OCR, infer words from pixels, or add a searchable layer.',
        ],
        bullets: [
          'Successful text selection is a useful first check, not a guarantee of clean extraction.',
          'An invisible OCR layer may exist behind a scan and can contain recognition errors.',
          'Use a dedicated OCR workflow only when image-based pages need recognition.',
        ],
      },
      {
        heading: 'Expect reading order and character mapping limits',
        paragraphs: [
          'PDF stores instructions for placing content on pages, not necessarily a simple paragraph stream. Columns, tables, sidebars, headers, footers, and individually positioned glyphs may be returned in an order that differs from how a person reads the page.',
          'Visible glyphs also need a usable mapping to Unicode for reliable copy and extraction. Missing or incorrect font mappings can produce replacement characters, scrambled text, or output that looks plausible but is wrong. Plain-text export cannot preserve the original typography or geometry.',
        ],
        bullets: [
          'Compare names, dates, numbers, and non-Latin text against the page.',
          'Expect table cells and multi-column layouts to require cleanup.',
          'Treat extracted text as data to verify, not a certified transcription.',
          'Keep the source PDF for visual and evidentiary context.',
        ],
      },
      {
        heading: 'Use page ranges to keep output focused',
        paragraphs: [
          'Extract only the relevant pages when the document is long or contains information that should not be copied into a new file. A focused range makes review easier and avoids carrying unrelated headers, appendices, or confidential sections into downstream notes.',
          'The output is a UTF-8 plain-text file. It is suitable for searching, quoting after verification, or importing into another text workflow, but it will not retain images, links, comments, forms, page design, or semantic tags.',
        ],
        bullets: [
          'Confirm whether the range uses physical PDF page order rather than printed page labels.',
          'Review page boundaries and repeated headers in the text file.',
          'Normalize whitespace only after checking that meaningful separation is not lost.',
          'Quote from the original page when exact formatting or context matters.',
        ],
      },
      {
        heading: 'Protect sensitive text after extraction',
        paragraphs: [
          'Browser-local extraction avoids uploading the PDF through the tool, but the downloaded text can be easier to search, index, copy, and accidentally disclose than the source document. It may also be saved in a synchronized downloads folder or captured by backups.',
          'Review the generated file before sharing, especially when the source contains hidden text, repeated headers, or content outside the visible crop. Delete temporary copies when appropriate and use an approved storage and transfer channel.',
        ],
        bullets: [
          'Use a trusted device for confidential documents.',
          'Open the text file and search for sensitive terms before distribution.',
          'Do not assume visual redaction removed an underlying text object.',
          'Retain only the minimum page range and text needed for the task.',
        ],
      },
    ],
  },
  {
    slug: 'avif-to-jpg-or-png',
    title: 'AVIF to JPG or PNG: Which Output Should You Choose?',
    description:
      'Convert AVIF to JPG or PNG locally while choosing between smaller photographic files, transparency, lossless output, and broad compatibility.',
    excerpt:
      'AVIF conversion decodes the image to pixels and rasterizes those pixels into a new JPG or PNG; the right output depends on content and destination.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'image-converter',
      'compress-jpg',
      'compress-png',
      'resize-image',
      'view-exif-data',
    ],
    sources: [
      {
        title: 'Alliance for Open Media AV1 Image File Format',
        url: 'https://aomediacodec.github.io/av1-avif/',
      },
      {
        title: 'MDN image file type and format guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types',
      },
      {
        title: 'web.dev: choose the right image format',
        url: 'https://web.dev/articles/choose-the-right-image-format',
      },
      {
        title: 'MDN Canvas API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
      },
    ],
    sections: [
      {
        heading: 'Choose JPG for photographs and compatibility',
        paragraphs: [
          'JPG is usually the practical output for an opaque photograph that must open in older editors, upload forms, office software, or messaging systems. Its lossy compression can produce a much smaller file than PNG for continuous-tone imagery, especially when you also resize oversized dimensions.',
          'An AVIF-to-JPG conversion decodes the AVIF and encodes a new raster image. It cannot preserve alpha transparency, animation, layered auxiliary images, or every high-bit-depth and HDR characteristic of the source. Transparent areas need to be composited against a chosen background.',
        ],
        bullets: [
          'Use JPG for opaque photos and broad interchange.',
          'Start at high quality and lower it only after visual comparison.',
          'Check highlights, gradients, skin, foliage, and text for new artefacts.',
          'Keep the AVIF original as the higher-feature source.',
        ],
      },
      {
        heading: 'Choose PNG for transparency and crisp graphics',
        paragraphs: [
          'PNG is a stronger choice when the decoded AVIF uses transparency or contains interface graphics, logos, diagrams, or sharp text that should not receive JPEG artefacts. PNG writes the output pixels losslessly, but it can be much larger than AVIF or JPG, particularly for photographs.',
          'Lossless PNG output does not make the conversion itself reversible. Features not represented in the decoded pixel surface, and precision beyond the browser pipeline, are not restored by selecting a lossless destination.',
        ],
        bullets: [
          'Use PNG when alpha transparency must survive.',
          'Prefer PNG for flat colours and sharp synthetic edges.',
          'Do not convert a photo to PNG merely because “lossless” sounds better; compare the byte cost.',
          'Preview transparency over both light and dark backgrounds.',
        ],
      },
      {
        heading: 'Treat colour, metadata, and dimensions as checks',
        paragraphs: [
          'AVIF can carry colour information and image features that a simple browser raster export may flatten or transform. Compare the result with the source in a colour-aware viewer, especially for wide-gamut, HDR, professional, or brand-critical material.',
          'Metadata handling differs from pixel rendering. A visually correct JPG or PNG may omit Exif, XMP, rights, orientation, or other source fields. Conversely, never assume conversion alone has met a privacy policy without inspecting the output.',
        ],
        bullets: [
          'Verify pixel width and height after conversion.',
          'Check orientation, colour, and transparent edges.',
          'Inspect metadata separately when location, rights, or attribution matter.',
          'Use a specialist colour-managed workflow when an exact production transform is required.',
        ],
      },
      {
        heading: 'Test the destination before converting a batch',
        paragraphs: [
          'The best format is the one the destination accepts at an acceptable quality and size. Convert one difficult AVIF, upload or open it in the target system, and then reuse the tested choice for similar files. Avoid creating both formats when one clearly satisfies the requirement.',
          'Browser-local decoding avoids an image upload to the conversion service, but large AVIF files can require substantial memory once decoded. Smaller batches are safer on mobile devices, and unsupported or unusual AVIF features may require a dedicated image application.',
        ],
        bullets: [
          'Confirm accepted extensions, MIME types, dimensions, and byte limits.',
          'Use the source AVIF for future conversions rather than a JPG derivative.',
          'Check a representative batch sample after conversion.',
          'Keep failed or ambiguous files out of the completed download set.',
        ],
      },
    ],
  },
  {
    slug: 'png-to-ico-favicon-without-blur',
    title: 'PNG to ICO: How to Create a Favicon Without Blurry Results',
    description:
      'Turn a PNG into a crisp ICO favicon by preparing a square source, simplifying fine detail, and checking the actual small output size.',
    excerpt:
      'A good PNG-to-ICO conversion starts with icon-scale artwork; shrinking a detailed logo to 16 or 32 pixels cannot preserve detail that no longer fits.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 6,
    relatedToolIds: [
      'generate-favicon',
      'image-converter',
      'resize-image',
      'crop-image',
      'change-canvas-size',
    ],
    sources: [
      {
        title: 'Microsoft Learn: Icons',
        url: 'https://learn.microsoft.com/en-us/windows/win32/menurc/icons',
      },
      {
        title: 'Microsoft Learn: Icon design basics',
        url: 'https://learn.microsoft.com/en-us/windows/win32/uxguide/vis-icons',
      },
      {
        title: 'WHATWG HTML: Link type icon',
        url: 'https://html.spec.whatwg.org/multipage/links.html#rel-icon',
      },
      {
        title: 'W3C: How to add a favicon to your site',
        url: 'https://www.w3.org/2005/10/howto-favicon',
      },
    ],
    sections: [
      {
        heading: 'Start with icon artwork, not a full-size logo',
        paragraphs: [
          'A browser tab may display a favicon at roughly 16 or 32 CSS pixels. Fine lettering, thin strokes, shadows, and small gaps disappear or blend when a large PNG is reduced to that grid. No ICO converter can retain detail for which there are not enough output pixels.',
          'Create a simplified square mark with a clear silhouette and generous spacing. If the brand logo is wide or text-heavy, use a recognisable symbol or initial specifically drawn for small sizes rather than squeezing the entire lockup into a square.',
        ],
        bullets: [
          'Use a square canvas and centre the visual weight, not merely the bounding box.',
          'Thicken fragile strokes and enlarge important gaps.',
          'Remove tiny text, subtle textures, and photographic detail.',
          'Preview against light and dark browser chrome.',
        ],
      },
      {
        heading: 'Prepare transparency and edges before export',
        paragraphs: [
          'PNG is a useful source because it can preserve an alpha channel and crisp edges. Remove accidental semi-transparent fringes from a previous background, and leave enough transparent padding that the mark does not touch the icon boundary.',
          'Downsampling blends neighbouring pixels, so a sharp source can still look soft when scaled automatically. Compare a high-quality reduction with a hand-adjusted small-size version; at 16 pixels, moving or strengthening a feature by one pixel can materially improve clarity.',
        ],
        bullets: [
          'Avoid an opaque white square unless it is part of the design.',
          'Check for coloured halos around transparent edges.',
          'Use strong contrast rather than relying on subtle colour differences.',
          'Judge the icon at actual size, not only while zoomed in.',
        ],
      },
      {
        heading: 'Understand what the local ICO output contains',
        paragraphs: [
          'ICO is a container that can hold multiple images at different sizes and colour depths. The local favicon tool creates one PNG-backed image at the selected size—16, 32, 48, or 64 pixels—inside the ICO. That is suitable for a focused favicon test, but it is not a complete multi-resolution Windows application icon set.',
          'For a website, 32 pixels is a practical starting point, followed by testing at the browser’s actual display size. For a Windows application or other environment that expects several resources, use a dedicated icon-authoring workflow to package all required sizes, potentially including a 256-pixel image.',
        ],
        bullets: [
          'Choose 16 pixels only when you have verified the artwork remains clear at that exact grid.',
          'Use 32 or 48 pixels when the consuming browser or shortcut can downscale cleanly.',
          'Do not claim a single-image ICO covers every Windows shell or high-DPI requirement.',
          'Keep the master PNG so you can author additional sizes independently.',
        ],
      },
      {
        heading: 'Publish and verify the favicon',
        paragraphs: [
          'Reference the icon from the document head with an appropriate link element and a stable URL. Browsers cache site icons aggressively, so a changed filename or versioned URL can make testing more reliable than repeatedly replacing the same file.',
          'Check the deployed site in more than one browser, a pinned or saved shortcut if relevant, and both light and dark system themes. The favicon should remain distinguishable beside neighbouring tabs without appearing heavier or blurrier than its peers.',
        ],
        bullets: [
          'Test the deployed URL directly and confirm the server returns the correct file.',
          'Use a simple PNG favicon as an additional web option when your browser support policy allows it.',
          'Clear favicon caches or version the URL during iteration.',
          'Retain alternative small-size artwork when one automatic reduction cannot serve every context.',
        ],
      },
    ],
  },
  {
    slug: 'edit-pdf-without-installing-software',
    title: 'How to Edit PDF Files Without Installing Software',
    description:
      'Edit PDF files in a browser with local page operations, text stamps, metadata changes, and basic form filling while respecting structural limits.',
    excerpt:
      'Browser tools can reorganize pages and add simple content without an install, but they are not full object-level PDF editors and cannot safely rewrite every paragraph, image, signature, or annotation.',
    publishedAt: '2026-07-10',
    updatedAt: '2026-07-10',
    readingMinutes: 8,
    relatedToolIds: [
      'merge-pdfs',
      'split-pdf',
      'delete-pages',
      'rearrange-pages',
      'rotate-pages',
      'add-text-to-pdf',
      'fill-pdf-forms',
    ],
    sources: [
      {
        title: 'PDF Association: PDF specification',
        url: 'https://pdfa.org/resource/pdf-specification-index/',
      },
      {
        title: 'PDF.js project documentation',
        url: 'https://mozilla.github.io/pdf.js/',
      },
      {
        title: 'pdf-lib documentation',
        url: 'https://pdf-lib.js.org/',
      },
      {
        title: 'MDN File API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API',
      },
    ],
    sections: [
      {
        heading: 'Match the edit to a live browser operation',
        paragraphs: [
          'The browser tools can perform structural page operations such as merging, splitting, extracting, deleting, rearranging, rotating, cropping, and adding blank pages. They can also add simple page numbers, fixed-position text, or watermarks, update basic metadata, and fill supported AcroForm fields.',
          'These are targeted transformations, not a general visual editor. Choose the smallest operation that solves the problem and download a new copy. Keeping each step explicit makes it easier to verify page order, content, and any features that may have changed.',
        ],
        bullets: [
          'Rearrange or delete pages when the document structure is wrong.',
          'Add a text stamp or page number when new fixed-position text is sufficient.',
          'Fill an existing supported form rather than trying to recreate its layout.',
          'Keep the untouched source before combining several operations.',
        ],
      },
      {
        heading: 'Recognize advanced edits that are not supported',
        paragraphs: [
          'The current local tools do not provide object-level paragraph reflow, arbitrary existing-text replacement, font matching, freeform image replacement, tracked annotation editing, OCR correction, certificate signing, robust redaction, or a full visual form designer. A simple text stamp adds content; it does not edit the original sentence beneath it.',
          'Security-sensitive features deserve special caution. Drawing a box over text is not reliable redaction because underlying text or objects may remain recoverable. Editing a signed PDF can invalidate signatures, and password encryption or certificate workflows need audited tooling beyond these structural operations.',
        ],
        bullets: [
          'Return to the source document when substantial wording or layout must change.',
          'Use specialist software for true redaction, digital signatures, OCR, and complex annotations.',
          'Do not describe cropping as content deletion; it changes the visible page boundary.',
          'Verify whether forms, links, tags, attachments, or signatures survive any external workflow you choose.',
        ],
      },
      {
        heading: 'Work locally, one verified copy at a time',
        paragraphs: [
          'A browser-based editor can use local file APIs and PDF libraries so the document bytes are processed on the device rather than uploaded through the tool. That removes one transfer, but privacy still depends on the device, browser extensions, downloaded files, synchronized folders, and the channel used afterward.',
          'Use a descriptive output filename and inspect the result after each meaningful operation. For a long workflow, starting again from the original can be safer than repeatedly transforming a transformed copy, especially when a mistake in page selection is discovered late.',
        ],
        bullets: [
          'Use a trusted device and a non-sensitive sample when learning an operation.',
          'Close unrelated documents to reduce accidental selection or sharing.',
          'Preserve versioned outputs until the final PDF is approved.',
          'Delete temporary files according to the document’s retention policy.',
        ],
      },
      {
        heading: 'Run a document-level quality check',
        paragraphs: [
          'Open the edited PDF in a second viewer and compare it with the source. Check page count, order, orientation, crop boundaries, added content, form values, metadata, and file size. Search for known text and test links or form controls when they are expected to remain live.',
          'The review standard should match the document’s purpose. A reordered handout needs a visual page check; an accessible form also needs keyboard and assistive-technology testing; a legal, archival, or signed record may require a controlled specialist workflow rather than casual editing.',
        ],
        bullets: [
          'Check the first, last, and every changed page at minimum.',
          'Confirm no page is missing, duplicated, blank, or unexpectedly clipped.',
          'Print a representative page when physical output matters.',
          'Share only the approved copy and retain the source when policy requires it.',
        ],
      },
    ],
  },
];

export const ARTICLE_BY_SLUG: ReadonlyMap<string, Article> = new Map(
  ARTICLES.map((article) => [article.slug, article]),
);
