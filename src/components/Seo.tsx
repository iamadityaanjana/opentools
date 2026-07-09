import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TOOLS } from '../tools/catalog';

const SITE_URL = 'https://opentools.fun';
const SITE_NAME = 'opentools';
const DEFAULT_DESCRIPTION = 'Fast, private tools for images, PDFs, and files that run entirely in your browser.';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function pageMetadata(pathname: string): { title: string; description: string } {
  if (pathname === '/') {
    return {
      title: 'opentools — private browser-based file tools',
      description: DEFAULT_DESCRIPTION,
    };
  }
  if (pathname === '/image') {
    return {
      title: 'Image tools · opentools',
      description: 'Convert, resize, compress, edit, organize, and inspect images privately in your browser.',
    };
  }
  if (pathname === '/pdf') {
    return {
      title: 'PDF tools · opentools',
      description: 'Create PDFs, convert PDF pages to images, and extract PDF images locally in your browser.',
    };
  }

  const tool = TOOLS.find((item) => item.route === pathname);
  if (tool) {
    return {
      title: `${tool.name} · opentools`,
      description: tool.blurb ?? `${tool.name} online, processed privately in your browser with no file uploads.`,
    };
  }

  return { title: SITE_NAME, description: DEFAULT_DESCRIPTION };
}

/** Keeps canonical and social metadata accurate as the client-side route changes. */
export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const { title, description } = pageMetadata(canonicalPath);
    const socialImage = `${SITE_URL}/social-preview.svg`;

    document.title = title;

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', socialImage);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage);
  }, [pathname]);

  return null;
}
