// Google PageSpeed Insights API를 사용한 성능 분석
// Lighthouse보다 안정적이고 관리가 쉬운 방법

import { SEOCategory } from '@/types/analysis'

// PageSpeed Insights API 결과 타입
interface PageSpeedResult {
  labData: {
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
  }
  fieldData?: {
    // CrUX 실제 사용자 데이터
    firstContentfulPaint?: { percentile: number, category: string }
    largestContentfulPaint?: { percentile: number, category: string }
    cumulativeLayoutShift?: { percentile: number, category: string }
    firstInputDelay?: { percentile: number, category: string }
    overallCategory?: string
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
    
    // CrUX 데이터 파싱 (실제 사용자 데이터)
    let fieldData: PageSpeedResult['fieldData'] = undefined
    if (hasFieldData && loadingExperience.metrics) {
      const metrics = loadingExperience.metrics
      fieldData = {
        firstContentfulPaint: metrics.FIRST_CONTENTFUL_PAINT_MS ? {
          percentile: metrics.FIRST_CONTENTFUL_PAINT_MS.percentile,
          category: metrics.FIRST_CONTENTFUL_PAINT_MS.category
        } : undefined,
        largestContentfulPaint: metrics.LARGEST_CONTENTFUL_PAINT_MS ? {
          percentile: metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
          category: metrics.LARGEST_CONTENTFUL_PAINT_MS.category
        } : undefined,
        cumulativeLayoutShift: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE ? {
          percentile: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile,
          category: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category
        } : undefined,
        firstInputDelay: metrics.FIRST_INPUT_DELAY_MS ? {
          percentile: metrics.FIRST_INPUT_DELAY_MS.percentile,
          category: metrics.FIRST_INPUT_DELAY_MS.category
        } : undefined,
        overallCategory: loadingExperience.overall_category
      }
    }

    // 결과 파싱
    const result: PageSpeedResult = {
      labData: {
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
        }
      },
      fieldData,
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
      labData: {
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
        }
      },
      fieldData: undefined, // 간단한 분석에서는 CrUX 데이터 없음
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
      labData: {
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
        }
      },
      fieldData: undefined,
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

// Lab Data와 Field Data를 구분해서 표시하는 헬퍼 함수
function formatMetrics(result: PageSpeedResult, locale: string = 'ko'): { labData: string, fieldData: string } {
  const labMetrics = result.labData.performance.metrics
  const fcp = Math.round(labMetrics.firstContentfulPaint)
  const lcp = Math.round(labMetrics.largestContentfulPaint)
  const cls = labMetrics.cumulativeLayoutShift.toFixed(3)
  const tbt = Math.round(labMetrics.totalBlockingTime)
  
  let labData, fieldData;
  
  if (locale === 'ko') {
    labData = `Lab Data (테스트 환경): FCP ${fcp}ms, LCP ${lcp}ms, CLS ${cls}, TBT ${tbt}ms`
    console.log(`🧪 Korean Lab Data: ${labData}`);
    
    if (result.fieldData && result.hasFieldData) {
      const fd = result.fieldData
      const fcpField = fd.firstContentfulPaint ? `${fd.firstContentfulPaint.percentile}ms (${getCategoryText(fd.firstContentfulPaint.category, locale)})` : 'N/A'
      const lcpField = fd.largestContentfulPaint ? `${fd.largestContentfulPaint.percentile}ms (${getCategoryText(fd.largestContentfulPaint.category, locale)})` : 'N/A'
      fieldData = `Field Data (실제 사용자): FCP ${fcpField}, LCP ${lcpField}`
    } else {
      fieldData = 'Field Data: 실제 사용자 데이터가 충분하지 않습니다 (사이트 방문자가 적음)'
    }
    console.log(`👥 Korean Field Data: ${fieldData}`);
  } else {
    labData = `Lab Data (Test Environment): FCP ${fcp}ms, LCP ${lcp}ms, CLS ${cls}, TBT ${tbt}ms`
    
    if (result.fieldData && result.hasFieldData) {
      const fd = result.fieldData
      const fcpField = fd.firstContentfulPaint ? `${fd.firstContentfulPaint.percentile}ms (${getCategoryText(fd.firstContentfulPaint.category, locale)})` : 'N/A'
      const lcpField = fd.largestContentfulPaint ? `${fd.largestContentfulPaint.percentile}ms (${getCategoryText(fd.largestContentfulPaint.category, locale)})` : 'N/A'
      fieldData = `Field Data (Real Users): FCP ${fcpField}, LCP ${lcpField}`
    } else {
      fieldData = 'Field Data: Insufficient real user data (low site traffic)'
    }
    console.log(`👥 English Field Data: ${fieldData}`);
  }
  
  return { labData, fieldData }
}

function getCategoryText(category: string, locale: string = 'ko'): string {
  if (locale === 'ko') {
    switch (category) {
      case 'FAST': return '빠름'
      case 'AVERAGE': return '보통'
      case 'SLOW': return '느림'
      default: return category
    }
  } else {
    switch (category) {
      case 'FAST': return 'Fast'
      case 'AVERAGE': return 'Average'
      case 'SLOW': return 'Slow'
      default: return category
    }
  }
}

// PageSpeed 결과를 SEO 카테고리로 변환
export function convertPageSpeedToSEOCategory(
  result: PageSpeedResult, 
  type: 'performance' | 'mobile',
  locale: string = 'ko'
): SEOCategory {
  console.log(`🌍 PageSpeed analyzer received locale: ${locale}`);
  if (type === 'performance') {
    let score = result.labData.performance.score
    let status: 'good' | 'warning' | 'danger' = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'danger'
    let primaryDataSource = 'Lab Data'
    
    // Field Data가 있고 빠른 경우 우선 사용
    if (result.hasFieldData && result.fieldData?.overallCategory) {
      console.log('🏆 Field Data 우선 사용:', result.fieldData.overallCategory)
      
      if (result.fieldData.overallCategory === 'FAST') {
        score = 95
        status = 'good'
        primaryDataSource = locale === 'ko' ? 'Field Data (실제 사용자)' : 'Field Data (Real Users)'
      } else if (result.fieldData.overallCategory === 'AVERAGE') {
        score = 75
        status = 'warning'
        primaryDataSource = locale === 'ko' ? 'Field Data (실제 사용자)' : 'Field Data (Real Users)'
      } else if (result.fieldData.overallCategory === 'SLOW') {
        score = 50
        status = 'danger'
        primaryDataSource = locale === 'ko' ? 'Field Data (실제 사용자)' : 'Field Data (Real Users)'
      }
    }
    
    const { labData, fieldData } = formatMetrics(result, locale)
    
    // PageSpeed 데이터 여부 확인
    const isPageSpeedData = result.analysisType === 'pagespeed'
    
    return {
      id: 'speed',
      name: locale === 'ko' ? 
        (isPageSpeedData ? '사이트 속도 (PageSpeed 측정)' : '사이트 속도 (간단 측정)') :
        (isPageSpeedData ? 'Site Speed (PageSpeed Analysis)' : 'Site Speed (Simple Analysis)'),
      status,
      score,
      description: locale === 'ko' ? 
        (score >= 80 
          ? `사이트가 빨라요! 고객들이 기다리지 않고 바로 볼 수 있어요. ${result.hasFieldData ? '(실제 사용자 기준)' : ''}`
          : score >= 60 
          ? `속도가 보통이에요. 조금 더 빠르게 만들면 고객들이 더 좋아할 거예요. ${result.hasFieldData ? '(실제 사용자 기준)' : ''}`
          : `사이트가 느려요. 고객들이 기다리다가 떠날 수 있어요. ${result.hasFieldData ? '(실제 사용자 기준)' : ''}`) :
        (score >= 80 
          ? `Site is fast! Visitors can view it immediately without waiting. ${result.hasFieldData ? '(Based on real user data)' : ''}`
          : score >= 60 
          ? `Site speed is average. Making it faster would improve visitor satisfaction. ${result.hasFieldData ? '(Based on real user data)' : ''}`
          : `Site is slow. Visitors may leave due to waiting. ${result.hasFieldData ? '(Based on real user data)' : ''}`),
      suggestions: (() => {
        const suggestions = [
          result.hasFieldData ? (locale === 'ko' ? `🎯 ${primaryDataSource} 기준 점수 사용` : `🎯 Use ${primaryDataSource} based scoring`) : '',
          ...result.improvements,
          isPageSpeedData ? `📊 ${labData}` : '',
          isPageSpeedData ? `👥 ${fieldData}` : '',
          result.hasFieldData ? 
            (locale === 'ko' ? '✅ 실제 사용자 데이터 기반 분석 (신뢰도 높음)' : '✅ Real user data based analysis (high reliability)') : 
            (locale === 'ko' ? '⚠️ 참고용 - 실제 사용자 데이터 부족' : '⚠️ Reference only - Insufficient real user data')
        ].filter(Boolean);
        console.log(`💡 Generated suggestions for locale ${locale}:`, suggestions);
        return suggestions;
      })()
    }
  } else {
    // 모바일 친화도
    const accessibilityScore = result.labData.accessibility.score
    const status = accessibilityScore >= 80 ? 'good' : accessibilityScore >= 60 ? 'warning' : 'danger'
    
    return {
      id: 'mobile',
      name: locale === 'ko' ? '모바일 친화도' : 'Mobile Friendliness',
      status,
      score: accessibilityScore,
      description: locale === 'ko' ? 
        (accessibilityScore >= 80 
          ? '모바일에서 보기 편해요! 핸드폰 사용자들이 쉽게 이용할 수 있어요.'
          : accessibilityScore >= 60 
          ? '모바일에서 봐도 괜찮아요. 조금 더 개선하면 더 좋을 거예요.'
          : '모바일에서 보기 어려울 수 있어요. 핸드폰 사용자를 위해 개선이 필요해요.') :
        (accessibilityScore >= 80 
          ? 'Easy to view on mobile! Mobile users can use it easily.'
          : accessibilityScore >= 60 
          ? 'Acceptable on mobile. Further improvement would be better.'
          : 'May be difficult to view on mobile. Improvement needed for mobile users.'),
      suggestions: accessibilityScore >= 80 
        ? [
            'seoAnalyzer.categories.mobile.suggestions.optimizationGood',
            'seoAnalyzer.categories.mobile.suggestions.maintainState'
          ]
        : [
            'seoAnalyzer.categories.mobile.suggestions.makeButtonsEasy',
            'seoAnalyzer.categories.mobile.suggestions.adjustTextSize',
            'seoAnalyzer.categories.mobile.suggestions.adjustScreenSize'
          ]
    }
  }
}

// PageSpeed 분석 실패 시 대체 카테고리 생성
export function createFallbackSpeedAnalysis(locale: string = 'ko'): SEOCategory {
  if (locale === 'ko') {
    return {
      id: 'speed',
      name: '사이트 속도',
      status: 'warning',
      score: 70,
      description: '사이트 속도를 정확히 측정할 수 없었어요. 일반적인 개선 방법을 알려드릴게요.',
      suggestions: [
        'seoAnalyzer.categories.speed.suggestions.optimizeImages',
        'seoAnalyzer.categories.speed.suggestions.removeUnusedPlugins',
        'seoAnalyzer.categories.speed.suggestions.configureCache',
        'seoAnalyzer.categories.speed.suggestions.checkHosting'
      ]
    }
  } else {
    return {
      id: 'speed',
      name: 'Site Speed',
      status: 'warning',
      score: 70,
      description: 'Could not accurately measure site speed. Here are general improvement methods.',
      suggestions: [
        'seoAnalyzer.categories.speed.suggestions.optimizeImages',
        'seoAnalyzer.categories.speed.suggestions.removeUnusedPlugins',
        'seoAnalyzer.categories.speed.suggestions.configureCache',
        'seoAnalyzer.categories.speed.suggestions.checkHosting'
      ]
    }
  }
}

export function createFallbackMobileAnalysis(pageData: any, locale: string = 'ko'): SEOCategory {
  const hasViewport = pageData.viewport && pageData.viewport.length > 0
  const score = hasViewport ? 70 : 50
  const status = hasViewport ? 'warning' : 'danger'
  
  if (locale === 'ko') {
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
            'seoAnalyzer.categories.mobile.suggestions.makeButtonsEasy',
            'seoAnalyzer.categories.mobile.suggestions.adjustTextSize'
          ]
        : [
            'seoAnalyzer.categories.mobile.suggestions.setViewport',
            'seoAnalyzer.categories.mobile.suggestions.applyResponsive'
          ]
    }
  } else {
    return {
      id: 'mobile',
      name: 'Mobile Friendliness',
      status,
      score,
      description: hasViewport 
        ? 'Mobile settings exist. Further optimization would be better.'
        : 'Mobile settings may be insufficient. Check settings for better mobile display.',
      suggestions: hasViewport 
        ? [
            'seoAnalyzer.categories.mobile.suggestions.makeButtonsEasy',
            'seoAnalyzer.categories.mobile.suggestions.adjustTextSize'
          ]
        : [
            'seoAnalyzer.categories.mobile.suggestions.setViewport',
            'seoAnalyzer.categories.mobile.suggestions.applyResponsive'
          ]
    }
  }
}