import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Check, Loader2, AlertCircle, X, Package, Film, Trash2, Search, ExternalLink, Pencil, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import AddVenueModal from '../modals/AddVenueModal'
import PackageFormModal from '../modals/PackageFormModal'
import ReelFormModal from '../modals/ReelFormModal'
import { usePackagesStore, type WeddingPackage } from '../../store/packagesStore'

export function AdminManageEntities() {
  const queryClient = useQueryClient()

  const [activeModal, setActiveModal] = useState<'city' | 'venue' | 'package' | 'reel' | 'managePackages' | null>(null)

  // Packages store state
  const packages = usePackagesStore((s) => s.packages)
  const deletePackage = usePackagesStore((s) => s.deletePackage)
  const [editingPkg, setEditingPkg] = useState<WeddingPackage | null>(null)
  const [packageSearch, setPackageSearch] = useState('')
  const [packageBackdropFilter, setPackageBackdropFilter] = useState<string>('All')
  const [packageActionMessage, setPackageActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const handleDeletePackage = (pkg: WeddingPackage) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete package:\n\n"${pkg.title}"?\n\nThis will remove it from the live website for all users.`
    )
    if (!confirmed) return

    deletePackage(pkg.id)
    setPackageActionMessage({
      type: 'success',
      text: `Package "${pkg.title}" has been permanently deleted from the platform.`,
    })
    setTimeout(() => {
      setPackageActionMessage(null)
    }, 3500)
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      packageSearch.trim() === '' ||
      pkg.title.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.partnerPlanner.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.location.toLowerCase().includes(packageSearch.toLowerCase()) ||
      (pkg.cities && pkg.cities.some((c) => c.toLowerCase().includes(packageSearch.toLowerCase())))

    const matchesBackdrop =
      packageBackdropFilter === 'All' || pkg.backdrop === packageBackdropFilter

    return matchesSearch && matchesBackdrop
  })

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

        <button
          type="button"
          onClick={() => {
            setEditingPkg(null)
            setActiveModal('package')
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-brand-dark font-semibold text-sm rounded-xl hover:bg-gray-50 shadow-sm transition-all active:scale-95"
        >
          <Package className="w-4 h-4 text-brand-primary" />
          <span>Add Package</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('managePackages')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold text-sm rounded-xl hover:bg-red-100 shadow-sm transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
          <span>Manage &amp; Delete Packages ({packages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('reel')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-brand-dark font-semibold text-sm rounded-xl hover:bg-gray-50 shadow-sm transition-all active:scale-95"
        >
          <Film className="w-4 h-4 text-brand-primary" />
          <span>Add Reel Video</span>
        </button>

        <Link
          to="/packages"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-sm rounded-xl hover:bg-amber-100 shadow-sm transition-all"
        >
          <span>Browse Packages Page →</span>
        </Link>
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

      {/* ── MODAL 3: ADD/EDIT PACKAGE ── */}
      <PackageFormModal
        isOpen={activeModal === 'package'}
        onClose={() => {
          setActiveModal(null)
          setEditingPkg(null)
        }}
        initialPackage={editingPkg}
      />

      {/* ── MODAL 4: ADD REEL VIDEO ── */}
      <ReelFormModal
        isOpen={activeModal === 'reel'}
        onClose={() => setActiveModal(null)}
      />

      {/* ── MODAL 5: MANAGE & DELETE PACKAGES (SUPER ADMIN) ── */}
      {activeModal === 'managePackages' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                      Manage &amp; Delete Listed Packages
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                      {packages.length} Live
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Super Admin: review all packages listed on MANA, edit details, or permanently delete packages.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPkg(null)
                    setActiveModal('package')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary/90 transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Package</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null)
                    setPackageActionMessage(null)
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {packageActionMessage && (
              <div
                className={`mx-5 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  packageActionMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {packageActionMessage.type === 'success' ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{packageActionMessage.text}</span>
              </div>
            )}

            {/* Filter Bar */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  placeholder="Search packages by title, planner, city..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              {/* Backdrop filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', 'Coast', 'Backwaters', 'Hills', 'Heritage'].map((bd) => (
                  <button
                    key={bd}
                    type="button"
                    onClick={() => setPackageBackdropFilter(bd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      packageBackdropFilter === bd
                        ? 'bg-brand-primary text-white shadow-2xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {bd}
                  </button>
                ))}
              </div>
            </div>

            {/* Packages List Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {filteredPackages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-gray-600">No packages match your search filter</p>
                  <p className="text-xs text-gray-400 mt-1">Try clearing your search terms or filter.</p>
                </div>
              ) : (
                filteredPackages.map((pkg) => {
                  const coverImg =
                    pkg.image ||
                    (pkg.images && pkg.images[0]) ||
                    '/dest-wedding-1.jpg'

                  return (
                    <div
                      key={pkg.id}
                      className="p-3.5 bg-white border border-gray-200/90 hover:border-gray-300 rounded-xl shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group"
                    >
                      {/* Left: Thumbnail & Package Info */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <img
                          src={coverImg}
                          alt={pkg.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-gray-100 bg-gray-50"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D8F0EC] text-[#2D6B62] uppercase tracking-wide">
                              {pkg.backdrop}
                            </span>
                            <span className="text-[11px] font-bold text-[#B8710B] truncate">
                              {pkg.partnerPlanner}
                            </span>
                            {pkg.vendorId && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                Vendor
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm leading-snug truncate">
                            {pkg.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {pkg.location} • <span className="font-semibold text-gray-700">{pkg.startingPrice}</span>
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                            <span>{pkg.guestCapacity}</span>
                            <span>•</span>
                            <span>{pkg.reels?.length || 0} reel(s)</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <Link
                          to={`/packages#package-${pkg.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on site"
                          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPkg(pkg)
                            setActiveModal('package')
                          }}
                          title="Edit package"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-brand-primary hover:border-brand-primary/40 text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#C83B68]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePackage(pkg)}
                          title={`Permanently delete package "${pkg.title}"`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredPackages.length} of {packages.length} listed packages</span>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  setPackageActionMessage(null)
                }}
                className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
