import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  X,
  MapPin,
  Users,
  IndianRupee,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { AuditoriumWithVendor } from '../../hooks/useVerificationQueue'

interface AuditoriumVerificationCardProps {
  auditorium: AuditoriumWithVendor
  onApprove: (payload: { id: string; vendorPhone?: string | null; title: string }) => Promise<void>
  onReject: (payload: {
    id: string
    vendorPhone?: string | null
    title: string
    reason: string
  }) => Promise<void>
}

export function AuditoriumVerificationCard({
  auditorium,
  onApprove,
  onReject,
}: AuditoriumVerificationCardProps) {
  const [isRejectingOpen, setIsRejectingOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    if (!window.confirm(`Approve "${auditorium.title}" and make it publicly discoverable?`)) {
      return
    }
    setIsProcessing(true)
    try {
      await onApprove({
        id: auditorium.id,
        vendorPhone: auditorium.profiles?.phone,
        title: auditorium.title,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectReason.trim()) return

    setIsProcessing(true)
    try {
      await onReject({
        id: auditorium.id,
        vendorPhone: auditorium.profiles?.phone,
        title: auditorium.title,
        reason: rejectReason,
      })
      setIsRejectingOpen(false)
      setRejectReason('')
    } finally {
      setIsProcessing(false)
    }
  }

  const photos = auditorium.photos || []

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        {/* Photo Strip */}
        <div className="grid grid-cols-3 gap-1 bg-gray-100 h-36">
          {photos.slice(0, 3).map((photo, i) => (
            <div key={photo + i} className="relative h-full overflow-hidden">
              <img
                src={photo}
                alt={`${auditorium.title} preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-3 flex items-center justify-center text-xs text-gray-400">
              No photos provided by vendor
            </div>
          )}
        </div>

        {/* Venue Information */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{auditorium.title}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                {auditorium.address || 'Address pending'}
                {auditorium.cities?.name ? `, ${auditorium.cities.name}` : ''}
              </p>
            </div>
            <Link
              to={`/auditorium/${auditorium.slug}`}
              target="_blank"
              className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg border border-gray-200 hover:border-brand-primary/40"
              title="Open detail preview"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Vendor Contact details */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-600">
            <p className="font-semibold text-gray-800">
              Vendor: {auditorium.profiles?.full_name || 'Vendor Partner'}
            </p>
            {auditorium.profiles?.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-green-600" />
                {auditorium.profiles.phone}
              </p>
            )}
            {auditorium.profiles?.email && (
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                {auditorium.profiles.email}
              </p>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
              <Users className="w-4 h-4 text-brand-primary" />
              <div>
                <p className="font-bold text-gray-800">
                  {auditorium.seating_capacity.toLocaleString()} seats
                </p>
                <p className="text-[10px] text-gray-400">Seating Capacity</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
              <IndianRupee className="w-4 h-4 text-brand-primary" />
              <div>
                <p className="font-bold text-gray-800">
                  {formatCurrency(auditorium.base_price_per_day)}
                </p>
                <p className="text-[10px] text-gray-400">Per Day Rate</p>
              </div>
            </div>
          </div>

          {/* Amenities tags */}
          {auditorium.amenities && auditorium.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {auditorium.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 bg-brand-accent/60 text-brand-primary rounded-md text-[10px] font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-4">
            <Calendar className="w-3 h-3" />
            Submitted on {formatDate(auditorium.created_at)}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0 border-t border-gray-100 mt-4">
        {isRejectingOpen ? (
          <form onSubmit={handleConfirmReject} className="space-y-3 pt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              Reason for Rejection / Changes Requested:
            </div>
            <textarea
              required
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Higher resolution photos needed, invalid contact number..."
              className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsRejectingOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsRejectingOpen(true)}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject / Revise
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Approve Venue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditoriumVerificationCard

