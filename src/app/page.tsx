'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서 브라우저 언어 감지
    console.log('🔍 Client-side language detection:')
    console.log('  🌍 navigator.language:', navigator.language)
    console.log('  🌎 navigator.languages:', navigator.languages)
    console.log('  🗺️ Intl.DateTimeFormat().resolvedOptions().locale:', Intl.DateTimeFormat().resolvedOptions().locale)
    
    const browserLang = navigator.language || 'ko'
    const langCode = browserLang.split('-')[0]
    
    console.log('  📍 Detected language code:', langCode)
    
    // 지원하는 언어인지 확인
    const supportedLocales = ['ko', 'en']
    const targetLocale = supportedLocales.includes(langCode) ? langCode : 'ko'
    
    console.log('  🎯 Target locale:', targetLocale)
    console.log('  🚀 Redirecting to:', `/${targetLocale}`)
    
    // 리다이렉트
    router.replace(`/${targetLocale}`)
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <img src="/icon.png" alt="SEO Analysis" style={{ width: '64px', height: '64px' }} />
        </div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Detecting your language...
        </h1>
        <p style={{ fontSize: '16px', opacity: '0.8' }}>
          브라우저 언어를 감지하고 있습니다...
        </p>
        <div style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          opacity: '0.6',
          fontFamily: 'monospace'
        }}>
          Check console for debug information
        </div>
      </div>
    </div>
  )
}