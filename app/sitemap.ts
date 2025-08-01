import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://quoantb.com'
  const locales = ['en', 'ar']
  
  // Define all the main routes
  const routes = [
    '',
    '/dashboard',
    '/portfolio',
    '/finchat',
    '/stock-analysis',
    '/swing-trading',
    '/settings',
    '/onboarding'
  ]
  
  // Generate URLs for each locale
  const urls = locales.flatMap(locale =>
    routes.map(route => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : route === '/dashboard' ? 0.9 : 0.8,
    }))
  )
  
  return urls
}