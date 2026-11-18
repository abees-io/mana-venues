import type { LucideProps } from 'lucide-react'

export default function CoolCameraIcon({ className = 'w-5 h-5', ...props }: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Sleek DSLR/Mirrorless camera body */}
      <path d="M14.5 4h-5L7.2 6.8H4a2 2 0 0 0-2 2v9.4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.8a2 2 0 0 0-2-2h-3.2L14.5 4z" />
      {/* Precision Pro Lens Outer Barrel */}
      <circle cx="12" cy="13.2" r="4.2" />
      {/* Inner Optical Glass Element */}
      <circle cx="12" cy="13.2" r="1.8" />
      {/* Rangefinder / Sensor AF Beam Dot */}
      <circle cx="18.5" cy="8" r="0.8" fill="currentColor" />
    </svg>
  )
}
