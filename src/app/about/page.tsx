import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스 소개 - 초보자 맞춤 무료 검색엔진 최적화 분석기',
  description: '누구나 쉽게 사용할 수 있는 AI 기반 SEO 분석 서비스. 복잡한 SEO 용어 없이 간단하고 명확한 개선 방안을 제공합니다. 개인 블로거부터 소상공인까지 모두를 위한 무료 SEO 도구.',
  keywords: [
    'SEO 분석 서비스', 'AI SEO', '초보자 SEO', '웹사이트 분석', '검색엔진 최적화',
    '무료 SEO 도구', 'SEO 진단', '개인 블로거', '소상공인', '프리랜서',
    'SEO 컨설팅', 'SEO 가이드', 'SEO 전문가', 'SEO 솔루션'
  ],
  openGraph: {
    title: '서비스 소개 - 초보자 맞춤 무료 검색엔진 최적화 분석기',
    description: '누구나 쉽게 사용할 수 있는 AI 기반 SEO 분석 서비스. 복잡한 SEO 용어 없이 간단하고 명확한 개선 방안을 제공합니다.',
    url: 'https://seo-analyzer.com/about',
    type: 'website',
  },
  twitter: {
    title: '서비스 소개 - 초보자 맞춤 무료 검색엔진 최적화 분석기',
    description: '누구나 쉽게 사용할 수 있는 AI 기반 SEO 분석 서비스. 복잡한 SEO 용어 없이 간단하고 명확한 개선 방안을 제공합니다.',
  },
  alternates: {
    canonical: 'https://seo-analyzer.com/about',
  },
}

export default function AboutPage() {
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
              서비스 소개
            </h1>
            <p className="page-header__subtitle">
              초보자도 쉽게 이해할 수 있는 AI SEO 분석 서비스
            </p>
          </div>
        </div>

        {/* 미션 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              🌟 우리의 목표
            </h2>
            <p className="cta-section__description">
              SEO가 어려워서 포기했던 모든 분들을 위해, 
              <strong> 전문 용어 없이도 쉽게 이해할 수 있는 SEO 분석 서비스</strong>를 만들었습니다.
            </p>
          </div>
        </div>

        {/* 서비스 특징 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">✨</span>
            서비스 특징
          </h2>
          <div className="page-grid page-grid--3-col">
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--success">🤖</div>
                <h3 className="site-info-card__title">AI 기반 분석</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  최신 AI 기술을 활용하여 여러분의 웹사이트를 정확하게 분석하고, 
                  업종별 맞춤형 조언을 제공합니다.
                </p>
              </div>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">🎯</div>
                <h3 className="site-info-card__title">초보자 친화적</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  복잡한 SEO 전문 용어를 쉬운 말로 바꿔서 설명하고, 
                  누구나 따라할 수 있는 단계별 가이드를 제공합니다.
                </p>
              </div>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--warning">⚡</div>
                <h3 className="site-info-card__title">빠른 분석</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  3분 이내에 종합적인 SEO 분석 결과를 제공합니다. 
                  기다리는 시간도 유익한 SEO 팁으로 채워드려요!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 누구를 위한 서비스인가요? */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">👥</span>
            누구를 위한 서비스인가요?
          </h2>
          <div className="page-grid page-grid--2-col">
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--success">📝</span>
                개인 블로거
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">네이버 블로그, 티스토리 운영자</li>
                <li className="feature-list__item">워드프레스 블로그 운영자</li>
                <li className="feature-list__item">취미로 블로그를 시작한 분</li>
                <li className="feature-list__item">블로그 방문자를 늘리고 싶은 분</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--warning">🏪</span>
                소상공인
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">카페, 식당 운영자</li>
                <li className="feature-list__item">미용실, 병원 운영자</li>
                <li className="feature-list__item">작은 온라인 쇼핑몰 운영자</li>
                <li className="feature-list__item">지역 기반 비즈니스 운영자</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--info">💼</span>
                프리랜서
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">포트폴리오 사이트 운영자</li>
                <li className="feature-list__item">개인 브랜딩이 필요한 분</li>
                <li className="feature-list__item">온라인 강의 운영자</li>
                <li className="feature-list__item">컨설팅 사업을 하는 분</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--secondary">🌱</span>
                마케팅 초보자
              </h3>
              <ul className="feature-list">
                <li className="feature-list__item">신입 마케터</li>
                <li className="feature-list__item">SEO를 배우고 싶은 분</li>
                <li className="feature-list__item">디지털 마케팅 입문자</li>
                <li className="feature-list__item">회사 홈페이지 담당자</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 분석 과정 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--primary">🔍</span>
            분석 과정
          </h2>
          <div className="content-section">
            <div className="step-list">
              <div className="step-list__item">
                <div className="step-list__number">1</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">URL 입력</h3>
                  <p className="step-list__description">분석하고 싶은 웹사이트 주소를 입력하기만 하면 됩니다.</p>
                </div>
              </div>
              <div className="step-list__item">
                <div className="step-list__number">2</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">AI 분석</h3>
                  <p className="step-list__description">AI가 사이트의 SEO 상태를 종합적으로 분석합니다.</p>
                </div>
              </div>
              <div className="step-list__item">
                <div className="step-list__number">3</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">결과 제공</h3>
                  <p className="step-list__description">이해하기 쉬운 언어로 개선 방안을 제시합니다.</p>
                </div>
              </div>
              <div className="step-list__item">
                <div className="step-list__number">4</div>
                <div className="step-list__content">
                  <h3 className="step-list__title">개선 적용</h3>
                  <p className="step-list__description">단계별 가이드를 따라 차근차근 개선해보세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 분석 항목 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">📊</span>
            분석 항목
          </h2>
          <div className="page-grid page-grid--3-col">
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">📝</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">제목 최적화</h3>
                  <p className="seo-card__description">페이지 제목의 적절성 검사</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">📖</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">설명 최적화</h3>
                  <p className="seo-card__description">메타 설명 품질 평가</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">🖼</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">이미지 최적화</h3>
                  <p className="seo-card__description">이미지 SEO 상태 확인</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">⚡</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">사이트 속도</h3>
                  <p className="seo-card__description">로딩 속도 성능 측정</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">📱</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">모바일 친화성</h3>
                  <p className="seo-card__description">모바일 최적화 정도</p>
                </div>
              </div>
            </div>
            <div className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">🔗</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">링크 구조</h3>
                  <p className="seo-card__description">내부/외부 링크 분석</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 개발진 소개 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">👨‍💻</span>
            개발진 소개
          </h2>
          <div className="tech-seo-card">
            <div className="cta-section">
              <div className="page-header__icon">
                🚀
              </div>
              <h3 className="cta-section__title">SEO 초보자를 위한 서비스</h3>
              <p className="cta-section__description">
                복잡한 SEO 용어와 기술적 지식 때문에 포기했던 경험이 있으신가요? 
                저희도 같은 어려움을 겪었습니다.
              </p>
              <p className="cta-section__description">
                그래서 만들었습니다. <strong>누구나 쉽게 이해할 수 있는 SEO 분석 서비스</strong>를요.
              </p>
              <p className="cta-section__description">
                여러분의 성공적인 온라인 비즈니스를 위해 계속 발전해 나가겠습니다.
              </p>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              🎯 지금 바로 시작해보세요!
            </h2>
            <p className="cta-section__description">
              URL 하나만 입력하면 3분 안에 맞춤형 SEO 분석 결과를 받아보실 수 있습니다.
            </p>
            <div className="action-buttons">
              <a 
                href="/" 
                className="btn btn-primary"
              >
                <span className="icon">🔍</span>
                분석 시작하기
              </a>
              <a 
                href="/seo-guide" 
                className="btn btn-outline"
              >
                <span className="icon">📚</span>
                SEO 가이드 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}