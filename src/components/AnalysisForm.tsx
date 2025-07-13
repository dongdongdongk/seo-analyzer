'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface AnalysisFormProps {
  onAnalysisStart: (url: string) => void
}

export default function AnalysisForm({ onAnalysisStart }: AnalysisFormProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('home')

  const exampleUrls = [
    'https://jsonformatter.roono.net/en',
    'https://base64tool.roono.net/en',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      alert(t('enterUrl'))
      return
    }

    // 간단한 URL 유효성 검사
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(url)) {
      alert(t('validUrl'))
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
          {t('title')}
        </h1>
        <p className="analysis-form__subtitle" dangerouslySetInnerHTML={{
          __html: t('subtitle')
        }} />
      </header>

      <form onSubmit={handleSubmit} role="form" aria-label="SEO 분석 요청 폼">
        <div className="analysis-form__input-group">
          <div className="analysis-form__input">
            <label htmlFor="website-url">
              
            </label>
            <input
              id="website-url"
              type="url"
              placeholder={t('urlPlaceholder')}
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
                {t('analyzing')}
              </>
            ) : (
              <>
                {t('analyzeButton')}
              </>
            )}
          </button>
        </div>
      </form>

      <section className="analysis-form__examples" aria-labelledby="examples-title">
        <h2 id="examples-title" className="analysis-form__examples-title">
          {t('exampleTitle')}
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
        <h2 id="features-title" className="font-lg mb-md">{t('featuresTitle')}</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--spacing-md)' 
        }}>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">{t('features.title.title')}</h3>
            <p className="font-sm text-secondary">{t('features.title.description')}</p>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">{t('features.speed.title')}</h3>
            <p className="font-sm text-secondary">{t('features.speed.description')}</p>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">{t('features.mobile.title')}</h3>
            <p className="font-sm text-secondary">{t('features.mobile.description')}</p>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
            <h3 className="font-md mb-sm">{t('features.images.title')}</h3>
            <p className="font-sm text-secondary">{t('features.images.description')}</p>
          </div>
        </div>
      </section>

      {/* 추가 정보 섹션 */}
      <section className="card mt-xl" aria-labelledby="more-info-title">
        <h2 id="more-info-title" className="font-lg mb-md">{t('moreInfoTitle')}</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-md)' 
        }}>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 className="font-md mb-sm">{t('moreInfo.guide.title')}</h3>
            <p className="font-sm text-secondary mb-md">{t('moreInfo.guide.description')}</p>
            <a href="/seo-guide" className="btn btn-outline">{t('moreInfo.guide.button')}</a>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 className="font-md mb-sm">{t('moreInfo.faq.title')}</h3>
            <p className="font-sm text-secondary mb-md">{t('moreInfo.faq.description')}</p>
            <a href="/faq" className="btn btn-outline">{t('moreInfo.faq.button')}</a>
          </div>
          <div className="p-md" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 className="font-md mb-sm">{t('moreInfo.about.title')}</h3>
            <p className="font-sm text-secondary mb-md">{t('moreInfo.about.description')}</p>
            <a href="/about" className="btn btn-outline">{t('moreInfo.about.button')}</a>
          </div>
        </div>
      </section>
    </main>
  )
}