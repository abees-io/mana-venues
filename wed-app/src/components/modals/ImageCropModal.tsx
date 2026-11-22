import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop as CropIcon, Move } from 'lucide-react'

export interface ImageCropModalProps {
  isOpen: boolean
  imageUrl: string
  aspectRatio?: number | 'free' // e.g. 16/9, 4/3, 1, or 'free'
  onCrop: (croppedDataUrl: string) => void
  onClose: () => void
  title?: string
}

type AspectRatioPreset = '16:9' | '4:3' | '1:1' | '9:16' | 'free'

const PRESET_RATIOS: Record<AspectRatioPreset, number | 'free'> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
  'free': 'free',
}

export default function ImageCropModal({
  isOpen,
  imageUrl,
  aspectRatio = 'free',
  onCrop,
  onClose,
  title = 'Adjust & Crop Image',
}: ImageCropModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<AspectRatioPreset>(() => {
    if (aspectRatio === 16 / 9) return '16:9'
    if (aspectRatio === 4 / 3) return '4:3'
    if (aspectRatio === 1) return '1:1'
    if (aspectRatio === 9 / 16) return '9:16'
    return 'free'
  })

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Reset adjustments on open or image change
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, imageUrl])

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 3.5))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.6))

  // Execute Canvas Crop
  const handleApplyCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return

    const img = imageRef.current
    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Determine target canvas dimensions
    const ratio = PRESET_RATIOS[selectedPreset]
    let targetWidth = 1200
    let targetHeight = ratio === 'free' ? 800 : Math.round(targetWidth / (ratio as number))

    if (ratio === 9 / 16) {
      targetWidth = 720
      targetHeight = 1280
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Translate to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)

    // Calculate scaling factor between preview viewport and output canvas
    const scaleFactor = targetWidth / rect.width

    // Calculate source dimensions and draw
    const displayedWidth = img.naturalWidth * (img.clientWidth / img.naturalWidth) * scale * scaleFactor
    const displayedHeight = img.naturalHeight * (img.clientHeight / img.naturalHeight) * scale * scaleFactor

    ctx.drawImage(
      img,
      -displayedWidth / 2 + position.x * scaleFactor,
      -displayedHeight / 2 + position.y * scaleFactor,
      displayedWidth,
      displayedHeight
    )

    try {
      const dataUrl = canvas.toDataURL('image/webp', 0.9)
      onCrop(dataUrl)
    } catch {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
      onCrop(dataUrl)
    }

    onClose()
  }, [selectedPreset, rotation, scale, position, onCrop, onClose])

  if (!isOpen) return null

  // Calculate box aspect ratio style
  const ratio = PRESET_RATIOS[selectedPreset]
  const containerAspect =
    ratio === 'free'
      ? 'aspect-[16/10]'
      : ratio === 16 / 9
      ? 'aspect-video'
      : ratio === 4 / 3
      ? 'aspect-[4/3]'
      : ratio === 1
      ? 'aspect-square'
      : 'aspect-[9/16]'

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-[#161219] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-xl bg-[#f98093]/20 text-[#f98093] flex items-center justify-center border border-[#f98093]/30">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">{title}</h3>
              <p className="text-[11px] text-white/60">Drag to reposition, use slider to zoom & rotate</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close cropper"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Preset Selector */}
        <div className="px-5 py-2.5 bg-black/40 border-b border-white/10 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider shrink-0">Ratio:</span>
          {(['16:9', '4:3', '1:1', '9:16', 'free'] as AspectRatioPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSelectedPreset(preset)}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedPreset === preset
                  ? 'bg-[#f98093] text-white shadow-xs'
                  : 'bg-white/10 text-white/75 hover:bg-white/15 hover:text-white'
              }`}
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Interactive Viewport Area */}
        <div className="relative flex-1 min-h-[260px] sm:min-h-[340px] max-h-[50vh] p-4 flex items-center justify-center bg-black/60 overflow-hidden select-none">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full max-w-lg ${containerAspect} rounded-2xl overflow-hidden border-2 border-[#f98093] shadow-[0_0_25px_rgba(249,128,147,0.3)] cursor-grab active:cursor-grabbing bg-black/90 flex items-center justify-center touch-none`}
          >
            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Draggable & Scalable Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop target"
              draggable={false}
              className="max-w-none transition-transform duration-75 origin-center pointer-events-none will-change-transform"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
              }}
            />

            {/* Drag helper hint */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] text-white/75 border border-white/15 pointer-events-none flex items-center gap-1 z-30">
              <Move className="w-3 h-3 text-[#f98093]" />
              <span>Pan / Drag</span>
            </div>
          </div>
        </div>

        {/* Adjustment Controls Toolbar */}
        <div className="p-4 sm:p-5 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Zoom & Rotate Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1 sm:w-36 flex items-center gap-2">
              <input
                type="range"
                min="0.6"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-[#f98093] cursor-pointer"
              />
              <span className="text-[11px] font-mono text-white/75 w-10 text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer border border-white/10"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#f98093]" />
              <span>{rotation}°</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#f98093] hover:bg-[#e86e81] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
