import { useState, useEffect, useRef } from 'react'
import {
  X,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Star,
  Crop as CropIcon,
  Film,
  Smartphone,
  Monitor,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { uploadOrConvertMultiplePhotos } from '../../lib/imageUtils'
import {
  usePackagesStore,
  type WeddingPackage,
  type PackageReel,
  type ReelAspectRatio,
} from '../../store/packagesStore'
import { useAuth } from '../../contexts/AuthContext'
import { useCities, KERALA_DISTRICTS_CITIES } from '../../hooks/useCities'
import { formatSelectedCitiesLocation } from '../../lib/cityMatch'
import { MultiCitySelector } from '../common/MultiCitySelector'
import ImageCropModal from './ImageCropModal'

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
  const { profile } = useAuth()
  const { data: dbCities } = useCities()
  const allCities = dbCities && dbCities.length > 0 ? dbCities : KERALA_DISTRICTS_CITIES
  const addPackage = usePackagesStore((s) => s.addPackage)
  const updatePackage = usePackagesStore((s) => s.updatePackage)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [backdrop, setBackdrop] = useState<WeddingPackage['backdrop']>('Backwaters')
  const [location, setLocation] = useState('')
  const [selectedCities, setSelectedCities] = useState<string[]>([])
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
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null)

  // Instagram-style Reel / Video state
  const [reelVideoUrl, setReelVideoUrl] = useState('')
  const [reelTitle, setReelTitle] = useState('')
  const [reelLocation, setReelLocation] = useState('')
  const [reelAspectRatio, setReelAspectRatio] = useState<ReelAspectRatio>('9:16')
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [existingReels, setExistingReels] = useState<PackageReel[]>([])

  useEffect(() => {
    if (!isOpen) return
    if (initialPackage) {
      setTitle(initialPackage.title)
      setTagline(initialPackage.tagline)
      setBackdrop(initialPackage.backdrop)
      setLocation(initialPackage.location)
      if (initialPackage.cities && initialPackage.cities.length > 0) {
        setSelectedCities(initialPackage.cities)
      } else {
        const locLower = (initialPackage.location || '').toLowerCase()
        const inferred = KERALA_DISTRICTS_CITIES.filter((c) =>
          locLower.includes(c.slug.toLowerCase()) ||
          locLower.includes(c.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, ''))
        ).map((c) => c.slug)
        setSelectedCities(inferred)
      }
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
      const primaryReel = initialPackage.reels?.[0]
      if (primaryReel) {
        setReelVideoUrl(primaryReel.videoUrl || '')
        setReelTitle(primaryReel.title || '')
        setReelLocation(primaryReel.location || '')
        setReelAspectRatio(primaryReel.aspectRatio || '9:16')
        setExistingReels(initialPackage.reels || [])
      } else {
        setReelVideoUrl('')
        setReelTitle('')
        setReelLocation('')
        setReelAspectRatio('9:16')
        setExistingReels([])
      }
    } else {
      setTitle('')
      setTagline('')
      setBackdrop('Backwaters')
      setLocation('')
      setSelectedCities([])
      setStartingPrice('Price on Demand')
      setGuestCapacity('150 - 400 Guests')
      setPartnerPlanner(profile?.business_name || profile?.full_name || 'MANA Verified Curators')
      setDescription('')
      setInclusionsText(
        'Venue & floral mandap setup\nTraditional Kerala Sadya & catering\nDedicated event coordination'
      )
      setInstagramUrl('https://instagram.com/manaweddings')
      setWhatsappNumber('919847012345')
      setImages(['/dest-wedding-1.jpg'])
      setReelVideoUrl('')
      setReelTitle('')
      setReelLocation('')
      setReelAspectRatio('9:16')
      setExistingReels([])
    }
    setImageUrlInput('')
    setErrorMsg(null)
  }, [isOpen, initialPackage, profile])

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

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingVideo(true)
    setErrorMsg(null)
    try {
      const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { error: uploadErr } = await supabase.storage
        .from('auditorium-photos')
        .upload(`reels/${cleanName}`, file, {
          upsert: true,
          contentType: file.type || 'video/mp4',
        })

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('auditorium-photos')
          .getPublicUrl(`reels/${cleanName}`)
        if (urlData?.publicUrl) {
          setReelVideoUrl(urlData.publicUrl)
          return
        }
      }

      if (file.size <= 6 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setReelVideoUrl(reader.result)
          }
        }
        reader.readAsDataURL(file)
      } else {
        setReelVideoUrl(URL.createObjectURL(file))
      }
    } catch {
      setErrorMsg('Could not process video file. Please try pasting a video URL or using 5s demo reel.')
    } finally {
      setIsUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
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
    const cleanLocation =
      location.trim() || formatSelectedCitiesLocation(selectedCities, allCities)
    const cleanPrice = startingPrice.trim()
    const cleanDesc = description.trim()

    if (!cleanTitle || !cleanPrice || !cleanDesc) {
      setErrorMsg('Please fill in Title, Starting Price, and Description.')
      return
    }
    if (selectedCities.length === 0) {
      setErrorMsg('Please select at least one service city where this package is available.')
      return
    }
    if (!cleanLocation) {
      setErrorMsg('Please enter a display location or select service cities.')
      return
    }

    const finalImages = images.length > 0 ? images : ['/dest-wedding-1.jpg']
    const inclusions = inclusionsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    let finalReels: PackageReel[] = []
    if (reelVideoUrl.trim()) {
      const primaryReel: PackageReel = {
        id: existingReels[0]?.id || `reel-${Date.now().toString(36)}`,
        title: reelTitle.trim() || `${cleanTitle} Highlight`,
        location: reelLocation.trim() || cleanLocation,
        videoUrl: reelVideoUrl.trim(),
        posterUrl: finalImages[0] || '/dest-wedding-1.jpg',
        aspectRatio: reelAspectRatio,
        size: existingReels[0]?.size || 'md',
      }
      finalReels = [primaryReel, ...existingReels.slice(1)]
    } else if (existingReels.length > 0) {
      finalReels = existingReels
    }

    const payload: Omit<WeddingPackage, 'id'> = {
      title: cleanTitle.slice(0, 120),
      tagline: tagline.trim().slice(0, 160) || `${backdrop} destination wedding experience`,
      backdrop,
      location: cleanLocation.slice(0, 120),
      cities: selectedCities,
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
      vendorId: initialPackage?.vendorId || (profile?.role === 'vendor' ? profile.id : undefined),
      reels: finalReels,
    }

    if (initialPackage) {
      updatePackage(initialPackage.id, payload)
    } else {
      addPackage(payload)
    }
    onClose()
  }

  return (
    <>
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
              {profile?.role === 'vendor' ? 'Wedding Planner Package Studio' : 'Admin Package Manager'}
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
                Display Location (Optional)
              </label>
              <input
                type="text"
                maxLength={120}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Auto-filled from selected cities"
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
                placeholder="e.g. Price on Demand"
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

          <MultiCitySelector
            theme="dark"
            selectedCities={selectedCities}
            onChange={setSelectedCities}
          />

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
                    <div className="absolute bottom-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setCroppingImageIndex(idx)}
                        title="Crop & adjust image"
                        className="p-1 rounded bg-black/75 text-white hover:text-[#f98093] transition-colors"
                      >
                        <CropIcon className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        aria-label="Remove image"
                        className="p-1 rounded bg-black/75 text-red-400 hover:bg-red-900/90 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instagram-Style Reel & Video Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#121B18] via-brand-dark to-black border border-emerald-800/60 space-y-4 shadow-inner">
            {/* Header with Aspect Ratio Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-md">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Package Video / Reel
                  </span>
                  <p className="text-[11px] text-emerald-300/70">
                    Upload a video reel to showcase your wedding experience in action
                  </p>
                </div>
              </div>

              {/* Aspect Ratio Switcher (9:16 vs 16:9) */}
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-emerald-700/40">
                <button
                  type="button"
                  onClick={() => setReelAspectRatio('9:16')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reelAspectRatio === '9:16'
                      ? 'bg-gradient-to-r from-[#DD2A7B] to-[#8134AF] text-white shadow-sm'
                      : 'text-emerald-200/80 hover:text-white hover:bg-white/5'
                  }`}
                  title="9:16 Vertical Reel (Instagram / TikTok format)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Reel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReelAspectRatio('16:9')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reelAspectRatio === '16:9'
                      ? 'bg-gradient-to-r from-[#DD2A7B] to-[#8134AF] text-white shadow-sm'
                      : 'text-emerald-200/80 hover:text-white hover:bg-white/5'
                  }`}
                  title="16:9 Cinematic Landscape format"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9 Wide</span>
                </button>
              </div>
            </div>

            {/* Hidden Video File Input */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              onChange={handleVideoFileUpload}
              className="hidden"
            />

            {/* Active Reel Preview or Empty State Dropzone */}
            {reelVideoUrl ? (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 rounded-xl bg-black/50 border border-emerald-800/50">
                {/* Reel Card Phone / Screen Preview */}
                <div
                  className={`relative shrink-0 rounded-xl overflow-hidden bg-black border border-white/20 shadow-xl group ${
                    reelAspectRatio === '9:16'
                      ? 'w-[140px] sm:w-[150px] aspect-[9/16]'
                      : 'w-full max-w-[240px] aspect-video'
                  }`}
                >
                  {reelVideoUrl === 'dummy-5s' ? (
                    <div className="relative w-full h-full flex flex-col justify-between p-2.5 bg-gradient-to-b from-black/40 via-transparent to-black/80">
                      <img
                        src={images[0] || '/dest-wedding-1.jpg'}
                        alt="Reel Cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-85"
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 border border-white/10">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" /> 5s Demo
                        </span>
                        <span className="text-[9px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-xs">
                          {reelAspectRatio}
                        </span>
                      </div>
                      <div className="relative z-10 space-y-0.5 bg-black/50 backdrop-blur-xs p-1.5 rounded-lg border border-white/10">
                        <p className="text-[10px] font-bold text-white drop-shadow-md truncate">
                          {reelTitle || `${title || 'Package'} Highlight`}
                        </p>
                        <p className="text-[8px] text-emerald-200 drop-shadow truncate">
                          @{partnerPlanner} • {reelLocation || location || 'Kerala'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={reelVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none p-2 flex flex-col justify-between">
                        <span className="self-end text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-full border border-white/20">
                          {reelAspectRatio}
                        </span>
                        <div className="space-y-0.5 bg-black/60 backdrop-blur-xs p-1.5 rounded-lg border border-white/10">
                          <p className="text-[10px] font-bold text-white drop-shadow truncate">
                            {reelTitle || `${title || 'Package'} Highlight`}
                          </p>
                          <p className="text-[8px] text-emerald-200 drop-shadow truncate">
                            @{partnerPlanner} • {reelLocation || location || 'Kerala'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reel Controls & Info */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        {reelVideoUrl === 'dummy-5s'
                          ? '5-Second Demo Reel Attached'
                          : 'Custom Video Reel Attached'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingVideo}
                        onClick={() => videoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-xs font-semibold text-emerald-100 border border-emerald-700/50 transition-colors"
                      >
                        {isUploadingVideo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Change Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReelVideoUrl('')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-xs font-semibold text-red-200 border border-red-800/40 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-200 mb-1">
                        Reel Caption / Overlay Title
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={reelTitle}
                        onChange={(e) => setReelTitle(e.target.value)}
                        placeholder={title ? `${title} Highlight` : 'e.g. Royal Sunset Mandap Reveal'}
                        className="w-full px-2.5 py-1.5 text-xs bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-200 mb-1">
                        Reel Location Tag
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={reelLocation}
                        onChange={(e) => setReelLocation(e.target.value)}
                        placeholder={location || 'e.g. Kumarakom, Kochi'}
                        className="w-full px-2.5 py-1.5 text-xs bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State: Instagram Reel Upload Dropzone */
              <div className="space-y-3">
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="group relative cursor-pointer flex flex-col items-center justify-center p-6 sm:p-7 rounded-xl border-2 border-dashed border-emerald-700/50 hover:border-[#DD2A7B] bg-black/40 hover:bg-black/60 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white mb-2.5 shadow-md group-hover:scale-110 transition-transform">
                    {isUploadingVideo ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F3A2BE] transition-colors">
                    {isUploadingVideo ? 'Uploading your video...' : 'Tap or Drag to Upload Reel Video'}
                  </p>
                  <p className="text-[11px] text-emerald-300/70 mt-0.5">
                    Supports MP4, MOV, WebM • Available in{' '}
                    <span className="font-semibold text-white">9:16 (Reel)</span> &amp;{' '}
                    <span className="font-semibold text-white">16:9 (Cinematic)</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReelVideoUrl('dummy-5s')
                      if (!reelTitle && title) setReelTitle(`${title} Highlight`)
                      if (!reelLocation && location) setReelLocation(location)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-xs font-semibold text-brand-secondary border border-brand-secondary/30 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Use Instant 5s Demo Reel</span>
                  </button>

                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <input
                      type="text"
                      value={reelVideoUrl}
                      onChange={(e) => setReelVideoUrl(e.target.value)}
                      placeholder="Or paste direct video URL (https://...)"
                      className="w-full px-2.5 py-1.5 text-xs bg-brand-dark border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                    />
                  </div>
                </div>
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

    {/* Image Crop Modal */}
    {croppingImageIndex !== null && images[croppingImageIndex] && (
      <ImageCropModal
        isOpen={true}
        imageUrl={images[croppingImageIndex]}
        onCrop={(croppedDataUrl) => {
          setImages((prev) => {
            const next = [...prev]
            next[croppingImageIndex] = croppedDataUrl
            return next
          })
          setCroppingImageIndex(null)
        }}
        onClose={() => setCroppingImageIndex(null)}
        title="Crop & Adjust Package Photo"
      />
    )}
  </>
  )
}
