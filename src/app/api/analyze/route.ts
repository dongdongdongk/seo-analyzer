import { NextRequest, NextResponse } from 'next/server'
import { analyzeSEO } from '@/lib/seo-analyzer'

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

    // 실제 SEO 분석 실행
    const analysisResult = await analyzeSEO(url)
    
    return NextResponse.json({
      success: true,
      data: analysisResult
    })
    
  } catch (error) {
    console.error('분석 중 오류 발생:', error)
    console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    // 더 구체적인 오류 메시지 제공
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    
    return NextResponse.json(
      { 
        error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

