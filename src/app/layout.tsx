import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import '@/styles/globals.scss'
import '@/styles/components.scss'
import '@/styles/icons.scss'

export const metadata: Metadata = {
  title: 'AI SEO 분석기 - 초보자도 쉽게 이해하는 SEO 진단',
  description: '웹사이트 SEO를 초보자도 쉽게 이해할 수 있도록 분석하고 개선 방법을 제공합니다.',
  keywords: ['SEO', '웹사이트 분석', '검색엔진 최적화', 'AI 분석'],
  authors: [{ name: 'SEO 분석기 팀' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <header className="header">
          <div className="container">
            <div className="header__content">
              <Link href="/" className="header__logo">
                <span className="logo-icon">🔍</span>
                AI SEO 분석기
              </Link>
              <nav className="header__nav">
                <Link href="/" className="header__nav-link active">
                  홈
                </Link>
                <a href="/guide" className="header__nav-link">
                  이용가이드
                </a>
                <a href="/examples" className="header__nav-link">
                  예시보기
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        <main>
          {children}
        </main>
        
        <footer className="footer">
          <div className="container">
            <div className="footer__content">
              <div>
                <p>&copy; 2025 AI SEO 분석기. 초보자도 쉽게 이해하는 SEO 진단 서비스.</p>
              </div>
              <div className="footer__links">
                <a href="/privacy">개인정보처리방침</a>
                <a href="/terms">이용약관</a>
                <a href="/contact">문의하기</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}