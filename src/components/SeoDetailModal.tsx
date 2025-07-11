'use client'

import { useState } from 'react'

interface SeoDetailModalProps {
  isOpen: boolean
  onClose: () => void
  category: {
    id: string
    name: string
    status: 'good' | 'warning' | 'danger'
    score: number
    description: string
    suggestions: string[]
  } | null
  currentValue?: {
    label: string
    value: string
    detail: string
    length?: number
    structure?: {
      hasH1: boolean
      isLogical: boolean
      recommendation: string
    }
  }
  siteInfo?: {
    domain: string
    title: string
    description: string
    language: string
    charset: string
    socialTags: {
      hasOpenGraph: boolean
      hasTwitterCard: boolean
      ogImage?: string
      ogTitle?: string
      ogDescription?: string
    }
    technicalInfo: {
      hasViewport: boolean
      hasStructuredData: boolean
      robotsTag: string
      canonicalUrl?: string
      wordCount: number
      imageCount: number
      linkCount: number
    }
    estimated: {
      loadTime: number
      industry: string
      targetAudience: string
      competitiveness: 'low' | 'medium' | 'high'
    }
  }
}

export default function SeoDetailModal({ isOpen, onClose, category, currentValue, siteInfo }: SeoDetailModalProps) {
  if (!isOpen || !category) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <span className="icon icon--success">✓</span>
      case 'warning': return <span className="icon icon--warning">!</span>
      case 'danger': return <span className="icon icon--danger">×</span>
      default: return <span className="icon icon--secondary">?</span>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return '좋아요!'
      case 'warning': return '보통이에요'
      case 'danger': return '개선이 필요해요'
      default: return '알 수 없음'
    }
  }

  const getDetailedAnalysis = () => {
    switch (category.id) {
      case 'title':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🎯 현재 페이지 제목</h4>
              <p className="font-lg font-weight-bold mb-xs" style={{ wordBreak: 'break-word' }}>
                {siteInfo?.title || '제목이 설정되지 않았습니다'}
              </p>
              <p className="font-sm text-secondary">
                길이: {siteInfo?.title?.length || 0}자 (권장: 30-60자)
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>💡 제목 최적화 팁</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#92400E' }}>
                <li className="mb-xs">주요 키워드를 앞쪽에 배치하세요</li>
                <li className="mb-xs">브랜드명은 뒤쪽에 넣으세요</li>
                <li className="mb-xs">30-60자 사이가 가장 좋습니다</li>
                <li className="mb-xs">클릭하고 싶게 만드는 매력적인 문구를 사용하세요</li>
              </ul>
            </div>
          </div>
        )
      
      case 'description':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📝 현재 메타 설명</h4>
              <p className="font-md mb-xs" style={{ wordBreak: 'break-word', lineHeight: '1.5' }}>
                {siteInfo?.description || '메타 설명이 설정되지 않았습니다'}
              </p>
              <p className="font-sm text-secondary">
                길이: {siteInfo?.description?.length || 0}자 (권장: 120-160자)
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#DBEAFE', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#1E40AF' }}>📖 메타 설명 작성법</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#1E40AF' }}>
                <li className="mb-xs">페이지 내용을 간단히 요약하세요</li>
                <li className="mb-xs">주요 키워드를 자연스럽게 포함하세요</li>
                <li className="mb-xs">120-160자 사이로 작성하세요</li>
                <li className="mb-xs">검색자가 클릭하고 싶게 만드는 내용을 넣으세요</li>
              </ul>
            </div>
          </div>
        )

      case 'social':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📱 현재 소셜 미디어 설정</h4>
              <div className="grid grid-cols-2 gap-md">
                <div className="text-center">
                  <div className={`icon ${siteInfo?.socialTags.hasOpenGraph ? 'icon--success' : 'icon--danger'} mb-xs`}>
                    {siteInfo?.socialTags.hasOpenGraph ? '✓' : '×'}
                  </div>
                  <div className="font-xs">Open Graph</div>
                </div>
                <div className="text-center">
                  <div className={`icon ${siteInfo?.socialTags.hasTwitterCard ? 'icon--success' : 'icon--danger'} mb-xs`}>
                    {siteInfo?.socialTags.hasTwitterCard ? '✓' : '×'}
                  </div>
                  <div className="font-xs">Twitter Card</div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#1D4ED8' }}>🔗 소셜 미디어 최적화 방법</h4>
              <div style={{ color: '#1D4ED8' }}>
                <p className="mb-sm font-sm">소셜 미디어에서 링크가 예쁘게 보이려면:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">Open Graph 태그 추가 (페이스북, 링크드인용)</li>
                  <li className="mb-xs">Twitter Card 태그 추가 (트위터용)</li>
                  <li className="mb-xs">1200x630px 크기의 이미지 준비</li>
                  <li className="mb-xs">매력적인 제목과 설명 작성</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'mobile':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📱 모바일 최적화 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${siteInfo?.technicalInfo.hasViewport ? 'icon--success' : 'icon--danger'}`}>
                  {siteInfo?.technicalInfo.hasViewport ? '✓' : '×'}
                </span>
                <span className="font-sm">뷰포트 메타 태그 설정</span>
              </div>
              <p className="font-sm text-secondary">
                {siteInfo?.technicalInfo.hasViewport ? 
                  '모바일에서 적절한 크기로 표시됩니다' : 
                  '모바일에서 작게 보일 수 있습니다'}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>📲 모바일 최적화 체크리스트</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#92400E' }}>
                <li className="mb-xs">뷰포트 메타 태그 추가</li>
                <li className="mb-xs">터치하기 쉬운 버튼 크기 (최소 44px)</li>
                <li className="mb-xs">읽기 쉬운 글자 크기 (최소 16px)</li>
                <li className="mb-xs">빠른 로딩 속도</li>
                <li className="mb-xs">세로 모드에서도 잘 보이는 레이아웃</li>
              </ul>
            </div>
          </div>
        )

      case 'structured':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🔍 구조화 데이터 현재 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${siteInfo?.technicalInfo.hasStructuredData ? 'icon--success' : 'icon--danger'}`}>
                  {siteInfo?.technicalInfo.hasStructuredData ? '✓' : '×'}
                </span>
                <span className="font-sm">Schema.org 마크업 적용</span>
              </div>
              <p className="font-sm text-secondary">
                {siteInfo?.technicalInfo.hasStructuredData ? 
                  '구글이 사이트 정보를 정확히 파악하고 있습니다' : 
                  '구글이 사이트가 무엇인지 정확히 모르는 상태입니다'}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🏷️ 구조화 데이터란?</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">구조화 데이터(Schema.org)는 구글에게 사이트를 친절하게 설명해주는 특별한 코드예요:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🏢 <strong>업종 설명:</strong> "우리는 카페야", "우리는 병원이야"</li>
                  <li className="mb-xs">📍 <strong>위치 정보:</strong> "주소는 여기야", "전화번호는 이거야"</li>
                  <li className="mb-xs">⏰ <strong>운영 시간:</strong> "월~금 9시~18시 영업해"</li>
                  <li className="mb-xs">⭐ <strong>리뷰 정보:</strong> "고객 평점 4.5점이야"</li>
                  <li className="mb-xs">💰 <strong>가격 정보:</strong> "이 상품은 5만원이야"</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🎯 구조화 데이터 적용 효과</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">구조화 데이터를 적용하면 검색 결과가 이렇게 바뀝니다:</p>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-xs text-secondary mb-xs">일반 검색 결과</div>
                    <div className="font-sm font-weight-bold">맛있는 카페 - 신선한 커피와 디저트</div>
                    <div className="font-xs text-secondary">맛있는 카페에서 신선한 커피와 수제 디저트를 즐겨보세요...</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #059669' }}>
                    <div className="font-xs text-secondary mb-xs">구조화 데이터 적용 후</div>
                    <div className="font-sm font-weight-bold">맛있는 카페 - 신선한 커피와 디저트</div>
                    <div className="font-xs text-secondary">맛있는 카페에서 신선한 커피와 수제 디저트를 즐겨보세요...</div>
                    <div className="flex items-center gap-md mt-xs">
                      <span className="font-xs">⭐⭐⭐⭐⭐ 4.5점</span>
                      <span className="font-xs">📞 02-123-4567</span>
                      <span className="font-xs">📍 서울 강남구</span>
                      <span className="font-xs">⏰ 영업중</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛠️ 구조화 데이터 적용 방법</h4>
              <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#92400E' }}>
                <li className="mb-xs">워드프레스: SEO 플러그인 사용 (Yoast, RankMath)</li>
                <li className="mb-xs">쇼핑몰: 상품 정보 스키마 적용</li>
                <li className="mb-xs">지역 업체: LocalBusiness 스키마 적용</li>
                <li className="mb-xs">블로그: Article 스키마 적용</li>
                <li className="mb-xs">구글 구조화 데이터 테스트 도구로 확인</li>
              </ul>
            </div>
          </div>
        )

      case 'speed':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">⚡ 사이트 속도 현재 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '⚡' : category.score >= 60 ? '🚶' : '🐌'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? '매우 빠름' : category.score >= 60 ? '보통 속도' : '느림'}
                </span>
              </div>
              <p className="font-sm text-secondary mb-sm">
                현재 점수: {category.score}점 / 100점
              </p>
              {category.name.includes('PageSpeed') && (
                <div className="mt-sm">
                  <p className="font-xs text-secondary mb-xs">📊 측정 데이터:</p>
                  {category.suggestions.filter(s => s.includes('Lab Data') || s.includes('Field Data')).map((suggestion, index) => (
                    <div key={index} className="font-xs text-secondary mb-xs" style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: 'var(--spacing-xs)', borderRadius: 'var(--radius-sm)' }}>
                      {suggestion.replace('📊 ', '').replace('👥 ', '')}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {category.name.includes('PageSpeed') && (
              <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>📊 측정 데이터 설명</h4>
                <div style={{ color: '#0369A1' }}>
                  <div className="space-y-sm">
                    <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #DBEAFE' }}>
                      <div className="font-sm font-weight-bold mb-xs">🧪 Lab Data (테스트 환경 데이터)</div>
                      <div className="font-xs">
                        • 구글의 표준 테스트 환경에서 측정한 데이터<br/>
                        • 일정한 환경에서 측정되어 정확하고 비교 가능<br/>
                        • FCP: 첫 번째 콘텐츠가 나타나는 시간<br/>
                        • LCP: 가장 큰 콘텐츠가 로딩되는 시간<br/>
                        • CLS: 페이지 레이아웃이 얼마나 안정적인지<br/>
                        • TBT: 페이지가 응답하지 않는 시간
                      </div>
                    </div>
                    <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #DBEAFE' }}>
                      <div className="font-sm font-weight-bold mb-xs">👥 Field Data (실제 사용자 데이터 - CrUX)</div>
                      <div className="font-xs">
                        • 실제 방문자들이 경험한 속도 데이터<br/>
                        • 다양한 기기와 네트워크 환경의 평균<br/>
                        • 충분한 방문자가 있어야 데이터 제공<br/>
                        • 더 현실적이고 신뢰할 수 있는 데이터<br/>
                        • <strong>빠름/보통/느림</strong>으로 분류
                      </div>
                    </div>
                  </div>
                  <p className="mt-sm font-sm" style={{ fontStyle: 'italic' }}>
                    💡 Field Data가 있으면 실제 사용자 경험을 기준으로, 없으면 Lab Data를 참고용으로 활용하세요!
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-md" style={{ backgroundColor: '#FFF7ED', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#C2410C' }}>🏃 사이트 속도가 중요한 이유</h4>
              <div style={{ color: '#C2410C' }}>
                <p className="mb-sm font-sm">사이트가 느리면 이런 문제가 발생합니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">😤 <strong>방문자 이탈:</strong> 3초 이상 걸리면 50% 이상이 떠남</li>
                  <li className="mb-xs">📱 <strong>모바일 불편:</strong> 핸드폰에서 더 오래 걸림</li>
                  <li className="mb-xs">🔍 <strong>검색 순위 하락:</strong> 구글이 느린 사이트를 싫어함</li>
                  <li className="mb-xs">💸 <strong>매출 감소:</strong> 0.1초 늦어질 때마다 매출 1% 감소</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🚀 사이트 속도 개선 방법</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">누구나 쉽게 할 수 있는 방법들:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🖼️ <strong>이미지 최적화:</strong> 큰 이미지를 작게 만들기 (WebP 형식 추천)</li>
                  <li className="mb-xs">🧹 <strong>불필요한 플러그인 제거:</strong> 안 쓰는 플러그인 삭제</li>
                  <li className="mb-xs">⚡ <strong>캐싱 설정:</strong> 웹사이트 캐시 플러그인 사용</li>
                  <li className="mb-xs">🌐 <strong>CDN 사용:</strong> 전 세계 어디서든 빠르게 접속</li>
                  <li className="mb-xs">🏠 <strong>호스팅 업그레이드:</strong> 좋은 호스팅 서비스 이용</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'images':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🖼️ 이미지 현재 상태</h4>
              <p className="font-sm text-secondary mb-sm">
                총 {siteInfo?.technicalInfo.imageCount || 0}개의 이미지가 발견되었습니다
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>📸 이미지 SEO란?</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">이미지도 검색 결과에 나올 수 있어요! 구글 이미지 검색에서 찾아지려면:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📝 <strong>Alt 텍스트:</strong> 이미지가 뭔지 설명하는 글</li>
                  <li className="mb-xs">📏 <strong>적절한 크기:</strong> 너무 크거나 작지 않게</li>
                  <li className="mb-xs">🏷️ <strong>의미있는 파일명:</strong> "image1.jpg" 대신 "맛있는-커피.jpg"</li>
                  <li className="mb-xs">⚡ <strong>빠른 로딩:</strong> 압축해서 용량 줄이기</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🎯 이미지 최적화 실전 팁</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">이미지 하나하나 이렇게 관리하세요:</p>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-xs text-secondary mb-xs">나쁜 예</div>
                    <div className="font-sm">파일명: IMG_1234.jpg</div>
                    <div className="font-sm">Alt 텍스트: 없음</div>
                    <div className="font-sm">크기: 5MB</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #059669' }}>
                    <div className="font-xs text-secondary mb-xs">좋은 예</div>
                    <div className="font-sm">파일명: 강남역-맛있는-카페-아메리카노.jpg</div>
                    <div className="font-sm">Alt 텍스트: 강남역 맛있는 카페의 아메리카노</div>
                    <div className="font-sm">크기: 300KB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">📝 콘텐츠 분석 결과</h4>
              <p className="font-sm text-secondary mb-sm">
                총 {siteInfo?.technicalInfo.wordCount || 0}단어의 콘텐츠가 분석되었습니다
              </p>
              <div className="flex items-center gap-sm">
                <span className={`icon ${(siteInfo?.technicalInfo.wordCount || 0) >= 300 ? 'icon--success' : 'icon--warning'}`}>
                  {(siteInfo?.technicalInfo.wordCount || 0) >= 300 ? '✓' : '!'}
                </span>
                <span className="font-sm">
                  {(siteInfo?.technicalInfo.wordCount || 0) >= 300 ? '충분한 콘텐츠 양' : '콘텐츠 양이 부족'}
                </span>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>📖 콘텐츠가 중요한 이유</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">좋은 콘텐츠는 SEO의 핵심입니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🎯 <strong>고객 만족:</strong> 유용한 정보를 제공하면 더 오래 머물러요</li>
                  <li className="mb-xs">🔍 <strong>구글 평가:</strong> 구글이 가치 있는 사이트로 인정해요</li>
                  <li className="mb-xs">📈 <strong>검색 순위:</strong> 콘텐츠가 좋을수록 상위 노출돼요</li>
                  <li className="mb-xs">💬 <strong>신뢰도 증가:</strong> 전문성을 보여줄 수 있어요</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>✍️ 좋은 콘텐츠 만들기</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">이렇게 콘텐츠를 만들어보세요:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📏 <strong>충분한 길이:</strong> 최소 300단어 이상 (더 자세할수록 좋아요)</li>
                  <li className="mb-xs">🎯 <strong>고객 중심:</strong> 고객이 궁금해할 내용을 중심으로</li>
                  <li className="mb-xs">📱 <strong>읽기 쉽게:</strong> 짧은 문장, 적절한 줄바꿈</li>
                  <li className="mb-xs">🔄 <strong>정기 업데이트:</strong> 새로운 정보를 꾸준히 추가</li>
                  <li className="mb-xs">📊 <strong>실용적 정보:</strong> 가격, 위치, 연락처 등 구체적 정보</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'technical':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">⚙️ 기술적 SEO 현재 상태</h4>
              <div className="space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className={`icon ${siteInfo?.technicalInfo.hasViewport ? 'icon--success' : 'icon--danger'}`}>
                    {siteInfo?.technicalInfo.hasViewport ? '✓' : '×'}
                  </span>
                  <span className="font-sm">모바일 뷰포트 설정</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`icon ${siteInfo?.technicalInfo.canonicalUrl ? 'icon--success' : 'icon--warning'}`}>
                    {siteInfo?.technicalInfo.canonicalUrl ? '✓' : '!'}
                  </span>
                  <span className="font-sm">표준 URL 설정</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`icon ${siteInfo?.language ? 'icon--success' : 'icon--warning'}`}>
                    {siteInfo?.language ? '✓' : '!'}
                  </span>
                  <span className="font-sm">언어 설정</span>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🔧 기술적 SEO란?</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">기술적 SEO는 검색엔진이 사이트를 제대로 읽을 수 있게 도와주는 설정들이에요:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📱 <strong>모바일 설정:</strong> 핸드폰에서 제대로 보이게 하기</li>
                  <li className="mb-xs">🔗 <strong>표준 URL:</strong> 중복 페이지 문제 방지</li>
                  <li className="mb-xs">🌍 <strong>언어 설정:</strong> 어떤 언어로 된 사이트인지 알려주기</li>
                  <li className="mb-xs">🤖 <strong>검색 허용:</strong> 구글이 페이지를 수집할 수 있게 하기</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#166534' }}>🛠️ 기술적 SEO 개선 방법</h4>
              <div style={{ color: '#166534' }}>
                <p className="mb-sm font-sm">대부분 웹사이트 관리자나 개발자가 설정해야 하는 부분들이에요:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🎯 <strong>우선순위 1:</strong> 모바일 뷰포트 메타 태그 추가</li>
                  <li className="mb-xs">🔧 <strong>개발자 요청:</strong> HTML 헤드 섹션에 필요한 태그들 추가</li>
                  <li className="mb-xs">📋 <strong>체크리스트:</strong> 구글 서치 콘솔에서 문제점 확인</li>
                  <li className="mb-xs">⚡ <strong>효과:</strong> 설정하면 즉시 검색엔진 인식 개선</li>
                </ul>
                <p className="mt-sm font-sm" style={{ fontStyle: 'italic' }}>
                  💡 기술적인 부분이 어려우시면 웹 개발자나 웹사이트 관리 업체에 문의해보세요!
                </p>
              </div>
            </div>
          </div>
        )

      case 'https':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🔒 HTTPS 보안 현재 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? 'HTTPS 보안 적용됨' : 'HTTP 비보안 연결'}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {category.score >= 80 ? 
                  '사이트가 SSL 인증서로 보호되고 있습니다' : 
                  '사이트가 보안되지 않은 HTTP로 제공되고 있습니다'}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛡️ HTTPS가 중요한 이유</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">HTTPS는 웹사이트 보안의 기본입니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🔐 <strong>데이터 암호화:</strong> 고객 정보가 안전하게 전송</li>
                  <li className="mb-xs">🎯 <strong>신뢰도 향상:</strong> 브라우저에서 "안전함" 표시</li>
                  <li className="mb-xs">📈 <strong>SEO 이점:</strong> 구글이 HTTPS 사이트를 선호</li>
                  <li className="mb-xs">💳 <strong>결제 보안:</strong> 온라인 결제 시 필수</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🔧 HTTPS 적용 방법</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">HTTPS로 전환하는 방법:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📋 <strong>SSL 인증서 구매:</strong> 호스팅 업체나 SSL 인증기관에서 구매</li>
                  <li className="mb-xs">⚙️ <strong>서버 설정:</strong> 웹 서버에 SSL 인증서 설치</li>
                  <li className="mb-xs">🔄 <strong>리다이렉트 설정:</strong> HTTP → HTTPS 자동 리다이렉트</li>
                  <li className="mb-xs">🔍 <strong>내부 링크 수정:</strong> 모든 링크를 HTTPS로 변경</li>
                  <li className="mb-xs">🆓 <strong>무료 옵션:</strong> Let's Encrypt 또는 CloudFlare 활용</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'links':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🔗 링크 구조 현재 상태</h4>
              <p className="font-sm text-secondary mb-sm">
                총 {siteInfo?.technicalInfo.linkCount || 0}개의 링크가 발견되었습니다
              </p>
              <div className="grid grid-cols-2 gap-md">
                <div className="text-center">
                  <div className="font-lg font-weight-bold text-primary">-</div>
                  <div className="font-xs">내부 링크</div>
                </div>
                <div className="text-center">
                  <div className="font-lg font-weight-bold text-secondary">-</div>
                  <div className="font-xs">외부 링크</div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🌐 링크의 중요성</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">링크는 웹사이트의 도로망과 같습니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🏠 <strong>내부 링크:</strong> 사이트 내 다른 페이지로 연결</li>
                  <li className="mb-xs">🌍 <strong>외부 링크:</strong> 다른 웹사이트로 연결</li>
                  <li className="mb-xs">📈 <strong>SEO 효과:</strong> 구글이 사이트 구조를 이해하는 데 도움</li>
                  <li className="mb-xs">👥 <strong>사용자 경험:</strong> 관련 정보를 쉽게 찾을 수 있게 도움</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>✨ 효과적인 링크 전략</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">링크를 효과적으로 활용하는 방법:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📝 <strong>관련 페이지 연결:</strong> 비슷한 주제의 글들을 서로 연결</li>
                  <li className="mb-xs">🎯 <strong>명확한 링크 텍스트:</strong> "여기를 클릭" 대신 구체적인 설명</li>
                  <li className="mb-xs">🔍 <strong>신뢰할 수 있는 외부 링크:</strong> 권위 있는 사이트로 연결</li>
                  <li className="mb-xs">📊 <strong>적절한 개수:</strong> 너무 많지도 적지도 않게</li>
                  <li className="mb-xs">🆕 <strong>새 창 열기:</strong> 외부 링크는 새 창에서 열기</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'keywords':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🎯 키워드 최적화 현재 상태</h4>
              <p className="font-sm text-secondary mb-sm">
                페이지의 키워드 일관성을 분석했습니다
              </p>
              <div className="flex items-center gap-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : category.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? '키워드 최적화 우수' : category.score >= 60 ? '키워드 최적화 보통' : '키워드 최적화 부족'}
                </span>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🔍 키워드 최적화란?</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">키워드 최적화는 검색 시 찾아지기 쉽게 만드는 방법입니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🎯 <strong>타겟 키워드:</strong> 고객이 검색할 만한 단어 선택</li>
                  <li className="mb-xs">📝 <strong>자연스러운 사용:</strong> 억지로 넣지 말고 자연스럽게</li>
                  <li className="mb-xs">📍 <strong>주요 위치:</strong> 제목, 소제목, 첫 단락에 포함</li>
                  <li className="mb-xs">🔄 <strong>적절한 반복:</strong> 과도하지 않게 적절히 반복</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#166534' }}>💡 키워드 최적화 팁</h4>
              <div style={{ color: '#166534' }}>
                <p className="mb-sm font-sm">효과적인 키워드 최적화 방법:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🎯 <strong>롱테일 키워드:</strong> "카페" 보다 "강남역 맛있는 카페"</li>
                  <li className="mb-xs">📊 <strong>검색량 확인:</strong> 네이버 키워드 도구 활용</li>
                  <li className="mb-xs">🏆 <strong>경쟁 분석:</strong> 상위 사이트들이 어떤 키워드를 쓰는지 확인</li>
                  <li className="mb-xs">📱 <strong>지역 키워드:</strong> 로컬 비즈니스는 지역명 포함</li>
                  <li className="mb-xs">🔄 <strong>동의어 활용:</strong> 같은 의미의 다양한 표현 사용</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'semantic-markup':
        const semanticData = (currentValue as any)?.semanticDetails
        if (!semanticData) return null
        
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🏗️ 시멘틱 마크업 현재 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${semanticData.score >= 80 ? 'icon--success' : semanticData.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {semanticData.score >= 80 ? '✓' : semanticData.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  점수: {semanticData.score}/100
                </span>
              </div>
              <p className="font-sm text-secondary">
                {semanticData.score >= 80 ? 
                  '시멘틱 마크업이 잘 구성되어 있습니다! 검색엔진과 스크린 리더가 쉽게 이해할 수 있어요.' : 
                  semanticData.score >= 60 ?
                  '시멘틱 마크업이 부분적으로 구성되어 있습니다. 몇 가지 개선하면 더 좋아질 거예요.' :
                  '시멘틱 마크업이 부족합니다. 검색엔진 최적화와 접근성 향상을 위해 개선이 필요해요.'}
              </p>
            </div>
            
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🏗️ HTML5 시멘틱 요소 체크</h4>
              <div style={{ color: '#0369A1' }}>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.header ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.header ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;header&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.nav ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.nav ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;nav&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.main ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.main ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;main&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.footer ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.footer ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;footer&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.section ? 'icon--success' : 'icon--warning'}`}>
                      {semanticData.elements.section ? '✓' : '△'}
                    </span>
                    <span className="font-sm">&lt;section&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.article ? 'icon--success' : 'icon--warning'}`}>
                      {semanticData.elements.article ? '✓' : '△'}
                    </span>
                    <span className="font-sm">&lt;article&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.elements.h1 ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.elements.h1 ? '✓' : '×'}
                    </span>
                    <span className="font-sm">&lt;h1&gt;</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`icon ${semanticData.structure.headingStructure ? 'icon--success' : 'icon--danger'}`}>
                      {semanticData.structure.headingStructure ? '✓' : '×'}
                    </span>
                    <span className="font-sm">헤딩 구조</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>♿ 접근성 속성</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">시각 장애인과 스크린 리더를 위한 접근성 속성:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🔍 <strong>ARIA 속성:</strong> {semanticData.structure.ariaAttributes}개 발견</li>
                  <li className="mb-xs">🎯 <strong>Role 속성:</strong> {semanticData.structure.roleAttributes}개 발견</li>
                  <li className="mb-xs">📢 <strong>권장사항:</strong> 최소 3개 이상의 ARIA 속성 사용</li>
                </ul>
              </div>
            </div>
            
            {semanticData.suggestions && semanticData.suggestions.length > 0 && (
              <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-md mb-sm" style={{ color: '#166534' }}>💡 개선 제안</h4>
                <ul style={{ paddingLeft: 'var(--spacing-md)', color: '#166534' }}>
                  {semanticData.suggestions.slice(0, 5).map((suggestion: string, index: number) => (
                    <li key={index} className="mb-xs font-sm">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🌟 시멘틱 마크업의 이점</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">시멘틱 마크업을 사용하면 이런 좋은 점들이 있어요:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🔍 <strong>검색엔진 최적화:</strong> 구글이 페이지 구조를 더 잘 이해</li>
                  <li className="mb-xs">♿ <strong>접근성 향상:</strong> 시각 장애인도 쉽게 웹사이트 이용</li>
                  <li className="mb-xs">📱 <strong>다양한 기기 지원:</strong> 스크린 리더, 음성 브라우저 등</li>
                  <li className="mb-xs">🔧 <strong>유지보수 용이:</strong> 코드 구조가 명확해져 관리가 쉬워짐</li>
                  <li className="mb-xs">🚀 <strong>미래 지향적:</strong> 웹 표준을 따르는 현대적인 웹사이트</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'robots':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🤖 robots.txt 현재 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : category.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? 'robots.txt 파일 존재' : category.score >= 60 ? 'robots.txt 부분 설정' : 'robots.txt 파일 없음'}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {category.score >= 80 ? 
                  '검색엔진이 사이트를 체계적으로 크롤링할 수 있습니다' : 
                  'robots.txt 파일로 검색엔진의 크롤링을 더 효율적으로 관리할 수 있습니다'}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🤖 robots.txt란?</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">robots.txt는 검색엔진에게 "이 사이트를 어떻게 돌아다닐지" 알려주는 안내서입니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🚦 <strong>교통신호:</strong> 어느 페이지는 가도 되고, 어느 페이지는 가면 안 되는지</li>
                  <li className="mb-xs">🗺️ <strong>지도 제공:</strong> 사이트맵 위치를 알려줘서 모든 페이지를 쉽게 찾게 도와줌</li>
                  <li className="mb-xs">⚡ <strong>효율성 증대:</strong> 검색엔진이 중요한 페이지에 집중할 수 있게 함</li>
                  <li className="mb-xs">🛡️ <strong>보안 강화:</strong> 관리자 페이지나 개인정보 페이지 접근 차단</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>📝 robots.txt 예시</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">기본적인 robots.txt 파일 예시:</p>
                <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5', fontFamily: 'monospace', fontSize: 'var(--font-sm)' }}>
                  <div>User-agent: *</div>
                  <div>Allow: /</div>
                  <div>Disallow: /admin/</div>
                  <div>Disallow: /private/</div>
                  <div style={{ marginTop: 'var(--spacing-xs)' }}>Sitemap: https://example.com/sitemap.xml</div>
                </div>
                <p className="mt-sm font-sm">이 설정의 의미:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">✅ <strong>모든 검색엔진</strong>이 사이트에 접근 가능</li>
                  <li className="mb-xs">🚫 <strong>/admin/, /private/ 폴더</strong>는 접근 차단</li>
                  <li className="mb-xs">🗺️ <strong>사이트맵 위치</strong>를 명시해서 모든 페이지를 쉽게 찾을 수 있게 함</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛠️ robots.txt 만들기</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">robots.txt 파일을 만드는 방법:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📝 <strong>메모장에서 작성:</strong> 간단한 텍스트 파일로 만들기</li>
                  <li className="mb-xs">📁 <strong>파일명:</strong> 반드시 "robots.txt"로 저장</li>
                  <li className="mb-xs">🌐 <strong>업로드 위치:</strong> 웹사이트 최상위 폴더 (example.com/robots.txt)</li>
                  <li className="mb-xs">🔍 <strong>확인 방법:</strong> 브라우저에서 "사이트주소/robots.txt" 입력해서 확인</li>
                  <li className="mb-xs">🎯 <strong>워드프레스:</strong> SEO 플러그인(Yoast, RankMath)으로 쉽게 설정</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'sitemap':
        return (
          <div className="space-y-md">
            <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm">🗺️ 사이트맵 현재 상태</h4>
              <div className="flex items-center gap-sm mb-sm">
                <span className={`icon ${category.score >= 80 ? 'icon--success' : category.score >= 60 ? 'icon--warning' : 'icon--danger'}`}>
                  {category.score >= 80 ? '✓' : category.score >= 60 ? '!' : '×'}
                </span>
                <span className="font-sm">
                  {category.score >= 80 ? '사이트맵 파일 존재' : category.score >= 60 ? '사이트맵 부분 설정' : '사이트맵 파일 없음'}
                </span>
              </div>
              <p className="font-sm text-secondary">
                {category.score >= 80 ? 
                  '검색엔진이 사이트의 모든 페이지를 체계적으로 수집할 수 있습니다' : 
                  '사이트맵을 추가하면 검색엔진이 더 많은 페이지를 발견할 수 있습니다'}
              </p>
            </div>
            <div className="p-md" style={{ backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#0369A1' }}>🗺️ 사이트맵이란?</h4>
              <div style={{ color: '#0369A1' }}>
                <p className="mb-sm font-sm">사이트맵은 웹사이트의 "목차"나 "건물 도면"과 같습니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">📋 <strong>페이지 목록:</strong> 사이트에 있는 모든 페이지의 주소를 정리한 파일</li>
                  <li className="mb-xs">🕒 <strong>업데이트 정보:</strong> 각 페이지가 언제 마지막으로 수정되었는지</li>
                  <li className="mb-xs">⭐ <strong>중요도 표시:</strong> 어떤 페이지가 더 중요한지 알려줌</li>
                  <li className="mb-xs">🚀 <strong>빠른 발견:</strong> 새 페이지를 만들면 검색엔진이 빠르게 찾을 수 있음</li>
                </ul>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#059669' }}>🎯 사이트맵의 장점</h4>
              <div style={{ color: '#059669' }}>
                <p className="mb-sm font-sm">사이트맵이 있으면 이런 좋은 점들이 있어요:</p>
                <div className="space-y-sm">
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-sm font-weight-bold mb-xs">📈 검색 노출 증가</div>
                    <div className="font-xs">구글이 사이트의 모든 페이지를 쉽게 찾아서 검색 결과에 더 많이 노출</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-sm font-weight-bold mb-xs">⚡ 빠른 인덱싱</div>
                    <div className="font-xs">새 글이나 페이지를 올리면 검색엔진이 빠르게 수집</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-sm font-weight-bold mb-xs">🔍 SEO 개선</div>
                    <div className="font-xs">검색 순위 향상에 도움이 되는 기본 설정</div>
                  </div>
                  <div className="p-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #D1FAE5' }}>
                    <div className="font-sm font-weight-bold mb-xs">📊 분석 가능</div>
                    <div className="font-xs">구글 서치 콘솔에서 어떤 페이지가 검색되는지 확인 가능</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-md" style={{ backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#92400E' }}>🛠️ 사이트맵 만들기</h4>
              <div style={{ color: '#92400E' }}>
                <p className="mb-sm font-sm">플랫폼별 사이트맵 생성 방법:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs">🎯 <strong>워드프레스:</strong> Yoast SEO, RankMath 플러그인으로 자동 생성</li>
                  <li className="mb-xs">📝 <strong>티스토리:</strong> 기본적으로 자동 생성됨 (사이트주소/sitemap.xml)</li>
                  <li className="mb-xs">🛒 <strong>쇼핑몰:</strong> 카페24, 메이크샵 등에서 자동 생성 기능 제공</li>
                  <li className="mb-xs">🔧 <strong>직접 제작:</strong> XML-Sitemaps.com 같은 온라인 도구 활용</li>
                  <li className="mb-xs">📋 <strong>확인 방법:</strong> "사이트주소/sitemap.xml" 접속해서 확인</li>
                  <li className="mb-xs">📤 <strong>구글 등록:</strong> 구글 서치 콘솔에 사이트맵 주소 제출</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <p className="font-md">{category.description}</p>
          </div>
        )
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-md">
            <div className={`modal-icon ${category.status === 'good' ? 'gradient-bg--success' : category.status === 'warning' ? 'gradient-bg--warning' : 'gradient-bg--danger'}`}>
              {getStatusIcon(category.status)}
            </div>
            <div>
              <h2 className="modal-title">{category.name}</h2>
              <div className={`status-indicator status-indicator--${category.status}`}>
                {category.score}점 - {getStatusText(category.status)}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span className="icon icon--secondary">×</span>
          </button>
        </div>

        <div className="modal-body">
          {currentValue && (
            <div className="mb-lg">
              <h3 className="font-lg mb-md">🔍 현재 상태</h3>
              <div className="current-status">
                <div className="current-status__label">{currentValue.label}</div>
                <div className="current-status__value">
                  {currentValue.value}
                  {currentValue.length !== undefined && (
                    <span className="current-status__length">({currentValue.length}자)</span>
                  )}
                </div>
                <div className="current-status__detail">{currentValue.detail}</div>
              </div>
            </div>
          )}

          <div className="mb-lg">
            <h3 className="font-lg mb-md">📊 상세 분석</h3>
            {getDetailedAnalysis()}
          </div>

          <div className="mb-lg">
            <h3 className="font-lg mb-md">💡 개선 방법</h3>
            <div className="improvement-list">
              {category.suggestions.map((suggestion, index) => (
                <div key={index} className="improvement-item">
                  <span className="improvement-number">{index + 1}</span>
                  <span className="improvement-text">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            <span className="icon icon--success">✓</span>
            확인했어요
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-md);
        }

        .modal-content {
          background: white;
          border-radius: var(--radius-xl);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .modal-title {
          font-size: var(--font-xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: var(--color-bg-secondary);
        }

        .modal-body {
          padding: var(--spacing-xl);
        }

        .current-status {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }

        .current-status__label {
          font-size: var(--font-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .current-status__value {
          font-size: var(--font-lg);
          font-weight: 600;
          color: var(--color-text-primary);
          word-break: break-all;
          margin-bottom: var(--spacing-xs);
        }

        .current-status__length {
          font-size: var(--font-sm);
          color: var(--color-text-secondary);
          margin-left: var(--spacing-sm);
          font-weight: normal;
        }

        .current-status__detail {
          font-size: var(--font-sm);
          color: var(--color-text-secondary);
          font-style: italic;
          line-height: 1.4;
        }

        .improvement-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .improvement-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }

        .improvement-number {
          background: var(--color-primary);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-sm);
          font-weight: 600;
          flex-shrink: 0;
        }

        .improvement-text {
          font-size: var(--font-md);
          line-height: 1.5;
          color: var(--color-text-primary);
        }

        .modal-footer {
          padding: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
        }

        .space-y-md > * + * {
          margin-top: var(--spacing-md);
        }

        .space-y-sm > * + * {
          margin-top: var(--spacing-sm);
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: var(--spacing-md);
            max-height: calc(100vh - 2rem);
          }
          
          .modal-header,
          .modal-body,
          .modal-footer {
            padding: var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  )
}