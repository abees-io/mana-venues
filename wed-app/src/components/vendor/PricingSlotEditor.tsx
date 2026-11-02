import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Check, X, Loader2, IndianRupee } from 'lucide-react'
import { usePricingSlots } from '../../hooks/usePricingSlots'
import { useManagePricingSlots } from '../../hooks/useManagePricingSlots'
import { formatCurrency, cn } from '../../lib/utils'
import type { PricingSlot, PricingSlotStatus } from '../../lib/types'

interface PricingSlotEditorProps {
  auditoriumId: string
  basePricePerDay: number
}

export function PricingSlotEditor({ auditoriumId, basePricePerDay }: PricingSlotEditorProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()))
  const [selectedSlotDate, setSelectedSlotDate] = useState<string | null>(null)
  const [customPriceInput, setCustomPriceInput] = useState<string>('')
  const [statusInput, setStatusInput] = useState<PricingSlotStatus>('available')
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const { data: slots = [], isLoading } = usePricingSlots(auditoriumId, monthStart, monthEnd)
  const { upsertSlot, deleteSlot } = useManagePricingSlots(auditoriumId)

  const slotMap = new Map<string, PricingSlot>()
  slots.forEach((slot) => {
    slotMap.set(slot.date, slot)
  })

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOffset = getDay(monthStart)
  const today = startOfDay(new Date())

  const handleSelectDay = (dayStr: string, existingSlot?: PricingSlot) => {
    setSelectedSlotDate(dayStr)
    setActionError(null)
    if (existingSlot) {
      setCustomPriceInput(existingSlot.custom_price ? String(existingSlot.custom_price) : '')
      setStatusInput(existingSlot.status)
    } else {
      setCustomPriceInput('')
      setStatusInput('available')
    }
  }

  const handleSaveSlot = async () => {
    if (!selectedSlotDate) return
    setIsSaving(true)
    setActionError(null)

    try {
      const priceNum = customPriceInput ? parseFloat(customPriceInput) : null
      await upsertSlot({
        date: selectedSlotDate,
        customPrice: priceNum,
        status: statusInput,
      })
      setSelectedSlotDate(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update slot'
      setActionError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSlot = async () => {
    if (!selectedSlotDate) return
    setIsSaving(true)
    setActionError(null)

    try {
      await deleteSlot(selectedSlotDate)
      setSelectedSlotDate(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset slot'
      setActionError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Date Pricing & Availability</h3>
          <p className="text-sm text-gray-500">
            Set custom peak rates (weekends, auspicious muhurthams) or override standard rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-brand-primary" />
            <p className="text-sm">Loading calendar rates...</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[70px] bg-gray-50/50 rounded-xl" />
              ))}

              {days.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const slot = slotMap.get(dayStr)
                const isPast = isBefore(day, today)
                const isSelected = selectedSlotDate === dayStr
                const hasCustomPrice = slot?.custom_price != null
                const effectivePrice = slot?.custom_price ?? basePricePerDay
                const isBooked = slot?.status === 'booked'
                const isBlocked = slot?.status === 'blocked'

                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => handleSelectDay(dayStr, slot)}
                    className={cn(
                      'relative min-h-[74px] p-2 rounded-xl text-left border transition-all flex flex-col justify-between',
                      isSelected
                        ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-brand-accent/40 shadow-sm'
                        : isBooked
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : isBlocked
                        ? 'bg-gray-100 border-gray-200 text-gray-400'
                        : hasCustomPrice
                        ? 'bg-amber-50/60 border-amber-300 text-gray-900 hover:border-amber-400'
                        : 'bg-white border-gray-100 hover:border-gray-300 text-gray-800'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn('text-xs font-semibold', isPast && 'text-gray-400')}>
                        {format(day, 'd')}
                      </span>
                      {hasCustomPrice && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>

                    <div className="mt-1">
                      {isBooked ? (
                        <span className="text-[10px] font-semibold text-red-600 block uppercase">
                          Booked
                        </span>
                      ) : isBlocked ? (
                        <span className="text-[10px] font-medium text-gray-500 block uppercase">
                          Blocked
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-700 block truncate">
                          {formatCurrency(effectivePrice)}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal/Panel when a day is selected */}
      {selectedSlotDate && (
        <div className="p-6 bg-white border border-brand-primary/20 rounded-2xl shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              Configure Rate for {format(new Date(selectedSlotDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedSlotDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {actionError && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{actionError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Custom Daily Rate (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="5000"
                  placeholder={`Base rate: ${basePricePerDay}`}
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Leave empty to retain base rate ({formatCurrency(basePricePerDay)})
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value as PricingSlotStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
              >
                <option value="available">Available for Booking</option>
                <option value="blocked">Blocked (Offline/Maintenance)</option>
                <option value="booked">Mark as Booked</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetSlot}
              disabled={isSaving}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              Reset to Base Rate
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedSlotDate(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlot}
                disabled={isSaving}
                className="px-5 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingSlotEditor

