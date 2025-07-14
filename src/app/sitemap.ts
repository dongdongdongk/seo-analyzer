import { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://seo-analyzer.com'
  
  // 기본 페이지들
  const routes = [
    '',
    '/about',
    '/seo-guide',
    '/faq'
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // 각 경로에 대해 모든 언어 버전 생성
  routes.forEach(route => {
    locales.forEach(locale => {
      const url = `${baseUrl}/${locale}${route}`
      
      // 언어별 대체 URL 생성
      const alternates: Record<string, string> = {}
      locales.forEach(altLocale => {
        alternates[altLocale] = `${baseUrl}/${altLocale}${route}`
      })
      
      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: alternates
        }
      })
    })
  })
  
  return sitemap
}