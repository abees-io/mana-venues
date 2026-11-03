import { MapPin, ExternalLink } from 'lucide-react'

interface MapPlaceholderProps {
  address: string
  latitude?: number | null
  longitude?: number | null
}

export default function MapPlaceholder({ address, latitude, longitude }: MapPlaceholderProps) {
  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude)

  return (
    <div className="bg-brand-dark/85 backdrop-blur-md rounded-xl p-5 border border-green-800/40 shadow-xl space-y-3 text-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Location</h3>
        {address && (
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-secondary hover:text-white transition-colors"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {hasCoordinates ? (
        (() => {
          const delta = 0.01
          const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`
          const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`

          return (
            <div className="overflow-hidden rounded-xl border border-green-800/40">
              <iframe
                src={src}
                className="w-full h-[300px] rounded-xl border-0"
                title="Location map"
                loading="lazy"
              />
            </div>
          )
        })()
      ) : (
        <div className="h-[300px] bg-green-950/60 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-green-800/40">
          <MapPin className="w-12 h-12 text-brand-secondary mb-3" />
          <p className="text-green-100 font-medium text-sm sm:text-base max-w-md mb-3">
            {address || 'Address not provided'}
          </p>
          {address && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-secondary text-brand-dark shadow-sm text-sm font-bold hover:bg-brand-secondary/90 transition-colors"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
