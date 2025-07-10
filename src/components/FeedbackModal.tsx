'use client'

import { useState } from 'react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  analysisUrl: string
  onSubmit: (feedback: {
    rating: number
    helpful: boolean
    comment?: string
    suggestions?: string[]
  }) => void
}

export default function FeedbackModal({ isOpen, onClose, analysisUrl, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [comment, setComment] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const suggestionOptions = [
    '분석 속도를 더 빠르게 해주세요',
    '더 많은 SEO 항목을 분석해주세요',
    '설명을 더 자세히 해주세요',
    '모바일 앱으로도 만들어주세요',
    '분석 결과를 PDF로 저장하고 싶어요',
    '정기적으로 재분석 알림을 받고 싶어요'
  ]

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('별점을 선택해주세요!')
      return
    }
    
    if (helpful === null) {
      alert('도움이 되었는지 선택해주세요!')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        rating,
        helpful,
        comment: comment.trim() || undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      })
      
      // 성공 시 모달 닫기
      onClose()
      alert('소중한 의견 감사합니다! 더 나은 서비스로 보답하겠습니다. 😊')
      
    } catch (error) {
      alert('피드백 전송 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestionToggle = (suggestion: string) => {
    setSuggestions(prev => 
      prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    )
  }

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-xl mx-md max-w-md w-full max-h-screen overflow-y-auto"
        style={{ backgroundColor: 'var(--color-bg-primary)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-xl font-weight-bold">📝 서비스 평가</h2>
          <button 
            onClick={onClose}
            className="font-xxl text-secondary"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* 별점 평가 */}
          <div className="mb-lg">
            <label className="block font-md font-weight-bold mb-sm">
              전체적으로 몇 점을 주시겠어요? ⭐
            </label>
            <div className="flex gap-xs">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="font-xxl"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: star <= rating ? '#FFD700' : '#DDD'
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="font-sm text-secondary mt-xs">
              {rating === 0 && '별점을 선택해주세요'}
              {rating === 1 && '😞 많이 아쉬워요'}
              {rating === 2 && '😐 아쉬워요'}
              {rating === 3 && '😊 괜찮아요'}
              {rating === 4 && '😄 좋아요'}
              {rating === 5 && '🤩 최고예요!'}
            </p>
          </div>

          {/* 도움 여부 */}
          <div className="mb-lg">
            <label className="block font-md font-weight-bold mb-sm">
              분석 결과가 도움이 되었나요? 🤔
            </label>
            <div className="flex gap-md">
              <button
                type="button"
                onClick={() => setHelpful(true)}
                className={`btn ${helpful === true ? 'btn-primary' : 'btn-secondary'}`}
              >
                😊 네, 도움되었어요
              </button>
              <button
                type="button"
                onClick={() => setHelpful(false)}
                className={`btn ${helpful === false ? 'btn-primary' : 'btn-secondary'}`}
              >
                😔 아니요, 별로였어요
              </button>
            </div>
          </div>

          {/* 추가 의견 */}
          <div className="mb-lg">
            <label htmlFor="comment" className="block font-md font-weight-bold mb-sm">
              추가로 하고 싶은 말이 있다면? 💬 (선택사항)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="예: 결과가 정확했어요! / 설명이 이해하기 쉬웠어요 / 더 빨랐으면 좋겠어요"
              className="input"
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* 개선 제안 */}
          <div className="mb-lg">
            <label className="block font-md font-weight-bold mb-sm">
              이런 기능이 있으면 좋겠어요! 💡 (복수 선택 가능)
            </label>
            <div className="flex flex-col gap-xs">
              {suggestionOptions.map((suggestion, index) => (
                <label key={index} className="flex items-center gap-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={suggestions.includes(suggestion)}
                    onChange={() => handleSuggestionToggle(suggestion)}
                    className="cursor-pointer"
                  />
                  <span className="font-sm">{suggestion}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-md">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading"></span>
                  전송 중...
                </>
              ) : (
                '📤 의견 보내기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}