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
    <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Location</h3>
        {address && (
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
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
            <div className="overflow-hidden rounded-xl border border-gray-200">
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
        <div className="h-[300px] bg-gray-100 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-gray-200">
          <MapPin className="w-12 h-12 text-brand-primary mb-3" />
          <p className="text-gray-800 font-medium text-sm sm:text-base max-w-md mb-3">
            {address || 'Address not provided'}
          </p>
          {address && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white shadow-sm border border-gray-200 text-sm font-semibold text-brand-primary hover:bg-gray-50 transition-colors"
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
