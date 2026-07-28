import { getAllProducts } from '@/lib/products';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ message: 'Method not allowed' });

  try {
    const products = await getAllProducts();

    // Public, non-personalized catalog data — safe to cache at the edge/CDN.
    // Serve stale for up to 5 min while a fresh copy is fetched in the background.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    );
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
