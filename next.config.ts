import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to allow deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checking enabled
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'react-hook-form',
      '@supabase/supabase-js',
      'framer-motion'
    ],
    // Enable Node.js runtime for middleware
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Modern JavaScript output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Compression
  compress: true,
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  webpack: (config, { isServer }) => {
    // Suppress Supabase realtime dependency warning
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      // Suppress webpack cache serialization warning
      {
        message: /Serializing big strings/,
      },
      // Also suppress the PackFileCacheStrategy warning
      (warning: any) => warning.message.includes('webpack.cache.PackFileCacheStrategy'),
    ];

    // Bundle optimization
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        // Improve module IDs for better caching
        moduleIds: 'deterministic',
      };
    }

    // Performance optimization for cache
    config.cache = {
      ...config.cache,
      type: 'filesystem',
      compression: 'gzip',
    };

    return config;
  },
  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // HSTS - Force HTTPS for 2 years
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Allow self, Stripe, Jitsi, and inline scripts (required for Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.jitsi.net https://8x8.vc https://*.sentry.io https://yourwebsitescore.com",
              // Styles: Allow self and inline styles (required for styled-components/emotion)
              "style-src 'self' 'unsafe-inline'",
              // Images: Allow self, data URIs, Supabase, Stripe, YourWebsiteScore badge
              "img-src 'self' data: https://*.supabase.co https://qaaautcjhztvjhizklxr.supabase.co https://lh3.googleusercontent.com https://yourwebsitescore.com",
              // Fonts: Allow self and data URIs
              "font-src 'self' data:",
              // Connect: Allow API calls to Supabase, Stripe, Jitsi, Sentry
              "connect-src 'self' https://*.supabase.co https://qaaautcjhztvjhizklxr.supabase.co wss://qaaautcjhztvjhizklxr.supabase.co https://api.stripe.com https://*.jitsi.net wss://*.jitsi.net https://8x8.vc wss://8x8.vc https://*.sentry.io",
              // Frames: Allow Stripe checkout and Jitsi video
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.jitsi.net https://8x8.vc",
              // Media: Allow Jitsi for video/audio
              "media-src 'self' https://*.jitsi.net https://8x8.vc",
              // Objects: Disallow plugins
              "object-src 'none'",
              // Base URI: Restrict to self
              "base-uri 'self'",
              // Form actions: Allow self and Stripe
              "form-action 'self' https://js.stripe.com",
              // Frame ancestors: None (covered by X-Frame-Options but good to include)
              "frame-ancestors 'none'",
              // Upgrade insecure requests in production
              process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
            ].filter(Boolean).join('; '),
          },
        ],
      },
      {
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
