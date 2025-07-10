'use client'

import { useState } from 'react'
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'good'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return '매우 좋아요! 😊'
    if (score >= 60) return '괜찮아요! 😐'
    return '개선이 필요해요 😔'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <span className="icon icon--success">✓</span>
      case 'warning': return <span className="icon icon--warning">!</span>
      case 'danger': return <span className="icon icon--danger">×</span>
      default: return <span className="icon icon--secondary">?</span>
    }
  }

  const getCurrentValue = (categoryId: string) => {
    // 현재 상태 데이터를 반환하는 함수
    if (!data.siteInfo) return null
    
    switch (categoryId) {
      case 'title':
        return {
          label: '현재 페이지 제목',
          value: data.siteInfo.title || '제목 없음',
          length: data.siteInfo.title?.length || 0,
          detail: data.siteInfo.title?.length ? 
            `권장 길이: 30-60자 (현재: ${data.siteInfo.title.length}자)` : 
            '페이지 제목이 설정되지 않았습니다.'
        }
      case 'description':
        return {
          label: '현재 메타 설명',
          value: data.siteInfo.description || '설명 없음',
          length: data.siteInfo.description?.length || 0,
          detail: data.siteInfo.description?.length ? 
            `권장 길이: 120-160자 (현재: ${data.siteInfo.description.length}자)` : 
            '메타 설명이 설정되지 않았습니다.'
        }
      case 'mobile':
        return {
          label: '모바일 뷰포트 설정',
          value: data.siteInfo.technicalInfo.hasViewport ? '설정됨' : '설정되지 않음',
          detail: data.siteInfo.technicalInfo.hasViewport ? 
            '모바일 기기에서 적절히 표시됩니다.' : 
            '모바일 기기에서 제대로 표시되지 않을 수 있습니다.'
        }
      case 'speed':
        const speedCategory = data.categories.find(cat => cat.id === 'speed')
        const speedScore = speedCategory?.score || 0
        return {
          label: '사이트 속도 (페이지 열리는 시간)',
          value: speedScore >= 80 ? '⚡ 매우 빠름' : speedScore >= 60 ? '🚶 보통 속도' : '🐌 느림',
          detail: speedScore >= 80 ? 
            '⚡ 웹사이트가 매우 빠르게 열려요! 방문자들이 기다리지 않고 바로 볼 수 있어서 좋습니다.' : 
            speedScore >= 60 ? 
            '🚶 웹사이트 속도가 보통이에요. 조금 더 빠르게 만들면 방문자들이 더 만족할 거예요.' : 
            '🐌 웹사이트가 너무 느려요. 방문자들이 기다리다 지쳐서 다른 사이트로 갈 수 있어요. 속도 개선이 꼭 필요해요!'
        }
      case 'images':
        return {
          label: '이미지 분석',
          value: `총 ${data.siteInfo.technicalInfo.imageCount}개`,
          detail: `이미지 최적화 상태를 확인해보세요.`
        }
      case 'heading':
        const headingCategory = data.categories.find(cat => cat.id === 'heading')
        const headingStatus = headingCategory?.status || 'good'
        return {
          label: '페이지 제목 구성 (목차 만들기)',
          value: headingStatus === 'good' ? '✅ 목차가 잘 만들어짐' : headingStatus === 'warning' ? '⚠️ 목차 순서 개선 필요' : '❌ 목차가 없거나 엉망',
          detail: headingStatus === 'good' ? 
            '🎉 웹페이지의 목차(제목)가 깔끔하게 정리되어 있어요! 방문자와 구글이 내용을 쉽게 이해할 수 있습니다.' : 
            headingStatus === 'warning' ? 
            '⚠️ 제목을 조금 더 체계적으로 정리하면 좋겠어요. 큰 제목→중간 제목→작은 제목 순서로 만들어보세요.' : 
            '❌ 웹페이지에 제목이 없거나 순서가 뒤죽박죽이에요. 책의 목차처럼 큰 제목부터 차례대로 만들어주세요.',
          structure: {
            hasH1: headingStatus !== 'danger',
            isLogical: headingStatus === 'good',
            recommendation: headingStatus === 'good' ? 
              '현재 목차 구성을 계속 유지하세요' : 
              '큰 제목(H1) → 중간 제목(H2) → 작은 제목(H3) 순서로 만들어보세요'
          }
        } as any
      case 'content':
        return {
          label: '콘텐츠 길이',
          value: `${data.siteInfo.technicalInfo.wordCount.toLocaleString()}단어`,
          detail: data.siteInfo.technicalInfo.wordCount >= 300 ? 
            '충분한 콘텐츠 양입니다.' : 
            '더 많은 콘텐츠가 SEO에 도움이 될 수 있습니다.'
        }
      case 'social':
        return {
          label: '소셜 미디어 최적화',
          value: `Open Graph: ${data.siteInfo.socialTags.hasOpenGraph ? '설정됨' : '미설정'}, Twitter: ${data.siteInfo.socialTags.hasTwitterCard ? '설정됨' : '미설정'}`,
          detail: (data.siteInfo.socialTags.hasOpenGraph && data.siteInfo.socialTags.hasTwitterCard) ? 
            '소셜 미디어에서 멋지게 공유됩니다!' : 
            '소셜 미디어 공유 설정을 추가하면 더 많은 방문자를 얻을 수 있어요.'
        }
      case 'structured':
        return {
          label: '구글에게 사이트 설명하기',
          value: data.siteInfo.technicalInfo.hasStructuredData ? '✅ 구글이 잘 이해함' : '❌ 구글이 헷갈림',
          detail: data.siteInfo.technicalInfo.hasStructuredData ? 
            '✅ 구글이 여러분 사이트가 무엇인지 정확히 알고 있어요! 검색 결과에 별점, 가격, 리뷰 등이 예쁘게 나올 수 있어요.' : 
            '❌ 구글이 여러분 사이트가 뭘 파는지, 어떤 서비스인지 잘 모르겠어해요. 구글에게 친절하게 설명해주면 검색 결과에서 더 눈에 띄게 나와요!',
          explanation: data.siteInfo.technicalInfo.hasStructuredData ? 
            '구조화 데이터(Schema.org)가 잘 설정되어 있어요! 이것은 마치 구글에게 "우리 사이트는 카페야, 여기 전화번호야, 여기 주소야" 하고 친절하게 설명해주는 것과 같아요.' : 
            '구조화 데이터(Schema.org)가 없어요. 이것은 마치 가게 간판 없이 장사하는 것과 같아요. 구글에게 "우리는 ○○ 업체야, 연락처는 이거야" 하고 설명해주면 검색 결과에서 더 잘 보여요!'
        }
      case 'technical':
        return {
          label: '기술적 SEO',
          value: `모바일: ${data.siteInfo.technicalInfo.hasViewport ? '✓' : '✗'}, 구조화데이터: ${data.siteInfo.technicalInfo.hasStructuredData ? '✓' : '✗'}`,
          detail: '기술적 SEO는 검색엔진이 사이트를 제대로 읽을 수 있게 도와줍니다.'
        }
      default:
        return null
    }
  }

  const goodCategories = data.categories.filter(cat => cat.status === 'good')
  const warningCategories = data.categories.filter(cat => cat.status === 'warning')
  const dangerCategories = data.categories.filter(cat => cat.status === 'danger')

  const handleFeedbackSubmit = async (feedback: {
    rating: number
    helpful: boolean
    comment?: string
    suggestions?: string[]
  }) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          url: data.url
        }),
      })

      if (!response.ok) {
        throw new Error('피드백 전송 실패')
      }

      console.log('피드백 전송 성공')
    } catch (error) {
      console.error('피드백 전송 오류:', error)
      throw error
    }
  }

  return (
    <div className="analysis-result">
      {/* 헤더 섹션 */}
      <div className="analysis-section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div className="logo-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem', marginRight: 'var(--spacing-md)' }}>
              🎯
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
                SEO 분석 완료!
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
            </div>
            
            {/* 카테고리별 막대 그래프 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10B981' }}>
                    {goodCategories.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>우수</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#F59E0B' }}>
                    {warningCategories.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>보통</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#EF4444' }}>
                    {dangerCategories.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>개선필요</div>
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
                      width: `${(goodCategories.length / data.categories.length) * 100}%`,
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
                      width: `${(warningCategories.length / data.categories.length) * 100}%`,
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
                      width: `${(dangerCategories.length / data.categories.length) * 100}%`,
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
                  총 {data.categories.length}개 항목 중 {goodCategories.length}개 우수, {warningCategories.length}개 보통, {dangerCategories.length}개 개선필요
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
                💡 <strong>핵심 요약:</strong> 
                {dangerCategories.length > 0 
                  ? `${dangerCategories.length}개 항목의 우선 개선이 필요하며, ` 
                  : '주요 문제는 없으나, '}
                {warningCategories.length > 0 
                  ? `${warningCategories.length}개 항목을 보완하면 ` 
                  : ''}
                더 좋은 검색 결과를 얻을 수 있습니다.
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
              사이트 분석 정보
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
            {/* 기본 정보 */}
            <div className="metric-card">
              <div className="metric-card__header">
                <div className="metric-card__icon gradient-bg--info">
                  🏢
                </div>
                <div className="metric-card__title">웹사이트 기본 정보</div>
              </div>
              <div className="space-y-sm">
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">🌐 도메인 주소</div>
                  <div className="font-sm font-weight-bold">{data.siteInfo.domain}</div>
                </div>
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">🏷 추정 업종</div>
                  <div className="font-sm font-weight-bold" style={{ color: 'var(--color-primary)' }}>{data.siteInfo.estimated.industry}</div>
                  <div className="font-xs text-secondary mt-xs">AI가 분석한 사업 분야입니다</div>
                </div>
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">👥 주요 고객층</div>
                  <div className="font-sm">{data.siteInfo.estimated.targetAudience}</div>
                </div>
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">🌍 사용 언어</div>
                  <div className="font-sm">{data.siteInfo.language}</div>
                </div>
              </div>
            </div>

            {/* 기술적 정보 */}
            <div className="metric-card">
              <div className="metric-card__header">
                <div className="metric-card__icon gradient-bg--secondary">
                  ⚙️
                </div>
                <div className="metric-card__title">기술적 SEO 분석</div>
              </div>
              <div className="space-y-sm">
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">📝 콘텐츠 양</div>
                  <div className="font-sm font-weight-bold">{data.siteInfo.technicalInfo.wordCount.toLocaleString()}단어</div>
                  <div className="font-xs text-secondary mt-xs">
                    {data.siteInfo.technicalInfo.wordCount >= 300 ? '✓ 충분한 콘텐츠' : '⚠ 더 많은 콘텐츠 필요'}
                  </div>
                </div>
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">🖼 이미지 & 📎 링크</div>
                  <div className="font-sm">이미지 {data.siteInfo.technicalInfo.imageCount}개, 링크 {data.siteInfo.technicalInfo.linkCount}개</div>
                </div>
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">📱 모바일 최적화</div>
                  <div className={`font-sm flex items-center gap-xs ${data.siteInfo.technicalInfo.hasViewport ? 'text-success' : 'text-danger'}`}>
                    <span className={`icon ${data.siteInfo.technicalInfo.hasViewport ? 'icon--success' : 'icon--danger'}`}>
                      {data.siteInfo.technicalInfo.hasViewport ? '✓' : '×'}
                    </span>
                    {data.siteInfo.technicalInfo.hasViewport ? '뷰포트 설정됨' : '뷰포트 미설정'}
                  </div>
                  <div className="font-xs text-secondary mt-xs">
                    {data.siteInfo.technicalInfo.hasViewport ? '핸드폰에서 잘 보입니다' : '핸드폰에서 작게 보일 수 있어요'}
                  </div>
                </div>
                <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="font-xs text-secondary mb-xs">🔍 구글에게 사이트 설명하기 (구조화 데이터)</div>
                  <div className={`font-sm flex items-center gap-xs ${data.siteInfo.technicalInfo.hasStructuredData ? 'text-success' : 'text-danger'}`}>
                    <span className={`icon ${data.siteInfo.technicalInfo.hasStructuredData ? 'icon--success' : 'icon--danger'}`}>
                      {data.siteInfo.technicalInfo.hasStructuredData ? '✓' : '×'}
                    </span>
                    {data.siteInfo.technicalInfo.hasStructuredData ? '구글이 잘 이해함' : '구글이 헷갈림'}
                  </div>
                  <div className="font-xs text-secondary mt-xs">
                    {data.siteInfo.technicalInfo.hasStructuredData ? 
                      '✅ Schema.org 마크업이 있어서 구글이 사이트를 정확히 파악해요! 검색 결과에 별점, 가격, 운영시간 등이 예쁘게 나올 수 있어요.' : 
                      '❌ 구조화 데이터가 없어요. 마치 가게 간판 없이 장사하는 것과 같아요. 구글에게 "우리는 ○○ 업체야, 연락처는 이거야" 하고 설명해주면 검색 결과에서 더 잘 보여요!'}
                  </div>
                  <div className="font-xs text-secondary mt-xs" style={{ fontStyle: 'italic' }}>
                    💡 <strong>구조화 데이터란?</strong> 구글에게 "우리 사이트는 카페야, 주소는 여기야, 전화번호는 이거야" 하고 친절하게 설명해주는 코드예요
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-md gradient-bg--info" style={{ borderRadius: 'var(--radius-lg)' }}>
            <p className="font-sm">
              <span className="icon icon--info">💡</span>
              <strong>분석 신뢰도:</strong> 이 정보들은 실제 웹페이지를 분석해서 얻은 결과입니다. 
              더 정확한 분석을 위해서는 Google Analytics나 Search Console 데이터와 함께 참고하세요.
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
            상세 분석 결과 - 클릭해서 자세히 보기
          </h2>
        </div>
        
        {/* 전체 SEO 카테고리 그리드 */}
        <div className="seo-grid">
          {data.categories.map(category => {
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
                    <h3 className="seo-card__title">{category.name}</h3>
                    <div className="seo-card__score">{category.score}점</div>
                  </div>
                </div>
                
                {currentValue && (
                  <div className="seo-card__current">
                    <div className="seo-card__current-value">
                      {currentValue.value}
                      {currentValue.length !== undefined && (
                        <span className="seo-card__current-length">({currentValue.length}자)</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="seo-card__description">
                  {category.description.length > 60 ? category.description.substring(0, 60) + '...' : category.description}
                </div>
                
                <div className="seo-card__action">
                  <span className="seo-card__action-text">자세히 보기</span>
                  <span className="seo-card__action-arrow">→</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI 맞춤 조언 섹션 */}
      {data.aiAdvice && (
        <div className="analysis-section">
          <div className="analysis-section__header">
            <div className="analysis-section__header-icon gradient-bg">
              🤖
            </div>
            <h2 className="analysis-section__header-title">
              AI 맞춤 조언
            </h2>
          </div>
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--info">📋</span>
              전체적인 평가
            </h3>
            <div className="p-md" style={{ backgroundColor: 'var(--color-gray-100)', borderRadius: 'var(--radius-md)' }}>
              <p className="font-md">{data.aiAdvice.overallAdvice}</p>
            </div>
          </div>
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--warning">🎯</span>
              우선순위 개선 작업
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
          
          {data.businessType && data.businessType !== '기타' && (
            <div className="mb-lg">
              <h3 className="font-lg mb-sm">
                <span className="icon icon--warning">💡</span>
                {data.businessType} 특화 팁
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
              예상 결과
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
              추천 키워드
            </h2>
          </div>
          <p className="font-md text-secondary mb-md">
            {data.siteType && `${data.siteType} 유형의 `}
            {data.businessType && data.businessType !== '기타' && `${data.businessType} 업종에 `}
            적합한 키워드들이에요. 이런 단어들로 고객들이 검색할 가능성이 높아요!
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
      <div className="text-center mb-xl">
        <button
          onClick={onNewAnalysis}
          className="btn btn-primary btn-lg"
          style={{ marginRight: 'var(--spacing-md)' }}
        >
          <span className="icon icon--primary">🔍</span>
          다른 사이트 분석하기
        </button>
        <button 
          onClick={() => setShowFeedback(true)}
          className="btn btn-outline btn-lg"
          style={{ marginRight: 'var(--spacing-md)' }}
        >
          <span className="icon icon--info">💬</span>
          서비스 평가하기
        </button>
        <button className="btn btn-outline btn-lg">
          <span className="icon icon--secondary">💾</span>
          결과 저장하기
        </button>
      </div>
      
      {/* 모달들 */}
      <SeoDetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        category={data.categories.find(cat => cat.id === selectedCategory) || null}
        currentValue={selectedCategory ? getCurrentValue(selectedCategory) : undefined}
        siteInfo={data.siteInfo}
      />

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  )
}