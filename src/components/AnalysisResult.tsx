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
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'danger': return '❌'
      default: return '❓'
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

      {/* AI 맞춤 조언 섹션 */}
      {data.aiAdvice && (
        <div className="card mb-xl">
          <h2 className="font-xl mb-md">🤖 AI 맞춤 조언</h2>
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">📋 전체적인 평가</h3>
            <div className="p-md" style={{ backgroundColor: 'var(--color-gray-100)', borderRadius: 'var(--radius-md)' }}>
              <p className="font-md">{data.aiAdvice.overallAdvice}</p>
            </div>
          </div>
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">🎯 우선순위 개선 작업</h3>
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
              <h3 className="font-lg mb-sm">💡 {data.businessType} 특화 팁</h3>
              <div className="flex flex-col gap-sm">
                {data.aiAdvice.industrySpecificTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-sm p-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-sm">💡</span>
                    <span className="font-md">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-lg">
            <h3 className="font-lg mb-sm">🎉 예상 결과</h3>
            <div className="p-md" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-white)', borderRadius: 'var(--radius-md)' }}>
              <p className="font-md">{data.aiAdvice.expectedResults}</p>
            </div>
          </div>
        </div>
      )}

      {/* 키워드 제안 섹션 */}
      {data.keywordSuggestions && data.keywordSuggestions.length > 0 && (
        <div className="card mb-xl">
          <h2 className="font-xl mb-md">🔍 추천 키워드</h2>
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

      <div className="mb-xl">
        <h2 className="font-xl mb-md">🎯 상세 분석 결과 (카테고리별)</h2>
        <div className="analysis-result__categories">
          {/* 위험 항목 먼저 */}
          {dangerCategories.map(category => (
            <div key={category.id} className="analysis-result__category">
              <div className="analysis-result__category-header">
                <div className={`analysis-result__category-icon ${category.status}`}>
                  {getStatusIcon(category.status)}
                </div>
                <div>
                  <h3 className="analysis-result__category-title">
                    {category.name}
                  </h3>
                  <p className={`analysis-result__category-status ${category.status}`}>
                    {category.score}점 - 개선 필요
                  </p>
                </div>
              </div>
              <p className="analysis-result__category-description">
                {category.description}
              </p>
              <div className="mb-md">
                <h4 className="font-md mb-sm">💡 개선 방법:</h4>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {category.suggestions.map((suggestion, index) => (
                    <li key={index} className="font-sm mb-xs">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="analysis-result__category-actions">
                <button className="primary">
                  자세히 보기
                </button>
                <button>
                  나중에 하기
                </button>
              </div>
            </div>
          ))}
          
          {/* 경고 항목 */}
          {warningCategories.map(category => (
            <div key={category.id} className="analysis-result__category">
              <div className="analysis-result__category-header">
                <div className={`analysis-result__category-icon ${category.status}`}>
                  {getStatusIcon(category.status)}
                </div>
                <div>
                  <h3 className="analysis-result__category-title">
                    {category.name}
                  </h3>
                  <p className={`analysis-result__category-status ${category.status}`}>
                    {category.score}점 - 보통
                  </p>
                </div>
              </div>
              <p className="analysis-result__category-description">
                {category.description}
              </p>
              <div className="mb-md">
                <h4 className="font-md mb-sm">💡 개선 방법:</h4>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {category.suggestions.map((suggestion, index) => (
                    <li key={index} className="font-sm mb-xs">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="analysis-result__category-actions">
                <button className="primary">
                  자세히 보기
                </button>
                <button>
                  나중에 하기
                </button>
              </div>
            </div>
          ))}
          
          {/* 좋은 항목 */}
          {goodCategories.map(category => (
            <div key={category.id} className="analysis-result__category">
              <div className="analysis-result__category-header">
                <div className={`analysis-result__category-icon ${category.status}`}>
                  {getStatusIcon(category.status)}
                </div>
                <div>
                  <h3 className="analysis-result__category-title">
                    {category.name}
                  </h3>
                  <p className={`analysis-result__category-status ${category.status}`}>
                    {category.score}점 - 좋아요!
                  </p>
                </div>
              </div>
              <p className="analysis-result__category-description">
                {category.description}
              </p>
              <div className="mb-md">
                <h4 className="font-md mb-sm">👍 잘하고 있는 점:</h4>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  {category.suggestions.map((suggestion, index) => (
                    <li key={index} className="font-sm mb-xs">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="analysis-result__category-actions">
                <button>
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onNewAnalysis}
          className="btn btn-primary btn-lg"
          style={{ marginRight: 'var(--spacing-md)' }}
        >
          🔍 다른 사이트 분석하기
        </button>
        <button 
          onClick={() => setShowFeedback(true)}
          className="btn btn-outline btn-lg"
          style={{ marginRight: 'var(--spacing-md)' }}
        >
          📝 서비스 평가하기
        </button>
        <button className="btn btn-outline btn-lg">
          📄 결과 저장하기
        </button>
      </div>

      <div className="card mt-xl">
        <h3 className="font-lg mb-md">🎉 축하해요! 분석이 완료되었습니다</h3>
        <p className="font-md text-secondary mb-md">
          위의 개선 방법들을 하나씩 따라해보세요. 전부 다 한 번에 할 필요는 없어요!<br />
          가장 중요한 것부터 천천히 개선해나가시면 됩니다.
        </p>
        <div className="flex-center gap-md">
          <span className="font-sm text-secondary">
            💝 이 서비스가 도움이 되셨다면 주변에 알려주세요!
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