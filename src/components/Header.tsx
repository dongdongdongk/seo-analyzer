'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // 홈으로 이동 시 페이지 상태 리셋
  const handleHomeNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      // 같은 페이지에서 홈 버튼 클릭 시 새로고침으로 상태 리셋
      window.location.reload()
    } else {
      // 다른 페이지에서 홈으로 이동
      router.push('/')
    }
    setIsMobileMenuOpen(false)
  }

  // 스크롤 감지를 통한 헤더 스타일 변경
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 현재 페이지 확인 함수
  const isActivePage = (path: string) => {
    return pathname === path
  }

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`} role="banner">
      <div className="container">
        <div className="header__content">
          <a href="/" className="header__logo" onClick={handleHomeNavigation} aria-label="무료 검색엔진 최적화 홈으로 이동">
            <img src="/icon.png" alt="무료 검색엔진 최적화" className="logo-icon" />
            무료 검색엔진 최적화
          </a>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="header__nav" role="navigation" aria-label="Main navigation">
            <a 
              href="/" 
              className={`header__nav-link ${isActivePage('/') ? 'active' : ''}`}
              onClick={handleHomeNavigation}
              aria-current={isActivePage('/') ? 'page' : undefined}
            >
              홈
            </a>
            <Link 
              href="/seo-guide" 
              className={`header__nav-link ${isActivePage('/seo-guide') ? 'active' : ''}`}
              aria-current={isActivePage('/seo-guide') ? 'page' : undefined}
            >
              SEO 가이드
            </Link>
            <Link 
              href="/about" 
              className={`header__nav-link ${isActivePage('/about') ? 'active' : ''}`}
              aria-current={isActivePage('/about') ? 'page' : undefined}
            >
              서비스 소개
            </Link>
            <Link 
              href="/faq" 
              className={`header__nav-link ${isActivePage('/faq') ? 'active' : ''}`}
              aria-current={isActivePage('/faq') ? 'page' : undefined}
            >
              FAQ
            </Link>
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button 
            className="header__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="메뉴 열기/닫기"
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
              href="/" 
              className={`header__mobile-nav-link ${isActivePage('/') ? 'active' : ''}`}
              onClick={handleHomeNavigation}
              aria-current={isActivePage('/') ? 'page' : undefined}
            >
              홈
            </a>
            <Link 
              href="/seo-guide" 
              className={`header__mobile-nav-link ${isActivePage('/seo-guide') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActivePage('/seo-guide') ? 'page' : undefined}
            >
              SEO 가이드
            </Link>
            <Link 
              href="/about" 
              className={`header__mobile-nav-link ${isActivePage('/about') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActivePage('/about') ? 'page' : undefined}
            >
              서비스 소개
            </Link>
            <Link 
              href="/faq" 
              className={`header__mobile-nav-link ${isActivePage('/faq') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActivePage('/faq') ? 'page' : undefined}
            >
              FAQ
            </Link>
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