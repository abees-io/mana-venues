import { useState } from 'react'
import { Building2, MapPin, Check, Loader2, AlertCircle, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCities } from '../../hooks/useCities'
import { useAuth } from '../../contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'

const AMENITY_OPTIONS = ['AC', 'Parking', 'Catering', 'Stage Decor', 'Generator', 'Rooms', 'Dining Hall']

export function AdminManageEntities() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: cities } = useCities()

  const [activeModal, setActiveModal] = useState<'city' | 'venue' | null>(null)

  // City form state
  const [cityName, setCityName] = useState('')
  const [cityState, setCityState] = useState('Kerala')
  const [isCitySubmitting, setIsCitySubmitting] = useState(false)
  const [cityMessage, setCityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Venue form state
  const [venueTitle, setVenueTitle] = useState('')
  const [venueCityId, setVenueCityId] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [venueSeating, setVenueSeating] = useState('')
  const [venueFloating, setVenueFloating] = useState('')
  const [venuePrice, setVenuePrice] = useState('')
  const [venueDescription, setVenueDescription] = useState('')
  const [venuePhotoUrl, setVenuePhotoUrl] = useState('')
  const [venueAmenities, setVenueAmenities] = useState<string[]>(['AC', 'Parking'])
  const [isVenueSubmitting, setIsVenueSubmitting] = useState(false)
  const [venueMessage, setVenueMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const toggleAmenity = (amenity: string) => {
    setVenueAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueTitle.trim() || !venueCityId || !venuePrice) {
      setVenueMessage({ type: 'error', text: 'Please fill in Title, City, and Daily Price.' })
      return
    }

    setIsVenueSubmitting(true)
    setVenueMessage(null)

    const slug = `${venueTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`
    const photos = venuePhotoUrl.trim()
      ? [venuePhotoUrl.trim()]
      : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80']

    try {
      const { error } = await supabase.from('auditoriums').insert({
        owner_id: user?.id,
        city_id: venueCityId,
        title: venueTitle.trim(),
        slug,
        address: venueAddress.trim() || 'Kerala, India',
        seating_capacity: parseInt(venueSeating) || 500,
        floating_capacity: parseInt(venueFloating) || parseInt(venueSeating) || 1000,
        base_price_per_day: parseFloat(venuePrice),
        description: venueDescription.trim() || null,
        amenities: venueAmenities,
        photos,
        verified: true, // Admin-created venues are automatically verified!
      })

      if (error) throw error

      setVenueMessage({ type: 'success', text: `Venue "${venueTitle}" published successfully!` })
      queryClient.invalidateQueries({ queryKey: ['auditoriums'] })
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] })

      setTimeout(() => {
        setActiveModal(null)
        setVenueMessage(null)
        setVenueTitle('')
        setVenueAddress('')
        setVenuePrice('')
        setVenueSeating('')
        setVenueFloating('')
        setVenueDescription('')
        setVenuePhotoUrl('')
      }, 1500)
    } catch (err: unknown) {
      setVenueMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to publish venue',
      })
    } finally {
      setIsVenueSubmitting(false)
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

      {/* ── MODAL 2: ADD VENUE ── */}
      {activeModal === 'venue' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 relative my-auto animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Add New Venue</h3>
                  <p className="text-xs text-gray-500">Publish a verified auditorium instantly</p>
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

            {venueMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  venueMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {venueMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{venueMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAddVenue} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Venue Title *
                </label>
                <input
                  type="text"
                  required
                  value={venueTitle}
                  onChange={(e) => setVenueTitle(e.target.value)}
                  placeholder="e.g. Royal Grand Palace & Convention Centre"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    City Location *
                  </label>
                  <select
                    required
                    value={venueCityId}
                    onChange={(e) => setVenueCityId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark bg-white"
                  >
                    <option value="">Select a City</option>
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Daily Base Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={venuePrice}
                    onChange={(e) => setVenuePrice(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="e.g. MG Road, Near Marine Drive, Kochi, Kerala"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={venueSeating}
                    onChange={(e) => setVenueSeating(e.target.value)}
                    placeholder="e.g. 800"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Floating Capacity
                  </label>
                  <input
                    type="number"
                    value={venueFloating}
                    onChange={(e) => setVenueFloating(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Main Photo URL (Unsplash or direct image link)
                </label>
                <input
                  type="url"
                  value={venuePhotoUrl}
                  onChange={(e) => setVenuePhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1519167758481-83f550bb49b3"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((item) => {
                    const isSelected = venueAmenities.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {isSelected ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={venueDescription}
                  onChange={(e) => setVenueDescription(e.target.value)}
                  placeholder="Provide details about the hall ambiance, parking space, and features..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVenueSubmitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isVenueSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Venue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
