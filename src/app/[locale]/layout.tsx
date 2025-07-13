import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import StructuredData from '@/components/StructuredData'
import { locales } from '@/i18n/config'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  
  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`
    },
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'SEO Analysis Team', url: 'https://seo-analyzer.com' }],
    creator: 'SEO Analysis Team',
    publisher: 'SEO Analyzer',
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
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      url: 'https://seo-analyzer.com',
      title: t('title'),
      description: t('description'),
      siteName: t('title'),
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
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
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale })
  
  return (
    <html lang={locale}>
      <head>
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <StructuredData type="service" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          
          <main role="main">
            {children}
          </main>
          
          <footer className="footer" role="contentinfo">
            <div className="container">
              <div className="footer__content">
                <div>
                  <p>&copy; 2025 {locale === 'ko' ? '무료 검색엔진 최적화 분석기. 초보자도 쉽게 이해하는 SEO 진단 서비스.' : 'Free SEO Analysis Tool. Easy-to-understand SEO diagnosis service for beginners.'}</p>
                </div>
                <nav className="footer__links" role="navigation" aria-label="Footer navigation">
                  <Link href={`/${locale}/seo-guide`}>{locale === 'ko' ? 'SEO 가이드' : 'SEO Guide'}</Link>
                  <Link href={`/${locale}/about`}>{locale === 'ko' ? '서비스 소개' : 'About'}</Link>
                  <Link href={`/${locale}/faq`}>FAQ</Link>
                </nav>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}