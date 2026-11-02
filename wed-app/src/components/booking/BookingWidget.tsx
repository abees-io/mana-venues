import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import AvailabilityCalendar from './AvailabilityCalendar'
import BookingModal from './BookingModal'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, calculateAdvance, cn } from '../../lib/utils'
import type { Auditorium } from '../../lib/types'

export interface BookingWidgetProps {
  auditorium: Auditorium
}

export default function BookingWidget({ auditorium }: BookingWidgetProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number>(auditorium.base_price_per_day)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const advanceAmount = calculateAdvance(selectedPrice, 0.3)

  const handleBookClick = () => {
    if (!selectedDate) return
    if (!user) {
      navigate('/auth/login', { state: { returnUrl: location.pathname } })
      return
    }
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Book This Venue</h2>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xs uppercase text-gray-500 font-semibold">From</span>
            <span className="text-2xl sm:text-3xl font-black text-brand-primary">
              {formatCurrency(auditorium.base_price_per_day)}
            </span>
            <span className="text-sm font-medium text-gray-500">/ day</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">30% advance on booking</p>
        </div>

        {/* Availability Calendar */}
        <AvailabilityCalendar
          auditoriumId={auditorium.id}
          basePricePerDay={auditorium.base_price_per_day}
          selectedDate={selectedDate}
          onDateSelect={(date, price) => {
            setSelectedDate(date)
            setSelectedPrice(price)
          }}
        />

        {/* Selected Date Summary */}
        {selectedDate && (
          <div className="bg-brand-accent/50 border border-brand-primary/20 rounded-xl p-3.5 space-y-1.5 text-sm">
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-xs font-semibold text-gray-500 uppercase">Selected</span>
              <span className="font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, d MMM yyyy')}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
              <span className="font-bold text-brand-primary">
                {formatCurrency(selectedPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-700 border-t border-brand-primary/10 pt-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase">Advance (30%)</span>
              <span className="font-bold text-brand-dark">
                {formatCurrency(advanceAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            disabled={!selectedDate}
            onClick={handleBookClick}
            className={cn(
              'w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all',
              selectedDate
                ? 'bg-brand-primary hover:bg-brand-primary/95 hover:shadow-lg active:scale-[0.98] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed shadow-none'
            )}
          >
            Book This Date
          </button>
        </div>
      </div>

      {isModalOpen && selectedDate && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          auditorium={{
            id: auditorium.id,
            title: auditorium.title,
            base_price_per_day: auditorium.base_price_per_day,
          }}
          date={selectedDate}
          totalPrice={selectedPrice}
        />
      )}
    </>
  )
}
