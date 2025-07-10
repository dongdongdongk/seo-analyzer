'use client'

import { useState } from 'react'
import AnalysisForm from '@/components/AnalysisForm'
import AnalysisProgress from '@/components/AnalysisProgress'
import AnalysisResult from '@/components/AnalysisResult'

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'progress' | 'result'>('form')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')

  const handleAnalysisStart = (url: string) => {
    setWebsiteUrl(url)
    setCurrentStep('progress')
    
    // 실제 분석 로직은 나중에 구현
    // 지금은 데모용 타이머
    setTimeout(() => {
      setAnalysisData({
        url,
        overallScore: 85,
        categories: [
          {
            id: 'title',
            name: '페이지 제목',
            status: 'good',
            score: 90,
            description: '페이지 제목이 잘 설정되어 있어요! 고객이 검색할 때 쉽게 찾을 수 있습니다.',
            suggestions: [
              '현재 제목이 적절한 길이입니다',
              '키워드가 자연스럽게 포함되어 있습니다'
            ]
          },
          {
            id: 'description',
            name: '페이지 설명',
            status: 'warning',
            score: 70,
            description: '페이지 설명을 더 자세히 작성하면 더 많은 고객이 클릭할 것 같아요.',
            suggestions: [
              '설명을 120-150자 정도로 늘려보세요',
              '고객이 관심 가질 만한 키워드를 추가해보세요'
            ]
          },
          {
            id: 'speed',
            name: '사이트 속도',
            status: 'danger',
            score: 45,
            description: '사이트가 조금 느려요. 고객이 기다리다 다른 곳으로 갈 수 있어요.',
            suggestions: [
              '이미지 크기를 줄여보세요',
              '사용하지 않는 플러그인을 제거해보세요'
            ]
          },
          {
            id: 'mobile',
            name: '모바일 친화도',
            status: 'good',
            score: 95,
            description: '모바일에서 완벽하게 보여요! 요즘 대부분의 고객이 핸드폰으로 접속하는데 잘 준비되어 있네요.',
            suggestions: [
              '모바일 최적화가 잘 되어 있습니다',
              '터치하기 쉬운 크기로 버튼이 설정되어 있습니다'
            ]
          },
          {
            id: 'images',
            name: '이미지 최적화',
            status: 'warning',
            score: 60,
            description: '이미지에 설명을 추가하면 검색에서 더 잘 찾을 수 있어요.',
            suggestions: [
              '이미지마다 간단한 설명을 추가해보세요',
              '이미지 파일명을 의미있게 바꿔보세요'
            ]
          }
        ]
      })
      setCurrentStep('result')
    }, 8000)
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
        <AnalysisProgress websiteUrl={websiteUrl} />
      )}
      
      {currentStep === 'result' && analysisData && (
        <AnalysisResult 
          data={analysisData} 
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  )
}