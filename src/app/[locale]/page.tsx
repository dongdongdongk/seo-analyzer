'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { useAnalysis } from '@/contexts/AnalysisContext'
import AnalysisForm from '@/components/AnalysisForm'
import AnalysisProgress from '@/components/AnalysisProgress'
import AnalysisResult from '@/components/AnalysisResult'

export default function HomePage() {
  const locale = useLocale()
  const params = useParams()
  const { setIsAnalyzing, setHasAnalysisResult } = useAnalysis()
  const [currentStep, setCurrentStep] = useState<'form' | 'progress' | 'result'>('form')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  
  // URL에서 직접 locale 가져오기
  const actualLocale = params.locale as string || locale

  // 컴포넌트가 언마운트될 때 상태 초기화
  useEffect(() => {
    return () => {
      setIsAnalyzing(false)
      setHasAnalysisResult(false)
    }
  }, [setIsAnalyzing, setHasAnalysisResult])

  const handleAnalysisStart = async (url: string) => {
    setWebsiteUrl(url)
    setCurrentStep('progress')
    setIsAnalyzing(true)
    setHasAnalysisResult(false)
    
    try {
      // 실제 SEO 분석 API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, locale: actualLocale }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAnalysisData(result.data)
        setCurrentStep('result')
        setIsAnalyzing(false)
        setHasAnalysisResult(true)
      } else {
        throw new Error(result.error || '분석 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('분석 오류:', error)
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
      setCurrentStep('form')
      setIsAnalyzing(false)
      setHasAnalysisResult(false)
    }
  }

  const handleNewAnalysis = () => {
    setCurrentStep('form')
    setAnalysisData(null)
    setWebsiteUrl('')
    setIsAnalyzing(false)
    setHasAnalysisResult(false)
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