# 🚀 SEO 분석 서비스 개발 가이드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 아키텍처](#핵심-아키텍처)
3. [국제화(i18n) 시스템](#국제화i18n-시스템)
4. [AI 분석 엔진](#ai-분석-엔진)
5. [SEO 분석 프로세스](#seo-분석-프로세스)
6. [주요 컴포넌트](#주요-컴포넌트)
7. [데이터 흐름](#데이터-흐름)
8. [핵심 코드 설명](#핵심-코드-설명)

---

## 🎯 프로젝트 개요

**초보자 맞춤 AI SEO 분석 서비스**는 기술적 지식이 없는 사용자도 쉽게 웹사이트의 SEO 상태를 분석하고 개선할 수 있도록 도와주는 서비스입니다.

### 핵심 특징
- 🌐 **다국어 지원**: 한국어/영어 자동 감지 및 AI 응답
- 🤖 **AI 맞춤 조언**: GPT-4 기반 개인화된 SEO 개선 제안
- 📱 **반응형 디자인**: 모바일 우선 설계
- ⚡ **실시간 분석**: 3분 내 완료되는 빠른 분석

---

## 🏗️ 핵심 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │    │   (API Routes)  │    │   APIs          │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React         │◄──►│ • SEO Analyzer  │◄──►│ • OpenAI GPT    │
│ • TypeScript    │    │ • Lighthouse    │    │ • Lighthouse    │
│ • SCSS          │    │ • Data Parser   │    │ • Web Scraping  │
│ • next-intl     │    │ • AI Engine     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 기술 스택
- **프론트엔드**: Next.js 14, React, TypeScript, SCSS
- **국제화**: next-intl (다국어 지원)
- **AI**: OpenAI GPT-4o-mini
- **분석**: Lighthouse API, 커스텀 SEO 분석기
- **스타일링**: SCSS with CSS Variables

---

## 🌐 국제화(i18n) 시스템

### 1. 폴더 구조
```
src/
├── app/[locale]/          # 동적 라우팅 (ko, en)
├── i18n/
│   ├── config.ts         # 언어 설정
│   └── request.ts        # 요청 처리
├── messages/
│   ├── ko.json          # 한국어 번역
│   └── en.json          # 영어 번역
└── middleware.ts        # 언어 감지 미들웨어
```

### 2. 핵심 설정 코드

#### `src/i18n/config.ts`
```typescript
export const locales = ['ko', 'en'] as const
export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English'
}

export const localeFlags: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸'
}
```

#### `src/middleware.ts` - 언어 자동 감지
```typescript
import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n/config'

export default createMiddleware({
  locales,
  defaultLocale: 'ko',
  localePrefix: 'always'  // URL에 항상 언어 코드 포함
})
```

### 3. 동작 원리
1. **URL 접속**: `example.com/ko` 또는 `example.com/en`
2. **미들웨어 처리**: 언어 코드 감지 및 라우팅
3. **컴포넌트 렌더링**: `useTranslations()` 훅으로 번역된 텍스트 표시
4. **AI 응답**: locale 파라미터를 통해 언어별 AI 프롬프트 사용

---

## 🤖 AI 분석 엔진

### 1. AI 프롬프트 번역 방식

#### `src/lib/openai-analyzer.ts` - 핵심 함수
```typescript
export async function generatePersonalizedAdvice(
  analysisResult: AnalysisResult,
  pageData: any,
  locale: string = 'ko'  // 언어 파라미터
): Promise<{
  overallAdvice: string
  priorityActions: string[]
  industrySpecificTips: string[]
  expectedResults: string
}> {
  // locale에 따라 다른 프롬프트 사용
  const prompt = locale === 'en' ? `
    You are an SEO expert who can explain things in simple terms...
    [영어 프롬프트]
  ` : `
    당신은 초보자도 이해할 수 있는 SEO 전문가입니다...
    [한국어 프롬프트]
  `
  
  // OpenAI API 호출
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: locale === 'en' 
          ? "You are a friendly SEO consultant for beginners..."
          : "당신은 초보자를 위한 친절한 SEO 컨설턴트입니다..."
      },
      { role: "user", content: detailedPrompt }
    ],
    response_format: { type: "json_object" }
  })
}
```

### 2. 사이트 타입 감지 (다국어)
```typescript
export function detectSiteType(pageData: any, locale: string = 'ko'): string {
  // 키워드 기반 사이트 타입 감지
  let siteType = 'general'
  
  if (content.includes('쇼핑') || content.includes('shop')) {
    siteType = 'ecommerce'
  }
  // ... 기타 감지 로직
  
  // locale별 번역 반환
  const translations = {
    ko: { ecommerce: '온라인 쇼핑몰', blog: '개인 블로그' },
    en: { ecommerce: 'E-commerce', blog: 'Personal Blog' }
  }[locale] || translations.ko
  
  return translations[siteType]
}
```

---

## 🔍 SEO 분석 프로세스

### 1. 분석 단계
```typescript
// src/lib/seo-analyzer.ts
export async function analyzeSEO(url: string, locale: string = 'ko') {
  // 1단계: 페이지 데이터 수집
  const pageData = await fetchPageData(url)
  
  // 2단계: 기본 SEO 분석
  const categories = [
    analyzeTitle(pageData),
    analyzeDescription(pageData), 
    analyzeImages(pageData),
    analyzeMobile(pageData),
    analyzeSpeed(pageData)
  ]
  
  // 3단계: AI 개인화 조언 생성
  const aiAdvice = await generatePersonalizedAdvice(
    { url, categories, overallScore }, 
    pageData, 
    locale  // 언어 전달
  )
  
  // 4단계: 키워드 제안
  const keywords = await generateKeywordSuggestions(
    pageData, 
    businessType, 
    locale
  )
  
  return { categories, aiAdvice, keywords, siteInfo }
}
```

### 2. 데이터 흐름
```
사용자 URL 입력
    ↓
페이지 크롤링 (Puppeteer)
    ↓
SEO 요소 분석 (Title, Meta, Images 등)
    ↓
Lighthouse 성능 측정
    ↓
AI 분석 (OpenAI GPT)
    ↓
결과 통합 및 표시
```

---

## 🧩 주요 컴포넌트

### 1. AnalysisForm - 분석 시작
```typescript
// src/components/AnalysisForm.tsx
export default function AnalysisForm({ onAnalyze, isAnalyzing }: Props) {
  const locale = useLocale()  // 현재 언어 감지
  
  const handleSubmit = async (e: React.FormEvent) => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ 
        url, 
        locale  // API에 언어 전달
      })
    })
  }
}
```

### 2. Header - 언어 선택
```typescript
// src/components/Header.tsx
export default function Header() {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const locale = useParams().locale as Locale
  
  const changeLanguage = (newLocale: Locale) => {
    const currentPath = pathname.replace(`/${locale}`, '')
    router.push(`/${newLocale}${currentPath}`)  // 언어 변경
  }
  
  return (
    <div className="header__language-dropdown">
      <button onClick={toggleLanguageMenu}>
        <span className="language-flag">{localeFlags[locale]}</span>
        <span className="language-text">{localeNames[locale]}</span>
      </button>
      {/* 드롭다운 메뉴 */}
    </div>
  )
}
```

### 3. AnalysisResult - 결과 표시
```typescript
// src/components/AnalysisResult.tsx
export default function AnalysisResult({ data }: Props) {
  const t = useTranslations('analysis')  // 번역 훅
  
  return (
    <div className="analysis-result">
      <h2>{t('aiCustomAdvice')}</h2>
      <p>{data.aiAdvice?.overallAdvice}</p>
      
      <h3>{t('ui.aiRecommendedKeywords')}</h3>
      <p>{t('ui.keywordDescription')}</p>
      {/* AI가 언어별로 생성한 키워드 표시 */}
    </div>
  )
}
```

---

## 📊 데이터 흐름

### 1. 전체 프로세스
```
[사용자] URL 입력 (+ 언어 감지)
    ↓
[Frontend] AnalysisForm → API 호출
    ↓
[API] /api/analyze → SEO 분석 시작
    ↓ 
[Backend] seo-analyzer.ts → 페이지 분석
    ↓
[AI] openai-analyzer.ts → 언어별 AI 조언
    ↓
[Frontend] AnalysisResult → 결과 표시
```

### 2. 언어 처리 과정
```
URL: /ko/about → locale='ko'
    ↓
useTranslations('analysis') → 한국어 메시지
    ↓
API 호출 시 locale 전달
    ↓
AI 프롬프트 한국어로 생성
    ↓
한국어 AI 응답 받기
    ↓
한국어로 결과 표시
```

---

## 💡 핵심 코드 설명

### 1. API 라우트 - 언어 파라미터 처리
```typescript
// src/app/api/analyze/route.ts
export async function POST(request: NextRequest) {
  // 요청에서 URL과 언어 정보 추출
  const { url, locale = 'ko' } = await request.json()
  
  // SEO 분석 실행 (언어 정보 포함)
  const analysisResult = await analyzeSEO(url, locale)
  
  return NextResponse.json({
    success: true,
    data: analysisResult
  })
}
```

### 2. 언어별 메시지 구조
```json
// messages/ko.json
{
  "analysis": {
    "ui": {
      "keywordDescription": "AI가 웹페이지를 분석하여 고객들이 검색할 가능성이 높은 키워드를 추천했어요!",
      "aiRecommendedKeywords": "AI 추천 키워드"
    }
  }
}

// messages/en.json  
{
  "analysis": {
    "ui": {
      "keywordDescription": "AI analyzed your webpage and suggested keywords that customers are likely to search for!",
      "aiRecommendedKeywords": "AI Recommended Keywords"
    }
  }
}
```

### 3. 스타일링 - 글래스모피즘 언어 드롭다운
```scss
// src/styles/language-dropdown.scss
.header__language-btn {
  // 글래스모피즘 효과
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  
  // 호버 애니메이션
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    
    .dropdown-arrow {
      transform: rotate(180deg);  // 화살표 회전
    }
  }
}
```

---

## 🚀 실행 방법

### 1. 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
OPENAI_API_KEY=your_openai_api_key

# 개발 서버 실행
npm run dev
```

### 2. 접속 방법
- 한국어: `http://localhost:3000/ko`
- 영어: `http://localhost:3000/en`

---

## 🎯 핵심 학습 포인트

### 1. Next.js 국제화
- **동적 라우팅**: `[locale]` 폴더로 언어별 URL 생성
- **미들웨어**: 언어 감지 및 자동 리다이렉트
- **번역 시스템**: JSON 파일 기반 다국어 메시지

### 2. AI 통합
- **프롬프트 엔지니어링**: 언어별 맞춤 프롬프트 설계
- **JSON 응답**: 구조화된 AI 응답으로 일관된 결과
- **폴백 시스템**: AI 실패 시 기본 조언 제공

### 3. 사용자 경험
- **진행 상황 표시**: 분석 과정을 단계별로 시각화
- **반응형 디자인**: 모바일 우선 설계
- **접근성**: ARIA 라벨과 시맨틱 HTML

이 문서는 프로젝트의 핵심 구조와 동작 원리를 이해하는 데 도움이 되며, 향후 기능 확장이나 유지보수 시 참고할 수 있습니다.