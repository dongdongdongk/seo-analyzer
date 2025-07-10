import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

// Lighthouse 분석 결과 타입
interface LighthouseResult {
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
  mobile: {
    score: number
    issues: string[]
  }
}

// Lighthouse 설정
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1600,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
    },
  },
}

// Chrome 브라우저 실행 및 Lighthouse 분석
export async function runLighthouseAnalysis(url: string): Promise<LighthouseResult> {
  let chrome: any = null
  
  try {
    // Chrome 브라우저 실행
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // 이미지 로딩 비활성화로 속도 향상
        '--disable-javascript', // JS 실행 비활성화로 안정성 향상
      ],
    })

    // Lighthouse 분석 실행
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
    }, {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'mobile' as any,
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        },
      },
    })

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse 분석 결과를 가져올 수 없습니다.')
    }

    const lhr = runnerResult.lhr

    // 결과 파싱
    const result: LighthouseResult = {
      performance: {
        score: Math.round((lhr.categories.performance?.score || 0) * 100),
        metrics: {
          firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue || 0,
          largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue || 0,
          totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
          cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
          speedIndex: lhr.audits['speed-index']?.numericValue || 0,
        },
      },
      accessibility: {
        score: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        issues: extractAccessibilityIssues(lhr),
      },
      bestPractices: {
        score: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        issues: extractBestPracticesIssues(lhr),
      },
      seo: {
        score: Math.round((lhr.categories.seo?.score || 0) * 100),
        issues: extractSEOIssues(lhr),
      },
      mobile: {
        score: calculateMobileScore(lhr),
        issues: extractMobileIssues(lhr),
      },
    }

    return result
  } catch (error) {
    console.error('Lighthouse 분석 오류:', error)
    throw new Error('성능 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    if (chrome) {
      await chrome.kill()
    }
  }
}

// 접근성 이슈 추출
function extractAccessibilityIssues(lhr: any): string[] {
  const issues: string[] = []
  
  if (lhr.audits['color-contrast']?.score < 1) {
    issues.push('텍스트와 배경 색상의 대비가 부족합니다')
  }
  
  if (lhr.audits['image-alt']?.score < 1) {
    issues.push('이미지에 대체 텍스트가 누락되었습니다')
  }
  
  if (lhr.audits['heading-order']?.score < 1) {
    issues.push('제목 태그의 순서가 올바르지 않습니다')
  }
  
  if (lhr.audits['link-name']?.score < 1) {
    issues.push('링크에 설명이 부족합니다')
  }
  
  return issues
}

// 모범 사례 이슈 추출
function extractBestPracticesIssues(lhr: any): string[] {
  const issues: string[] = []
  
  if (lhr.audits['is-on-https']?.score < 1) {
    issues.push('HTTPS를 사용하지 않고 있습니다')
  }
  
  if (lhr.audits['no-vulnerable-libraries']?.score < 1) {
    issues.push('보안 취약점이 있는 라이브러리를 사용하고 있습니다')
  }
  
  if (lhr.audits['charset']?.score < 1) {
    issues.push('문자 인코딩이 설정되지 않았습니다')
  }
  
  return issues
}

// SEO 이슈 추출
function extractSEOIssues(lhr: any): string[] {
  const issues: string[] = []
  
  if (lhr.audits['document-title']?.score < 1) {
    issues.push('페이지 제목이 없습니다')
  }
  
  if (lhr.audits['meta-description']?.score < 1) {
    issues.push('페이지 설명이 없습니다')
  }
  
  if (lhr.audits['viewport']?.score < 1) {
    issues.push('모바일 뷰포트가 설정되지 않았습니다')
  }
  
  if (lhr.audits['hreflang']?.score < 1) {
    issues.push('언어 태그가 설정되지 않았습니다')
  }
  
  return issues
}

// 모바일 이슈 추출
function extractMobileIssues(lhr: any): string[] {
  const issues: string[] = []
  
  if (lhr.audits['viewport']?.score < 1) {
    issues.push('모바일 뷰포트가 설정되지 않았습니다')
  }
  
  if (lhr.audits['tap-targets']?.score < 1) {
    issues.push('터치 대상이 너무 작습니다')
  }
  
  if (lhr.audits['font-size']?.score < 1) {
    issues.push('글자 크기가 모바일에 적합하지 않습니다')
  }
  
  return issues
}

// 모바일 점수 계산
function calculateMobileScore(lhr: any): number {
  const scores = [
    lhr.audits['viewport']?.score || 0,
    lhr.audits['tap-targets']?.score || 0,
    lhr.audits['font-size']?.score || 0,
    lhr.categories.performance?.score || 0,
  ]
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100)
}

// 성능 분석 결과를 초보자 친화적으로 변환
export function convertLighthouseToSEOCategory(result: LighthouseResult, type: 'performance' | 'mobile'): any {
  if (type === 'performance') {
    const score = result.performance.score
    const fcp = result.performance.metrics.firstContentfulPaint
    const lcp = result.performance.metrics.largestContentfulPaint
    
    let status: 'good' | 'warning' | 'danger' = 'danger'
    let description = ''
    const suggestions: string[] = []
    
    if (score >= 90) {
      status = 'good'
      description = '사이트 속도가 매우 빨라요! 고객이 기다리지 않고 바로 볼 수 있습니다.'
      suggestions.push('현재 속도가 매우 우수합니다')
      suggestions.push('고객 경험에 최적화되어 있습니다')
    } else if (score >= 50) {
      status = 'warning'
      description = '사이트 속도가 보통이에요. 조금 더 빠르게 만들 수 있어요.'
      suggestions.push('이미지 크기를 줄여보세요')
      suggestions.push('사용하지 않는 플러그인을 제거해보세요')
      if (lcp > 2500) {
        suggestions.push('가장 큰 이미지나 콘텐츠 로딩 시간을 줄여보세요')
      }
    } else {
      status = 'danger'
      description = '사이트가 느려요. 고객이 기다리다 다른 곳으로 갈 수 있어요.'
      suggestions.push('이미지를 압축해보세요')
      suggestions.push('불필요한 플러그인을 제거해보세요')
      suggestions.push('호스팅 서비스를 업그레이드해보세요')
      if (fcp > 3000) {
        suggestions.push('첫 번째 콘텐츠 로딩 시간을 줄여보세요')
      }
    }
    
    return {
      id: 'speed',
      name: '사이트 속도',
      status,
      score,
      description,
      suggestions
    }
  } else if (type === 'mobile') {
    const score = result.mobile.score
    const issues = result.mobile.issues
    
    let status: 'good' | 'warning' | 'danger' = 'danger'
    let description = ''
    const suggestions: string[] = []
    
    if (score >= 90) {
      status = 'good'
      description = '모바일에서 완벽하게 보여요! 요즘 대부분의 고객이 핸드폰으로 접속하는데 잘 준비되어 있네요.'
      suggestions.push('모바일 최적화가 완벽합니다')
      suggestions.push('터치하기 쉬운 크기로 잘 설정되어 있습니다')
    } else if (score >= 50) {
      status = 'warning'
      description = '모바일에서 괜찮아요. 조금 더 개선하면 완벽할 것 같아요.'
      suggestions.push('모바일 최적화를 조금 더 개선해보세요')
      if (issues.includes('터치 대상이 너무 작습니다')) {
        suggestions.push('버튼 크기를 조금 더 크게 만들어보세요')
      }
      if (issues.includes('글자 크기가 모바일에 적합하지 않습니다')) {
        suggestions.push('글자 크기를 조금 더 크게 만들어보세요')
      }
    } else {
      status = 'danger'
      description = '모바일에서 불편할 수 있어요. 핸드폰으로 보는 고객을 위해 개선해보세요.'
      suggestions.push('모바일 최적화가 필요합니다')
      if (issues.includes('모바일 뷰포트가 설정되지 않았습니다')) {
        suggestions.push('모바일 뷰포트를 설정해보세요')
      }
      if (issues.includes('터치 대상이 너무 작습니다')) {
        suggestions.push('버튼을 터치하기 쉬운 크기로 만들어보세요')
      }
      if (issues.includes('글자 크기가 모바일에 적합하지 않습니다')) {
        suggestions.push('글자를 핸드폰에서 읽기 쉬운 크기로 만들어보세요')
      }
    }
    
    return {
      id: 'mobile',
      name: '모바일 친화도',
      status,
      score,
      description,
      suggestions
    }
  }
}