import { redirect } from 'next/navigation'

// 이 페이지는 middleware에서 리디렉션되므로 실제로는 도달하지 않음
// 하지만 혹시 도달하는 경우를 위한 fallback
export default function RootPage() {
  // 기본값으로 한국어 페이지로 리디렉션
  redirect('/ko')
}