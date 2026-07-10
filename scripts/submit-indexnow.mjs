const host = process.env.INDEXNOW_HOST ?? 'www.opentools.fun';
const key = process.env.INDEXNOW_KEY;

if (!key) {
  console.error('INDEXNOW_KEY is required. Publish the same key at /<key>.txt before submitting.');
  process.exit(1);
}

const sitemapUrl = `https://${host}/sitemap.xml`;
const sitemapResponse = await fetch(sitemapUrl);
if (!sitemapResponse.ok) throw new Error(`Could not read ${sitemapUrl}: ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  }),
});

if (!response.ok) throw new Error(`IndexNow rejected the request: ${response.status} ${await response.text()}`);
console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
