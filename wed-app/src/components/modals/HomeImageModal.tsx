import { useState, useEffect, useRef } from 'react'
import { X, Upload, Image as ImageIcon, Loader2, RotateCcw, Crop as CropIcon } from 'lucide-react'
import { uploadOrConvertPhoto } from '../../lib/imageUtils'
import {
  useHomeMediaStore,
  DEFAULT_HERO_IMAGE,
  DEFAULT_CATEGORY_IMAGES,
  DEFAULT_VENUE_FEATURE_IMAGE,
} from '../../store/homeMediaStore'
import ImageCropModal from './ImageCropModal'

export interface HomeImageTarget {
  type: 'hero' | 'category' | 'vision' | 'venueFeature' | 'site'
  id: string
  label: string
}

interface HomeImageModalProps {
  target: HomeImageTarget | null
  onClose: () => void
}

const PRESET_IMAGES = [
  '/category-destination.jpg',
  '/category-photography.jpg',
  '/category-catering.jpg',
  '/category-makeup.jpg',
  '/dest-wedding-1.jpg',
  '/dest-wedding-2.jpg',
  '/dest-wedding-3.jpg',
  '/category-lakeside.jpg',
  '/category-lakeside-clean.jpg',
  '/venue-ai-dummy.jpg',
]

export default function HomeImageModal({ target, onClose }: HomeImageModalProps) {
  const heroImage = useHomeMediaStore((s) => s.heroImage)
  const visionImage = useHomeMediaStore((s) => s.visionImage)
  const venueFeatureImage = useHomeMediaStore((s) => s.venueFeatureImage)
  const categoryImages = useHomeMediaStore((s) => s.categoryImages)
  const siteImages = useHomeMediaStore((s) => s.siteImages)

  const setHeroImage = useHomeMediaStore((s) => s.setHeroImage)
  const setVisionImage = useHomeMediaStore((s) => s.setVisionImage)
  const setVenueFeatureImage = useHomeMediaStore((s) => s.setVenueFeatureImage)
  const setCategoryImage = useHomeMediaStore((s) => s.setCategoryImage)
  const setSiteImage = useHomeMediaStore((s) => s.setSiteImage)

  const resetHeroImage = useHomeMediaStore((s) => s.resetHeroImage)
  const resetVisionImage = useHomeMediaStore((s) => s.resetVisionImage)
  const resetVenueFeatureImage = useHomeMediaStore((s) => s.resetVenueFeatureImage)
  const resetCategoryImage = useHomeMediaStore((s) => s.resetCategoryImage)
  const resetSiteImage = useHomeMediaStore((s) => s.resetSiteImage)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)

  useEffect(() => {
    if (!target) return
    let current = ''
    if (target.type === 'hero') {
      current = heroImage
    } else if (target.type === 'vision') {
      current = visionImage
    } else if (target.type === 'venueFeature') {
      current = venueFeatureImage || DEFAULT_VENUE_FEATURE_IMAGE
    } else if (target.type === 'site') {
      current = siteImages[target.id] || DEFAULT_HERO_IMAGE
    } else {
      current = categoryImages[target.id] || DEFAULT_CATEGORY_IMAGES[target.id] || DEFAULT_HERO_IMAGE
    }
    setUrlInput(current)
    setErrorMsg(null)
  }, [target, heroImage, visionImage, venueFeatureImage, categoryImages, siteImages])

  if (!target) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setErrorMsg(null)
    try {
      const uploadedUrl = await uploadOrConvertPhoto(file, 'homepage')
      setUrlInput(uploadedUrl)
      // Open cropper immediately for admin convenience
      setIsCropOpen(true)
    } catch {
      setErrorMsg('Could not process image file. Please try another photo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setErrorMsg('Please upload an image or enter an image URL.')
      return
    }
    setIsSaving(true)
    setErrorMsg(null)
    try {
      if (target.type === 'hero') {
        await setHeroImage(trimmed)
      } else if (target.type === 'vision') {
        await setVisionImage(trimmed)
      } else if (target.type === 'venueFeature') {
        await setVenueFeatureImage(trimmed)
      } else if (target.type === 'site') {
        await setSiteImage(target.id, trimmed)
      } else {
        await setCategoryImage(target.id, trimmed)
      }
      onClose()
    } catch {
      setErrorMsg('Failed to save to cloud. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      if (target.type === 'hero') {
        await resetHeroImage()
      } else if (target.type === 'vision') {
        await resetVisionImage()
      } else if (target.type === 'venueFeature') {
        await resetVenueFeatureImage()
      } else if (target.type === 'site') {
        await resetSiteImage(target.id)
      } else {
        await resetCategoryImage(target.id)
      }
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-image-modal-title"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-[#17121b] border border-[#f98093]/30 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#f98093]/20 flex items-center justify-center text-[#f98093] border border-[#f98093]/30">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#f98093] font-bold block">
                  Admin Image Manager
                </span>
                <h2 id="home-image-modal-title" className="text-base font-bold">
                  Change {target.label}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Live Preview & Instant Crop Button */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/15 bg-black group">
              <img
                src={urlInput || DEFAULT_HERO_IMAGE}
                alt={target.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Float Crop Action Button on image */}
              <button
                type="button"
                onClick={() => setIsCropOpen(true)}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-[#f98093] text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95 cursor-pointer"
                title="Crop and adjust framing"
              >
                <CropIcon className="w-3.5 h-3.5 text-[#f98093] group-hover:text-white" />
                <span>Crop / Adjust Image</span>
              </button>
            </div>

            {/* Upload & Crop Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/90">
                  Upload new photo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? 'Processing...' : 'Upload from Device'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCropOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f98093]/20 hover:bg-[#f98093]/30 text-[#f98093] border border-[#f98093]/40 text-xs font-bold transition-all cursor-pointer"
                  title="Crop current image"
                >
                  <CropIcon className="w-3.5 h-3.5" />
                  <span>Crop</span>
                </button>
              </div>
            </div>

            {/* Or Paste URL */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Or Image URL / Path
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="/dest-wedding-1.jpg or https://..."
                className="w-full px-3 py-2 text-xs bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f98093]/50"
              />
            </div>

            {/* Quick Local Presets */}
            <div>
              <p className="text-[11px] font-semibold text-white/60 mb-2">
                Quick Presets
              </p>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUrlInput(preset)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      urlInput === preset
                        ? 'border-[#f98093] scale-105'
                        : 'border-white/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || isSaving}
                  className="px-6 py-2.5 rounded-full bg-[#f98093] hover:bg-[#e86e81] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        imageUrl={urlInput || DEFAULT_HERO_IMAGE}
        onCrop={(croppedDataUrl) => setUrlInput(croppedDataUrl)}
        onClose={() => setIsCropOpen(false)}
        title={`Crop ${target.label}`}
      />
    </>
  )
}
