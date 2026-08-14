import type { ToolContent } from './tool-content';

const REVIEWED = '2026-08-15';

const PRIVACY_FAQ = {
  question: 'Is my video uploaded to a server?',
  answer: 'No. FFmpeg is compiled to WebAssembly and runs inside the page, so the file is read from your disk into the tab\'s own memory. Nothing about the video is sent to opentools.',
} as const;

const ENGINE_FAQ = {
  question: 'Why does the first render take longer?',
  answer: 'The FFmpeg WebAssembly build is about 31 MB and has to download before the first job can start. The browser caches it afterwards, so later visits skip that step and begin encoding almost immediately.',
} as const;

const LENGTH_LIMITATION = 'Everything is bounded by the memory one browser tab can claim. Clips under about 30 seconds are comfortable; multi-minute or 4K footage often stalls or fails with an out-of-memory error.';

export const VIDEO_TOOL_CONTENT = {
  'video-editor': {
    title: 'Video Editor',
    seoTitle: 'Free Online Video Editor – No Upload | opentools',
    description:
      'Multi-track video editor that trims clips, stacks layers, and adds text and image overlays, then exports with FFmpeg.',
    intro: [
      'The video editor gives you a timeline with two video tracks, so you can lay one clip over another and control which one sits on top. Clips can be cut, retimed with a speed curve, hidden, or moved between tracks, and text and image overlays sit above both video rows.',
      'Playback is handled by ordinary HTML video elements stacked in the preview, which is why scrubbing stays responsive. Export is a different job: FFmpeg compiled to WebAssembly composites the tracks bottom to top so the file you download matches what the preview showed.',
      'This is a browser tool, not a replacement for Premiere or Resolve. It is aimed at the case where you have a short clip and a couple of edits to make, and installing an editor or uploading footage to a website would both be worse options.',
    ],
    steps: [
      {
        title: 'Add your first clip',
        description: 'Drop a video onto the upload area. The editor probes its duration and dimensions, pulls thumbnails for the timeline strip, and draws an audio waveform so you can see where the sound is.',
      },
      {
        title: 'Cut, layer, and overlay',
        description: 'Drag the clip edges to trim, split at the playhead, or drop a second video onto the other track to layer it. The Video 1 row renders above Video 2. Text and image overlays are added from the side panel and positioned on the preview.',
      },
      {
        title: 'Export the timeline',
        description: 'Start the export and watch the progress readout. FFmpeg renders each track in order, applies the overlays, and hands back an MP4. Keep the tab in the foreground while it works.',
      },
    ],
    useCases: [
      'Trim a screen recording and stamp a title on it before sharing with a team.',
      'Put a webcam clip in the corner of a screen capture using the second video track.',
      'Cut a long demo down to the ten seconds that actually matter.',
      'Speed-ramp a slow section instead of exporting the whole clip at one rate.',
    ],
    limitations: [
      LENGTH_LIMITATION,
      'Export re-encodes everything, so a clip that was trimmed but otherwise untouched will still lose a little quality compared with a stream copy. Use Trim Video when a plain cut is all you need.',
      'There is no project save. Closing or reloading the tab discards the timeline, so export before you walk away.',
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        question: 'How long a video can the editor handle?',
        answer: 'Short clips work best. Under roughly 20 seconds with a couple of layers is reliable on a normal laptop. Beyond that, export time climbs quickly and the tab can run out of memory partway through a render.',
      },
      {
        question: 'Which clip appears on top when I stack two videos?',
        answer: 'The upper timeline row, labelled Video 1, renders above Video 2 in both the preview and the exported file. Drag a clip between rows to change the stacking, or use the Hide control to take a track out of the composite.',
      },
      {
        question: 'What format does the export produce?',
        answer: 'An MP4 with H.264 video, which plays in every current browser, phone, and editor. If you need WebM instead, export here and then run the result through Convert Video.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['trim-video', 'change-video-speed', 'compress-video', 'convert-video', 'video-to-gif', 'extract-audio'],
    reviewedAt: REVIEWED,
  },

  'trim-video': {
    title: 'Trim Video',
    seoTitle: 'Trim Video Online Free – No Re-encode | opentools',
    description:
      'Cut a video to an exact start and end time using stream copy, so the picture quality is untouched and the trim finishes in seconds.',
    intro: [
      'Trimming here is a stream copy. FFmpeg is told to seek to your start point and stop at your end point, then write the packets straight into a new container without decoding or re-encoding them. The output is bit-for-bit the same video data as the source, just shorter.',
      'That is why it finishes almost instantly even on a long file, and why there is no quality setting to choose. Re-encoding a trim would cost you a generation of quality for no benefit.',
      'One consequence of stream copy is worth knowing: the cut lands on the nearest keyframe rather than the exact millisecond you typed. If your clip has keyframes every two seconds, the real start can sit slightly before the number you entered.',
    ],
    steps: [
      {
        title: 'Load the video',
        description: 'Drop in an MP4, WebM, MOV, AVI, or MKV file. The FFmpeg engine begins loading in the background as soon as the file is selected, so it is usually ready by the time you have set your times.',
      },
      {
        title: 'Set start and end in seconds',
        description: 'Enter the start point and the end point. Leaving the end at 0 runs the clip through to the end of the file. Both fields accept decimals, so 12.5 is a valid start.',
      },
      {
        title: 'Trim and save',
        description: 'Run the trim and download the result. Because nothing is re-encoded, the file appears within a second or two for most inputs.',
      },
    ],
    useCases: [
      'Cut dead air off the front of a screen recording before sending it to a colleague.',
      'Pull a single 15 second answer out of a recorded interview.',
      'Drop the last few seconds where you reached over to stop the recording.',
      'Shorten a clip to fit a platform duration limit without touching its quality.',
    ],
    limitations: [
      'Cuts snap to the nearest keyframe, so the exact start can differ from the value you typed by up to a second or two depending on how the source was encoded.',
      'Stream copy keeps the original codec. If the source will not play somewhere, trimming will not fix that; run Convert Video afterwards.',
      'Very large files still have to be read into browser memory before FFmpeg can touch them, which limits how big an input a tab can accept.',
    ],
    faqs: [
      {
        question: 'Does trimming reduce the video quality?',
        answer: 'No. The trim copies the existing compressed streams into a new file rather than decoding and re-compressing them, so the frames you keep are identical to the original.',
      },
      {
        question: 'Why did my clip start slightly earlier than the time I entered?',
        answer: 'Stream copy can only cut on a keyframe. FFmpeg seeks to the closest one at or before your start time so the first frames still decode correctly. Encoding the clip again with a shorter keyframe interval gives finer control.',
      },
      PRIVACY_FAQ,
      {
        question: 'Can I trim several sections out of one video?',
        answer: 'Not in one pass here. Run the tool once per section, or use the Video Editor, which lets you split a clip on the timeline and delete the parts you do not want.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['video-editor', 'change-video-speed', 'compress-video', 'convert-video', 'mute-video', 'video-to-gif'],
    reviewedAt: REVIEWED,
  },

  'compress-video': {
    title: 'Compress Video',
    seoTitle: 'Compress Video Online Free – Reduce Size | opentools',
    description:
      'Shrink a video by re-encoding it with H.264 at a quality level you choose, from near-transparent to aggressively small.',
    intro: [
      'Compression re-encodes the video with libx264 using constant rate factor, or CRF. Instead of picking a target bitrate and hoping it suits the footage, you pick a quality level and the encoder spends whatever bitrate that level needs. Simple screen recordings end up tiny; detailed camera footage keeps more data because it needs it.',
      'The three presets map to CRF 23, 28, and 35. Lower numbers mean better quality and larger files. CRF 23 is close to visually transparent for most content, 28 is a sensible default when you just need the file smaller, and 35 is for when a size limit matters more than looking good.',
      'Audio is re-encoded to AAC at 128 kbps when the source has a sound track. If it has none, the audio stage is skipped rather than producing a silent track.',
    ],
    steps: [
      {
        title: 'Add the video',
        description: 'Drop in the file you need to shrink. Screen recordings and phone video usually compress dramatically because they contain a lot of visually simple, repetitive frames.',
      },
      {
        title: 'Pick a quality level',
        description: 'Choose high quality, balanced, or small file. Start with balanced. If the result is still too large, step down rather than trying to guess a bitrate.',
      },
      {
        title: 'Encode and compare',
        description: 'Run the compression, then check the output size against the original and watch a few seconds of the result before you throw the source away.',
      },
    ],
    useCases: [
      'Get a screen recording under an email or chat attachment limit.',
      'Cut the size of phone footage before backing it up.',
      'Re-encode an oversized capture so it uploads in reasonable time.',
      'Normalise a mixed batch of clips to one predictable quality level.',
    ],
    limitations: [
      LENGTH_LIMITATION,
      'Compression always re-encodes, so quality drops a little even at CRF 23. Compressing an already compressed file a second time compounds that loss.',
      'Browser encoding is single threaded and slower than a native FFmpeg build. Expect a short clip to take noticeably longer here than on the command line.',
    ],
    faqs: [
      {
        question: 'How much smaller will my video get?',
        answer: 'It depends entirely on the source. A screen recording exported at a high bitrate can drop by 80 percent or more at the balanced setting, while footage that was already compressed efficiently may barely shrink at all.',
      },
      {
        question: 'What is CRF and why not just set a bitrate?',
        answer: 'CRF asks the encoder to hold a constant perceived quality and vary the bitrate to achieve it. A fixed bitrate wastes data on easy scenes and starves complex ones, so CRF usually gives a better result at the same file size.',
      },
      PRIVACY_FAQ,
      {
        question: 'Will the video still play everywhere after compression?',
        answer: 'Yes. The output is H.264 video with AAC audio in an MP4 container, using yuv420p pixel format, which is the most broadly supported combination available.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['convert-video', 'trim-video', 'video-to-gif', 'video-editor', 'change-video-speed', 'mute-video'],
    reviewedAt: REVIEWED,
  },

  'convert-video': {
    title: 'Convert Video',
    seoTitle: 'Convert Video Online Free – MP4 and WebM | opentools',
    description:
      'Convert between MP4 with H.264 and WebM with VP9 in your browser, with no queue and no server-imposed file size cap.',
    intro: [
      'Two output targets are available. MP4 uses libx264 for video and AAC for audio, which is the combination that plays on essentially every device and editor made in the last decade. WebM uses libvpx-vp9 with Opus audio, which usually reaches the same visual quality at a smaller size and is a good fit for embedding video on a web page.',
      'MP4 output is encoded at CRF 22 and WebM at CRF 30 in constant quality mode. The numbers are not comparable across codecs; both are tuned to land near visually transparent for typical footage.',
      'VP9 encoding is considerably slower than H.264, especially in a browser where FFmpeg runs single threaded. Converting to WebM will take longer than converting to MP4 for the same input, so budget for that on anything but a very short clip.',
    ],
    steps: [
      {
        title: 'Add the source video',
        description: 'Drop in MP4, WebM, MOV, AVI, or MKV. The container matters less than the codecs inside it, and FFmpeg reads all of these directly.',
      },
      {
        title: 'Choose MP4 or WebM',
        description: 'Pick MP4 for maximum compatibility, sharing, and editing. Pick WebM when you are putting the video on a website and want the smallest file that modern browsers can play.',
      },
      {
        title: 'Convert and check playback',
        description: 'Run the conversion and play the first few seconds of the result. Confirm the audio survived if the source had a sound track.',
      },
    ],
    useCases: [
      'Turn a MOV from an iPhone into MP4 so Windows and older editors will open it.',
      'Produce a WebM version of a clip to cut page weight on a site.',
      'Rewrap an MKV download into MP4 for a device that refuses to play it.',
      'Standardise a folder of mixed formats before importing them into one project.',
    ],
    limitations: [
      LENGTH_LIMITATION,
      'VP9 encoding is slow in WebAssembly. A clip that converts to MP4 in under a minute can take several times longer as WebM.',
      'Conversion re-encodes, so it is not lossless. If you only need a different container and the codecs are already right, a stream copy in a desktop tool preserves quality better.',
    ],
    faqs: [
      {
        question: 'Should I choose MP4 or WebM?',
        answer: 'MP4 if the file needs to play or be edited anywhere without thought. WebM if it is going on a web page and file size matters, since VP9 generally beats H.264 at the same quality.',
      },
      {
        question: 'Can I convert MOV files from my iPhone?',
        answer: 'Yes. MOV inputs are read directly and can be written out as either MP4 or WebM. MP4 is the usual choice because it keeps H.264 compatibility while dropping the Apple-specific container.',
      },
      PRIVACY_FAQ,
      {
        question: 'Is there a file size limit?',
        answer: 'No limit is imposed by a server, because there is no server involved. The practical ceiling is your device: the file has to fit in the browser tab\'s memory alongside the decoded frames FFmpeg is working on.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['compress-video', 'video-to-gif', 'trim-video', 'video-editor', 'extract-audio', 'rotate-video'],
    reviewedAt: REVIEWED,
  },

  'video-to-gif': {
    title: 'Video to GIF',
    seoTitle: 'Video to GIF Free Online – No Upload | opentools',
    description:
      'Turn a clip into an animated GIF using a palette generated from your own footage, with adjustable frame rate and width.',
    intro: [
      'GIF only supports 256 colours per frame, so the quality of a converted clip depends almost entirely on which 256 colours you get. This tool runs FFmpeg\'s palettegen and paletteuse filters, which analyse your specific footage and build a palette from it instead of falling back to a generic web palette. The difference on skin tones and gradients is large.',
      'Scaling uses the Lanczos filter, which keeps edges and text noticeably sharper than the default bilinear resize. Width is yours to set up to 1280 pixels and height follows automatically to preserve the aspect ratio.',
      'Frame rate and duration are the two settings that drive file size hardest. A GIF has no interframe compression worth the name, so ten seconds at 24 fps is roughly two and a half times the data of ten seconds at 10 fps. Duration is capped at 30 seconds for that reason.',
    ],
    steps: [
      {
        title: 'Add the video and pick the segment',
        description: 'Drop in your clip, then set a start time and a duration of up to 30 seconds. Choosing a tight segment is the single most effective way to keep the GIF small.',
      },
      {
        title: 'Set frame rate and width',
        description: 'Ten frames per second suits screen recordings and reads as smooth enough for most motion. Fifteen is a reasonable middle. Twenty-four looks best on fast movement and costs the most. Width defaults to 480 pixels, which is usually plenty for a README or a chat message.',
      },
      {
        title: 'Generate and check the size',
        description: 'Run the conversion and look at the output size. If it is too big, cut the duration first, then the frame rate, then the width.',
      },
    ],
    useCases: [
      'Show a bug reproduction in a GitHub issue where video will not autoplay inline.',
      'Add a short interaction demo to a README or changelog entry.',
      'Make a looping reaction clip for a chat that blocks video attachments.',
      'Turn a product interaction into an image that renders in an email client.',
    ],
    limitations: [
      'GIF is limited to 256 colours per frame. Footage with heavy gradients or film grain will show banding no matter how good the palette is.',
      'File sizes grow fast. A few seconds at a high frame rate and full width can easily exceed several megabytes, which is often larger than the source video.',
      'Duration is capped at 30 seconds because palette generation and GIF encoding both hold every frame in browser memory.',
    ],
    faqs: [
      {
        question: 'Why is my GIF larger than the original video?',
        answer: 'That is normal and expected. Modern video codecs compress across frames, while GIF stores each frame almost independently with a 256 colour palette. For anything more than a few seconds, video is dramatically more efficient.',
      },
      {
        question: 'How do I make the GIF smaller?',
        answer: 'Shorten the duration first, since size scales almost linearly with it. Then drop the frame rate to 10 fps. Reducing the width helps too, because it cuts pixels per frame quadratically.',
      },
      {
        question: 'Why do the colours look better here than other converters?',
        answer: 'The palette is generated from your clip rather than reused from a fixed table. FFmpeg scans the selected frames, picks 256 colours that suit that specific footage, then maps the frames onto it.',
      },
      PRIVACY_FAQ,
      ENGINE_FAQ,
    ],
    relatedToolIds: ['gif-optimizer', 'gif-resizer', 'images-to-gif', 'gif-to-images', 'trim-video', 'compress-video'],
    reviewedAt: REVIEWED,
  },

  'extract-audio': {
    title: 'Extract Audio',
    seoTitle: 'Video to MP3 Free Online – Extract Audio | opentools',
    description:
      'Save the audio track from a video as a variable bitrate MP3, encoded on your own device with the LAME encoder.',
    intro: [
      'The video stream is discarded and the audio is re-encoded to MP3 with libmp3lame in variable bitrate mode. VBR spends more bits on complex passages and fewer on quiet ones, which gives a better result per megabyte than a fixed bitrate at the same average size.',
      'Three quality settings map to LAME\'s VBR scale, where lower numbers mean higher quality. Setting 0 is roughly 245 kbps average and is close to transparent for music. Setting 2 sits around 190 kbps and is the usual recommendation. Setting 5 is near 130 kbps and is fine for speech.',
      'Before the audio stage runs, the file is probed to confirm it actually has a sound track. A video with no audio produces a clear message rather than a zero length MP3.',
    ],
    steps: [
      {
        title: 'Add the video',
        description: 'Drop in the clip you want the sound from. Any container FFmpeg reads will work, including MP4, WebM, MOV, AVI, and MKV.',
      },
      {
        title: 'Choose MP3 quality',
        description: 'Use best for music you care about, high for general use, and medium for speech, lectures, or interviews where file size matters more than fidelity.',
      },
      {
        title: 'Extract and download',
        description: 'Run the extraction and save the MP3. Audio-only encoding is much faster than video work, so this finishes quickly even on longer files.',
      },
    ],
    useCases: [
      'Keep the audio from a recorded talk or interview for transcription.',
      'Save a soundtrack from a video you shot yourself.',
      'Turn a recorded meeting into an MP3 you can listen to while walking.',
      'Pull a voiceover out of a rough cut so it can be re-used against new footage.',
    ],
    limitations: [
      'MP3 is a lossy format, so encoding from a video\'s already compressed audio loses a little more. For archival work, a lossless container is a better destination.',
      'Only MP3 output is offered here. There is no WAV, FLAC, or AAC target.',
      'Videos with several audio tracks, such as multiple language dubs, will give you the default track rather than a choice.',
    ],
    faqs: [
      {
        question: 'What audio quality should I pick?',
        answer: 'Use high, the VBR 2 setting, unless you have a reason not to. It averages around 190 kbps and is hard to distinguish from the source for most listeners. Drop to medium for speech-only recordings.',
      },
      {
        question: 'Does this work if the video has no sound?',
        answer: 'The file is checked for an audio stream first. If there is none, you get an explicit message instead of an empty MP3 file.',
      },
      PRIVACY_FAQ,
      {
        question: 'Can I get lossless audio out instead?',
        answer: 'Not with this tool. The output is always MP3. Extracting the original audio stream without re-encoding needs a desktop FFmpeg build with a stream copy to a matching container.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['mute-video', 'trim-video', 'convert-video', 'compress-video', 'video-editor', 'video-to-gif'],
    reviewedAt: REVIEWED,
  },

  'mute-video': {
    title: 'Mute Video',
    seoTitle: 'Remove Audio from Video Free Online | opentools',
    description:
      'Strip the audio from a video while copying the picture untouched, so there is no quality loss and almost no waiting.',
    intro: [
      'Muting drops the audio stream and copies the video stream verbatim into a new file. No frames are decoded or re-encoded, so the picture is identical to the source and the operation finishes in about the time it takes to write the file.',
      'This is genuinely different from setting the volume to zero in a player or an editor. The audio data is removed from the container, so whoever receives the file has no way to recover it.',
      'Because the video is copied rather than re-encoded, the output keeps the original codec. A muted H.264 file is still H.264 at the same bitrate and quality it started with.',
    ],
    steps: [
      {
        title: 'Add the video',
        description: 'Drop in the clip whose audio you want gone. Any format FFmpeg reads is accepted.',
      },
      {
        title: 'Run the mute',
        description: 'There is nothing to configure. The tool discards the audio stream and stream-copies the video.',
      },
      {
        title: 'Download the silent file',
        description: 'Save the result. Confirm in a player that the audio track is absent rather than just quiet.',
      },
    ],
    useCases: [
      'Remove background conversation from a screen recording before sharing it.',
      'Strip a copyrighted track from a clip so a platform will not block it.',
      'Silence a video that will be captioned or narrated separately later.',
      'Drop microphone noise from a capture where only the picture matters.',
    ],
    limitations: [
      'The whole track is removed. There is no way to mute only part of the timeline here; use the Video Editor for that.',
      'Removing audio is permanent in the output file. Keep your original if you might want the sound back.',
      'A video with no audio stream to begin with produces a copy rather than an error, which can look like nothing happened.',
    ],
    faqs: [
      {
        question: 'Does muting reduce video quality?',
        answer: 'No. The video stream is copied without being decoded, so the frames in the output are byte-identical to the source. Only the audio is dropped.',
      },
      {
        question: 'Is the audio really gone, or just silenced?',
        answer: 'Genuinely gone. The audio stream is excluded from the output container, so the data is not present in the file at all and cannot be turned back up.',
      },
      PRIVACY_FAQ,
      {
        question: 'Can I mute just one section of the video?',
        answer: 'Not with this tool, which removes the track wholesale. The Video Editor lets you work with clips on a timeline and control audio per track.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['extract-audio', 'trim-video', 'video-editor', 'compress-video', 'convert-video', 'change-video-speed'],
    reviewedAt: REVIEWED,
  },

  'rotate-video': {
    title: 'Rotate Video',
    seoTitle: 'Rotate Video Online Free – 90 or 180 Degrees | opentools',
    description:
      'Rotate a video 90 degrees either direction or a full 180, re-encoding the frames so every player shows the new orientation.',
    intro: [
      'Rotation applies FFmpeg\'s transpose filter for the quarter turns and a combined horizontal and vertical flip for 180 degrees. Because the pixels are genuinely rearranged, the fix holds everywhere. That matters, because the common alternative is to write a rotation flag into the container metadata, which some players honour and others ignore.',
      'Phone footage is the usual reason people need this. A clip recorded with the handset turned sideways often carries an orientation flag that looks right in the phone gallery and sideways in a browser, an editor, or a presentation.',
      'Rearranging pixels means re-encoding, so this is slower than trimming or muting and costs a small amount of quality. Audio is carried through when the source has a track.',
    ],
    steps: [
      {
        title: 'Add the video',
        description: 'Drop in the clip that is showing the wrong way round.',
      },
      {
        title: 'Choose the rotation',
        description: 'Pick 90 degrees clockwise, 90 counter-clockwise, or 180. For sideways phone video, one of the quarter turns will be right; if you guess wrong, the result makes it obvious which one you needed.',
      },
      {
        title: 'Encode and verify',
        description: 'Run the rotation and open the output. Check the orientation in a different player than the one you noticed the problem in.',
      },
    ],
    useCases: [
      'Fix phone video that appears sideways once it leaves the phone.',
      'Correct a clip recorded on a camera that was mounted upside down.',
      'Turn landscape footage upright for a vertical video platform.',
      'Normalise orientation across clips before importing them into one timeline.',
    ],
    limitations: [
      'The video is re-encoded, so there is a small quality cost and the job takes longer than a stream copy.',
      LENGTH_LIMITATION,
      'Only 90, 180, and 270 degree rotations are available. Arbitrary angles would need padding and would leave empty corners.',
    ],
    faqs: [
      {
        question: 'Why does my phone video look correct on the phone but sideways elsewhere?',
        answer: 'The phone stores the clip in its native sensor orientation and adds a rotation flag to the metadata. Its own gallery reads that flag; many browsers, editors, and presentation tools do not, so they show the raw orientation.',
      },
      {
        question: 'Does this fix the problem permanently?',
        answer: 'Yes. The frames themselves are rotated rather than tagged, so no player has to interpret a flag to get it right.',
      },
      PRIVACY_FAQ,
      {
        question: 'Which direction do I need?',
        answer: 'For footage that appears rotated a quarter turn, try 90 degrees clockwise first. If the result is upside down relative to what you wanted, the counter-clockwise option is the correct one.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['trim-video', 'convert-video', 'compress-video', 'video-editor', 'mirror-image', 'change-video-speed'],
    reviewedAt: REVIEWED,
  },

  'change-video-speed': {
    title: 'Change Video Speed',
    seoTitle: 'Change Video Speed Online Free – 0.25x to 4x | opentools',
    description:
      'Speed up or slow down a video from a quarter speed to four times, retiming the audio alongside the picture.',
    intro: [
      'Video timing is changed with the setpts filter, which rewrites each frame\'s presentation timestamp. Audio is handled separately with atempo, which stretches or compresses the waveform in time while leaving pitch broadly intact, so sped-up speech does not turn into a chipmunk.',
      'Six presets are available: 0.25x, 0.5x, 0.75x, 1.5x, 2x, and 4x. Slowing a clip down does not create new frames, so at 0.25x you are seeing each original frame held four times as long. Footage shot at a high frame rate slows down much more convincingly than standard 30 fps video.',
      'If the source has no audio, the audio filter is skipped entirely rather than failing or emitting a silent track.',
    ],
    steps: [
      {
        title: 'Add the video',
        description: 'Drop in the clip you want to retime.',
      },
      {
        title: 'Pick a speed',
        description: 'Values above 1 shorten the clip, values below 1 lengthen it. Two times is the usual choice for trimming dead time out of a demo; 0.5x is the common pick for examining fast motion.',
      },
      {
        title: 'Render and watch it back',
        description: 'Run the change and play the result. Listen to the audio too, since heavy speed changes are more audible than they are visible.',
      },
    ],
    useCases: [
      'Halve the running time of a long screen demo so it fits an attention span.',
      'Slow a fast interaction down enough to see what the interface actually did.',
      'Speed a timelapse-style recording up to 4x for a summary clip.',
      'Fit a clip to a platform duration cap without cutting content out of it.',
    ],
    limitations: [
      'Slowing down repeats existing frames rather than interpolating new ones, so heavy slow motion on ordinary footage looks stuttery.',
      'The audio retime keeps pitch roughly stable but is not transparent. At 4x or 0.25x, speech develops audible artefacts.',
      LENGTH_LIMITATION,
    ],
    faqs: [
      {
        question: 'Does the audio pitch change when I speed up the video?',
        answer: 'Not appreciably. Audio is retimed with atempo, which changes duration while holding pitch, rather than simply resampling. Extreme settings still introduce artefacts, but voices stay recognisable.',
      },
      {
        question: 'Why does slow motion look choppy?',
        answer: 'There are no extra frames to show. At 0.5x each original frame is held twice as long, so 30 fps footage effectively plays at 15. Filming at a higher frame rate in the first place is the only real fix.',
      },
      PRIVACY_FAQ,
      {
        question: 'Can I ramp the speed gradually instead of applying one rate?',
        answer: 'Yes, but not here. The Video Editor supports a speed curve per clip with easing, so a clip can start at normal speed and accelerate.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['video-editor', 'trim-video', 'reverse-video', 'compress-video', 'convert-video', 'video-to-gif'],
    reviewedAt: REVIEWED,
  },

  'reverse-video': {
    title: 'Reverse Video',
    seoTitle: 'Reverse Video Online Free – Play Backwards | opentools',
    description:
      'Play a clip backwards, audio included, using FFmpeg reverse filters that run entirely inside your browser tab.',
    intro: [
      'Reversing applies the reverse filter to the video and areverse to the audio when a sound track is present. Both work the same way: the stream is buffered in full, then written out back to front.',
      'That buffering is the important constraint. Unlike trimming or muting, reversal cannot stream through the file, because the last frame has to be available before the first one can be written. Every decoded frame sits in memory at once, so this is the most memory-hungry operation in the video toolset.',
      'Keep clips short. A few seconds is comfortable. Ten or more seconds of high resolution footage will often exhaust the tab before it finishes.',
    ],
    steps: [
      {
        title: 'Trim first, then add the clip',
        description: 'If your source is long, cut it down with Trim Video before reversing. Feeding a short segment in is the difference between this working and failing.',
      },
      {
        title: 'Run the reversal',
        description: 'There are no settings. Video is reversed, and audio too if the file has any.',
      },
      {
        title: 'Download the result',
        description: 'Save the reversed clip and play it through to confirm the whole thing rendered rather than stopping early.',
      },
    ],
    useCases: [
      'Make a loop that plays forward then back for a social post.',
      'Reverse a pouring or falling shot for a visual gag.',
      'Study a fast motion by watching it unwind from the end.',
      'Create a rewind effect to bookend a short clip.',
    ],
    limitations: [
      'Every frame is held in memory simultaneously, so this fails on clips that other tools here handle comfortably. Trim before reversing.',
      'The output is re-encoded, which costs a small amount of quality relative to the source.',
      'Reversed audio is rarely useful on its own. Consider running Mute Video first if you only want the picture reversed.',
    ],
    faqs: [
      {
        question: 'Why does reversing fail when other tools work on the same file?',
        answer: 'Reversal has to buffer the entire decoded stream before it can write anything, because the output starts with the input\'s last frame. Trimming and muting stream through the file and need very little memory by comparison.',
      },
      {
        question: 'Is the audio reversed too?',
        answer: 'Yes, when the source has an audio track. If you want silent reversed video, run Mute Video on the clip first and then reverse it.',
      },
      PRIVACY_FAQ,
      {
        question: 'How long a clip can I reverse?',
        answer: 'Aim for a few seconds. There is no fixed cap, but memory use scales with resolution and duration together, so a short 1080p clip is fine while a longer 4K one will not complete.',
      },
      ENGINE_FAQ,
    ],
    relatedToolIds: ['trim-video', 'change-video-speed', 'mute-video', 'video-editor', 'video-to-gif', 'compress-video'],
    reviewedAt: REVIEWED,
  },
} as const satisfies Record<string, ToolContent>;
