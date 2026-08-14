import type { ToolContent } from './tool-content';

const REVIEWED = '2026-08-15';

const PRIVACY_FAQ = {
  question: 'Are my images uploaded to a server?',
  answer: 'No. The work happens in the page using the Canvas API and WebAssembly, so the file is read straight from your disk into the tab. Nothing is transmitted and there is no copy on a server to worry about.',
} as const;

export const IMAGE_TOOL_CONTENT = {
  'generate-favicon': {
    title: 'Generate Favicon',
    seoTitle: 'Favicon Generator Free Online – ICO Files | opentools',
    description:
      'Turn any image into a favicon .ico file at 16, 32, 48, or 64 pixels, resampled in your browser with high quality smoothing.',
    intro: [
      'A favicon is the small image a browser shows in the tab, the bookmark list, and the history entry. This tool resizes your source image to one of the standard square sizes and writes a real .ico file, which is still the format with the widest support across browsers and operating systems.',
      'The resize uses the canvas high quality smoothing path, which matters more than it sounds at these dimensions. Squeezing a detailed logo into 16 by 16 pixels throws away almost all of it, and a poor resampling filter turns what remains into mush.',
      'Design for the size you are targeting. At 32 pixels you have room for a simple mark or one or two letters. At 16 you effectively have a silhouette. A logo with a wordmark or fine linework will not survive either, so crop to the distinctive symbol before generating.',
    ],
    steps: [
      {
        title: 'Prepare a square source',
        description: 'Start from a square image so nothing is distorted. Crop to the recognisable part of your logo first with Crop Image if the original has a wordmark or wide margins.',
      },
      {
        title: 'Choose the size',
        description: 'Pick 16, 32, 48, or 64 pixels. Generate 32 if you only make one, since that is what most desktop browsers display on a normal density screen.',
      },
      {
        title: 'Save it as favicon.ico',
        description: 'Download the file and place it at the root of your site as favicon.ico. Browsers request that path automatically even without a link tag in the HTML.',
      },
    ],
    useCases: [
      'Add a tab icon to a site or internal tool that is still showing the browser default.',
      'Generate an icon from a logo without installing a graphics editor.',
      'Produce a matching favicon for a documentation site or landing page.',
      'Replace an old low resolution favicon with a cleaner version.',
    ],
    limitations: [
      'Each export contains one size. Generate the sizes you need separately rather than getting a single multi-resolution .ico.',
      'Detail disappears at small sizes. Wordmarks, thin strokes, and gradients are unreadable at 16 and 32 pixels regardless of the source quality.',
      'This produces the classic .ico only. Apple touch icons and Android maskable PNGs have their own size and padding rules and are not generated here.',
    ],
    faqs: [
      {
        question: 'What size favicon should I use?',
        answer: 'Thirty-two pixels is the practical default for desktop browsers. Sixteen is the legacy size still used in some interface positions, and 48 or 64 give sharper results on high density displays.',
      },
      {
        question: 'Where do I put the favicon file?',
        answer: 'At the root of your domain, named favicon.ico. Browsers request that path on their own. You can also point at it explicitly with a link rel="icon" tag if the file lives elsewhere.',
      },
      PRIVACY_FAQ,
      {
        question: 'Why does my logo look unreadable as a favicon?',
        answer: 'There is not enough room. A 16 pixel square holds 256 pixels in total, so text and fine detail cannot resolve. Crop to a single symbol or letter from your logo and generate from that instead.',
      },
      {
        question: 'Can I use a PNG instead of an ICO?',
        answer: 'Modern browsers accept PNG favicons declared in a link tag, and Resize Image will produce one. The .ico at the site root remains the most reliable fallback, which is why this tool outputs that format.',
      },
    ],
    relatedToolIds: ['resize-image', 'crop-image', 'generate-thumbnails', 'image-converter', 'round-corners', 'convert-transparency'],
    reviewedAt: REVIEWED,
  },

  'view-exif-data': {
    title: 'View EXIF Data',
    seoTitle: 'EXIF Viewer Free Online – Check Photo Data | opentools',
    description:
      'Read the EXIF block in a photo to see camera, lens, exposure, and GPS fields before you share the file anywhere.',
    intro: [
      'Cameras and phones write a block of metadata into every photo they save. EXIF holds the camera and lens model, the exposure settings, the timestamp, the orientation flag, and often the exact GPS coordinates where the shot was taken. This tool parses that block and shows you what is in the file.',
      'The GPS fields are the ones worth checking. A photo taken at home and posted publicly can carry coordinates accurate to a few metres, and most people never look. Some platforms strip metadata on upload and some do not, so the only reliable approach is to check the file yourself before it leaves your device.',
      'Parsing happens in the page, which is the only sensible way to build this. Uploading a photo to a website to find out whether it contains your home address would defeat the purpose.',
    ],
    steps: [
      {
        title: 'Add the photo',
        description: 'Drop in a JPEG or another format that carries EXIF. Files that have been through a screenshot tool or a social platform often have little or nothing left.',
      },
      {
        title: 'Read the fields',
        description: 'Look through the parsed values. Camera and lens, aperture, shutter speed, ISO, focal length, date taken, orientation, and GPS coordinates when present.',
      },
      {
        title: 'Strip it if you are sharing the file',
        description: 'If there is anything you would rather not publish, run the photo through Remove EXIF Metadata before uploading it anywhere.',
      },
    ],
    useCases: [
      'Check whether a photo you are about to post contains GPS coordinates.',
      'Recover the settings used for a shot you want to reproduce.',
      'Confirm the original capture date of an image rather than trusting the file date.',
      'Work out why an image displays rotated by reading its orientation flag.',
    ],
    limitations: [
      'Only metadata that is actually in the file can be shown. Screenshots, images re-saved by many editors, and downloads from platforms that strip EXIF will have little to display.',
      'PNG and WebP support metadata differently from JPEG and generally carry far less of it.',
      'EXIF is easy to edit, so the values are not proof of anything. Treat them as informative rather than forensic.',
    ],
    faqs: [
      {
        question: 'What does EXIF data include?',
        answer: 'Typically the camera and lens model, aperture, shutter speed, ISO, focal length, capture timestamp, orientation flag, and GPS coordinates if location was enabled. Phones also record software and sometimes device identifiers.',
      },
      {
        question: 'Can EXIF data reveal my location?',
        answer: 'Yes, when location services were on. GPS latitude and longitude are stored with enough precision to identify a specific building, which is why checking before publishing a photo is worth the few seconds.',
      },
      PRIVACY_FAQ,
      {
        question: 'Why does my photo show no EXIF data?',
        answer: 'Something already stripped it. Screenshots never had any, many social platforms remove metadata during upload, and some editors drop it when re-saving. That is usually good news for privacy.',
      },
      {
        question: 'How do I remove EXIF data?',
        answer: 'Use Remove EXIF Metadata, which re-encodes the image without the metadata block. Simply resizing or converting an image in most tools also drops it as a side effect.',
      },
    ],
    relatedToolIds: ['remove-exif-metadata', 'change-dpi', 'image-converter', 'compress-jpg', 'view-pdf-metadata', 'live-photo-extractor'],
    reviewedAt: REVIEWED,
  },

  'convert-to-base64': {
    title: 'Convert Image to Base64',
    seoTitle: 'Image to Base64 Free Online – No Upload | opentools',
    description:
      'Encode an image as a Base64 string you can paste into CSS, JSON, or an HTML attribute, generated on your own device.',
    intro: [
      'Base64 rewrites binary data using 64 printable characters, which lets an image travel inside a text format. That is how an icon ends up embedded in a stylesheet, a JSON payload, or an email template rather than being fetched as a separate file.',
      'The output here is the raw Base64 string without a prefix. If you need a data URI ready to drop into a src or a background-image, use Image to Data URI instead, which returns the same payload with the data:image/png;base64, prefix already attached.',
      'The encoding step grows the data by roughly a third, because three bytes of input become four characters of output. That overhead is the reason to keep this for small assets. Inlining a photograph bloats your HTML or CSS and, unlike a linked file, an inlined image cannot be cached separately by the browser.',
    ],
    steps: [
      {
        title: 'Add the image',
        description: 'Drop in the file you want to inline. Small icons, logos, and simple graphics are the sensible candidates.',
      },
      {
        title: 'Copy the string',
        description: 'The Base64 text appears ready to copy. It is the payload only, with no data URI prefix.',
      },
      {
        title: 'Paste it where it is needed',
        description: 'Drop it into your CSS, JSON, template, or API request. Add the data:image/png;base64, prefix yourself if the destination expects a full data URI.',
      },
    ],
    useCases: [
      'Inline a small icon in CSS to avoid an extra network request.',
      'Embed an image in a JSON payload for an API that takes no file uploads.',
      'Put a logo directly into an HTML email template.',
      'Include a test image in a script or fixture without shipping a binary file.',
    ],
    limitations: [
      'Base64 adds about 33 percent to the data size, so inlining anything large makes the containing file noticeably heavier.',
      'Inlined images cannot be cached independently, which means a change to one icon invalidates the whole stylesheet or document that contains it.',
      'Output is encoded as PNG. Photographs will produce a much longer string than the equivalent JPEG would.',
    ],
    faqs: [
      {
        question: 'When should I inline an image as Base64?',
        answer: 'For assets of a few kilobytes where saving a request matters more than caching, such as a small icon in CSS or a logo in an email. Anything larger is better served as a normal file.',
      },
      {
        question: 'What is the difference between Base64 and a data URI?',
        answer: 'Base64 is the encoded payload. A data URI is that payload with a scheme and MIME type in front, like data:image/png;base64,iVBORw0. Use Image to Data URI if you want the complete form.',
      },
      PRIVACY_FAQ,
      {
        question: 'Does Base64 make the image smaller?',
        answer: 'No, the opposite. It grows by roughly a third, since every three bytes become four characters. Base64 exists to make binary data safe in text, not to compress it.',
      },
      {
        question: 'Which output format is used?',
        answer: 'PNG, which is lossless and handles transparency. For a photograph that produces a long string, so compress it with Compress JPG first if size is a concern.',
      },
    ],
    relatedToolIds: ['image-to-data-uri', 'compress-png', 'resize-image', 'generate-favicon', 'image-converter', 'compress-jpg'],
    reviewedAt: REVIEWED,
  },

  'images-to-gif': {
    title: 'Images to GIF',
    seoTitle: 'Images to GIF Free Online – Make Animation | opentools',
    description:
      'Build an animated GIF from a sequence of images with control over frame delay, loop count, fit mode, and dithering.',
    intro: [
      'Frames are taken in the order you arrange them and encoded into a single animated GIF. Frame delay is set in milliseconds, so 150 gives roughly seven frames a second and 40 approaches the 25 frames a second that reads as smooth motion.',
      'Images of different sizes have to be reconciled onto one canvas, and the fit mode decides how. Contain scales each frame to fit and fills the remainder with your background colour, which keeps the whole of every image. Cover fills the canvas and crops the overflow. Stretch distorts each frame to the exact dimensions, which is rarely what you want unless the aspect ratios already match.',
      'Dithering is worth a mention because GIF allows only 256 colours per frame. With dithering on, the encoder scatters pixels between palette entries to simulate colours it does not have, which helps gradients and hurts flat graphics by adding visible noise. Leave it off for screenshots and diagrams, turn it on for photographs.',
    ],
    steps: [
      {
        title: 'Add your frames in order',
        description: 'Drop in the images and arrange them into the sequence you want. The first image sets the canvas size unless you specify width and height yourself.',
      },
      {
        title: 'Set timing and fit',
        description: 'Choose a frame delay in milliseconds and a loop count, where 0 loops forever. Pick contain to keep every frame whole, or cover to fill the canvas edge to edge.',
      },
      {
        title: 'Encode and check the size',
        description: 'Generate the GIF and look at the result. Fewer frames, smaller dimensions, and a longer delay all bring the file size down.',
      },
    ],
    useCases: [
      'Turn a series of screenshots into a step-by-step animation for documentation.',
      'Make a simple animation from exported design frames.',
      'Build a before and after loop from two product photos.',
      'Assemble a timelapse from stills shot at intervals.',
    ],
    limitations: [
      'GIF supports 256 colours per frame, so photographic sequences will show banding even with dithering enabled.',
      'File size scales with frame count and dimensions together, and GIF has no meaningful compression between frames. Long sequences get large quickly.',
      'Transparency in GIF is a single fully transparent palette entry rather than an alpha channel, so soft edges from PNG sources will look hard.',
    ],
    faqs: [
      {
        question: 'What frame delay should I use?',
        answer: 'One hundred and fifty milliseconds is a comfortable default for step-by-step sequences. Drop to around 40 to 60 for motion that should look continuous, and go higher than 500 when each frame is something the viewer needs to read.',
      },
      {
        question: 'Should I turn dithering on?',
        answer: 'Turn it on for photographs and gradients, where it hides the limits of a 256 colour palette. Leave it off for screenshots, diagrams, and flat colour illustrations, where it just adds speckled noise.',
      },
      PRIVACY_FAQ,
      {
        question: 'What happens if my images are different sizes?',
        answer: 'The fit mode decides. Contain scales each frame to fit inside the canvas and pads with the background colour, cover fills the canvas and crops the excess, and stretch distorts each frame to the exact dimensions.',
      },
      {
        question: 'How do I make the GIF loop only once?',
        answer: 'Set the loop count to 1. A value of 0 means loop forever, which is what most viewers expect from a GIF.',
      },
    ],
    relatedToolIds: ['gif-to-images', 'gif-optimizer', 'gif-resizer', 'video-to-gif', 'create-collage', 'merge-images'],
    reviewedAt: REVIEWED,
  },

  'gif-to-images': {
    title: 'GIF to Images',
    seoTitle: 'GIF to Images Free Online – Extract Frames | opentools',
    description:
      'Split an animated GIF into individual PNG, JPEG, or WebP frames delivered as a ZIP, optionally with timing in the filenames.',
    intro: [
      'An animated GIF is a stack of frames with a delay attached to each one. This tool decodes that stack and writes every frame out as a separate image, then packages them into a ZIP so a long animation does not turn into dozens of separate downloads.',
      'PNG output is the right default because it is lossless, so the extracted frames match what the GIF contained exactly. JPEG and WebP are available with an adjustable quality setting when you would rather have smaller files than perfect fidelity.',
      'The frame timing option is the part worth knowing about. GIF frames often have uneven delays, and turning the option on writes each frame\'s delay into its filename. That means you can reconstruct the original timing later instead of guessing at an average frame rate.',
    ],
    steps: [
      {
        title: 'Add the GIF',
        description: 'Drop in the animated GIF. A static single frame GIF works too and simply produces one image.',
      },
      {
        title: 'Choose the frame format',
        description: 'Use PNG to keep the frames exactly as they were. Pick JPEG or WebP with a quality setting when you need the extracted files to be smaller.',
      },
      {
        title: 'Download the ZIP',
        description: 'Save the archive of numbered frames. Enable the timing option first if you plan to rebuild the animation and need the original delays.',
      },
    ],
    useCases: [
      'Pull one clean still out of an animation to use as a thumbnail.',
      'Edit individual frames before reassembling the animation with Images to GIF.',
      'Inspect an animation frame by frame to find where an artefact appears.',
      'Convert an animated GIF into a numbered image sequence for a video editor.',
    ],
    limitations: [
      'Frame counts add up fast. A few seconds of animation can produce a hundred images, which is why the output is a ZIP.',
      'Extracted frames inherit the GIF\'s 256 colour palette. Choosing PNG preserves the frames faithfully but cannot restore colours the GIF never had.',
      'GIF transparency is a single palette entry rather than an alpha channel, so transparent regions come out hard edged in the extracted frames.',
    ],
    faqs: [
      {
        question: 'Why is the output a ZIP file?',
        answer: 'Because animations routinely contain dozens or hundreds of frames, and triggering that many individual downloads would be unworkable. The ZIP keeps them numbered and in order.',
      },
      {
        question: 'Which frame format should I choose?',
        answer: 'PNG unless you have a reason not to. It is lossless, so each frame is exactly what the GIF held. JPEG and WebP are there for when smaller files matter more than fidelity.',
      },
      PRIVACY_FAQ,
      {
        question: 'What does the frame timing option do?',
        answer: 'It writes each frame\'s delay into its filename. GIF delays are often uneven, so this preserves the information you need to rebuild the animation with its original pacing.',
      },
      {
        question: 'Can I turn the frames back into a GIF?',
        answer: 'Yes. Edit the extracted frames and feed them into Images to GIF, setting the frame delay to match what the timing filenames recorded.',
      },
    ],
    relatedToolIds: ['images-to-gif', 'gif-optimizer', 'gif-resizer', 'video-to-gif', 'zip-multiple-images', 'split-image'],
    reviewedAt: REVIEWED,
  },

  'create-collage': {
    title: 'Create Collage',
    seoTitle: 'Photo Collage Maker Free Online – No Upload | opentools',
    description:
      'Arrange photos into a justified grid where every row spans the full width and can hold a different number of images.',
    intro: [
      'The layout here is justified rather than a fixed grid. Each row spans the full canvas width, and the images in it are scaled to a common height so they fill that width exactly with no leftover gap. It is the same approach photo galleries use, and it handles mixed portrait and landscape images far better than forcing everything into equal cells.',
      'You control how many images sit in each row with per-row steppers, so a set of nine photos can be three rows of three, or a wide hero image above two rows of four. Rows with fewer images get taller, since each one has more width to fill.',
      'Canvas width, gap size, and background colour are the other settings. Width is the actual pixel width of the output, so set it to match where the collage is going rather than leaving the default.',
    ],
    steps: [
      {
        title: 'Add your photos',
        description: 'Drop in the images you want to combine. They can be any mix of sizes and orientations, since the layout scales each row to fit.',
      },
      {
        title: 'Set the rows',
        description: 'Use the per-row steppers to decide how many images each row holds. Put fewer images in a row to make those photos larger.',
      },
      {
        title: 'Choose width, gap, and background',
        description: 'Set the output width in pixels, pick a gap between images, and choose a background colour that shows in the gaps. Then export the collage.',
      },
    ],
    useCases: [
      'Build a photo grid for a social post without installing an app.',
      'Combine product shots into one image for a listing.',
      'Lay out event photos into a single shareable picture.',
      'Assemble before and after images side by side at matching heights.',
    ],
    limitations: [
      'Images are placed in the order they were added and arranged by row. There is no free positioning, rotation, or overlap; Merge Images offers a freeform canvas for that.',
      'Rows are scaled to a shared height, so an image with an extreme aspect ratio can end up much smaller or larger than its neighbours.',
      'Large photo sets at a high canvas width use a lot of memory, since every source image is decoded before compositing.',
    ],
    faqs: [
      {
        question: 'Can I control how many photos go in each row?',
        answer: 'Yes. Each row has its own stepper. Fewer images in a row means each one is rendered larger, because the row still spans the full canvas width.',
      },
      {
        question: 'What happens with photos of different sizes?',
        answer: 'Each row scales its images to a shared height so the row fills the width exactly. This is why mixed portrait and landscape sets look tidier here than in a fixed cell grid.',
      },
      PRIVACY_FAQ,
      {
        question: 'What canvas width should I use?',
        answer: 'Match the destination. Around 1080 pixels suits most social platforms, 1200 to 1600 works well for a web page, and go higher only if the collage will be printed or zoomed into.',
      },
      {
        question: 'How is this different from Merge Images?',
        answer: 'Create Collage produces an automatic justified layout from your row counts. Merge Images gives you a freeform canvas where each image can be positioned, resized, and stacked by hand.',
      },
    ],
    relatedToolIds: ['merge-images', 'split-image', 'resize-for-social-media', 'add-border', 'round-corners', 'zip-multiple-images'],
    reviewedAt: REVIEWED,
  },
} as const satisfies Record<string, ToolContent>;
