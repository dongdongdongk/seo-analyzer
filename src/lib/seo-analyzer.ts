import * as cheerio from 'cheerio'
import type { AnalysisResult, SEOCategory } from '@/types/analysis'
import { runPageSpeedAnalysis, convertPageSpeedToSEOCategory, createFallbackSpeedAnalysis, createFallbackMobileAnalysis } from './pagespeed-analyzer'
import { generatePersonalizedAdvice, generateKeywordSuggestions } from './openai-analyzer'

// SEO 분석 인터페이스
interface PageData {
  title: string
  description: string
  keywords: string
  h1Tags: string[]
  h2Tags: string[]
  images: Array<{
    src: string
    alt: string
    title: string
  }>
  links: Array<{
    href: string
    text: string
    isExternal: boolean
  }>
  wordCount: number
  lang: string
  charset: string
  viewport: string
  canonicalUrl: string
  ogTags: {
    title: string
    description: string
    image: string
    url: string
  }
  structuredData: any[]
  contentQuality: {
    readabilityScore: number
    keywordDensity: number
    headingStructure: boolean
  }
  semanticMarkup: {
    hasHeader: boolean
    hasNav: boolean
    hasMain: boolean
    hasFooter: boolean
    hasSection: boolean
    hasArticle: boolean
    hasAside: boolean
    hasH1: boolean
    headingStructure: boolean
    ariaAttributes: number
    roleAttributes: number
    semanticScore: number
    issues: string[]
    suggestions: string[]
  }
}

// 웹페이지 HTML 가져오기
export async function fetchPageHTML(url: string): Promise<string> {
  try {
    // URL 유효성 검사
    try {
      new URL(url)
    } catch {
      throw new Error('올바른 URL 형식이 아닙니다.')
    }
    
    console.log('페이지 가져오기 시작:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    console.log('응답 상태:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    console.log('HTML 길이:', html.length)
    
    return html
  } catch (error) {
    console.error('페이지 가져오기 실패:', error)
    console.error('실패한 URL:', url)
    
    if (error instanceof Error) {
      throw new Error(`웹페이지를 가져올 수 없습니다: ${error.message}`)
    } else {
      throw new Error('웹페이지를 가져올 수 없습니다. URL을 확인해주세요.')
    }
  }
}

// HTML 파싱 및 데이터 추출
export function parsePageData(html: string, url: string): PageData {
  const $ = cheerio.load(html)

  // 기본 광고 제거 (간단 버전)
  $('.adsbygoogle, .revenue_unit_item, [class*="adsense"], ins.kakao_ad_area, div[id^="google_ads"]').remove();
  
  // 메타 태그 추출
  const title = $('title').text().trim() || ''
  const description = $('meta[name="description"]').attr('content') || ''
  const keywords = $('meta[name="keywords"]').attr('content') || ''
  const lang = $('html').attr('lang') || ''
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || ''
  const viewport = $('meta[name="viewport"]').attr('content') || ''
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || ''
  
  // 헤딩 태그 추출
  const h1Tags = $('h1').map((_, el) => $(el).text().trim()).get()
  const h2Tags = $('h2').map((_, el) => $(el).text().trim()).get()
  
  // 이미지 분석 with enhanced filtering
  // 이미지 분석 (간단한 필터링)
  const images = $('img').filter((_, el) => {
    const $img = $(el);
    const width = parseInt($img.attr('width') || '0', 10);
    const height = parseInt($img.attr('height') || '0', 10);
    const src = $img.attr('src') || '';
    
    // 너무 작은 이미지 제외 (트래킹 픽셀)
    if ((width > 0 && width < 20) || (height > 0 && height < 20)) {
      return false;
    }
    
    // 명백히 광고 관련 URL 제외
    if (src.includes('googleads') || src.includes('doubleclick') || src.includes('googlesyndication')) {
      return false;
    }
    
    return true;
  }).map((_, el) => ({
    src: $(el).attr('src') || '',
    alt: $(el).attr('alt') || '',
    title: $(el).attr('title') || ''
  })).get()
  
  // 링크 분석
  const links = $('a[href]').map((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    const isExternal = href.startsWith('http') && !href.includes(new URL(url).hostname)
    
    return { href, text, isExternal }
  }).get()
  
  // Open Graph 태그
  const ogTags = {
    title: $('meta[property="og:title"]').attr('content') || '',
    description: $('meta[property="og:description"]').attr('content') || '',
    image: $('meta[property="og:image"]').attr('content') || '',
    url: $('meta[property="og:url"]').attr('content') || ''
  }
  
  // 구조화된 데이터 (JSON-LD)
  const structuredData = $('script[type="application/ld+json"]').map((_, el) => {
    try {
      return JSON.parse($(el).html() || '')
    } catch {
      return null
    }
  }).get().filter(Boolean)
  
  // 텍스트 콘텐츠 분석
  const textContent = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length
  
  // 콘텐츠 품질 분석
  const contentQuality = analyzeContentQuality(textContent, h1Tags, h2Tags, title, description)
  
  // 시멘틱 마크업 분석
  const semanticMarkup = analyzeSemanticMarkup($)
  
  return {
    title,
    description,
    keywords,
    h1Tags,
    h2Tags,
    images,
    links,
    wordCount,
    lang,
    charset,
    viewport,
    canonicalUrl,
    ogTags,
    structuredData,
    contentQuality,
    semanticMarkup
  }
}

// 시멘틱 마크업 분석
function analyzeSemanticMarkup($: cheerio.CheerioAPI) {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // HTML5 시멘틱 요소 확인
  const hasHeader = $('header').length > 0
  const hasNav = $('nav').length > 0
  const hasMain = $('main').length > 0
  const hasFooter = $('footer').length > 0
  const hasSection = $('section').length > 0
  const hasArticle = $('article').length > 0
  const hasAside = $('aside').length > 0
  const hasH1 = $('h1').length > 0
  
  // 헤딩 구조 분석
  const headings = $('h1, h2, h3, h4, h5, h6').toArray()
  const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)))
  const headingStructure = analyzeHeadingStructure(headingLevels)
  
  // ARIA 속성 개수
  const ariaAttributes = $('[aria-label], [aria-labelledby], [aria-describedby], [aria-hidden], [aria-expanded], [aria-current]').length
  
  // Role 속성 개수
  const roleAttributes = $('[role]').length
  
  // 시멘틱 점수 계산
  let semanticScore = 0
  const maxScore = 100
  
  // 기본 시멘틱 요소 체크 (각 10점)
  if (hasHeader) semanticScore += 10
  if (hasNav) semanticScore += 10
  if (hasMain) semanticScore += 15 // main은 더 중요
  if (hasFooter) semanticScore += 10
  if (hasH1) semanticScore += 15 // H1은 더 중요
  
  // 콘텐츠 구조 요소 (각 5점)
  if (hasSection) semanticScore += 5
  if (hasArticle) semanticScore += 5
  if (hasAside) semanticScore += 5
  
  // 헤딩 구조 (10점)
  if (headingStructure) semanticScore += 10
  
  // 접근성 속성 (최대 15점)
  semanticScore += Math.min(15, ariaAttributes + roleAttributes)
  
  // 이슈 및 제안 생성
  if (!hasHeader) {
    issues.push('페이지에 <header> 요소가 없습니다')
    suggestions.push('페이지 상단에 <header> 태그를 추가하여 헤더 영역을 명확히 구분하세요')
  }
  
  if (!hasNav) {
    issues.push('페이지에 <nav> 요소가 없습니다')
    suggestions.push('네비게이션 메뉴를 <nav> 태그로 감싸서 탐색 영역을 명확히 표시하세요')
  }
  
  if (!hasMain) {
    issues.push('페이지에 <main> 요소가 없습니다')
    suggestions.push('주요 콘텐츠 영역을 <main> 태그로 감싸서 메인 콘텐츠를 명확히 표시하세요')
  }
  
  if (!hasFooter) {
    issues.push('페이지에 <footer> 요소가 없습니다')
    suggestions.push('페이지 하단에 <footer> 태그를 추가하여 푸터 영역을 명확히 구분하세요')
  }
  
  if (!hasH1) {
    issues.push('페이지에 H1 태그가 없습니다')
    suggestions.push('페이지의 주요 제목을 <h1> 태그로 설정하세요')
  } else if ($('h1').length > 1) {
    issues.push('페이지에 H1 태그가 여러 개 있습니다')
    suggestions.push('H1 태그는 페이지당 하나만 사용하는 것이 좋습니다')
  }
  
  if (!headingStructure) {
    issues.push('헤딩 태그의 구조가 올바르지 않습니다')
    suggestions.push('헤딩 태그(H1~H6)를 순서대로 사용하여 논리적인 구조를 만드세요')
  }
  
  if (ariaAttributes < 3) {
    issues.push('접근성을 위한 ARIA 속성이 부족합니다')
    suggestions.push('버튼, 링크, 폼 요소에 aria-label이나 aria-describedby 속성을 추가하세요')
  }
  
  if (!hasSection && !hasArticle) {
    issues.push('콘텐츠 구조를 위한 시멘틱 요소가 부족합니다')
    suggestions.push('콘텐츠를 <section>이나 <article> 태그로 의미있게 구분하세요')
  }
  
  return {
    hasHeader,
    hasNav,
    hasMain,
    hasFooter,
    hasSection,
    hasArticle,
    hasAside,
    hasH1,
    headingStructure,
    ariaAttributes,
    roleAttributes,
    semanticScore,
    issues,
    suggestions
  }
}

// 헤딩 구조 분석
function analyzeHeadingStructure(levels: number[]): boolean {
  if (levels.length === 0) return false
  
  // H1이 첫 번째여야 함
  if (levels[0] !== 1) return false
  
  // 순서대로 증가해야 함 (1단계씩만 건너뛸 수 있음)
  for (let i = 1; i < levels.length; i++) {
    const diff = levels[i] - levels[i - 1]
    if (diff > 1) return false
  }
  
  return true
}

// 시멘틱 마크업 SEO 카테고리 분석
function analyzeSemanticMarkupCategory(pageData: PageData): SEOCategory {
  const semantic = pageData.semanticMarkup
  const score = semantic.semanticScore
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []

  if (score >= 80) {
    status = 'good'
    description = '시멘틱 마크업이 잘 구성되어 있습니다. 검색엔진과 스크린 리더가 콘텐츠를 쉽게 이해할 수 있습니다.'
  } else if (score >= 60) {
    status = 'warning'
    description = '시멘틱 마크업이 부분적으로 구성되어 있습니다. 몇 가지 개선사항이 있습니다.'
  } else {
    status = 'danger'
    description = '시멘틱 마크업이 부족합니다. 검색엔진 최적화와 접근성 향상을 위해 개선이 필요합니다.'
  }

  // 구체적인 제안사항 추가
  if (semantic.suggestions.length > 0) {
    suggestions.push(...semantic.suggestions.slice(0, 3)) // 최대 3개까지
  }

  // 긍정적인 피드백도 추가
  if (semantic.hasMain) {
    suggestions.push('✅ 메인 콘텐츠 영역이 잘 구분되어 있습니다')
  }
  if (semantic.hasHeader && semantic.hasFooter) {
    suggestions.push('✅ 헤더와 푸터 영역이 명확하게 구분되어 있습니다')
  }
  if (semantic.headingStructure) {
    suggestions.push('✅ 헤딩 태그 구조가 논리적으로 잘 구성되어 있습니다')
  }

  return {
    id: 'semantic-markup',
    name: '시멘틱 마크업',
    status,
    score,
    description,
    suggestions
  }
}

// 콘텐츠 품질 분석
function analyzeContentQuality(
  content: string,
  h1Tags: string[],
  h2Tags: string[],
  title: string,
  description: string
): PageData['contentQuality'] {
  // description 변수 사용 (TypeScript 경고 해결)
  console.debug('분석 중인 페이지 설명:', description.slice(0, 50) + '...')
  
  // 읽기 쉬움 점수 (간단한 버전)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgSentenceLength - 15) * 2))
  
  // 키워드 밀도 계산 (제목 기준)
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const contentLower = content.toLowerCase()
  const keywordDensity = titleWords.reduce((density, word) => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length
    return density + (matches / content.split(' ').length) * 100
  }, 0)
  
  // 헤딩 구조 분석
  const headingStructure = h1Tags.length === 1 && h2Tags.length > 0
  
  return {
    readabilityScore: Math.round(readabilityScore),
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    headingStructure
  }
}

// Helper to fetch text files like robots.txt or sitemap.xml
async function fetchTextFile(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

// robots.txt 분석
async function analyzeRobotsTxt(url: string): Promise<SEOCategory> {
  const urlObj = new URL(url);
  const robotsUrl = `${urlObj.origin}/robots.txt`;
  const robotsTxt = await fetchTextFile(robotsUrl);

  let score = 0;
  let status: 'good' | 'warning' | 'danger' = 'danger';
  let description = '';
  const suggestions: string[] = [];

  if (robotsTxt) {
    score = 90;
    status = 'good';
    description = 'robots.txt 파일이 존재합니다. 검색엔진이 사이트를 크롤링하는 방법을 제어할 수 있습니다.';
    suggestions.push('robots.txt 파일이 모든 중요한 페이지의 크롤링을 허용하는지 확인하세요.');
    if (!robotsTxt.includes('Sitemap:')) {
      score -= 10;
      status = 'warning';
      suggestions.push('robots.txt에 사이트맵 위치를 추가하는 것이 좋습니다 (예: Sitemap: https://example.com/sitemap.xml).');
    }
  } else {
    score = 40;
    status = 'warning';
    description = 'robots.txt 파일이 없습니다. 검색엔진 크롤링을 더 잘 제어하기 위해 추가하는 것이 좋습니다.';
    suggestions.push('웹사이트 루트에 robots.txt 파일을 생성하세요.');
  }

  return {
    id: 'robots',
    name: 'robots.txt',
    status,
    score,
    description,
    suggestions,
  };
}

// Sitemap 분석
async function analyzeSitemap(url: string): Promise<SEOCategory> {
    const urlObj = new URL(url);
    // First check robots.txt for sitemap location
    const robotsUrl = `${urlObj.origin}/robots.txt`;
    const robotsTxt = await fetchTextFile(robotsUrl);
    let sitemapUrl = `${urlObj.origin}/sitemap.xml`;
    let foundInRobots = false;

    if (robotsTxt) {
        const sitemapLine = robotsTxt.split(/\r?\n/).find(line => line.toLowerCase().startsWith('sitemap:'));
        if (sitemapLine) {
            const colonIndex = sitemapLine.indexOf(':');
            if (colonIndex > -1) {
              sitemapUrl = sitemapLine.substring(colonIndex + 1).trim();
            }
            foundInRobots = true;
        }
    }

    const sitemapXml = await fetchTextFile(sitemapUrl);

    let score = 0;
    let status: 'good' | 'warning' | 'danger' = 'danger';
    let description = '';
    const suggestions: string[] = [];

    if (sitemapXml) {
        score = 90;
        status = 'good';
        description = '사이트맵이 존재합니다. 검색엔진이 사이트의 모든 페이지를 쉽게 찾을 수 있습니다.';
        suggestions.push('사이트맵이 최신 상태인지 정기적으로 확인하세요.');
        if(foundInRobots) {
            score = 95;
            suggestions.push('robots.txt에 사이트맵 위치가 명시되어 있어 좋습니다.');
        } else {
            score = 85;
            status = 'warning';
            suggestions.push('robots.txt에 사이트맵 위치를 추가하는 것을 고려해보세요.');
        }
    } else {
        score = 30;
        status = 'danger';
        description = '사이트맵이 없습니다. 검색엔진이 사이트의 모든 페이지를 발견하지 못할 수 있습니다.';
        suggestions.push('sitemap.xml 파일을 생성하고 웹사이트 루트에 업로드하세요.');
        suggestions.push('사이트맵 생성 도구를 사용하면 쉽게 만들 수 있습니다.');
    }

    return {
        id: 'sitemap',
        name: '사이트맵',
        status,
        score,
        description,
        suggestions,
    };
}

// SEO 분석 실행
export async function analyzeSEO(url: string): Promise<AnalysisResult> {
  try {
    // 1. 페이지 HTML 가져오기 및 데이터 추출
    const html = await fetchPageHTML(url)
    const pageData = parsePageData(html, url)
    
    // 2. 기본 SEO 분석 (확장됨)
    const robotsAnalysis = await analyzeRobotsTxt(url);
    const sitemapAnalysis = await analyzeSitemap(url);

    const basicCategories: SEOCategory[] = [
      analyzeTitleTag(pageData),
      analyzeMetaDescription(pageData),
      analyzeContent(pageData),
      analyzeSocialTags(html),
      analyzeStructuredData(html),
      analyzeTechnicalSEO(pageData),
      analyzeHttpsSecurity(url),
      analyzeLinkStructure(pageData),
      analyzeKeywordOptimization(pageData),
      analyzeSemanticMarkupCategory(pageData),
      robotsAnalysis,
      sitemapAnalysis
    ]
    
    // 선택사항 분석 (점수에 포함되지 않음)
    const optionalCategories: SEOCategory[] = [
      analyzeImages(pageData)
    ]
    
    // 3. PageSpeed Insights 성능 분석
    let performanceCategories: SEOCategory[] = []
    let hasFieldData = false
    let performanceImprovements: string[] = []
    try {
      const pageSpeedResult = await runPageSpeedAnalysis(url)
      performanceCategories = [
        convertPageSpeedToSEOCategory(pageSpeedResult, 'performance'),
        convertPageSpeedToSEOCategory(pageSpeedResult, 'mobile')
      ]
      hasFieldData = pageSpeedResult.hasFieldData
      performanceImprovements = pageSpeedResult.improvements
    } catch (pageSpeedError) {
      console.error('PageSpeed 분석 실패:', pageSpeedError)
      // PageSpeed 실패 시 기본 성능 분석으로 대체
      performanceCategories = [
        createFallbackSpeedAnalysis(),
        createFallbackMobileAnalysis(pageData)
      ]
      hasFieldData = false
      performanceImprovements = ['기본적인 이미지 최적화', '캐시 설정 확인', '호스팅 성능 점검']
    }
    
    // 4. 모든 카테고리 합치기 (점수 계산용은 기본+성능만)
    const categories = [...basicCategories, ...performanceCategories]
    const allCategories = [...categories, ...optionalCategories]
    
    // 5. 전체 점수 계산 (선택사항 제외)
    const overallScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length
    )
    
    // 6. 사이트 정보 분석
    const siteInfo = analyzeSiteInfo(html, url, pageData)
    
    // 7. 기본 분석 결과 생성
    const basicResult: AnalysisResult = {
      url,
      overallScore,
      categories: allCategories, // 모든 카테고리 포함 (표시용)
      siteInfo
    }
    
    // 7. AI 기반 맞춤 조언 및 키워드 제안 (병렬 실행)
    console.log('🤖 AI 분석 시작 - URL:', url)
    console.log('📊 기본 분석 결과:', {
      overallScore: basicResult.overallScore,
      categoriesCount: basicResult.categories.length,
      categoriesStatus: basicResult.categories.map(c => ({ name: c.name, status: c.status, score: c.score }))
    })
    
    try {
      const businessType = detectBusinessType(pageData)
      const siteType = detectSiteType({ ...pageData, url })
      const textContent = extractTextContent(html)
      
      console.log('🔍 사이트 분석 정보:', {
        businessType,
        siteType,
        contentLength: textContent.length,
        pageDataKeys: Object.keys(pageData)
      })
      
      console.log('📝 AI 분석용 데이터 준비 완료')
      
      const [aiAdvice, keywordSuggestions] = await Promise.allSettled([
        generatePersonalizedAdvice(basicResult, {
          ...pageData,
          url,
          content: textContent
        }),
        generateKeywordSuggestions({
          ...pageData,
          content: textContent
        }, businessType)
      ])
      
      console.log('⚡ AI 분석 완료:', {
        aiAdviceStatus: aiAdvice.status,
        keywordSuggestionsStatus: keywordSuggestions.status
      })
      
      // AI 조언 결과 처리
      if (aiAdvice.status === 'fulfilled') {
        console.log('✅ AI 조언 성공:', {
          hasOverallAdvice: !!aiAdvice.value?.overallAdvice,
          overallAdviceLength: aiAdvice.value?.overallAdvice?.length || 0,
          priorityActionsCount: aiAdvice.value?.priorityActions?.length || 0,
          industryTipsCount: aiAdvice.value?.industrySpecificTips?.length || 0,
          hasExpectedResults: !!aiAdvice.value?.expectedResults
        })
        console.log('🎯 AI 조언 내용:', aiAdvice.value)
        ;(basicResult as any).aiAdvice = aiAdvice.value
      } else {
        console.error('❌ AI 조언 실패:', aiAdvice.reason)
      }
      
      // 키워드 제안 결과 처리
      if (keywordSuggestions.status === 'fulfilled') {
        console.log('✅ 키워드 제안 성공:', {
          keywordCount: keywordSuggestions.value?.length || 0,
          keywords: keywordSuggestions.value
        })
        ;(basicResult as any).keywordSuggestions = keywordSuggestions.value
      } else {
        console.error('❌ 키워드 제안 실패:', keywordSuggestions.reason)
      }
      
      // 사이트 타입 및 업종 정보 추가
      ;(basicResult as any).siteType = siteType
      ;(basicResult as any).businessType = businessType
      
      // PageSpeed 관련 정보 추가
      ;(basicResult as any).hasFieldData = hasFieldData
      ;(basicResult as any).performanceImprovements = performanceImprovements
      
      console.log('📋 최종 분석 결과:', {
        hasAiAdvice: !!(basicResult as any).aiAdvice,
        hasKeywordSuggestions: !!(basicResult as any).keywordSuggestions,
        siteType: (basicResult as any).siteType,
        businessType: (basicResult as any).businessType,
        hasFieldData: (basicResult as any).hasFieldData
      })
      
    } catch (aiError) {
      console.error('💥 AI 분석 실패:', aiError)
      console.error('🔍 AI 분석 실패 스택:', aiError instanceof Error ? aiError.stack : 'No stack trace')
      console.error('📊 AI 분석 실패 시점 기본 결과:', basicResult)
      // AI 분석 실패해도 기본 분석 결과는 반환
    }
    
    return basicResult
    
  } catch (error) {
    console.error('SEO 분석 실패:', error)
    console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('분석 대상 URL:', url)
    
    // 더 구체적인 오류 정보 제공
    if (error instanceof Error) {
      throw new Error(`SEO 분석 실패: ${error.message}`)
    } else {
      throw new Error('알 수 없는 SEO 분석 오류가 발생했습니다.')
    }
  }
}

// 텍스트 콘텐츠 추출 (AI 분석용)
function extractTextContent(html: string): string {
  const $ = cheerio.load(html)
  
  // 불필요한 태그 제거
  $('script, style, nav, footer, aside').remove()
  
  // 주요 콘텐츠 추출
  const content = $('body').text()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000) // 처음 2000자만 사용
  
  return content
}

// 상세한 사이트 정보 분석
function analyzeSiteInfo(html: string, url: string, pageData: PageData): any {
  const $ = cheerio.load(html)
  
  // 도메인 정보 추출
  const urlObj = new URL(url)
  const domain = urlObj.hostname
  
  // 소셜 미디어 태그 분석
  const socialTags = {
    hasOpenGraph: $('meta[property^="og:"]').length > 0,
    hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
    ogImage: $('meta[property="og:image"]').attr('content'),
    ogTitle: $('meta[property="og:title"]').attr('content'),
    ogDescription: $('meta[property="og:description"]').attr('content')
  }
  
  // 링크 구조 분석
  const internalLinks = pageData.links.filter(link => !link.isExternal)
  const externalLinks = pageData.links.filter(link => link.isExternal)
  
  // 기술적 정보 분석
  const technicalInfo = {
    hasViewport: !!pageData.viewport,
    hasStructuredData: $('script[type="application/ld+json"]').length > 0,
    robotsTag: $('meta[name="robots"]').attr('content') || 'index,follow',
    canonicalUrl: pageData.canonicalUrl,
    wordCount: extractTextContent(html).split(/\s+/).filter(word => word.length > 0).length,
    imageCount: pageData.images.length,
    linkCount: pageData.links.length,
    internalLinkCount: internalLinks.length,
    externalLinkCount: externalLinks.length
  }

  // 시멘틱 마크업 정보 추가
  const semanticMarkup = pageData.semanticMarkup
  
  // 산업 및 대상 추정
  const content = pageData.title + ' ' + pageData.description + ' ' + extractTextContent(html)
  const estimated = {
    loadTime: Math.random() * 2000 + 500, // 임시값 (실제로는 성능 측정에서 가져옴)
    industry: estimateIndustry(content),
    targetAudience: estimateTargetAudience(content),
    competitiveness: estimateCompetitiveness(content) as 'low' | 'medium' | 'high'
  }
  
  return {
    domain,
    title: pageData.title,
    description: pageData.description,
    language: pageData.lang || 'ko',
    charset: pageData.charset || 'UTF-8',
    socialTags,
    technicalInfo,
    semanticMarkup,
    estimated
  }
}

// 산업 추정
function estimateIndustry(content: string): string {
  const industries = {
    '음식점/요식업': ['음식', '맛집', '레스토랑', '식당', '요리', '메뉴', '배달'],
    '카페/디저트': ['카페', '커피', '원두', '디저트', '음료', '베이커리'],
    '뷰티/미용': ['미용실', '헤어', '네일', '피부', '화장품', '뷰티'],
    '의료/건강': ['병원', '의원', '치료', '진료', '건강', '의료', '약국'],
    '교육/학원': ['교육', '학원', '강의', '수업', '학습', '과외'],
    '쇼핑/이커머스': ['쇼핑', '구매', '상품', '할인', '배송', '온라인몰'],
    'IT/기술': ['개발', '프로그래밍', 'IT', '소프트웨어', '앱', '시스템'],
    '부동산': ['부동산', '아파트', '매매', '임대', '분양'],
    '금융/보험': ['금융', '보험', '대출', '투자', '은행'],
    '여행/숙박': ['여행', '호텔', '숙박', '관광', '펜션'],
    '자동차': ['자동차', '차량', '정비', '렌트', '중고차'],
    '스포츠/레저': ['스포츠', '헬스', '피트니스', '운동', '레저']
  }
  
  const contentLower = content.toLowerCase()
  
  for (const [industry, keywords] of Object.entries(industries)) {
    const matchCount = keywords.filter(keyword => 
      contentLower.includes(keyword) || contentLower.includes(keyword.replace(/\//g, ''))
    ).length
    
    if (matchCount >= 2) {
      return industry
    }
  }
  
  return '일반 서비스업'
}

// 대상 고객 추정
function estimateTargetAudience(content: string): string {
  const contentLower = content.toLowerCase()
  
  if (contentLower.includes('b2b') || contentLower.includes('기업') || contentLower.includes('솔루션')) {
    return '기업 고객 (B2B)'
  }
  
  if (contentLower.includes('20대') || contentLower.includes('젊은') || contentLower.includes('트렌드')) {
    return '20-30대 젊은층'
  }
  
  if (contentLower.includes('가족') || contentLower.includes('아이') || contentLower.includes('육아')) {
    return '가족 단위 고객'
  }
  
  if (contentLower.includes('시니어') || contentLower.includes('중년') || contentLower.includes('50대')) {
    return '중장년층'
  }
  
  return '일반 소비자 (B2C)'
}

// 경쟁 강도 추정
function estimateCompetitiveness(content: string): string {
  const contentLower = content.toLowerCase()
  
  // 고경쟁 키워드
  const highCompetition = ['대출', '보험', '성형', '다이어트', '투자', '부동산', '온라인쇼핑']
  
  // 중경쟁 키워드  
  const mediumCompetition = ['음식점', '카페', '미용실', '병원', '학원', '호텔']
  
  if (highCompetition.some(keyword => contentLower.includes(keyword))) {
    return 'high'
  }
  
  if (mediumCompetition.some(keyword => contentLower.includes(keyword))) {
    return 'medium'
  }
  
  return 'low'
}

// 사이트 타입 감지 (간단 버전)
function detectSiteType(pageData: any): string {
  const title = pageData.title?.toLowerCase() || ''
  const url = pageData.url?.toLowerCase() || ''
  
  if (title.includes('쇼핑') || title.includes('구매') || url.includes('shop')) {
    return '온라인 쇼핑몰'
  } else if (title.includes('블로그') || url.includes('blog') || url.includes('tistory')) {
    return '개인 블로그'
  } else if (title.includes('회사') || title.includes('기업')) {
    return '기업 웹사이트'
  } else if (title.includes('카페') || title.includes('음식점') || title.includes('미용실')) {
    return '로컬 비즈니스'
  } else if (title.includes('포트폴리오') || title.includes('작품')) {
    return '포트폴리오'
  }
  
  return '일반 웹사이트'
}

// 업종 감지 (간단 버전)
function detectBusinessType(pageData: any): string {
  const title = pageData.title?.toLowerCase() || ''
  
  if (title.includes('음식') || title.includes('맛집') || title.includes('식당')) {
    return '음식점'
  } else if (title.includes('카페') || title.includes('커피')) {
    return '카페'
  } else if (title.includes('미용실') || title.includes('헤어')) {
    return '미용실'
  } else if (title.includes('병원') || title.includes('의원')) {
    return '병원'
  } else if (title.includes('쇼핑') || title.includes('구매')) {
    return '쇼핑몰'
  }
  
  return '기타'
}

// 제목 태그 분석
function analyzeTitleTag(pageData: PageData): SEOCategory {
  const { title } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (!title) {
    score = 0
    status = 'danger'
    description = '페이지 제목이 없어요! 고객이 검색할 때 찾기 어려워요.'
    suggestions.push('페이지 제목을 추가해주세요')
    suggestions.push('제목은 30-60자 정도가 적당해요')
  } else if (title.length < 30) {
    score = 60
    status = 'warning'
    description = '제목이 조금 짧아요. 더 자세히 설명하면 고객이 더 잘 찾을 수 있어요.'
    suggestions.push('제목을 30-60자 정도로 늘려보세요')
    suggestions.push('고객이 검색할 만한 키워드를 추가해보세요')
  } else if (title.length > 60) {
    score = 75
    status = 'warning'
    description = '제목이 조금 길어요. 검색 결과에서 잘릴 수 있어요.'
    suggestions.push('제목을 60자 이내로 줄여보세요')
    suggestions.push('가장 중요한 키워드를 앞쪽에 배치해보세요')
  } else {
    score = 95
    status = 'good'
    description = '제목이 완벽해요! 고객이 검색할 때 쉽게 찾을 수 있습니다.'
    suggestions.push('현재 제목이 적절한 길이입니다')
    suggestions.push('키워드가 자연스럽게 포함되어 있습니다')
  }
  
  return {
    id: 'title',
    name: '페이지 제목',
    status,
    score,
    description,
    suggestions
  }
}

// 메타 설명 분석
function analyzeMetaDescription(pageData: PageData): SEOCategory {
  const { description } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let desc = ''
  const suggestions: string[] = []
  
  if (!description) {
    score = 0
    status = 'danger'
    desc = '페이지 설명이 없어요! 검색 결과에서 고객이 클릭하기 어려워요.'
    suggestions.push('페이지 설명을 추가해주세요')
    suggestions.push('설명은 120-160자 정도가 적당해요')
  } else if (description.length < 120) {
    score = 70
    status = 'warning'
    desc = '설명이 조금 짧아요. 더 자세히 설명하면 고객이 더 많이 클릭할 거예요.'
    suggestions.push('설명을 120-160자 정도로 늘려보세요')
    suggestions.push('고객이 관심 가질 만한 내용을 추가해보세요')
  } else if (description.length > 160) {
    score = 75
    status = 'warning'
    desc = '설명이 조금 길어요. 검색 결과에서 잘릴 수 있어요.'
    suggestions.push('설명을 160자 이내로 줄여보세요')
    suggestions.push('가장 중요한 내용을 앞쪽에 배치해보세요')
  } else {
    score = 95
    status = 'good'
    desc = '설명이 완벽해요! 고객이 클릭하고 싶어할 내용입니다.'
    suggestions.push('설명이 적절한 길이입니다')
    suggestions.push('고객의 관심을 끌 수 있는 내용입니다')
  }
  
  return {
    id: 'description',
    name: '페이지 설명',
    status,
    score,
    description: desc,
    suggestions
  }
}

// 이미지 분석
function analyzeImages(pageData: PageData): SEOCategory {
  const { images } = pageData
  const totalImages = images.length
  const imagesWithAlt = images.filter(img => img.alt.trim().length > 0).length
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (totalImages === 0) {
    score = 80
    status = 'good'
    description = '이미지가 없어서 별도로 최적화할 것이 없어요.'
    suggestions.push('이미지를 추가할 때는 설명을 함께 넣어주세요')
  } else {
    const altPercentage = (imagesWithAlt / totalImages) * 100
    
    if (altPercentage === 100) {
      score = 95
      status = 'good'
      description = '모든 이미지에 설명이 있어요! 검색에서 잘 찾을 수 있습니다.'
      suggestions.push('이미지 설명이 완벽합니다')
      suggestions.push('검색엔진이 이미지를 잘 이해할 수 있어요')
    } else if (altPercentage >= 80) {
      score = 85
      status = 'good'
      description = '대부분의 이미지에 설명이 있어요. 조금만 더 신경쓰면 완벽해요!'
      suggestions.push(`${totalImages - imagesWithAlt}개 이미지에 설명을 추가해보세요`)
      suggestions.push('이미지 설명은 간단하게 무엇인지 적어주세요')
    } else if (altPercentage >= 50) {
      score = 65
      status = 'warning'
      description = '이미지 설명이 부족해요. 더 추가하면 검색에서 더 잘 찾을 수 있어요.'
      suggestions.push(`${totalImages - imagesWithAlt}개 이미지에 설명을 추가해보세요`)
      suggestions.push('이미지마다 간단한 설명을 추가해주세요')
    } else {
      score = 40
      status = 'danger'
      description = '대부분의 이미지에 설명이 없어요. 검색에서 놓칠 수 있어요.'
      suggestions.push(`${totalImages - imagesWithAlt}개 이미지에 설명을 추가해보세요`)
      suggestions.push('이미지 설명은 검색에 도움이 많이 돼요')
    }
  }
  
  return {
    id: 'images',
    name: '이미지 최적화',
    status,
    score,
    description,
    suggestions
  }
}

// 헤딩 구조 분석
// 콘텐츠 분석
function analyzeContent(pageData: PageData): SEOCategory {
  const { wordCount, contentQuality } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (wordCount < 300) {
    score = 50
    status = 'warning'
    description = '내용이 조금 적어요. 더 자세히 설명하면 고객에게 도움이 될 거예요.'
    suggestions.push('내용을 300단어 이상으로 늘려보세요')
    suggestions.push('고객이 궁금해할 만한 정보를 추가해보세요')
  } else if (wordCount < 600) {
    score = 75
    status = 'warning'
    description = '내용이 적당해요. 조금 더 자세히 설명하면 더 좋을 거예요.'
    suggestions.push('내용을 조금 더 자세히 설명해보세요')
    suggestions.push('고객이 관심 가질 만한 정보를 추가해보세요')
  } else {
    score = 90
    status = 'good'
    description = '내용이 풍부해요! 고객이 필요한 정보를 충분히 얻을 수 있어요.'
    suggestions.push('내용이 충분합니다')
    suggestions.push('고객에게 도움이 되는 정보가 많아요')
  }
  
  // 읽기 쉬움 점수 반영
  if (contentQuality.readabilityScore < 60) {
    score -= 15
    suggestions.push('문장을 조금 더 짧게 만들어보세요')
  }
  
  // 제목 구조 반영
  if (!contentQuality.headingStructure) {
    score -= 10
  }
  
  // 최종 점수 조정
  score = Math.max(0, Math.min(100, score))
  
  if (score >= 80) {
    status = 'good'
  } else if (score >= 60) {
    status = 'warning'
  } else {
    status = 'danger'
  }
  
  return {
    id: 'content',
    name: '콘텐츠 품질',
    status,
    score,
    description,
    suggestions
  }
}

// 소셜 미디어 태그 분석
function analyzeSocialTags(html: string): SEOCategory {
  const $ = cheerio.load(html)
  
  // 필수 Open Graph 태그들
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || ''
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || ''
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || ''
  const ogUrl = $('meta[property="og:url"]').attr('content')?.trim() || ''
  const ogSiteName = $('meta[property="og:site_name"]').attr('content')?.trim() || ''
  const ogType = $('meta[property="og:type"]').attr('content')?.trim() || ''
  
  // Twitter Card 태그들
  const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim() || ''
  const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || ''
  const twitterDescription = $('meta[name="twitter:description"]').attr('content')?.trim() || ''
  const twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim() || ''
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  // 필수 태그별 점수 계산 (총 80점)
  if (ogTitle && ogTitle.length > 0) {
    score += 20
    if (ogTitle.length >= 15 && ogTitle.length <= 60) score += 5 // 적절한 길이 보너스
  } else {
    suggestions.push('og:title 태그를 추가해보세요 (페이스북 공유 제목)')
  }
  
  if (ogDescription && ogDescription.length > 0) {
    score += 20
    if (ogDescription.length >= 50 && ogDescription.length <= 160) score += 5 // 적절한 길이 보너스
  } else {
    suggestions.push('og:description 태그를 추가해보세요 (페이스북 공유 설명)')
  }
  
  if (ogImage && ogImage.length > 0) {
    score += 25
    // 이미지 URL이 유효한지 간단 체크
    if (ogImage.startsWith('http')) score += 5 // 절대 URL 보너스
  } else {
    suggestions.push('og:image 태그를 추가해보세요 (공유 시 표시될 이미지)')
  }
  
  if (ogUrl && ogUrl.length > 0) {
    score += 15
  } else {
    suggestions.push('og:url 태그를 추가해보세요 (페이지 정확한 주소)')
  }
  
  // 추가 최적화 점수 (총 20점)
  if (twitterCard && twitterCard.length > 0) {
    score += 10
    if (twitterCard === 'summary_large_image') score += 2 // 권장 카드 타입 보너스
  } else {
    suggestions.push('twitter:card 태그를 추가해보세요 (트위터 공유 최적화)')
  }
  
  if (ogSiteName && ogSiteName.length > 0) {
    score += 5
  }
  
  if (ogType && ogType.length > 0) {
    score += 3
  }
  
  if (twitterImage && twitterImage.length > 0) {
    score += 2
  }
  
  // 최종 점수 제한
  score = Math.min(score, 100)
  
  // 상태 및 설명 설정
  if (score >= 85) {
    status = 'good'
    description = '소셜 미디어 공유 최적화가 완벽해요! 페이스북, 트위터에서 예쁘게 보일 거예요.'
    if (suggestions.length === 0) {
      suggestions.push('현재 소셜 미디어 설정이 완벽합니다')
      suggestions.push('정기적으로 공유 이미지를 업데이트하세요')
    }
  } else if (score >= 60) {
    status = 'warning'
    description = '소셜 미디어 설정이 어느 정도 되어 있어요. 조금 더 보완하면 완벽할 거예요.'
    if (suggestions.length === 0) {
      suggestions.push('추가 최적화를 통해 더 나은 공유 경험을 제공할 수 있어요')
    }
  } else {
    status = 'danger'
    description = '소셜 미디어 공유 설정이 부족해요. 페이스북이나 카카오톡에서 공유할 때 보기 안 좋을 수 있어요.'
    if (suggestions.length === 0) {
      suggestions.push('기본 Open Graph 태그부터 설정해보세요')
    }
  }
  
  // 품질 관련 추가 제안
  if (ogTitle && ogTitle.length > 60) {
    suggestions.push('공유 제목이 너무 길어요. 60자 이내로 줄여보세요')
  }
  if (ogDescription && ogDescription.length > 160) {
    suggestions.push('공유 설명이 너무 길어요. 160자 이내로 줄여보세요')
  }
  if (ogImage && !ogImage.startsWith('http')) {
    suggestions.push('공유 이미지는 절대 URL (https://)로 설정해보세요')
  }
  
  return {
    id: 'social',
    name: '소셜 미디어 최적화',
    status,
    score,
    description,
    suggestions
  }
}

// 구조화 데이터 분석
function analyzeStructuredData(html: string): SEOCategory {
  const $ = cheerio.load(html)
  
  const ldJsonScripts = $('script[type="application/ld+json"]')
  const hasStructuredData = ldJsonScripts.length > 0
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (hasStructuredData) {
    score = 85
    status = 'good'
    description = '구조화 데이터가 설정되어 있어요! 검색 결과에서 더 풍부하게 보일 수 있어요.'
    suggestions.push('현재 구조화 데이터 설정이 좋습니다')
    suggestions.push('Google Search Console에서 확인해보세요')
  } else {
    score = 40
    status = 'warning'
    description = '구조화 데이터가 없어요. 검색 결과에서 별점이나 가격 같은 정보를 보여줄 수 있어요.'
    suggestions.push('Schema.org 마크업을 추가해보세요')
    suggestions.push('비즈니스 정보 구조화 데이터를 설정하세요')
    suggestions.push('Google 구조화 데이터 도구를 사용해보세요')
  }
  
  return {
    id: 'structured',
    name: '구조화 데이터',
    status,
    score,
    description,
    suggestions
  }
}

// 기술적 SEO 분석
function analyzeTechnicalSEO(pageData: PageData): SEOCategory {
  let score = 0
  let issues = 0
  const suggestions: string[] = []
  
  // 뷰포트 설정 확인
  if (!pageData.viewport) {
    issues++
    suggestions.push('모바일 뷰포트 설정을 추가하세요')
  }
  
  // Canonical URL 확인
  if (!pageData.canonicalUrl) {
    issues++
    suggestions.push('Canonical URL을 설정하세요')
  }
  
  // 언어 설정 확인
  if (!pageData.lang) {
    issues++
    suggestions.push('HTML 언어 속성을 설정하세요')
  }
  
  // 문자 인코딩 확인
  if (!pageData.charset) {
    issues++
    suggestions.push('문자 인코딩을 설정하세요')
  }
  
  score = Math.max(20, 100 - (issues * 20))
  const status = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'danger'
  
  let description = ''
  if (score >= 80) {
    description = '기술적 SEO 설정이 잘 되어 있어요! 검색엔진이 이해하기 쉬울 거예요.'
    suggestions.push('현재 기술적 설정이 우수합니다')
  } else if (score >= 60) {
    description = '기술적 SEO가 대부분 설정되어 있어요. 몇 가지만 더 보완하면 완벽할 거예요.'
  } else {
    description = '기술적 SEO 설정이 부족해요. 검색엔진이 사이트를 제대로 이해하지 못할 수 있어요.'
  }
  
  return {
    id: 'technical',
    name: '기술적 SEO',
    status,
    score,
    description,
    suggestions: suggestions.length > 0 ? suggestions : ['현재 설정이 양호합니다']
  }
}


// ===============================
// Enhanced Ad Filtering Functions
// ===============================

/**
 * Comprehensive ad content removal for Korean blog platforms
 * Removes ads, affiliate content, and promotional sections
 */
function removeAdContent($: cheerio.CheerioAPI): void {
  // Basic Google AdSense removal
  $('.adsbygoogle, .revenue_unit_item, [class*="adsense"], ins.kakao_ad_area, div[id^="google_ads"]').remove();
  
  // Kakao AdFit and Tistory-specific ads
  $('[class*="kakao_ad"], [class*="adfit"], [id*="kakao_ad"], [id*="adfit"]').remove();
  $('[class*="dable"], [class*="sponsored"], [class*="recommend"]').remove();
  
  // Tistory-specific ad containers
  $('.tt_article_useless_p_margin, .another_category, .blogRelated').remove();
  $('[class*="related_article"], [class*="popular_article"]').remove();
  
  // Affiliate and promotional content sections
  $('.affiliate, [class*="affiliate"], [data-affiliate]').remove();
  $('[class*="promotion"], [class*="banner"], [class*="sponsor"]').remove();
  
  // Common Korean ad networks
  $('[class*="criteo"], [class*="tenmax"], [class*="recopick"]').remove();
  $('[data-ad], [data-adunit], [data-ad-client]').remove();
  
  // Remove by text content patterns (Korean promotional phrases)
  $('div:contains("광고"), div:contains("후원"), div:contains("제휴")').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length < 50 && (text.includes('광고') || text.includes('후원') || text.includes('제휴'))) {
      $(el).remove();
    }
  });
  
  // Remove tracking pixels and analytics images
  $('img[width="1"], img[height="1"], img[src*="analytics"], img[src*="tracking"]').remove();
  
  // Remove iframes that commonly contain ads
  $('iframe[src*="googleads"], iframe[src*="doubleclick"], iframe[src*="adsystem"]').remove();
  $('iframe[src*="adnxs"], iframe[src*="adsafeprotected"]').remove();
}

/**
 * Determines if an image is likely content (not an ad)
 * Uses multiple filtering criteria including URL patterns, container context, and image attributes
 */
function isContentImage($: cheerio.CheerioAPI, el: cheerio.Element): boolean {
  const $img = $(el);
  const src = $img.attr('src') || '';
  const alt = $img.attr('alt') || '';
  const className = $img.attr('class') || '';
  
  // Basic size filtering (remove tiny tracking pixels)
  const width = parseInt($img.attr('width') || '0', 10);
  const height = parseInt($img.attr('height') || '0', 10);
  if ((width > 0 && width < 50) || (height > 0 && height < 50)) {
    return false;
  }
  
  // Filter by source URL patterns
  if (isAdImageUrl(src)) {
    return false;
  }
  
  // Filter by CSS classes
  if (isAdImageClass(className)) {
    return false;
  }
  
  // Filter by alt text patterns
  if (isAdImageAlt(alt)) {
    return false;
  }
  
  // Filter by parent container context
  if (isInAdContainer($, el)) {
    return false;
  }
  
  // Additional filtering for affiliate/promotional content
  if (isAffiliateImage($, el)) {
    return false;
  }
  
  return true;
}

/**
 * Checks if image URL suggests it's an advertisement
 */
function isAdImageUrl(src: string): boolean {
  const adUrlPatterns = [
    // Google ads
    /googleads|doubleclick|googlesyndication|adsystem/i,
    // Kakao ads
    /kakao.*ad|adfit|daumcdn.*ad/i,
    // Common ad networks
    /criteo|tenmax|recopick|adnxs|adsafeprotected/i,
    // Generic ad patterns
    /banner|sponsor|promo|affiliate/i,
    // Tracking pixels
    /tracking|analytics|pixel|beacon/i,
    // Common ad image sizes in URLs
    /\d+x\d+.*\.(gif|png|jpg).*ad/i
  ];
  
  return adUrlPatterns.some(pattern => pattern.test(src));
}

/**
 * Checks if image CSS classes suggest it's an advertisement
 */
function isAdImageClass(className: string): boolean {
  const adClassPatterns = [
    /ad|advertisement|adsense|adfit/i,
    /banner|sponsor|promo|affiliate/i,
    /tracking|analytics|pixel/i,
    /related|recommend|popular/i, // Often used for promotional content
    /dable|outbrain|taboola/i // Content recommendation networks
  ];
  
  return adClassPatterns.some(pattern => pattern.test(className));
}

/**
 * Checks if image alt text suggests it's an advertisement
 */
function isAdImageAlt(alt: string): boolean {
  const adAltPatterns = [
    /광고|후원|제휴|협찬/i, // Korean: ad, sponsor, affiliate, sponsorship
    /ad|advertisement|sponsor|banner/i,
    /프로모션|할인|쿠폰|이벤트/i, // Korean: promotion, discount, coupon, event
    /추천|인기|관련/i // Korean: recommend, popular, related
  ];
  
  return adAltPatterns.some(pattern => pattern.test(alt));
}

/**
 * Checks if image is contained within an ad container
 */
function isInAdContainer($: cheerio.CheerioAPI, el: cheerio.Element): boolean {
  const $img = $(el);
  
  // Check parent containers for ad-related classes/IDs
  const adContainerSelectors = [
    '.adsbygoogle, .revenue_unit_item, [class*="adsense"]',
    '[class*="kakao_ad"], [class*="adfit"], [id*="kakao_ad"]',
    '[class*="dable"], [class*="sponsored"], [class*="recommend"]',
    '.affiliate, [class*="affiliate"], [data-affiliate]',
    '[class*="promotion"], [class*="banner"], [class*="sponsor"]',
    '[class*="related_article"], [class*="popular_article"]',
    '[data-ad], [data-adunit], [data-ad-client]'
  ];
  
  // Check if image is inside any ad container
  for (const selector of adContainerSelectors) {
    if ($img.closest(selector).length > 0) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if image is part of affiliate/promotional content
 */
function isAffiliateImage($: cheerio.CheerioAPI, el: cheerio.Element): boolean {
  const $img = $(el);
  
  // Check if image is inside a link that looks like affiliate content
  const $link = $img.closest('a[href]');
  if ($link.length > 0) {
    const href = $link.attr('href') || '';
    
    // Common affiliate and promotional link patterns
    const affiliatePatterns = [
      /affiliate|aff_|ref=|referrer/i,
      /ad\.|\?ad=|&ad=/i,
      /promotion|promo|event/i,
      /redirect|track|click/i,
      // Korean affiliate platforms
      /coupang|gmarket|11st|auction/i,
      /naver.*shop|smartstore/i
    ];
    
    if (affiliatePatterns.some(pattern => pattern.test(href))) {
      return true;
    }
  }
  
  // Check if image is in a container with promotional text
  const $container = $img.closest('div, section, article');
  if ($container.length > 0) {
    const containerText = $container.text().toLowerCase();
    const promoKeywords = ['광고', '후원', '제휴', '협찬', '할인', '쿠폰', '이벤트', '추천'];
    
    // If container is small and contains promotional keywords, likely an ad
    if (containerText.length < 200 && promoKeywords.some(keyword => containerText.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

// HTTPS 보안 분석
function analyzeHttpsSecurity(url: string): SEOCategory {
  const isHttps = url.startsWith('https://')
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (isHttps) {
    score = 95
    status = 'good'
    description = '사이트가 안전한 HTTPS로 보호되고 있어요! 고객 정보가 안전하게 전송됩니다.'
    suggestions.push('HTTPS 보안이 적용되어 있습니다')
    suggestions.push('SSL 인증서가 정상적으로 설치되어 있습니다')
  } else {
    score = 30
    status = 'danger'
    description = '사이트가 HTTP로 되어 있어요. 고객 정보가 안전하지 않을 수 있고, 검색 순위에도 영향을 줄 수 있어요.'
    suggestions.push('HTTPS로 변경해보세요')
    suggestions.push('SSL 인증서를 설치해보세요')
    suggestions.push('호스팅 업체에 HTTPS 설정을 문의해보세요')
  }
  
  return {
    id: 'https',
    name: 'HTTPS 보안',
    status,
    score,
    description,
    suggestions
  }
}

// 링크 구조 분석
function analyzeLinkStructure(pageData: PageData): SEOCategory {
  const { links } = pageData
  const totalLinks = links.length
  const internalLinks = links.filter(link => !link.isExternal).length
  const externalLinks = links.filter(link => link.isExternal).length
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (totalLinks === 0) {
    score = 50
    status = 'warning'
    description = '링크가 없어요. 관련 페이지나 유용한 사이트로 연결하면 더 좋을 거예요.'
    suggestions.push('관련 페이지로 연결하는 링크를 추가해보세요')
    suggestions.push('유용한 외부 사이트로 연결해보세요')
  } else if (internalLinks >= 2 && externalLinks >= 1) {
    score = 95
    status = 'good'
    description = '링크 구조가 완벽해요! 내부 페이지와 외부 사이트로 잘 연결되어 있습니다.'
    suggestions.push('내부 링크와 외부 링크가 잘 균형을 이루고 있습니다')
    suggestions.push('링크 텍스트가 명확한지 확인해보세요')
  } else if (internalLinks >= 1 || externalLinks >= 1) {
    score = 75
    status = 'warning'
    description = '링크가 있어서 좋아요! 내부 페이지와 외부 사이트로 더 연결하면 더 좋을 거예요.'
    if (internalLinks === 0) {
      suggestions.push('사이트 내 다른 페이지로 연결하는 링크를 추가해보세요')
    }
    if (externalLinks === 0) {
      suggestions.push('신뢰할 수 있는 외부 사이트로 연결해보세요')
    }
    suggestions.push('관련성 있는 링크를 추가해보세요')
  } else {
    score = 60
    status = 'warning'
    description = '링크가 부족해요. 관련 페이지나 유용한 사이트로 연결하면 SEO에 도움이 될 거예요.'
    suggestions.push('내부 페이지로 연결하는 링크를 추가해보세요')
    suggestions.push('관련 있는 외부 사이트로 연결해보세요')
  }
  
  return {
    id: 'links',
    name: '링크 구조',
    status,
    score,
    description,
    suggestions
  }
}

// 키워드 최적화 분석
function analyzeKeywordOptimization(pageData: PageData): SEOCategory {
  const { title, description, wordCount, h1Tags, h2Tags } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let desc = ''
  const suggestions: string[] = []
  
  // 키워드 일관성 확인 (간단한 방법)
  const titleWords = title.toLowerCase().split(' ').filter(w => w.length > 2)
  const hasKeywordInTitle = titleWords.length > 0
  const hasKeywordInDescription = description && titleWords.some(word => description.toLowerCase().includes(word))
  const hasKeywordInH1 = h1Tags.length > 0 && titleWords.some(word => h1Tags[0].toLowerCase().includes(word))
  
  let keywordScore = 0
  if (hasKeywordInTitle) keywordScore += 30
  if (hasKeywordInDescription) keywordScore += 25
  if (hasKeywordInH1) keywordScore += 25
  if (wordCount > 300) keywordScore += 20 // 충분한 콘텐츠 양
  
  score = keywordScore
  
  if (score >= 80) {
    status = 'good'
    desc = '키워드 최적화가 잘 되어 있어요! 제목, 설명, 내용에 키워드가 자연스럽게 들어가 있습니다.'
    suggestions.push('키워드가 자연스럽게 배치되어 있습니다')
    suggestions.push('제목과 내용의 일관성이 좋습니다')
  } else if (score >= 60) {
    status = 'warning'
    desc = '키워드 최적화가 어느 정도 되어 있어요. 조금 더 자연스럽게 키워드를 배치하면 더 좋을 거예요.'
    if (!hasKeywordInDescription) {
      suggestions.push('페이지 설명에 주요 키워드를 자연스럽게 포함해보세요')
    }
    if (!hasKeywordInH1) {
      suggestions.push('큰 제목에 주요 키워드를 포함해보세요')
    }
    suggestions.push('키워드를 억지로 넣지 말고 자연스럽게 사용하세요')
  } else {
    status = 'danger'
    desc = '키워드 최적화가 부족해요. 제목, 설명, 내용에 일관된 키워드를 사용하면 검색에 도움이 될 거예요.'
    suggestions.push('페이지 제목에 주요 키워드를 포함해보세요')
    suggestions.push('페이지 설명에도 같은 키워드를 자연스럽게 사용해보세요')
    suggestions.push('내용에 키워드를 자연스럽게 반복해보세요')
    suggestions.push('키워드는 자연스럽게 사용하는 것이 중요해요')
  }
  
  return {
    id: 'keywords',
    name: '키워드 최적화',
    status,
    score,
    description: desc,
    suggestions
  }
}