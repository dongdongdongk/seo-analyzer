'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface SeoDetailModalProps {
  isOpen: boolean
  onClose: () => void
  category: {
    id: string
    name: string
    status: 'good' | 'warning' | 'danger'
    score: number
    description: string
    suggestions: string[]
  } | null
  currentValue?: {
    label: string
    value: string
    detail: string
    length?: number
    explanation?: string
    linkBreakdown?: {
      total: number
      internal: number
      external: number
      analysis: string
      recommendations: string[]
    }
    semanticDetails?: {
      elements: Record<string, boolean>
      structure: Record<string, any>
      score: number
      issues: string[]
      suggestions: string[]
    }
    structure?: {
      hasH1: boolean
      isLogical: boolean
      recommendation: string
    }
  }
  siteInfo?: {
    domain: string
    title: string
    description: string
    language: string
    charset: string
    socialTags: {
      hasOpenGraph: boolean
      hasTwitterCard: boolean
      ogImage?: string
      ogTitle?: string
      ogDescription?: string
    }
    technicalInfo: {
      hasViewport: boolean
      hasStructuredData: boolean
      robotsTag: string
      canonicalUrl?: string
      wordCount: number
      imageCount: number
      linkCount: number
    }
    estimated: {
      loadTime: number
      industry: string
      targetAudience: string
      competitiveness: 'low' | 'medium' | 'high'
    }
  }
}

export default function SeoDetailModal({ isOpen, onClose, category, currentValue, siteInfo }: SeoDetailModalProps) {
  const t = useTranslations('seoModal')
  const tCommon = useTranslations('common')
  const tSeoAnalyzer = useTranslations('seoAnalyzer')
  const tAnalysis = useTranslations('analysis')
  
  // 하드코딩된 한국어 텍스트를 영어로 번역하는 함수
  const translateKoreanHardcodedText = (text: string): string => {
    const translations: Record<string, string> = {
      // PageSpeed/Performance related
      '🎯 Field Data (실제 사용자) 기준 점수 사용': '🎯 Use Field Data (real user) based scoring',
      '이미지 최적화 (WebP 형식 사용)': 'Image optimization (use WebP format)',
      '이미지 지연 로딩 (lazy loading) 적용': 'Apply image lazy loading',
      '사용하지 않는 CSS 제거': 'Remove unused CSS',
      '렌더링을 차단하는 리소스 제거': 'Remove render-blocking resources',
      '✅ 실제 사용자 데이터 기반 분석 (신뢰도 높음)': '✅ Real user data based analysis (high reliability)',
      
      // Mobile related
      '모바일 최적화가 잘 되어 있어요': 'Mobile optimization is well implemented',
      '현재 상태를 유지하세요': 'Maintain the current state',
      
      // Performance data
      '참고용 - 실제 사용자 데이터 부족': '⚠️ Reference only - Insufficient real user data',
      
      // Content related
      '콘텐츠가 충분합니다': 'Content is sufficient',
      '더 많은 콘텐츠를 추가하세요': 'Add more content',
      '제목 태그를 개선하세요': 'Improve title tags',
      '메타 설명을 추가하세요': 'Add meta description',
      
      // Social Media related
      '소셜 미디어 태그가 잘 설정되어 있습니다': 'Social media tags are well configured',
      'Open Graph 태그를 추가하세요': 'Add Open Graph tags',
      'Twitter Card를 설정하세요': 'Set up Twitter Card',
      
      // Technical SEO related
      '기술적 SEO가 잘 구성되어 있습니다': 'Technical SEO is well configured',
      'viewport 태그를 추가하세요': 'Add viewport tag',
      'canonical URL을 설정하세요': 'Set canonical URL',
      
      // HTTPS related
      'HTTPS가 적용되어 있습니다': 'HTTPS is enabled',
      'SSL 인증서를 설치하세요': 'Install SSL certificate',
      
      // Links related
      '링크 구조가 좋습니다': 'Link structure is good',
      '내부 링크를 추가하세요': 'Add internal links',
      '외부 링크를 추가하세요': 'Add external links',
      
      // Keywords related
      '키워드 최적화가 잘 되어 있습니다': 'Keyword optimization is well done',
      '키워드 밀도를 조정하세요': 'Adjust keyword density',
      
      // Images related
      '이미지 최적화가 잘 되어 있습니다': 'Image optimization is well done',
      'ALT 텍스트를 추가하세요': 'Add ALT text',
      '이미지 크기를 최적화하세요': 'Optimize image size',
      
      // Robots related
      'robots.txt 파일이 있습니다': 'robots.txt file exists',
      'robots.txt 파일을 생성하세요': 'Create robots.txt file',
      
      // Sitemap related
      '사이트맵이 있습니다': 'Sitemap exists',
      '사이트맵을 생성하세요': 'Create sitemap',
      'XML 사이트맵을 제출하세요': 'Submit XML sitemap',
    }
    
    // Exact match first
    if (translations[text]) {
      return translations[text]
    }
    
    // Pattern matching for dynamic content
    if (text.includes('Field Data (실제 사용자)') && text.includes('빠름')) {
      return text.replace('실제 사용자', 'real user').replace('빠름', 'fast')
    }
    
    // Return original if no translation found
    return text
  }
  
  if (!isOpen || !category) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <span className="icon icon--success">✓</span>
      case 'warning': return <span className="icon icon--warning">!</span>
      case 'danger': return <span className="icon icon--danger">×</span>
      default: return <span className="icon icon--secondary">?</span>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return t('statusText.good')
      case 'warning': return t('statusText.warning')
      case 'danger': return t('statusText.danger')
      default: return t('statusText.unknown')
    }
  }

  const translateCategoryName = (categoryName: string) => {
    // Map category names to their translation keys
    const categoryKeyMap: Record<string, string> = {
      // Korean names from seo-analyzer
      '페이지 제목': 'categoryNames.title',
      '메타 설명': 'categoryNames.description', 
      '콘텐츠 품질': 'categoryNames.content',
      '소셜 미디어': 'categoryNames.socialMedia',
      '구조화된 데이터': 'categoryNames.structuredData',
      '기술적 요소': 'categoryNames.technical',
      '보안 (HTTPS)': 'categoryNames.https',
      '링크 구조': 'categoryNames.links',
      '키워드 최적화': 'categoryNames.keywords',
      '시맨틱 마크업': 'categoryNames.semanticMarkup',
      '로봇 크롤링': 'categoryNames.robots',
      '사이트맵': 'categoryNames.sitemap',
      
      // PageSpeed categories
      '사이트 속도 (PageSpeed 측정)': 'categoryNames.pageSpeed',
      '모바일 친화도': 'categoryNames.mobileFriendly',
      '이미지 최적화': 'categoryNames.images',
      
      // Additional technical categories that might exist
      'Performance': 'categoryNames.performance',
      'Accessibility': 'categoryNames.accessibility',
      'Best Practices': 'categoryNames.bestPractices',
      'SEO': 'categoryNames.seo'
    }
    
    const translationKey = categoryKeyMap[categoryName]
    if (translationKey) {
      try {
        return tAnalysis(translationKey)
      } catch (error) {
        console.warn(`Translation not found for key: ${translationKey}`)
        return categoryName
      }
    }
    
    return categoryName
  }

  const getDetailedAnalysis = () => {
    switch (category.id) {
      case 'title':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🎯 {t('title.currentTitle')}</h4>
              <p className="font-lg font-weight-bold mb-xs" style={{ wordBreak: 'break-word' }}>
                {siteInfo?.title || t('title.notSet')}
              </p>
              <p className="font-sm text-secondary">
                {t('title.lengthInfo', { length: siteInfo?.title?.length || 0 })}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>💡 {t('title.optimizationTips')}</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#92400E' }}>
                {t.raw('title.tips').map((tip: string, index: number) => (
                  <li key={index} className="mb-xs">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )
      
      case 'description':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📝 {t('description.currentDescription')}</h4>
              <p className="font-md mb-xs" style={{ wordBreak: 'break-word', lineHeight: '1.5' }}>
                {siteInfo?.description || t('description.notSet')}
              </p>
              <p className="font-sm text-secondary">
                {t('description.lengthInfo', { length: siteInfo?.description?.length || 0 })}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#DBEAFE', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#1E40AF' }}>📖 {t('description.writingMethod')}</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#1E40AF' }}>
                {t.raw('description.tips').map((tip: string, index: number) => (
                  <li key={index} className="mb-xs">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )

      case 'social':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📱 {t('social.currentSettings')}</h4>
              <div className="grid grid-cols-2 gap-md">
                <div className="text-center">
                  <div className={`icon ${siteInfo?.socialTags.hasOpenGraph ? 'icon--success' : 'icon--danger'} mb-xs`}>
                    {siteInfo?.socialTags.hasOpenGraph ? '✓' : '×'}
                  </div>
                  <div className="font-xs">Open Graph</div>
                </div>
                <div className="text-center">
                  <div className={`icon ${siteInfo?.socialTags.hasTwitterCard ? 'icon--success' : 'icon--danger'} mb-xs`}>
                    {siteInfo?.socialTags.hasTwitterCard ? '✓' : '×'}
                  </div>
                  <div className="font-xs">Twitter Card</div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#1D4ED8' }}>🔗 {t('social.optimizationMethod')}</h4>
              <div style={{ color: '#1D4ED8' }}>
                <p className="mb-sm font-sm">{t('social.description')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('social.tips').map((tip: string, index: number) => (
                    <li key={index} className="mb-xs">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'mobile':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📱 {t('mobile.optimizationStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${siteInfo?.technicalInfo.hasViewport ? 'icon--success' : 'icon--danger'}`}>
                  {siteInfo?.technicalInfo.hasViewport ? '✓' : '×'}
                </span>
                <span className="font-sm">{t('mobile.viewportSet')}</span>
              </div>
              <p className="font-sm text-secondary">
                {siteInfo?.technicalInfo.hasViewport ? 
                  t('mobile.properSize') : 
                  t('mobile.smallSize')}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>📲 {t('mobile.checklist')}</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#92400E' }}>
                {t.raw('mobile.checklistItems').map((item: string, index: number) => (
                  <li key={index} className="mb-xs">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )

      case 'structured':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🔍 {t('structuredData.currentStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${siteInfo?.technicalInfo.hasStructuredData ? 'icon--success' : 'icon--danger'}`}>
                  {siteInfo?.technicalInfo.hasStructuredData ? '✓' : '×'}
                </span>
                <span className="font-sm">{t('structuredData.schemaApplied')}</span>
              </div>
              <p className="font-sm text-secondary">
                {siteInfo?.technicalInfo.hasStructuredData ? 
                  t('structuredData.googleUnderstands') : 
                  t('structuredData.googleDoesntKnow')}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🏷️ {t('structuredData.whatIs')}</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">{t('structuredData.explanation')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('structuredData.examples').map((example: string, index: number) => (
                    <li key={index} className="mb-xs">{example}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🎯 {t('structuredData.effects')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('structuredData.effectsDescription')}</p>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-xs text-secondary mb-xs">{t('structuredData.normalResult')}</div>
                    <div className="font-sm font-weight-bold">{t('structuredData.normalResultTitle')}</div>
                    <div className="font-xs text-secondary">{t('structuredData.normalResultDesc')}</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #059669' }}>
                    <div className="font-xs text-secondary mb-xs">{t('structuredData.structuredResult')}</div>
                    <div className="font-sm font-weight-bold">{t('structuredData.normalResultTitle')}</div>
                    <div className="font-xs text-secondary">{t('structuredData.normalResultDesc')}</div>
                    <div className="flex items-center gap-md mt-xs">
                      <span className="font-xs">{t('structuredData.structuredResultRating')}</span>
                      <span className="font-xs">{t('structuredData.structuredResultPhone')}</span>
                      <span className="font-xs">{t('structuredData.structuredResultLocation')}</span>
                      <span className="font-xs">{t('structuredData.structuredResultHours')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛠️ {t('structuredData.howToImplement')}</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#92400E' }}>
                {t.raw('structuredData.implementationMethods').map((method: string, index: number) => (
                  <li key={index} className="mb-xs">{method}</li>
                ))}
              </ul>
            </div>
          </div>
        )

      case 'speed':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">⚡ {t('speed.currentStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '⚡' : category.score >= 60 ? '🚶' : '🐌'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? t('speed.veryFast') : category.score >= 60 ? t('speed.averageSpeed') : t('speed.slow')}
                </span>
              </div>
              <p className="font-sm text-secondary mb-sm">
                {t('speed.currentScore', { score: category.score })}
              </p>
              {category.name.includes('PageSpeed') && (
                <div className="mt-sm">
                  <p className="font-xs text-secondary mb-xs">📊 {t('speed.measurementData')}</p>
                  {category.suggestions.filter(s => s.includes('Lab Data') || s.includes('Field Data')).map((suggestion, index) => (
                    <div key={index} className="font-xs text-secondary mb-xs" style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: 'var(--spacing-xs)', borderRadius: 'var(--radius-sm)' }}>
                      {suggestion.replace('📊 ', '').replace('👥 ', '')}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {category.name.includes('PageSpeed') && (
              <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>📊 {t('speed.dataExplanation')}</h4>
                <div style={{ color: '#0369A1' }}>
                  <div className="space-y-sm">
                    <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #DBEAFE' }}>
                      <div className="font-sm font-weight-bold mb-xs">{t('speed.labDataTitle')}</div>
                      <div className="font-xs">
                        {t('speed.labDataDesc').split('\\n').map((line: string, index: number) => (
                          <div key={index}>• {line}</div>
                        ))}
                      </div>
                    </div>
                    <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #DBEAFE' }}>
                      <div className="font-sm font-weight-bold mb-xs">{t('speed.fieldDataTitle')}</div>
                      <div className="font-xs">
                        {t('speed.fieldDataDesc').split('\\n').map((line: string, index: number) => (
                          <div key={index}>• {line}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-sm font-sm" style={{ fontStyle: 'italic' }}>
                    {t('speed.fieldDataTip')}
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-md" style={{ backgroundColor: '#FFF7ED', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#C2410C' }}>🏃 {t('speed.whyImportant')}</h4>
              <div style={{ color: '#C2410C' }}>
                <p className="mb-sm font-sm">{t('speed.problemsDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('speed.problemsList').map((problem: string, index: number) => (
                    <li key={index} className="mb-xs">{problem}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🚀 {t('speed.improvementMethods')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('speed.easyMethods')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('speed.improvementMethodsList').map((method: string, index: number) => (
                    <li key={index} className="mb-xs">{method}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'images':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🖼️ {t('images.currentStatus')}</h4>
              <p className="font-sm text-secondary mb-sm">
                {t('images.totalImages', { count: siteInfo?.technicalInfo.imageCount || 0 })}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>📸 {t('images.whatIsImageSEO')}</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">{t('images.seoDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('images.altTextExplanation').map((item: string, index: number) => (
                    <li key={index} className="mb-xs">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🎯 {t('images.practicalTips')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('images.management')}</p>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-xs text-secondary mb-xs">{t('images.badExample')}</div>
                    <div className="font-sm">{tCommon('filename')}: IMG_1234.jpg</div>
                    <div className="font-sm">{tCommon('altText')}: {tCommon('none')}</div>
                    <div className="font-sm">{tCommon('size')}: 5MB</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #059669' }}>
                    <div className="font-xs text-secondary mb-xs">{t('images.goodExample')}</div>
                    <div className="font-sm">{tCommon('filename')}: gangnam-delicious-cafe-americano.jpg</div>
                    <div className="font-sm">{tCommon('altText')}: Americano at delicious cafe near Gangnam Station</div>
                    <div className="font-sm">{tCommon('size')}: 300KB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📝 {t('content.currentStatus')}</h4>
              <p className="font-sm text-secondary mb-sm">
                {t('content.wordCountInfo', { count: siteInfo?.technicalInfo.wordCount || 0 })}
              </p>
              <div className="flex items-center gap-sm">
                <span className={`icon ${(siteInfo?.technicalInfo.wordCount || 0) >= 300 ? 'icon--success' : 'icon--warning'}`}>
                  {(siteInfo?.technicalInfo.wordCount || 0) >= 300 ? '✓' : '!'}
                </span>
                <span className="font-sm">
                  {(siteInfo?.technicalInfo.wordCount || 0) >= 300 ? t('content.sufficientContent') : t('content.insufficientContent')}
                </span>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>📖 {t('content.whyImportant')}</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">{t('content.importanceDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('content.importanceList').map((item: string, index: number) => (
                    <li key={index} className="mb-xs">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>✍️ {t('content.howToCreate')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('content.creationDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('content.creationTips').map((tip: string, index: number) => (
                    <li key={index} className="mb-xs">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'technical':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">⚙️ {t('technical.currentStatus')}</h4>
              <div className="space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className={`icon ${siteInfo?.technicalInfo.hasViewport ? 'icon--success' : 'icon--danger'}`}>
                    {siteInfo?.technicalInfo.hasViewport ? '✓' : '×'}
                  </span>
                  <span className="font-sm">{t('technical.mobileViewport')}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`icon ${siteInfo?.technicalInfo.canonicalUrl ? 'icon--success' : 'icon--warning'}`}>
                    {siteInfo?.technicalInfo.canonicalUrl ? '✓' : '!'}
                  </span>
                  <span className="font-sm">{t('technical.canonicalUrl')}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`icon ${siteInfo?.language ? 'icon--success' : 'icon--warning'}`}>
                    {siteInfo?.language ? '✓' : '!'}
                  </span>
                  <span className="font-sm">{t('technical.languageSetting')}</span>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🔧 {t('technical.whatIs')}</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">{t('technical.description')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('technical.explanationList').map((item: string, index: number) => (
                    <li key={index} className="mb-xs">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#166534' }}>🛠️ {t('technical.howToImprove')}</h4>
              <div style={{ color: '#166534' }}>
                <p className="mb-sm font-sm">{t('technical.improvementDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('technical.improvementSteps').map((step: string, index: number) => (
                    <li key={index} className="mb-xs">{step}</li>
                  ))}
                </ul>
                <p className="mt-sm font-sm" style={{ fontStyle: 'italic' }}>
                  {t('technical.developerNote')}
                </p>
              </div>
            </div>
          </div>
        )

      case 'https':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🔒 {t('https.currentStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? t('https.secureConnection') : t('https.insecureConnection')}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {category.score >= 80 ? 
                  t('https.protectedMessage') : 
                  t('https.unprotectedMessage')}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛡️ {t('https.whyImportant')}</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">{t('https.importanceDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('https.benefitsList').map((benefit: string, index: number) => (
                    <li key={index} className="mb-xs">{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🔧 {t('https.howToImplement')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('https.implementationDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('https.implementationSteps').map((step: string, index: number) => (
                    <li key={index} className="mb-xs">{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'links':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🔗 {t('links.currentStatus')}</h4>
              <p className="font-sm text-secondary mb-sm">
                {t('links.totalLinks', { count: siteInfo?.technicalInfo.linkCount || 0 })}
              </p>
              <div className="grid grid-cols-2 gap-md">
                <div className="text-center">
                  <div className="font-lg font-weight-bold text-primary">-</div>
                  <div className="font-xs">{t('links.internalLinks')}</div>
                </div>
                <div className="text-center">
                  <div className="font-lg font-weight-bold text-secondary">-</div>
                  <div className="font-xs">{t('links.externalLinks')}</div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🌐 {t('links.importance')}</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">{t('links.importanceDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('links.linkTypes').map((type: string, index: number) => (
                    <li key={index} className="mb-xs">{type}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>✨ {t('links.strategy')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('links.strategyDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('links.strategyTips').map((tip: string, index: number) => (
                    <li key={index} className="mb-xs">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'keywords':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🎯 {t('keywords.currentStatus')}</h4>
              <p className="font-sm text-secondary mb-sm">
                {t('keywords.analysisDescription')}
              </p>
              <div className="flex items-center gap-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : category.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? t('keywords.excellent') : category.score >= 60 ? t('keywords.average') : t('keywords.poor')}
                </span>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🔍 {t('keywords.whatIs')}</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">{t('keywords.description')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('keywords.principles').map((principle: string, index: number) => (
                    <li key={index} className="mb-xs">{principle}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#166534' }}>💡 {t('keywords.tips')}</h4>
              <div style={{ color: '#166534' }}>
                <p className="mb-sm font-sm">{t('keywords.tipsDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {t.raw('keywords.tipsList').map((tip: string, index: number) => (
                    <li key={index} className="mb-xs">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'semantic-markup':
        const semanticData = (currentValue as any)?.semanticDetails
        if (!semanticData) return null
        
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🏗️ {t('semanticMarkup.currentStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${semanticData.score >= 80 ? 'icon--success' : semanticData.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {semanticData.score >= 80 ? '✓' : semanticData.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {t('semanticMarkup.score', { score: semanticData.score })}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {semanticData.score >= 80 ? 
                  t('semanticMarkup.wellStructured') : 
                  semanticData.score >= 60 ?
                  t('semanticMarkup.partiallyStructured') :
                  t('semanticMarkup.needsImprovement')}
              </p>
            </div>
            
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🏗️ {t('semanticMarkup.elementsCheck')}</h4>
              <div style={{ color: '#0369A1' }}>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.header ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.header ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;header&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.nav ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.nav ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;nav&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.main ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.main ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;main&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.footer ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.footer ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;footer&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.section ? 'icon--success' : 'icon--warning'}`}>
                      {semanticData.elements.section ? '✓' : '△'}
                    </span>
                    <span className="font-sm">&lt;section&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.article ? 'icon--success' : 'icon--warning'}`}>
                      {semanticData.elements.article ? '✓' : '△'}
                    </span>
                    <span className="font-sm">&lt;article&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.h1 ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.h1 ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;h1&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.structure.headingStructure ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.structure.headingStructure ? '✓' : '×'}
                    </span>
                    <span className="font-sm">{t('semanticMarkup.headingStructure')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>♿ {t('semanticMarkup.accessibility')}</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">{t('semanticMarkup.accessibilityDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🔍 <strong>{t('semanticMarkup.ariaAttributes', { count: semanticData.structure.ariaAttributes })}</strong></li>
                  <li className="mb-xs">🎯 <strong>{t('semanticMarkup.roleAttributes', { count: semanticData.structure.roleAttributes })}</strong></li>
                  <li className="mb-xs">📢 <strong>{tCommon('recommendation')}:</strong> {t('semanticMarkup.recommendation')}</li>
                </ul>
              </div>
            </div>
            
            {semanticData.suggestions && semanticData.suggestions.length > 0 && (
              <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-md mb-sm" style={{ color: '#166534' }}>💡 {tCommon('suggestions')}</h4>
                <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#166534' }}>
                  {semanticData.suggestions.slice(0, 5).map((suggestion: string, index: number) => (
                    <li key={index} className="mb-xs font-sm">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🌟 {t('semanticMarkup.benefits')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('semanticMarkup.benefitsDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {(t.raw('semanticMarkup.benefitsList') as string[]).map((benefit: string, index: number) => (
                    <li key={index} className="mb-xs">
                      {index === 0 && '🔍 '}
                      {index === 1 && '♿ '}
                      {index === 2 && '📱 '}
                      {index === 3 && '🔧 '}
                      {index === 4 && '🚀 '}
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'robots':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🤖 {t('robots.currentStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : category.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? t('robots.fileExists') : category.score >= 60 ? t('robots.partialSetup') : t('robots.fileNotExists')}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {category.score >= 80 ? 
                  t('robots.wellConfigured') : 
                  t('robots.needsConfiguration')}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🤖 {t('robots.whatIsRobots')}</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">{t('robots.robotsDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {(t.raw('robots.robotsFunctions') as string[]).map((func: string, index: number) => (
                    <li key={index} className="mb-xs">
                      {index === 0 && '🚦 '}
                      {index === 1 && '🗺️ '}
                      {index === 2 && '⚡ '}
                      {index === 3 && '🛡️ '}
                      <strong>{func.split(':')[0]}:</strong> {func.split(':')[1]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>📝 {t('robots.example')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('robots.exampleDescription')}</p>
                <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5', fontFamily: 'monospace', fontSize: 'var(--font-sm)' }}>
                  <div>User-agent: *</div>
                  <div>Allow: /</div>
                  <div>Disallow: /admin/</div>
                  <div>Disallow: /private/</div>
                  <div style={{ marginTop: 'var(--spacing-xs)' }}>Sitemap: https://example.com/sitemap.xml</div>
                </div>
                <p className="mt-sm font-sm">{t('robots.exampleMeaning')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {(t.raw('robots.exampleMeaningList') as string[]).map((meaning: string, index: number) => (
                    <li key={index} className="mb-xs">
                      {index === 0 && '✅ '}
                      {index === 1 && '🚫 '}
                      {index === 2 && '🗺️ '}
                      {meaning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛠️ {t('robots.howToCreate')}</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">{t('robots.creationSteps')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {(t.raw('robots.creationStepsList') as string[]).map((step: string, index: number) => (
                    <li key={index} className="mb-xs">
                      {index === 0 && '📝 '}
                      {index === 1 && '📁 '}
                      {index === 2 && '🌐 '}
                      {index === 3 && '🔍 '}
                      {index === 4 && '🎯 '}
                      <strong>{step.split(':')[0]}:</strong> {step.split(':')[1]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'sitemap':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🗺️ {t('sitemap.currentStatus')}</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : category.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? t('sitemap.fileExists') : category.score >= 60 ? t('sitemap.partialSetup') : t('sitemap.fileNotExists')}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {category.score >= 80 ? 
                  t('sitemap.wellConfigured') : 
                  t('sitemap.needsConfiguration')}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🗺️ {t('sitemap.whatIsSitemap')}</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">{t('sitemap.sitemapDescription')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {(t.raw('sitemap.sitemapFunctions') as string[]).map((func: string, index: number) => (
                    <li key={index} className="mb-xs">
                      {index === 0 && '📋 '}
                      {index === 1 && '🕒 '}
                      {index === 2 && '⭐ '}
                      {index === 3 && '🚀 '}
                      <strong>{func.split(':')[0]}:</strong> {func.split(':')[1]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🎯 {t('sitemap.benefits')}</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">{t('sitemap.benefitsDescription')}</p>
                <div className="space-y-sm">
                  {(t.raw('sitemap.benefitsList') as Array<{title: string, description: string}>).map((benefit, index: number) => (
                    <div key={index} className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                      <div className="font-sm font-weight-bold mb-xs">
                        {index === 0 && '📈 '}
                        {index === 1 && '⚡ '}
                        {index === 2 && '🔍 '}
                        {index === 3 && '📊 '}
                        {benefit.title}
                      </div>
                      <div className="font-xs">{benefit.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛠️ {t('sitemap.howToCreate')}</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">{t('sitemap.creationSteps')}</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {(t.raw('sitemap.creationStepsList') as string[]).map((step: string, index: number) => (
                    <li key={index} className="mb-xs">
                      {index === 0 && '🎯 '}
                      {index === 1 && '📝 '}
                      {index === 2 && '🛒 '}
                      {index === 3 && '🔧 '}
                      {index === 4 && '📋 '}
                      {index === 5 && '📤 '}
                      <strong>{step.split(':')[0]}:</strong> {step.split(':')[1]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <p className="font-md">{category.description}</p>
          </div>
        )
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-md">
            <div className={`modal-icon ${category.status === 'good' ? 'gradient-bg--success' : category.status === 'warning' ? 'gradient-bg--warning' : 'gradient-bg--danger'}`}>
              {getStatusIcon(category.status)}
            </div>
            <div>
              <h2 className="modal-title">{translateCategoryName(category.name)}</h2>
              <div className={`status-indicator status-indicator--${category.status}`}>
                {category.score}{tAnalysis('ui.points')} - {getStatusText(category.status)}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span className="icon icon--secondary">×</span>
          </button>
        </div>

        <div className="modal-body">
          {currentValue && (
            <div className="mb-lg">
              <h3 className="font-lg mb-md">🔍 {t('currentStatus')}</h3>
              <div className="current-status">
                <div className="current-status__label">{currentValue.label}</div>
                <div className="current-status__value">
                  {currentValue.value}
                  {currentValue.length !== undefined && (
                    <span className="current-status__length">({currentValue.length}자)</span>
                  )}
                </div>
                <div className="current-status__detail">{currentValue.detail}</div>
              </div>
            </div>
          )}

          <div className="mb-lg">
            <h3 className="font-lg mb-md">📊 {t('detailedAnalysis')}</h3>
            {getDetailedAnalysis()}
          </div>

          <div className="mb-lg">
            <h3 className="font-lg mb-md">💡 {t('improvementMethods')}</h3>
            <div className="improvement-list">
              {category.suggestions.filter((suggestion, index, arr) => 
                arr.indexOf(suggestion) === index // 중복 제거
              ).map((suggestion, index) => {
                // console.log(`🔧 Processing suggestion ${index + 1}:`, suggestion)
                
                // 번역 키인지 확인하고 번역 처리
                let translatedSuggestion;
                if (suggestion.startsWith('seoAnalyzer.')) {
                  const key = suggestion.replace('seoAnalyzer.', '');
                  try {
                    translatedSuggestion = tSeoAnalyzer(key);
                  } catch (error) {
                    translatedSuggestion = suggestion;
                  }
                } else if (suggestion.includes('메인 콘텐츠 영역')) {
                  try {
                    translatedSuggestion = tSeoAnalyzer('semanticAnalysis.positiveFeedback.mainContent');
                  } catch (error) {
                    translatedSuggestion = suggestion;
                  }
                } else if (suggestion.includes('헤더와 푸터 영역')) {
                  try {
                    translatedSuggestion = tSeoAnalyzer('semanticAnalysis.positiveFeedback.headerFooter');
                  } catch (error) {
                    translatedSuggestion = suggestion;
                  }
                } else if (suggestion.includes('헤딩 태그 구조가 논리적으로')) {
                  try {
                    translatedSuggestion = tSeoAnalyzer('semanticAnalysis.positiveFeedback.headingStructure');
                  } catch (error) {
                    translatedSuggestion = suggestion;
                  }
                } else {
                  // 포괄적인 한국어 텍스트 번역 처리 (특별한 케이스들 포함)
                  if (suggestion.includes('모바일 최적화가 잘 되어 있어요')) {
                    translatedSuggestion = "Mobile optimization is well implemented";
                  } else if (suggestion.includes('현재 상태를 유지하세요')) {
                    translatedSuggestion = "Maintain the current state";
                  } else if (suggestion.includes('Lab Data') && suggestion.includes('테스트 환경')) {
                    translatedSuggestion = suggestion.replace('테스트 환경', 'Test Environment');
                  } else if (suggestion.includes('Field Data') && suggestion.includes('실제 사용자 데이터가 충분하지 않습니다')) {
                    translatedSuggestion = "👥 Field Data: Insufficient real user data (low site traffic)";
                  } else if (suggestion.includes('참고용 - 실제 사용자 데이터 부족')) {
                    translatedSuggestion = "⚠️ Reference only - Insufficient real user data";
                  } else if (suggestion.includes('사용하지 않는 JavaScript 제거')) {
                    translatedSuggestion = "Remove unused JavaScript";
                  } else if (suggestion.includes('서버 응답 시간 개선')) {
                    translatedSuggestion = "Improve server response time";
                  } else {
                    // 일반적인 한국어 텍스트 번역 처리
                    translatedSuggestion = translateKoreanHardcodedText(suggestion);
                    
                    // Translate Korean hardcoded text silently
                  }
                }
                
                return (
                  <div key={index} className="improvement-item">
                    <span className="improvement-number">{index + 1}</span>
                    <span className="improvement-text">{translatedSuggestion}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            <span className="icon icon--success">✓</span>
            {t('confirmed')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-md);
        }

        .modal-content {
          background: white;
          border-radius: var(--radius-xl);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .modal-title {
          font-size: var(--font-xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: var(--color-bg-secondary);
        }

        .modal-body {
          padding: var(--spacing-xl);
        }

        .current-status {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }

        .current-status__label {
          font-size: var(--font-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .current-status__value {
          font-size: var(--font-lg);
          font-weight: 600;
          color: var(--color-text-primary);
          word-break: break-all;
          margin-bottom: var(--spacing-xs);
        }

        .current-status__length {
          font-size: var(--font-sm);
          color: var(--color-text-secondary);
          margin-left: var(--spacing-sm);
          font-weight: normal;
        }

        .current-status__detail {
          font-size: var(--font-sm);
          color: var(--color-text-secondary);
          font-style: italic;
          line-height: 1.4;
        }

        .improvement-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .improvement-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }

        .improvement-number {
          background: var(--color-primary);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-sm);
          font-weight: 600;
          flex-shrink: 0;
        }

        .improvement-text {
          font-size: var(--font-md);
          line-height: 1.5;
          color: var(--color-text-primary);
        }

        .modal-footer {
          padding: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
        }

        .space-y-md > * + * {
          margin-top: var(--spacing-md);
        }

        .space-y-sm > * + * {
          margin-top: var(--spacing-sm);
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: var(--spacing-md);
            max-height: calc(100vh - 2rem);
          }
          
          .modal-header,
          .modal-body,
          .modal-footer {
            padding: var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  )
}