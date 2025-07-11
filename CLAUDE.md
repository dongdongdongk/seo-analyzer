# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered SEO analysis service designed for beginners ("초보자 맞춤 AI SEO 분석 서비스"). The service aims to help non-technical users understand and improve their website's SEO in simple, actionable terms.

**Target Users:**
- Personal bloggers (Naver Blog, Tistory, WordPress)
- Small business owners (cafes, restaurants, beauty salons)
- Online store operators
- Freelancers with portfolio sites
- Junior marketers new to SEO

## Architecture (Planned)

Based on the project planning document, the intended stack is:

- **Frontend**: Next.js with React (mobile-first responsive design)
- **Backend**: API server with parallel processing capabilities
- **AI Engine**: GPT-4 integration for personalized SEO advice
- **Analysis Engine**: Lighthouse API for performance analysis

## Core Features (Planned)

1. **Simplified SEO Health Check** (5 areas):
   - Title optimization
   - Meta descriptions
   - Image optimization
   - Site speed
   - Mobile friendliness

2. **AI-Powered Analysis**:
   - Automatic site type detection (blog/e-commerce/corporate/portfolio)
   - Industry-specific recommendations
   - Local SEO optimization for regional businesses
   - Competition level analysis

3. **Beginner-Friendly Reporting**:
   - No technical jargon
   - Visual indicators (red/yellow/green)
   - Step-by-step implementation guides
   - Real-world analogies for complex concepts

## Development Approach

- **User Experience**: Prioritize simplicity and clarity over technical detail
- **Language**: Use plain Korean language, avoid SEO technical terms
- **Mobile-First**: Design for mobile users primarily
- **Performance**: Target 3-minute analysis completion
- **Error Handling**: Provide friendly, helpful error messages

## Key Principles

- Always explain SEO concepts in simple terms
- Provide actionable, specific improvement steps
- Focus on immediate, implementable solutions
- Tailor advice to the detected business type and industry
- Maintain a supportive, encouraging tone throughout the user experience

## Development Notes

This project is currently in the planning phase. The main planning document is in `project.txt` (Korean language). When implementing features, refer to the detailed specifications in that document for user experience flows and technical requirements.



## Rules

🎯 사용자 경험 규칙
5.1 언어 사용 규칙

전문용어 금지: SEO 전문용어를 일반인도 이해할 수 있는 표현으로 변환 (전문 용어 설명 )
구체적 표현: "개선이 필요합니다" → "고객이 더 쉽게 찾을 수 있도록 제목을 바꿔보세요"
긍정적 피드백: 문제점보다 개선 방법에 집중

5.2 UI/UX 규칙

3초 규칙: 사용자가 3초 안에 다음 액션을 파악할 수 있어야 함
아이콘 필수: 모든 기능에 직관적 아이콘 배치
모바일 퍼스트: 모바일 화면에서 먼저 완벽하게 작동해야 함
SCSS 사용 

🔧 분석 엔진 규칙
5.3 분석 정확도 규칙

다중 검증: 하나의 문제에 대해 최소 2개 이상의 검증 방법 사용
거짓 양성 방지: 실제 문제가 아닌 것을 문제로 판단하지 않도록 필터링
업종별 기준: 업종에 따라 다른 평가 기준 적용
현실성 체크: 개선 제안이 실제로 실행 가능한지 검증

5.4 조언 품질 규칙

우선순위 필수: 개선 항목을 중요도 순으로 정렬
실행 가능성: 기술적 지식 없이도 따라할 수 있는 수준
예상 효과: 각 개선 항목의 기대 효과를 구체적으로 설명
단계별 분해: 복잡한 작업을 작은 단계로 나누어 제시

🛡️ 서비스 품질 규칙
5.5 응답 시간 규칙

3분 내 분석 완료: 사용자가 기다릴 수 있는 최대 시간
진행 상황 표시: 분석 중 현재 진행 상태를 시각적으로 표시
실패 시 안내: 분석 실패 시 명확한 이유와 대안 제시


6. 기술 구현 방향
⚙️ 시스템 아키텍처
6.1 Frontend (Next.js)

직관적 UI: 버튼 크게, 색깔로 구분, 아이콘 많이 사용
반응형 디자인: 모바일 우선 설계 (많은 사용자가 폰으로 접근)
프로그레시브 로딩: 결과를 기다리는 동안 팁 제공

6.2 Backend API

빠른 응답: 3분 내 분석 완료 목표
병렬 처리: 여러 분석을 동시에 진행
캐싱 전략: 비슷한 사이트는 빨리 분석
에러 핸들링: 분석 실패 시 친절한 안내 메시지

6.3 AI 엔진

GPT-4 활용: 자연스러운 조언 생성
프롬프트 최적화: 초보자용 쉬운 설명 생성에 특화
컨텍스트 관리: 사이트별 특성 기억하고 활용
응답 품질 관리: 항상 친절하고 이해하기 쉬운 답변

🔧 핵심 모듈들
6.4 사이트 분석 엔진

자동 사이트 타입 감지: 블로그/쇼핑몰/기업사이트 구분
콘텐츠 스캔: 중요한 텍스트와 이미지 추출
기술적 검사: 속도, 모바일, 기본 SEO 요소
경쟁 환경 파악: 비슷한 키워드의 경쟁 정도


# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results