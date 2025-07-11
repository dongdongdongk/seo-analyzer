'use client'

import { useState } from 'react'

interface AnalysisFormProps {
  onAnalysisStart: (url: string) => void
}

export default function AnalysisForm({ onAnalysisStart }: AnalysisFormProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const exampleUrls = [
    'https://jsonformatter.roono.net/en',
    'https://base64tool.roono.net/en',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      alert('웹사이트 주소를 입력해주세요!')
      return
    }

    // 간단한 URL 유효성 검사
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(url)) {
      alert('올바른 웹사이트 주소를 입력해주세요! (예: https://example.com)')
      return
    }

    setIsLoading(true)
    onAnalysisStart(url)
  }

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl)
  }

  return (
    <main className="analysis-form" role="main">
      <header className="analysis-form__header">
        <h1 className="analysis-form__title">
          <img src="/icon.png" alt="SEO 분석 아이콘" className="title-icon" />
          내 웹사이트 검색엔진 최적화 점수는?
        </h1>
        <p className="analysis-form__subtitle">
          웹사이트 주소만 입력하면 3분 만에 SEO 상태를 쉽게 확인할 수 있어요!<br />
          전문 용어 없이 누구나 이해할 수 있게 설명해드릴게요.
        </p>
      </header>

      <form onSubmit={handleSubmit} role="form" aria-label="SEO 분석 요청 폼">
        <div className="analysis-form__input-group">
          <div className="analysis-form__input">
            <label htmlFor="website-url">
              
            </label>
            <input
              id="website-url"
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="input input-lg"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-xl analysis-form__submit"
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                분석 중...
              </>
            ) : (
              <>
                📊 무료 분석 시작
              </>
            )}
          </button>
        </div>
      </form>

      <section className="analysis-form__examples" aria-labelledby="examples-title">
        <h2 id="examples-title" className="analysis-form__examples-title">
          💡 예시 주소로 체험해보기:
        </h2>
        <div className="analysis-form__examples-list" role="group" aria-label="예시 웹사이트 목록">
          {exampleUrls.map((exampleUrl, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(exampleUrl)}
              disabled={isLoading}
              aria-label={`예시 웹사이트 ${exampleUrl} 선택`}
            >
              {exampleUrl}
            </button>
          ))}
        </div>
      </section>

      <section className="card mt-xl" aria-labelledby="features-title">
        <h2 id="features-title" className="font-lg mb-md">🎯 이런 것들을 확인해드려요</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--spacing-md)' 
        }}>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">📝 페이지 제목과 설명</h3>
            <p className="font-sm text-secondary">검색 결과에 나타나는 제목과 설명이 적절한지 확인해요</p>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">⚡ 사이트 속도</h3>
            <p className="font-sm text-secondary">고객이 기다리지 않고 빠르게 볼 수 있는지 측정해요</p>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">📱 모바일 친화도</h3>
            <p className="font-sm text-secondary">핸드폰에서 편리하게 볼 수 있는지 확인해요</p>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">🖼️ 이미지 최적화</h3>
            <p className="font-sm text-secondary">사진들이 검색에 잘 나타나는지 체크해요</p>
          </div>
        </div>
      </section>

      {/* 추가 정보 섹션 */}
      <section className="card mt-xl" aria-labelledby="more-info-title">
        <h2 id="more-info-title" className="font-lg mb-md">📚 더 알아보기</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-md)' 
        }}>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 className="font-md mb-sm">📖 SEO 기초 가이드</h3>
            <p className="font-sm text-secondary mb-md">SEO가 처음이신가요? 기초부터 차근차근 배워보세요!</p>
            <a href="/seo-guide" className="btn btn-outline">가이드 보기</a>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 className="font-md mb-sm">❓ 자주 묻는 질문</h3>
            <p className="font-sm text-secondary mb-md">궁금한 점이 있으시다면 FAQ를 확인해보세요!</p>
            <a href="/faq" className="btn btn-outline">FAQ 보기</a>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 className="font-md mb-sm">🎯 서비스 소개</h3>
            <p className="font-sm text-secondary mb-md">이 서비스가 어떻게 만들어졌는지 알아보세요!</p>
            <a href="/about" className="btn btn-outline">소개 보기</a>
          </div>
        </div>
      </section>
    </main>
  )
}