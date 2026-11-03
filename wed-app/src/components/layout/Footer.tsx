import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="MANA Venues" className="h-8 w-auto object-contain" />
              <span
                className="text-sm font-semibold tracking-[0.18em] text-brand-dark"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MANA <span className="text-brand-secondary">VENUES</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-xs">
              Kerala's trusted platform for discovering and booking verified wedding auditoriums,
              convention centres, and luxury banquet halls.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              Explore
            </p>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Home
              </Link>
              <Link to="/city/kochi" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Venues in Kochi
              </Link>
              <Link to="/city/trivandrum" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Venues in Trivandrum
              </Link>
              <Link to="/city/kozhikode" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Venues in Kozhikode
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              Legal
            </p>
            <nav className="flex flex-col gap-2">
              <Link to="/terms" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookie-policy" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Cookie Policy
              </Link>
              <Link to="/refund-policy" className="text-xs text-neutral-500 hover:text-brand-secondary transition-colors">
                Refund Policy
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-neutral-400 font-light">
            &copy; {year} MANA Venues. All rights reserved.
          </p>
          <p className="text-[10px] text-neutral-400 font-light">
            Registered in Kerala, India &middot; GSTIN: 32XXXXXXXXXXXXX
          </p>
        </div>
      </div>
    </footer>
  )
}
