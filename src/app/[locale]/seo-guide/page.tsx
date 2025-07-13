'use client'

import { useTranslations } from 'next-intl'

export default function SEOGuidePage() {
  const t = useTranslations('seoGuide')
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* 헤더 섹션 */}
        <div className="analysis-section gradient-bg">
          <div className="page-header">
            <div className="page-header__icon">
              📚
            </div>
            <h1 className="page-header__title">
              {t('title')}
            </h1>
            <p className="page-header__subtitle">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* 목차 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">📋</span>
            {t('tableOfContents')}
          </h2>
          <div className="page-grid page-grid--2-col">
            <a href={`#${t('sections.whatIsSeo.anchor')}`} className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">🤔</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('sections.whatIsSeo.title')}</h3>
                  <p className="seo-card__description">{t('sections.whatIsSeo.description')}</p>
                </div>
              </div>
            </a>
            <a href={`#${t('sections.whySeo.anchor')}`} className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">💡</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('sections.whySeo.title')}</h3>
                  <p className="seo-card__description">{t('sections.whySeo.description')}</p>
                </div>
              </div>
            </a>
            <a href={`#${t('sections.basicElements.anchor')}`} className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">🔧</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('sections.basicElements.title')}</h3>
                  <p className="seo-card__description">{t('sections.basicElements.description')}</p>
                </div>
              </div>
            </a>
            <a href={`#${t('sections.practicalTips.anchor')}`} className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">⚡</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('sections.practicalTips.title')}</h3>
                  <p className="seo-card__description">{t('sections.practicalTips.description')}</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* SEO가 뭐예요? */}
        <div id={t('sections.whatIsSeo.anchor')} className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">🤔</span>
            {t('sections.whatIsSeo.subtitle')}
          </h2>
          <div className="content-section">
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">🔍 {t('sections.whatIsSeo.explanation')}</h3>
              <p className="content-section__intro">
                {t.rich('sections.whatIsSeo.intro', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
              <div className="content-section__highlight content-section__highlight--info">
                <h4 className="example-box__title example-box__title--info">🌟 {t('sections.whatIsSeo.exampleTitle')}</h4>
                <p className="example-box__content">
                  {t('sections.whatIsSeo.exampleContent')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 왜 SEO가 필요한가요? */}
        <div id={t('sections.whySeo.anchor')} className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--warning">💡</span>
            {t('sections.whySeo.subtitle')}
          </h2>
          <div className="page-grid page-grid--3-col">
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--success">👥</div>
                <h3 className="site-info-card__title">{t('sections.whySeo.benefits.moreCustomers.title')}</h3>
              </div>
              <p className="site-info-card__description">
                {t('sections.whySeo.benefits.moreCustomers.description')}
              </p>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--warning">💰</div>
                <h3 className="site-info-card__title">{t('sections.whySeo.benefits.freeMarketing.title')}</h3>
              </div>
              <p className="site-info-card__description">
                {t('sections.whySeo.benefits.freeMarketing.description')}
              </p>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">🎯</div>
                <h3 className="site-info-card__title">{t('sections.whySeo.benefits.targetedCustomers.title')}</h3>
              </div>
              <p className="site-info-card__description">
                {t('sections.whySeo.benefits.targetedCustomers.description')}
              </p>
            </div>
          </div>
        </div>

        {/* 기본 요소들 */}
        <div id={t('sections.basicElements.anchor')} className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">🔧</span>
            {t('sections.basicElements.subtitle')}
          </h2>
          <div className="content-section">
            {/* 제목 */}
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--success">📝</span>
                {t('sections.basicElements.pageTitle.title')}
              </h3>
              <div className="content-section">
                <p className="content-section__intro">
                  {t('sections.basicElements.pageTitle.description')}
                </p>
                <div className="content-section__highlight content-section__highlight--success">
                  <h4 className="example-box__title example-box__title--good">✅ {t('sections.basicElements.pageTitle.goodExample')}</h4>
                  <p className="example-box__content">{t('sections.basicElements.pageTitle.goodExampleContent')}</p>
                </div>
                <div className="content-section__highlight content-section__highlight--danger">
                  <h4 className="example-box__title example-box__title--bad">❌ {t('sections.basicElements.pageTitle.badExample')}</h4>
                  <p className="example-box__content">{t('sections.basicElements.pageTitle.badExampleContent')}</p>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--info">📖</span>
                {t('sections.basicElements.metaDescription.title')}
              </h3>
              <div className="content-section">
                <p className="content-section__intro">
                  {t('sections.basicElements.metaDescription.description')}
                </p>
                <div className="content-section__highlight content-section__highlight--info">
                  <h4 className="example-box__title example-box__title--info">💡 {t('sections.basicElements.metaDescription.tips')}</h4>
                  <ul className="feature-list">
                    <li className="feature-list__item">{t('sections.basicElements.metaDescription.tip1')}</li>
                    <li className="feature-list__item">{t('sections.basicElements.metaDescription.tip2')}</li>
                    <li className="feature-list__item">{t('sections.basicElements.metaDescription.tip3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 이미지 */}
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--warning">🖼</span>
                {t('sections.basicElements.imageOptimization.title')}
              </h3>
              <div className="content-section">
                <p className="content-section__intro">
                  {t('sections.basicElements.imageOptimization.description')}
                </p>
                <div className="content-section__highlight content-section__highlight--warning">
                  <h4 className="example-box__title example-box__title--info">📸 {t('sections.basicElements.imageOptimization.checklistTitle')}</h4>
                  <ul className="feature-list">
                    <li className="feature-list__item">{t('sections.basicElements.imageOptimization.checklist1')}</li>
                    <li className="feature-list__item">{t('sections.basicElements.imageOptimization.checklist2')}</li>
                    <li className="feature-list__item">{t('sections.basicElements.imageOptimization.checklist3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 실전 팁 */}
        <div id={t('sections.practicalTips.anchor')} className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--warning">⚡</span>
            {t('sections.practicalTips.subtitle')}
          </h2>
          <div className="page-grid page-grid--2-col">
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">🏢 {t('sections.practicalTips.localBusiness.title')}</h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('sections.practicalTips.localBusiness.item1')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.localBusiness.item2')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.localBusiness.item3')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.localBusiness.item4')}</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">📱 {t('sections.practicalTips.mobileOptimization.title')}</h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('sections.practicalTips.mobileOptimization.item1')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.mobileOptimization.item2')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.mobileOptimization.item3')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.mobileOptimization.item4')}</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">✍️ {t('sections.practicalTips.contentWriting.title')}</h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('sections.practicalTips.contentWriting.item1')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.contentWriting.item2')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.contentWriting.item3')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.contentWriting.item4')}</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">🔗 {t('sections.practicalTips.linkManagement.title')}</h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('sections.practicalTips.linkManagement.item1')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.linkManagement.item2')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.linkManagement.item3')}</li>
                <li className="feature-list__item">{t('sections.practicalTips.linkManagement.item4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 마무리 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              🎯 {t('conclusion.title')}
            </h2>
            <p className="cta-section__description">
              {t('conclusion.description')}
            </p>
            <div className="action-buttons">
              <a 
                href="/" 
                className="btn btn-primary"
              >
                <span className="icon">🔍</span>
                {t('conclusion.analyzeButton')}
              </a>
              <a 
                href="/faq" 
                className="btn btn-outline"
              >
                <span className="icon">❓</span>
                {t('conclusion.faqButton')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}