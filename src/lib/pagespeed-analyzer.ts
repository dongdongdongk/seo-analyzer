// Google PageSpeed Insights API를 사용한 성능 분석
// Lighthouse보다 안정적이고 관리가 쉬운 방법

import { SEOCategory } from '@/types/analysis'

// Translation utility that loads messages dynamically
let cachedMessages: Record<string, any> = {}

async function getMessages(locale: string = 'ko') {
  if (!cachedMessages[locale]) {
    try {
      // Dynamic import of messages based on locale
      if (locale === 'en') {
        const messages = await import('../../messages/en.json')
        cachedMessages[locale] = messages.default || messages
      } else {
        const messages = await import('../../messages/ko.json')
        cachedMessages[locale] = messages.default || messages
      }
    } catch (error) {
      // Fallback to empty object if translation loading fails
      cachedMessages[locale] = {}
    }
  }
  return cachedMessages[locale]
}

// Translation function that mimics next-intl behavior
function createTranslationFunction(messages: any, namespace: string) {
  return (key: string, params?: Record<string, any>) => {
    const keys = key.split('.')
    let value = messages[namespace]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    if (typeof value === 'string' && params) {
      // Simple parameter replacement
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match
      })
    }
    
    return value || key
  }
}

// 개선사항 생성 함수
async function generateImprovements(lhr: any, locale: string): Promise<string[]> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  const improvements: string[] = []
  
  if (lhr.audits['largest-contentful-paint'] && lhr.audits['largest-contentful-paint'].score < 0.9) {
    improvements.push(t('pageSpeed.improvements.optimizeImages'))
    improvements.push(t('pageSpeed.improvements.lazyLoading'))
  }
  if (lhr.audits['unused-css-rules'] && lhr.audits['unused-css-rules'].score < 0.9) {
    improvements.push(t('pageSpeed.improvements.removeUnusedCSS'))
  }
  if (lhr.audits['unused-javascript'] && lhr.audits['unused-javascript'].score < 0.9) {
    improvements.push(t('pageSpeed.improvements.removeUnusedJS'))
  }
  if (lhr.audits['server-response-time'] && lhr.audits['server-response-time'].score < 0.9) {
    improvements.push(t('pageSpeed.improvements.improveServerResponse'))
  }
  if (lhr.audits['render-blocking-resources'] && lhr.audits['render-blocking-resources'].score < 0.9) {
    improvements.push(t('pageSpeed.improvements.removeRenderBlocking'))
  }
  
  return improvements
}

// 간단한 분석용 개선사항
async function getSimpleImprovements(locale: string): Promise<string[]> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  return [
    t('pageSpeed.improvements.compressImages'),
    t('pageSpeed.improvements.checkCache'),
    t('pageSpeed.improvements.checkHosting')
  ]
}

// 에러 상황용 개선사항
export async function getErrorImprovements(locale: string): Promise<string[]> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  return [
    t('pageSpeed.improvements.checkNetwork'),
    t('pageSpeed.improvements.basicOptimization')
  ]
}

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
export async function runPageSpeedAnalysis(url: string, locale: string = 'ko'): Promise<PageSpeedResult> {
  try {
    console.log('🚀 PageSpeed Insights API 분석 시작:', url)
    
    // PageSpeed Insights API 호출
    const apiKey = process.env.PAGESPEED_API_KEY
    if (!apiKey) {
      console.warn('⚠️ PageSpeed API Key가 없습니다. 간단한 분석으로 대체합니다.')
      return await runSimplePerformanceAnalysis(url, locale)
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
    
    // 개선 방법 추출 (번역 키 사용)
    const improvements = await generateImprovements(lhr, locale)
    
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
    return await runSimplePerformanceAnalysis(url, locale)
  }
}

// 간단한 성능 분석 (PageSpeed API 대체)
async function runSimplePerformanceAnalysis(url: string, locale: string = 'ko'): Promise<PageSpeedResult> {
  try {
    console.log('📊 간단한 성능 분석 시작:', url)
    
    // 간단한 응답 시간 측정
    const startTime = Date.now()
    await fetch(url, {
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
      improvements: await getSimpleImprovements(locale)
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
      improvements: await getErrorImprovements(locale)
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
async function formatMetrics(result: PageSpeedResult, locale: string = 'ko'): Promise<{ labData: string, fieldData: string }> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  const labMetrics = result.labData.performance.metrics
  const fcp = Math.round(labMetrics.firstContentfulPaint)
  const lcp = Math.round(labMetrics.largestContentfulPaint)
  const cls = labMetrics.cumulativeLayoutShift.toFixed(3)
  const tbt = Math.round(labMetrics.totalBlockingTime)
  
  const labData = t('pageSpeed.labData', { fcp, lcp, cls, tbt })
  console.log(`🧪 Lab Data (${locale}): ${labData}`);
  
  let fieldData: string
  if (result.fieldData && result.hasFieldData) {
    const fd = result.fieldData
    const fcpField = fd.firstContentfulPaint ? `${fd.firstContentfulPaint.percentile}ms (${await getCategoryText(fd.firstContentfulPaint.category, locale)})` : 'N/A'
    const lcpField = fd.largestContentfulPaint ? `${fd.largestContentfulPaint.percentile}ms (${await getCategoryText(fd.largestContentfulPaint.category, locale)})` : 'N/A'
    fieldData = t('pageSpeed.fieldData', { fcpField, lcpField })
  } else {
    fieldData = t('pageSpeed.fieldDataInsufficient')
  }
  console.log(`👥 Field Data (${locale}): ${fieldData}`);
  
  return { labData, fieldData }
}

async function getCategoryText(category: string, locale: string = 'ko'): Promise<string> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  switch (category) {
    case 'FAST': return t('pageSpeed.categories.fast')
    case 'AVERAGE': return t('pageSpeed.categories.average')
    case 'SLOW': return t('pageSpeed.categories.slow')
    default: return category
  }
}

// PageSpeed 결과를 SEO 카테고리로 변환
export async function convertPageSpeedToSEOCategory(
  result: PageSpeedResult, 
  type: 'performance' | 'mobile',
  locale: string = 'ko'
): Promise<SEOCategory> {
  console.log(`🌍 PageSpeed analyzer received locale: ${locale}`);
  
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
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
        primaryDataSource = t('pageSpeed.analysis.dataSource.fieldDataReal')
      } else if (result.fieldData.overallCategory === 'AVERAGE') {
        score = 75
        status = 'warning'
        primaryDataSource = t('pageSpeed.analysis.dataSource.fieldDataReal')
      } else if (result.fieldData.overallCategory === 'SLOW') {
        score = 50
        status = 'danger'
        primaryDataSource = t('pageSpeed.analysis.dataSource.fieldDataReal')
      }
    }
    
    const { labData, fieldData } = await formatMetrics(result, locale)
    
    // PageSpeed 데이터 여부 확인
    const isPageSpeedData = result.analysisType === 'pagespeed'
    
    return {
      id: 'speed',
      name: isPageSpeedData ? t('pageSpeed.analysis.name.speedPageSpeed') : t('pageSpeed.analysis.name.speedSimple'),
      status,
      score,
      description: (() => {
        const baseDesc = score >= 80 ? t('pageSpeed.analysis.description.speedGood') :
                        score >= 60 ? t('pageSpeed.analysis.description.speedAverage') :
                        t('pageSpeed.analysis.description.speedPoor')
        const fieldDataSuffix = result.hasFieldData ? t('pageSpeed.analysis.description.withFieldData') : t('pageSpeed.analysis.description.withoutFieldData')
        return baseDesc + fieldDataSuffix
      })(),
      suggestions: (() => {
        const suggestions = [
          result.hasFieldData ? t('pageSpeed.analysis.suggestions.fieldDataScoring', { source: primaryDataSource }) : '',
          ...result.improvements,
          isPageSpeedData ? `📊 ${labData}` : '',
          isPageSpeedData ? `👥 ${fieldData}` : '',
          result.hasFieldData ? 
            t('pageSpeed.analysis.suggestions.realUserAnalysis') : 
            t('pageSpeed.analysis.suggestions.referenceOnly')
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
      name: t('pageSpeed.analysis.name.mobile'),
      status,
      score: accessibilityScore,
      description: accessibilityScore >= 80 ? t('pageSpeed.analysis.description.mobileGood') :
                   accessibilityScore >= 60 ? t('pageSpeed.analysis.description.mobileAverage') :
                   t('pageSpeed.analysis.description.mobilePoor'),
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
export async function createFallbackSpeedAnalysis(locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  return {
    id: 'speed',
    name: t('pageSpeed.analysis.name.speedSimple'),
    status: 'warning',
    score: 70,
    description: t('pageSpeed.fallback.speed.description'),
    suggestions: [
      'seoAnalyzer.categories.speed.suggestions.optimizeImages',
      'seoAnalyzer.categories.speed.suggestions.removeUnusedPlugins',
      'seoAnalyzer.categories.speed.suggestions.configureCache',
      'seoAnalyzer.categories.speed.suggestions.checkHosting'
    ]
  }
}

export async function createFallbackMobileAnalysis(pageData: any, locale: string = 'ko'): Promise<SEOCategory> {
  const hasViewport = pageData.viewport && pageData.viewport.length > 0
  const score = hasViewport ? 70 : 50
  const status = hasViewport ? 'warning' : 'danger'
  
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'faq')
  
  return {
    id: 'mobile',
    name: t('pageSpeed.analysis.name.mobile'),
    status,
    score,
    description: hasViewport 
      ? t('pageSpeed.fallback.mobile.descriptionWithViewport')
      : t('pageSpeed.fallback.mobile.descriptionWithoutViewport'),
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