import OpenAI from 'openai'
import { AnalysisResult } from '@/types/analysis'

// OpenAI 클라이언트 초기화 (API 키가 없으면 null)
let openai: OpenAI | null = null

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } else {
    console.warn('OPENAI_API_KEY가 설정되지 않았습니다. AI 기능이 비활성화됩니다.')
  }
} catch (error) {
  console.warn('OpenAI 클라이언트 초기화 실패:', error)
}

// 사이트 타입 분석
export function detectSiteType(pageData: any, locale: string = 'ko'): string {
  const title = pageData.title?.toLowerCase() || ''
  const content = pageData.content?.toLowerCase() || ''
  const url = pageData.url?.toLowerCase() || ''

  // 키워드 기반 사이트 타입 감지
  let siteType = 'general' // 기본값
  
  if (
    title.includes('쇼핑') || 
    title.includes('구매') || 
    content.includes('장바구니') ||
    content.includes('결제') ||
    url.includes('shop') ||
    url.includes('store')
  ) {
    siteType = 'ecommerce'
  }
  else if (
    title.includes('블로그') ||
    title.includes('일기') ||
    content.includes('포스팅') ||
    content.includes('게시글') ||
    url.includes('blog') ||
    url.includes('tistory') ||
    url.includes('naver')
  ) {
    siteType = 'blog'
  }
  else if (
    title.includes('회사') ||
    title.includes('기업') ||
    title.includes('서비스') ||
    content.includes('회사소개') ||
    content.includes('연혁')
  ) {
    siteType = 'corporate'
  }
  else if (
    title.includes('카페') ||
    title.includes('음식점') ||
    title.includes('미용실') ||
    title.includes('병원') ||
    content.includes('예약') ||
    content.includes('영업시간') ||
    content.includes('주소')
  ) {
    siteType = 'local'
  }
  else if (
    title.includes('포트폴리오') ||
    title.includes('작품') ||
    content.includes('프로젝트') ||
    content.includes('경력')
  ) {
    siteType = 'portfolio'
  }
  
  // locale에 따라 다른 언어로 반환
  const siteTypeTranslations = {
    ko: {
      ecommerce: '온라인 쇼핑몰',
      blog: '개인 블로그', 
      corporate: '기업 웹사이트',
      local: '로컬 비즈니스',
      portfolio: '포트폴리오',
      general: '일반 웹사이트'
    },
    en: {
      ecommerce: 'E-commerce',
      blog: 'Personal Blog',
      corporate: 'Corporate Website', 
      local: 'Local Business',
      portfolio: 'Portfolio',
      general: 'General Website'
    }
  }
  
  const translations = siteTypeTranslations[locale as keyof typeof siteTypeTranslations] || siteTypeTranslations.ko
  return translations[siteType as keyof typeof translations]
}

// 업종 분석
export function detectBusinessType(pageData: any, locale: string = 'ko'): string {
  const title = pageData.title?.toLowerCase() || ''
  const content = pageData.content?.toLowerCase() || ''
  
  const businessKeywords = {
    restaurant: ['음식', '맛집', '레스토랑', '식당', '요리', '메뉴', 'food', 'restaurant', 'menu', 'dining'],
    cafe: ['카페', '커피', '원두', '디저트', '음료', 'cafe', 'coffee', 'dessert', 'beverage'],
    beauty: ['미용실', '헤어', '파마', '염색', '컷', '스타일링', 'salon', 'hair', 'beauty', 'styling'],
    medical: ['병원', '의원', '치료', '진료', '건강', '의료', 'hospital', 'clinic', 'medical', 'health'],
    ecommerce: ['쇼핑', '구매', '상품', '배송', '할인', 'shopping', 'purchase', 'product', 'delivery'],
    education: ['교육', '학원', '강의', '수업', '학습', 'education', 'school', 'course', 'learning'],
    tech: ['개발', '프로그래밍', 'IT', '소프트웨어', '앱', 'development', 'programming', 'software', 'app'],
  }
  
  let businessType = 'other' // 기본값
  
  for (const [business, keywords] of Object.entries(businessKeywords)) {
    if (keywords.some(keyword => title.includes(keyword) || content.includes(keyword))) {
      businessType = business
      break
    }
  }
  
  // locale에 따라 다른 언어로 반환
  const businessTypeTranslations = {
    ko: {
      restaurant: '음식점',
      cafe: '카페',
      beauty: '미용실',
      medical: '병원',
      ecommerce: '쇼핑몰',
      education: '교육',
      tech: '기술',
      other: '기타'
    },
    en: {
      restaurant: 'Restaurant',
      cafe: 'Cafe',
      beauty: 'Beauty Salon',
      medical: 'Medical',
      ecommerce: 'E-commerce',
      education: 'Education',
      tech: 'Technology',
      other: 'Other'
    }
  }
  
  const translations = businessTypeTranslations[locale as keyof typeof businessTypeTranslations] || businessTypeTranslations.ko
  return translations[businessType as keyof typeof translations]
}

// GPT 기반 맞춤 조언 생성
export async function generatePersonalizedAdvice(
  analysisResult: AnalysisResult,
  pageData: any,
  locale: string = 'ko'
): Promise<{
  overallAdvice: string
  priorityActions: string[]
  industrySpecificTips: string[]
  expectedResults: string
}> {
  // OpenAI가 사용 불가능한 경우 기본 조언 제공
  if (!openai) {
    return generateFallbackAdvice(analysisResult, pageData, locale)
  }
  
  try {
    const siteType = detectSiteType(pageData, locale)
    const businessType = detectBusinessType(pageData, locale)
    
    // 분석 결과 요약
    const problemAreas = analysisResult.categories
      .filter(cat => cat.status === 'danger' || cat.status === 'warning')
      .map(cat => `${cat.name}: ${cat.description}`)
      .join('\n')
    
    const goodAreas = analysisResult.categories
      .filter(cat => cat.status === 'good')
      .map(cat => cat.name)
      .join(', ')

    // 페이지 구체적 정보 추출
    const pageTitle = pageData.title || '제목 없음'
    const pageDescription = pageData.description || '설명 없음'
    const headings = [...(pageData.h1Tags || []), ...(pageData.h2Tags || [])].slice(0, 5)
    const imageCount = pageData.images?.length || 0
    const linkCount = pageData.links?.length || 0
    const wordCount = pageData.wordCount || 0
    const hasOpenGraph = pageData.ogTags?.title || pageData.ogTags?.description
    const mainContent = pageData.content?.substring(0, 300) || '내용을 확인할 수 없습니다'
    
    // 실제 페이지 요소들을 분석해서 구체적인 문제점 파악
    const specificIssues = []
    if (!pageTitle || pageTitle.length < 30) {
      specificIssues.push(`현재 페이지 제목이 "${pageTitle}"인데, 너무 짧아서 고객이 찾기 어려워요`)
    }
    if (!pageDescription || pageDescription.length < 120) {
      specificIssues.push(`페이지 설명이 "${pageDescription}"인데, 더 자세히 써야 클릭률이 올라가요`)
    }
    if (imageCount > 0 && pageData.images?.filter((img: any) => !img.alt).length > 0) {
      specificIssues.push(`${imageCount}개의 이미지 중 일부에 설명이 없어서 검색에 노출되지 않아요`)
    }
    if (headings.length === 0) {
      specificIssues.push('페이지에 소제목(H1, H2)이 없어서 내용 구조가 불분명해요')
    }
    
    const specificIssuesText = specificIssues.length > 0 ? specificIssues.join('\n') : '페이지 구조가 전반적으로 잘 되어있어요'

    // locale에 따라 다른 프롬프트 사용
    const prompt = locale === 'en' ? `
You are an SEO expert who can explain things in simple terms for beginners. Please provide customized advice based on the actual analysis results of the following website.` : `
당신은 초보자도 이해할 수 있는 SEO 전문가입니다. 다음 웹사이트를 실제로 분석한 결과를 바탕으로 맞춤형 조언을 해주세요.`
    
    const detailedPrompt = locale === 'en' ? `
${prompt}

## Actual Analyzed Website Information
- URL: ${analysisResult.url}
- Site Type: ${siteType}
- Industry: ${businessType}
- Overall Score: ${analysisResult.overallScore} points
- Page Title: "${pageTitle}"
- Page Description: "${pageDescription}"
- Main Content: "${mainContent}"
- Headings: ${headings.length > 0 ? headings.join(', ') : 'None'}
- Number of Images: ${imageCount}
- Number of Links: ${linkCount}
- Word Count: ${wordCount}
- Social Media Optimization: ${hasOpenGraph ? 'Configured' : 'Not configured'}

## Actual Specific Issues Found
${specificIssuesText}

## Existing Analysis Results
Issues: ${problemAreas || 'No specific issues found.'}
Good Areas: ${goodAreas || 'None'}

## Request
Based on the actual page content above, please write the following 4 items specifically and customized:

1. **Overall Advice (2-3 sentences)**: Summarize current status mentioning actual page content with encouraging message
2. **Priority Improvement Tasks (3-5 items)**: Suggest improvements mentioning specific page elements
3. **Industry-Specific Tips (2-3 items)**: Specialized SEO tips considering ${businessType} industry and current page content
4. **Expected Results (1-2 sentences)**: Specific effects you can expect after improvements

## Writing Rules
- Must specifically mention actual page content (title, description, headings, etc.)
- No technical jargon (explain SEO, meta tags, etc. in simple terms)
- Provide specific and actionable methods
- Use positive and encouraging tone
- Consider "${businessType}" characteristics for customized advice
- Write each item concisely in 1-2 lines

Please respond in JSON format:
{
  "overallAdvice": "Overall advice",
  "priorityActions": ["First priority", "Second priority", ...],
  "industrySpecificTips": ["Industry tip 1", "Industry tip 2", ...],
  "expectedResults": "Expected results"
}` : `
${prompt}

## 실제 분석한 웹사이트 정보
- URL: ${analysisResult.url}
- 사이트 유형: ${siteType}
- 업종: ${businessType}
- 전체 점수: ${analysisResult.overallScore}점
- 페이지 제목: "${pageTitle}"
- 페이지 설명: "${pageDescription}"
- 주요 내용: "${mainContent}"
- 소제목들: ${headings.length > 0 ? headings.join(', ') : '없음'}
- 이미지 개수: ${imageCount}개
- 링크 개수: ${linkCount}개
- 글자 수: ${wordCount}자
- 소셜 미디어 최적화: ${hasOpenGraph ? '설정됨' : '설정되지 않음'}

## 실제 발견된 구체적인 문제점
${specificIssuesText}

## 기존 분석 결과
문제점: ${problemAreas || '특별한 문제점이 발견되지 않았습니다.'}
잘하고 있는 부분: ${goodAreas || '없음'}

## 요청사항
위의 실제 페이지 내용을 바탕으로 다음 4가지를 구체적이고 맞춤형으로 작성해주세요:

1. **전체적인 조언 (2-3문장)**: 실제 페이지 내용을 언급하며 현재 상태를 요약하고 격려 메시지
2. **우선순위 개선 작업 (3-5개)**: 실제 페이지 요소들을 구체적으로 언급하며 개선 방법 제시
3. **업종별 특화 팁 (2-3개)**: ${businessType} 업종과 현재 페이지 내용을 고려한 특화된 SEO 팁
4. **예상 결과 (1-2문장)**: 개선 후 기대할 수 있는 구체적인 효과

## 작성 규칙
- 반드시 실제 페이지 내용(제목, 설명, 소제목 등)을 구체적으로 언급하기
- 전문용어 금지 (SEO, 메타태그 등 → 쉬운 말로 설명)
- 구체적이고 실행 가능한 방법 제시
- 긍정적이고 격려하는 톤
- "${businessType}" 특성을 고려한 맞춤 조언
- 각 항목은 간단명료하게 1-2줄로 작성

JSON 형식으로 응답해주세요:
{
  "overallAdvice": "전체적인 조언",
  "priorityActions": ["첫 번째 우선순위", "두 번째 우선순위", ...],
  "industrySpecificTips": ["업종별 팁1", "업종별 팁2", ...],
  "expectedResults": "예상 결과"
}`


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: locale === 'en' 
            ? "You are a friendly SEO consultant for beginners. Always explain in simple terms and use encouraging tone."
            : "당신은 초보자를 위한 친절한 SEO 컨설턴트입니다. 항상 쉬운 말로 설명하고 격려하는 말투를 사용합니다."
        },
        {
          role: "user",
          content: detailedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('GPT 응답을 받을 수 없습니다.')
    }

    const advice = JSON.parse(response)
    
    const fallbackMessages = locale === 'en' ? {
      overallAdvice: "Your website is generally well-maintained!",
      priorityActions: ["Maintain the current state"],
      industrySpecificTips: ["Use keywords that match your industry characteristics"],
      expectedResults: "With consistent management, more customers will find you!"
    } : {
      overallAdvice: "웹사이트가 전반적으로 잘 관리되고 있어요!",
      priorityActions: ["현재 상태를 유지하세요"],
      industrySpecificTips: ["업종 특성에 맞는 키워드를 활용해보세요"],
      expectedResults: "꾸준히 관리하면 더 많은 고객이 찾아올 거예요!"
    }
    
    return {
      overallAdvice: advice.overallAdvice || fallbackMessages.overallAdvice,
      priorityActions: advice.priorityActions || fallbackMessages.priorityActions,
      industrySpecificTips: advice.industrySpecificTips || fallbackMessages.industrySpecificTips,
      expectedResults: advice.expectedResults || fallbackMessages.expectedResults
    }

  } catch (error) {
    console.error('OpenAI API 오류:', error)
    
    // API 실패 시 기본 조언 제공
    return generateFallbackAdvice(analysisResult, pageData, locale)
  }
}

// OpenAI API 실패 시 대체 조언
function generateFallbackAdvice(
  analysisResult: AnalysisResult,
  pageData: any,
  locale: string = 'ko'
): {
  overallAdvice: string
  priorityActions: string[]
  industrySpecificTips: string[]
  expectedResults: string
} {
  const businessType = detectBusinessType(pageData, locale)
  const score = analysisResult.overallScore
  
  // 실제 페이지 정보를 활용한 구체적인 조언 생성
  const pageTitle = pageData.title || (locale === 'en' ? 'No title' : '제목 없음')
  const pageDescription = pageData.description || (locale === 'en' ? 'No description' : '설명 없음')
  const imageCount = pageData.images?.length || 0
  const wordCount = pageData.wordCount || 0
  
  let overallAdvice = ""
  if (locale === 'en') {
    if (score >= 80) {
      overallAdvice = `Your "${pageTitle}" page is very well maintained! As a ${businessType} site, keep up the current state and make gradual improvements for perfection.`
    } else if (score >= 60) {
      overallAdvice = `Your "${pageTitle}" page is in good condition! With just a few improvements, many more ${businessType} customers will be able to find you.`
    } else {
      overallAdvice = `Your "${pageTitle}" page has areas for improvement, but don't worry! As a ${businessType} site, if you improve step by step, it will definitely get better.`
    }
  } else {
    if (score >= 80) {
      overallAdvice = `"${pageTitle}" 페이지가 매우 잘 관리되고 있어요! ${businessType} 사이트로서 현재 상태를 유지하면서 조금씩 개선해나가면 완벽할 거예요.`
    } else if (score >= 60) {
      overallAdvice = `"${pageTitle}" 페이지가 괜찮은 상태예요! 몇 가지만 개선하면 ${businessType} 고객들이 훨씬 더 많이 찾아올 수 있어요.`
    } else {
      overallAdvice = `"${pageTitle}" 페이지에 개선할 부분이 있지만 걱정하지 마세요! ${businessType} 사이트로서 하나씩 차근차근 개선해나가면 분명 좋아질 거예요.`
    }
  }
  
  // 문제 영역 기반 우선순위 생성 (실제 페이지 내용을 반영)
  const problemCategories = analysisResult.categories
    .filter(cat => cat.status === 'danger' || cat.status === 'warning')
    .sort((a, b) => a.score - b.score) // 점수가 낮은 것부터
  
  const priorityActions = problemCategories.slice(0, 4).map(cat => {
    if (locale === 'en') {
      switch (cat.id) {
        case 'title':
          return `Make your current title "${pageTitle}" more attractive and specific (include keywords for ${businessType})`
        case 'description':
          return `Update your page description from "${pageDescription.substring(0, 50)}..." to be more detailed for ${businessType} customers to want to click`
        case 'images':
          return `Add brief descriptions to all ${imageCount} images (with descriptions suitable for ${businessType})`
        case 'speed':
          return `Reduce the size of ${imageCount} images and remove unnecessary plugins`
        case 'mobile':
          return `Adjust button and text sizes so the "${pageTitle}" page is easy to view on mobile`
        default:
          return cat.suggestions[0] || 'Try to improve this area'
      }
    } else {
      switch (cat.id) {
        case 'title':
          return `현재 제목 "${pageTitle}"을 더 매력적이고 구체적으로 만들어보세요 (${businessType}에 맞는 키워드 포함)`
        case 'description':
          return `페이지 설명을 "${pageDescription.substring(0, 50)}..."에서 ${businessType} 고객이 클릭하고 싶게 자세히 작성해보세요`
        case 'images':
          return `${imageCount}개의 이미지마다 간단한 설명을 추가해보세요 (${businessType}에 맞는 설명으로)`
        case 'speed':
          return `${imageCount}개의 이미지 크기를 줄이고 불필요한 플러그인을 제거해보세요`
        case 'mobile':
          return `모바일에서 "${pageTitle}" 페이지를 보기 편하도록 버튼과 글자 크기를 조정해보세요`
        default:
          return cat.suggestions[0] || '해당 영역을 개선해보세요'
      }
    }
  })
  
  if (priorityActions.length === 0) {
    priorityActions.push(locale === 'en' 
      ? 'Current state is good, try to consistently update content'
      : '현재 상태가 좋으니 꾸준히 콘텐츠를 업데이트해보세요')
  }
  
  // 업종별 팁 (실제 페이지 내용을 반영)
  const industryTips: { [key: string]: { [key: string]: string[] } } = {
    ko: {
    '음식점': [
      `"${pageTitle}"에서 메뉴 사진을 고화질로 올리고 가격 정보를 명확히 표시하세요`,
      `현재 ${wordCount}자의 내용에 영업시간과 위치 정보를 추가해서 고객이 쉽게 찾을 수 있게 하세요`
    ],
    '카페': [
      `"${pageTitle}" 페이지에 분위기가 느껴지는 매장 사진과 시그니처 메뉴를 강조하세요`,
      `현재 ${imageCount}개의 이미지 외에 인스타그램 연동으로 최신 사진들을 보여주세요`
    ],
    '미용실': [
      `"${pageTitle}" 페이지에 전후 변화 사진과 스타일별 가격표를 명확히 보여주세요`,
      `현재 내용에 예약 버튼을 크고 눈에 띄게 만들어 쉽게 예약할 수 있게 하세요`
    ],
    '쇼핑몰': [
      `현재 ${imageCount}개의 상품 사진을 여러 각도에서 보여주고 상세 설명을 충분히 작성하세요`,
      `"${pageTitle}" 페이지에 고객 후기와 평점을 잘 보이는 곳에 배치하세요`
    ],
    '기타': [
      `"${pageTitle}" 관련해서 고객이 자주 묻는 질문들을 정리해서 홈페이지에 올려보세요`,
      `현재 ${wordCount}자의 내용에 연락처와 위치 정보를 쉽게 찾을 수 있게 만드세요`
    ]
    },
    en: {
      'restaurant': [
        `Upload high-quality menu photos and clearly display pricing information on "${pageTitle}"`,
        `Add business hours and location information to your current ${wordCount}-word content so customers can easily find you`
      ],
      'cafe': [
        `Emphasize atmospheric store photos and signature menu items on your "${pageTitle}" page`,
        `Show latest photos through Instagram integration in addition to your current ${imageCount} images`
      ],
      'beauty salon': [
        `Clearly show before/after transformation photos and style-specific price lists on your "${pageTitle}" page`,
        `Make the reservation button large and prominent in your current content for easy booking`
      ],
      'shopping mall': [
        `Show your current ${imageCount} product photos from multiple angles and write detailed descriptions`,
        `Place customer reviews and ratings in prominent locations on your "${pageTitle}" page`
      ],
      'other': [
        `Organize frequently asked questions about "${pageTitle}" and post them on your website`,
        `Make contact and location information easily findable in your current ${wordCount}-word content`
      ]
    }
  }
  
  const localeIndustryTips = industryTips[locale] || industryTips['ko']
  const businessKey = locale === 'en' ? (
    businessType === '음식점' ? 'restaurant' :
    businessType === '카페' ? 'cafe' :
    businessType === '미용실' ? 'beauty salon' :
    businessType === '쇼핑몰' ? 'shopping mall' : 'other'
  ) : businessType
  
  const tips = localeIndustryTips[businessKey] || localeIndustryTips[locale === 'en' ? 'other' : '기타']
  
  const expectedResults = locale === 'en' 
    ? `By applying these improvements to your "${pageTitle}" page one by one, ${businessType} customers will be able to find you better in search results, and more visitors will convert to actual customers!`
    : `"${pageTitle}" 페이지의 이런 개선사항들을 하나씩 적용하면 ${businessType} 고객들이 검색에서 더 잘 찾을 수 있고, 더 많은 방문자가 실제 고객으로 전환될 거예요!`

  return {
    overallAdvice,
    priorityActions,
    industrySpecificTips: tips,
    expectedResults
  }
}

// 키워드 제안 생성
export async function generateKeywordSuggestions(
  pageData: any,
  businessType: string,
  locale: string = 'ko'
): Promise<string[]> {
  // OpenAI가 사용 불가능한 경우 기본 키워드 제공
  if (!openai) {
    return generateFallbackKeywords(businessType, pageData, locale)
  }
  
  try {
    const prompt = locale === 'en' ? `
Please recommend 5 SEO keywords for a "${businessType}" industry website.

Current page details:
- Title: "${pageData.title}"
- Description: "${pageData.description || 'None'}"
- Main content: "${pageData.content?.substring(0, 300) || 'No content'}"
- Headings: ${pageData.h1Tags?.concat(pageData.h2Tags || []).slice(0, 3).join(', ') || 'None'}
- Number of images: ${pageData.images?.length || 0}
- Word count: ${pageData.wordCount || 0}

Requirements:
- Keywords that customers would actually search for based on the page content above
- Keywords that are not too competitive
- Include location-based keywords when possible
- Keywords that match the actual page title and content
- Easy to understand for beginners

Respond in JSON array format: ["keyword1", "keyword2", ...]
` : `
"${businessType}" 업종의 웹사이트를 위한 SEO 키워드를 5개 추천해주세요.

현재 페이지 상세 정보:
- 제목: "${pageData.title}"
- 설명: "${pageData.description || '없음'}"
- 주요 내용: "${pageData.content?.substring(0, 300) || '내용 없음'}"
- 소제목들: ${pageData.h1Tags?.concat(pageData.h2Tags || []).slice(0, 3).join(', ') || '없음'}
- 이미지 수: ${pageData.images?.length || 0}개
- 글자 수: ${pageData.wordCount || 0}자

요구사항:
- 위 페이지 내용을 바탕으로 고객이 실제로 검색할 만한 키워드
- 경쟁이 너무 심하지 않은 키워드
- 지역명이 들어간 키워드도 포함 (가능한 경우)
- 실제 페이지 제목과 내용에 맞는 키워드
- 초보자도 이해할 수 있는 설명과 함께

JSON 배열 형태로 응답: ["키워드1", "키워드2", ...]
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 300
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error(locale === 'en' ? 'Unable to get keyword recommendations.' : '키워드 추천을 받을 수 없습니다.')
    }

    const keywords = JSON.parse(response)
    return Array.isArray(keywords) ? keywords : []

  } catch (error) {
    console.error('키워드 추천 오류:', error)
    
    // 기본 키워드 반환
    return generateFallbackKeywords(businessType, pageData, locale)
  }
}

// 기본 키워드 제안 (OpenAI 미사용시)
function generateFallbackKeywords(businessType: string, pageData: any, locale: string = 'ko'): string[] {
  const pageTitle = pageData.title || ''
  const titleWords = pageTitle.split(' ').filter((word: string) => word.length > 1)
  
  const defaultKeywords: { [key: string]: { [key: string]: string[] } } = {
    ko: {
      '음식점': ['맛집', '음식점', '메뉴', '예약', '리뷰'],
      '카페': ['카페', '커피', '디저트', '분위기', '와이파이'],
      '미용실': ['미용실', '헤어', '파마', '염색', '예약'],
      '쇼핑몰': ['쇼핑', '할인', '배송', '상품', '리뷰'],
      '병원': ['병원', '의원', '치료', '진료', '예약'],
      '교육': ['교육', '학원', '강의', '수업', '학습'],
      '기술': ['개발', 'IT', '서비스', '솔루션', '컨설팅'],
      '기타': ['서비스', '문의', '예약', '정보', '리뷰']
    },
    en: {
      'restaurant': ['restaurant', 'food', 'menu', 'booking', 'reviews'],
      'cafe': ['cafe', 'coffee', 'dessert', 'atmosphere', 'wifi'],
      'beauty salon': ['salon', 'hair', 'styling', 'beauty', 'appointment'],
      'shopping mall': ['shopping', 'discount', 'delivery', 'products', 'reviews'],
      'hospital': ['hospital', 'clinic', 'treatment', 'medical', 'appointment'],
      'education': ['education', 'school', 'courses', 'learning', 'classes'],
      'technology': ['development', 'IT', 'services', 'solutions', 'consulting'],
      'other': ['services', 'contact', 'booking', 'information', 'reviews']
    }
  }
  
  const localeKeywords = defaultKeywords[locale] || defaultKeywords['ko']
  const businessKey = locale === 'en' ? (
    businessType === '음식점' ? 'restaurant' :
    businessType === '카페' ? 'cafe' :
    businessType === '미용실' ? 'beauty salon' :
    businessType === '쇼핑몰' ? 'shopping mall' :
    businessType === '병원' ? 'hospital' :
    businessType === '교육' ? 'education' :
    businessType === '기술' ? 'technology' : 'other'
  ) : businessType
  
  let keywords = localeKeywords[businessKey] || localeKeywords[locale === 'en' ? 'other' : '기타']
  
  // 페이지 제목에서 의미있는 단어들을 추가
  if (titleWords.length > 0) {
    keywords = [...keywords.slice(0, 3), ...titleWords.slice(0, 2)]
  }
  
  return keywords.slice(0, 5)
}