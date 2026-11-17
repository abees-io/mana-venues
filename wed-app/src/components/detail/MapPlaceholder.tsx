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
    <div className="bg-[#F0F9F8] backdrop-blur-md rounded-xl p-5 border border-[#D8F0EC] shadow-md space-y-3 text-black">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">Location</h3>
        {address && (
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#C83B68] hover:text-black transition-colors"
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
            <div className="overflow-hidden rounded-xl border border-[#D8F0EC]">
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
        <div className="h-[300px] bg-white rounded-xl flex flex-col items-center justify-center p-6 text-center border border-[#D8F0EC]">
          <MapPin className="w-12 h-12 text-[#C83B68] mb-3" />
          <p className="text-black font-medium text-sm sm:text-base max-w-md mb-3">
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
