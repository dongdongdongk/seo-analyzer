# ✅ Next.js RULE

1. **서버 컴포넌트**  
   기본적으로 모든 컴포넌트는 서버 컴포넌트로 시작함.

2. **클라이언트 컴포넌트**  
   꼭 필요한 경우(onClick, 상태 관리 등)만 그 부분만 컴포넌트로 분리해서 `use client` 선언.

3. **metadata 사용**  
   각 페이지에 `metadata` 객체 또는 `generateMetadata()` 함수 사용.

4. **`<h1>`, `<h2>` 등 시멘틱 태그 사용**  
   의미 있는 HTML 구조로 마크업 작성.

5. **이미지**  
   `next/image` 컴포넌트로 자동 최적화.

6. **정적 렌더링**  
   가능하면 `generateStaticParams()`나 캐시로 정적 생성 (SSG) 유도.

7. **OG 태그**  
   SNS 미리보기용 Open Graph 메타태그 정의.

8. **next/image**  
   이미지 사이즈 자동 조정 + lazy loading 사용.

9. **loading="lazy"**  
   iframe, 이미지 등은 지연 로딩.

10. **Suspense**  
    느린 로딩 구간에 suspense 처리로 UX 향상.

11. **코드 분할**  
    동적 import (`dynamic()`)로 클라이언트 번들 최소화.

12. **캐시**  
    fetch에는 `cache`, `revalidate` 옵션 사용.

13. **환경 변수**  
    `.env.local` 파일에 저장하고 절대 커밋 금지.

14. **API 키 보호**  
    서버 컴포넌트나 백엔드 API 라우트에서만 사용.

15. **입력 검증**  
    사용자 입력은 항상 sanitize 및 validate.

16. **CORS 정책**  
    외부 API 요청 시 정책 명확히 확인.

17. **중첩 라우트**  
    디렉토리 구조로 중첩 (`/app/blog/[slug]/page.tsx`)

18. **인터셉팅 라우트**  
    모달, 상세 페이지 등은 `(.)` 디렉토리 사용

19. **라우트 그룹**  
    URL에는 포함되지 않지만 구조적으로 묶고 싶을 때 `()` 사용

20. **명확한 분리**  
    UI 컴포넌트 vs 서버 로직 vs 상태 로직 분리

21. **공통 컴포넌트**  
    `components/common/` 등에 정리

22. **이름 규칙**  
    PascalCase 사용 (`MyButton.tsx`)

23. **try-catch**  
    모든 비동기 로직은 에러 핸들링 포함

24. **사용자 에러 메시지**  
    개발자용 로그 + 사용자용 메시지를 구분

25. **404, 500 페이지**  
    `not-found.tsx`, `error.tsx` 반드시 구현

26. **타입스크립트 사용**  
    `.ts`, `.tsx` 기본으로 사용

27. **ESM 기반**  
    최신 모듈 방식 사용

28. **다국어 처리 (i18n)**  
    `next-intl`이나 `next-i18next`

29. **애널리틱스**  
    Google Analytics, Vercel Analytics

30. **접근성**  
    `aria` 속성, 키보드 네비게이션 등 고려

31. **CSR 페이지 최소화**  
    정말 필요한 곳에만 클라이언트 렌더링 허용

32. **디자인은 SCSS 사용**  
    모든 스타일링은 SCSS(Sass)를 사용하고 CSS-in-JS는 사용하지 않음.

33. **배포는 Vercel 사용 + 필요 시 Supabase 사용**  
    기본 배포 플랫폼은 Vercel을 사용하고, 데이터베이스나 인증 등에는 필요 시 Supabase를 병행 사용.