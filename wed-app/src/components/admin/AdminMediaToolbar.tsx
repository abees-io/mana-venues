import { useState } from 'react'
import { Camera, Crop, Sparkles, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  useHomeMediaStore,
  DEFAULT_HERO_IMAGE,
  DEFAULT_VENUE_FEATURE_IMAGE,
  DEFAULT_CATEGORY_IMAGES,
} from '../../store/homeMediaStore'
import HomeImageModal, { type HomeImageTarget } from '../modals/HomeImageModal'

interface MediaSlot {
  type: HomeImageTarget['type']
  id: string
  label: string
  aspectRatioLabel: string
  getImage: () => string
}

export default function AdminMediaToolbar() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'

  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [activeTarget, setActiveTarget] = useState<HomeImageTarget | null>(null)

  const heroImage = useHomeMediaStore((s) => s.heroImage)
  const venueFeatureImage = useHomeMediaStore((s) => s.venueFeatureImage)
  const categoryImages = useHomeMediaStore((s) => s.categoryImages)

  if (!isAdmin) return null

  const mediaSlots: MediaSlot[] = [
    {
      type: 'hero',
      id: 'hero',
      label: 'Home Hero Banner',
      aspectRatioLabel: '16:9 / Panoramic',
      getImage: () => heroImage || DEFAULT_HERO_IMAGE,
    },
    {
      type: 'venueFeature',
      id: 'venueFeature',
      label: 'Find Your Venues Banner',
      aspectRatioLabel: '16:9 / Wide',
      getImage: () => venueFeatureImage || DEFAULT_VENUE_FEATURE_IMAGE,
    },
    {
      type: 'category',
      id: 'destination_wedding',
      label: 'Destination Wedding Category',
      aspectRatioLabel: '4:3 Card',
      getImage: () => categoryImages.destination_wedding || DEFAULT_CATEGORY_IMAGES.destination_wedding,
    },
    {
      type: 'category',
      id: 'photography',
      label: 'Photography Category',
      aspectRatioLabel: '4:3 Card',
      getImage: () => categoryImages.photography || DEFAULT_CATEGORY_IMAGES.photography,
    },
    {
      type: 'category',
      id: 'catering',
      label: 'Catering Category',
      aspectRatioLabel: '4:3 Card',
      getImage: () => categoryImages.catering || DEFAULT_CATEGORY_IMAGES.catering,
    },
    {
      type: 'category',
      id: 'makeup_artist',
      label: 'Bridal Makeup Category',
      aspectRatioLabel: '4:3 Card',
      getImage: () => categoryImages.makeup_artist || DEFAULT_CATEGORY_IMAGES.makeup_artist,
    },
  ]

  const handleEditSlot = (slot: MediaSlot) => {
    setActiveTarget({
      type: slot.type,
      id: slot.id,
      label: slot.label,
    })
  }

  return (
    <>
      {/* Floating Admin Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 left-4 z-40">
        <button
          type="button"
          onClick={() => setIsStudioOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#160f1b]/95 hover:bg-[#160f1b] text-white text-xs font-bold border border-[#f98093]/40 shadow-xl backdrop-blur-md active:scale-95 transition-all cursor-pointer group"
          title="Admin Media Control: Change or crop any website image"
        >
          <span className="w-2 h-2 rounded-full bg-[#f98093] animate-pulse" />
          <Camera className="w-3.5 h-3.5 text-[#f98093] group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-mono">Admin: Edit Media</span>
          <span className="sm:hidden">Media</span>
        </button>
      </div>

      {/* Admin Media Manager Studio Drawer / Modal */}
      {isStudioOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsStudioOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#17121b] border border-[#f98093]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-white"
          >
            {/* Studio Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f98093]/20 text-[#f98093] flex items-center justify-center border border-[#f98093]/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Admin Website Media Studio</h3>
                  <p className="text-xs text-white/60">
                    Replace, upload, and crop any visual media across the website
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Slots List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {mediaSlots.map((slot) => {
                  const currentImg = slot.getImage()
                  return (
                    <div
                      key={slot.id}
                      className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#f98093]/50 rounded-2xl p-3 flex gap-3 transition-all"
                    >
                      {/* Thumbnail Preview */}
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                        <img
                          src={currentImg}
                          alt={slot.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Info & Action */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {slot.label}
                          </h4>
                          <span className="text-[10px] text-white/50 block mt-0.5">
                            {slot.aspectRatioLabel}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEditSlot(slot)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f98093] hover:bg-[#e86e81] text-white text-xs font-bold transition-all shadow-xs self-start cursor-pointer active:scale-95"
                        >
                          <Crop className="w-3 h-3" />
                          <span>Change & Crop</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-black/30 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>All changes persist immediately for every visitor across the site.</span>
              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Modal for Editing & Cropping */}
      {activeTarget && (
        <HomeImageModal
          target={activeTarget}
          onClose={() => setActiveTarget(null)}
        />
      )}
    </>
  )
}
