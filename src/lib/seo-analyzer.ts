import * as cheerio from 'cheerio'
import { AnalysisResult, SEOCategory } from '@/types/analysis'

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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.text()
  } catch (error) {
    console.error('페이지 가져오기 실패:', error)
    throw new Error('웹페이지를 가져올 수 없습니다. URL을 확인해주세요.')
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
    // 1. 페이지 HTML 가져오기
    const html = await fetchPageHTML(url)
    
    // 2. 페이지 데이터 추출
    const pageData = parsePageData(html, url)
    
    // 3. 각 카테고리별 분석
    const categories: SEOCategory[] = [
      analyzeTitleTag(pageData),
      analyzeMetaDescription(pageData),
      analyzeImages(pageData),
      analyzeHeadings(pageData),
      analyzeContent(pageData)
    ]
    
    // 4. 전체 점수 계산
    const overallScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length
    )
    
    return {
      url,
      overallScore,
      categories
    }
    
  } catch (error) {
    console.error('SEO 분석 실패:', error)
    throw error
  }
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
    id: 'headings',
    name: '제목 구조',
    status,
    score,
    description,
    suggestions
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