import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  isSameDay,
  format,
  startOfDay,
  getDay,
  addMonths,
  subMonths,
  parse,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePricingSlots } from '../../hooks/usePricingSlots'
import { cn } from '../../lib/utils'
import type { PricingSlot } from '../../lib/types'

export interface AvailabilityCalendarProps {
  auditoriumId: string
  basePricePerDay: number
  selectedDate: Date | null
  onDateSelect: (date: Date, price: number) => void
}

function shortPrice(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`
  return `₹${n}`
}

export default function AvailabilityCalendar({
  auditoriumId,
  basePricePerDay,
  selectedDate,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const { data: slots = [] } = usePricingSlots(auditoriumId, monthStart, monthEnd)

  const slotMap = useMemo(() => {
    const map = new Map<string, PricingSlot>()
    for (const slot of slots) {
      if (!slot.date) continue
      const dateStr = slot.date.includes('T') ? slot.date.split('T')[0] : slot.date
      const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
      const key = format(parsedDate, 'yyyy-MM-dd')
      map.set(key, slot)
    }
    return map
  }, [slots])

  const getEffectivePrice = (date: Date): number => {
    const key = format(date, 'yyyy-MM-dd')
    const slot = slotMap.get(key)
    return slot?.custom_price ?? basePricePerDay
  }

  const days = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }, [monthStart, monthEnd])

  const leadingEmptyCells = getDay(monthStart)

  const today = startOfDay(new Date())
  const minMonth = startOfMonth(today)
  const maxMonth = addMonths(minMonth, 12)

  const canGoPrev = isBefore(minMonth, currentMonth)
  const canGoNext = isBefore(currentMonth, maxMonth)

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setCurrentMonth((prev) => subMonths(prev, 1))
    }
  }

  const handleNextMonth = () => {
    if (canGoNext) {
      setCurrentMonth((prev) => addMonths(prev, 1))
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className={cn(
              'p-1.5 rounded-lg border border-gray-200 transition-colors',
              canGoPrev
                ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
                : 'text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            aria-label="Next month"
            className={cn(
              'p-1.5 rounded-lg border border-gray-200 transition-colors',
              canGoNext
                ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
                : 'text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName) => (
          <div key={dayName} className="text-xs font-semibold text-gray-400 py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingEmptyCells }).map((_, idx) => (
          <div key={`empty-${idx}`} className="min-h-[52px]" aria-hidden="true" />
        ))}

        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const slot = slotMap.get(dayKey)
          const isPast = isBefore(day, today)
          const status = slot?.status ?? 'available'
          const isBooked = status === 'booked'
          const isBlocked = status === 'blocked'
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isAvailable = !isPast && !isBooked && !isBlocked
          const price = getEffectivePrice(day)

          return (
            <button
              key={dayKey}
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  onDateSelect(day, price)
                }
              }}
              className={cn(
                'relative flex flex-col items-center justify-center p-1 rounded-lg text-xs transition-all min-h-[52px] group',
                (isPast || isBooked || isBlocked) && 'opacity-40 cursor-not-allowed',
                isPast && !isBooked && !isBlocked && 'bg-gray-100 text-gray-400',
                isBooked && 'bg-red-50 text-red-400 line-through',
                isBlocked && 'bg-gray-200 text-gray-400',
                isAvailable && !isSelected && 'bg-green-50 hover:bg-brand-primary hover:text-white cursor-pointer',
                isSelected && 'bg-brand-primary text-white ring-2 ring-brand-secondary ring-offset-1 font-semibold cursor-pointer'
              )}
            >
              <span
                className={cn(
                  'font-medium text-xs',
                  isSelected && 'text-white font-bold',
                  isAvailable && !isSelected && 'text-gray-900 group-hover:text-white'
                )}
              >
                {format(day, 'd')}
              </span>

              {isAvailable && (
                <span
                  className={cn(
                    'text-[10px] leading-tight font-medium mt-0.5',
                    isSelected ? 'text-white/90' : 'text-emerald-700 group-hover:text-white'
                  )}
                >
                  {shortPrice(price)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-primary inline-block" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
