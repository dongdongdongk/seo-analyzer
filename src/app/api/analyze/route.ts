import { NextRequest, NextResponse } from 'next/server'

// 분석 결과 타입 정의
interface AnalysisResult {
  url: string
  overallScore: number
  categories: Array<{
    id: string
    name: string
    status: 'good' | 'warning' | 'danger'
    score: number
    description: string
    suggestions: string[]
  }>
}

// POST 요청 처리 (SEO 분석 시작)
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    // URL 유효성 검사
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '올바른 웹사이트 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // URL 형식 검사
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        { error: '웹사이트 주소는 http:// 또는 https://로 시작해야 합니다.' },
        { status: 400 }
      )
    }

    // 실제 분석 로직 (현재는 데모용)
    // 추후 실제 웹사이트 분석 로직으로 교체
    const analysisResult = await performSEOAnalysis(url)
    
    return NextResponse.json({
      success: true,
      data: analysisResult
    })
    
  } catch (error) {
    console.error('분석 중 오류 발생:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// 실제 SEO 분석 로직 (현재는 데모용)
async function performSEOAnalysis(url: string): Promise<AnalysisResult> {
  // 실제 구현 시 여기에 다음 기능들을 추가:
  // 1. 웹사이트 크롤링
  // 2. 메타 태그 분석
  // 3. 페이지 속도 측정
  // 4. 모바일 친화도 검사
  // 5. 이미지 최적화 상태 확인
  // 6. AI 기반 콘텐츠 분석
  
  // 현재는 데모용 랜덤 결과 반환
  const categories = [
    {
      id: 'title',
      name: '페이지 제목',
      status: Math.random() > 0.3 ? 'good' : 'warning',
      score: Math.floor(Math.random() * 40) + 60,
      description: '',
      suggestions: []
    },
    {
      id: 'description',
      name: '페이지 설명',
      status: Math.random() > 0.5 ? 'good' : 'warning',
      score: Math.floor(Math.random() * 40) + 60,
      description: '',
      suggestions: []
    },
    {
      id: 'speed',
      name: '사이트 속도',
      status: Math.random() > 0.7 ? 'good' : 'danger',
      score: Math.floor(Math.random() * 60) + 40,
      description: '',
      suggestions: []
    },
    {
      id: 'mobile',
      name: '모바일 친화도',
      status: Math.random() > 0.2 ? 'good' : 'warning',
      score: Math.floor(Math.random() * 30) + 70,
      description: '',
      suggestions: []
    },
    {
      id: 'images',
      name: '이미지 최적화',
      status: Math.random() > 0.4 ? 'warning' : 'good',
      score: Math.floor(Math.random() * 50) + 50,
      description: '',
      suggestions: []
    }
  ]

  // 각 카테고리별 세부 정보 설정
  categories.forEach(category => {
    switch (category.id) {
      case 'title':
        if (category.status === 'good') {
          category.description = '페이지 제목이 잘 설정되어 있어요! 고객이 검색할 때 쉽게 찾을 수 있습니다.'
          category.suggestions = [
            '현재 제목이 적절한 길이입니다',
            '키워드가 자연스럽게 포함되어 있습니다'
          ]
        } else {
          category.description = '페이지 제목을 더 매력적으로 만들 수 있을 것 같아요.'
          category.suggestions = [
            '제목을 50-60자 정도로 맞춰보세요',
            '고객이 검색할 만한 키워드를 포함해보세요'
          ]
        }
        break
      
      case 'description':
        if (category.status === 'good') {
          category.description = '페이지 설명이 잘 작성되어 있어요! 고객이 클릭하고 싶어할 것 같습니다.'
          category.suggestions = [
            '설명이 적절한 길이입니다',
            '고객의 관심을 끌 수 있는 내용입니다'
          ]
        } else {
          category.description = '페이지 설명을 더 자세히 작성하면 더 많은 고객이 클릭할 것 같아요.'
          category.suggestions = [
            '설명을 120-150자 정도로 늘려보세요',
            '고객이 관심 가질 만한 키워드를 추가해보세요'
          ]
        }
        break
      
      case 'speed':
        if (category.status === 'good') {
          category.description = '사이트 속도가 빨라요! 고객이 기다리지 않고 바로 볼 수 있습니다.'
          category.suggestions = [
            '로딩 속도가 매우 빠릅니다',
            '고객 경험에 좋은 속도입니다'
          ]
        } else {
          category.description = '사이트가 조금 느려요. 고객이 기다리다 다른 곳으로 갈 수 있어요.'
          category.suggestions = [
            '이미지 크기를 줄여보세요',
            '사용하지 않는 플러그인을 제거해보세요'
          ]
        }
        break
      
      case 'mobile':
        if (category.status === 'good') {
          category.description = '모바일에서 완벽하게 보여요! 요즘 대부분의 고객이 핸드폰으로 접속하는데 잘 준비되어 있네요.'
          category.suggestions = [
            '모바일 최적화가 잘 되어 있습니다',
            '터치하기 쉬운 크기로 버튼이 설정되어 있습니다'
          ]
        } else {
          category.description = '모바일에서 조금 불편할 수 있어요. 핸드폰으로 보는 고객을 위해 개선해보세요.'
          category.suggestions = [
            '버튼 크기를 조금 더 크게 만들어보세요',
            '텍스트가 작아서 읽기 어려울 수 있어요'
          ]
        }
        break
      
      case 'images':
        if (category.status === 'good') {
          category.description = '이미지가 잘 최적화되어 있어요! 검색에서도 잘 나타날 것 같습니다.'
          category.suggestions = [
            '이미지 크기가 적절합니다',
            '이미지 설명이 잘 작성되어 있습니다'
          ]
        } else {
          category.description = '이미지에 설명을 추가하면 검색에서 더 잘 찾을 수 있어요.'
          category.suggestions = [
            '이미지마다 간단한 설명을 추가해보세요',
            '이미지 파일명을 의미있게 바꿔보세요'
          ]
        }
        break
    }
  })

  // 전체 점수 계산
  const overallScore = Math.floor(
    categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length
  )

  return {
    url,
    overallScore,
    categories
  }
}