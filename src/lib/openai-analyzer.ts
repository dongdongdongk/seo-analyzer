import OpenAI from 'openai'
import { AnalysisResult } from '@/types/analysis'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 사이트 타입 분석
export function detectSiteType(pageData: any): string {
  const title = pageData.title?.toLowerCase() || ''
  const content = pageData.content?.toLowerCase() || ''
  const url = pageData.url?.toLowerCase() || ''

  // 키워드 기반 사이트 타입 감지
  if (
    title.includes('쇼핑') || 
    title.includes('구매') || 
    content.includes('장바구니') ||
    content.includes('결제') ||
    url.includes('shop') ||
    url.includes('store')
  ) {
    return '온라인 쇼핑몰'
  }
  
  if (
    title.includes('블로그') ||
    title.includes('일기') ||
    content.includes('포스팅') ||
    content.includes('게시글') ||
    url.includes('blog') ||
    url.includes('tistory') ||
    url.includes('naver')
  ) {
    return '개인 블로그'
  }
  
  if (
    title.includes('회사') ||
    title.includes('기업') ||
    title.includes('서비스') ||
    content.includes('회사소개') ||
    content.includes('연혁')
  ) {
    return '기업 웹사이트'
  }
  
  if (
    title.includes('카페') ||
    title.includes('음식점') ||
    title.includes('미용실') ||
    title.includes('병원') ||
    content.includes('예약') ||
    content.includes('영업시간') ||
    content.includes('주소')
  ) {
    return '로컬 비즈니스'
  }
  
  if (
    title.includes('포트폴리오') ||
    title.includes('작품') ||
    content.includes('프로젝트') ||
    content.includes('경력')
  ) {
    return '포트폴리오'
  }
  
  return '일반 웹사이트'
}

// 업종 분석
export function detectBusinessType(pageData: any): string {
  const title = pageData.title?.toLowerCase() || ''
  const content = pageData.content?.toLowerCase() || ''
  
  const businessKeywords = {
    '음식점': ['음식', '맛집', '레스토랑', '식당', '요리', '메뉴'],
    '카페': ['카페', '커피', '원두', '디저트', '음료'],
    '미용실': ['미용실', '헤어', '파마', '염색', '컷', '스타일링'],
    '병원': ['병원', '의원', '치료', '진료', '건강', '의료'],
    '쇼핑몰': ['쇼핑', '구매', '상품', '배송', '할인'],
    '교육': ['교육', '학원', '강의', '수업', '학습'],
    '기술': ['개발', '프로그래밍', 'IT', '소프트웨어', '앱'],
  }
  
  for (const [business, keywords] of Object.entries(businessKeywords)) {
    if (keywords.some(keyword => title.includes(keyword) || content.includes(keyword))) {
      return business
    }
  }
  
  return '기타'
}

// GPT 기반 맞춤 조언 생성
export async function generatePersonalizedAdvice(
  analysisResult: AnalysisResult,
  pageData: any
): Promise<{
  overallAdvice: string
  priorityActions: string[]
  industrySpecificTips: string[]
  expectedResults: string
}> {
  try {
    const siteType = detectSiteType(pageData)
    const businessType = detectBusinessType(pageData)
    
    // 분석 결과 요약
    const problemAreas = analysisResult.categories
      .filter(cat => cat.status === 'danger' || cat.status === 'warning')
      .map(cat => `${cat.name}: ${cat.description}`)
      .join('\n')
    
    const goodAreas = analysisResult.categories
      .filter(cat => cat.status === 'good')
      .map(cat => cat.name)
      .join(', ')

    const prompt = `
당신은 초보자도 이해할 수 있는 SEO 전문가입니다. 다음 웹사이트의 분석 결과를 바탕으로 맞춤형 조언을 해주세요.

## 웹사이트 정보
- URL: ${analysisResult.url}
- 사이트 유형: ${siteType}
- 업종: ${businessType}
- 전체 점수: ${analysisResult.overallScore}점

## 문제점
${problemAreas || '특별한 문제점이 발견되지 않았습니다.'}

## 잘하고 있는 부분
${goodAreas || '없음'}

## 요청사항
다음 4가지를 초보자도 이해할 수 있는 쉬운 말로 작성해주세요:

1. **전체적인 조언 (2-3문장)**: 현재 상태를 요약하고 격려 메시지
2. **우선순위 개선 작업 (3-5개)**: 가장 중요한 것부터 순서대로
3. **업종별 특화 팁 (2-3개)**: ${businessType} 업종에 특화된 SEO 팁
4. **예상 결과 (1-2문장)**: 개선 후 기대할 수 있는 효과

## 작성 규칙
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
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 초보자를 위한 친절한 SEO 컨설턴트입니다. 항상 쉬운 말로 설명하고 격려하는 말투를 사용합니다."
        },
        {
          role: "user",
          content: prompt
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
    
    return {
      overallAdvice: advice.overallAdvice || "웹사이트가 전반적으로 잘 관리되고 있어요!",
      priorityActions: advice.priorityActions || ["현재 상태를 유지하세요"],
      industrySpecificTips: advice.industrySpecificTips || ["업종 특성에 맞는 키워드를 활용해보세요"],
      expectedResults: advice.expectedResults || "꾸준히 관리하면 더 많은 고객이 찾아올 거예요!"
    }

  } catch (error) {
    console.error('OpenAI API 오류:', error)
    
    // API 실패 시 기본 조언 제공
    return generateFallbackAdvice(analysisResult, pageData)
  }
}

// OpenAI API 실패 시 대체 조언
function generateFallbackAdvice(
  analysisResult: AnalysisResult,
  pageData: any
): {
  overallAdvice: string
  priorityActions: string[]
  industrySpecificTips: string[]
  expectedResults: string
} {
  const siteType = detectSiteType(pageData)
  const businessType = detectBusinessType(pageData)
  const score = analysisResult.overallScore
  
  let overallAdvice = ""
  if (score >= 80) {
    overallAdvice = "웹사이트가 매우 잘 관리되고 있어요! 현재 상태를 유지하면서 조금씩 개선해나가면 완벽할 거예요."
  } else if (score >= 60) {
    overallAdvice = "웹사이트가 괜찮은 상태예요! 몇 가지만 개선하면 훨씬 더 많은 고객이 찾아올 수 있어요."
  } else {
    overallAdvice = "개선할 부분이 있지만 걱정하지 마세요! 하나씩 차근차근 개선해나가면 분명 좋아질 거예요."
  }
  
  // 문제 영역 기반 우선순위 생성
  const problemCategories = analysisResult.categories
    .filter(cat => cat.status === 'danger' || cat.status === 'warning')
    .sort((a, b) => a.score - b.score) // 점수가 낮은 것부터
  
  const priorityActions = problemCategories.slice(0, 4).map(cat => {
    switch (cat.id) {
      case 'title':
        return '페이지 제목을 더 매력적이고 구체적으로 만들어보세요'
      case 'description':
        return '페이지 설명을 고객이 클릭하고 싶게 자세히 작성해보세요'
      case 'images':
        return '이미지마다 간단한 설명을 추가해보세요'
      case 'speed':
        return '이미지 크기를 줄이고 불필요한 플러그인을 제거해보세요'
      case 'mobile':
        return '모바일에서 보기 편하도록 버튼과 글자 크기를 조정해보세요'
      default:
        return cat.suggestions[0] || '해당 영역을 개선해보세요'
    }
  })
  
  if (priorityActions.length === 0) {
    priorityActions.push('현재 상태가 좋으니 꾸준히 콘텐츠를 업데이트해보세요')
  }
  
  // 업종별 팁
  const industryTips: { [key: string]: string[] } = {
    '음식점': [
      '메뉴 사진을 고화질로 올리고 가격 정보를 명확히 표시하세요',
      '영업시간과 위치 정보를 홈페이지 상단에 눈에 잘 보이게 배치하세요'
    ],
    '카페': [
      '분위기가 느껴지는 매장 사진과 시그니처 메뉴를 강조하세요',
      '인스타그램 연동으로 최신 사진들을 보여주세요'
    ],
    '미용실': [
      '전후 변화 사진과 스타일별 가격표를 명확히 보여주세요',
      '예약 버튼을 크고 눈에 띄게 만들어 쉽게 예약할 수 있게 하세요'
    ],
    '쇼핑몰': [
      '상품 사진을 여러 각도에서 보여주고 상세 설명을 충분히 작성하세요',
      '고객 후기와 평점을 잘 보이는 곳에 배치하세요'
    ],
    '기타': [
      '고객이 자주 묻는 질문들을 정리해서 홈페이지에 올려보세요',
      '연락처와 위치 정보를 쉽게 찾을 수 있게 만드세요'
    ]
  }
  
  const tips = industryTips[businessType] || industryTips['기타']
  
  return {
    overallAdvice,
    priorityActions,
    industrySpecificTips: tips,
    expectedResults: "이런 개선사항들을 하나씩 적용하면 검색에서 더 잘 보이고 고객들이 더 많이 찾아올 거예요!"
  }
}

// 키워드 제안 생성
export async function generateKeywordSuggestions(
  pageData: any,
  businessType: string
): Promise<string[]> {
  try {
    const prompt = `
"${businessType}" 업종의 웹사이트를 위한 SEO 키워드를 5개 추천해주세요.

현재 페이지 정보:
- 제목: ${pageData.title}
- 내용 일부: ${pageData.content?.substring(0, 200)}

요구사항:
- 고객이 실제로 검색할 만한 키워드
- 경쟁이 너무 심하지 않은 키워드
- 지역명이 들어간 키워드도 포함 (가능한 경우)
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
      throw new Error('키워드 추천을 받을 수 없습니다.')
    }

    const keywords = JSON.parse(response)
    return Array.isArray(keywords) ? keywords : []

  } catch (error) {
    console.error('키워드 추천 오류:', error)
    
    // 기본 키워드 반환
    const defaultKeywords: { [key: string]: string[] } = {
      '음식점': ['맛집', '음식점', '메뉴', '예약', '리뷰'],
      '카페': ['카페', '커피', '디저트', '분위기', '와이파이'],
      '미용실': ['미용실', '헤어', '파마', '염색', '예약'],
      '쇼핑몰': ['쇼핑', '할인', '배송', '상품', '리뷰'],
      '기타': ['서비스', '문의', '예약', '정보', '리뷰']
    }
    
    return defaultKeywords[businessType] || defaultKeywords['기타']
  }
}