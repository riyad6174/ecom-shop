import { getAllProducts } from './products';

// Both static and DB products already use this brand and currency
// consistently across the site (see the schema.org JSON-LD blocks on every
// product page) — not invented for this feed, just reused.
const BRAND = 'Sheii Shop';
const CURRENCY = 'BDT';
const CONDITION = 'new';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 9999;

function toAbsoluteUrl(pathOrUrl, siteUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

function formatPrice(amount) {
  return `${Number(amount).toFixed(2)} ${CURRENCY}`;
}

// Normalizes one item from getAllProducts() (already a mix of static +
// DB products) into the common Meta catalogue shape. Returns null when
// required data is missing, so the caller can skip it instead of emitting
// an invalid <item>.
export function normalizeProduct(item, siteUrl) {
  if (!item || !item.slug || !item.title || item.price == null) return null;

  const images = [item.thumbnail, ...(item.images || [])]
    .filter(Boolean)
    .filter((img, i, arr) => arr.indexOf(img) === i)
    .map((img) => toAbsoluteUrl(img, siteUrl));

  if (images.length === 0) return null;

  const [image_link, ...additional_image_link] = images;

  // `originalPrice` is the "was" price and `price` is the current selling
  // price throughout this app (see the strikethrough price on product
  // pages). Meta wants the regular price in `price` and, when discounted,
  // the current price in `sale_price` — so the two are swapped here.
  const hasSale = item.originalPrice > item.price;
  const regularPrice = hasSale ? item.originalPrice : item.price;
  const salePrice = hasSale ? item.price : undefined;

  const description =
    (item.description || item.title || '').trim().slice(0, MAX_DESCRIPTION_LENGTH) ||
    item.title;

  return {
    id: String(item.id),
    title: String(item.title).slice(0, MAX_TITLE_LENGTH),
    description,
    availability: item.inStock ? 'in stock' : 'out of stock',
    condition: CONDITION,
    price: formatPrice(regularPrice),
    sale_price: salePrice !== undefined ? formatPrice(salePrice) : undefined,
    link: `${siteUrl}/product/${item.slug}`,
    image_link,
    additional_image_link: additional_image_link.length ? additional_image_link : undefined,
    brand: BRAND,
  };
}

// Combines static (utils/products.js) and database products via the
// existing getAllProducts() (which already merges + dedupes by slug),
// normalizes both into the common Meta shape, and guards against duplicate
// catalogue ids so a rare collision can never produce an invalid feed.
export async function getCatalogueProducts(siteUrl) {
  const allProducts = await getAllProducts();

  const seenIds = new Set();
  const catalogueProducts = [];

  for (const item of allProducts) {
    const normalized = normalizeProduct(item, siteUrl);

    if (!normalized) {
      console.warn(
        `[catalog.xml] Skipping product "${item?.slug || item?.id}" — missing required data (title/price/image).`,
      );
      continue;
    }

    if (seenIds.has(normalized.id)) {
      console.warn(
        `[catalog.xml] Duplicate product id "${normalized.id}" detected — skipping duplicate to keep the feed valid.`,
      );
      continue;
    }

    seenIds.add(normalized.id);
    catalogueProducts.push(normalized);
  }

  return catalogueProducts;
}
