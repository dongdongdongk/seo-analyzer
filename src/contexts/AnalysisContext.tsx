'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AnalysisContextType {
  isAnalyzing: boolean
  hasAnalysisResult: boolean
  setIsAnalyzing: (value: boolean) => void
  setHasAnalysisResult: (value: boolean) => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

interface AnalysisProviderProps {
  children: ReactNode
}

export function AnalysisProvider({ children }: AnalysisProviderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalysisResult, setHasAnalysisResult] = useState(false)

  return (
    <AnalysisContext.Provider
      value={{
        isAnalyzing,
        hasAnalysisResult,
        setIsAnalyzing,
        setHasAnalysisResult,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}