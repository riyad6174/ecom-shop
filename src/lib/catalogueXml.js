// XML escaping + RSS/XML building for the Meta Commerce Manager catalogue feed.
// Kept separate from catalogueProducts.js so this module never needs to know
// how a product was sourced (static file vs database).

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const ITEM_FIELDS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'brand',
];

function buildItemXml(product) {
  let xml = '    <item>\n';

  for (const field of ITEM_FIELDS) {
    const value = product[field];
    if (value === undefined || value === null || value === '') continue;
    xml += `      <g:${field}>${escapeXml(value)}</g:${field}>\n`;
  }

  for (const img of product.additional_image_link || []) {
    xml += `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
  }

  xml += '    </item>\n';
  return xml;
}

export function buildCatalogueXml({ products, siteUrl, title, description }) {
  const items = products.map(buildItemXml).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
${items}  </channel>
</rss>
`;
}
