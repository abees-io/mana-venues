// Skeleton card — matches sharp flat card geometry
export function AuditoriumCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-100 animate-pulse">
      {/* 16:9 image skeleton */}
      <div className="aspect-video w-full bg-neutral-100" />

      {/* Body skeleton */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Title */}
        <div className="h-4 bg-neutral-100 w-3/4" />

        {/* Location */}
        <div className="h-3 bg-neutral-100 w-1/2" />

        {/* Amenity tags */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="h-5 bg-neutral-100 w-16" />
          <div className="h-5 bg-neutral-100 w-20" />
          <div className="h-5 bg-neutral-100 w-14" />
        </div>

        {/* Price row */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="h-4 bg-neutral-100 w-28" />
          <div className="h-3 bg-neutral-100 w-8" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <AuditoriumCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default AuditoriumCardSkeleton
