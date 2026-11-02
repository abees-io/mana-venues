import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface VendorStatsCardProps {
  icon: ReactNode
  label: string
  value: string | number
  color: string
  trend?: string
}

export function VendorStatsCard({ icon, label, value, color, trend }: VendorStatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={cn('rounded-full p-3 shrink-0 flex items-center justify-center', color)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-3xl font-bold text-brand-dark tracking-tight">{value}</div>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
          <span>{label}</span>
          {trend && <span className="text-xs font-semibold text-emerald-600">{trend}</span>}
        </div>
      </div>
    </div>
  )
}

export default VendorStatsCard
