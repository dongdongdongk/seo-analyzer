import type { Viewport } from 'next'
import '@/styles/globals.scss'
import '@/styles/components.scss'
import '@/styles/icons.scss'
import '@/styles/pages.scss'
import '@/styles/language-dropdown.scss'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}