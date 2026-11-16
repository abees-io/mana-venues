import { useState, useEffect, useRef } from 'react'
import { X, Upload, Film, Loader2, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { uploadOrConvertPhoto } from '../../lib/imageUtils'
import {
  usePackagesStore,
  type PackageReel,
  type ReelAspectRatio,
  type ReelSize,
} from '../../store/packagesStore'

interface ReelFormModalProps {
  isOpen: boolean
  onClose: () => void
  packageId?: string | null
  initialReel?: PackageReel | null
}

const SIZE_OPTIONS: { value: ReelSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'full', label: 'Full' },
]

export default function ReelFormModal({
  isOpen,
  onClose,
  packageId,
  initialReel,
}: ReelFormModalProps) {
  const packages = usePackagesStore((s) => s.packages)
  const addPackageReel = usePackagesStore((s) => s.addPackageReel)
  const updatePackageReel = usePackagesStore((s) => s.updatePackageReel)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const posterInputRef = useRef<HTMLInputElement>(null)

  const [selectedPkgId, setSelectedPkgId] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [videoUrl, setVideoUrl] = useState('dummy-5s')
  const [posterUrl, setPosterUrl] = useState('/dest-wedding-1.jpg')
  const [aspectRatio, setAspectRatio] = useState<ReelAspectRatio>('9:16')
  const [size, setSize] = useState<ReelSize>('md')
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const targetPkgId = packageId || packages[0]?.id || ''
    setSelectedPkgId(targetPkgId)

    if (initialReel) {
      setTitle(initialReel.title)
      setLocation(initialReel.location)
      setVideoUrl(initialReel.videoUrl || 'dummy-5s')
      setPosterUrl(initialReel.posterUrl || '/dest-wedding-1.jpg')
      setAspectRatio(initialReel.aspectRatio || '9:16')
      setSize(initialReel.size || 'md')
    } else {
      const targetPkg = packages.find((p) => p.id === targetPkgId)
      setTitle('')
      setLocation(targetPkg?.location || 'Kerala')
      setVideoUrl('dummy-5s')
      setPosterUrl(targetPkg?.image || '/dest-wedding-1.jpg')
      setAspectRatio('9:16')
      setSize('md')
    }
    setErrorMsg(null)
  }, [isOpen, initialReel, packageId, packages])

  if (!isOpen) return null

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
          setVideoUrl(urlData.publicUrl)
          return
        }
      }

      if (file.size <= 4 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setVideoUrl(reader.result)
          }
        }
        reader.readAsDataURL(file)
      } else {
        setVideoUrl(URL.createObjectURL(file))
      }
    } catch {
      setErrorMsg('Could not process video file. Please try pasting a video URL.')
    } finally {
      setIsUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPoster(true)
    try {
      const url = await uploadOrConvertPhoto(file, 'reels-posters')
      setPosterUrl(url)
    } catch {
      setErrorMsg('Failed to process poster image.')
    } finally {
      setIsUploadingPoster(false)
      if (posterInputRef.current) posterInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanTitle = title.trim()
    const cleanVideo = videoUrl.trim() || 'dummy-5s'
    if (!cleanTitle || !selectedPkgId) {
      setErrorMsg('Please select a Package and enter a Reel Title.')
      return
    }

    const payload: Omit<PackageReel, 'id'> = {
      title: cleanTitle.slice(0, 100),
      location: location.trim().slice(0, 100) || 'Kerala',
      videoUrl: cleanVideo,
      posterUrl: posterUrl.trim() || '/dest-wedding-1.jpg',
      aspectRatio,
      size,
    }

    if (initialReel) {
      updatePackageReel(selectedPkgId, initialReel.id, payload)
    } else {
      addPackageReel(selectedPkgId, payload)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reel-form-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-brand-dark border border-brand-secondary/50 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60 mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-secondary" />
            <h2 id="reel-form-title" className="text-lg font-bold">
              {initialReel ? 'Edit Package Reel' : 'Add Package Reel'}
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
          {!packageId && (
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Target Package *
              </label>
              <select
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-emerald-950/90 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Reel Title *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backwater Baraat Highlight"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Location
              </label>
              <input
                type="text"
                maxLength={100}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Alleppey, Kerala"
                className="w-full px-3 py-2 text-sm bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
              />
            </div>
          </div>

          {/* Aspect Ratio (9:16 vs 16:9) & Display Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <div>
              <label className="block text-xs font-semibold text-brand-secondary mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {(['9:16', '16:9'] as ReelAspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-brand-secondary text-brand-dark border-brand-secondary'
                        : 'bg-brand-dark text-emerald-200 border-emerald-700/50 hover:bg-emerald-900'
                    }`}
                  >
                    {ratio} {ratio === '9:16' ? '(Reel)' : '(Wide)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-secondary mb-2">
                Display Size
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSize(opt.value)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                      size === opt.value
                        ? 'bg-brand-secondary text-brand-dark border-brand-secondary'
                        : 'bg-brand-dark text-emerald-200 border-emerald-700/50 hover:bg-emerald-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-brand-secondary">
                Reel Video (MP4 / WebM or 5s Dummy)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVideoUrl('dummy-5s')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-xs font-semibold text-brand-secondary border border-brand-secondary/30"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>5s Dummy</span>
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingVideo}
                  onClick={() => videoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-800/70 hover:bg-emerald-700 text-xs font-semibold text-white border border-emerald-600/50"
                >
                  {isUploadingVideo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploadingVideo ? 'Uploading...' : 'Upload'}</span>
                </button>
              </div>
            </div>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="dummy-5s or paste MP4 URL (https://...)"
              className="w-full px-3 py-2 text-xs bg-brand-dark border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-emerald-200">
                Cover Poster Image
              </label>
              <div>
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingPoster}
                  onClick={() => posterInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-xs font-semibold text-emerald-100 border border-emerald-700/50"
                >
                  {isUploadingPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload Poster</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="/dest-wedding-1.jpg or https://..."
              className="w-full px-3 py-2 text-xs bg-brand-dark border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-brand-secondary"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploadingVideo || isUploadingPoster}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FFF04B] via-[#FFC700] to-[#FFA000] hover:from-[#FFF566] hover:to-[#FFB000] text-brand-dark font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {initialReel ? 'Save Reel' : 'Add Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
