import { useState, useEffect, useRef } from 'react'
import { X, Upload, Image as ImageIcon, Loader2, RotateCcw } from 'lucide-react'
import { uploadOrConvertPhoto } from '../../lib/imageUtils'
import {
  useHomeMediaStore,
  DEFAULT_HERO_IMAGE,
  DEFAULT_CATEGORY_IMAGES,
} from '../../store/homeMediaStore'

export interface HomeImageTarget {
  type: 'hero' | 'category'
  id: string
  label: string
}

interface HomeImageModalProps {
  target: HomeImageTarget | null
  onClose: () => void
}

const PRESET_IMAGES = [
  '/dest-wedding-1.jpg',
  '/dest-wedding-2.jpg',
  '/dest-wedding-3.jpg',
  '/category-lakeside.jpg',
  '/category-lakeside-clean.jpg',
]

export default function HomeImageModal({ target, onClose }: HomeImageModalProps) {
  const heroImage = useHomeMediaStore((s) => s.heroImage)
  const categoryImages = useHomeMediaStore((s) => s.categoryImages)
  const setHeroImage = useHomeMediaStore((s) => s.setHeroImage)
  const setCategoryImage = useHomeMediaStore((s) => s.setCategoryImage)
  const resetHeroImage = useHomeMediaStore((s) => s.resetHeroImage)
  const resetCategoryImage = useHomeMediaStore((s) => s.resetCategoryImage)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!target) return
    const current =
      target.type === 'hero'
        ? heroImage
        : categoryImages[target.id] || DEFAULT_CATEGORY_IMAGES[target.id] || DEFAULT_HERO_IMAGE
    setUrlInput(current)
    setErrorMsg(null)
  }, [target, heroImage, categoryImages])

  if (!target) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setErrorMsg(null)
    try {
      const uploadedUrl = await uploadOrConvertPhoto(file, 'homepage')
      setUrlInput(uploadedUrl)
    } catch {
      setErrorMsg('Could not process image file. Please try another photo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setErrorMsg('Please upload an image or enter an image URL.')
      return
    }
    if (target.type === 'hero') {
      setHeroImage(trimmed)
    } else {
      setCategoryImage(target.id, trimmed)
    }
    onClose()
  }

  const handleReset = () => {
    if (target.type === 'hero') {
      resetHeroImage()
    } else {
      resetCategoryImage(target.id)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-image-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-brand-dark border border-brand-secondary/50 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60 mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-secondary" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-secondary font-bold block">
                Admin Front Page Media
              </span>
              <h2 id="home-image-modal-title" className="text-base font-bold">
                Change {target.label} Image
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-gray-400 hover:text-white bg-emerald-950/60 border border-emerald-800/40"
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
          {/* Live Preview */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-emerald-700/60 bg-black">
            <img
              src={urlInput || DEFAULT_HERO_IMAGE}
              alt={target.label}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Upload From Device */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <span className="text-xs font-semibold text-emerald-200">
              Upload new photo from device
            </span>
            <div>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-xs font-semibold text-white border border-emerald-600/50 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? 'Processing...' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>

          {/* Or Paste URL */}
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Or Image URL / Path
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="/dest-wedding-1.jpg or https://..."
              className="w-full px-3 py-2 text-xs bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
            />
          </div>

          {/* Quick Local Presets */}
          <div>
            <p className="text-[11px] font-semibold text-emerald-300/80 mb-2">
              Quick Presets
            </p>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUrlInput(preset)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    urlInput === preset
                      ? 'border-brand-secondary scale-105'
                      : 'border-emerald-800/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 border-t border-emerald-800/60">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FFF04B] via-[#FFC700] to-[#FFA000] hover:from-[#FFF566] hover:to-[#FFB000] text-brand-dark font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                Save Photo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
