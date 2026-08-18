import { getCatalogueProducts } from '@/lib/catalogueProducts';
import { buildCatalogueXml } from '@/lib/catalogueXml';

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sheiishop.com'
).replace(/\/$/, '');

// Meta Commerce Manager catalogue feed at /catalog.xml. Implemented as a
// Pages Router page (this project doesn't use the App Router) that writes
// raw XML to the response in getServerSideProps instead of rendering React,
// the standard pattern for feeds like this here (see public/sitemap.xml).
export async function getServerSideProps({ res }) {
  try {
    const products = await getCatalogueProducts(SITE_URL);
    const xml = buildCatalogueXml({
      products,
      siteUrl: SITE_URL,
      title: 'Sheii Shop Product Catalogue',
      description: 'Product catalogue feed for Meta Commerce Manager',
    });

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Public, non-personalized catalog data — same caching strategy as
    // /api/public/products: cache at the edge for 60s and serve stale for
    // up to 5 more minutes while a fresh copy is fetched in the background,
    // so price/stock edits reach Meta within minutes without hitting Mongo
    // on every crawl.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    );
    res.write(xml);
    res.end();
  } catch (err) {
    // Fail the whole feed rather than publishing static-only data — a
    // partial catalogue would silently under-report DB products to Meta.
    console.error('[catalog.xml] Failed to generate feed:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('Failed to generate product catalogue feed.');
    res.end();
  }

  return { props: {} };
}

export default function CatalogXmlPage() {
  return null;
}
