import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, Phone, Users, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';

export interface AuditoriumRecord {
  id: string;
  name: string;
  slug: string;
  district: string;
  city: string | null;
  address: string | null;
  phone_number: string | null;
  starting_price: number;
  capacity: number;
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean;
  is_claimed: boolean;
  created_at: string;
  photos?: string[];
}

export const KERALA_DISTRICTS = [
  'All Kerala',
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
] as const;

// Curated high-resolution Kerala wedding auditorium & convention hall photography from Google Maps
export const CURATED_HALL_PHOTOS = [
  'https://lh3.googleusercontent.com/grass-cs/AABkmLcj_nOY8Dm-Un6PXO717C4ArfxK8ssVjVWx200pqughg6ccY8gMYKo9TKiUW4-sCIykVhdHC19Hq7_S3qZF0wkTI2ubQmsACduJtlS0hwR2Ug7cr2zYOrP8VUoiw82VJ5JLyqdNiVMG6lWS=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLe-LeeGMMs6pDovu8ow6Zt2Wcm6ewnZKUBSafsgO3FDL9qrTkNPi3Q_cKepZoMauto24WmgS3b3IY0C8FLuDNy5BscXlUgmd75l3fOQGRUmKGVk-q50_m2Jr_B1nKpTeNvwJ36Kxw=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLc5sRCEi0JjWf6DbzSGzNBsXO-o67NsJ7s7Wmm7-M9QFledZnbYi5KNWdNPmLVVAIs3A8Vub7XdgpKx0DQH0Bh01oPLAAdOtYAm95xTo3-isXvG2houJKiMECZWSLvqdfEYSe6CaA=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLceGqLski0fWMcgEbOHkoJ6JFOBx5TN1i4-J66QSS5t8Jv-JFOPEhfPPX_O-_nBtGgyYYSzGGg2Ry2A6coeUTlt23vApu0QSaPTpNjW5GRdvnyc6gFU-IQo4Lby3Pb0u6vdRyRQ=w1200-h800-k-no',
];

export function getVenueFallbackPhoto(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return CURATED_HALL_PHOTOS[Math.abs(hash) % CURATED_HALL_PHOTOS.length];
}

// 1. React Query Hook for District-Filtered Venue Fetching
export function useDistrictVenues(district?: string, searchFilter?: string) {
  return useQuery({
    queryKey: ['district-venues', district, searchFilter],
    queryFn: async (): Promise<AuditoriumRecord[]> => {
      let query = (supabase.from('auditoriums') as any)
        .select('*')
        .order('starting_price', { ascending: true });

      if (district && district !== 'All Kerala') {
        // Match by district column, or district within city / address to guarantee complete coverage
        query = query.or(`district.ilike.%${district}%,city.ilike.%${district}%,address.ilike.%${district}%`);
      }

      if (searchFilter && searchFilter.trim()) {
        const term = `%${searchFilter.trim()}%`;
        query = query.or(`name.ilike.${term},address.ilike.${term},city.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }

      return ((data || []) as unknown as AuditoriumRecord[]).map((v: any) => {
        let photosArray: string[] = [];
        if (Array.isArray(v.photos) && v.photos.length > 0) {
          photosArray = v.photos;
        } else if (typeof v.photos === 'string' && v.photos.startsWith('[')) {
          try {
            photosArray = JSON.parse(v.photos);
          } catch {
            photosArray = [];
          }
        } else if (typeof v.photos === 'string' && v.photos.startsWith('http')) {
          photosArray = [v.photos];
        } else if (v.image_url) {
          photosArray = [v.image_url];
        }

        return {
          ...v,
          name: v.name || v.title || 'Auditorium',
          slug: v.slug || (v.name || 'venue').toLowerCase().replace(/\s+/g, '-'),
          district: v.district || 'Kerala',
          starting_price: v.starting_price || v.base_price_per_day || 40000,
          capacity: v.capacity || v.seating_capacity || 500,
          is_verified: v.is_verified ?? v.verified ?? false,
          is_claimed: v.is_claimed ?? false,
          photos: photosArray,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// 2. High-Contrast Monochromatic Minimalist Venue Card with Photos
export const MinimalistVenueCard: React.FC<{ venue: AuditoriumRecord }> = ({ venue }) => {
  const initialPhoto =
    venue.photos && venue.photos.length > 0 && venue.photos[0]
      ? venue.photos[0]
      : getVenueFallbackPhoto(venue.slug || venue.name);

  const [photoSrc, setPhotoSrc] = useState<string>(initialPhoto);

  return (
    <div className="group bg-[#000] border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Photo Header with Aspect-Video Framing */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
          <img
            src={photoSrc}
            alt={venue.name}
            loading="lazy"
            onError={() => {
              if (photoSrc !== '/bg-main.jpg') {
                setPhotoSrc('/bg-main.jpg');
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85" />

          {/* District & Town Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold tracking-wide uppercase bg-black/85 backdrop-blur-md border border-neutral-700 text-white px-2.5 py-1 rounded-md shadow-sm">
              {venue.district}
            </span>
            {venue.city && venue.city.toLowerCase() !== venue.district.toLowerCase() && (
              <span className="text-[11px] font-medium bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md">
                {venue.city}
              </span>
            )}
          </div>

          {/* Verified Badge */}
          {venue.is_verified && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-mono uppercase bg-white text-black font-bold px-2 py-0.5 rounded shadow">
              <CheckCircle2 className="w-3 h-3 text-black" />
              Verified
            </span>
          )}

          {/* Capacity Tag */}
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-xs text-neutral-300 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-800 shadow-sm">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span>{Number(venue.capacity || 500).toLocaleString('en-IN')} guests</span>
          </div>
        </div>

        {/* Card Body & Location Details */}
        <div className="p-5 space-y-2.5">
          <Link
            to={`/auditorium/${venue.slug}`}
            className="block group-hover:text-neutral-200 transition"
          >
            <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
              {venue.name}
            </h3>
          </Link>

          <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {venue.address || `${venue.city || venue.district}, Kerala`}
          </p>
        </div>
      </div>

      {/* Card Footer: Starting Price & Contact / View Action */}
      <div className="p-5 pt-0">
        <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
          <div>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
              Starting from
            </span>
            <span className="text-lg font-bold text-white">
              ₹{Number(venue.starting_price || 40000).toLocaleString('en-IN')}
              <span className="text-xs text-neutral-500 font-normal"> / day</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/auditorium/${venue.slug}`}
              className="text-xs text-neutral-400 hover:text-white px-3 py-2 border border-neutral-800 hover:border-neutral-600 rounded-md transition flex items-center gap-1"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {venue.phone_number ? (
              <a
                href={`tel:${venue.phone_number}`}
                className="bg-white text-black px-3.5 py-2 text-xs font-semibold rounded-md hover:bg-neutral-200 transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact</span>
              </a>
            ) : (
              <span className="text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
                On Request
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Complete Directory Page / Section Component
export const DistrictVenuesDirectory: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Kerala');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const { data: venues, isLoading, isError, error, refetch } = useDistrictVenues(
    selectedDistrict,
    searchFilter
  );

  return (
    <section className="bg-neutral-950 text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Kerala Wedding Auditoriums
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Discover verified convention centers and auditoriums across all 14 districts of Kerala.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, landmark, town..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>
        </div>

        {/* 14 Districts Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {KERALA_DISTRICTS.map((district) => {
            const isSelected = selectedDistrict === district;
            return (
              <button
                key={district}
                type="button"
                onClick={() => {
                  setSelectedDistrict(district);
                  setSearchFilter('');
                }}
                className={`whitespace-nowrap px-4 py-2 text-xs font-medium rounded-full transition-all border ${isSelected
                  ? 'bg-white text-black border-white shadow-sm font-semibold'
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
              >
                {district}
              </button>
            );
          })}
        </div>

        {/* Status / Counts */}
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>
            {isLoading
              ? 'Scanning database...'
              : `Showing ${venues?.length || 0} venues in ${selectedDistrict}`}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 hover:text-neutral-300 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl overflow-hidden animate-pulse space-y-4"
              >
                <div className="aspect-video bg-neutral-800 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-neutral-800 rounded w-3/4" />
                  <div className="h-4 bg-neutral-800/60 rounded w-1/2" />
                  <div className="pt-4 border-t border-neutral-800 flex justify-between">
                    <div className="h-5 bg-neutral-800 rounded w-20" />
                    <div className="h-8 bg-neutral-800 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-950/40 border border-red-800/60 p-6 rounded-lg text-center text-red-300 space-y-2">
            <p className="font-semibold">Unable to fetch venues</p>
            <p className="text-xs text-red-400">{(error as Error)?.message || 'Database error'}</p>
          </div>
        )}

        {/* Venues Grid with Photos */}
        {!isLoading && !isError && venues && venues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <MinimalistVenueCard key={venue.id || venue.slug} venue={venue} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!venues || venues.length === 0) && (
          <div className="bg-[#000] border border-neutral-800/80 p-12 text-center rounded-lg space-y-3">
            <MapPin className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No venues found</h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              No wedding auditoriums are currently indexed for {selectedDistrict}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DistrictVenuesDirectory;
