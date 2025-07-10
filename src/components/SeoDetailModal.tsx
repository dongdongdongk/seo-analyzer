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

      case 'heading':
        return (
          <div className="space-y-md">
            {currentValue && (currentValue as any).structure && (
              <div className="p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-md mb-sm">📋 제목 구조 분석</h4>
                <div className="space-y-sm">
                  <div className="flex items-center gap-sm">
                    <span className={`icon ${(currentValue as any).structure.hasH1 ? 'icon--success' : 'icon--danger'}`}>
                      {(currentValue as any).structure.hasH1 ? '✓' : '×'}
                    </span>
                    <span className="font-sm">H1 태그 (대제목) 사용</span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className={`icon ${(currentValue as any).structure.isLogical ? 'icon--success' : 'icon--warning'}`}>
                      {(currentValue as any).structure.isLogical ? '✓' : '!'}
                    </span>
                    <span className="font-sm">논리적 순서 (H1→H2→H3)</span>
                  </div>
                </div>
              </div>
            )}
            <div className="p-md" style={{ backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-md mb-sm" style={{ color: '#166534' }}>🏗️ 제목 구조 만들기</h4>
              <div style={{ color: '#166534' }}>
                <p className="mb-sm font-sm">제목 태그는 책의 목차와 같습니다:</p>
                <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                  <li className="mb-xs"><strong>H1:</strong> 페이지의 주제 (한 페이지에 하나만)</li>
                  <li className="mb-xs"><strong>H2:</strong> 큰 섹션의 제목</li>
                  <li className="mb-xs"><strong>H3:</strong> 세부 내용의 제목</li>
                  <li className="mb-xs"><strong>H4-H6:</strong> 더 세분화된 내용</li>
                </ul>
                <p className="mt-sm font-sm" style={{ fontStyle: 'italic' }}>
                  순서를 건너뛰지 말고 H1→H2→H3 순서대로 사용하세요!
                </p>
              </div>
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
              <p className="font-sm text-secondary">
                현재 점수: {category.score}점 / 100점
              </p>
            </div>
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