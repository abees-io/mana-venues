import { format } from 'date-fns'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { formatCurrency, calculateAdvance } from '../../lib/utils'
import { useCreateBooking } from '../../hooks/useCreateBooking'

export interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  auditorium: { id: string; title: string; base_price_per_day: number }
  date: Date
  totalPrice: number
}

export default function BookingModal({
  isOpen,
  onClose,
  auditorium,
  date,
  totalPrice,
}: BookingModalProps) {
  const mutation = useCreateBooking()

  if (!isOpen) return null

  const advanceAmount = calculateAdvance(totalPrice, 0.3)
  const remainingBalance = totalPrice - advanceAmount

  const handlePay = () => {
    mutation.mutate({
      auditoriumId: auditorium.id,
      auditoriumTitle: auditorium.title,
      date,
      totalAmount: totalPrice,
      advanceAmount,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !mutation.isPending) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="celebration">
              🎊
            </span>
            <h2 className="text-xl font-bold text-brand-dark">Confirm Your Booking</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Details Section */}
        <div className="py-5 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Venue</span>
            <span className="font-medium text-gray-900 text-right">{auditorium.title}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900 text-right">
              {format(date, 'EEEE, d MMMM yyyy')}
            </span>
          </div>

          <hr className="border-gray-100 my-2" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-brand-primary">Advance to Pay (30%)</span>
            <span className="text-lg font-bold text-brand-primary">
              {formatCurrency(advanceAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Remaining Balance</span>
            <span className="text-sm text-gray-600 font-medium">
              {formatCurrency(remainingBalance)}
            </span>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            Remaining balance payable to vendor on event day
          </div>
        </div>

        {/* Error Display */}
        {mutation.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <div className="flex-1">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'An error occurred while processing booking. Please try again.'}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={mutation.isPending}
            className="bg-brand-primary text-white flex-1 font-semibold rounded-xl py-3 px-4 hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay Advance {formatCurrency(advanceAmount)} →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
