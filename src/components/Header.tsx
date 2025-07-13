'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { localeNames, localeFlags } from '@/i18n/config'
import type { Locale } from '@/i18n/config'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as Locale
  const t = useTranslations('header')

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // 언어 메뉴 토글
  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen)
  }

  // 홈으로 이동 시 페이지 상태 리셋
  const handleHomeNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    const currentHomePath = `/${locale}`
    if (pathname === currentHomePath) {
      // 같은 페이지에서 홈 버튼 클릭 시 새로고침으로 상태 리셋
      window.location.reload()
    } else {
      // 다른 페이지에서 홈으로 이동
      router.push(currentHomePath)
    }
    setIsMobileMenuOpen(false)
  }

  // 언어 변경 함수
  const changeLanguage = (newLocale: Locale) => {
    const currentPath = pathname.replace(`/${locale}`, '')
    router.push(`/${newLocale}${currentPath}`)
    setIsLanguageMenuOpen(false)
  }

  // 스크롤 감지를 통한 헤더 스타일 변경
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isLanguageMenuOpen && !target.closest('.header__language-dropdown')) {
        setIsLanguageMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageMenuOpen])

  // 현재 페이지 확인 함수
  const isActivePage = (path: string) => {
    return pathname === `/${locale}${path}`
  }

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`} role="banner">
      <div className="container">
        <div className="header__content">
          <a 
            href={`/${locale}`} 
            className="header__logo" 
            onClick={handleHomeNavigation} 
            aria-label={locale === 'ko' ? '무료 검색엔진 최적화 홈으로 이동' : 'Go to SEO Analysis Tool home'}
          >
            <Image 
              src="/icon.png" 
              alt={locale === 'ko' ? '무료 검색엔진 최적화' : 'SEO Analysis Tool'} 
              className="logo-icon"
              width={32}
              height={32}
              priority
            />
            {locale === 'ko' ? '무료 검색엔진 최적화' : 'SEO Analysis Tool'}
          </a>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="header__nav" role="navigation" aria-label="Main navigation">
            <a 
              href={`/${locale}`} 
              className={`header__nav-link ${isActivePage('') ? 'active' : ''}`}
              onClick={handleHomeNavigation}
              aria-current={isActivePage('') ? 'page' : undefined}
            >
              {t('home')}
            </a>
            <Link 
              href={`/${locale}/seo-guide`} 
              className={`header__nav-link ${isActivePage('/seo-guide') ? 'active' : ''}`}
              aria-current={isActivePage('/seo-guide') ? 'page' : undefined}
            >
              {t('seoGuide')}
            </Link>
            <Link 
              href={`/${locale}/about`} 
              className={`header__nav-link ${isActivePage('/about') ? 'active' : ''}`}
              aria-current={isActivePage('/about') ? 'page' : undefined}
            >
              {t('about')}
            </Link>
            <Link 
              href={`/${locale}/faq`} 
              className={`header__nav-link ${isActivePage('/faq') ? 'active' : ''}`}
              aria-current={isActivePage('/faq') ? 'page' : undefined}
            >
              {t('faq')}
            </Link>
          </nav>

          {/* 언어 선택 드롭다운 */}
          <div className="header__language-dropdown">
            <button 
              onClick={toggleLanguageMenu}
              className="header__language-btn"
              aria-label="Language selection"
              aria-expanded={isLanguageMenuOpen}
            >
              <span className="language-flag">
                {localeFlags[locale]}
              </span>
              <span className="language-text">
                {localeNames[locale]}
              </span>
              <span className="dropdown-arrow">
                {isLanguageMenuOpen ? '▲' : '▼'}
              </span>
            </button>
            {isLanguageMenuOpen && (
              <div className="header__language-menu">
                <button 
                  onClick={() => changeLanguage('ko')}
                  className={`language-option ${locale === 'ko' ? 'active' : ''}`}
                >
                  <span className="language-flag">{localeFlags.ko}</span>
                  <span className="language-text">{localeNames.ko}</span>
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`language-option ${locale === 'en' ? 'active' : ''}`}
                >
                  <span className="language-flag">{localeFlags.en}</span>
                  <span className="language-text">{localeNames.en}</span>
                </button>
              </div>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button 
            className="header__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label={t('menuToggle')}
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'hamburger--active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* 모바일 메뉴 */}
          <nav className={`header__mobile-nav ${isMobileMenuOpen ? 'header__mobile-nav--open' : ''}`} role="navigation" aria-label="Mobile navigation">
            <a 
              href={`/${locale}`} 
              className={`header__mobile-nav-link ${isActivePage('') ? 'active' : ''}`}
              onClick={handleHomeNavigation}
              aria-current={isActivePage('') ? 'page' : undefined}
            >
              {t('home')}
            </a>
            <Link 
              href={`/${locale}/seo-guide`} 
              className={`header__mobile-nav-link ${isActivePage('/seo-guide') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActivePage('/seo-guide') ? 'page' : undefined}
            >
              {t('seoGuide')}
            </Link>
            <Link 
              href={`/${locale}/about`} 
              className={`header__mobile-nav-link ${isActivePage('/about') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActivePage('/about') ? 'page' : undefined}
            >
              {t('about')}
            </Link>
            <Link 
              href={`/${locale}/faq`} 
              className={`header__mobile-nav-link ${isActivePage('/faq') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActivePage('/faq') ? 'page' : undefined}
            >
              {t('faq')}
            </Link>
            
            {/* 모바일 언어 변경 */}
            <button 
              onClick={() => {
                changeLanguage(locale === 'ko' ? 'en' : 'ko')
                setIsMobileMenuOpen(false)
              }}
              className="header__mobile-nav-link header__mobile-language-btn"
            >
              {locale === 'ko' ? 'English' : '한국어'}
            </button>
          </nav>
        </div>
      </div>
      
      {/* 모바일 메뉴 배경 오버레이 */}
      {isMobileMenuOpen && (
        <div 
          className="header__mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  )
}