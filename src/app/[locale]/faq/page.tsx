'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'


export default function FAQPage() {
  const t = useTranslations('faq')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  
  const faqs = t.raw('questions')
  const categories = Object.keys(t.raw('categories'))

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* 헤더 섹션 */}
        <div className="analysis-section gradient-bg">
          <div className="page-header">
            <div className="page-header__icon">
              ❓
            </div>
            <h1 className="page-header__title">
              {t('title')}
            </h1>
            <p className="page-header__subtitle">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">🏷</span>
            {t('categoriesTitle')}
          </h2>
          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`category-filter__item ${
                  activeCategory === category
                    ? 'category-filter__item--active'
                    : 'category-filter__item--inactive'
                }`}
              >
                {t(`categories.${category}`)}
              </button>
            ))}
          </div>
          <p className="content-section__intro">
            {t('questionCount', { count: filteredFAQs.length })}
          </p>
        </div>

        {/* FAQ 리스트 */}
        <div className="analysis-section">
          <div className="faq-list">
            {filteredFAQs.map((faq, index) => (
              <div key={faq.id} className="faq-list__item">
                <div className="tech-seo-card">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="faq-list__question"
                  >
                    <div className="faq-list__question-header">
                      <div className="faq-list__question-content">
                        <div className="faq-list__number">
                          {index + 1}
                        </div>
                        <div className="faq-list__question-info">
                          <h3 className="faq-list__question-title">
                            {faq.question}
                          </h3>
                          <span className="faq-list__question-category">
                            {t(`categories.${faq.category}`)}
                          </span>
                        </div>
                      </div>
                      <div className={`faq-list__toggle ${
                        openFAQ === faq.id ? 'faq-list__toggle--open' : ''
                      }`}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="faq-list__answer">
                      <p>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추가 도움말 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">🎯</span>
            {t('additionalHelp.title')}
          </h2>
          <div className="page-grid page-grid--2-col">
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">📚</div>
                <h3 className="site-info-card__title">{t('additionalHelp.seoGuide.title')}</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  {t('additionalHelp.seoGuide.description')}
                </p>
                <a href="/seo-guide" className="btn btn-outline">
                  {t('additionalHelp.seoGuide.button')}
                </a>
              </div>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--success">🔍</div>
                <h3 className="site-info-card__title">{t('additionalHelp.analysis.title')}</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  {t('additionalHelp.analysis.description')}
                </p>
                <a href="/" className="btn btn-outline">
                  {t('additionalHelp.analysis.button')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 문의하기 섹션 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              {t('ctaTitle')}
            </h2>
            <p className="cta-section__description">
              {t('ctaDescription')}
            </p>
            <div className="action-buttons">
              <a 
                href="/" 
                className="btn btn-primary"
              >
                <span className="icon">🔍</span>
                {t('ctaAnalyze')}
              </a>
              <a 
                href="/about" 
                className="btn btn-outline"
              >
                <span className="icon">ℹ️</span>
                {t('ctaAbout')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}