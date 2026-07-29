/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Product photos uploaded via the admin panel are stored in Cloudflare R2
// and served from R2_PUBLIC_URL — derive its hostname so next/image is
// allowed to optimise them without hardcoding the bucket's hash subdomain.
const r2Hostname = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : null;

const nextConfig = {
  reactStrictMode: true,

  // Enable gzip/brotli compression
  compress: true,

  // Image optimisation: allow local /public assets + serve modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: r2Hostname
      ? [{ protocol: 'https', hostname: r2Hostname, pathname: '/**' }]
      : [],
  },

  // Cache headers for static assets and pages
  async headers() {
    return [
      // Immutable cache for hashed static assets (_next/static) — production only.
      // In development this header breaks Fast Refresh: the browser caches the
      // webpack hot-update manifest as immutable, keeps requesting the stale
      // chunk hash after a rebuild, gets a 404, and reloads in an infinite loop.
      ...(isProd
        ? [
            {
              source: '/_next/static/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ]
        : []),
      // Long cache for public images, fonts, icons
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Long cache for favicon / robots / sitemap
      {
        source: '/(favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
