import Link from 'next/link';
import { HOME_FAQS } from '../content/home';

const POPULAR_TASKS = [
  {
    href: '/tools/heic-to-jpg',
    title: 'Convert HEIC or HEIF to JPG',
    description: 'Create a widely compatible JPEG while keeping the original photo available for archiving.',
  },
  {
    href: '/tools/png-to-pdf',
    title: 'Convert PNG images to PDF',
    description: 'Arrange one or more PNG pages and generate a PDF locally in the browser.',
  },
  {
    href: '/tools/compress-pdf',
    title: 'Reduce PDF file size',
    description: 'Rebuild PDF pages with adjustable raster quality when a smaller, image-based document is acceptable.',
  },
  {
    href: '/tools/pdf-to-jpg',
    title: 'Convert PDF pages to JPG',
    description: 'Render each PDF page as a downloadable JPEG image at a chosen resolution.',
  },
  {
    href: '/tools/pdf-to-text',
    title: 'Extract text from PDF',
    description: 'Copy existing selectable text from PDF pages without uploading the document or running OCR.',
  },
  {
    href: '/convert',
    title: 'Convert AVIF, PNG, JPG, WebP and more',
    description: 'Use one image converter for practical web, photo, icon, and document output formats.',
  },
] as const;

export function HomeSeoContent() {
  return (
    <section className="home-content" aria-labelledby="home-tools-title">
      <div className="article-prose">
        <p className="content-kicker">Browser-based file tools</p>
        <h2 id="home-tools-title">Common image and PDF tasks, processed locally</h2>
        <p>
          opentools provides focused image conversion, image compression, PDF editing, metadata,
          GIF, colour, and batch file utilities. Supported operations run in the current browser
          tab, so selected files are not sent to an opentools conversion server.
        </p>
        <p>
          Local processing is useful when a file is sensitive, an upload would be slow, or a small
          task does not justify installing desktop software. Browser memory and format support still
          set practical limits, so keep original files until you have inspected every result.
        </p>

        <h2>Popular tools</h2>
        <div className="home-task-grid">
          {POPULAR_TASKS.map((task) => (
            <article className="home-task" key={task.href}>
              <h3><Link href={task.href}>{task.title}</Link></h3>
              <p>{task.description}</p>
            </article>
          ))}
        </div>

        <h2>What local processing does—and does not—mean</h2>
        <p>
          The website and optional codecs are delivered over the internet, but compatible tool
          operations read and transform selected files with browser APIs. This avoids the file-upload
          stage used by many cloud converters. It does not protect a compromised device, browser
          extension, shared download folder, or a file after you send it elsewhere.
        </p>

        <h2>Questions about opentools</h2>
        <div className="faq-list">
          {HOME_FAQS.map((faq) => (
            <details className="faq-item" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>

        <p className="home-content__more">
          Browse all <Link href="/image">image tools</Link>, <Link href="/pdf">PDF tools</Link>, or
          read the <Link href="/guides">evidence-led guides</Link>.
        </p>
      </div>
    </section>
  );
}
