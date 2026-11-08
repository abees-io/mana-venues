import { useState } from 'react'
import { Building2, MapPin, Check, Loader2, AlertCircle, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import AddVenueModal from '../modals/AddVenueModal'

export function AdminManageEntities() {
  const queryClient = useQueryClient()

  const [activeModal, setActiveModal] = useState<'city' | 'venue' | null>(null)

  // City form state
  const [cityName, setCityName] = useState('')
  const [cityState, setCityState] = useState('Kerala')
  const [isCitySubmitting, setIsCitySubmitting] = useState(false)
  const [cityMessage, setCityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityName.trim()) return

    setIsCitySubmitting(true)
    setCityMessage(null)

    const slug = cityName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    try {
      const { error } = await supabase.from('cities').insert({
        name: cityName.trim(),
        slug,
        state: cityState.trim() || 'Kerala',
        is_active: true,
      })

      if (error) throw error

      setCityMessage({ type: 'success', text: `City "${cityName}" added successfully!` })
      setCityName('')
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      setTimeout(() => {
        setActiveModal(null)
        setCityMessage(null)
      }, 1500)
    } catch (err: unknown) {
      setCityMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add city',
      })
    } finally {
      setIsCitySubmitting(false)
    }
  }

  return (
    <>
      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveModal('venue')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold text-sm rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all active:scale-95"
        >
          <Building2 className="w-4 h-4 text-brand-secondary" />
          <span>Add New Venue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('city')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-brand-dark font-semibold text-sm rounded-xl hover:bg-gray-50 shadow-sm transition-all active:scale-95"
        >
          <MapPin className="w-4 h-4 text-brand-primary" />
          <span>Add New City</span>
        </button>
      </div>

      {/* ── MODAL 1: ADD CITY ── */}
      {activeModal === 'city' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Add New City</h3>
                  <p className="text-xs text-gray-500">Enable venue bookings in a new region</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cityMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  cityMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {cityMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{cityMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAddCity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  City / Town Name *
                </label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Thrissur, Kannur, Alappuzha"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Kerala"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCitySubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCitySubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save City</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD VENUE (DIRECT PHOTO UPLOADER) ── */}
      <AddVenueModal
        isOpen={activeModal === 'venue'}
        onClose={() => setActiveModal(null)}
      />
    </>
  )
}
