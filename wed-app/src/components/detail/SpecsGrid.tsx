import { Users, PartyPopper, IndianRupee, MapPin } from 'lucide-react'
import type { Auditorium } from '../../lib/types'
import { formatCurrency } from '../../lib/utils'

interface SpecsGridProps {
  auditorium: Auditorium
}

export default function SpecsGrid({ auditorium }: SpecsGridProps) {
  const specs = [
    {
      icon: Users,
      label: 'Seating',
      value: `${auditorium.seating_capacity.toLocaleString()} guests`,
    },
    {
      icon: PartyPopper,
      label: 'Floating',
      value: `${(auditorium.floating_capacity || 0).toLocaleString()} guests`,
    },
    {
      icon: IndianRupee,
      label: 'Starting From',
      value: `${formatCurrency(auditorium.base_price_per_day)} /day`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: auditorium.address || 'Address not provided',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {specs.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2 text-brand-primary">
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {item.label}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900 truncate" title={item.value}>
              {item.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
