import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://power-of-the-prompt.vercel.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/portal/',
        '/admin/',
        '/_next/',
        '/auth/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}