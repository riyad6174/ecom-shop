import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { products as staticProducts } from '@/utils/products';

// Shared by the public products API route and any page that needs the
// full catalog server-side (e.g. the homepage), so both stay in sync
// and neither duplicates the Mongo query/normalization logic.
export async function getAllProducts() {
  await connectDB();
  const dbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();

  const staticSlugSet = new Set(staticProducts.map((p) => p.slug));

  const normalizedDB = dbProducts
    .filter((p) => !staticSlugSet.has(p.slug))
    .map((p) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      inStock: p.inStock,
      sectionType: p.sectionType,
      thumbnail: p.thumbnail,
      description: p.shortDescription || '',
      images: p.images || [],
      variants: p.variants || [],
      category: p.category || '',
      source: 'db',
    }));

  return [
    ...normalizedDB,
    ...staticProducts.map((p) => ({ ...p, source: 'static' })),
  ];
}
