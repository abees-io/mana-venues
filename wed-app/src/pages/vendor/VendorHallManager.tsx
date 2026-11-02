import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Image as ImageIcon,
  Calendar,
  Lock,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useUpdateAuditorium } from '../../hooks/useUpdateAuditorium'
import { PhotoUploader } from '../../components/vendor/PhotoUploader'
import { PricingSlotEditor } from '../../components/vendor/PricingSlotEditor'
import { DateBlocker } from '../../components/vendor/DateBlocker'
import Layout from '../../components/layout/Layout'
import type { Auditorium } from '../../lib/types'
import { cn } from '../../lib/utils'

const AMENITY_OPTIONS = ['AC', 'Parking', 'Catering', 'Stage Decor', 'Generator']

export function VendorHallManager() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'pricing' | 'block'>('info')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Fetch auditorium
  const {
    data: auditorium,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auditorium', 'id', id],
    queryFn: async () => {
      if (!id) throw new Error('No auditorium ID provided')
      const { data, error } = await supabase
        .from('auditoriums')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Auditorium
    },
    enabled: !!id,
  })

  const { updateSpecs, updatePhotos, isUpdating } = useUpdateAuditorium(id || '', auditorium?.slug)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    seating_capacity: 0,
    floating_capacity: 0,
    base_price_per_day: 0,
    amenities: [] as string[],
  })

  useEffect(() => {
    if (auditorium) {
      setFormData({
        title: auditorium.title || '',
        description: auditorium.description || '',
        address: auditorium.address || '',
        seating_capacity: auditorium.seating_capacity || 0,
        floating_capacity: auditorium.floating_capacity || 0,
        base_price_per_day: auditorium.base_price_per_day || 0,
        amenities: auditorium.amenities || [],
      })
    }
  }, [auditorium])

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateSpecs({
        title: formData.title,
        description: formData.description,
        address: formData.address,
        seating_capacity: Number(formData.seating_capacity),
        floating_capacity: Number(formData.floating_capacity),
        base_price_per_day: Number(formData.base_price_per_day),
        amenities: formData.amenities,
      })
      setSaveSuccess(true)
      refetch()
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes.'
      setSaveError(msg)
    }
  }

  const handlePhotosUpdate = async (newPhotos: string[]) => {
    try {
      await updatePhotos(newPhotos)
      refetch()
    } catch (err: unknown) {
      console.error('Failed to update photos list', err)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-3" />
          <p className="text-gray-500">Loading hall details...</p>
        </div>
      </Layout>
    )
  }

  if (error || !auditorium) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Venue Not Found</h2>
          <p className="text-gray-600 mt-2">
            The auditorium could not be loaded or you do not have permission to view it.
          </p>
          <Link
            to="/vendor"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vendor Dashboard
          </Link>
        </div>
      </Layout>
    )
  }

  // Check ownership
  const isOwnerOrAdmin = auditorium.owner_id === user?.id || profile?.role === 'admin'
  if (!isOwnerOrAdmin) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-gray-600 mt-2">
            You do not own this auditorium and cannot edit its specifications.
          </p>
          <Link
            to="/vendor"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/vendor"
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{auditorium.title}</h1>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    auditorium.verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  )}
                >
                  {auditorium.verified ? 'Verified & Public' : 'Pending Verification'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Manage specifications, photos, and calendar rates</p>
            </div>
          </div>

          <Link
            to={`/auditorium/${auditorium.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary/80"
          >
            Preview Listing
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-8 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'info'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Building2 className="w-4 h-4" />
            Basic Specs
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'photos'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Photo Gallery ({auditorium.photos?.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'pricing'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Calendar className="w-4 h-4" />
            Rates & Availability
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('block')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'block'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Lock className="w-4 h-4" />
            Block Dates
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            {saveSuccess && (
              <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm">
                <Check className="w-5 h-5 shrink-0" />
                <span>Auditorium specifications updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Address & Landmarks
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Seating Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={formData.seating_capacity}
                    onChange={(e) => setFormData({ ...formData, seating_capacity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Floating Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.floating_capacity}
                    onChange={(e) => setFormData({ ...formData, floating_capacity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Standard Base Price Per Day (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="5000"
                    min="10000"
                    value={formData.base_price_per_day}
                    onChange={(e) => setFormData({ ...formData, base_price_per_day: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Description & Overview
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Highlight hall architecture, stage dimensions, dining space, and green rooms..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Available Amenities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {AMENITY_OPTIONS.map((amenity) => {
                      const isChecked = formData.amenities.includes(amenity)
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className={cn(
                            'p-3 rounded-xl border text-sm font-medium flex items-center justify-between transition-colors',
                            isChecked
                              ? 'border-brand-primary bg-brand-accent/50 text-brand-primary'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          )}
                        >
                          <span>{amenity}</span>
                          {isChecked && <Check className="w-4 h-4 text-brand-primary" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Specifications
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <PhotoUploader
              auditoriumId={auditorium.id}
              existingPhotos={auditorium.photos || []}
              onUpdate={handlePhotosUpdate}
            />
          </div>
        )}

        {activeTab === 'pricing' && (
          <PricingSlotEditor
            auditoriumId={auditorium.id}
            basePricePerDay={auditorium.base_price_per_day}
          />
        )}

        {activeTab === 'block' && (
          <DateBlocker auditoriumId={auditorium.id} />
        )}
      </div>
    </Layout>
  )
}

export default VendorHallManager
