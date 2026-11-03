import type { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import CookieBanner from '../common/CookieBanner'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-brand-dark/90 flex flex-col w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <CookieBanner />
    </div>
  )
}
