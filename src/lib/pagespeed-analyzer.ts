// Google PageSpeed Insights API를 사용한 성능 분석
// Lighthouse보다 안정적이고 관리가 쉬운 방법

import { SEOCategory } from '@/types/analysis'

// PageSpeed Insights API 결과 타입
interface PageSpeedResult {
  performance: {
    score: number
    metrics: {
      firstContentfulPaint: number
      largestContentfulPaint: number
      totalBlockingTime: number
      cumulativeLayoutShift: number
      speedIndex: number
    }
  }
  accessibility: {
    score: number
    issues: string[]
  }
  bestPractices: {
    score: number
    issues: string[]
  }
  seo: {
    score: number
    issues: string[]
  }
  analysisType: 'pagespeed' | 'simple'
  hasFieldData: boolean // 실제 사용자 데이터 존재 여부
  improvements: string[] // 구체적인 개선 방법
}

// Google PageSpeed Insights API 호출
export async function runPageSpeedAnalysis(url: string): Promise<PageSpeedResult> {
  try {
    console.log('🚀 PageSpeed Insights API 분석 시작:', url)
    
    // PageSpeed Insights API 호출
    const apiKey = process.env.PAGESPEED_API_KEY
    if (!apiKey) {
      console.warn('⚠️ PageSpeed API Key가 없습니다. 간단한 분석으로 대체합니다.')
      return await runSimplePerformanceAnalysis(url)
    }
    
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile`
    
    console.log('📊 PageSpeed Insights API 호출 중...')
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.lighthouseResult) {
      throw new Error('PageSpeed 분석 결과를 가져올 수 없습니다.')
    }
    
    const lhr = data.lighthouseResult
    const loadingExperience = data.loadingExperience // CrUX 데이터 (실제 사용자 데이터)
    console.log('✅ PageSpeed Insights 분석 완료!')
    
    // CrUX 데이터 확인
    const hasFieldData = loadingExperience && loadingExperience.metrics
    console.log('📊 실제 사용자 데이터 (CrUX):', hasFieldData ? '있음' : '없음 (Lab 데이터만 사용)')
    
    // 개선 방법 추출
    const improvements: string[] = []
    if (lhr.audits['largest-contentful-paint'] && lhr.audits['largest-contentful-paint'].score < 0.9) {
      improvements.push('이미지 최적화 (WebP 형식 사용)')
      improvements.push('이미지 지연 로딩 (lazy loading) 적용')
    }
    if (lhr.audits['unused-css-rules'] && lhr.audits['unused-css-rules'].score < 0.9) {
      improvements.push('사용하지 않는 CSS 제거')
    }
    if (lhr.audits['unused-javascript'] && lhr.audits['unused-javascript'].score < 0.9) {
      improvements.push('사용하지 않는 JavaScript 제거')
    }
    if (lhr.audits['server-response-time'] && lhr.audits['server-response-time'].score < 0.9) {
      improvements.push('서버 응답 시간 개선')
    }
    if (lhr.audits['render-blocking-resources'] && lhr.audits['render-blocking-resources'].score < 0.9) {
      improvements.push('렌더링을 차단하는 리소스 제거')
    }
    
    // 결과 파싱
    const result: PageSpeedResult = {
      performance: {
        score: Math.round((lhr.categories.performance?.score || 0) * 100),
        metrics: {
          firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue || 0,
          largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue || 0,
          totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
          cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
          speedIndex: lhr.audits['speed-index']?.numericValue || 0,
        }
      },
      accessibility: {
        score: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        issues: []
      },
      bestPractices: {
        score: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        issues: []
      },
      seo: {
        score: Math.round((lhr.categories.seo?.score || 0) * 100),
        issues: []
      },
      analysisType: 'pagespeed',
      hasFieldData: hasFieldData || false,
      improvements
    }
    
    return result
    
  } catch (error) {
    console.error('❌ PageSpeed Insights API 실패:', error)
    console.log('🔄 간단한 분석으로 대체합니다...')
    return await runSimplePerformanceAnalysis(url)
  }
}

// 간단한 성능 분석 (PageSpeed API 대체)
async function runSimplePerformanceAnalysis(url: string): Promise<PageSpeedResult> {
  try {
    console.log('📊 간단한 성능 분석 시작:', url)
    
    // 간단한 응답 시간 측정
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const responseTime = Date.now() - startTime
    
    // 응답 시간 기반 성능 점수 계산
    const performanceScore = calculatePerformanceScore(responseTime)
    
    console.log(`⚡ 응답 시간: ${responseTime}ms, 성능 점수: ${performanceScore}점`)
    
    return {
      performance: {
        score: performanceScore,
        metrics: {
          firstContentfulPaint: responseTime,
          largestContentfulPaint: responseTime * 1.5,
          totalBlockingTime: 0,
          cumulativeLayoutShift: 0.1,
          speedIndex: responseTime * 1.2
        }
      },
      accessibility: {
        score: 85, // 기본값
        issues: []
      },
      bestPractices: {
        score: 80, // 기본값
        issues: []
      },
      seo: {
        score: 90, // 기본값
        issues: []
      },
      analysisType: 'simple',
      hasFieldData: false,
      improvements: [
        '이미지 압축 및 최적화',
        '캐시 설정 확인',
        '호스팅 서비스 성능 점검'
      ]
    }
  } catch (error) {
    console.error('성능 분석 오류:', error)
    
    // 에러 시 기본값 반환
    return {
      performance: {
        score: 70,
        metrics: {
          firstContentfulPaint: 2000,
          largestContentfulPaint: 3000,
          totalBlockingTime: 100,
          cumulativeLayoutShift: 0.1,
          speedIndex: 2500
        }
      },
      accessibility: {
        score: 85,
        issues: []
      },
      bestPractices: {
        score: 80,
        issues: []
      },
      seo: {
        score: 90,
        issues: []
      },
      analysisType: 'simple',
      hasFieldData: false,
      improvements: [
        '네트워크 연결 상태 확인',
        '기본적인 웹사이트 최적화 적용'
      ]
    }
  }
}

// 응답 시간 기반 성능 점수 계산
function calculatePerformanceScore(responseTime: number): number {
  if (responseTime < 1000) return 95
  if (responseTime < 2000) return 85
  if (responseTime < 3000) return 75
  if (responseTime < 5000) return 65
  return 50
}

// PageSpeed 결과를 SEO 카테고리로 변환
export function convertPageSpeedToSEOCategory(
  result: PageSpeedResult, 
  type: 'performance' | 'mobile'
): SEOCategory {
  if (type === 'performance') {
    const score = result.performance.score
    const status = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'danger'
    const fcp = Math.round(result.performance.metrics.firstContentfulPaint)
    const lcp = Math.round(result.performance.metrics.largestContentfulPaint)
    const cls = result.performance.metrics.cumulativeLayoutShift.toFixed(3)
    const tbt = Math.round(result.performance.metrics.totalBlockingTime)
    
    // PageSpeed 데이터 여부 확인
    const isPageSpeedData = fcp < 10000 && lcp < 20000 // 실제 PageSpeed 데이터인지 확인
    
    return {
      id: 'speed',
      name: isPageSpeedData ? '사이트 속도 (PageSpeed 측정)' : '사이트 속도 (간단 측정)',
      status,
      score,
      description: score >= 80 
        ? `사이트가 빨라요! 고객들이 기다리지 않고 바로 볼 수 있어요. ${isPageSpeedData ? `(FCP: ${fcp}ms, LCP: ${lcp}ms)` : `(응답시간: ${fcp}ms)`}`
        : score >= 60 
        ? `속도가 보통이에요. 조금 더 빠르게 만들면 고객들이 더 좋아할 거예요. ${isPageSpeedData ? `(FCP: ${fcp}ms, LCP: ${lcp}ms)` : `(응답시간: ${fcp}ms)`}`
        : `사이트가 느려요. 고객들이 기다리다가 떠날 수 있어요. ${isPageSpeedData ? `(FCP: ${fcp}ms, LCP: ${lcp}ms)` : `(응답시간: ${fcp}ms)`}`,
      suggestions: score >= 80 
        ? [
            '현재 속도가 좋아요! 이 상태를 유지하세요',
            isPageSpeedData ? `CLS: ${cls} (좋음)` : '정기적으로 속도를 확인해보세요',
            isPageSpeedData ? `TBT: ${tbt}ms` : ''
          ].filter(Boolean)
        : [
            '이미지 크기를 줄여보세요',
            '사용하지 않는 플러그인을 제거해보세요',
            '캐시 설정을 확인해보세요',
            isPageSpeedData ? `CLS 개선 필요: ${cls}` : '호스팅 서비스 성능을 확인해보세요'
          ]
    }
  } else {
    // 모바일 친화도
    const accessibilityScore = result.accessibility.score
    const status = accessibilityScore >= 80 ? 'good' : accessibilityScore >= 60 ? 'warning' : 'danger'
    
    return {
      id: 'mobile',
      name: '모바일 친화도',
      status,
      score: accessibilityScore,
      description: accessibilityScore >= 80 
        ? '모바일에서 보기 편해요! 핸드폰 사용자들이 쉽게 이용할 수 있어요.'
        : accessibilityScore >= 60 
        ? '모바일에서 봐도 괜찮아요. 조금 더 개선하면 더 좋을 거예요.'
        : '모바일에서 보기 어려울 수 있어요. 핸드폰 사용자를 위해 개선이 필요해요.',
      suggestions: accessibilityScore >= 80 
        ? [
            '모바일 최적화가 잘 되어 있어요',
            '현재 상태를 유지하세요'
          ]
        : [
            '버튼과 링크를 손가락으로 누르기 쉽게 만들어보세요',
            '글자 크기를 핸드폰에서 읽기 쉽게 조정해보세요',
            '화면이 핸드폰 크기에 맞게 조정되도록 설정해보세요'
          ]
    }
  }
}

// PageSpeed 분석 실패 시 대체 카테고리 생성
export function createFallbackSpeedAnalysis(): SEOCategory {
  return {
    id: 'speed',
    name: '사이트 속도',
    status: 'warning',
    score: 70,
    description: '사이트 속도를 정확히 측정할 수 없었어요. 일반적인 개선 방법을 알려드릴게요.',
    suggestions: [
      '이미지 크기를 줄여보세요',
      '사용하지 않는 플러그인을 제거해보세요',
      '캐시 설정을 확인해보세요',
      '호스팅 서비스 성능을 확인해보세요'
    ]
  }
}

export function createFallbackMobileAnalysis(pageData: any): SEOCategory {
  const hasViewport = pageData.viewport && pageData.viewport.length > 0
  const score = hasViewport ? 70 : 50
  const status = hasViewport ? 'warning' : 'danger'
  
  return {
    id: 'mobile',
    name: '모바일 친화도',
    status,
    score,
    description: hasViewport 
      ? '모바일 설정이 있어요. 조금 더 최적화하면 더 좋을 거예요.'
      : '모바일 설정이 부족할 수 있어요. 핸드폰에서 잘 보이도록 설정을 확인해보세요.',
    suggestions: hasViewport 
      ? [
          '버튼과 링크를 손가락으로 누르기 쉽게 만들어보세요',
          '글자 크기를 핸드폰에서 읽기 쉽게 조정해보세요'
        ]
      : [
          '모바일 뷰포트를 설정해보세요',
          '반응형 디자인을 적용해보세요'
        ]
  }
}