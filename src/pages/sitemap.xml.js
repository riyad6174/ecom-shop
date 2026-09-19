import { getAllProducts } from '@/lib/products';
import { products as staticProducts } from '@/utils/products';

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sheiishop.com'
).replace(/\/$/, '');

// Static content pages worth indexing. Auth/checkout/admin/API routes are
// intentionally excluded (see public/robots.txt Disallow rules).
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.00' },
  { path: '/products', changefreq: 'daily', priority: '0.90' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.60' },
  { path: '/contact-us', changefreq: 'monthly', priority: '0.60' },
  { path: '/return-policy', changefreq: 'monthly', priority: '0.60' },
];

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toLastmod(date) {
  const d = date ? new Date(date) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return (
    `  <url>\n` +
    `    <loc>${escapeXml(loc)}</loc>\n` +
    `    <lastmod>${escapeXml(lastmod)}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

function buildSitemapXml({ urls }) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls.join('\n')}\n` +
    `</urlset>`
  );
}

// Auto-generated sitemap at /sitemap.xml (same getServerSideProps pattern as
// /catalog.xml). Every request rebuilds it from getAllProducts(), which
// already merges database products with the static catalogue in
// utils/products.js — so new/edited products appear within minutes without
// anyone hand-editing XML. Replaces the old static public/sitemap.xml.
export async function getServerSideProps({ res }) {
  const now = new Date().toISOString();
  const urls = STATIC_PAGES.map((p) =>
    urlEntry({
      loc: `${SITE_URL}${p.path}`,
      lastmod: now,
      changefreq: p.changefreq,
      priority: p.priority,
    }),
  );

  // Product URLs: DB + static via the shared helper. Unlike the Meta feed
  // (which must never silently under-report), a sitemap degrades gracefully:
  // if Mongo is unreachable we still serve static pages + static products.
  let products = [];
  try {
    products = await getAllProducts();
  } catch (err) {
    console.error('[sitemap.xml] DB unreachable, falling back to static products:', err?.message || err);
    products = staticProducts.map((p) => ({ ...p, source: 'static' }));
  }

  const seen = new Set();
  for (const item of products) {
    if (!item?.slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    urls.push(
      urlEntry({
        loc: `${SITE_URL}/product/${item.slug}`,
        lastmod: toLastmod(item.updatedAt || item.createdAt),
        changefreq: 'weekly',
        priority: '0.80',
      }),
    );
  }

  const xml = buildSitemapXml({ urls });

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // Same caching strategy as /catalog.xml and /api/public/products: fresh
  // for crawlers within a minute, stale-while-revalidate behind that.
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300',
  );
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SitemapXmlPage() {
  return null;
}
