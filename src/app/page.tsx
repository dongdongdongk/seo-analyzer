'use client'

import { useState } from 'react'
import AnalysisForm from '@/components/AnalysisForm'
import AnalysisProgress from '@/components/AnalysisProgress'
import AnalysisResult from '@/components/AnalysisResult'

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'progress' | 'result'>('form')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')

  const handleAnalysisStart = async (url: string) => {
    setWebsiteUrl(url)
    setCurrentStep('progress')
    
    try {
      // 실제 SEO 분석 API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAnalysisData(result.data)
        setCurrentStep('result')
      } else {
        throw new Error(result.error || '분석 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('분석 오류:', error)
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
      setCurrentStep('form')
    }
  }

  const handleNewAnalysis = () => {
    setCurrentStep('form')
    setAnalysisData(null)
    setWebsiteUrl('')
  }

  return (
    <div className="container">
      {currentStep === 'form' && (
        <AnalysisForm onAnalysisStart={handleAnalysisStart} />
      )}
      
      {currentStep === 'progress' && (
        <section role="status" aria-live="polite" aria-label="SEO 분석 진행 중">
          <AnalysisProgress websiteUrl={websiteUrl} />
        </section>
      )}
      
      {currentStep === 'result' && analysisData && (
        <section role="main" aria-label="SEO 분석 결과">
          <AnalysisResult 
            data={analysisData} 
            onNewAnalysis={handleNewAnalysis}
          />
        </section>
      )}
    </div>
  )
}