// API 호출 관련 유틸리티 함수

import { AnalysisRequest, AnalysisResponse } from '@/types/analysis'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// SEO 분석 API 호출
export async function analyzeSEO(url: string): Promise<AnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url } as AnalysisRequest),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('SEO 분석 API 호출 오류:', error)
    return {
      success: false,
      error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  }
}

// URL 유효성 검사
export function validateURL(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: '웹사이트 주소를 입력해주세요.'
    }
  }

  const trimmedUrl = url.trim()
  
  if (!trimmedUrl) {
    return {
      isValid: false,
      error: '웹사이트 주소를 입력해주세요.'
    }
  }

  // 프로토콜이 없으면 자동으로 https 추가
  const urlWithProtocol = trimmedUrl.startsWith('http') 
    ? trimmedUrl 
    : `https://${trimmedUrl}`

  // URL 형식 검사
  try {
    new URL(urlWithProtocol)
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: '올바른 웹사이트 주소를 입력해주세요. (예: https://example.com)'
    }
  }
}

// 분석 결과 저장 (로컬 스토리지)
export function saveAnalysisResult(result: any): void {
  try {
    const savedResults = getSavedAnalysisResults()
    const newResult = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    }
    
    savedResults.unshift(newResult)
    
    // 최대 10개까지만 저장
    if (savedResults.length > 10) {
      savedResults.splice(10)
    }
    
    localStorage.setItem('seo_analysis_results', JSON.stringify(savedResults))
  } catch (error) {
    console.error('분석 결과 저장 오류:', error)
  }
}

// 저장된 분석 결과 불러오기
export function getSavedAnalysisResults(): any[] {
  try {
    const saved = localStorage.getItem('seo_analysis_results')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('저장된 분석 결과 불러오기 오류:', error)
    return []
  }
}

// 분석 결과 삭제
export function deleteAnalysisResult(id: string): void {
  try {
    const savedResults = getSavedAnalysisResults()
    const filteredResults = savedResults.filter(result => result.id !== id)
    localStorage.setItem('seo_analysis_results', JSON.stringify(filteredResults))
  } catch (error) {
    console.error('분석 결과 삭제 오류:', error)
  }
}

// 사용자 피드백 전송
export async function sendUserFeedback(feedback: {
  rating: number
  comment?: string
  helpful: boolean
  url?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('피드백 전송 오류:', error)
    return {
      success: false,
      error: '피드백 전송 중 오류가 발생했습니다.'
    }
  }
}

// 분석 통계 조회
export async function getAnalysisStats(): Promise<{
  totalAnalyses: number
  averageScore: number
  commonIssues: string[]
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('분석 통계 조회 오류:', error)
    return {
      totalAnalyses: 0,
      averageScore: 0,
      commonIssues: []
    }
  }
}

// 오류 메시지 한글화
export function getErrorMessage(error: string): string {
  const errorMessages: { [key: string]: string } = {
    'Network Error': '네트워크 연결을 확인해주세요.',
    'Timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    'Invalid URL': '올바른 웹사이트 주소를 입력해주세요.',
    'Server Error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'Rate Limit': '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.',
    'Not Found': '웹사이트를 찾을 수 없습니다. 주소를 확인해주세요.'
  }

  return errorMessages[error] || '알 수 없는 오류가 발생했습니다.'
}