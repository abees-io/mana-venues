export function AuditoriumCardSkeleton() {
  return (
    <div className="bg-brand-dark/85 backdrop-blur-md rounded-xl overflow-hidden border border-green-800/40 shadow-xl animate-pulse">
      {/* 16:9 Thumbnail skeleton */}
      <div className="aspect-video w-full bg-green-950/60" />

      {/* Card body skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-green-900/40 rounded w-3/4" />

        {/* Location skeleton */}
        <div className="h-3.5 bg-green-900/40 rounded w-1/2" />

        {/* Amenity chips skeleton */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-4 bg-green-900/30 rounded w-16" />
          <div className="h-4 bg-green-900/30 rounded w-20" />
          <div className="h-4 bg-green-900/30 rounded w-14" />
        </div>

        {/* Price skeleton */}
        <div className="pt-2 border-t border-green-900/40 flex items-center justify-between">
          <div className="h-5 bg-green-900/40 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

interface AuditoriumCardSkeletonListProps {
  count?: number
}

export function AuditoriumCardSkeletonList({ count = 6 }: AuditoriumCardSkeletonListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <AuditoriumCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default AuditoriumCardSkeleton
