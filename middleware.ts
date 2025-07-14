import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './src/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 루트 경로(/)에 대한 처리
  if (pathname === '/') {
    // Accept-Language 헤더에서 선호 언어 감지
    const acceptLanguage = request.headers.get('Accept-Language') || '';
    
    // 한국어가 포함되어 있거나 언어 설정이 없으면 한국어로 리디렉션
    const isKoreanPreferred = acceptLanguage.includes('ko') || 
                              acceptLanguage.includes('kr') ||
                              !acceptLanguage;
    
    const targetLocale = isKoreanPreferred ? 'ko' : 'en';
    
    // 301 Permanent Redirect로 SEO에 안전하게 리디렉션
    const redirectUrl = new URL(`/${targetLocale}`, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // favicon.ico, robots.txt 등 정적 파일들은 처리하지 않음
  if (pathname.includes('.') || pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 나머지 요청은 next-intl 미들웨어로 처리
  return intlMiddleware(request);
}

export const config = {
  // 정적 파일과 API 경로를 제외한 모든 경로에 대해 미들웨어 실행
  matcher: [
    // 다음을 제외한 모든 경로
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)'
  ]
};