'use client'


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
  }
  onNewAnalysis: () => void
}

export default function AnalysisResult({ data, onNewAnalysis }: AnalysisResultProps) {

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

      <div className="mb-xl">
        <h2 className="font-xl mb-md">🎯 우선 개선할 항목 (중요도 순)</h2>
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
    </div>
  )
}