import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  
  const canonicalUrl = `/${locale}/faq`
  
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ko': '/ko/faq',
        'en': '/en/faq',
        'x-default': '/ko/faq',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `https://seo-analyzer.com${canonicalUrl}`,
      type: 'website',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
    twitter: {
      title: t('title'),
      description: t('subtitle'),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function FAQLayout({ children }: Props) {
  return children
}