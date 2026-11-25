import type { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import CookieBanner from '../common/CookieBanner'
import AdminMediaToolbar from '../admin/AdminMediaToolbar'

interface LayoutProps {
  children: ReactNode
  hideHeader?: boolean
  hideHeaderOnMobile?: boolean
}

export default function Layout({
  children,
  hideHeader = false,
  hideHeaderOnMobile = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F0F9F8] text-[#5A172D] flex flex-col w-full overflow-x-hidden">
      {!hideHeader && (
        <div className={hideHeaderOnMobile ? 'hidden md:block' : ''}>
          <Header />
        </div>
      )}
      <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <CookieBanner />
      <AdminMediaToolbar />
    </div>
  )
}
