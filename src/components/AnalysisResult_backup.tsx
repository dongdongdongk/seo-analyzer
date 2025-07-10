'use client'

import { useState } from 'react'
import FeedbackModal from './FeedbackModal'


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
        return {
          label: '현재 성능 점수',
          value: `${speedCategory?.score || 0}점`,
          detail: speedCategory?.score >= 80 ? 
            '훌륭한 성능입니다!' : 
            speedCategory?.score >= 60 ? 
            '보통 성능입니다. 개선 여지가 있습니다.' : 
            '성능 개선이 필요합니다.'
        }
      case 'images':
        return {
          label: '이미지 분석',
          value: `총 ${data.siteInfo.technicalInfo.imageCount}개`,
          detail: `이미지 최적화 상태를 확인해보세요.`
        }
      case 'heading':
        return {
          label: '제목 구조',
          value: 'H1~H6 태그 구조',
          detail: '적절한 제목 구조는 SEO에 중요합니다.'
        }
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
          label: '구조화 데이터 (Schema.org)',
          value: data.siteInfo.technicalInfo.hasStructuredData ? '설정됨' : '미설정',
          detail: data.siteInfo.technicalInfo.hasStructuredData ? 
            '검색엔진이 사이트를 잘 이해합니다!' : 
            '구조화 데이터를 추가하면 검색 결과에서 더 돋보일 수 있어요.'
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
      <div className="analysis-result__header">
        <h1 className="analysis-result__header-title">
          📊 분석 완료!
        </h1>
        <p className="analysis-result__header-url">
          {data.url}
        </p>
        
        <div className="analysis-result__header-summary">
          <div className="analysis-result__score">
            <div className={`analysis-result__score-number ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}점
            </div>
            <div className="analysis-result__score-label">
              {getScoreText(data.overallScore)}
            </div>
          </div>
          
          <div className="flex gap-md">
            <div className="text-center">
              <div className="font-xxl status-good">
                {goodCategories.length}개
              </div>
              <div className="font-sm text-secondary">
                좋아요
              </div>
            </div>
            <div className="text-center">
              <div className="font-xxl status-warning">
                {warningCategories.length}개
              </div>
              <div className="font-sm text-secondary">
                보통
              </div>
            </div>
            <div className="text-center">
              <div className="font-xxl status-danger">
                {dangerCategories.length}개
              </div>
              <div className="font-sm text-secondary">
                개선필요
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
                  <div className="font-xs text-secondary mb-xs">🔍 구조화 데이터 (Schema.org)</div>
                  <div className={`font-sm flex items-center gap-xs ${data.siteInfo.technicalInfo.hasStructuredData ? 'text-success' : 'text-danger'}`}>
                    <span className={`icon ${data.siteInfo.technicalInfo.hasStructuredData ? 'icon--success' : 'icon--danger'}`}>
                      {data.siteInfo.technicalInfo.hasStructuredData ? '✓' : '×'}
                    </span>
                    {data.siteInfo.technicalInfo.hasStructuredData ? '설정됨' : '미설정'}
                  </div>
                  <div className="font-xs text-secondary mt-xs">
                    {data.siteInfo.technicalInfo.hasStructuredData ? 
                      '검색엔진이 사이트를 잘 이해합니다' : 
                      '설정하면 검색결과에서 더 돋보일 수 있어요'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 소셜 미디어 최적화 & Schema.org 섹션 */}
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--primary">📱</span>
              소셜 미디어 & 구조화 데이터 최적화
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* 소셜 미디어 카드 */}
              <div className="metric-card">
                <div className="metric-card__header">
                  <div className="metric-card__icon gradient-bg--success">
                    📱
                  </div>
                  <div className="metric-card__title">소셜 미디어 공유 설정</div>
                </div>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div className="font-xs text-secondary mb-xs">📋 Open Graph (페이스북/링크드인)</div>
                    <div className={`font-sm flex items-center gap-xs ${data.siteInfo.socialTags.hasOpenGraph ? 'text-success' : 'text-danger'}`}>
                      <span className={`icon ${data.siteInfo.socialTags.hasOpenGraph ? 'icon--success' : 'icon--danger'}`}>
                        {data.siteInfo.socialTags.hasOpenGraph ? '✓' : '×'}
                      </span>
                      {data.siteInfo.socialTags.hasOpenGraph ? '설정됨' : '미설정'}
                    </div>
                    <div className="font-xs text-secondary mt-xs">
                      {data.siteInfo.socialTags.hasOpenGraph ? 
                        '페이스북에서 멋지게 공유됩니다!' : 
                        '페이스북 공유 시 정보가 제대로 표시되지 않을 수 있어요'}
                    </div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div className="font-xs text-secondary mb-xs">🐦 Twitter Card</div>
                    <div className={`font-sm flex items-center gap-xs ${data.siteInfo.socialTags.hasTwitterCard ? 'text-success' : 'text-danger'}`}>
                      <span className={`icon ${data.siteInfo.socialTags.hasTwitterCard ? 'icon--success' : 'icon--danger'}`}>
                        {data.siteInfo.socialTags.hasTwitterCard ? '✓' : '×'}
                      </span>
                      {data.siteInfo.socialTags.hasTwitterCard ? '설정됨' : '미설정'}
                    </div>
                    <div className="font-xs text-secondary mt-xs">
                      {data.siteInfo.socialTags.hasTwitterCard ? 
                        '트위터에서 카드 형태로 보기 좋게 공유됩니다!' : 
                        '트위터에서 단순 링크로만 공유돼요'}
                    </div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div className="font-xs text-secondary mb-xs">🖼️ 공유 이미지</div>
                    <div className={`font-sm flex items-center gap-xs ${data.siteInfo.socialTags.ogImage ? 'text-success' : 'text-warning'}`}>
                      <span className={`icon ${data.siteInfo.socialTags.ogImage ? 'icon--success' : 'icon--warning'}`}>
                        {data.siteInfo.socialTags.ogImage ? '✓' : '!'}
                      </span>
                      {data.siteInfo.socialTags.ogImage ? '설정됨' : '권장: 추가하세요'}
                    </div>
                    <div className="font-xs text-secondary mt-xs">
                      {data.siteInfo.socialTags.ogImage ? 
                        '공유할 때 이미지와 함께 표시됩니다' : 
                        '1200x630px 크기의 이미지를 추가하면 더 매력적이에요'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Schema.org 구조화 데이터 카드 */}
              <div className="metric-card">
                <div className="metric-card__header">
                  <div className="metric-card__icon gradient-bg--warning">
                    🔍
                  </div>
                  <div className="metric-card__title">Schema.org 구조화 데이터</div>
                </div>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div className="font-xs text-secondary mb-xs">📊 현재 상태</div>
                    <div className={`font-sm flex items-center gap-xs ${data.siteInfo.technicalInfo.hasStructuredData ? 'text-success' : 'text-danger'}`}>
                      <span className={`icon ${data.siteInfo.technicalInfo.hasStructuredData ? 'icon--success' : 'icon--danger'}`}>
                        {data.siteInfo.technicalInfo.hasStructuredData ? '✓' : '×'}
                      </span>
                      {data.siteInfo.technicalInfo.hasStructuredData ? '설정됨' : '미설정'}
                    </div>
                    <div className="font-xs text-secondary mt-xs">
                      {data.siteInfo.technicalInfo.hasStructuredData ? 
                        '검색엔진이 사이트 정보를 정확히 이해합니다!' : 
                        '설정하면 검색결과에서 더 돋보일 수 있어요'}
                    </div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', border: '1px solid #F59E0B' }}>
                    <div className="font-xs" style={{ color: '#92400E' }}>💡 Schema.org란?</div>
                    <div className="font-xs mt-xs" style={{ color: '#92400E', lineHeight: '1.4' }}>
                      구글, 네이버 등 검색엔진이 웹사이트 내용을 더 잘 이해할 수 있도록 돕는 '설명서' 같은 코드입니다.
                    </div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div className="font-xs text-secondary mb-xs">🎯 추천 스키마 ({data.siteInfo.estimated.industry})</div>
                    <div className="font-xs text-secondary">
                      {data.siteInfo.estimated.industry === '쇼핑몰/이커머스' && '• Product (상품 정보)\n• Organization (회사 정보)\n• Review (리뷰 정보)'}
                      {data.siteInfo.estimated.industry === '병원/의료' && '• MedicalOrganization (의료기관)\n• LocalBusiness (지역사업체)\n• Service (의료서비스)'}
                      {data.siteInfo.estimated.industry === '학원/교육' && '• EducationalOrganization (교육기관)\n• Course (강의 정보)\n• LocalBusiness (지역사업체)'}
                      {data.siteInfo.estimated.industry === '법무/법률' && '• LegalService (법률서비스)\n• Organization (조직 정보)\n• LocalBusiness (지역사업체)'}
                      {data.siteInfo.estimated.industry === '부동산' && '• RealEstateAgent (부동산중개)\n• LocalBusiness (지역사업체)\n• Organization (회사 정보)'}
                      {data.siteInfo.estimated.industry === '음식점/카페' && '• Restaurant (음식점)\n• LocalBusiness (지역사업체)\n• Menu (메뉴 정보)'}
                      {!['쇼핑몰/이커머스', '병원/의료', '학원/교육', '법무/법률', '부동산', '음식점/카페'].includes(data.siteInfo.estimated.industry) && 
                        '• Organization (조직 정보)\n• LocalBusiness (지역사업체)\n• WebSite (웹사이트 정보)'}
                    </div>
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

      {/* 성능 분석 안내 섹션 */}
      <div className="analysis-section">
        <div className="analysis-section__header">
          <div className="analysis-section__header-icon gradient-bg--info">
            📊
          </div>
          <h2 className="analysis-section__header-title">
            성능 분석 정보
          </h2>
        </div>
        
        <div className="mb-lg p-md gradient-bg--info" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h3 className="font-lg mb-sm" style={{ color: 'white' }}>
            <span className="icon icon--info">ℹ</span>
            분석 데이터에 대해 알아두세요
          </h3>
          <ul style={{ paddingLeft: 'var(--spacing-lg)', lineHeight: '1.6' }}>
            <li className="mb-sm">
              <strong>모바일 환경 기준:</strong> 이 점수는 느린 모바일 환경(3G 네트워크)에서의 결과이며, 실제 사용자 경험은 다를 수 있습니다.
            </li>
            <li className="mb-sm">
              <strong>시뮬레이션 데이터:</strong> 실제 방문자가 적은 사이트는 실험실 데이터로만 분석됩니다.
            </li>
            <li className="mb-sm">
              <strong>개선에 집중:</strong> 점수보다는 구체적인 개선 방법을 따라해보는 것이 더 중요합니다.
            </li>
          </ul>
        </div>

        {/* 구체적인 개선 방법 섹션 */}
        {data.performanceImprovements && data.performanceImprovements.length > 0 && (
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">
              <span className="icon icon--success">🔧</span>
              구체적인 개선 방법
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {data.performanceImprovements.map((improvement, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-card__header">
                    <div className="metric-card__icon gradient-bg--warning">
                      💡
                    </div>
                    <div className="metric-card__title">{improvement}</div>
                  </div>
                  <p className="font-sm text-secondary">
                    이 개선 사항을 적용하면 사이트 속도가 향상될 수 있습니다.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-md gradient-bg--success" style={{ borderRadius: 'var(--radius-lg)' }}>
          <p className="font-sm">
            <span className="icon icon--success">📈</span>
            <strong>실제 사용자 데이터:</strong> 
            {data.hasFieldData 
              ? ' 이 분석에는 실제 방문자들의 경험 데이터가 포함되어 있어 더욱 정확합니다!'
              : ' 사이트 방문자가 늘어나면 더 정확한 실제 사용자 데이터를 제공할 수 있습니다.'
            }
          </p>
        </div>
      </div>

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

      <div className="analysis-section">
        <div className="analysis-section__header">
          <div className="analysis-section__header-icon gradient-bg--success">
            📊
          </div>
          <h2 className="analysis-section__header-title">
            상세 분석 결과 (카테고리별)
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
          {dangerCategories.map(category => {
            const currentValue = getCurrentValue(category.id)
            return (
              <div key={category.id} className="metric-card">
                <div className="metric-card__header">
                  <div className="metric-card__icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                    {getStatusIcon(category.status)}
                  </div>
                  <div>
                    <h3 className="metric-card__title">
                      {category.name}
                    </h3>
                    <div className="status-indicator status-indicator--danger">
                      {category.score}점 - 개선 필요
                    </div>
                  </div>
                </div>
                
                {/* 현재 상태 표시 */}
                {currentValue && (
                  <div className="metric-card__current">
                    <div className="metric-card__current-label">{currentValue.label}</div>
                    <div className="metric-card__current-value">
                      {currentValue.value}
                      {currentValue.length !== undefined && (
                        <span className="font-sm text-secondary ml-sm">
                          ({currentValue.length}자)
                        </span>
                      )}
                    </div>
                    {currentValue.detail && (
                      <div className="font-sm text-secondary mt-xs" style={{ fontStyle: 'italic' }}>
                        {currentValue.detail}
                      </div>
                    )}
                    
                    {/* 제목 구조 특별 표시 */}
                    {category.id === 'heading' && (currentValue as any).structure && (
                      <div style={{ 
                        marginTop: 'var(--spacing-sm)', 
                        padding: 'var(--spacing-sm)', 
                        background: 'var(--color-bg-secondary)', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div className="font-xs text-secondary mb-xs">📝 제목 구조 분석</div>
                        <div className="flex items-center gap-sm mb-xs">
                          <span className={`icon ${(currentValue as any).structure.hasH1 ? 'icon--success' : 'icon--danger'}`}>
                            {(currentValue as any).structure.hasH1 ? '✓' : '×'}
                          </span>
                          <span className="font-sm">H1 태그 (대제목) 사용</span>
                        </div>
                        <div className="flex items-center gap-sm mb-xs">
                          <span className={`icon ${(currentValue as any).structure.isLogical ? 'icon--success' : 'icon--warning'}`}>
                            {(currentValue as any).structure.isLogical ? '✓' : '!'}
                          </span>
                          <span className="font-sm">논리적 순서 (H1→H2→H3)</span>
                        </div>
                        <div className="font-xs text-secondary mt-xs" style={{ 
                          background: '#FEF3C7', 
                          padding: 'var(--spacing-xs)', 
                          borderRadius: 'var(--radius-xs)',
                          color: '#92400E'
                        }}>
                          💡 권장사항: {(currentValue as any).structure.recommendation}
                        </div>
                        <div className="font-xs text-secondary mt-xs" style={{ lineHeight: '1.4' }}>
                          제목 태그는 책의 목차처럼 내용을 체계적으로 정리해줍니다. 
                          H1은 페이지의 주제, H2는 큰 섹션, H3는 세부 내용으로 사용하세요.
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="font-md mb-md" style={{ color: 'var(--color-text-secondary)' }}>
                  {category.description}
                </p>
                <div className="mb-md">
                  <h4 className="font-md mb-sm">
                    <span className="icon icon--warning">💡</span>
                    개선 방법:
                  </h4>
                  <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                    {category.suggestions.map((suggestion, index) => (
                      <li key={index} className="font-sm mb-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
            </div>
          )}
          
          {/* 경고 항목 */}
          {warningCategories.length > 0 && (
            <div>
              <h3 className="font-lg mb-md" style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span className="icon icon--warning">⚠️</span>
                보완하면 좋은 항목 ({warningCategories.length}개)
              </h3>
          {warningCategories.map(category => {
            const currentValue = getCurrentValue(category.id)
            return (
              <div key={category.id} className="metric-card">
                <div className="metric-card__header">
                  <div className="metric-card__icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                    {getStatusIcon(category.status)}
                  </div>
                  <div>
                    <h3 className="metric-card__title">
                      {category.name}
                    </h3>
                    <div className="status-indicator status-indicator--warning">
                      {category.score}점 - 보통
                    </div>
                  </div>
                </div>
                
                {/* 현재 상태 표시 */}
                {currentValue && (
                  <div className="metric-card__current">
                    <div className="metric-card__current-label">{currentValue.label}</div>
                    <div className="metric-card__current-value">
                      {currentValue.value}
                      {currentValue.length !== undefined && (
                        <span className="font-sm text-secondary ml-sm">
                          ({currentValue.length}자)
                        </span>
                      )}
                    </div>
                    {currentValue.detail && (
                      <div className="font-sm text-secondary mt-xs" style={{ fontStyle: 'italic' }}>
                        {currentValue.detail}
                      </div>
                    )}
                    
                    {/* 제목 구조 특별 표시 */}
                    {category.id === 'heading' && (currentValue as any).structure && (
                      <div style={{ 
                        marginTop: 'var(--spacing-sm)', 
                        padding: 'var(--spacing-sm)', 
                        background: 'var(--color-bg-secondary)', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div className="font-xs text-secondary mb-xs">📝 제목 구조 분석</div>
                        <div className="flex items-center gap-sm mb-xs">
                          <span className={`icon ${(currentValue as any).structure.hasH1 ? 'icon--success' : 'icon--danger'}`}>
                            {(currentValue as any).structure.hasH1 ? '✓' : '×'}
                          </span>
                          <span className="font-sm">H1 태그 (대제목) 사용</span>
                        </div>
                        <div className="flex items-center gap-sm mb-xs">
                          <span className={`icon ${(currentValue as any).structure.isLogical ? 'icon--success' : 'icon--warning'}`}>
                            {(currentValue as any).structure.isLogical ? '✓' : '!'}
                          </span>
                          <span className="font-sm">논리적 순서 (H1→H2→H3)</span>
                        </div>
                        <div className="font-xs text-secondary mt-xs" style={{ 
                          background: '#FEF3C7', 
                          padding: 'var(--spacing-xs)', 
                          borderRadius: 'var(--radius-xs)',
                          color: '#92400E'
                        }}>
                          💡 권장사항: {(currentValue as any).structure.recommendation}
                        </div>
                        <div className="font-xs text-secondary mt-xs" style={{ lineHeight: '1.4' }}>
                          제목 태그는 책의 목차처럼 내용을 체계적으로 정리해줍니다. 
                          H1은 페이지의 주제, H2는 큰 섹션, H3는 세부 내용으로 사용하세요.
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="font-md mb-md" style={{ color: 'var(--color-text-secondary)' }}>
                  {category.description}
                </p>
                <div className="mb-md">
                  <h4 className="font-md mb-sm">
                    <span className="icon icon--warning">💡</span>
                    개선 방법:
                  </h4>
                  <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                    {category.suggestions.map((suggestion, index) => (
                      <li key={index} className="font-sm mb-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
            </div>
          )}
          
          {/* 좋은 항목 */}
          {goodCategories.length > 0 && (
            <div>
              <h3 className="font-lg mb-md" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span className="icon icon--success">✅</span>
                잘 되고 있는 항목 ({goodCategories.length}개)
              </h3>
              {goodCategories.map(category => {
                const currentValue = getCurrentValue(category.id)
            return (
              <div key={category.id} className="metric-card">
                <div className="metric-card__header">
                  <div className="metric-card__icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                    {getStatusIcon(category.status)}
                  </div>
                  <div>
                    <h3 className="metric-card__title">
                      {category.name}
                    </h3>
                    <div className="status-indicator status-indicator--good">
                      {category.score}점 - 좋아요!
                    </div>
                  </div>
                </div>
                
                {/* 현재 상태 표시 */}
                {currentValue && (
                  <div className="metric-card__current">
                    <div className="metric-card__current-label">{currentValue.label}</div>
                    <div className="metric-card__current-value">
                      {currentValue.value}
                      {currentValue.length !== undefined && (
                        <span className="font-sm text-secondary ml-sm">
                          ({currentValue.length}자)
                        </span>
                      )}
                    </div>
                    {currentValue.detail && (
                      <div className="font-sm text-secondary mt-xs" style={{ fontStyle: 'italic' }}>
                        {currentValue.detail}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="font-md mb-md" style={{ color: 'var(--color-text-secondary)' }}>
                  {category.description}
                </p>
                <div className="mb-md">
                  <h4 className="font-md mb-sm">
                    <span className="icon icon--success">👍</span>
                    잘하고 있는 점:
                  </h4>
                  <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                    {category.suggestions.map((suggestion, index) => (
                      <li key={index} className="font-sm mb-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
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

      <div className="card mt-xl">
        <h3 className="font-lg mb-md">
          <span className="icon icon--success">🎉</span>
          축하해요! 분석이 완료되었습니다
        </h3>
        <p className="font-md text-secondary mb-md">
          위의 개선 방법들을 하나씩 따라해보세요. 전부 다 한 번에 할 필요는 없어요!<br />
          가장 중요한 것부터 천천히 개선해나가시면 됩니다.
        </p>
        <div className="flex-center gap-md">
          <span className="font-sm text-secondary">
            <span className="icon icon--danger">💝</span>
            이 서비스가 도움이 되셨다면 주변에 알려주세요!
          </span>
        </div>
      </div>

      {/* 피드백 모달 */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        analysisUrl={data.url}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  )
}