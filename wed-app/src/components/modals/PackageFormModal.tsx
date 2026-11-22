import { useState, useEffect, useRef } from 'react'
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, Star } from 'lucide-react'
import { uploadOrConvertMultiplePhotos } from '../../lib/imageUtils'
import { usePackagesStore, type WeddingPackage } from '../../store/packagesStore'

interface PackageFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialPackage?: WeddingPackage | null
}

const BACKDROP_OPTIONS: WeddingPackage['backdrop'][] = [
  'Backwaters',
  'Coast',
  'Hills',
  'Heritage',
]

export default function PackageFormModal({
  isOpen,
  onClose,
  initialPackage,
}: PackageFormModalProps) {
  const addPackage = usePackagesStore((s) => s.addPackage)
  const updatePackage = usePackagesStore((s) => s.updatePackage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [backdrop, setBackdrop] = useState<WeddingPackage['backdrop']>('Backwaters')
  const [location, setLocation] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [guestCapacity, setGuestCapacity] = useState('')
  const [partnerPlanner, setPartnerPlanner] = useState('MANA Verified Curators')
  const [description, setDescription] = useState('')
  const [inclusionsText, setInclusionsText] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (initialPackage) {
      setTitle(initialPackage.title)
      setTagline(initialPackage.tagline)
      setBackdrop(initialPackage.backdrop)
      setLocation(initialPackage.location)
      setStartingPrice(initialPackage.startingPrice)
      setGuestCapacity(initialPackage.guestCapacity)
      setPartnerPlanner(initialPackage.partnerPlanner)
      setDescription(initialPackage.description)
      setInclusionsText(initialPackage.inclusions.join('\n'))
      setInstagramUrl(initialPackage.instagramUrl || '')
      setWhatsappNumber(initialPackage.whatsappNumber || '')
      setImages(
        initialPackage.images?.length
          ? initialPackage.images
          : initialPackage.image
            ? [initialPackage.image]
            : []
      )
    } else {
      setTitle('')
      setTagline('')
      setBackdrop('Backwaters')
      setLocation('')
      setStartingPrice('₹8,50,000')
      setGuestCapacity('150 - 400 Guests')
      setPartnerPlanner('MANA Verified Curators')
      setDescription('')
      setInclusionsText(
        'Venue & floral mandap setup\nTraditional Kerala Sadya & catering\nDedicated event coordination'
      )
      setInstagramUrl('https://instagram.com/manaweddings')
      setWhatsappNumber('919847012345')
      setImages(['/dest-wedding-1.jpg'])
    }
    setImageUrlInput('')
    setErrorMsg(null)
  }, [isOpen, initialPackage])

  if (!isOpen) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    setErrorMsg(null)
    try {
      const uploaded = await uploadOrConvertMultiplePhotos(files)
      setImages((prev) => [...prev, ...uploaded])
    } catch {
      setErrorMsg('Failed to process one or more images. Please try smaller image files.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/')) {
      setErrorMsg('Image URL must start with http://, https://, or /')
      return
    }
    setErrorMsg(null)
    setImages((prev) => [...prev, trimmed])
    setImageUrlInput('')
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleMakeCover = (index: number) => {
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev
      const chosen = prev[index]
      return [chosen, ...prev.filter((_, idx) => idx !== index)]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanTitle = title.trim()
    const cleanLocation = location.trim()
    const cleanPrice = startingPrice.trim()
    const cleanDesc = description.trim()

    if (!cleanTitle || !cleanLocation || !cleanPrice || !cleanDesc) {
      setErrorMsg('Please fill in Title, Location, Starting Price, and Description.')
      return
    }

    const finalImages = images.length > 0 ? images : ['/dest-wedding-1.jpg']
    const inclusions = inclusionsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const payload: Omit<WeddingPackage, 'id' | 'reels'> = {
      title: cleanTitle.slice(0, 120),
      tagline: tagline.trim().slice(0, 160) || `${backdrop} destination wedding experience`,
      backdrop,
      location: cleanLocation.slice(0, 120),
      startingPrice: cleanPrice.slice(0, 40),
      guestCapacity: guestCapacity.trim().slice(0, 60) || '100 - 400 Guests',
      image: finalImages[0],
      images: finalImages,
      description: cleanDesc.slice(0, 1000),
      inclusions: inclusions.length > 0 ? inclusions : ['Bespoke Kerala wedding coordination'],
      partnerPlanner: partnerPlanner.trim().slice(0, 100) || 'MANA Verified Curators',
      verified: true,
      instagramUrl: instagramUrl.trim(),
      whatsappNumber: whatsappNumber.trim(),
    }

    if (initialPackage) {
      updatePackage(initialPackage.id, payload)
    } else {
      addPackage(payload)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-form-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl bg-brand-dark border border-brand-secondary/50 shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto text-white"
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60 mb-5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-brand-secondary font-bold">
              Admin Package Manager
            </span>
            <h2 id="package-form-title" className="text-xl font-bold text-white">
              {initialPackage ? 'Edit Wedding Package' : 'Add New Wedding Package'}
            </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kumarakom Lakefront Royal Wedding"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Backdrop Category *
              </label>
              <select
                value={backdrop}
                onChange={(e) => setBackdrop(e.target.value as WeddingPackage['backdrop'])}
                className="w-full px-3 py-2 text-sm bg-emerald-950/90 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              >
                {BACKDROP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kumarakom, Kottayam"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Starting Price *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="e.g. ₹10,50,000"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Guest Capacity
              </label>
              <input
                type="text"
                maxLength={60}
                value={guestCapacity}
                onChange={(e) => setGuestCapacity(e.target.value)}
                placeholder="e.g. 200 - 500 Guests"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Tagline
              </label>
              <input
                type="text"
                maxLength={160}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short subtitle highlight"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Partner Planner
              </label>
              <input
                type="text"
                maxLength={100}
                value={partnerPlanner}
                onChange={(e) => setPartnerPlanner(e.target.value)}
                placeholder="e.g. Heritage Palms Events (Verified)"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Instagram Link (Exclusive)
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                WhatsApp Number (Exclusive)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 919847012345"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the venue atmosphere, rituals, and hospitality experience..."
              className="w-full p-2.5 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Bespoke Inclusions (one per line)
            </label>
            <textarea
              rows={3}
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
              placeholder="Lakefront mandap setup&#10;Grand Kerala Sadya feast&#10;Chenda Melam welcome"
              className="w-full p-2.5 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
            />
          </div>

          {/* Package Images Upload & Management */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                  Package Images ({images.length})
                </span>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/70 hover:bg-emerald-700 text-xs font-semibold text-white border border-emerald-600/50 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? 'Processing...' : 'Upload Images'}</span>
                </button>
              </div>
            </div>

            {/* Paste Image URL */}
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://... or /dest-wedding-1.jpg)"
                className="flex-1 px-3 py-1.5 text-xs bg-brand-dark border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-xs font-semibold text-emerald-100 border border-emerald-700/50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={`${img.slice(0, 32)}-${idx}`}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden border border-emerald-700/60 bg-black group"
                  >
                    <img src={img} alt={`Package ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 ? (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-secondary text-brand-dark text-[9px] font-extrabold">
                        COVER
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakeCover(idx)}
                        title="Set as cover image"
                        className="absolute top-1 left-1 p-1 rounded bg-black/70 text-white hover:text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      aria-label="Remove image"
                      className="absolute top-1 right-1 p-1 rounded bg-black/70 text-red-400 hover:bg-red-900/90 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-emerald-800/60">
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
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E05A85] via-[#F3A2BE] to-[#E05A85] hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {initialPackage ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
