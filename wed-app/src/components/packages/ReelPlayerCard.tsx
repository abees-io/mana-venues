import { useEffect, useRef, useState } from 'react'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Pencil,
  Trash2,
  MapPin,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Move,
} from 'lucide-react'
import type {
  PackageReel,
  ReelAspectRatio,
  ReelSize,
  ReelTextPosition,
  ReelTextAlign,
} from '../../store/packagesStore'

interface ReelPlayerCardProps {
  reel: PackageReel
  isAdmin?: boolean
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onEdit?: (reel: PackageReel) => void
  onDelete?: (reelId: string) => void
  onUpdateSettings?: (
    reelId: string,
    updates: Partial<
      Pick<PackageReel, 'aspectRatio' | 'size' | 'textPosition' | 'textAlign' | 'textPos'>
    >
  ) => void
}

const SIZE_OPTIONS: { value: ReelSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'full', label: 'Full' },
]

function getContainerSizeClasses(aspectRatio: ReelAspectRatio, size: ReelSize): string {
  if (aspectRatio === '16:9') {
    switch (size) {
      case 'sm':
        return 'w-full max-w-[240px] sm:max-w-[260px] aspect-video'
      case 'md':
        return 'w-full max-w-[320px] sm:max-w-[360px] aspect-video'
      case 'lg':
        return 'w-full max-w-[440px] sm:max-w-[480px] aspect-video'
      case 'full':
        return 'w-full aspect-video'
    }
  }
  // 9:16 vertical reel
  switch (size) {
    case 'sm':
      return 'w-full max-w-[175px] sm:max-w-[190px] aspect-[9/16]'
    case 'md':
      return 'w-full max-w-[230px] sm:max-w-[255px] aspect-[9/16]'
    case 'lg':
      return 'w-full max-w-[290px] sm:max-w-[320px] aspect-[9/16]'
    case 'full':
      return 'w-full max-w-sm aspect-[9/16]'
  }
}

export default function ReelPlayerCard({
  reel,
  isAdmin = false,
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
  onUpdateSettings,
}: ReelPlayerCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const aspectRatio: ReelAspectRatio = reel.aspectRatio || '9:16'
  const size: ReelSize = reel.size || 'md'
  const textPosition: ReelTextPosition = reel.textPosition || 'bottom'
  const textAlign: ReelTextAlign = reel.textAlign || 'left'
  const isDummyMode = !reel.videoUrl || reel.videoUrl === 'dummy-5s'

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [hasVideoError, setHasVideoError] = useState(false)
  const [dummyProgress, setDummyProgress] = useState(0) // 0 to 100 over 5s
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const isDraggingTextRef = useRef(false)

  const activeTextPos = dragPos || reel.textPos

  const handleTextPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdmin || !containerRef.current || !onUpdateSettings) return
    e.stopPropagation()
    e.preventDefault()
    isDraggingTextRef.current = true

    const rect = containerRef.current.getBoundingClientRect()
    const updateFromClient = (clientX: number, clientY: number) => {
      const x = Math.min(92, Math.max(8, ((clientX - rect.left) / rect.width) * 100))
      const y = Math.min(88, Math.max(14, ((clientY - rect.top) / rect.height) * 100))
      const next = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
      setDragPos(next)
      return next
    }

    let latest = updateFromClient(e.clientX, e.clientY)

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingTextRef.current) return
      latest = updateFromClient(moveEvent.clientX, moveEvent.clientY)
    }

    const onPointerUp = () => {
      isDraggingTextRef.current = false
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      onUpdateSettings(reel.id, { textPos: latest })
      setDragPos(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const useDummyPlayer = isDummyMode || hasVideoError

  // Autoplay when scrolled into view, pause when out of view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (useDummyPlayer) {
              setIsPlaying(true)
            } else if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false))
            }
          } else {
            if (useDummyPlayer) {
              setIsPlaying(false)
            } else if (videoRef.current) {
              videoRef.current.pause()
              setIsPlaying(false)
            }
          }
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [useDummyPlayer, reel.videoUrl])

  // 5-second dummy video loop timer
  useEffect(() => {
    if (!useDummyPlayer || !isPlaying) return
    const interval = setInterval(() => {
      setDummyProgress((prev) => (prev >= 100 ? 0 : prev + 2)) // 50 steps * 100ms = 5.0 seconds
    }, 100)
    return () => clearInterval(interval)
  }, [useDummyPlayer, isPlaying])

  const handleTogglePlay = () => {
    if (useDummyPlayer) {
      setIsPlaying((prev) => !prev)
      return
    }
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    } else {
      setIsMuted((prev) => !prev)
    }
  }

  const sizeClass = getContainerSizeClasses(aspectRatio, size)
  const currentSec = Math.min(5, Math.floor((dummyProgress / 100) * 5))

  return (
    <div className="flex flex-col gap-2 w-full items-center md:items-start">
      <div
        ref={containerRef}
        onClick={handleTogglePlay}
        className={`group relative ${sizeClass} rounded-2xl overflow-hidden bg-brand-dark border border-[#D8F0EC] shadow-xl cursor-pointer select-none transform-gpu transition-all duration-300`}
      >
        {!useDummyPlayer ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.posterUrl || '/dest-wedding-1.jpg'}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onError={() => setHasVideoError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={reel.posterUrl || '/dest-wedding-1.jpg'}
              alt={reel.title}
              style={{
                transform: isPlaying
                  ? `scale(${1 + (dummyProgress / 100) * 0.14})`
                  : 'scale(1)',
                transition: 'transform 100ms linear',
              }}
              className="w-full h-full object-cover"
            />
            {/* 5s Dummy Reel Badge — Admin only */}
            {isAdmin && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90 pointer-events-none">
                0:0{currentSec} / 0:05
              </div>
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 pointer-events-none" />

        {/* Top Controls: Mute & Admin Edit/Delete */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
            className="p-1.5 rounded-full bg-black/55 backdrop-blur-md text-white hover:bg-black/80 border border-white/15 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onEdit?.(reel)}
                aria-label={`Edit ${reel.title}`}
                className="p-1.5 rounded-full bg-black/65 backdrop-blur-md text-brand-secondary hover:bg-black/90 border border-brand-secondary/40 transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(reel.id)}
                aria-label={`Delete ${reel.title}`}
                className="p-1.5 rounded-full bg-black/65 backdrop-blur-md text-red-400 hover:bg-red-950/90 border border-red-500/40 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Center Play Indicator when Paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-black/55 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Hover Pause Indicator */}
        {isPlaying && (
          <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
              <Pause className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Movable Text Group — Cursor-draggable when Admin */}
        <div
          onPointerDown={handleTextPointerDown}
          onClick={(e) => {
            if (isAdmin) e.stopPropagation()
          }}
          style={
            activeTextPos
              ? {
                  left: `${activeTextPos.x}%`,
                  top: `${activeTextPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }
              : undefined
          }
          title={isAdmin ? 'Drag with cursor to move text anywhere' : undefined}
          className={`absolute p-2.5 rounded-lg transition-shadow ${
            activeTextPos
              ? 'w-[86%]'
              : `left-0 right-0 ${
                  textPosition === 'top'
                    ? 'top-10'
                    : textPosition === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-2'
                }`
          } ${
            textAlign === 'center'
              ? 'text-center'
              : textAlign === 'right'
                ? 'text-right'
                : 'text-left'
          } ${
            isAdmin
              ? 'pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-black/35 hover:outline hover:outline-1 hover:outline-dashed hover:outline-brand-secondary/80 z-20'
              : 'pointer-events-none'
          }`}
        >
          {isAdmin && (
            <span className="inline-flex items-center gap-1 text-[9px] text-brand-secondary/90 font-semibold mb-0.5 opacity-80">
              <Move className="w-2.5 h-2.5" />
              Drag text
            </span>
          )}
          <div
            className={`flex items-center gap-1 text-[10px] font-medium text-[#F0F9F8] mb-0.5 ${
              textAlign === 'center'
                ? 'justify-center'
                : textAlign === 'right'
                  ? 'justify-end'
                  : 'justify-start'
            }`}
          >
            <MapPin className="w-3 h-3 text-white/80 shrink-0" />
            <span className="truncate">{reel.location}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
            {reel.title}
          </h4>
        </div>

        {/* Bottom 5s Progress Bar — Admin only */}
        {isAdmin && useDummyPlayer && (
          <div className="absolute bottom-2 left-3 right-3 h-1 rounded-full bg-white/25 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-brand-secondary transition-all duration-100"
              style={{ width: `${dummyProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Inline Admin Controls: Order, Ratio, Size, and Move Text Group */}
      {isAdmin && onUpdateSettings && (
        <div
          className="flex flex-col gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-[#D8F0EC] text-[10px] max-w-full text-[#5A172D] shadow-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reorder Video Row */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#D8F0EC]">
            <span className="inline-flex items-center gap-1 text-[#5A172D] font-semibold cursor-grab">
              <GripVertical className="w-3 h-3 text-[#C83B68]" />
              <span>Drag Video</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canMoveLeft}
                onClick={onMoveLeft}
                aria-label="Move video left"
                className="p-1 rounded bg-[#F0F9F8] text-[#5A172D] hover:text-[#C83B68] disabled:opacity-30"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={!canMoveRight}
                onClick={onMoveRight}
                aria-label="Move video right"
                className="p-1 rounded bg-[#F0F9F8] text-[#5A172D] hover:text-[#C83B68] disabled:opacity-30"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#7E1F3E]/80 font-semibold mr-0.5">Ratio:</span>
            {(['9:16', '16:9'] as ReelAspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => onUpdateSettings(reel.id, { aspectRatio: ratio })}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-[#C83B68] text-white'
                    : 'bg-[#F0F9F8] text-[#5A172D] hover:bg-white border border-[#D8F0EC]'
                }`}
              >
                {ratio}
              </button>
            ))}

            <span className="text-[#D8F0EC] mx-0.5">|</span>
            <span className="text-[#7E1F3E]/80 font-semibold mr-0.5">Size:</span>
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateSettings(reel.id, { size: opt.value })}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  size === opt.value
                    ? 'bg-[#C83B68] text-white'
                    : 'bg-[#F0F9F8] text-[#5A172D] hover:bg-white border border-[#D8F0EC]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#7E1F3E]/80 font-semibold mr-0.5">Text:</span>
            {(['top', 'center', 'bottom'] as ReelTextPosition[]).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() =>
                  onUpdateSettings(reel.id, { textPosition: pos, textPos: undefined })
                }
                className={`px-1.5 py-0.5 rounded font-bold capitalize transition-colors ${
                  !activeTextPos && textPosition === pos
                    ? 'bg-[#C83B68] text-white'
                    : 'bg-[#F0F9F8] text-[#5A172D] hover:bg-white border border-[#D8F0EC]'
                }`}
              >
                {pos}
              </button>
            ))}

            <span className="text-[#D8F0EC] mx-0.5">|</span>
            {(['left', 'center', 'right'] as ReelTextAlign[]).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onUpdateSettings(reel.id, { textAlign: align })}
                className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                  textAlign === align
                    ? 'bg-[#C83B68] text-white'
                    : 'bg-[#F0F9F8] text-[#5A172D] hover:bg-white border border-[#D8F0EC]'
                }`}
              >
                {align[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
