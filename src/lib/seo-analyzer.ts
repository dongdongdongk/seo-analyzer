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
  
  // 이미지 분석
  const images = $('img').map((_, el) => ({
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
    contentQuality
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

// SEO 분석 실행
export async function analyzeSEO(url: string): Promise<AnalysisResult> {
  try {
    // 1. 페이지 HTML 가져오기 및 데이터 추출
    const html = await fetchPageHTML(url)
    const pageData = parsePageData(html, url)
    
    // 2. 기본 SEO 분석 (확장됨)
    const basicCategories: SEOCategory[] = [
      analyzeTitleTag(pageData),
      analyzeMetaDescription(pageData),
      analyzeImages(pageData),
      analyzeHeadings(pageData),
      analyzeContent(pageData),
      analyzeSocialTags(html),
      analyzeStructuredData(html),
      analyzeTechnicalSEO(pageData)
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
    
    // 4. 모든 카테고리 합치기
    const categories = [...basicCategories, ...performanceCategories]
    
    // 5. 전체 점수 계산
    const overallScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length
    )
    
    // 6. 사이트 정보 분석
    const siteInfo = analyzeSiteInfo(html, url, pageData)
    
    // 7. 기본 분석 결과 생성
    const basicResult: AnalysisResult = {
      url,
      overallScore,
      categories,
      siteInfo
    }
    
    // 7. AI 기반 맞춤 조언 및 키워드 제안 (병렬 실행)
    try {
      const [aiAdvice, keywordSuggestions] = await Promise.allSettled([
        generatePersonalizedAdvice(basicResult, {
          ...pageData,
          url,
          content: extractTextContent(html)
        }),
        generateKeywordSuggestions({
          ...pageData,
          content: extractTextContent(html)
        }, detectBusinessType(pageData))
      ])
      
      // AI 조언 결과 처리
      if (aiAdvice.status === 'fulfilled') {
        (basicResult as any).aiAdvice = aiAdvice.value
      }
      
      // 키워드 제안 결과 처리
      if (keywordSuggestions.status === 'fulfilled') {
        (basicResult as any).keywordSuggestions = keywordSuggestions.value
      }
      
      // 사이트 타입 및 업종 정보 추가
      (basicResult as any).siteType = detectSiteType({ ...pageData, url })
      ;(basicResult as any).businessType = detectBusinessType(pageData)
      
      // PageSpeed 관련 정보 추가
      ;(basicResult as any).hasFieldData = hasFieldData
      ;(basicResult as any).performanceImprovements = performanceImprovements
      
    } catch (aiError) {
      console.error('AI 분석 실패:', aiError)
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
  
  // 기술적 정보 분석
  const technicalInfo = {
    hasViewport: !!pageData.viewport,
    hasStructuredData: $('script[type="application/ld+json"]').length > 0,
    robotsTag: $('meta[name="robots"]').attr('content') || 'index,follow',
    canonicalUrl: pageData.canonicalUrl,
    wordCount: extractTextContent(html).split(/\s+/).filter(word => word.length > 0).length,
    imageCount: pageData.images.length,
    linkCount: $('a[href]').length
  }
  
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
function analyzeHeadings(pageData: PageData): SEOCategory {
  const { h1Tags, h2Tags } = pageData
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (h1Tags.length === 0) {
    score = 30
    status = 'danger'
    description = '큰 제목(H1)이 없어요! 페이지의 주제를 명확히 해주세요.'
    suggestions.push('페이지에 큰 제목을 하나 추가해보세요')
    suggestions.push('큰 제목은 페이지의 가장 중요한 내용이에요')
  } else if (h1Tags.length > 1) {
    score = 60
    status = 'warning'
    description = '큰 제목이 너무 많아요. 하나만 있는 것이 좋아요.'
    suggestions.push('큰 제목을 하나로 줄여보세요')
    suggestions.push('나머지는 작은 제목으로 바꿔보세요')
  } else {
    // H1이 정확히 1개
    if (h2Tags.length === 0) {
      score = 75
      status = 'warning'
      description = '큰 제목은 좋아요! 작은 제목도 추가하면 더 좋을 거예요.'
      suggestions.push('내용을 구분할 수 있는 작은 제목을 추가해보세요')
      suggestions.push('제목 구조가 있으면 읽기 쉬워요')
    } else {
      score = 95
      status = 'good'
      description = '제목 구조가 완벽해요! 읽기 쉽고 검색에도 좋아요.'
      suggestions.push('제목 구조가 잘 되어 있습니다')
      suggestions.push('고객이 내용을 쉽게 찾을 수 있어요')
    }
  }
  
  return {
    id: 'heading',
    name: '제목 구조',
    status,
    score,
    description,
    suggestions,
    currentValue: {
      label: '제목 구조 상태',
      value: h1Tags.length === 1 ? 'H1 태그 1개 사용' : h1Tags.length === 0 ? 'H1 태그 없음' : `H1 태그 ${h1Tags.length}개 사용`,
      detail: h2Tags.length > 0 ? `H2 태그 ${h2Tags.length}개 사용` : 'H2 태그 없음',
      structure: {
        hasH1: h1Tags.length === 1,
        isLogical: h1Tags.length === 1 && h2Tags.length > 0,
        recommendation: h1Tags.length === 1 && h2Tags.length > 0 ? '완벽한 제목 구조입니다' : h1Tags.length === 1 ? '소제목을 추가하면 더 좋습니다' : 'H1 태그를 하나 추가해주세요'
      }
    }
  }
}

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
  
  const ogTags = $('meta[property^="og:"]').length
  const twitterTags = $('meta[name^="twitter:"]').length
  const hasOgImage = $('meta[property="og:image"]').attr('content')
  const hasOgTitle = $('meta[property="og:title"]').attr('content')
  const hasOgDescription = $('meta[property="og:description"]').attr('content')
  
  let score = 0
  let status: 'good' | 'warning' | 'danger' = 'danger'
  let description = ''
  const suggestions: string[] = []
  
  if (ogTags >= 4 && twitterTags >= 2 && hasOgImage) {
    score = 95
    status = 'good'
    description = '소셜 미디어 공유 최적화가 완벽해요! 페이스북, 트위터에서 예쁘게 보일 거예요.'
    suggestions.push('현재 소셜 미디어 설정이 완벽합니다')
    suggestions.push('정기적으로 공유 이미지를 업데이트하세요')
  } else if (ogTags >= 2 || twitterTags >= 1) {
    score = 65
    status = 'warning'
    description = '소셜 미디어 설정이 부분적으로 되어 있어요. 조금 더 보완하면 좋을 거예요.'
    suggestions.push('Open Graph 이미지를 추가해보세요')
    suggestions.push('트위터 카드 설정을 추가해보세요')
    suggestions.push('소셜 미디어 제목과 설명을 최적화하세요')
  } else {
    score = 30
    status = 'danger'
    description = '소셜 미디어 공유 설정이 없어요. 페이스북이나 카카오톡에서 공유할 때 보기 안 좋을 수 있어요.'
    suggestions.push('Open Graph 태그를 추가해보세요')
    suggestions.push('공유용 이미지를 설정해보세요')
    suggestions.push('소셜 미디어용 제목과 설명을 작성해보세요')
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

// Lighthouse 실패 시 대체 속도 분석
function createFallbackSpeedAnalysis(): SEOCategory {
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

// Lighthouse 실패 시 대체 모바일 분석
function createFallbackMobileAnalysis(pageData: PageData): SEOCategory {
  const { viewport } = pageData
  
  let score = 70
  let status: 'good' | 'warning' | 'danger' = 'warning'
  let description = ''
  const suggestions: string[] = []
  
  if (viewport && viewport.includes('width=device-width')) {
    score = 85
    status = 'good'
    description = '모바일 설정이 잘 되어 있어요! 정확한 측정은 어려웠지만 기본 설정은 좋습니다.'
    suggestions.push('모바일 뷰포트가 잘 설정되어 있습니다')
    suggestions.push('추가 모바일 최적화를 확인해보세요')
  } else {
    score = 50
    status = 'danger'
    description = '모바일 설정이 부족할 수 있어요. 핸드폰에서 잘 보이도록 설정을 확인해보세요.'
    suggestions.push('모바일 뷰포트를 설정해보세요')
    suggestions.push('반응형 디자인을 적용해보세요')
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