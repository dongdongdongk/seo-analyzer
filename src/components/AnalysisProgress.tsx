'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface AnalysisProgressProps {
  websiteUrl: string
}

export default function AnalysisProgress({ websiteUrl }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const t = useTranslations('analysis')

  const steps = [
    { id: 1, text: t('steps.fetchingPage'), icon: '🌐' },
    { id: 2, text: t('steps.analyzingSeo'), icon: '📄' },
    { id: 3, text: t('steps.checkingSpeed'), icon: '⚡' },
    { id: 4, text: t('steps.generatingAdvice'), icon: '🔍' },
    { id: 5, text: t('steps.completed'), icon: '📊' }
  ]

  const tips = t.raw('tips') as string[]

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
        {t('progressTitle')}
      </h2>
      
      <p className="analysis-progress__message">
        {t.rich('progressMessage', { 
          url: websiteUrl,
          strong: (chunks) => <strong>{chunks}</strong>
        })}
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
          <p className="font-lg mb-md">{t('didYouKnow')}</p>
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
          {t('completionMessage')}
        </p>
      </div>
    </div>
  )
}