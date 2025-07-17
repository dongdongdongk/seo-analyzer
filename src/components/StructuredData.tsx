import Script from 'next/script'

interface StructuredDataProps {
  type: 'website' | 'webpage' | 'article' | 'organization' | 'service'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'website' ? 'WebSite' : 'WebPage',
      "name": "무료 검색엔진 최적화 분석기",
      "description": "웹사이트 SEO를 3분 만에 무료로 분석하고 개선 방법을 제공합니다. 초보자도 쉽게 이해할 수 있는 검색엔진 최적화 가이드와 맞춤형 조언을 받아보세요.",
      "url": "https://seoanalyzer.roono.net",
      "inLanguage": "ko-KR",
      "isAccessibleForFree": true,
      "publisher": {
        "@type": "Organization",
        "name": "SEO 분석기 팀",
        "url": "https://seoanalyzer.roono.net"
      }
    }

    switch (type) {
      case 'website':
        return {
          ...baseData,
          "@type": "WebSite",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://seoanalyzer.roono.net/?url={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "mainEntity": {
            "@type": "Service",
            "name": "SEO 분석 서비스",
            "description": "웹사이트의 검색엔진 최적화 상태를 분석하고 개선 방법을 제공하는 무료 서비스",
            "serviceType": "SEO Analysis",
            "provider": {
              "@type": "Organization",
              "name": "SEO 분석기 팀"
            },
            "areaServed": "대한민국",
            "availableLanguage": "ko"
          }
        }

      case 'service':
        return {
          ...baseData,
          "@type": "Service",
          "name": "무료 SEO 분석 서비스",
          "description": "웹사이트의 검색엔진 최적화 상태를 무료로 분석하고 개선 방법을 제공합니다",
          "serviceType": "SEO Analysis",
          "provider": {
            "@type": "Organization",
            "name": "SEO 분석기 팀",
            "url": "https://seoanalyzer.roono.net"
          },
          "areaServed": {
            "@type": "Country",
            "name": "대한민국"
          },
          "availableLanguage": "ko",
          "isAccessibleForFree": true,
          "category": "검색엔진 최적화",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW",
            "availability": "https://schema.org/InStock"
          }
        }

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "SEO 분석기 팀",
          "url": "https://seoanalyzer.roono.net",
          "description": "웹사이트 SEO 분석 및 최적화 서비스를 제공하는 전문 팀",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Korean"
          },
          "sameAs": [
            "https://github.com/seo-analyzer",
            "https://twitter.com/seo_analyzer"
          ]
        }

      case 'article':
        return {
          ...baseData,
          "@type": "Article",
          "headline": data?.title || "SEO 가이드",
          "description": data?.description || "검색엔진 최적화에 대한 전문 가이드",
          "author": {
            "@type": "Organization",
            "name": "SEO 분석기 팀"
          },
          "datePublished": data?.datePublished || "2025-01-11",
          "dateModified": data?.dateModified || "2025-01-11",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data?.url || "https://seoanalyzer.roono.net/seo-guide"
          }
        }

      default:
        return baseData
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}