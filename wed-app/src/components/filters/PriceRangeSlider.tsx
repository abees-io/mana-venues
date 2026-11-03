import { useEffect, useState } from 'react'
import { useFilterStore } from '../../store/filterStore'
import { formatCurrency } from '../../lib/utils'

export default function PriceRangeSlider() {
  const priceMin = useFilterStore((state) => state.priceMin)
  const priceMax = useFilterStore((state) => state.priceMax)
  const setPriceRange = useFilterStore((state) => state.setPriceRange)

  const [localMin, setLocalMin] = useState(priceMin)
  const [localMax, setLocalMax] = useState(priceMax)

  // Sync local state when external store changes (e.g. on filter reset)
  useEffect(() => {
    setLocalMin(priceMin)
    setLocalMax(priceMax)
  }, [priceMin, priceMax])

  // Debounce 300ms before updating store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localMin !== priceMin || localMax !== priceMax) {
        setPriceRange(localMin, localMax)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [localMin, localMax, priceMin, priceMax, setPriceRange])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    const clampedMin = Math.min(val, localMax)
    setLocalMin(clampedMin)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    const clampedMax = Math.max(val, localMin)
    setLocalMax(clampedMax)
  }

  return (
    <div className="space-y-4 text-white">
      <div className="flex items-center justify-between text-xs font-bold text-brand-secondary">
        <span>{formatCurrency(localMin)}</span>
        <span className="text-green-300/60">to</span>
        <span>{formatCurrency(localMax)}</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[11px] text-green-300/70 mb-1">
            <span>Min Budget</span>
            <span className="font-semibold text-white">{formatCurrency(localMin)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={500000}
            step={5000}
            value={localMin}
            onChange={handleMinChange}
            aria-label="Minimum budget"
            className="w-full accent-brand-secondary cursor-pointer h-1.5 bg-green-950/80 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-green-300/70 mb-1">
            <span>Max Budget</span>
            <span className="font-semibold text-white">{formatCurrency(localMax)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={500000}
            step={5000}
            value={localMax}
            onChange={handleMaxChange}
            aria-label="Maximum budget"
            className="w-full accent-brand-secondary cursor-pointer h-1.5 bg-green-950/80 rounded-lg appearance-none"
          />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-green-400/60 pt-0.5">
        <span>₹0</span>
        <span>₹5,00,000</span>
      </div>
    </div>
  )
}
