import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import StructuredData from '@/components/StructuredData'
import '@/styles/globals.scss'
import '@/styles/components.scss'
import '@/styles/icons.scss'
import '@/styles/pages.scss'

export const metadata: Metadata = {
  title: {
    default: '무료 검색엔진 최적화 분석기 - SEO 진단 도구',
    template: '%s | 무료 검색엔진 최적화 분석기'
  },
  description: '웹사이트 SEO를 3분 만에 무료로 분석하고 개선 방법을 제공합니다. 초보자도 쉽게 이해할 수 있는 검색엔진 최적화 가이드와 맞춤형 조언을 받아보세요.',
  keywords: [
    'SEO 분석', '검색엔진 최적화', '웹사이트 분석', '무료 SEO 도구', 
    'SEO 진단', 'SEO 점수', '웹사이트 성능 분석', '모바일 SEO', 
    '페이지 속도 최적화', '메타 태그 분석', 'SEO 가이드', '초보자 SEO'
  ],
  authors: [{ name: 'SEO 분석기 팀', url: 'https://seo-analyzer.com' }],
  creator: 'SEO 분석기 팀',
  publisher: 'SEO 분석기',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://seo-analyzer.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/ko',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://seo-analyzer.com',
    title: '무료 검색엔진 최적화 분석기 - SEO 진단 도구',
    description: '웹사이트 SEO를 3분 만에 무료로 분석하고 개선 방법을 제공합니다. 초보자도 쉽게 이해할 수 있는 검색엔진 최적화 가이드와 맞춤형 조언을 받아보세요.',
    siteName: '무료 검색엔진 최적화 분석기',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '무료 검색엔진 최적화 분석기 - SEO 진단 도구',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '무료 검색엔진 최적화 분석기 - SEO 진단 도구',
    description: '웹사이트 SEO를 3분 만에 무료로 분석하고 개선 방법을 제공합니다.',
    creator: '@seo_analyzer',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
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
      <head>
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <StructuredData type="service" />
      </head>
      <body>
        <Header />
        
        <main role="main">
          {children}
        </main>
        
        <footer className="footer" role="contentinfo">
          <div className="container">
            <div className="footer__content">
              <div>
                <p>&copy; 2025 무료 검색엔진 최적화 분석기. 초보자도 쉽게 이해하는 SEO 진단 서비스.</p>
              </div>
              <nav className="footer__links" role="navigation" aria-label="Footer navigation">
                <Link href="/seo-guide">SEO 가이드</Link>
                <Link href="/about">서비스 소개</Link>
                <Link href="/faq">FAQ</Link>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}