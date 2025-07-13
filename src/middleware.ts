import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

// 커스텀 미들웨어로 래핑하여 로깅 추가
export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const acceptLanguage = request.headers.get('accept-language');
  const userAgent = request.headers.get('user-agent');
  const referer = request.headers.get('referer');
  
  console.log('🚀 Middleware triggered:');
  console.log('  📍 Path:', pathname);
  console.log('  🌍 Accept-Language:', acceptLanguage);
  console.log('  🖥️ User-Agent:', userAgent?.substring(0, 100) + '...');
  console.log('  📎 Referer:', referer);
  console.log('  🔧 Search params:', search);
  
  // 현재 경로에서 locale 추출
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  console.log('  📋 Is missing locale?', pathnameIsMissingLocale);
  console.log('  🎯 Supported locales:', locales);
  console.log('  🏠 Default locale:', defaultLocale);
  
  // Accept-Language 헤더에서 언어 감지
  if (pathnameIsMissingLocale && acceptLanguage) {
    // 브라우저가 선호하는 언어들을 파싱
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0], // 언어 코드만 추출 (ko-KR -> ko)
          quality: quality ? parseFloat(quality) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality); // 품질 순으로 정렬
      
    console.log('  🎭 Parsed languages:', preferredLanguages);
    
    // 지원하는 언어 중에서 가장 선호하는 언어 찾기
    const matchedLocale = preferredLanguages.find(lang => 
      locales.includes(lang.code as any)
    );
    
    console.log('  ✅ Matched locale:', matchedLocale);
    
    if (matchedLocale) {
      const redirectLocale = matchedLocale.code;
      const redirectUrl = new URL(`/${redirectLocale}${pathname}${search}`, request.url);
      console.log('  🚀 Redirecting to:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // next-intl 미들웨어 실행
  const response = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
    localeDetection: true
  })(request);
  
  console.log('  🔄 Next-intl response:', response?.status);
  
  return response;
}

export const config = {
  matcher: [
    // 루트 경로와 locale이 없는 경로들을 매칭
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};