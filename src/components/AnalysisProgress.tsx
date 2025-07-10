'use client'

import { useState, useEffect } from 'react'

interface AnalysisProgressProps {
  websiteUrl: string
}

export default function AnalysisProgress({ websiteUrl }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  const steps = [
    { id: 1, text: '웹사이트 접속 중', icon: '🌐' },
    { id: 2, text: '페이지 내용 분석', icon: '📄' },
    { id: 3, text: '속도 측정', icon: '⚡' },
    { id: 4, text: 'SEO 요소 검사', icon: '🔍' },
    { id: 5, text: '결과 정리', icon: '📊' }
  ]

  const tips = [
    '💡 SEO란 검색엔진에서 내 사이트를 더 잘 찾을 수 있게 만드는 것이에요',
    '🎯 좋은 제목은 고객이 클릭하고 싶게 만들어요',
    '📱 요즘 고객의 60% 이상이 핸드폰으로 웹사이트를 봐요',
    '⚡ 사이트가 3초 이내에 로딩되지 않으면 고객이 떠나요',
    '🖼️ 이미지에 설명을 추가하면 검색에서 더 잘 찾을 수 있어요',
    '📝 페이지 설명은 고객이 클릭할지 결정하는 중요한 요소예요',
    '🔗 다른 사이트에서 내 사이트로 연결해주면 검색 순위가 올라가요'
  ]

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1600)

    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length)
    }, 3000)

    return () => {
      clearInterval(stepTimer)
      clearInterval(tipTimer)
    }
  }, [steps.length, tips.length])

  return (
    <div className="analysis-progress">
      <div className="analysis-progress__icon">
        <div className="loading"></div>
      </div>
      
      <h2 className="analysis-progress__title">
        분석 중이에요...
      </h2>
      
      <p className="analysis-progress__message">
        <strong>{websiteUrl}</strong>를 꼼꼼히 살펴보고 있어요.<br />
        잠시만 기다려 주세요! (약 2-3분 소요)
      </p>

      <div className="analysis-progress__steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`analysis-progress__step ${
              index < currentStep ? 'completed' : 
              index === currentStep ? 'active' : ''
            }`}
          >
            <div className={`analysis-progress__step-icon ${
              index < currentStep ? 'completed' : 
              index === currentStep ? 'active' : ''
            }`}>
              {index < currentStep ? '✓' : step.icon}
            </div>
            <span className="analysis-progress__step-text">
              {step.text}
            </span>
          </div>
        ))}
      </div>

      <div className="card mt-xl">
        <div className="text-center">
          <p className="font-lg mb-md">🤔 잠깐! 알고 계셨나요?</p>
          <p className="font-md" style={{ 
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 var(--spacing-md)'
          }}>
            {tips[tipIndex]}
          </p>
        </div>
      </div>

      <div className="mt-xl text-center">
        <p className="font-sm text-secondary">
          💪 분석이 완료되면 쉽게 따라할 수 있는 개선 방법을 알려드릴게요!
        </p>
      </div>
    </div>
  )
}