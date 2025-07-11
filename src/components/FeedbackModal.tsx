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

  if (!isOpen) return null

  return (
    <div className="feedback-inline">
      {/* 헤더 섹션 */}
      <div className="feedback-inline__header">
        <div className="feedback-inline__header-content">
          <div className="feedback-inline__header-info">
            <h2 className="feedback-inline__title">🌟 서비스 평가</h2>
            <p className="feedback-inline__subtitle">소중한 의견을 들려주세요!</p>
          </div>
          <button 
            onClick={onClose}
            className="feedback-inline__close"
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      {/* 본문 섹션 */}
      <div className="feedback-inline__content">
        
        <form onSubmit={handleSubmit}>
          {/* 별점 평가 */}
          <div className="feedback-section feedback-section--rating">
            <label className="feedback-section__label">
              ⭐ 전체적으로 몇 점을 주시겠어요?
            </label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={`rating-star ${star <= rating ? 'rating-star--active' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className={`rating-feedback ${rating > 0 ? 'rating-feedback--active' : ''}`}>
              <p>
                {rating === 0 && '별점을 선택해주세요'}
                {rating === 1 && '😞 많이 아쉬워요'}
                {rating === 2 && '😐 아쉬워요'}
                {rating === 3 && '😊 괜찮아요'}
                {rating === 4 && '😄 좋아요'}
                {rating === 5 && '🤩 최고예요!'}
              </p>
            </div>
          </div>

          {/* 도움 여부 */}
          <div className="feedback-section feedback-section--helpful">
            <label className="feedback-section__label">
              🤔 분석 결과가 도움이 되었나요?
            </label>
            <div className="helpful-buttons">
              <button
                type="button"
                onClick={() => setHelpful(true)}
                className={`helpful-btn ${helpful === true ? 'helpful-btn--active helpful-btn--positive' : ''}`}
              >
                😊 네, 도움되었어요
              </button>
              <button
                type="button"
                onClick={() => setHelpful(false)}
                className={`helpful-btn ${helpful === false ? 'helpful-btn--active helpful-btn--negative' : ''}`}
              >
                😔 아니요, 별로였어요
              </button>
            </div>
          </div>

          {/* 추가 의견 */}
          <div className="feedback-section feedback-section--comment">
            <label htmlFor="comment" className="feedback-section__label">
              💬 추가로 하고 싶은 말이 있다면? <span className="feedback-section__optional">(선택사항)</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="예: 결과가 정확했어요! / 설명이 이해하기 쉬웠어요 / 더 빨랐으면 좋겠어요"
              className="feedback-textarea"
              rows={4}
            />
          </div>

          {/* 개선 제안 */}
          <div className="feedback-section feedback-section--suggestions">
            <label className="feedback-section__label">
              💡 이런 기능이 있으면 좋겠어요! <span className="feedback-section__optional">(복수 선택 가능)</span>
            </label>
            <div className="suggestions-list">
              {suggestionOptions.map((suggestion, index) => (
                <label 
                  key={index} 
                  className={`suggestion-item ${suggestions.includes(suggestion) ? 'suggestion-item--active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={suggestions.includes(suggestion)}
                    onChange={() => handleSuggestionToggle(suggestion)}
                    className="suggestion-checkbox"
                  />
                  <span className="suggestion-text">
                    {suggestion}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="feedback-buttons">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`feedback-btn feedback-btn--cancel ${isSubmitting ? 'feedback-btn--disabled' : ''}`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`feedback-btn feedback-btn--submit ${isSubmitting ? 'feedback-btn--loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner" />
                  전송 중...
                </>
              ) : (
                <>
                  📤 의견 보내기
                </>
              )}
            </button>
          </div>
        </form>
        </div>
    </div>
  )
}