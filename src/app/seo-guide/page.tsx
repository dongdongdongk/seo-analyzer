import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEO 기초 가이드 - 초보자를 위한 검색엔진 최적화 완벽 가이드',
  description: '초보자도 쉽게 따라할 수 있는 SEO 기초 가이드. 검색엔진 최적화의 기본 원리부터 실전 팁까지 모든 것을 알려드립니다. 키워드 분석, 콘텐츠 최적화, 기술적 SEO 완벽 정리.',
  keywords: [
    'SEO 가이드', 'SEO 기초', '검색엔진 최적화', 'SEO 초보자', 'SEO 학습',
    '키워드 분석', '콘텐츠 최적화', '기술적 SEO', '온페이지 SEO', '오프페이지 SEO',
    'SEO 체크리스트', 'SEO 전략', '지역 SEO', '모바일 SEO', 'SEO 팁'
  ],
  openGraph: {
    title: 'SEO 기초 가이드 - 초보자를 위한 검색엔진 최적화 완벽 가이드',
    description: '초보자도 쉽게 따라할 수 있는 SEO 기초 가이드. 검색엔진 최적화의 기본 원리부터 실전 팁까지 모든 것을 알려드립니다.',
    url: 'https://seo-analyzer.com/seo-guide',
    type: 'article',
  },
  twitter: {
    title: 'SEO 기초 가이드 - 초보자를 위한 검색엔진 최적화 완벽 가이드',
    description: '초보자도 쉽게 따라할 수 있는 SEO 기초 가이드. 검색엔진 최적화의 기본 원리부터 실전 팁까지 모든 것을 알려드립니다.',
  },
  alternates: {
    canonical: 'https://seo-analyzer.com/seo-guide',
  },
}

export default function SEOGuidePage() {
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
              SEO 기초 가이드
            </h1>
            <p className="page-header__subtitle">
              초보자도 쉽게 따라할 수 있는 검색 엔진 최적화 완전 가이드
            </p>
          </div>
        </div>

        {/* 목차 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">📋</span>
            목차
          </h2>
          <div className="page-grid page-grid--2-col">
            <a href="#what-is-seo" className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">🤔</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">SEO가 뭐예요?</h3>
                  <p className="seo-card__description">기본 개념 이해하기</p>
                </div>
              </div>
            </a>
            <a href="#why-seo" className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">💡</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">왜 SEO가 필요한가요?</h3>
                  <p className="seo-card__description">SEO의 중요성과 효과</p>
                </div>
              </div>
            </a>
            <a href="#basic-elements" className="seo-card seo-card--good">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--good">🔧</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">기본 요소들</h3>
                  <p className="seo-card__description">제목, 설명, 이미지 등</p>
                </div>
              </div>
            </a>
            <a href="#practical-tips" className="seo-card seo-card--warning">
              <div className="seo-card__header">
                <div className="seo-card__icon seo-card__icon--warning">⚡</div>
                <div className="seo-card__info">
                  <h3 className="seo-card__title">실전 팁</h3>
                  <p className="seo-card__description">바로 적용할 수 있는 방법</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* SEO가 뭐예요? */}
        <div id="what-is-seo" className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">🤔</span>
            SEO가 뭐예요?
          </h2>
          <div className="content-section">
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">🔍 쉽게 설명하면...</h3>
              <p className="content-section__intro">
                SEO는 <strong>"검색 엔진 최적화"</strong>의 줄임말이에요. 
                쉽게 말하면 <strong>구글에서 검색했을 때 우리 사이트가 더 위에 나오도록 하는 것</strong>입니다.
              </p>
              <div className="content-section__highlight content-section__highlight--info">
                <h4 className="example-box__title example-box__title--info">🌟 예시로 이해하기</h4>
                <p className="example-box__content">
                  카페를 운영한다면 "강남 카페", "맛있는 커피" 같은 단어로 검색했을 때 
                  내 카페가 검색 결과 1페이지에 나오는 것이 목표예요!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 왜 SEO가 필요한가요? */}
        <div id="why-seo" className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--warning">💡</span>
            왜 SEO가 필요한가요?
          </h2>
          <div className="page-grid page-grid--3-col">
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--success">👥</div>
                <h3 className="site-info-card__title">더 많은 고객</h3>
              </div>
              <p className="site-info-card__description">
                검색 결과 상위에 나올수록 더 많은 사람들이 우리 사이트를 방문해요.
              </p>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--warning">💰</div>
                <h3 className="site-info-card__title">무료 마케팅</h3>
              </div>
              <p className="site-info-card__description">
                광고비 없이도 자연스럽게 고객을 모을 수 있는 가장 좋은 방법이에요.
              </p>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">🎯</div>
                <h3 className="site-info-card__title">정확한 고객</h3>
              </div>
              <p className="site-info-card__description">
                우리 상품이나 서비스를 정말 필요로 하는 사람들이 찾아와요.
              </p>
            </div>
          </div>
        </div>

        {/* 기본 요소들 */}
        <div id="basic-elements" className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--success">🔧</span>
            SEO 기본 요소들
          </h2>
          <div className="content-section">
            {/* 제목 */}
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--success">📝</span>
                페이지 제목 (Title Tag)
              </h3>
              <div className="content-section">
                <p className="content-section__intro">
                  검색 결과에서 파란색으로 표시되는 제목이에요. 가장 중요한 SEO 요소 중 하나입니다.
                </p>
                <div className="content-section__highlight content-section__highlight--success">
                  <h4 className="example-box__title example-box__title--good">✅ 좋은 제목 예시</h4>
                  <p className="example-box__content">"강남역 맛집 카페 | 신선한 원두커피와 디저트 전문점"</p>
                </div>
                <div className="content-section__highlight content-section__highlight--danger">
                  <h4 className="example-box__title example-box__title--bad">❌ 나쁜 제목 예시</h4>
                  <p className="example-box__content">"홈페이지" 또는 "메인"</p>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--info">📖</span>
                페이지 설명 (Meta Description)
              </h3>
              <div className="content-section">
                <p className="content-section__intro">
                  검색 결과에서 제목 아래에 나오는 설명 문구예요. 사람들이 클릭할지 결정하는 중요한 요소입니다.
                </p>
                <div className="content-section__highlight content-section__highlight--info">
                  <h4 className="example-box__title example-box__title--info">💡 작성 팁</h4>
                  <ul className="feature-list">
                    <li className="feature-list__item">150자 이내로 간결하게</li>
                    <li className="feature-list__item">주요 키워드 포함</li>
                    <li className="feature-list__item">사용자가 궁금해할 내용 포함</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 이미지 */}
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">
                <span className="icon icon--warning">🖼</span>
                이미지 최적화
              </h3>
              <div className="content-section">
                <p className="content-section__intro">
                  이미지도 검색 결과에 영향을 줍니다. 특히 이미지 검색에서 중요해요.
                </p>
                <div className="content-section__highlight content-section__highlight--warning">
                  <h4 className="example-box__title example-box__title--info">📸 이미지 SEO 체크리스트</h4>
                  <ul className="feature-list">
                    <li className="feature-list__item">파일명에 한국어 또는 영어로 내용 설명</li>
                    <li className="feature-list__item">ALT 텍스트 (대체 텍스트) 작성</li>
                    <li className="feature-list__item">이미지 크기 최적화 (너무 크지 않게)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 실전 팁 */}
        <div id="practical-tips" className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--warning">⚡</span>
            바로 적용할 수 있는 실전 팁
          </h2>
          <div className="page-grid page-grid--2-col">
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">🏢 지역 비즈니스 SEO</h3>
              <ul className="feature-list">
                <li className="feature-list__item">네이버 플레이스, 구글 마이 비즈니스 등록</li>
                <li className="feature-list__item">지역명 + 업종명으로 제목 작성</li>
                <li className="feature-list__item">주소, 전화번호 정확히 기입</li>
                <li className="feature-list__item">고객 리뷰 적극 관리</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">📱 모바일 최적화</h3>
              <ul className="feature-list">
                <li className="feature-list__item">휴대폰에서도 잘 보이는 디자인</li>
                <li className="feature-list__item">빠른 로딩 속도</li>
                <li className="feature-list__item">터치하기 쉬운 버튼 크기</li>
                <li className="feature-list__item">가로 스크롤 없애기</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">✍️ 콘텐츠 작성 팁</h3>
              <ul className="feature-list">
                <li className="feature-list__item">고객이 궁금해할 내용 위주</li>
                <li className="feature-list__item">자연스럽게 키워드 포함</li>
                <li className="feature-list__item">정기적으로 새 글 작성</li>
                <li className="feature-list__item">다른 사이트에서 복사 금지</li>
              </ul>
            </div>
            <div className="tech-seo-card">
              <h3 className="tech-seo-card__title">🔗 링크 관리</h3>
              <ul className="feature-list">
                <li className="feature-list__item">페이지 간 연결 링크 만들기</li>
                <li className="feature-list__item">깨진 링크 정기적으로 확인</li>
                <li className="feature-list__item">관련 사이트와 상호 링크</li>
                <li className="feature-list__item">소셜미디어 연결하기</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 마무리 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              🎯 SEO는 꾸준함이 핵심이에요!
            </h2>
            <p className="cta-section__description">
              하루아침에 결과가 나오지 않지만, 꾸준히 적용하면 분명히 효과를 볼 수 있어요. 
              작은 것부터 하나씩 개선해보세요!
            </p>
            <div className="action-buttons">
              <a 
                href="/" 
                className="btn btn-primary"
              >
                <span className="icon">🔍</span>
                내 사이트 분석하기
              </a>
              <a 
                href="/faq" 
                className="btn btn-outline"
              >
                <span className="icon">❓</span>
                자주 묻는 질문
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}