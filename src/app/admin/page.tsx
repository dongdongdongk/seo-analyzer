'use client'

import { useState, useEffect } from 'react'

interface FeedbackStats {
  totalFeedbacks: number
  averageRating: number
  helpfulPercentage: number
  commonSuggestions: Array<{
    suggestion: string
    count: number
  }>
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  recentTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  lastUpdated: string
}

interface RecentFeedback {
  rating: number
  helpful: boolean
  timestamp: string
  hasComment: boolean
  hasSuggestions: boolean
}

export default function AdminPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFeedbackData()
  }, [])

  const fetchFeedbackData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 통계 데이터 가져오기
      const [statsResponse, recentResponse] = await Promise.all([
        fetch('/api/feedback?type=stats'),
        fetch('/api/feedback?type=recent')
      ])
      
      if (!statsResponse.ok || !recentResponse.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.')
      }
      
      const statsData = await statsResponse.json()
      const recentData = await recentResponse.json()
      
      setStats(statsData.data)
      setRecentFeedbacks(recentData.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const clearFeedbackData = async () => {
    if (!confirm('정말로 모든 피드백 데이터를 삭제하시겠습니까?')) {
      return
    }
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.')
      }
      
      alert('피드백 데이터가 삭제되었습니다.')
      fetchFeedbackData()
      
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      case 'stable': return '📊'
      default: return '❓'
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving': return '개선되고 있어요'
      case 'declining': return '악화되고 있어요'
      case 'stable': return '안정적이에요'
      default: return '데이터 부족'
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="loading"></div>
          <span className="ml-md">데이터를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="card text-center">
          <h1 className="font-xl mb-md">❌ 오류 발생</h1>
          <p className="font-md text-secondary mb-lg">{error}</p>
          <button onClick={fetchFeedbackData} className="btn btn-primary">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="text-center mb-xl">
        <h1 className="font-xxxl mb-sm">📊 피드백 관리 대시보드</h1>
        <p className="font-lg text-secondary">사용자 피드백 현황 및 서비스 개선 지표</p>
      </div>

      {/* 전체 통계 */}
      {stats && (
        <>
          <div className="card mb-xl">
            <h2 className="font-xl mb-lg">📈 전체 통계</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--spacing-lg)' 
            }}>
              <div className="text-center p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="font-xxl mb-sm">📝</div>
                <div className="font-xxxl font-weight-bold mb-xs">{stats.totalFeedbacks}</div>
                <div className="font-sm text-secondary">총 피드백 수</div>
              </div>
              
              <div className="text-center p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="font-xxl mb-sm">⭐</div>
                <div className="font-xxxl font-weight-bold mb-xs">{stats.averageRating}</div>
                <div className="font-sm text-secondary">평균 별점</div>
              </div>
              
              <div className="text-center p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="font-xxl mb-sm">👍</div>
                <div className="font-xxxl font-weight-bold mb-xs">{stats.helpfulPercentage}%</div>
                <div className="font-sm text-secondary">도움됨 비율</div>
              </div>
              
              <div className="text-center p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="font-xxl mb-sm">{getTrendEmoji(stats.recentTrend)}</div>
                <div className="font-lg font-weight-bold mb-xs">{getTrendText(stats.recentTrend)}</div>
                <div className="font-sm text-secondary">최근 트렌드</div>
              </div>
            </div>
          </div>

          {/* 별점 분포 */}
          <div className="card mb-xl">
            <h2 className="font-xl mb-lg">⭐ 별점 분포</h2>
            <div className="flex flex-col gap-md">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-md">
                  <span className="font-md" style={{ minWidth: '60px' }}>
                    {rating}점 ⭐
                  </span>
                  <div 
                    className="flex-1 p-xs"
                    style={{ 
                      backgroundColor: 'var(--color-gray-200)', 
                      borderRadius: 'var(--radius-sm)',
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        backgroundColor: rating >= 4 ? 'var(--color-primary)' : rating >= 3 ? 'var(--color-warning)' : 'var(--color-danger)',
                        height: '20px',
                        borderRadius: 'var(--radius-sm)',
                        width: stats.totalFeedbacks > 0 ? `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalFeedbacks) * 100}%` : '0%',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <span className="font-sm text-secondary" style={{ minWidth: '50px' }}>
                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}개
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 공통 제안사항 */}
          {stats.commonSuggestions.length > 0 && (
            <div className="card mb-xl">
              <h2 className="font-xl mb-lg">💡 많이 요청된 개선사항</h2>
              <div className="flex flex-col gap-sm">
                {stats.commonSuggestions.map((item, index) => (
                  <div key={index} className="flex items-center gap-md p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-lg font-weight-bold" style={{ color: 'var(--color-primary)', minWidth: '30px' }}>
                      {index + 1}.
                    </span>
                    <span className="font-md flex-1">{item.suggestion}</span>
                    <span className="font-sm text-secondary" style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'var(--color-text-white)', 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-sm)' 
                    }}>
                      {item.count}회
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 최근 피드백 */}
      {recentFeedbacks.length > 0 && (
        <div className="card mb-xl">
          <h2 className="font-xl mb-lg">🕒 최근 피드백 (최대 10개)</h2>
          <div className="flex flex-col gap-sm">
            {recentFeedbacks.map((feedback, index) => (
              <div key={index} className="flex items-center gap-md p-md" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-xs">
                  <span className="font-md">{feedback.rating}⭐</span>
                  <span className="font-sm">
                    {feedback.helpful ? '👍' : '👎'}
                  </span>
                </div>
                <div className="flex gap-xs">
                  {feedback.hasComment && (
                    <span className="font-xs p-xs" style={{ backgroundColor: 'var(--color-info)', color: 'var(--color-text-white)', borderRadius: 'var(--radius-sm)' }}>
                      💬
                    </span>
                  )}
                  {feedback.hasSuggestions && (
                    <span className="font-xs p-xs" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-text-white)', borderRadius: 'var(--radius-sm)' }}>
                      💡
                    </span>
                  )}
                </div>
                <span className="font-sm text-secondary ml-auto">
                  {new Date(feedback.timestamp).toLocaleString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관리 도구 */}
      <div className="card text-center">
        <h2 className="font-xl mb-lg">🔧 관리 도구</h2>
        <div className="flex gap-md justify-center">
          <button onClick={fetchFeedbackData} className="btn btn-primary">
            🔄 데이터 새로고침
          </button>
          <button onClick={clearFeedbackData} className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
            🗑️ 모든 데이터 삭제
          </button>
        </div>
        {stats && (
          <p className="font-sm text-secondary mt-md">
            마지막 업데이트: {new Date(stats.lastUpdated).toLocaleString('ko-KR')}
          </p>
        )}
      </div>
    </div>
  )
}