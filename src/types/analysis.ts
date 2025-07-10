// SEO 분석 관련 타입 정의

export interface SEOCategory {
  id: string
  name: string
  status: 'good' | 'warning' | 'danger'
  score: number
  description: string
  suggestions: string[]
}

export interface AnalysisResult {
  url: string
  overallScore: number
  categories: SEOCategory[]
}

export interface AnalysisRequest {
  url: string
}

export interface AnalysisResponse {
  success: boolean
  data?: AnalysisResult
  error?: string
}

// 분석 진행 상태
export interface AnalysisStep {
  id: number
  text: string
  icon: string
  completed: boolean
  active: boolean
}

// 사이트 타입 분류
export type SiteType = 'blog' | 'ecommerce' | 'corporate' | 'portfolio' | 'local-business'

// 업종별 분류
export type BusinessType = 
  | 'restaurant'
  | 'cafe'
  | 'beauty'
  | 'retail'
  | 'service'
  | 'healthcare'
  | 'education'
  | 'technology'
  | 'other'

// 분석 설정
export interface AnalysisConfig {
  includeSpeedTest: boolean
  includeMobileTest: boolean
  includeAccessibilityTest: boolean
  includeContentAnalysis: boolean
  language: 'ko' | 'en'
}

// 개선 제안
export interface Improvement {
  id: string
  category: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  steps: string[]
  expectedImpact: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeRequired: string
}

// 경쟁 분석 결과
export interface CompetitorAnalysis {
  keyword: string
  competitors: Array<{
    url: string
    title: string
    score: number
    strengths: string[]
    weaknesses: string[]
  }>
}

// 사용자 피드백
export interface UserFeedback {
  rating: number
  comment?: string
  helpful: boolean
  suggestions?: string[]
}