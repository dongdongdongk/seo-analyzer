'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - 자주 묻는 질문 | 무료 검색엔진 최적화 분석기',
  description: 'SEO 분석 서비스에 대한 자주 묻는 질문과 답변을 모았습니다. 서비스 이용법, SEO 기초, 개선 방법까지 모든 궁금증을 해결해드립니다.',
  keywords: [
    'SEO FAQ', 'SEO 질문', '검색엔진 최적화 질문', 'SEO 도움말', 'SEO 가이드',
    'SEO 분석 사용법', 'SEO 기초 질문', 'SEO 개선 방법', 'SEO 문제 해결',
    'SEO 서비스 질문', 'SEO 초보자 질문', 'SEO 지원'
  ],
  openGraph: {
    title: 'FAQ - 자주 묻는 질문 | 무료 검색엔진 최적화 분석기',
    description: 'SEO 분석 서비스에 대한 자주 묻는 질문과 답변을 모았습니다. 서비스 이용법, SEO 기초, 개선 방법까지 모든 궁금증을 해결해드립니다.',
    url: 'https://seo-analyzer.com/faq',
    type: 'website',
  },
  twitter: {
    title: 'FAQ - 자주 묻는 질문 | 무료 검색엔진 최적화 분석기',
    description: 'SEO 분석 서비스에 대한 자주 묻는 질문과 답변을 모았습니다. 서비스 이용법, SEO 기초, 개선 방법까지 모든 궁금증을 해결해드립니다.',
  },
  alternates: {
    canonical: 'https://seo-analyzer.com/faq',
  },
}

const faqs = [
  {
    id: 1,
    category: '서비스 이용',
    question: 'SEO 분석 서비스는 무료인가요?',
    answer: '네, 완전 무료입니다! 회원가입도 필요 없고, URL만 입력하면 바로 분석 결과를 받아볼 수 있어요. 앞으로도 계속 무료로 제공할 예정입니다.'
  },
  {
    id: 2,
    category: '서비스 이용',
    question: '분석에 얼마나 시간이 걸리나요?',
    answer: '보통 2-3분 정도 소요됩니다. 사이트의 크기와 복잡성에 따라 조금 더 걸릴 수 있지만, 대부분 3분 이내에 완료됩니다.'
  },
  {
    id: 3,
    category: '서비스 이용',
    question: '어떤 종류의 웹사이트도 분석할 수 있나요?',
    answer: '대부분의 웹사이트를 분석할 수 있습니다. 개인 블로그, 회사 홈페이지, 쇼핑몰, 포트폴리오 사이트 등 모두 가능해요. 다만, 로그인이 필요한 페이지나 접근이 제한된 사이트는 분석이 어려울 수 있습니다.'
  },
  {
    id: 4,
    category: 'SEO 기초',
    question: 'SEO가 정확히 무엇인가요?',
    answer: 'SEO는 Search Engine Optimization의 줄임말로, "검색 엔진 최적화"를 뜻합니다. 쉽게 말해서 구글이나 네이버에서 검색했을 때 우리 사이트가 더 상위에 노출되도록 하는 모든 활동을 말해요.'
  },
  {
    id: 5,
    category: 'SEO 기초',
    question: 'SEO 점수가 낮으면 어떻게 해야 하나요?',
    answer: '걱정하지 마세요! 분석 결과에서 제공하는 개선 방안을 하나씩 적용해보시면 됩니다. 가장 중요한 것부터 우선순위를 매겨서 알려드리니까, 차근차근 따라해보세요. 완벽한 100점을 받을 필요는 없어요.'
  },
  {
    id: 6,
    category: 'SEO 기초',
    question: 'SEO 효과는 언제부터 나타나나요?',
    answer: 'SEO는 시간이 걸리는 작업이에요. 빠르면 1-2주, 보통은 1-3개월 정도 지나야 검색 결과에 변화가 나타납니다. 꾸준히 개선하는 것이 가장 중요해요.'
  },
  {
    id: 7,
    category: '기술적 문제',
    question: '분석이 실패하거나 오류가 발생하면 어떻게 하나요?',
    answer: '몇 가지 확인해보세요: 1) URL이 정확한지 확인 2) 사이트가 정상적으로 접속되는지 확인 3) 잠시 후 다시 시도해보세요. 계속 문제가 생기면 피드백을 통해 알려주시면 빠르게 해결해드릴게요.'
  },
  {
    id: 8,
    category: '기술적 문제',
    question: '모바일에서도 사용할 수 있나요?',
    answer: '네! 모바일에서도 완벽하게 작동합니다. 스마트폰이나 태블릿에서도 편리하게 사용하실 수 있어요.'
  },
  {
    id: 9,
    category: '결과 해석',
    question: '분석 결과를 어떻게 해석해야 하나요?',
    answer: '분석 결과는 초보자도 쉽게 이해할 수 있도록 만들어져 있어요. 빨간색은 개선이 필요한 부분, 노란색은 보통, 초록색은 좋은 상태를 의미합니다. 각 항목마다 구체적인 개선 방법도 함께 제시해드려요.'
  },
  {
    id: 10,
    category: '결과 해석',
    question: '경쟁사와 비교할 수 있나요?',
    answer: '현재는 단일 사이트 분석만 제공하고 있습니다. 하지만 업종별 평균 점수와 비교할 수 있는 기능을 개발 중이에요. 더 나은 서비스를 위해 지속적으로 개선하고 있습니다.'
  },
  {
    id: 11,
    category: '개선 방법',
    question: '제목과 설명을 어떻게 수정해야 하나요?',
    answer: '제목은 30자 이내로, 설명은 150자 이내로 작성하는 것이 좋아요. 사용자가 궁금해할 내용과 주요 키워드를 자연스럽게 포함시키세요. 분석 결과에서 현재 상태와 개선 방안을 상세히 알려드립니다.'
  },
  {
    id: 12,
    category: '개선 방법',
    question: '이미지 최적화는 어떻게 하나요?',
    answer: '이미지 파일명을 의미있는 이름으로 바꾸고, ALT 텍스트(대체 텍스트)를 추가해주세요. 이미지 크기도 너무 크지 않게 조정하는 것이 좋습니다. 구체적인 방법은 SEO 가이드에서 자세히 설명하고 있어요.'
  },
  {
    id: 13,
    category: '개선 방법',
    question: '사이트 속도를 개선하려면 어떻게 해야 하나요?',
    answer: '이미지 크기 최적화, 불필요한 플러그인 삭제, 좋은 호스팅 서비스 이용 등이 도움이 됩니다. 기술적인 부분이 어렵다면 웹 개발자에게 도움을 요청하는 것도 좋은 방법이에요.'
  },
  {
    id: 14,
    category: '지역 비즈니스',
    question: '지역 기반 비즈니스 SEO는 어떻게 하나요?',
    answer: '네이버 플레이스와 구글 마이 비즈니스에 등록하는 것이 가장 중요해요. 또한 지역명을 포함한 키워드를 사용하고, 정확한 주소와 전화번호를 웹사이트에 명시하세요.'
  },
  {
    id: 15,
    category: '지역 비즈니스',
    question: '네이버와 구글 중 어느 것이 더 중요한가요?',
    answer: '한국에서는 네이버가 여전히 중요하지만, 구글의 영향력도 점점 커지고 있어요. 두 검색엔진 모두 고려해서 최적화하는 것이 좋습니다. 저희 서비스는 두 검색엔진 모두에 적용되는 원칙을 기반으로 분석해드려요.'
  }
]

const categories = ['전체', '서비스 이용', 'SEO 기초', '기술적 문제', '결과 해석', '개선 방법', '지역 비즈니스']

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const filteredFAQs = activeCategory === '전체' 
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
              자주 묻는 질문 (FAQ)
            </h1>
            <p className="page-header__subtitle">
              SEO 분석 서비스에 대해 궁금한 모든 것들을 정리했어요
            </p>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="analysis-section">
          <h2 className="section-title">
            <span className="icon icon--info">🏷</span>
            카테고리별 질문
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
                {category}
              </button>
            ))}
          </div>
          <p className="content-section__intro">
            총 <strong>{filteredFAQs.length}개</strong>의 질문이 있습니다.
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
                            {faq.category}
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
            추가 도움말
          </h2>
          <div className="page-grid page-grid--2-col">
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--info">📚</div>
                <h3 className="site-info-card__title">SEO 기초 가이드</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  SEO가 처음이신가요? 기초부터 차근차근 배울 수 있는 가이드를 준비했어요.
                </p>
                <a href="/seo-guide" className="btn btn-outline">
                  가이드 보러가기
                </a>
              </div>
            </div>
            <div className="site-info-card">
              <div className="site-info-card__header">
                <div className="site-info-card__icon gradient-bg--success">🔍</div>
                <h3 className="site-info-card__title">바로 분석해보기</h3>
              </div>
              <div className="site-info-card__content">
                <p className="site-info-card__description">
                  이론보다는 실전! 내 사이트를 직접 분석해보면서 SEO를 이해해보세요.
                </p>
                <a href="/" className="btn btn-outline">
                  분석 시작하기
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 문의하기 섹션 */}
        <div className="analysis-section">
          <div className="cta-section">
            <h2 className="cta-section__title">
              💬 궁금한 점이 더 있으시나요?
            </h2>
            <p className="cta-section__description">
              FAQ에서 답을 찾지 못하셨다면, 언제든지 피드백을 통해 질문해주세요. 
              더 나은 서비스를 위해 여러분의 의견을 소중히 생각합니다.
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
                href="/about" 
                className="btn btn-outline"
              >
                <span className="icon">ℹ️</span>
                서비스 소개
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}