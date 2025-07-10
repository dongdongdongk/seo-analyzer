import { NextRequest, NextResponse } from 'next/server'

// 피드백 데이터 타입
interface FeedbackData {
  rating: number
  helpful: boolean
  comment?: string
  suggestions?: string[]
  url?: string
  timestamp: string
  userAgent: string
}

// 피드백 저장소 (실제 환경에서는 데이터베이스 사용)
let feedbackStore: FeedbackData[] = []

// POST 요청 처리 (피드백 제출)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, helpful, comment, suggestions, url } = body
    
    // 필수 필드 검증
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '올바른 별점을 선택해주세요. (1-5점)' },
        { status: 400 }
      )
    }
    
    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: '도움 여부를 선택해주세요.' },
        { status: 400 }
      )
    }
    
    // 피드백 데이터 생성
    const feedbackData: FeedbackData = {
      rating,
      helpful,
      comment: comment?.trim() || undefined,
      suggestions: Array.isArray(suggestions) ? suggestions : undefined,
      url: url || undefined,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
    
    // 피드백 저장 (실제 환경에서는 데이터베이스에 저장)
    feedbackStore.push(feedbackData)
    
    // 콘솔에 피드백 로그 (개발용)
    console.log('📝 새로운 피드백 수신:', JSON.stringify(feedbackData, null, 2))
    
    // 피드백 분석
    const analysis = analyzeFeedback()
    console.log('📊 피드백 통계:', analysis)
    
    return NextResponse.json({
      success: true,
      message: '소중한 의견 감사합니다! 더 나은 서비스로 보답하겠습니다.',
      feedbackId: feedbackStore.length
    })
    
  } catch (error) {
    console.error('피드백 처리 오류:', error)
    return NextResponse.json(
      { error: '피드백 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// GET 요청 처리 (피드백 통계 조회)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    
    if (type === 'stats') {
      // 피드백 통계 반환
      const analysis = analyzeFeedback()
      return NextResponse.json({
        success: true,
        data: analysis
      })
    } else if (type === 'recent') {
      // 최근 피드백 반환 (개인정보 제외)
      const recentFeedback = feedbackStore
        .slice(-10)
        .map(feedback => ({
          rating: feedback.rating,
          helpful: feedback.helpful,
          timestamp: feedback.timestamp,
          hasComment: !!feedback.comment,
          hasSuggestions: !!feedback.suggestions
        }))
      
      return NextResponse.json({
        success: true,
        data: recentFeedback
      })
    } else {
      return NextResponse.json(
        { error: '올바른 요청 타입을 지정해주세요. (stats 또는 recent)' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('피드백 조회 오류:', error)
    return NextResponse.json(
      { error: '피드백 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 피드백 분석 함수
function analyzeFeedback() {
  if (feedbackStore.length === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      helpfulPercentage: 0,
      commonSuggestions: [],
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentTrend: 'insufficient_data'
    }
  }
  
  const total = feedbackStore.length
  const totalRating = feedbackStore.reduce((sum, fb) => sum + fb.rating, 0)
  const averageRating = Math.round((totalRating / total) * 10) / 10
  
  const helpfulCount = feedbackStore.filter(fb => fb.helpful).length
  const helpfulPercentage = Math.round((helpfulCount / total) * 100)
  
  // 별점 분포
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  feedbackStore.forEach(fb => {
    ratingDistribution[fb.rating as keyof typeof ratingDistribution]++
  })
  
  // 공통 제안사항
  const allSuggestions = feedbackStore
    .flatMap(fb => fb.suggestions || [])
    .filter(Boolean)
  
  const suggestionCounts = allSuggestions.reduce((counts, suggestion) => {
    counts[suggestion] = (counts[suggestion] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  const commonSuggestions = Object.entries(suggestionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([suggestion, count]) => ({ suggestion, count }))
  
  // 최근 트렌드 (최근 5개 vs 이전 데이터)
  let recentTrend = 'stable'
  if (total >= 10) {
    const recent5 = feedbackStore.slice(-5)
    const previous5 = feedbackStore.slice(-10, -5)
    
    const recentAvg = recent5.reduce((sum, fb) => sum + fb.rating, 0) / 5
    const previousAvg = previous5.reduce((sum, fb) => sum + fb.rating, 0) / 5
    
    if (recentAvg > previousAvg + 0.5) {
      recentTrend = 'improving'
    } else if (recentAvg < previousAvg - 0.5) {
      recentTrend = 'declining'
    }
  }
  
  return {
    totalFeedbacks: total,
    averageRating,
    helpfulPercentage,
    commonSuggestions,
    ratingDistribution,
    recentTrend,
    lastUpdated: new Date().toISOString()
  }
}

// 피드백 데이터 초기화 (개발용)
export async function DELETE(request: NextRequest) {
  try {
    feedbackStore = []
    return NextResponse.json({
      success: true,
      message: '피드백 데이터가 초기화되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: '초기화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}