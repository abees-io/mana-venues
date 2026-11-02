import { useState } from 'react'
import { Calendar, AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { useManagePricingSlots } from '../../hooks/useManagePricingSlots'

interface DateBlockerProps {
  auditoriumId: string
}

export function DateBlocker({ auditoriumId }: DateBlockerProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { blockDateRange, isPending } = useManagePricingSlots(auditoriumId)

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSuccess(false)

    if (!startDate || !endDate) {
      setErrorMsg('Please select both a start date and an end date.')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date must be on or before end date.')
      return
    }

    try {
      await blockDateRange({ startDate, endDate })
      setIsSuccess(true)
      setStartDate('')
      setEndDate('')
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to block dates.'
      setErrorMsg(msg)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-primary" />
          Batch Date Blocking
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Lock out specific periods for offline bookings, annual maintenance, or renovations. Blocked dates will immediately appear disabled to public customers.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Selected date range has been successfully blocked!</span>
        </div>
      )}

      <form onSubmit={handleBlockDates} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Blocking Dates...
            </>
          ) : (
            'Block These Dates'
          )}
        </button>
      </form>
    </div>
  )
}

export default DateBlocker

