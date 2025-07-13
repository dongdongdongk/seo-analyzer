import * as cheerio from 'cheerio'
import type { AnalysisResult, SEOCategory } from '@/types/analysis'
import { runPageSpeedAnalysis, convertPageSpeedToSEOCategory, createFallbackSpeedAnalysis, createFallbackMobileAnalysis } from './pagespeed-analyzer'
import { generatePersonalizedAdvice, generateKeywordSuggestions } from './openai-analyzer'

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
export async function fetchPageHTML(url: string, locale: string = 'ko'): Promise<string> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  try {
    // URL 유효성 검사
    try {
      new URL(url)
    } catch {
      throw new Error(t('errors.invalidUrl'))
    }
    
    console.log(t('console.fetchingPage'), url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    console.log(t('console.responseStatus'), response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(t('errors.httpError', { status: response.status, statusText: response.statusText }))
    }
    
    const html = await response.text()
    console.log(t('console.htmlLength'), html.length)
    
    return html
  } catch (error) {
    console.error(t('console.fetchError'), error)
    console.error(t('console.failedUrl'), url)
    
    if (error instanceof Error) {
      throw new Error(t('errors.fetchFailed', { message: error.message }))
    } else {
      throw new Error(t('errors.fetchGeneric'))
    }
  }
}

// HTML 파싱 및 데이터 추출
export async function parsePageData(html: string, url: string, locale: string = 'ko'): Promise<PageData> {
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
  const contentQuality = await analyzeContentQuality(textContent, h1Tags, h2Tags, title, description, locale)
  
  // 시멘틱 마크업 분석
  const semanticMarkup = await analyzeSemanticMarkup(html, locale)
  
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
async function analyzeSemanticMarkup(html: string, locale: string = 'ko') {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  const $ = cheerio.load(html)
  
  console.log(t('semanticAnalysis.analyzing'))
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
  const headingLevels = headings.map(h => {
    const element = h as any
    return parseInt(element.tagName?.charAt(1) || '0')
  })
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
    issues.push(`${t('semanticAnalysis.elements.header')} 요소가 없습니다`)
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.useSemanticTags')
  }
  
  if (!hasNav) {
    issues.push(`${t('semanticAnalysis.elements.nav')} 요소가 없습니다`)
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.useSemanticTags')
  }
  
  if (!hasMain) {
    issues.push(`${t('semanticAnalysis.elements.main')} 요소가 없습니다`)
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.useSemanticTags')
  }
  
  if (!hasFooter) {
    issues.push(`${t('semanticAnalysis.elements.footer')} 요소가 없습니다`)
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.useSemanticTags')
  }
  
  if (!hasH1) {
    issues.push(t('semanticAnalysis.issues.missingH1'))
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.logicalHeadings')
  } else if ($('h1').length > 1) {
    issues.push(t('semanticAnalysis.issues.multipleH1'))
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.logicalHeadings')
  }
  
  if (!headingStructure) {
    issues.push(t('semanticAnalysis.issues.illogicalHeadings'))
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.logicalHeadings')
  }
  
  if (ariaAttributes < 3) {
    issues.push(t('semanticAnalysis.issues.insufficientAria'))
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.addAria')
  }
  
  if (!hasSection && !hasArticle) {
    issues.push(t('semanticAnalysis.issues.missingSemanticTags'))
    suggestions.push('seoAnalyzer.categories.semanticMarkup.suggestions.structureContent')
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
async function analyzeSemanticMarkupCategory(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  const semantic = pageData.semanticMarkup
  const score = semantic.semanticScore
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []

  if (score >= 80) {
    status = 'good'
    description = t('semanticAnalysis.wellConfigured')
  } else if (score >= 60) {
    status = 'warning'
    description = t('categories.semanticMarkup.description')
  } else {
    status = 'danger'
    description = t('categories.semanticMarkup.poorStructure')
  }

  // 구체적인 제안사항 추가
  if (semantic.suggestions.length > 0) {
    suggestions.push(...semantic.suggestions.slice(0, 3)) // 최대 3개까지
  }

  // 긍정적인 피드백도 추가
  if (semantic.hasMain) {
    suggestions.push(t('semanticAnalysis.positiveFeedback.mainContent'))
  }
  if (semantic.hasHeader && semantic.hasFooter) {
    suggestions.push(t('semanticAnalysis.positiveFeedback.headerFooter'))
  }
  if (semantic.headingStructure) {
    suggestions.push(t('semanticAnalysis.positiveFeedback.headingStructure'))
  }

  return {
    id: 'semantic-markup',
    name: t('categories.semanticMarkup.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 콘텐츠 품질 분석
async function analyzeContentQuality(
  content: string,
  h1Tags: string[],
  h2Tags: string[],
  title: string,
  description: string,
  locale: string = 'ko'
): Promise<PageData['contentQuality']> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  // description 변수 사용 (TypeScript 경고 해결)
  console.debug(t('console.analyzing'), description.slice(0, 50) + '...')
  
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
async function analyzeRobotsTxt(url: string, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
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
    description = t('categories.robots.exists');
    suggestions.push('seoAnalyzer.categories.robots.suggestions.allowImportant');
    if (!robotsTxt.includes('Sitemap:')) {
      score -= 10;
      status = 'warning';
      suggestions.push('seoAnalyzer.categories.robots.suggestions.addSitemap');
    }
  } else {
    score = 40;
    status = 'warning';
    description = t('categories.robots.noRobotsFile');
    suggestions.push('seoAnalyzer.categories.robots.suggestions.createRobots');
  }

  return {
    id: 'robots',
    name: t('categories.robots.name'),
    status,
    score,
    description,
    suggestions,
  };
}

// Sitemap 분석
async function analyzeSitemap(url: string, locale: string = 'ko'): Promise<SEOCategory> {
    const messages = await getMessages(locale)
    const t = createTranslationFunction(messages, 'seoAnalyzer')
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
        description = t('categories.sitemap.exists');
        suggestions.push('seoAnalyzer.categories.sitemap.suggestions.keepUpdated');
        if(foundInRobots) {
            score = 95;
            suggestions.push('seoAnalyzer.categories.sitemap.suggestions.goodInRobots');
        } else {
            score = 85;
            status = 'warning';
            suggestions.push('seoAnalyzer.categories.sitemap.suggestions.addToRobots');
        }
    } else {
        score = 30;
        status = 'danger';
        description = t('categories.sitemap.missing');
        suggestions.push('seoAnalyzer.categories.sitemap.suggestions.createSitemap');
        suggestions.push('seoAnalyzer.categories.sitemap.suggestions.useTools');
    }

    return {
        id: 'sitemap',
        name: t('categories.sitemap.name'),
        status,
        score,
        description,
        suggestions,
    };
}

// SEO 분석 실행
export async function analyzeSEO(url: string, locale: string = 'ko'): Promise<AnalysisResult> {
  try {
    // 1. 페이지 HTML 가져오기 및 데이터 추출
    const html = await fetchPageHTML(url, locale)
    const pageData = await parsePageData(html, url, locale)
    
    // 2. 기본 SEO 분석 (확장됨)
    const robotsAnalysis = await analyzeRobotsTxt(url, locale);
    const sitemapAnalysis = await analyzeSitemap(url, locale);

    const basicCategories: SEOCategory[] = [
      await analyzeTitleTag(pageData, locale),
      await analyzeMetaDescription(pageData, locale),
      await analyzeContent(pageData, locale),
      await analyzeSocialTags(html, locale),
      await analyzeStructuredData(html, locale),
      await analyzeTechnicalSEO(pageData, locale),
      await analyzeHttpsSecurity(url, locale),
      await analyzeLinkStructure(pageData, locale),
      await analyzeKeywordOptimization(pageData, locale),
      await analyzeSemanticMarkupCategory(pageData, locale),
      robotsAnalysis,
      sitemapAnalysis
    ]
    
    // 선택사항 분석 (점수에 포함되지 않음)
    const optionalCategories: SEOCategory[] = [
      await analyzeImages(pageData, locale)
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
        }, locale),
        generateKeywordSuggestions({
          ...pageData,
          content: textContent
        }, businessType, locale)
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
async function analyzeTitleTag(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  const { title } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (!title) {
    score = 0
    status = 'danger'
    description = t('categories.title.missing')
    suggestions.push('seoAnalyzer.categories.title.suggestions.addKeywords')
    suggestions.push('seoAnalyzer.categories.title.suggestions.makeAttractive')
  } else if (title.length < 30) {
    score = 60
    status = 'warning'
    description = t('categories.title.tooShort', { length: title.length })
    suggestions.push('seoAnalyzer.categories.title.suggestions.addKeywords')
    suggestions.push('seoAnalyzer.categories.title.suggestions.makeAttractive')
  } else if (title.length > 60) {
    score = 75
    status = 'warning'
    description = t('categories.title.tooLong', { length: title.length })
    suggestions.push('seoAnalyzer.categories.title.suggestions.makeAttractive')
    suggestions.push('seoAnalyzer.categories.title.suggestions.addKeywords')
  } else {
    score = 95
    status = 'good'
    description = t('categories.title.description')
    suggestions.push('seoAnalyzer.categories.title.suggestions.makeAttractive')
    suggestions.push('seoAnalyzer.categories.title.suggestions.includeNumbers')
  }
  
  
  return {
    id: 'title',
    name: t('categories.title.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 메타 설명 분석
async function analyzeMetaDescription(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  const { description } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let desc = ''
  const suggestions: string[] = []
  
  if (!description) {
    score = 0
    status = 'danger'
    desc = t('categories.description.missing')
    suggestions.push('seoAnalyzer.categories.description.suggestions.includeKeywords')
    suggestions.push('seoAnalyzer.categories.description.suggestions.makeUnique')
  } else if (description.length < 120) {
    score = 70
    status = 'warning'
    desc = t('categories.description.tooShort', { length: description.length })
    suggestions.push('seoAnalyzer.categories.description.suggestions.includeKeywords')
    suggestions.push('seoAnalyzer.categories.description.suggestions.showBenefit')
  } else if (description.length > 160) {
    score = 75
    status = 'warning'
    desc = t('categories.description.tooLong', { length: description.length })
    suggestions.push('seoAnalyzer.categories.description.suggestions.makeUnique')
    suggestions.push('seoAnalyzer.categories.description.suggestions.showBenefit')
  } else {
    score = 95
    status = 'good'
    desc = t('categories.description.description')
    suggestions.push('seoAnalyzer.categories.description.suggestions.addAction')
    suggestions.push('seoAnalyzer.categories.description.suggestions.includeKeywords')
  }
  
  return {
    id: 'description',
    name: t('categories.description.name'),
    status,
    score,
    description: desc,
    suggestions
  }
}

// 이미지 분석
async function analyzeImages(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
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
    description = t('categories.images.description')
    suggestions.push('seoAnalyzer.categories.images.suggestions.addAltText')
  } else {
    const altPercentage = (imagesWithAlt / totalImages) * 100
    
    if (altPercentage === 100) {
      score = 95
      status = 'good'
      description = t('categories.images.description')
      suggestions.push('seoAnalyzer.categories.images.suggestions.addAltText')
      suggestions.push('seoAnalyzer.categories.images.suggestions.optimizeSize')
    } else if (altPercentage >= 80) {
      score = 85
      status = 'good'
      description = t('categories.images.description')
      suggestions.push(t('categories.images.noAlt', { count: totalImages - imagesWithAlt }))
      suggestions.push('seoAnalyzer.categories.images.suggestions.addAltText')
    } else if (altPercentage >= 50) {
      score = 65
      status = 'warning'
      description = t('categories.images.description')
      suggestions.push(t('categories.images.noAlt', { count: totalImages - imagesWithAlt }))
      suggestions.push('seoAnalyzer.categories.images.suggestions.addAltText')
    } else {
      score = 40
      status = 'danger'
      description = t('categories.images.description')
      suggestions.push(t('categories.images.noAlt', { count: totalImages - imagesWithAlt }))
      suggestions.push('seoAnalyzer.categories.images.suggestions.addAltText')
    }
  }
  
  return {
    id: 'images',
    name: t('categories.images.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 콘텐츠 분석
async function analyzeContent(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  const { wordCount, contentQuality } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (wordCount < 300) {
    score = 50
    status = 'warning'
    description = t('categories.content.description')
    suggestions.push('seoAnalyzer.categories.content.suggestions.addMoreContent')
    suggestions.push('seoAnalyzer.categories.content.suggestions.addKeywords')
  } else if (wordCount < 600) {
    score = 75
    status = 'warning'
    description = t('categories.content.description')
    suggestions.push('seoAnalyzer.categories.content.suggestions.addMoreContent')
    suggestions.push('seoAnalyzer.categories.content.suggestions.addKeywords')
  } else {
    score = 90
    status = 'good'
    description = t('categories.content.description')
    suggestions.push('seoAnalyzer.categories.content.suggestions.useHeadings')
    suggestions.push('seoAnalyzer.categories.content.suggestions.improveReadability')
  }
  
  // 읽기 쉬움 점수 반영
  if (contentQuality.readabilityScore < 60) {
    score -= 15
    suggestions.push('seoAnalyzer.categories.content.suggestions.improveReadability')
  }
  
  // 제목 구조 반영
  if (!contentQuality.headingStructure) {
    score -= 10
    suggestions.push('seoAnalyzer.categories.content.suggestions.useHeadings')
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
    name: t('categories.content.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 소셜 미디어 태그 분석
async function analyzeSocialTags(html: string, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
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
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
  }
  
  if (ogDescription && ogDescription.length > 0) {
    score += 20
    if (ogDescription.length >= 50 && ogDescription.length <= 160) score += 5 // 적절한 길이 보너스
  } else {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
  }
  
  if (ogImage && ogImage.length > 0) {
    score += 25
    // 이미지 URL이 유효한지 간단 체크
    if (ogImage.startsWith('http')) score += 5 // 절대 URL 보너스
  } else {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgImage')
  }
  
  if (ogUrl && ogUrl.length > 0) {
    score += 15
  } else {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
  }
  
  // 추가 최적화 점수 (총 20점)
  if (twitterCard && twitterCard.length > 0) {
    score += 10
    if (twitterCard === 'summary_large_image') score += 2 // 권장 카드 타입 보너스
  } else {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addTwitterCards')
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
    description = t('categories.socialMedia.description')
    if (suggestions.length === 0) {
      suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.testSharing')
    }
  } else if (score >= 60) {
    status = 'warning'
    description = t('categories.socialMedia.description')
    if (suggestions.length === 0) {
      suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
    }
  } else {
    status = 'danger'
    description = t('categories.socialMedia.missingOg')
    if (suggestions.length === 0) {
      suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
    }
  }
  
  // 품질 관련 추가 제안
  if (ogTitle && ogTitle.length > 60) {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
  }
  if (ogDescription && ogDescription.length > 160) {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgTags')
  }
  if (ogImage && !ogImage.startsWith('http')) {
    suggestions.push('seoAnalyzer.categories.socialMedia.suggestions.addOgImage')
  }
  
  return {
    id: 'social',
    name: t('categories.socialMedia.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 구조화 데이터 분석
async function analyzeStructuredData(html: string, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
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
    description = t('categories.structuredData.description')
    suggestions.push('seoAnalyzer.categories.structuredData.suggestions.testWithTools')
  } else {
    score = 40
    status = 'warning'
    description = t('categories.structuredData.missing')
    suggestions.push('seoAnalyzer.categories.structuredData.suggestions.addJsonLd')
    suggestions.push('seoAnalyzer.categories.structuredData.suggestions.useSchema')
    suggestions.push('seoAnalyzer.categories.structuredData.suggestions.addBusiness')
  }
  
  return {
    id: 'structured',
    name: t('categories.structuredData.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 기술적 SEO 분석
async function analyzeTechnicalSEO(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  let score = 0
  let issues = 0
  const suggestions: string[] = []
  
  // 뷰포트 설정 확인
  if (!pageData.viewport) {
    issues++
    suggestions.push('seoAnalyzer.categories.technical.suggestions.addViewport')
  }
  
  // Canonical URL 확인
  if (!pageData.canonicalUrl) {
    issues++
    suggestions.push('seoAnalyzer.categories.technical.suggestions.addCanonical')
  }
  
  // 언어 설정 확인
  if (!pageData.lang) {
    issues++
    suggestions.push('seoAnalyzer.categories.technical.suggestions.setRobots')
  }
  
  // 문자 인코딩 확인
  if (!pageData.charset) {
    issues++
    suggestions.push('seoAnalyzer.categories.technical.suggestions.optimizePerformance')
  }
  
  score = Math.max(20, 100 - (issues * 20))
  const status = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'danger'
  
  let description = ''
  if (score >= 80) {
    description = t('categories.technical.description')
    if (suggestions.length === 0) {
      suggestions.push('seoAnalyzer.categories.technical.suggestions.addViewport')
    }
  } else if (score >= 60) {
    description = t('categories.technical.description')
  } else {
    description = t('categories.technical.missingViewport')
  }
  
  return {
    id: 'technical',
    name: t('categories.technical.name'),
    status,
    score,
    description,
    suggestions: suggestions.length > 0 ? suggestions : [t('categories.technical.suggestions.addViewport')]
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
async function analyzeHttpsSecurity(url: string, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
  const isHttps = url.startsWith('https://')
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (isHttps) {
    score = 95
    status = 'good'
    description = t('categories.https.description')
    suggestions.push('seoAnalyzer.categories.https.suggestions.enableHttps')
    suggestions.push('seoAnalyzer.categories.https.suggestions.testSecurity')
  } else {
    score = 30
    status = 'danger'
    description = t('categories.https.notSecure')
    suggestions.push('seoAnalyzer.categories.https.suggestions.enableHttps')
    suggestions.push('seoAnalyzer.categories.https.suggestions.redirectHttp')
    suggestions.push('seoAnalyzer.categories.https.suggestions.updateLinks')
  }
  
  return {
    id: 'https',
    name: t('categories.https.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 링크 구조 분석
async function analyzeLinkStructure(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
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
    description = t('categories.links.description')
    suggestions.push('seoAnalyzer.categories.links.suggestions.addInternal')
    suggestions.push('seoAnalyzer.categories.links.suggestions.balanceLinks')
  } else if (internalLinks >= 2 && externalLinks >= 1) {
    score = 95
    status = 'good'
    description = t('categories.links.description')
    suggestions.push('seoAnalyzer.categories.links.suggestions.useAnchorText')
    suggestions.push('seoAnalyzer.categories.links.suggestions.checkBroken')
  } else if (internalLinks >= 1 || externalLinks >= 1) {
    score = 75
    status = 'warning'
    description = t('categories.links.description')
    if (internalLinks === 0) {
      suggestions.push('seoAnalyzer.categories.links.suggestions.addInternal')
    }
    if (externalLinks === 0) {
      suggestions.push('seoAnalyzer.categories.links.suggestions.balanceLinks')
    }
    suggestions.push('seoAnalyzer.categories.links.suggestions.useAnchorText')
  } else {
    score = 60
    status = 'warning'
    description = t('categories.links.fewInternal')
    suggestions.push('seoAnalyzer.categories.links.suggestions.addInternal')
    suggestions.push('seoAnalyzer.categories.links.suggestions.balanceLinks')
  }
  
  return {
    id: 'links',
    name: t('categories.links.name'),
    status,
    score,
    description,
    suggestions
  }
}

// 키워드 최적화 분석
async function analyzeKeywordOptimization(pageData: PageData, locale: string = 'ko'): Promise<SEOCategory> {
  const messages = await getMessages(locale)
  const t = createTranslationFunction(messages, 'seoAnalyzer')
  
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
    desc = t('categories.keywords.description')
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.naturalUse')
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.monitoring')
  } else if (score >= 60) {
    status = 'warning'
    desc = t('categories.keywords.description')
    if (!hasKeywordInDescription) {
      suggestions.push('seoAnalyzer.categories.keywords.suggestions.naturalUse')
    }
    if (!hasKeywordInH1) {
      suggestions.push('seoAnalyzer.categories.keywords.suggestions.research')
    }
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.longTail')
  } else {
    status = 'danger'
    desc = t('categories.keywords.lowDensity')
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.research')
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.naturalUse')
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.longTail')
    suggestions.push('seoAnalyzer.categories.keywords.suggestions.monitoring')
  }
  
  return {
    id: 'keywords',
    name: t('categories.keywords.name'),
    status,
    score,
    description: desc,
    suggestions
  }
}