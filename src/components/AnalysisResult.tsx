'use client';

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import FeedbackModal from './FeedbackModal'
import SeoDetailModal from './SeoDetailModal'


interface AnalysisResultProps {
  data: {
    url: string
    overallScore: number
    categories: Array<{
      id: string
      name: string
      status: 'good' | 'warning' | 'danger'
      score: number
      description: string
      suggestions: string[]
    }>
    aiAdvice?: {
      overallAdvice: string
      priorityActions: string[]
      industrySpecificTips: string[]
      expectedResults: string
    }
    keywordSuggestions?: string[]
    siteType?: string
    businessType?: string
    hasFieldData?: boolean
    performanceImprovements?: string[]
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
      semanticMarkup: {
        hasHeader: boolean
        hasNav: boolean
        hasMain: boolean
        hasFooter: boolean
        hasSection: boolean
        hasArticle: boolean
        hasAside: boolean
        hasH1: boolean
        headingStructure: boolean
        ariaAttributes: number
        roleAttributes: number
        semanticScore: number
        issues: string[]
        suggestions: string[]
      }
      estimated: {
        loadTime: number
        industry: string
        targetAudience: string
        competitiveness: 'low' | 'medium' | 'high'
      }
    }
  }
  onNewAnalysis: () => void
}

export default function AnalysisResult({ data, onNewAnalysis }: AnalysisResultProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const t = useTranslations('analysis')


  const getScoreColor = (score: number) => {
    if (score >= 80) return 'good'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return t('scoreText.excellent')
    if (score >= 60) return t('scoreText.good')
    return t('scoreText.needsImprovement')
  }

  const getCategoryDescription = (categoryId: string, status: string) => {
    // Get category descriptions from translations
    const categoryDescriptions = t.raw('categoryDescriptions') as Record<string, Record<string, string>>
    
    // Check if the category description exists
    if (categoryDescriptions[categoryId] && categoryDescriptions[categoryId][status]) {
      return categoryDescriptions[categoryId][status]
    }
    
    console.warn(`Missing translation for category: ${categoryId}, status: ${status}`)
    // If translation key doesn't exist, return a generic message based on status
    if (status === 'good') return t('scoreText.excellent')
    if (status === 'warning') return t('scoreText.good') 
    return t('scoreText.needsImprovement')
  }

  const translateBusinessData = (text: string) => {
    // Try to translate business types and target audience data
    try {
      const key = `businessTypes.${text}`
      return t(key)
    } catch {
      // If no translation exists, return the original text
      return text
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
      '사이트 속도 (PageSpeed 측정)': 'categoryNames.pageSpeed',
      '모바일 친화도': 'categoryNames.mobileFriendly',
      '이미지 최적화': 'categoryNames.images',
      
      // English names from seo-analyzer  
      'Page Title': 'categoryNames.title',
      'Meta Description': 'categoryNames.description',
      'Content Quality': 'categoryNames.content', 
      'Social Media': 'categoryNames.socialMedia',
      'Structured Data': 'categoryNames.structuredData',
      'Technical Elements': 'categoryNames.technical',
      'Security (HTTPS)': 'categoryNames.https',
      'Link Structure': 'categoryNames.links',
      'Keyword Optimization': 'categoryNames.keywords',
      'Semantic Markup': 'categoryNames.semanticMarkup',
      'Robot Crawling': 'categoryNames.robots',
      'Sitemap': 'categoryNames.sitemap',
      'Site Speed (PageSpeed)': 'categoryNames.pageSpeed',
      'Mobile Friendliness': 'categoryNames.mobileFriendly',
      'Image Optimization': 'categoryNames.images'
    }
    
    const translationKey = categoryKeyMap[categoryName]
    
    
    if (translationKey) {
      try {
        console.log(`Translating category: ${categoryName} -> ${translationKey}`)
        return t(translationKey)
      } catch (error) {
        console.warn(`Missing translation for key: ${translationKey}`)
        return categoryName
      }
    }
    
    // If no mapping found, return original name  
    return categoryName
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <span className="icon icon--success icon--no-margin">✓</span>
      case 'warning': return <span className="icon icon--warning icon--no-margin">!</span>
      case 'danger': return <span className="icon icon--danger icon--no-margin">×</span>
      default: return <span className="icon icon--secondary icon--no-margin">?</span>
    }
  }

  const getCurrentValue = (categoryId: string) => {
    // 현재 상태 데이터를 반환하는 함수
    if (!data.siteInfo) return null
    
    switch (categoryId) {
      case 'title':
        return {
          label: t('currentValues.pageTitle'),
          value: data.siteInfo.title || t('currentValues.noTitle'),
          length: data.siteInfo.title?.length || 0,
          detail: data.siteInfo.title?.length ? 
            t('currentValues.titleLengthDetail', { current: data.siteInfo.title.length }) : 
            t('currentValues.noTitleSet')
        }
      case 'description':
        return {
          label: t('currentValues.metaDescription'),
          value: data.siteInfo.description || t('currentValues.noDescription'),
          length: data.siteInfo.description?.length || 0,
          detail: data.siteInfo.description?.length ? 
            t('currentValues.descriptionLengthDetail', { current: data.siteInfo.description.length }) : 
            t('currentValues.noDescriptionSet')
        }
      case 'mobile':
        return {
          label: t('currentValues.mobileViewport'),
          value: data.siteInfo.technicalInfo.hasViewport ? t('currentValues.viewportSet') : t('currentValues.viewportNotSet'),
          detail: data.siteInfo.technicalInfo.hasViewport ? 
            t('currentValues.mobileProperDisplay') : 
            t('currentValues.mobileNotProperDisplay')
        }
      case 'speed':
        const speedCategory = data.categories.find(cat => cat.id === 'speed')
        const speedScore = speedCategory?.score || 0
        return {
          label: t('currentValues.siteSpeed'),
          value: speedScore >= 80 ? t('currentValues.veryFast') : speedScore >= 60 ? t('currentValues.averageSpeed') : t('currentValues.slowSpeed'),
          detail: speedScore >= 80 ? 
            t('currentValues.speedVeryFastDetail') : 
            speedScore >= 60 ? 
            t('currentValues.speedAverageDetail') : 
            t('currentValues.speedSlowDetail')
        }
      case 'images':
        return {
          label: t('currentValues.imageAnalysis'),
          value: t('currentValues.totalImages', { count: data.siteInfo.technicalInfo.imageCount }),
          detail: t('currentValues.imageOptimizationCheck')
        }
      case 'content':
        return {
          label: t('currentValues.contentLength'),
          value: t('currentValues.words', { count: data.siteInfo.technicalInfo.wordCount.toLocaleString() }),
          detail: data.siteInfo.technicalInfo.wordCount >= 300 ? 
            t('currentValues.sufficientContent') : 
            t('currentValues.moreContentNeeded')
        }
      case 'social':
        return {
          label: t('currentValues.socialMediaOptimization'),
          value: `${data.siteInfo.socialTags.hasOpenGraph ? t('currentValues.openGraphSet') : t('currentValues.openGraphNotSet')}, ${data.siteInfo.socialTags.hasTwitterCard ? t('currentValues.twitterSet') : t('currentValues.twitterNotSet')}`,
          detail: (data.siteInfo.socialTags.hasOpenGraph && data.siteInfo.socialTags.hasTwitterCard) ? 
            t('currentValues.socialOptimized') : 
            t('currentValues.socialNeedsImprovement')
        }
      case 'structured':
        return {
          label: t('currentValues.googleExplanation'),
          value: data.siteInfo.technicalInfo.hasStructuredData ? t('currentValues.googleUnderstands') : t('currentValues.googleConfused'),
          detail: data.siteInfo.technicalInfo.hasStructuredData ? 
            t('currentValues.structuredDataGood') : 
            t('currentValues.structuredDataBad'),
          explanation: data.siteInfo.technicalInfo.hasStructuredData ? 
            t('currentValues.structuredDataExplanation') : 
            t('currentValues.structuredDataMissing')
        }
      case 'technical':
        return {
          label: t('currentValues.technicalSeo'),
          value: `${t('currentValues.mobile')}: ${data.siteInfo.technicalInfo.hasViewport ? '✓' : '✗'}, ${t('currentValues.structuredData')}: ${data.siteInfo.technicalInfo.hasStructuredData ? '✓' : '✗'}`,
          detail: t('currentValues.technicalSeoDescription')
        }
      case 'links':
        const totalLinks = data.siteInfo.technicalInfo.linkCount
        // These properties might not exist, so we'll use fallback values
        const internalLinks = (data.siteInfo.technicalInfo as any).internalLinkCount || 0
        const externalLinks = (data.siteInfo.technicalInfo as any).externalLinkCount || 0
        
        return {
          label: t('linkAnalysis.linkStructure'),
          value: t('linkAnalysis.totalLinksFound', { count: totalLinks }),
          detail: `${t('linkAnalysis.internalLinks', { count: internalLinks })}, ${t('linkAnalysis.externalLinks', { count: externalLinks })}`,
          linkBreakdown: {
            total: totalLinks,
            internal: internalLinks,
            external: externalLinks,
            analysis: (internalLinks >= 2 && externalLinks >= 1) ? 
              t('linkAnalysis.excellentStructure') :
              (internalLinks >= 1 || externalLinks >= 1) ? 
              t('linkAnalysis.averageStructure') :
              t('linkAnalysis.poorStructure'),
            recommendations: [
              internalLinks < 2 ? t('linkAnalysis.internalLinksNeeded') : '',
              externalLinks < 1 ? t('linkAnalysis.externalLinksNeeded') : '',
              totalLinks > 50 ? t('linkAnalysis.tooManyLinks') : ''
            ].filter(Boolean)
          }
        }
      case 'semantic-markup':
        if (!data.siteInfo?.semanticMarkup) return null
        const semantic = data.siteInfo.semanticMarkup
        
        return {
          label: t('semanticMarkup.semanticStructure'),
          value: t('semanticMarkup.points', { score: semantic.semanticScore }),
          detail: semantic.semanticScore >= 80 ? 
            t('semanticMarkup.wellStructured') :
            semantic.semanticScore >= 60 ?
            t('semanticMarkup.partiallyStructured') :
            t('semanticMarkup.needsImprovement'),
          semanticDetails: {
            elements: {
              header: semantic.hasHeader,
              nav: semantic.hasNav,
              main: semantic.hasMain,
              footer: semantic.hasFooter,
              section: semantic.hasSection,
              article: semantic.hasArticle,
              aside: semantic.hasAside,
              h1: semantic.hasH1
            },
            structure: {
              headingStructure: semantic.headingStructure,
              ariaAttributes: semantic.ariaAttributes,
              roleAttributes: semantic.roleAttributes
            },
            score: semantic.semanticScore,
            issues: semantic.issues,
            suggestions: semantic.suggestions
          }
        }
      default:
        return null
    }
  }

  // 점수 계산에 포함되는 주요 카테고리 (이미지 제외)
  const mainCategories = data.categories.filter(cat => cat.id !== 'images')
  const optionalCategories = data.categories.filter(cat => cat.id === 'images')
  
  
  const goodCategories = mainCategories.filter(cat => cat.status === 'good')
  const warningCategories = mainCategories.filter(cat => cat.status === 'warning')
  const dangerCategories = mainCategories.filter(cat => cat.status === 'danger')

  const handleFeedbackSubmit = async (feedback: {
    rating: number
    helpful: boolean
    comment?: string
    suggestions?: string[]
  }) => {
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          analysisUrl: data.url
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('errorMessages.feedbackSendFailed'))
      }

      console.log(t('errorMessages.feedbackSendSuccess'), result.message)
    } catch (error) {
      console.error(t('errorMessages.feedbackSendError'), error)
      throw error
    }
  }

  return (
    <div className="analysis-result">
      {/* 헤더 섹션 */}
      <div className="analysis-section" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)', color: 'white', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div className="logo-icon" style={{ width: '48px', height: '48px', marginRight: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/icon.png" alt="SEO Analysis" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
                {t('analysisComplete')}
              </h1>
              <p style={{ fontSize: '1rem', opacity: '0.9', wordBreak: 'break-all' }}>
                {data.url}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
            {/* 전체 점수 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                fontWeight: '700', 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%', 
                width: '120px', 
                height: '120px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                {data.overallScore}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', opacity: '0.9' }}>
                {getScoreText(data.overallScore)}
              </div>
              <div className="analysis-section__subtitle" style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: 'var(--spacing-sm)' }}>
                {t('scoreExplanation')}
              </div>
            </div>
            
            {/* 카테고리별 막대 그래프 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10B981' }}>
                    {goodCategories.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>{t('categoryStatus.excellent')}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#F59E0B' }}>
                    {warningCategories.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>{t('categoryStatus.average')}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#EF4444' }}>
                    {dangerCategories.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>{t('categoryStatus.needsWork')}</div>
                </div>
              </div>
              
              {/* 막대 그래프 */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 'var(--radius-lg)', 
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)'
              }}>
                <div style={{ display: 'flex', height: '24px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {/* 우수 */}
                  {goodCategories.length > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      width: `${(goodCategories.length / mainCategories.length) * 100}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {goodCategories.length > 0 && goodCategories.length}
                    </div>
                  )}
                  {/* 보통 */}
                  {warningCategories.length > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      width: `${(warningCategories.length / mainCategories.length) * 100}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {warningCategories.length > 0 && warningCategories.length}
                    </div>
                  )}
                  {/* 개선필요 */}
                  {dangerCategories.length > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      width: `${(dangerCategories.length / mainCategories.length) * 100}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {dangerCategories.length > 0 && dangerCategories.length}
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  fontSize: '0.875rem', 
                  opacity: '0.8', 
                  textAlign: 'center', 
                  marginTop: 'var(--spacing-sm)' 
                }}>
                  {t('categoryBreakdown', { total: mainCategories.length, excellent: goodCategories.length, average: warningCategories.length, needsWork: dangerCategories.length })}
                </div>
              </div>
              
              {/* 빠른 요약 */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--spacing-sm)',
                fontSize: '0.875rem',
                lineHeight: '1.4'
              }}>
                {t('summaryText', { dangerCount: dangerCategories.length, warningCount: warningCategories.length })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사이트 정보 섹션 */}
      {data.siteInfo && (
        <div className="analysis-section">
          <div className="analysis-section__header">
            <div className="analysis-section__header-icon gradient-bg--primary">
              🔍
            </div>
            <h2 className="analysis-section__header-title">
              {t('siteAnalysisInfo')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
            {/* 기본 정보 */}
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">
                  🏢
                </div>
                <div className="site-info-card__title">{t('websiteBasicInfo')}</div>
              </div>
              <div className="site-info-card__content">
                <div className="site-info-item">
                  <div className="site-info-item__label">{t('domainAddress')}</div>
                  <div className="site-info-item__value">{data.siteInfo.domain}</div>
                </div>
                
                <div className="site-info-item site-info-item--highlight">
                  <div className="site-info-item__label">{t('estimatedIndustry')}</div>
                  <div className="site-info-item__value site-info-item__value--primary">
                    {translateBusinessData(data.siteInfo.estimated.industry)}
                  </div>
                  <div className="site-info-item__description">{t('aiAnalyzedBusiness')}</div>
                </div>
                
                <div className="site-info-item">
                  <div className="site-info-item__label">{t('targetAudience')}</div>
                  <div className="site-info-item__value">{translateBusinessData(data.siteInfo.estimated.targetAudience)}</div>
                </div>
                
                <div className="site-info-item">
                  <div className="site-info-item__label">{t('language')}</div>
                  <div className="site-info-item__value">{data.siteInfo.language}</div>
                </div>
              </div>
            </div>

            {/* 기술적 정보 */}
            <div className="tech-seo-card">
              <div className="tech-seo-card__header">
                <div className="tech-seo-card__icon gradient-bg--secondary">
                  ⚙️
                </div>
                <div className="tech-seo-card__title">{t('technicalSeoAnalysis')}</div>
              </div>
              <div className="tech-seo-card__content">
                <div className="tech-seo-item">
                  <div className="tech-seo-item__label">📝 {t('techSeo.contentAmount')}</div>
                  <div className="tech-seo-item__value">{t('techSeo.words', { count: data.siteInfo.technicalInfo.wordCount.toLocaleString() })}</div>
                  <div className="tech-seo-item__status">
                    {data.siteInfo.technicalInfo.wordCount >= 300 ? t('techSeo.sufficientContent') : t('techSeo.moreContentNeeded')}
                  </div>
                </div>
                
                <div className="tech-seo-item">
                  <div className="tech-seo-item__label">🖼 {t('techSeo.imagesAndLinks')}</div>
                  <div className="tech-seo-item__value">
                    {t('techSeo.imageCount', { count: data.siteInfo.technicalInfo.imageCount })}, {t('techSeo.linkCount', { count: data.siteInfo.technicalInfo.linkCount })}
                  </div>
                </div>
                
                <div className="tech-seo-item">
                  <div className="tech-seo-item__label">📱 {t('techSeo.mobileOptimization')}</div>
                  <div className={`tech-seo-item__status-row ${data.siteInfo.technicalInfo.hasViewport ? 'tech-seo-item__status-row--success' : 'tech-seo-item__status-row--danger'}`}>
                    <span className={`tech-seo-icon ${data.siteInfo.technicalInfo.hasViewport ? 'tech-seo-icon--success' : 'tech-seo-icon--danger'}`}>
                      {data.siteInfo.technicalInfo.hasViewport ? '✓' : '×'}
                    </span>
                    <span className="tech-seo-item__value">
                      {data.siteInfo.technicalInfo.hasViewport ? t('techSeo.viewportSet') : t('techSeo.viewportNotSet')}
                    </span>
                  </div>
                  <div className="tech-seo-item__description">
                    {data.siteInfo.technicalInfo.hasViewport ? t('techSeo.mobileGoodDisplay') : t('techSeo.mobileSmallDisplay')}
                  </div>
                </div>
                
                <div className="tech-seo-item tech-seo-item--structured">
                  <div className="tech-seo-item__label">🔍 {t('techSeo.googleSiteExplanation')}</div>
                  <div className={`tech-seo-item__status-row ${data.siteInfo.technicalInfo.hasStructuredData ? 'tech-seo-item__status-row--success' : 'tech-seo-item__status-row--danger'}`}>
                    <span className={`tech-seo-icon ${data.siteInfo.technicalInfo.hasStructuredData ? 'tech-seo-icon--success' : 'tech-seo-icon--danger'}`}>
                      {data.siteInfo.technicalInfo.hasStructuredData ? '✓' : '×'}
                    </span>
                    <span className="tech-seo-item__value">
                      {data.siteInfo.technicalInfo.hasStructuredData ? t('techSeo.googleUnderstands') : t('techSeo.googleConfused')}
                    </span>
                  </div>
                  <div className="tech-seo-item__description">
                    {data.siteInfo.technicalInfo.hasStructuredData ? 
                      t('techSeo.structuredDataGood') : 
                      t('techSeo.structuredDataBad')}
                  </div>
                  <div className="tech-seo-item__tip">
                    💡 <strong>{t('ui.structuredDataTipLabel')}</strong> {t('techSeo.structuredDataTip')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-md gradient-bg--info" style={{ borderRadius: 'var(--radius-lg)' }}>
            <p className="font-sm">
              <span className="icon icon--info">💡</span>
              <strong>{t('ui.analysisReliability')}</strong>
            </p>
          </div>
        </div>
      )}

      {/* 상세 분석 결과 섹션 */}
      <div className="analysis-section">
        <div className="analysis-section__header">
          <div className="analysis-section__header-icon gradient-bg--success">
            📊
          </div>
          <h2 className="analysis-section__header-title">
            {t('detailedResults')}
          </h2>
        </div>
        
        {/* 주요 SEO 분석 결과 */}
        <div className="analysis-section__header">
          <div className="analysis-section__header-icon gradient-bg--primary">
            📊
          </div>
          <h2 className="analysis-section__header-title">
            {t('mainSeoResults')}
          </h2>
        </div>
        
        <div className="seo-grid">
            {mainCategories.map(category => {
            const currentValue = getCurrentValue(category.id)
            return (
              <div 
                key={category.id} 
                className={`seo-card seo-card--${category.status}`}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setShowDetailModal(true)
                }}
              >
                <div className="seo-card__header">
                  <div className={`seo-card__icon seo-card__icon--${category.status}`}>
                    {getStatusIcon(category.status)}
                  </div>
                  <div className="seo-card__info">
                    <h3 className="seo-card__title">{translateCategoryName(category.name)}</h3>
                    <div className="seo-card__score">{category.score}{t('ui.points')}</div>
                  </div>
                </div>
                
                {currentValue && (
                  <div className="seo-card__current">
                    <div className="seo-card__current-value">
                      {currentValue.value}
                      {currentValue.length !== undefined && (
                        <span className="seo-card__current-length">{t('ui.charactersCount', { length: currentValue.length })}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="seo-card__description">
                  {(() => {
                    const desc = getCategoryDescription(category.id, category.status)
                    return desc.length > 60 ? desc.substring(0, 60) + '...' : desc
                  })()}
                </div>
                
                <div className="seo-card__action">
                  <span className="seo-card__action-text">{t('ui.viewDetails')}</span>
                  <span className="seo-card__action-arrow">→</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 선택사항 분석 결과 */}
      {optionalCategories.length > 0 && (
        <div className="analysis-section">
          <div className="analysis-section__header">
            <div className="analysis-section__header-icon gradient-bg--secondary">
              📋
            </div>
            <h2 className="analysis-section__header-title">
              {t('additionalResults')}
            </h2>
            <p className="analysis-section__subtitle">
              {t('additionalResultsNote')}
            </p>
          </div>
          
          <div className="seo-grid">
            {optionalCategories.map(category => {
              const currentValue = getCurrentValue(category.id)
              return (
                <div 
                  key={category.id} 
                  className={`seo-card seo-card--${category.status} seo-card--optional`}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setShowDetailModal(true)
                  }}
                >
                  <div className="seo-card__header">
                    <div className={`seo-card__icon seo-card__icon--${category.status}`}>
                      {getStatusIcon(category.status)}
                    </div>
                    <div className="seo-card__info">
                      <h3 className="seo-card__title">
                        {translateCategoryName(category.name)}
                        <span className="seo-card__optional-badge">{t('referenceOnly')}</span>
                      </h3>
                      <div className="seo-card__score">{category.score}{t('ui.points')}</div>
                    </div>
                  </div>
                  
                  {currentValue && (
                    <div className="seo-card__current">
                      <div className="seo-card__current-label">{currentValue.label}</div>
                      <div className="seo-card__current-value">
                        {currentValue.value}
                        {currentValue.length !== undefined && (
                          <span className="seo-card__current-length">{t('ui.charactersCount', { length: currentValue.length })}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="seo-card__description">
                    {(() => {
                      const desc = getCategoryDescription(category.id, category.status)
                      return desc.length > 60 ? desc.substring(0, 60) + '...' : desc
                    })()}
                  </div>
                  
                  <div className="seo-card__action">
                    <span className="seo-card__action-text">{t('ui.viewDetails')}</span>
                    <span className="seo-card__action-arrow">→</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI 맞춤 조언 섹션 */}
      {data.aiAdvice && (
        <div className="analysis-section">
          <div className="analysis-section__header">
            <div className="analysis-section__header-icon gradient-bg">
              🤖
            </div>
            <h2 className="analysis-section__header-title">
              {t('aiCustomAdvice')}
            </h2>
          </div>
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--info">📋</span>
              {t('overallEvaluation')}
            </h3>
            <div className="p-md" style={{ backgroundColor: 'var(--color-gray-100)', borderRadius: 'var(--radius-md)' }}>
              <p className="font-md">{data.aiAdvice.overallAdvice}</p>
            </div>
          </div>
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--warning">🎯</span>
              {t('priorityActions')}
            </h3>
            <div className="flex flex-col gap-sm">
              {data.aiAdvice.priorityActions.map((action, index) => (
                <div key={index} className="flex items-center gap-sm p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <span className="font-md font-weight-bold" style={{ color: 'var(--color-primary)' }}>
                    {index + 1}.
                  </span>
                  <span className="font-md">{action}</span>
                </div>
              ))}
            </div>
          </div>
          
          {data.businessType && data.businessType !== 'other' && (
            <div className="mb-lg">
              <h3 className="font-lg mb-sm">
                <span className="icon icon--warning">💡</span>
                {t('ui.specializedTips', { businessType: data.businessType })}
              </h3>
              <div className="flex flex-col gap-sm">
                {data.aiAdvice.industrySpecificTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-sm p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <span className="icon icon--warning" style={{ fontSize: '0.875rem' }}>⭐</span>
                    <span className="font-md">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--success">🏆</span>
              {t('ui.expectedResultsTitle')}
            </h3>
            <div className="p-md gradient-bg" style={{ borderRadius: 'var(--radius-lg)' }}>
              <p className="font-md">{data.aiAdvice.expectedResults}</p>
            </div>
          </div>
        </div>
      )}

      {/* 키워드 제안 섹션 */}
      {data.keywordSuggestions && data.keywordSuggestions.length > 0 && (
        <div className="analysis-section">
          <div className="analysis-section__header">
            <div className="analysis-section__header-icon gradient-bg--warning">
              🏷
            </div>
            <h2 className="analysis-section__header-title">
              {t('ui.aiRecommendedKeywords')}
            </h2>
          </div>
          <p className="font-md text-secondary mb-md">
            {t('ui.keywordDescription', { siteType: data.siteType || '', businessType: data.businessType || '' })}
          </p>
          <div className="flex flex-wrap gap-sm">
            {data.keywordSuggestions.map((keyword, index) => (
              <span 
                key={index}
                className="p-sm font-sm"
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'var(--color-text-white)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '500'
                }}
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="action-buttons mb-xl">
        <button
          onClick={onNewAnalysis}
          className="btn btn-primary btn-lg"
        >
          <span className="icon icon--primary">🔍</span>
          {t('analyzeOtherSite')}
        </button>
        <button 
          onClick={() => setShowFeedback(true)}
          className="btn btn-outline btn-lg"
        >
          <span className="icon icon--info">💬</span>
          {t('evaluateService')}
        </button>
        {/* <button className="btn btn-outline btn-lg">
          <span className="icon icon--secondary">💾</span>
          Save Results
        </button> */}
      </div>
      
      {/* 모달들 */}
      <SeoDetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        category={data.categories.find(cat => cat.id === selectedCategory) || null}
        currentValue={selectedCategory ? getCurrentValue(selectedCategory) || undefined : undefined}
        siteInfo={data.siteInfo}
      />

      {showFeedback && (
        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          analysisUrl={data.url}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  )
}
