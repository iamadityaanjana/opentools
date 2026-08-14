import type { ToolContent } from './tool-content';

const REVIEWED = '2026-08-15';

const PRIVACY_FAQ = {
  question: 'Is my PDF uploaded anywhere?',
  answer: 'No. The document is processed by WebAssembly and JavaScript running inside the page, so the bytes never leave your device. There is no upload step and nothing to delete afterwards.',
} as const;

export const PDF_TOOL_CONTENT = {
  'protect-pdf-with-password': {
    title: 'Password Protect PDF',
    seoTitle: 'Password Protect PDF Free Online – AES-256 | opentools',
    description:
      'Encrypt a PDF with 256-bit AES using qpdf compiled to WebAssembly, so neither the file nor the password reaches a server.',
    intro: [
      'Encryption is handled by qpdf, the same library many command line workflows rely on, compiled to WebAssembly and run inside the page. The document is encrypted with 256-bit AES, which is the strongest scheme the PDF specification defines and the one current readers expect.',
      'This is the part that matters when the file is sensitive: a server-side encryption service has to receive your unprotected document and your chosen password in order to do the work. Here both stay in the tab. The encrypted output is assembled locally and handed to your browser as a download.',
      'If you leave the owner password blank it is set to match the user password. The user password is the one needed to open the document, so that combination is the straightforward "you need this password to read the file" setup rather than a permissions-only restriction that most readers ignore anyway.',
    ],
    steps: [
      {
        title: 'Add the PDF',
        description: 'Drop in the document you want to protect. It must not already be encrypted; remove an existing password first if it is.',
      },
      {
        title: 'Set the password',
        description: 'Choose a user password, which is what someone types to open the file. Set an owner password too if you want a separate credential for permissions, or leave it blank to reuse the user password.',
      },
      {
        title: 'Encrypt and store the password somewhere safe',
        description: 'Run the encryption and download the result. There is no recovery path, so record the password in a password manager before you send the file on.',
      },
    ],
    useCases: [
      'Protect a contract or payslip before emailing it as an attachment.',
      'Encrypt medical or financial records that are being shared outside an organisation.',
      'Add a password to a document going into shared cloud storage.',
      'Restrict a draft so only intended reviewers can open it.',
    ],
    limitations: [
      'A lost password cannot be recovered. AES-256 encryption is not reversible without the credential, and opentools keeps no copy of it.',
      'Encryption protects the file, not the content once it is open. Whoever has the password can copy, print, or screenshot the pages.',
      'Already encrypted PDFs need decrypting first. Run Remove PDF Password before adding a new one.',
    ],
    faqs: [
      {
        question: 'How strong is the encryption?',
        answer: 'It uses 256-bit AES, the strongest option in the PDF specification, applied by qpdf. A password of reasonable length and randomness is not feasible to brute force; a short dictionary word is, so the password you choose matters more than the cipher.',
      },
      PRIVACY_FAQ,
      {
        question: 'What is the difference between the user and owner password?',
        answer: 'The user password is required to open the document. The owner password governs permissions such as printing and editing, and can bypass those restrictions. Leaving the owner field blank sets it to the user password.',
      },
      {
        question: 'Can I recover the file if I forget the password?',
        answer: 'No. Nothing about the document or the password is stored anywhere, and the encryption has no back door. Save the password before you distribute the file.',
      },
      {
        question: 'Will the protected PDF open in any reader?',
        answer: 'Yes, in any reader that supports AES-256, which covers current versions of Acrobat, Preview, Chrome, Edge, and Firefox. Very old readers predating the standard may not open it.',
      },
    ],
    relatedToolIds: ['remove-pdf-password', 'unlock-pdf', 'redact-pdf', 'remove-pdf-metadata', 'flatten-pdf', 'add-watermark-to-pdf'],
    reviewedAt: REVIEWED,
  },

  'remove-pdf-password': {
    title: 'Remove PDF Password',
    seoTitle: 'Remove PDF Password Free Online – No Upload | opentools',
    description:
      'Strip the password from an encrypted PDF you have the credentials for, keeping selectable text, bookmarks, and page structure.',
    intro: [
      'This decrypts a PDF you can already open and writes out an unencrypted copy. You supply the password, qpdf decrypts the document in the page, and the result is a normal PDF that opens without a prompt.',
      'Decryption is lossless. The page objects, fonts, embedded images, bookmarks, and text layer come through unchanged, which is the important difference from the workaround of printing to PDF or exporting page images. Those approaches produce a file where the text is no longer selectable or searchable.',
      'You need the password. There is no cracking here, and there could not be: AES-256 without the credential is not something a browser tab is going to get through. If you are locked out of your own document, the password has to come from wherever it was set.',
    ],
    steps: [
      {
        title: 'Add the encrypted PDF',
        description: 'Drop in the protected document. Your reader will have prompted for a password when you last opened it.',
      },
      {
        title: 'Enter the password',
        description: 'Type the password that opens the file. It is used only to decrypt the document locally and is not transmitted or retained.',
      },
      {
        title: 'Download the unlocked copy',
        description: 'Save the decrypted PDF. Open it once to confirm there is no password prompt and that the text is still selectable.',
      },
    ],
    useCases: [
      'Stop retyping a password on a bank or utility statement you open every month.',
      'Decrypt a document so it can be merged, split, or compressed by other tools.',
      'Remove protection from an archived file before storing it somewhere already secured.',
      'Prepare an encrypted PDF for a workflow that cannot supply a password.',
    ],
    limitations: [
      'The correct password is required. This tool decrypts, it does not crack.',
      'Removing the password removes the protection. Do not do it to a file that stays in a place where the encryption was the thing keeping it safe.',
      'Only the password and encryption are removed. Watermarks, redaction boxes drawn as content, and metadata are all still there afterwards.',
    ],
    faqs: [
      {
        question: 'Do I need to know the password?',
        answer: 'Yes. The document is decrypted with the credential you supply. There is no way to open an AES-256 encrypted PDF without it.',
      },
      PRIVACY_FAQ,
      {
        question: 'Does the text stay selectable and searchable?',
        answer: 'Yes. Decryption is lossless and leaves the document structure intact, so text, fonts, bookmarks, and links all survive. Printing to PDF as a workaround would flatten the text into pixels instead.',
      },
      {
        question: 'How is this different from the Unlock PDF tool?',
        answer: 'They run the same decryption. Remove PDF Password is framed around a document you open with a password every day; Unlock PDF is framed around a file whose restrictions are blocking another tool. Either page will do the job.',
      },
      {
        question: 'Will the file size change?',
        answer: 'Slightly, usually downward, because the encryption layer and its padding are gone. The page content is unchanged.',
      },
    ],
    relatedToolIds: ['unlock-pdf', 'protect-pdf-with-password', 'compress-pdf', 'merge-pdfs', 'remove-pdf-metadata', 'extract-text-from-pdf'],
    reviewedAt: REVIEWED,
  },

  'unlock-pdf': {
    title: 'Unlock PDF',
    seoTitle: 'Unlock PDF Free Online – Remove Encryption | opentools',
    description:
      'Decrypt a PDF you can open so other tools stop refusing it, losslessly and without sending the document to a server.',
    intro: [
      'An encrypted PDF breaks a lot of ordinary workflows. Merge tools reject it, compressors cannot read the streams, and text extraction returns nothing. Unlocking removes the encryption layer so the document behaves like any other PDF.',
      'qpdf performs the decryption inside the page. The output keeps the original page objects, embedded fonts, and text layer, so a document that had selectable text still has selectable text. That is the difference between decrypting and the common workaround of re-printing the file, which turns the pages into images.',
      'This handles encryption, which is the restriction that actually blocks software. It is not a way into a document whose password you do not have.',
    ],
    steps: [
      {
        title: 'Add the locked PDF',
        description: 'Drop in the file that other tools are refusing to open or process.',
      },
      {
        title: 'Supply the password if there is one',
        description: 'Enter the password that opens the document. Some PDFs carry permission restrictions with no open password at all, in which case the field can stay empty.',
      },
      {
        title: 'Download and continue',
        description: 'Save the unlocked file and feed it into whatever tool was rejecting it.',
      },
    ],
    useCases: [
      'Unlock a statement so a merge or split tool will accept it.',
      'Make an encrypted document readable by a text extraction step.',
      'Clear restrictions blocking a compression pass before archiving.',
      'Prepare a protected file for an automated pipeline that cannot answer a password prompt.',
    ],
    limitations: [
      'If the document requires a password to open, you have to know it. Encryption without the key is not breakable here.',
      'Unlocking removes protection from the copy you download. Keep the encrypted original if the protection still matters.',
      'Permission flags that a reader chose to enforce are gone after unlocking, but flags were never a real security boundary in the first place.',
    ],
    faqs: [
      {
        question: 'Can this unlock a PDF when I do not know the password?',
        answer: 'No. Documents needing a password to open use AES encryption, and the content cannot be recovered without the credential. Files that only carry permission restrictions and open freely can be processed with the password field left blank.',
      },
      PRIVACY_FAQ,
      {
        question: 'Is the unlocked PDF identical to the original?',
        answer: 'The page content is. Decryption rewrites the file without the encryption layer while leaving text, fonts, images, and bookmarks untouched, so nothing is rasterised or re-compressed.',
      },
      {
        question: 'Which tool should I use, Unlock PDF or Remove PDF Password?',
        answer: 'Both run the same qpdf decryption. Pick Unlock PDF when the goal is to get another tool to accept the file, and Remove PDF Password when the goal is to stop being prompted every time you open it.',
      },
      {
        question: 'Does unlocking work on scanned PDFs?',
        answer: 'Yes, though a scanned document contains page images rather than text, so it will still have no searchable text after unlocking. That is a property of the scan, not the encryption.',
      },
    ],
    relatedToolIds: ['remove-pdf-password', 'protect-pdf-with-password', 'extract-text-from-pdf', 'merge-pdfs', 'compress-pdf', 'flatten-pdf'],
    reviewedAt: REVIEWED,
  },

  'redact-pdf': {
    title: 'Redact PDF',
    seoTitle: 'Redact PDF Free Online – Permanently Remove | opentools',
    description:
      'Draw boxes over sensitive content and export a PDF where those pixels are genuinely gone rather than hidden under a shape.',
    intro: [
      'Most attempts at redaction fail in the same way. A black rectangle drawn in a PDF annotation tool sits on top of the text as a separate object, and the words underneath are still in the file. Selecting the page, copying, and pasting into a text editor reveals them. So does any tool that reads the content stream.',
      'This tool takes a different route. Each page is rendered to a raster image at your chosen resolution, your redaction boxes are filled on that image, and the result is written back into a new PDF. The original text objects are not in the output at all, because the output contains pictures of the pages rather than the pages themselves.',
      'The trade-off is deliberate and worth understanding. Rasterising removes the text layer, so the redacted document is no longer searchable or selectable, and the file is usually larger. For genuinely sensitive material that is the right trade, because a searchable document is exactly the one that leaks what you covered up.',
    ],
    steps: [
      {
        title: 'Add the PDF and pick a resolution',
        description: 'Drop in the document and choose a raster resolution between 72 and 300 DPI. Use 150 for screen reading and 300 if the result will be printed or contains small type.',
      },
      {
        title: 'Draw boxes over what must go',
        description: 'Mark each region to redact on the page previews. Cover generously; a box that clips the top of a line of text can leave enough of the letter shapes to read.',
      },
      {
        title: 'Export and verify',
        description: 'Export the redacted PDF, then check it properly. Try selecting text over a redacted area and pasting it elsewhere. Nothing should come out, because there is no text layer left.',
      },
    ],
    useCases: [
      'Remove names, addresses, or account numbers before filing a document publicly.',
      'Redact salary figures from a contract being shared with a wider group.',
      'Black out patient or client identifiers in records used as examples.',
      'Strip personal data from a document in response to a disclosure request.',
    ],
    limitations: [
      'The output has no text layer, so the document stops being searchable and selectable. That is inherent to redacting by rasterising.',
      'File size usually grows, because page images are larger than the vector text and drawing instructions they replace.',
      'Only what your boxes cover is removed from view. Metadata, attachments, and content outside the visible page area are untouched, so run Remove PDF Metadata as well when a document is going out publicly.',
    ],
    faqs: [
      {
        question: 'Is the redacted text really gone?',
        answer: 'Yes. The exported PDF contains rendered images of the pages with your boxes burned into the pixels. The original text objects are not carried into the output, so there is nothing underneath to select, copy, or extract.',
      },
      {
        question: 'Why not just draw black rectangles in a PDF annotator?',
        answer: 'Because an annotation is a separate object layered above the text. The words stay in the content stream and can be copied out or read by any parser. That mistake has caused real disclosures of supposedly redacted filings.',
      },
      PRIVACY_FAQ,
      {
        question: 'What resolution should I choose?',
        answer: 'Use 150 DPI for documents that will be read on screen. Choose 300 DPI when the file will be printed or has small text, and accept the larger output. Below about 120 DPI, body text starts to look soft.',
      },
      {
        question: 'Can I still search the document afterwards?',
        answer: 'No, and that is the point. Keeping a searchable text layer alongside redacted images would mean keeping the very words you removed. If you need searchability, redact first and then run OCR on the result in a separate tool.',
      },
    ],
    relatedToolIds: ['remove-pdf-metadata', 'flatten-pdf', 'protect-pdf-with-password', 'add-watermark-to-pdf', 'pdf-editor', 'extract-text-from-pdf'],
    reviewedAt: REVIEWED,
  },

  'rotate-pages': {
    title: 'Rotate PDF Pages',
    seoTitle: 'Rotate PDF Pages Free Online – No Upload | opentools',
    description:
      'Rotate chosen PDF pages in 90 degree steps by rewriting the page rotation value, leaving text and vectors fully intact.',
    intro: [
      'Rotation is applied by changing each selected page\'s rotation property, which is a value the PDF format carries specifically for this purpose. Nothing about the page content is redrawn or re-compressed, so text stays selectable, vectors stay sharp, and the file size barely moves.',
      'Rotations are additive against whatever the page already had. Applying 90 degrees to a page that was already at 90 leaves it at 180, and the value wraps cleanly rather than accumulating past a full turn.',
      'Page selection accepts ranges, so a scan where only the landscape pages came out sideways can be fixed without touching the rest of the document. Leave the selection blank to rotate everything.',
    ],
    steps: [
      {
        title: 'Add the PDF',
        description: 'Drop in the document with pages facing the wrong way.',
      },
      {
        title: 'Choose pages and angle',
        description: 'Enter a page selection such as 2-5, 8 or leave it blank for the whole document, then pick 90, 180, or 270 degrees.',
      },
      {
        title: 'Save and check',
        description: 'Download the result and confirm the orientation in your reader. Because the change is a property rather than new pixels, it applies instantly.',
      },
    ],
    useCases: [
      'Straighten pages from a scanner that fed some sheets sideways.',
      'Turn landscape tables upright in a mostly portrait report.',
      'Fix a document assembled from sources with mismatched orientation.',
      'Correct upside down pages from a duplex scan.',
    ],
    limitations: [
      'Only quarter turns are possible. Correcting a small skew from a crooked scan needs a deskew tool that resamples the image.',
      'Some viewers cache the previous orientation. If a page still looks wrong, close and reopen the file rather than assuming the rotation failed.',
      'Rotation changes how the page is displayed, not the coordinates content was authored against, so tools that place items by absolute position may need the rotation taken into account.',
    ],
    faqs: [
      {
        question: 'Does rotating pages reduce quality?',
        answer: 'No. Only the page rotation value changes. No content is decoded, redrawn, or re-compressed, so text remains selectable and images are byte-identical.',
      },
      {
        question: 'Can I rotate only some pages?',
        answer: 'Yes. Enter a selection such as 1, 3, 5-9. Pages outside the selection are left exactly as they were. Leaving the field empty rotates every page.',
      },
      PRIVACY_FAQ,
      {
        question: 'Why does a page look rotated in one viewer and not another?',
        answer: 'Almost always a caching issue in the viewer rather than a problem with the file. Reopen the document. Very old readers occasionally ignore the rotation property, in which case rasterising with Flatten PDF forces the orientation.',
      },
      {
        question: 'Is the rotation permanent?',
        answer: 'It is saved in the downloaded file, so anything opening that file sees the new orientation. Your original document is unchanged.',
      },
    ],
    relatedToolIds: ['crop-pdf', 'rearrange-pages', 'delete-pages', 'extract-pages', 'merge-pdfs', 'flatten-pdf'],
    reviewedAt: REVIEWED,
  },

  'crop-pdf': {
    title: 'Crop PDF',
    seoTitle: 'Crop PDF Free Online – Trim Page Margins | opentools',
    description:
      'Trim PDF margins by setting a new crop box in points, which changes the visible area without discarding page content.',
    intro: [
      'Cropping sets each selected page\'s crop box, the rectangle a viewer uses to decide what part of the page to display. Margins are given in points, the PDF unit where 72 points make one inch, so 36 means half an inch off that edge.',
      'Content outside the new box is hidden rather than deleted. That makes cropping reversible and completely lossless, since no text or image data is touched. It also means cropping is not a way to remove sensitive material from a page: the content is still in the file and a viewer that ignores the crop box will show it. Use Redact PDF when the goal is removal.',
      'Crop margins are validated per page. If the values you enter would leave a page with zero or negative width or height, the operation stops and names the page rather than writing a broken document.',
    ],
    steps: [
      {
        title: 'Add the PDF',
        description: 'Drop in the document you want to trim. Scans and print-oriented exports usually have the most wasted margin.',
      },
      {
        title: 'Enter margins in points',
        description: 'Set top, right, bottom, and left. Remember 72 points to the inch, so 72 removes a full inch. Add a page selection if only some pages need it.',
      },
      {
        title: 'Crop and review',
        description: 'Download the result and check that nothing you needed has moved out of view. If it has, crop the original again with smaller values rather than re-cropping the output.',
      },
    ],
    useCases: [
      'Remove wide print margins so a document fills more of a tablet screen.',
      'Trim scanner edge artefacts and black borders from a scanned book.',
      'Crop a slide deck exported with surrounding whitespace.',
      'Cut header and footer bands off pages before combining them into a handout.',
    ],
    limitations: [
      'Cropped content is hidden, not deleted. The file size stays roughly the same and the hidden material is still recoverable.',
      'The same margins apply to every page in the selection, so a document with inconsistent layouts may need more than one pass.',
      'Margins that exceed the page dimensions are rejected with an error naming the page, rather than producing an empty page.',
    ],
    faqs: [
      {
        question: 'Is cropping a PDF reversible?',
        answer: 'Yes. Cropping only sets the crop box, so the hidden content is still in the file and the box can be widened again later. Nothing is discarded.',
      },
      {
        question: 'Can I use cropping to hide confidential information?',
        answer: 'No, and this is an important distinction. Cropped content remains in the document and can be recovered by widening the crop box or by any parser that reads the raw page. Redact PDF removes the pixels properly.',
      },
      PRIVACY_FAQ,
      {
        question: 'What unit are the margins in?',
        answer: 'Points, the PDF native unit, at 72 to the inch. So 36 points is half an inch, 72 is one inch, and about 28 points is one centimetre.',
      },
      {
        question: 'Does cropping change the file size?',
        answer: 'Barely. Because content is hidden rather than removed, the saved file is close to the size of the original.',
      },
    ],
    relatedToolIds: ['rotate-pages', 'redact-pdf', 'compress-pdf', 'extract-pages', 'flatten-pdf', 'merge-pdfs'],
    reviewedAt: REVIEWED,
  },

  'flatten-pdf': {
    title: 'Flatten PDF',
    seoTitle: 'Flatten PDF Free Online – Fix Forms and Layers | opentools',
    description:
      'Rebuild a PDF as page images so annotations, form fields, and layers render identically in every viewer.',
    intro: [
      'Flattening renders each page to a raster image and assembles those images into a new PDF. Everything that was a separate interactive or layered object, including form fields, comments, annotations, and optional content groups, becomes part of a single flat picture of the page.',
      'The reason to do this is predictability. A form field or annotation is drawn by the viewer, and viewers disagree. A field that shows a value in Acrobat can appear empty in a browser preview or print blank. Once the page is an image, every reader shows the same thing because there is nothing left to interpret.',
      'Two settings control the result. Resolution runs from 72 to 240 DPI, and JPEG quality from 50 to 100. Both push in the same direction: higher values look better and produce a bigger file. If you only need to lock down filled form values and want to keep the text layer, use Flatten PDF Forms instead, which flattens the fields without rasterising the pages.',
    ],
    steps: [
      {
        title: 'Add the PDF',
        description: 'Drop in the document that is rendering inconsistently or that you want to make non-editable.',
      },
      {
        title: 'Set resolution and quality',
        description: 'Start at 150 DPI and 90 percent quality. Move to 240 DPI for print or fine detail, and drop toward 100 DPI when file size matters more than crispness.',
      },
      {
        title: 'Flatten and compare',
        description: 'Download the result and open it alongside the original. Confirm that annotations and filled fields appear where they should and that the text is still legible at your chosen resolution.',
      },
    ],
    useCases: [
      'Lock a completed form so the values cannot be edited or accidentally cleared.',
      'Make sure comments and stamps print rather than being skipped.',
      'Produce a document that looks the same in every reader before sending it for signature.',
      'Collapse layered artwork into a single flat page for a print shop.',
    ],
    limitations: [
      'Text becomes part of an image, so the document is no longer searchable or selectable and screen readers cannot read it.',
      'File size usually increases, sometimes substantially, because page images replace compact text and vector instructions.',
      'Flattening cannot be undone. Keep the original if you might need the interactive version again.',
    ],
    faqs: [
      {
        question: 'What does flattening a PDF actually do?',
        answer: 'It renders each page to an image and builds a new PDF from those images. Form fields, annotations, and layers stop being separate objects and become part of the flat page, so no viewer has to decide how to draw them.',
      },
      {
        question: 'Will the text still be searchable?',
        answer: 'No. Rasterising removes the text layer. If you need searchable text and only want to lock form values, Flatten PDF Forms keeps the document structure and flattens just the fields.',
      },
      PRIVACY_FAQ,
      {
        question: 'Why did my file get bigger?',
        answer: 'Because a page of text stored as instructions and font references is far more compact than a photograph of that same page. Lowering the DPI or the JPEG quality brings the size back down.',
      },
      {
        question: 'Does flattening make a document secure?',
        answer: 'It makes the content non-editable in ordinary readers, which is different from secure. Metadata survives flattening, and anyone can still copy the images. For confidentiality use Redact PDF and Password Protect PDF.',
      },
    ],
    relatedToolIds: ['flatten-pdf-forms', 'redact-pdf', 'compress-pdf', 'fill-pdf-forms', 'protect-pdf-with-password', 'pdf-to-images'],
    reviewedAt: REVIEWED,
  },

  'extract-text-from-pdf': {
    title: 'Extract Text from PDF',
    seoTitle: 'PDF to Text Free Online – Copy Text Out | opentools',
    description:
      'Pull the embedded text layer out of a PDF with pdf.js, keeping reading order and marking each page in the output.',
    intro: [
      'Extraction reads the text layer the PDF already contains. pdf.js walks each page\'s text items in the order the document stores them, reassembles line breaks from the end-of-line markers, and returns plain text with a header line for each page so you can tell where one ends.',
      'This works on any PDF that was generated from a real document, meaning exports from a word processor, a browser, a design tool, or a report generator. It returns nothing useful on a scan, because a scanned page holds a photograph of text rather than text. Recognising characters in an image is OCR, which this tool does not do.',
      'A page selection is accepted, so you can pull chapter four out of a long report instead of the whole thing. Leave it blank to extract everything.',
    ],
    steps: [
      {
        title: 'Add the PDF',
        description: 'Drop in the document. If you can select and highlight text in your reader, there is a text layer to extract.',
      },
      {
        title: 'Optionally narrow the pages',
        description: 'Enter a range such as 1-3, 5 to limit extraction. An empty field covers the whole document.',
      },
      {
        title: 'Copy or download the text',
        description: 'Take the plain text output. Each page is preceded by a marker line so the boundaries survive into whatever you paste it into.',
      },
    ],
    useCases: [
      'Get quotable text out of a report without retyping it.',
      'Feed a document\'s contents into a search index or a language model.',
      'Pull tabular figures out for cleaning in a spreadsheet.',
      'Check what text a supposedly redacted PDF still contains.',
    ],
    limitations: [
      'Scanned PDFs return little or nothing, because there is no text layer to read. OCR is required for those and is not available here.',
      'Multi-column layouts and complex tables extract in document order, which is not always visual reading order. Expect to tidy the result.',
      'Formatting is not preserved. Bold, headings, font sizes, and table structure are all lost, since the output is plain text.',
    ],
    faqs: [
      {
        question: 'Why is the extracted text empty?',
        answer: 'The PDF almost certainly contains scanned images rather than text. A quick check: try selecting a word in your PDF reader. If you cannot, there is no text layer and OCR would be needed to create one.',
      },
      {
        question: 'Does this run OCR on scanned documents?',
        answer: 'No. It reads text that is already embedded in the file. Recognising characters in page images needs an OCR engine, which is a much heavier download and is not part of this tool.',
      },
      PRIVACY_FAQ,
      {
        question: 'Why is the column order wrong on some pages?',
        answer: 'Text items are returned in the order the PDF stores them, which reflects how the file was generated rather than how a person reads the page. Two column layouts and sidebars often interleave as a result.',
      },
      {
        question: 'Can I extract text from only some pages?',
        answer: 'Yes. Enter a page range such as 2-6, 10. Each extracted page is labelled in the output so you can match it back to the document.',
      },
    ],
    relatedToolIds: ['pdf-to-text', 'extract-images-from-pdf', 'extract-pdf-form-data', 'unlock-pdf', 'pdf-info', 'redact-pdf'],
    reviewedAt: REVIEWED,
  },
} as const satisfies Record<string, ToolContent>;
