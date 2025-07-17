import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  
  const canonicalUrl = `/${locale}/about`
  
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ko': '/ko/about',
        'en': '/en/about',
        'x-default': '/ko/about',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `https://seoanalyzer.roono.net${canonicalUrl}`,
      type: 'website',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
    twitter: {
      title: t('title'),
      description: t('subtitle'),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* 헤더 섹션 */}
        <div className="analysis-section gradient-bg">
          <div className="page-header">
            <div className="page-header__icon">
              🎯
            </div>
            <h1 className="page-header__title">
              {t('title')}
            </h1>
            <p className="page-header__subtitle">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* 미션 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              {t('mission.title')}
            </h2>
            <p className="cta-section__description">
              {t.rich('mission.description', {
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
          </div>
        </div>

        {/* 서비스 특징 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">✨</span>
            {t('features.title')}
          </h2>
          <div className="page-grid page-grid--3-col">
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--success">🤖</div>
                <h3 className="site-info-card__title">{t('features.aiAnalysis.title')}</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  {t('features.aiAnalysis.description')}
                </p>
              </div>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">🎯</div>
                <h3 className="site-info-card__title">{t('features.beginnerFriendly.title')}</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  {t('features.beginnerFriendly.description')}
                </p>
              </div>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--warning">⚡</div>
                <h3 className="site-info-card__title">{t('features.fastAnalysis.title')}</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  {t('features.fastAnalysis.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 누구를 위한 서비스인가요? */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">👥</span>
            {t('targetUsers.title')}
          </h2>
          <div className="page-grid page-grid--2-col">
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--success">📝</span>
                {t('targetUsers.personalBloggers.title')}
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('targetUsers.personalBloggers.item1')}</li>
                <li className="feature-list__item">{t('targetUsers.personalBloggers.item2')}</li>
                <li className="feature-list__item">{t('targetUsers.personalBloggers.item3')}</li>
                <li className="feature-list__item">{t('targetUsers.personalBloggers.item4')}</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--warning">🏪</span>
                {t('targetUsers.smallBusiness.title')}
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('targetUsers.smallBusiness.item1')}</li>
                <li className="feature-list__item">{t('targetUsers.smallBusiness.item2')}</li>
                <li className="feature-list__item">{t('targetUsers.smallBusiness.item3')}</li>
                <li className="feature-list__item">{t('targetUsers.smallBusiness.item4')}</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--info">💼</span>
                {t('targetUsers.freelancers.title')}
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('targetUsers.freelancers.item1')}</li>
                <li className="feature-list__item">{t('targetUsers.freelancers.item2')}</li>
                <li className="feature-list__item">{t('targetUsers.freelancers.item3')}</li>
                <li className="feature-list__item">{t('targetUsers.freelancers.item4')}</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--secondary">🌱</span>
                {t('targetUsers.marketingBeginners.title')}
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">{t('targetUsers.marketingBeginners.item1')}</li>
                <li className="feature-list__item">{t('targetUsers.marketingBeginners.item2')}</li>
                <li className="feature-list__item">{t('targetUsers.marketingBeginners.item3')}</li>
                <li className="feature-list__item">{t('targetUsers.marketingBeginners.item4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 분석 과정 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--primary">🔍</span>
            {t('process.title')}
          </h2>
          <div className="content-section">
            <div className="step-list">
              <div className="step-list__item">
                <div className="step-list__number">1</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">{t('process.steps.0.title')}</h3>
                  <p className="step-list__description">{t('process.steps.0.description')}</p>
                </div>
              </div>
              <div className="step-list__item">
                <div className="step-list__number">2</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">{t('process.steps.1.title')}</h3>
                  <p className="step-list__description">{t('process.steps.1.description')}</p>
                </div>
              </div>
              <div className="step-list__item">
                <div className="step-list__number">3</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">{t('process.steps.2.title')}</h3>
                  <p className="step-list__description">{t('process.steps.2.description')}</p>
                </div>
              </div>
              <div className="step-list__item">
                <div className="step-list__number">4</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">{t('process.steps.3.title')}</h3>
                  <p className="step-list__description">{t('process.steps.3.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 분석 항목 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">📊</span>
            {t('analysisItems.title')}
          </h2>
          <div className="page-grid page-grid--3-col">
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">📝</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('analysisItems.titleOptimization.title')}</h3>
                  <p className="seo-card__description">{t('analysisItems.titleOptimization.description')}</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">📖</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('analysisItems.descriptionOptimization.title')}</h3>
                  <p className="seo-card__description">{t('analysisItems.descriptionOptimization.description')}</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">🖼</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('analysisItems.imageOptimization.title')}</h3>
                  <p className="seo-card__description">{t('analysisItems.imageOptimization.description')}</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">⚡</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('analysisItems.siteSpeed.title')}</h3>
                  <p className="seo-card__description">{t('analysisItems.siteSpeed.description')}</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">📱</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('analysisItems.mobileFriendly.title')}</h3>
                  <p className="seo-card__description">{t('analysisItems.mobileFriendly.description')}</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">🔗</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">{t('analysisItems.linkStructure.title')}</h3>
                  <p className="seo-card__description">{t('analysisItems.linkStructure.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 개발진 소개 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">👨‍💻</span>
            {t('team.title')}
          </h2>
          <div className="tech-seo-card">
            <div className="cta-section">
              <div className="page-header__icon">
                🚀
              </div>
              <h3 className="cta-section__title">{t('team.missionTitle')}</h3>
              <p className="cta-section__description">
                {t('team.missionDescription1')}
              </p>
              <p className="cta-section__description">
                {t.rich('team.missionDescription2', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
              <p className="cta-section__description">
                {t('team.missionDescription3')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              {t('cta.title')}
            </h2>
            <p className="cta-section__description">
              {t('cta.description')}
            </p>
            <div className="action-buttons">
              <Link 
                href={`/${locale}`}
                className="btn btn-primary"
              >
                <span className="icon">🔍</span>
                {t('cta.startAnalysis')}
              </Link>
              <Link 
                href={`/${locale}/seo-guide`}
                className="btn btn-outline"
              >
                <span className="icon">📚</span>
                {t('cta.viewGuide')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}