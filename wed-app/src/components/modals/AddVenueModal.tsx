import React, { useState, useRef } from 'react'
import {
  Building2,
  UploadCloud,
  X,
  Plus,
  Star,
  Check,
  AlertCircle,
  Loader2,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCities } from '../../hooks/useCities'
import { useAuth } from '../../contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { uploadOrConvertPhoto } from '../../lib/imageUtils'

const AMENITY_OPTIONS = [
  'AC',
  'Parking',
  'Catering',
  'Stage Decor',
  'Generator',
  'Rooms',
  'Dining Hall',
]

interface AddVenueModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newAuditoriumId?: string) => void
}

export default function AddVenueModal({ isOpen, onClose, onSuccess }: AddVenueModalProps) {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const { data: cities } = useCities()

  const [venueTitle, setVenueTitle] = useState('')
  const [venueCityId, setVenueCityId] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [venueSeating, setVenueSeating] = useState('')
  const [venueFloating, setVenueFloating] = useState('')
  const [venuePrice, setVenuePrice] = useState('')
  const [venueDescription, setVenueDescription] = useState('')
  const [venueAmenities, setVenueAmenities] = useState<string[]>(['AC', 'Parking'])

  // Contact Information state
  const [contactPhone, setContactPhone] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [sameAsCallNumber, setSameAsCallNumber] = useState(true)

  // Photo management state
  const [venuePhotos, setVenuePhotos] = useState<string[]>([])
  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const [photoUploadProgress, setPhotoUploadProgress] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [showUrlFallback, setShowUrlFallback] = useState(false)
  const [fallbackUrlInput, setFallbackUrlInput] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setPhotoError(null)

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please select valid image files (JPG, PNG, WebP).')
        continue
      }
      if (file.size > 20 * 1024 * 1024) {
        setPhotoError(`File "${file.name}" exceeds 20MB limit.`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setIsPhotoUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setPhotoUploadProgress(`Processing ${i + 1} of ${validFiles.length}...`)
        const photoUrl = await uploadOrConvertPhoto(validFiles[i], 'auditorium-photos')
        newUrls.push(photoUrl)
      }
      setVenuePhotos((prev) => [...prev, ...newUrls])
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : 'Failed to process photos')
    } finally {
      setIsPhotoUploading(false)
      setPhotoUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  const handleRemovePhoto = (indexToRemove: number) => {
    setVenuePhotos((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleSetCoverPhoto = (indexToCover: number) => {
    setVenuePhotos((prev) => {
      const selected = prev[indexToCover]
      const rest = prev.filter((_, i) => i !== indexToCover)
      return [selected, ...rest]
    })
  }

  const handleAddUrlPhoto = () => {
    if (fallbackUrlInput.trim()) {
      setVenuePhotos((prev) => [...prev, fallbackUrlInput.trim()])
      setFallbackUrlInput('')
    }
  }

  const toggleAmenity = (amenity: string) => {
    setVenueAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueTitle.trim() || !venueCityId || !venuePrice) {
      setSubmitMessage({ type: 'error', text: 'Please fill in Title, City, and Daily Base Rate.' })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    const slug = `${venueTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`

    const finalPhotos =
      venuePhotos.length > 0
        ? venuePhotos
        : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80']

    // Construct final amenities with direct contact tags
    const finalAmenities = [...venueAmenities]
    const callNumberToSave = contactPhone.trim()
    const whatsappNumberToSave = sameAsCallNumber ? callNumberToSave : whatsappPhone.trim()

    if (callNumberToSave) {
      finalAmenities.push(`phone:${callNumberToSave}`)
    }
    if (whatsappNumberToSave) {
      finalAmenities.push(`whatsapp:${whatsappNumberToSave}`)
    }

    // Also update host profile phone if user is logged in
    if (user?.id && callNumberToSave) {
      try {
        await supabase.from('profiles').update({ phone: callNumberToSave }).eq('id', user.id)
      } catch {
        // Continue even if profile update fails
      }
    }

    const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'

    try {
      const { data: inserted, error } = await supabase
        .from('auditoriums')
        .insert({
          owner_id: user?.id,
          city_id: venueCityId,
          title: venueTitle.trim(),
          slug,
          address: venueAddress.trim() || 'Kerala, India',
          seating_capacity: parseInt(venueSeating) || 500,
          floating_capacity: parseInt(venueFloating) || parseInt(venueSeating) || 1000,
          base_price_per_day: parseFloat(venuePrice),
          description: venueDescription.trim() || null,
          amenities: finalAmenities,
          photos: finalPhotos,
          verified: isAdmin, // Admin-created venues auto-verify; vendor venues undergo review
        })
        .select()
        .single()

      if (error) throw error

      setSubmitMessage({
        type: 'success',
        text: `Venue "${venueTitle}" ${isAdmin ? 'published' : 'submitted for verification'} successfully!`,
      })

      queryClient.invalidateQueries({ queryKey: ['auditoriums'] })
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] })
      queryClient.invalidateQueries({ queryKey: ['vendorStats'] })

      setTimeout(() => {
        onClose()
        setSubmitMessage(null)
        setVenueTitle('')
        setVenueAddress('')
        setVenuePrice('')
        setVenueSeating('')
        setVenueFloating('')
        setVenueDescription('')
        setContactPhone('')
        setWhatsappPhone('')
        setSameAsCallNumber(true)
        setVenuePhotos([])
        if (onSuccess) {
          onSuccess(inserted?.id)
        }
      }, 1400)
    } catch (err: unknown) {
      setSubmitMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save venue',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 relative my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto text-brand-dark">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Add New Venue</h3>
              <p className="text-xs text-gray-500">Add photos directly and list your auditorium</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {submitMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{submitMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Venue Title */}
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

          {/* City & Price */}
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

          {/* Direct Photo Upload Section */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-bold text-gray-800 uppercase tracking-wider text-xs">
                  Auditorium Photos
                </label>
                <p className="text-[11px] text-gray-500">
                  Upload photos directly from your computer or phone (No link required)
                </p>
              </div>
              <span className="text-[11px] font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                {venuePhotos.length} photo{venuePhotos.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Hidden Input for Direct File Selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 hover:border-brand-primary bg-white hover:bg-brand-primary/5 rounded-xl p-5 text-center cursor-pointer transition-all group"
            >
              {isPhotoUploading ? (
                <div className="flex flex-col items-center justify-center py-2 text-brand-primary">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="font-semibold text-xs">{photoUploadProgress || 'Optimizing & adding photos...'}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-gray-800">
                    Click to select auditorium photos from device
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    or drag and drop images directly here
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Supports JPG, PNG, WebP • You can select multiple photos at once
                  </p>
                </div>
              )}
            </div>

            {photoError && (
              <div className="text-[11px] text-red-600 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Selected Photos Grid */}
            {venuePhotos.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-medium text-gray-700">Photo Gallery ({venuePhotos.length})</span>
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    First photo is the Main Cover
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {venuePhotos.map((url, index) => (
                    <div
                      key={index}
                      className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border shadow-xs ${
                        index === 0
                          ? 'ring-2 ring-brand-primary border-transparent shadow-md'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Auditorium Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {index === 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-brand-secondary text-brand-secondary" />
                          <span>Cover</span>
                        </div>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetCoverPhoto(index)
                            }}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-800 text-[10px] font-medium shadow-sm transition"
                            title="Set as Cover Photo"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemovePhoto(index)
                          }}
                          className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add More Photos Tile */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-brand-primary bg-white hover:bg-brand-primary/5 rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-gray-500 hover:text-brand-primary transition-colors text-[10px] font-semibold gap-1"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add More</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional URL link toggle */}
            <div className="pt-1 text-right">
              <button
                type="button"
                onClick={() => setShowUrlFallback(!showUrlFallback)}
                className="text-[11px] text-gray-500 hover:text-brand-primary underline"
              >
                {showUrlFallback ? 'Hide image URL option' : 'Have an image web link? Paste it here'}
              </button>
            </div>

            {showUrlFallback && (
              <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1.5">
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Image Web URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={fallbackUrlInput}
                    onChange={(e) => setFallbackUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlPhoto}
                    className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary/90"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Full Address */}
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

          {/* Capacities */}
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

          {/* Direct Venue Contact & WhatsApp Inquiries Section */}
          <div className="bg-emerald-950/5 border border-emerald-800/20 rounded-2xl p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-secondary" />
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Venue Direct Contact (Call & WhatsApp)
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Customers on MANA Venues will use these details to contact you directly via Phone Call or WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone Call Number */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Contact Number (for Calls) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value)
                      if (sameAsCallNumber) {
                        setWhatsappPhone(e.target.value)
                      }
                    }}
                    placeholder="e.g. +91 98470 12345"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider">
                    WhatsApp Number
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-emerald-800 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={sameAsCallNumber}
                      onChange={(e) => {
                        setSameAsCallNumber(e.target.checked)
                        if (e.target.checked) {
                          setWhatsappPhone(contactPhone)
                        }
                      }}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Same as Call</span>
                  </label>
                </div>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={sameAsCallNumber ? contactPhone : whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    disabled={sameAsCallNumber}
                    placeholder="e.g. +91 98470 12345"
                    className={`w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm text-brand-dark focus:ring-2 focus:ring-brand-primary focus:outline-none ${
                      sameAsCallNumber
                        ? 'bg-gray-100/70 border-gray-200 text-gray-600 cursor-not-allowed'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
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

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={venueDescription}
              onChange={(e) => setVenueDescription(e.target.value)}
              placeholder="Highlight architecture, lighting, dining hall size, and parking convenience..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-sm text-brand-dark resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPhotoUploading}
              className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Publish Venue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

